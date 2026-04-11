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

      // Interpolate all vital signs
      const newVitals: VitalSigns = {
        bp: lerpBP(config.startVitals.bp, config.targetVitals.bp, easedProgress),
        pulse: Math.round(lerp(config.startVitals.pulse, config.targetVitals.pulse, easedProgress)),
        respiration: Math.round(lerp(config.startVitals.respiration, config.targetVitals.respiration, easedProgress)),
        spo2: Math.round(lerp(config.startVitals.spo2, config.targetVitals.spo2, easedProgress)),
        temperature: config.startVitals.temperature !== undefined && config.targetVitals.temperature !== undefined
          ? lerp(config.startVitals.temperature, config.targetVitals.temperature, easedProgress)
          : config.targetVitals.temperature,
        gcs: config.startVitals.gcs !== undefined && config.targetVitals.gcs !== undefined
          ? Math.min(15, Math.max(3, Math.round(lerp(config.startVitals.gcs, config.targetVitals.gcs, easedProgress))))
          : config.targetVitals.gcs !== undefined ? Math.min(15, Math.max(3, config.targetVitals.gcs)) : config.targetVitals.gcs,
        bloodGlucose: config.startVitals.bloodGlucose !== undefined && config.targetVitals.bloodGlucose !== undefined
          ? lerp(config.startVitals.bloodGlucose, config.targetVitals.bloodGlucose, easedProgress)
          : config.targetVitals.bloodGlucose,
        etco2: config.startVitals.etco2 !== undefined && config.targetVitals.etco2 !== undefined
          ? lerp(config.startVitals.etco2, config.targetVitals.etco2, easedProgress)
          : config.targetVitals.etco2,
        painScore: config.startVitals.painScore !== undefined && config.targetVitals.painScore !== undefined
          ? Math.round(lerp(config.startVitals.painScore, config.targetVitals.painScore, easedProgress))
          : config.targetVitals.painScore,
        time: new Date().toISOString(),
      };

      setCurrentVitals(newVitals);
      config.onUpdate?.(newVitals);

      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrentVitals(config.targetVitals);
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
