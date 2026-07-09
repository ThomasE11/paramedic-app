import { useState, useEffect, useCallback, useRef } from 'react';
import type { VitalSigns } from '@/types';

// Parse BP string to numbers
const parseBP = (bp: string): { systolic: number; diastolic: number } => {
  const parts = bp.split('/').map(p => parseInt(p.trim()));
  return { systolic: parts[0] || 120, diastolic: parts[1] || 80 };
};

// Format BP numbers to string
const formatBP = (systolic: number, diastolic: number): string => 
  `${Math.round(systolic)}/${Math.round(diastolic)}`;

// Linear interpolation between two values
const lerp = (start: number, end: number, progress: number): number => {
  return start + (end - start) * progress;
};

// Interpolate between two BP values
const lerpBP = (start: string, end: string, progress: number): string => {
  const startBP = parseBP(start);
  const endBP = parseBP(end);
  const systolic = lerp(startBP.systolic, endBP.systolic, progress);
  const diastolic = lerp(startBP.diastolic, endBP.diastolic, progress);
  return formatBP(systolic, diastolic);
};

export function useGradualVitalChanges() {
  const [currentVitals, setCurrentVitals] = useState<VitalSigns | null>(null);
  const [targetVitals, setTargetVitals] = useState<VitalSigns | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const changeConfigRef = useRef<{
    duration: number;
    startTime: number;
    startVitals: VitalSigns;
    targetVitals: VitalSigns;
    onUpdate?: (vitals: VitalSigns) => void;
    onComplete?: () => void;
  } | null>(null);

  // Start gradual vital change
  const startGradualChange = useCallback((
    fromVitals: VitalSigns,
    toVitals: VitalSigns,
    duration: number = 3000, // Default 3 seconds for realistic effect
    onUpdate?: (vitals: VitalSigns) => void,
    onComplete?: () => void
  ) => {
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    changeConfigRef.current = {
      duration,
      startTime: performance.now(),
      startVitals: { ...fromVitals },
      targetVitals: { ...toVitals },
      onUpdate,
      onComplete,
    };

    setCurrentVitals(fromVitals);
    setTargetVitals(toVitals);
    setIsAnimating(true);
    setProgress(0);

    const animate = (currentTime: number) => {
      const config = changeConfigRef.current;
      if (!config) return;

      const elapsed = currentTime - config.startTime;
      const rawProgress = Math.min(elapsed / config.duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
      
      setProgress(easedProgress);

      // Interpolate all vital signs. Optional channels (etco2, temp, GCS,
      // glucose, pain) fall back to the LAST-KNOWN value when the target
      // doesn't author them — never to undefined. Emitting undefined here
      // wiped live capnography on every animation frame whenever a treatment
      // target lacked etco2; the CPR EtCO2 timer re-added it 2s later, so the
      // monitor's CO2 block mounted/unmounted rhythmically and the whole page
      // quivered with it (the field-reported monitor quiver).
      const optional = (start: number | undefined, target: number | undefined): number | undefined =>
        start !== undefined && target !== undefined
          ? lerp(start, target, easedProgress)
          : target ?? start;
      const gcsRaw = optional(config.startVitals.gcs, config.targetVitals.gcs);
      const painRaw = optional(config.startVitals.painScore, config.targetVitals.painScore);
      const newVitals: VitalSigns = {
        bp: lerpBP(config.startVitals.bp, config.targetVitals.bp, easedProgress),
        pulse: Math.round(lerp(config.startVitals.pulse, config.targetVitals.pulse, easedProgress)),
        respiration: Math.round(lerp(config.startVitals.respiration, config.targetVitals.respiration, easedProgress)),
        spo2: Math.round(lerp(config.startVitals.spo2, config.targetVitals.spo2, easedProgress)),
        temperature: optional(config.startVitals.temperature, config.targetVitals.temperature),
        gcs: gcsRaw !== undefined ? Math.min(15, Math.max(3, Math.round(gcsRaw))) : undefined,
        bloodGlucose: optional(config.startVitals.bloodGlucose, config.targetVitals.bloodGlucose),
        etco2: optional(config.startVitals.etco2, config.targetVitals.etco2),
        painScore: painRaw !== undefined ? Math.round(painRaw) : undefined,
        time: new Date().toISOString(),
      };

      setCurrentVitals(newVitals);
      config.onUpdate?.(newVitals);

      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        // Same preserve-last-known rule as per-frame: committing the raw
        // target would drop any optional channel the target didn't author.
        setCurrentVitals({
          ...config.targetVitals,
          temperature: config.targetVitals.temperature ?? config.startVitals.temperature,
          gcs: config.targetVitals.gcs ?? config.startVitals.gcs,
          bloodGlucose: config.targetVitals.bloodGlucose ?? config.startVitals.bloodGlucose,
          etco2: config.targetVitals.etco2 ?? config.startVitals.etco2,
          painScore: config.targetVitals.painScore ?? config.startVitals.painScore,
        });
        config.onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Cancel ongoing animation
  const cancelGradualChange = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    changeConfigRef.current = null;
    setIsAnimating(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    currentVitals,
    targetVitals,
    isAnimating,
    progress,
    startGradualChange,
    cancelGradualChange,
  };
}

export default useGradualVitalChanges;
