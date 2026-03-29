/**
 * LIFEPAK 20 Defibrillator/Monitor Simulator
 *
 * Hyper-realistic recreation of the Stryker/Physio-Control LIFEPAK 20e:
 * - Dark charcoal housing with physical button layout
 * - 320x240 color LCD screen with green ECG, cyan SpO2 pleth
 * - Large numeric readouts: HR (green), SpO2 (cyan), NIBP (white), RR (yellow)
 * - EtCO2 capnography waveform (pink/magenta)
 * - Mode selector: MONITOR / DEFIB / PACER
 * - Energy selector, CHARGE, SHOCK, SYNC controls
 * - Code timer, alarm indicators
 * - Assessment mode for student interaction
 * - Audio feedback: heartbeat beep, SpO2 tone, BP cuff, alarms
 *
 * Inspired by iSimulate REALITi 360 premium screen simulations
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import {
  Activity, Eye, EyeOff, Timer, Volume2, VolumeX,
  BellRing, AlertTriangle, Zap, Heart, FileHeart, X,
  Thermometer, Brain, Droplets, TrendingUp, TrendingDown
} from 'lucide-react';
import type { VitalSigns } from '@/types';
import {
  applyDeterioration,
  getDeteriorationStatus,
  getReassessmentInterval,
  determineSeverity,
  type CaseSeverity,
} from '@/data/deteriorationSystem';
import {
  getRhythmForCase,
  getLitflDataForRhythm,
  ALL_LEADS,
  ALL_RHYTHMS,
  RHYTHM_MAP,
  type ECGRhythm,
  type LeadName,
  type WaveformFn,
  type WaveformContext,
} from '@/data/ecgRhythms';

interface VitalSignsMonitorProps {
  initialVitals: VitalSigns;
  previousVitals?: VitalSigns | null;
  deteriorationVitals?: VitalSigns;
  onVitalChange?: (vitals: VitalSigns) => void;
  caseCategory?: string;
  caseSubcategory?: string;
  caseTitle?: string;
  ecgFindings?: string[];
  appliedTreatments?: string[];
  /** Override rhythm from patient state — updates when treatment changes rhythm */
  overrideRhythm?: string;
  // Cardiac arrest CPR management — displayed on monitor
  cprState?: {
    active: boolean;
    running: boolean;
    timerSeconds: number;
    cycleNumber: number;
    shockCount: number;
    adrenalineDoses: number;
    amiodaroneDoses: number;
    lastAdrenalineTime: number | null;
    onStartCPR: () => void;
    onPauseCPR: () => void;
    onDefibrillate: () => void;
  };
}

// Assessment method definitions
interface AssessmentMethod {
  id: string;
  name: string;
  description: string;
  duration: number;
  icon: string;
  equipment?: string[];
}

const ASSESSMENT_METHODS: Record<string, AssessmentMethod[]> = {
  bp: [
    { id: 'bp_manual', name: 'Manual BP Cuff', description: 'Palpate radial pulse, inflate cuff 20-30mmHg above loss', duration: 45, icon: 'Gauge', equipment: ['Sphygmomanometer', 'Stethoscope'] },
    { id: 'bp_auto', name: 'Auto BP Monitor', description: 'Digital automatic blood pressure monitor', duration: 15, icon: 'Activity', equipment: ['Auto BP Cuff'] },
    { id: 'bp_palpation', name: 'Palpation Only', description: 'Systolic only via palpation', duration: 20, icon: 'Hand', equipment: ['BP Cuff'] },
  ],
  pulse: [
    { id: 'pulse_radial', name: 'Radial Pulse', description: 'Palpate radial artery at wrist', duration: 10, icon: 'Hand' },
    { id: 'pulse_carotid', name: 'Carotid Pulse', description: 'Palpate carotid artery in neck', duration: 8, icon: 'Hand' },
    { id: 'pulse_monitor', name: 'Cardiac Monitor', description: 'ECG/Defibrillator monitor', duration: 3, icon: 'Activity', equipment: ['ECG Monitor'] },
    { id: 'pulse_pulseox', name: 'Pulse Oximeter', description: 'SpO2 probe with pulse detection', duration: 5, icon: 'ScanLine', equipment: ['Pulse Oximeter'] },
  ],
  respiration: [
    { id: 'resp_observation', name: 'Visual Observation', description: 'Observe chest rise and fall for 30 seconds', duration: 35, icon: 'Eye' },
    { id: 'resp_auscultation', name: 'Auscultation', description: 'Listen to breath sounds with stethoscope', duration: 25, icon: 'Stethoscope', equipment: ['Stethoscope'] },
    { id: 'resp_etco2', name: 'EtCO2 Capnography', description: 'End-tidal CO2 monitoring', duration: 5, icon: 'Gauge', equipment: ['Capnography'] },
  ],
  spo2: [
    { id: 'spo2_finger', name: 'Finger Probe', description: 'SpO2 probe on finger', duration: 8, icon: 'ScanLine', equipment: ['Pulse Oximeter'] },
    { id: 'spo2_ear', name: 'Ear Probe', description: 'SpO2 probe on earlobe', duration: 8, icon: 'ScanLine', equipment: ['Pulse Oximeter'] },
    { id: 'spo2_forehead', name: 'Forehead Sensor', description: 'Reflectance oximetry on forehead', duration: 10, icon: 'ScanLine', equipment: ['Forehead SpO2 Sensor'] },
  ],
  gcs: [
    { id: 'gcs_assessment', name: 'GCS Assessment', description: 'Full Glasgow Coma Scale assessment', duration: 60, icon: 'Brain' },
    { id: 'gcs_avpu', name: 'AVPU Quick', description: 'Alert, Voice, Pain, Unresponsive', duration: 15, icon: 'Activity' },
  ],
  temperature: [
    { id: 'temp_oral', name: 'Oral Thermometer', description: 'Digital oral thermometer', duration: 30, icon: 'Thermometer', equipment: ['Thermometer'] },
    { id: 'temp_tympanic', name: 'Tympanic', description: 'Ear thermometer', duration: 5, icon: 'Thermometer', equipment: ['Tympanic Thermometer'] },
    { id: 'temp_temporal', name: 'Temporal', description: 'Forehead temporal scanner', duration: 5, icon: 'Thermometer', equipment: ['Temporal Scanner'] },
    { id: 'temp_axillary', name: 'Axillary', description: 'Underarm thermometer', duration: 60, icon: 'Thermometer', equipment: ['Thermometer'] },
  ],
  glucose: [
    { id: 'glucose_meter', name: 'Glucometer', description: 'Finger stick blood glucose', duration: 20, icon: 'Droplet', equipment: ['Glucometer', 'Test Strips'] },
  ],
  etco2: [
    { id: 'etco2_nasal', name: 'Nasal Cannula', description: 'ETCO2 via nasal cannula adapter', duration: 10, icon: 'Gauge', equipment: ['Capnography', 'Nasal Cannula'] },
    { id: 'etco2_et', name: 'ET Tube Adapter', description: 'In-line ETCO2 for intubated patients', duration: 5, icon: 'Gauge', equipment: ['Capnography', 'ETCO2 Adapter'] },
  ],
  painScore: [
    { id: 'pain_scale', name: 'Pain Scale', description: 'Verbal or visual pain scale assessment', duration: 15, icon: 'Activity' },
  ],
};

// Alarm thresholds
interface AlarmThreshold {
  warningLow?: number;
  criticalLow?: number;
  warningHigh?: number;
  criticalHigh?: number;
}

const ALARM_THRESHOLDS: Record<string, AlarmThreshold> = {
  pulse: { warningLow: 50, criticalLow: 40, warningHigh: 100, criticalHigh: 120 },
  spo2: { warningLow: 95, criticalLow: 90, warningHigh: 100 },
  respiration: { warningLow: 10, criticalLow: 8, warningHigh: 24, criticalHigh: 30 },
  systolic: { warningLow: 90, criticalLow: 80, warningHigh: 140, criticalHigh: 180 },
  diastolic: { warningLow: 60, criticalLow: 50, warningHigh: 90, criticalHigh: 110 },
  gcs: { warningLow: 14, criticalLow: 9 },
  temperature: { warningLow: 36, criticalLow: 35, warningHigh: 37.5, criticalHigh: 39 },
  bloodGlucose: { warningLow: 3.5, criticalLow: 2.5, warningHigh: 15, criticalHigh: 25 },
};

function checkAlarm(value: number, thresholds: AlarmThreshold): { isWarning: boolean; isCritical: boolean } {
  if (thresholds.criticalLow !== undefined && value <= thresholds.criticalLow) return { isWarning: false, isCritical: true };
  if (thresholds.criticalHigh !== undefined && value >= thresholds.criticalHigh) return { isWarning: false, isCritical: true };
  if (thresholds.warningLow !== undefined && value <= thresholds.warningLow) return { isWarning: true, isCritical: false };
  if (thresholds.warningHigh !== undefined && value >= thresholds.warningHigh) return { isWarning: true, isCritical: false };
  return { isWarning: false, isCritical: false };
}

// ============================================================================
// AUDIO ENGINE - Clinical monitor sounds
// ============================================================================

class ClinicalAudioEngine {
  private audioCtx: AudioContext | null = null;
  private heartbeatInterval: number | null = null;
  private bpInflateTimeout: number | null = null;
  private isPlaying = false;
  private _volume = 0.15;
  // Ready tone state — continuous tone after charge completes
  private readyToneOsc: OscillatorNode | null = null;
  private readyToneGain: GainNode | null = null;

  get volume() { return this._volume; }
  set volume(v: number) { this._volume = Math.max(0, Math.min(1, v)); }

  private getCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playHeartbeat(bpm: number) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const intervalMs = (60 / bpm) * 1000;

    const beep = () => {
      try {
        const ctx = this.getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = 1000;
        osc.type = 'sine';

        gain.gain.setValueAtTime(this._volume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } catch {
        // Audio context may not be available
      }
    };

    beep();
    this.heartbeatInterval = window.setInterval(beep, intervalMs);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.isPlaying = false;
  }

  updateHeartbeatRate(bpm: number) {
    if (!this.isPlaying) return;
    this.stopHeartbeat();
    this.playHeartbeat(bpm);
  }

  playBPInflation(durationMs: number) {
    try {
      const ctx = this.getCtx();
      const bufferSize = ctx.sampleRate * (durationMs / 1000);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      const pumpCycles = Math.floor(durationMs / 800);
      const samplesPerPump = Math.floor(bufferSize / pumpCycles);

      for (let pump = 0; pump < pumpCycles; pump++) {
        const pumpStart = pump * samplesPerPump;
        for (let i = 0; i < samplesPerPump; i++) {
          const t = i / ctx.sampleRate;
          const envelope = Math.sin(Math.PI * i / samplesPerPump) * 0.5;
          data[pumpStart + i] = (
            Math.sin(2 * Math.PI * 60 * t) * 0.6 +
            Math.sin(2 * Math.PI * 120 * t) * 0.3 +
            (Math.random() - 0.5) * 0.4
          ) * envelope * this._volume * 0.4;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;

      source.connect(filter);
      filter.connect(ctx.destination);
      source.start();
    } catch {
      // Audio may not be available
    }
  }

  playAlarm(isCritical: boolean) {
    try {
      const ctx = this.getCtx();
      const freq = isCritical ? 880 : 660;
      const duration = isCritical ? 0.15 : 0.2;

      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = freq;
        osc.type = 'square';

        const startTime = ctx.currentTime + (i * (duration + 0.05));
        gain.gain.setValueAtTime(this._volume * 0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
      }
    } catch {
      // Audio may not be available
    }
  }

  playSpo2Beep(spo2: number) {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const freq = 400 + ((spo2 - 80) / 20) * 500;
      osc.frequency.value = Math.max(400, Math.min(900, freq));
      osc.type = 'sine';

      gain.gain.setValueAtTime(this._volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio may not be available
    }
  }

  // LIFEPAK charge-up sound
  playChargeSound() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Rising frequency whine
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 2.5);
      osc.type = 'sine';

      gain.gain.setValueAtTime(this._volume * 0.15, ctx.currentTime);
      gain.gain.setValueAtTime(this._volume * 0.15, ctx.currentTime + 2.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.5);
    } catch {
      // Audio may not be available
    }
  }

  // Sustained high-pitched ready tone — plays continuously until shock or cancel
  playReadyTone() {
    this.stopReadyTone(); // Clean up any existing tone
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.type = 'sine';
      gain.gain.setValueAtTime(this._volume * 0.1, ctx.currentTime);

      osc.start();
      this.readyToneOsc = osc;
      this.readyToneGain = gain;
    } catch {
      // Audio may not be available
    }
  }

  stopReadyTone() {
    try {
      if (this.readyToneOsc) {
        this.readyToneOsc.stop();
        this.readyToneOsc.disconnect();
        this.readyToneOsc = null;
      }
      if (this.readyToneGain) {
        this.readyToneGain.disconnect();
        this.readyToneGain = null;
      }
    } catch {
      // Already stopped
    }
  }

  // LIFEPAK shock delivered sound
  playShockSound() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = 150;
      osc.type = 'square';

      gain.gain.setValueAtTime(this._volume * 0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  dispose() {
    this.stopHeartbeat();
    this.stopReadyTone();
    if (this.bpInflateTimeout) clearTimeout(this.bpInflateTimeout);
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// ============================================================================
// CLEAN SWEEP WAVEFORM RENDERER
// Buffer-based approach: maintains a circular Y-value buffer.
// Each frame, new values are written at the sweep position.
// Canvas is fully cleared and redrawn from the buffer each frame.
// Result: clean, crisp waveform with no ghosting or trailing artifacts.
// ============================================================================

function ECGWaveform({ heartRate, color, height = 80, isVisible, waveformFn, showPacingSpikes, showShockArtifact, showSyncMarkers }: {
  heartRate: number; color: string; height?: number; isVisible: boolean; waveformFn?: WaveformFn;
  showPacingSpikes?: boolean; showShockArtifact?: boolean; showSyncMarkers?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const bufferRef = useRef<Float32Array | null>(null);
  const writeHeadRef = useRef(0);
  const phaseRef = useRef(0);
  const pacingSpikeRef = useRef<Set<number>>(new Set());
  const syncMarkerRef = useRef<Set<number>>(new Set());
  const beatIndexRef = useRef(0);
  const lastBeatPhaseRef = useRef(0);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const midY = h / 2;
    const gapWidth = 12; // blank gap ahead of sweep head

    // Initialize buffer with NaN (means "no data yet")
    if (!bufferRef.current || bufferRef.current.length !== w) {
      bufferRef.current = new Float32Array(w);
      bufferRef.current.fill(NaN);
      writeHeadRef.current = 0;
      phaseRef.current = 0;
    }
    const buffer = bufferRef.current;
    const pacingSpikes = pacingSpikeRef.current;
    const syncMarkers = syncMarkerRef.current;

    // Real LIFEPAK 20: constant 25mm/s sweep speed
    // At ~3.5px/mm on a 700px canvas, 25mm/s ≈ 87.5px/s
    // This means at HR 60 (1 beat/s), one beat spans ~87.5px → ~8 beats visible
    // At HR 200 (3.33 beats/s), beats are tightly spaced → ~26 beats visible
    const pixelsPerSec = 87.5; // constant sweep speed (25mm/s equivalent)
    const beatsPerSec = heartRate / 60;
    const pixelsPerBeat = pixelsPerSec / beatsPerSec;

    // Default PQRST waveform if none provided
    const ecgWave = waveformFn || ((t: number): number => {
      if (t < 0.08) return Math.sin(t * Math.PI / 0.08) * 0.08;
      if (t < 0.14) return 0;
      if (t < 0.17) return -(t - 0.14) / 0.03 * 0.12;
      if (t < 0.21) return -0.12 + (t - 0.17) / 0.04 * 1.12;
      if (t < 0.25) return 1.0 - (t - 0.21) / 0.04 * 1.2;
      if (t < 0.32) return -0.15 + (t - 0.25) / 0.07 * 0.15;
      if (t < 0.48) return Math.sin((t - 0.32) * Math.PI / 0.16) * 0.12;
      return 0;
    });

    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // Cap to avoid jumps
      lastTime = now;

      // Calculate how many pixels to advance
      const advance = pixelsPerSec * dt;
      const newHead = writeHeadRef.current + advance;
      const startIdx = Math.floor(writeHeadRef.current);
      const endIdx = Math.floor(newHead);

      // Write new waveform values into the buffer
      for (let i = startIdx; i <= endIdx; i++) {
        const bufIdx = i % w;
        const pixelPhase = phaseRef.current + (i - startIdx) / pixelsPerBeat;
        const beatProgress = pixelPhase % 1;

        // Track beat transitions to increment beatIndex
        if (beatProgress < lastBeatPhaseRef.current && lastBeatPhaseRef.current > 0.5) {
          beatIndexRef.current++;
        }
        lastBeatPhaseRef.current = beatProgress;

        const waveformContext: WaveformContext = {
          heartRate: heartRate,
          beatIndex: beatIndexRef.current,
        };
        let val = ecgWave(beatProgress, waveformContext);

        // Shock artifact: random noise
        if (showShockArtifact) {
          val = (Math.random() - 0.5) * 1.5;
        }

        buffer[bufIdx] = midY - val * (h * 0.38);

        // Track pacing spike positions (just before QRS at ~13% of beat)
        if (showPacingSpikes && Math.abs(beatProgress - 0.13) < 0.008) {
          pacingSpikes.add(bufIdx);
        }
        // Track sync marker positions (at R-wave peak ~20% of beat)
        if (showSyncMarkers && Math.abs(beatProgress - 0.20) < 0.008) {
          syncMarkers.add(bufIdx);
        }
      }

      // Update phase tracker
      phaseRef.current += (endIdx - startIdx) / pixelsPerBeat;
      writeHeadRef.current = newHead % w;

      // Clear the gap zone ahead of sweep
      const head = Math.floor(writeHeadRef.current);
      for (let i = 0; i < gapWidth; i++) {
        buffer[(head + i) % w] = NaN;
        pacingSpikes.delete((head + i) % w);
        syncMarkers.delete((head + i) % w);
      }

      // === RENDER ===
      // Full clear
      ctx.fillStyle = '#001000';
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.strokeStyle = 'rgba(0, 50, 0, 0.12)';
      ctx.lineWidth = 0.5;
      for (let gy = 0; gy < h; gy += h / 5) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }
      for (let gx = 0; gx < w; gx += w / 15) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }

      // Draw waveform from buffer - clean, no ghosting
      const traceColor = showShockArtifact ? '#ffffff' : color;
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = traceColor;
      ctx.shadowBlur = 3;
      ctx.beginPath();
      let drawing = false;
      for (let x = 0; x < w; x++) {
        const y = buffer[x];
        if (isNaN(y)) {
          drawing = false;
          continue;
        }
        if (!drawing) {
          ctx.moveTo(x, y);
          drawing = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Pacing spikes
      if (showPacingSpikes) {
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00ccff';
        ctx.shadowBlur = 2;
        for (const sx of pacingSpikes) {
          ctx.beginPath();
          ctx.moveTo(sx, midY + h * 0.28);
          ctx.lineTo(sx, midY - h * 0.33);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      // Sync markers
      if (showSyncMarkers) {
        ctx.fillStyle = '#ffcc00';
        for (const mx of syncMarkers) {
          ctx.beginPath();
          ctx.moveTo(mx, h - 1);
          ctx.lineTo(mx - 3, h - 7);
          ctx.lineTo(mx + 3, h - 7);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Sweep cursor line
      ctx.fillStyle = traceColor;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(head, 0, 2, h);
      ctx.globalAlpha = 1.0;

      animRef.current = requestAnimationFrame(draw);
    };

    // Initial clear
    ctx.fillStyle = '#001000';
    ctx.fillRect(0, 0, w, h);
    animRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heartRate, color, height, isVisible, waveformFn, !!showPacingSpikes, !!showShockArtifact, !!showSyncMarkers]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={height}
      className="w-full"
      style={{ height: `${height}px`, background: '#001000' }}
    />
  );
}

// ============================================================================
// 12-LEAD ECG DISPLAY COMPONENT
// ============================================================================

function TwelveLeadECG({ rhythm, heartRate, onClose, onExport }: { rhythm: ECGRhythm; heartRate: number; onClose: () => void; onExport?: () => void }) {
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const animRef = useRef<number>(0);
  const posRef = useRef(0);
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const litflData = getLitflDataForRhythm(rhythm.id);

  // All canvas keys including rhythm strip
  const allCanvasKeys = [...ALL_LEADS, 'rhythm-strip'];

  useEffect(() => {
    let lastTime = performance.now();
    // Constant 25mm/s sweep speed — same as main monitor
    const pixelsPerSec = 87.5;
    const beatsPerSec = heartRate / 60;
    const pixelsPerBeat = pixelsPerSec / beatsPerSec;

    const draw = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      posRef.current += pixelsPerSec * dt;

      for (const key of allCanvasKeys) {
        const canvas = canvasRefs.current[key];
        if (!canvas) continue;

        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const w = canvas.width;
        const h = canvas.height;
        const midY = h / 2;

        // Clear
        ctx.fillStyle = '#000800';
        ctx.fillRect(0, 0, w, h);

        // Grid (ECG paper style)
        ctx.strokeStyle = 'rgba(0, 50, 0, 0.2)';
        ctx.lineWidth = 0.5;
        for (let y = 0; y < h; y += h / 4) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        for (let x = 0; x < w; x += w / 8) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }

        // Determine waveform function - rhythm strip uses Lead II
        const leadName = key === 'rhythm-strip' ? 'II' : key;
        const wfn = rhythm.leads[leadName as LeadName] || rhythm.leads['II'];

        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 2;

        ctx.beginPath();
        let prevBeatProgress = 0;
        let viewerBeatIndex = 0;
        for (let x = 0; x < w; x++) {
          const adjustedX = (x + posRef.current) % (w * 2);
          const beatProgress = (adjustedX / pixelsPerBeat) % 1;
          if (beatProgress < prevBeatProgress && prevBeatProgress > 0.5) {
            viewerBeatIndex++;
          }
          prevBeatProgress = beatProgress;
          const ctx12: WaveformContext = { heartRate, beatIndex: viewerBeatIndex };
          const y = midY - wfn(beatProgress, ctx12) * (h * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Sweep cursor for rhythm strip
        if (key === 'rhythm-strip') {
          const eraseWidth = 15;
          const eraseX = posRef.current % w;
          ctx.fillStyle = '#000800';
          ctx.fillRect(eraseX, 0, eraseWidth, h);
          ctx.fillStyle = '#00ff41';
          ctx.globalAlpha = 0.5;
          ctx.fillRect(eraseX + eraseWidth - 2, 0, 2, h);
          ctx.globalAlpha = 1.0;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [rhythm, heartRate]);

  const setRef = (lead: string) => (el: HTMLCanvasElement | null) => {
    canvasRefs.current[lead] = el;
  };

  // Generate 12-lead ECG image as data URL — proper ECG paper with mm grid
  const generateImage = (): string | null => {
    const exportCanvas = document.createElement('canvas');

    // ECG paper standard: 25mm/s, 10mm/mV
    // 1 small square = 1mm = 0.04s (time) = 0.1mV (voltage)
    // 1 large square = 5mm = 0.2s (time) = 0.5mV (voltage)
    const pxPerMm = 4; // 4 pixels per millimeter
    const smallSq = pxPerMm; // 1mm = 4px
    const largeSq = smallSq * 5; // 5mm = 20px

    // Each lead strip: 2.5 seconds wide = 62.5mm = 250px
    const leadDurationSec = 2.5;
    const leadW = Math.round(leadDurationSec * 25 * pxPerMm); // 25mm/s * 4px/mm * 2.5s = 250px
    const leadH = Math.round(20 * pxPerMm); // 20mm tall = 80px (±1mV range)
    const cols = 4;
    const rows = 3;
    const labelW = 40; // space for lead labels
    const gapX = 2; // tiny gap between columns
    const headerH = 50;
    const rhythmStripH = leadH;
    const footerH = 70;
    const calPulseW = Math.round(5 * pxPerMm); // 5mm calibration pulse width

    const totalW = labelW + (leadW + calPulseW + gapX) * cols;
    const totalH = headerH + (leadH) * rows + 8 + rhythmStripH + footerH;

    exportCanvas.width = totalW;
    exportCanvas.height = totalH;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return null;

    // White ECG paper background
    ctx.fillStyle = '#fff8f0';
    ctx.fillRect(0, 0, totalW, totalH);

    // Draw ECG grid on the paper area
    const gridStartY = headerH;
    const gridH = (leadH) * rows + 8 + rhythmStripH;

    // Small squares (1mm) - light pink/red
    ctx.strokeStyle = 'rgba(255, 180, 180, 0.5)';
    ctx.lineWidth = 0.5;
    for (let y = gridStartY; y <= gridStartY + gridH; y += smallSq) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(totalW, y); ctx.stroke();
    }
    for (let x = 0; x <= totalW; x += smallSq) {
      ctx.beginPath(); ctx.moveTo(x, gridStartY); ctx.lineTo(x, gridStartY + gridH); ctx.stroke();
    }

    // Large squares (5mm) - darker red
    ctx.strokeStyle = 'rgba(220, 120, 120, 0.6)';
    ctx.lineWidth = 1;
    for (let y = gridStartY; y <= gridStartY + gridH; y += largeSq) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(totalW, y); ctx.stroke();
    }
    for (let x = 0; x <= totalW; x += largeSq) {
      ctx.beginPath(); ctx.moveTo(x, gridStartY); ctx.lineTo(x, gridStartY + gridH); ctx.stroke();
    }

    // Header info (black text on white paper)
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('12-LEAD ECG', 8, 18);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#333';
    const dateStr = new Date().toLocaleString('en-GB');
    ctx.fillText(`${rhythm.name}  |  HR: ${heartRate} bpm  |  25mm/s  |  10mm/mV  |  ${dateStr}`, 8, 34);

    // Calibration info
    ctx.font = '9px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('1 small box = 0.04s / 0.1mV  |  1 large box = 0.2s / 0.5mV', 8, 46);

    // R-R interval at current HR
    const beatsPerSec = heartRate / 60;
    const mmPerBeat = 25 / beatsPerSec; // mm per beat at 25mm/s
    const pxPerBeat = mmPerBeat * pxPerMm;

    // Draw each lead
    const layout = [
      ['I', 'aVR', 'V1', 'V4'],
      ['II', 'aVL', 'V2', 'V5'],
      ['III', 'aVF', 'V3', 'V6'],
    ];

    layout.forEach((rowLeads, rowIdx) => {
      rowLeads.forEach((lead, colIdx) => {
        const x = labelW + colIdx * (leadW + calPulseW + gapX);
        const y = headerH + rowIdx * leadH;
        const midY = y + leadH / 2;

        // Calibration pulse (1mV = 10mm square wave at start)
        const calH = 10 * pxPerMm; // 10mm = 1mV
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, midY);
        ctx.lineTo(x + smallSq, midY);        // baseline
        ctx.lineTo(x + smallSq, midY - calH); // up 1mV
        ctx.lineTo(x + calPulseW - smallSq, midY - calH); // plateau
        ctx.lineTo(x + calPulseW - smallSq, midY); // back to baseline
        ctx.lineTo(x + calPulseW, midY);       // continue baseline
        ctx.stroke();

        // Lead label (in the left margin)
        if (colIdx === 0) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(lead, 4, midY + 4);
        }

        // Lead label above the trace
        ctx.fillStyle = '#000';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(lead, x + calPulseW + 2, y + 10);

        // Waveform — heart-rate-appropriate R-R intervals
        const wfn = rhythm.leads[lead as LeadName];
        const waveStartX = x + calPulseW;

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        let first = true;
        let expPrevBP = 0;
        let expBeatIdx = 0;
        for (let px = 0; px < leadW; px++) {
          const beatProgress = (px / pxPerBeat) % 1;
          if (beatProgress < expPrevBP && expPrevBP > 0.5) expBeatIdx++;
          expPrevBP = beatProgress;
          // 1mV = 10mm = 40px; waveform returns values roughly -0.2 to 1.0
          const amplitude = wfn(beatProgress, { heartRate, beatIndex: expBeatIdx }) * (10 * pxPerMm);
          const wy = midY - amplitude;
          if (first) { ctx.moveTo(waveStartX + px, wy); first = false; }
          else ctx.lineTo(waveStartX + px, wy);
        }
        ctx.stroke();
      });
    });

    // Rhythm strip (Lead II, full width, bottom)
    const rsY = headerH + rows * leadH + 8;
    const rsW = totalW - labelW;
    const rsMidY = rsY + rhythmStripH / 2;

    // Label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('II', 4, rsMidY + 4);
    ctx.font = '8px monospace';
    ctx.fillText('Rhythm', 4, rsMidY + 14);

    // Calibration pulse for rhythm strip
    const rsStartX = labelW;
    const calH2 = 10 * pxPerMm;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rsStartX, rsMidY);
    ctx.lineTo(rsStartX + smallSq, rsMidY);
    ctx.lineTo(rsStartX + smallSq, rsMidY - calH2);
    ctx.lineTo(rsStartX + calPulseW - smallSq, rsMidY - calH2);
    ctx.lineTo(rsStartX + calPulseW - smallSq, rsMidY);
    ctx.lineTo(rsStartX + calPulseW, rsMidY);
    ctx.stroke();

    // Rhythm strip waveform
    const wfn2 = rhythm.leads['II'];
    const rsWaveStart = rsStartX + calPulseW;
    const rsTraceW = rsW - calPulseW;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    let first2 = true;
    let rsPrevBP = 0;
    let rsBeatIdx = 0;
    for (let px = 0; px < rsTraceW; px++) {
      const beatProgress = (px / pxPerBeat) % 1;
      if (beatProgress < rsPrevBP && rsPrevBP > 0.5) rsBeatIdx++;
      rsPrevBP = beatProgress;
      const amplitude = wfn2(beatProgress, { heartRate, beatIndex: rsBeatIdx }) * (10 * pxPerMm);
      const wy = rsMidY - amplitude;
      if (first2) { ctx.moveTo(rsWaveStart + px, wy); first2 = false; }
      else ctx.lineTo(rsWaveStart + px, wy);
    }
    ctx.stroke();

    // Footer - interpretation
    const ftY = rsY + rhythmStripH + 8;
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`INTERPRETATION: ${rhythm.description}`, 8, ftY + 12);

    if (litflData.teachingPoints.length > 0) {
      ctx.fillStyle = '#444';
      ctx.font = '9px monospace';
      litflData.teachingPoints.slice(0, 3).forEach((pt, i) => {
        ctx.fillText(`• ${pt}`, 8, ftY + 26 + i * 12);
      });
    }

    // Bottom edge markers
    ctx.fillStyle = '#888';
    ctx.font = '8px monospace';
    ctx.fillText('UAE Paramedic Case Generator — LIFEPAK 20 Simulator', 8, totalH - 6);
    ctx.fillText(dateStr, totalW - 150, totalH - 6);

    return exportCanvas.toDataURL('image/png');
  };

  const handleDownload = () => {
    const dataUrl = generateImage();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `12-Lead-ECG-${rhythm.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePreview = () => {
    const dataUrl = generateImage();
    if (dataUrl) {
      setPreviewDataUrl(dataUrl);
      setShowPreview(true);
    }
  };

  // Determine which leads have ST changes for highlighting
  const getLeadHighlight = (lead: LeadName): string => {
    if (rhythm.id === 'anterior-stemi' && ['V1','V2','V3','V4'].includes(lead)) return 'border-red-500/60';
    if (rhythm.id === 'anterior-stemi' && ['II','III','aVF'].includes(lead)) return 'border-blue-500/40';
    if (rhythm.id === 'inferior-stemi' && ['II','III','aVF'].includes(lead)) return 'border-red-500/60';
    if (rhythm.id === 'inferior-stemi' && ['I','aVL'].includes(lead)) return 'border-blue-500/40';
    if (rhythm.id === 'lateral-stemi' && ['I','aVL','V5','V6'].includes(lead)) return 'border-red-500/60';
    return 'border-gray-700/40';
  };

  return (
    <div ref={exportContainerRef} className="rounded-xl overflow-hidden border-2 border-gray-700"
      style={{ background: 'linear-gradient(145deg, #2a2d31 0%, #1e2024 100%)' }}>
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-700/50"
        style={{ background: 'linear-gradient(180deg, #3a3d42 0%, #2e3136 100%)' }}>
        <div className="flex items-center gap-3">
          <FileHeart className="h-4 w-4 text-green-400" />
          <span className="text-[11px] font-mono font-bold text-green-400 tracking-wider">12-LEAD ECG</span>
          <Badge variant="outline" className="text-[8px] border-green-600/50 text-green-400 h-4">
            {rhythm.name}
          </Badge>
          <span className="text-[9px] font-mono text-gray-400">{heartRate} bpm</span>
          <span className="text-[8px] font-mono text-gray-500">25mm/s | 10mm/mV</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePreview}
            className="px-2 py-1 rounded text-[8px] font-mono font-bold text-cyan-400 bg-cyan-900/30 hover:bg-cyan-800/40 border border-cyan-700/50 transition-colors"
          >
            VIEW STRIP
          </button>
          <button
            onClick={handleDownload}
            className="px-2 py-1 rounded text-[8px] font-mono font-bold text-green-400 bg-green-900/30 hover:bg-green-800/40 border border-green-700/50 transition-colors"
          >
            DOWNLOAD
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 12-Lead Grid */}
      <div className="p-2" style={{ background: '#000800' }}>
        <div className="grid grid-cols-4 gap-1">
          {[
            ['I', 'aVR', 'V1', 'V4'],
            ['II', 'aVL', 'V2', 'V5'],
            ['III', 'aVF', 'V3', 'V6'],
          ].map((row, rowIdx) => (
            row.map((lead) => (
              <div key={lead} className={`relative rounded border ${getLeadHighlight(lead as LeadName)}`}>
                <span className="absolute top-0.5 left-1 text-[8px] font-mono font-bold text-green-500/80 z-10">{lead}</span>
                <canvas
                  ref={setRef(lead)}
                  width={200}
                  height={60}
                  className="w-full"
                  style={{ height: '60px', background: '#000800' }}
                />
              </div>
            ))
          ))}
        </div>

        {/* Rhythm Strip (Lead II full width) - animated sweep */}
        <div className="mt-1 relative rounded border border-gray-700/40">
          <span className="absolute top-0.5 left-1 text-[8px] font-mono font-bold text-green-500/80 z-10">II - Rhythm Strip</span>
          <canvas
            ref={setRef('rhythm-strip')}
            width={800}
            height={60}
            className="w-full"
            style={{ height: '60px', background: '#000800' }}
          />
        </div>
      </div>

      {/* Interpretation & Teaching Points */}
      <div className="px-3 py-2 space-y-2 border-t border-gray-700/30" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="flex items-start gap-2">
          <span className="text-[9px] font-mono text-green-400 font-bold shrink-0">INTERP:</span>
          <span className="text-[9px] font-mono text-gray-300">{rhythm.description}</span>
        </div>

        {rhythm.category === 'stemi' && (
          <div className="flex items-center gap-3 text-[8px] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="text-red-400">ST Elevation</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500/40" />
              <span className="text-blue-400">Reciprocal Changes</span>
            </span>
          </div>
        )}

        {litflData.teachingPoints.length > 0 && (
          <div>
            <span className="text-[8px] font-mono text-amber-400 font-bold block mb-0.5">KEY POINTS:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
              {litflData.teachingPoints.slice(0, 4).map((point, i) => (
                <span key={i} className="text-[8px] font-mono text-gray-400 flex items-start gap-1">
                  <span className="text-amber-500 shrink-0">-</span>
                  {point}
                </span>
              ))}
            </div>
          </div>
        )}

        {litflData.litflUrl && (
          <div className="text-[8px] font-mono text-cyan-500/70">
            LITFL: {litflData.litflUrl}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* PRINT PREVIEW OVERLAY - Full-screen ECG strip view          */}
      {/* ============================================================ */}
      {showPreview && previewDataUrl && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-start"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowPreview(false)}
        >
          {/* Toolbar at top */}
          <div className="w-full max-w-5xl flex items-center justify-between px-4 py-2 mt-2"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <FileHeart className="h-4 w-4 text-green-400" />
              <span className="text-sm font-mono font-bold text-white">12-Lead ECG Strip</span>
              <span className="text-xs font-mono text-gray-400">{rhythm.name} | {heartRate} bpm</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded text-xs font-mono font-bold text-white bg-green-700 hover:bg-green-600 transition-colors"
              >
                ⬇ Download PNG
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* ECG strip image — flush at top, scrollable */}
          <div className="flex-1 w-full max-w-5xl overflow-auto px-4 pb-4"
            onClick={(e) => e.stopPropagation()}>
            <img
              src={previewDataUrl}
              alt="12-Lead ECG Strip"
              className="w-full h-auto rounded shadow-2xl border border-gray-600"
              style={{ imageRendering: 'crisp-edges' }}
            />
            {/* Interpretation below image */}
            <div className="mt-3 p-3 rounded bg-gray-900/80 border border-gray-700">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <span className="text-xs font-mono text-green-400 font-bold">INTERPRETATION: </span>
                  <span className="text-xs font-mono text-gray-300">{rhythm.description}</span>
                </div>
                {litflData.litflUrl && (
                  <a href={litflData.litflUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline shrink-0">
                    LITFL Reference
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SpO2 PLETH WAVEFORM - Clean buffer-based rendering
// Realistic photoplethysmography waveform with dicrotic notch
// ============================================================================

function PlethWaveform({ heartRate, spo2, color, height = 50, isVisible }: { heartRate: number; spo2: number; color: string; height?: number; isVisible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const bufferRef = useRef<Float32Array | null>(null);
  const writeHeadRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const gapWidth = 12;

    if (!bufferRef.current || bufferRef.current.length !== w) {
      bufferRef.current = new Float32Array(w);
      bufferRef.current.fill(NaN);
      writeHeadRef.current = 0;
      phaseRef.current = 0;
    }
    const buffer = bufferRef.current;

    // Constant sweep speed matching ECG (25mm/s equivalent)
    const pixelsPerSec = 87.5;
    const beatsPerSec = heartRate / 60;
    const pixelsPerBeat = pixelsPerSec / beatsPerSec;

    // Realistic pleth waveform: sharp systolic upstroke, dicrotic notch, diastolic decay
    const plethWave = (t: number): number => {
      // Systolic upstroke (sharp rise)
      if (t < 0.12) return Math.pow(t / 0.12, 1.8);
      // Systolic peak and initial descent
      if (t < 0.28) return 1.0 - Math.pow((t - 0.12) / 0.16, 0.7) * 0.45;
      // Dicrotic notch (small dip then bump)
      if (t < 0.35) return 0.55 - Math.sin((t - 0.28) * Math.PI / 0.07) * 0.08;
      // Dicrotic wave (secondary bump)
      if (t < 0.45) return 0.50 + Math.sin((t - 0.35) * Math.PI / 0.10) * 0.08;
      // Diastolic decay (smooth exponential)
      if (t < 0.85) return 0.50 * Math.exp(-(t - 0.45) * 3.5);
      // Baseline
      return 0.50 * Math.exp(-0.4 * 3.5) * Math.max(0, 1 - (t - 0.85) / 0.15);
    };

    const amplitude = Math.max(0.4, Math.min(0.85, (spo2 / 100) * 0.85));
    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const advance = pixelsPerSec * dt;
      const startIdx = Math.floor(writeHeadRef.current);
      const endIdx = Math.floor(writeHeadRef.current + advance);

      for (let i = startIdx; i <= endIdx; i++) {
        const bufIdx = i % w;
        const pixelPhase = phaseRef.current + (i - startIdx) / pixelsPerBeat;
        const beatProgress = pixelPhase % 1;
        const val = plethWave(beatProgress);
        buffer[bufIdx] = h - 3 - val * (h * amplitude);
      }

      phaseRef.current += (endIdx - startIdx) / pixelsPerBeat;
      writeHeadRef.current = (writeHeadRef.current + advance) % w;

      // Clear gap
      const head = Math.floor(writeHeadRef.current);
      for (let i = 0; i < gapWidth; i++) {
        buffer[(head + i) % w] = NaN;
      }

      // Render
      ctx.fillStyle = '#000810';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 2;
      ctx.beginPath();
      let drawing = false;
      for (let x = 0; x < w; x++) {
        const y = buffer[x];
        if (isNaN(y)) { drawing = false; continue; }
        if (!drawing) { ctx.moveTo(x, y); drawing = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sweep cursor
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(head, 0, 2, h);
      ctx.globalAlpha = 1.0;

      animRef.current = requestAnimationFrame(draw);
    };

    ctx.fillStyle = '#000810';
    ctx.fillRect(0, 0, w, h);
    animRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animRef.current);
  }, [heartRate, spo2, color, height, isVisible]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={height}
      className="w-full"
      style={{ height: `${height}px`, background: '#000810' }}
    />
  );
}

// ============================================================================
// EtCO2 CAPNOGRAPHY WAVEFORM - Clean buffer-based rendering
// Classic 4-phase capnogram: baseline, upstroke, plateau, downstroke
// ============================================================================

function CapnographyWaveform({ respiratoryRate, etco2, color, height = 45, isVisible }: { respiratoryRate: number; etco2: number; color: string; height?: number; isVisible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const bufferRef = useRef<Float32Array | null>(null);
  const writeHeadRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const gapWidth = 10;

    if (!bufferRef.current || bufferRef.current.length !== w) {
      bufferRef.current = new Float32Array(w);
      bufferRef.current.fill(NaN);
      writeHeadRef.current = 0;
      phaseRef.current = 0;
    }
    const buffer = bufferRef.current;

    // Constant sweep speed matching ECG (25mm/s equivalent)
    const pixelsPerSec = 87.5;
    const breathsPerSec = respiratoryRate / 60;
    const pixelsPerBreath = pixelsPerSec / breathsPerSec;

    // Realistic 4-phase capnogram
    const capnoWave = (t: number): number => {
      // Phase 0: Inspiratory baseline (dead space gas)
      if (t < 0.08) return 0;
      // Phase I→II: Expiratory upstroke (mixing then alveolar gas)
      if (t < 0.12) return Math.pow((t - 0.08) / 0.04, 0.4) * 0.15;
      if (t < 0.20) return 0.15 + ((t - 0.12) / 0.08) * 0.83;
      // Phase III: Alveolar plateau (slight upward slope — normal)
      if (t < 0.55) return 0.98 + (t - 0.20) * 0.06; // slight upslope to ~1.0
      // Phase IV: Inspiratory downstroke (rapid fall)
      if (t < 0.60) return 1.0 * Math.pow(1 - (t - 0.55) / 0.05, 0.3);
      // Return to baseline
      return 0;
    };

    const amplitude = Math.min(1, (etco2 || 35) / 50) * 0.75;
    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const advance = pixelsPerSec * dt;
      const startIdx = Math.floor(writeHeadRef.current);
      const endIdx = Math.floor(writeHeadRef.current + advance);

      for (let i = startIdx; i <= endIdx; i++) {
        const bufIdx = i % w;
        const pixelPhase = phaseRef.current + (i - startIdx) / pixelsPerBreath;
        const breathProgress = pixelPhase % 1;
        const val = capnoWave(breathProgress);
        buffer[bufIdx] = h - 3 - val * (h * amplitude);
      }

      phaseRef.current += (endIdx - startIdx) / pixelsPerBreath;
      writeHeadRef.current = (writeHeadRef.current + advance) % w;

      // Clear gap
      const head = Math.floor(writeHeadRef.current);
      for (let i = 0; i < gapWidth; i++) {
        buffer[(head + i) % w] = NaN;
      }

      // Render
      ctx.fillStyle = '#080010';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 2;
      ctx.beginPath();
      let drawing = false;
      for (let x = 0; x < w; x++) {
        const y = buffer[x];
        if (isNaN(y)) { drawing = false; continue; }
        if (!drawing) { ctx.moveTo(x, y); drawing = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sweep cursor
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(head, 0, 2, h);
      ctx.globalAlpha = 1.0;

      animRef.current = requestAnimationFrame(draw);
    };

    ctx.fillStyle = '#080010';
    ctx.fillRect(0, 0, w, h);
    animRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animRef.current);
  }, [respiratoryRate, etco2, color, height, isVisible]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={height}
      className="w-full"
      style={{ height: `${height}px`, background: '#080010' }}
    />
  );
}

// ============================================================================
// LIFEPAK 20 BUTTON COMPONENT
// ============================================================================

function LP20Button({
  label,
  sublabel,
  onClick,
  variant = 'default',
  active = false,
  disabled = false,
  size = 'normal',
  className = '',
}: {
  label: string;
  sublabel?: string;
  onClick?: () => void;
  variant?: 'default' | 'red' | 'yellow' | 'green' | 'blue';
  active?: boolean;
  disabled?: boolean;
  size?: 'normal' | 'small' | 'large';
  className?: string;
}) {
  const baseClasses = 'relative font-mono font-bold tracking-wider uppercase transition-all duration-150 select-none';
  const sizeClasses = size === 'large' ? 'px-4 py-2 text-[10px]' : size === 'small' ? 'px-2 py-1 text-[8px]' : 'px-3 py-1.5 text-[9px]';

  const variantClasses: Record<string, string> = {
    default: `bg-gradient-to-b from-gray-600 to-gray-700 text-gray-200 border border-gray-500/50
              hover:from-gray-500 hover:to-gray-600 active:from-gray-700 active:to-gray-800
              shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.4)]
              active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]`,
    red: `bg-gradient-to-b from-red-600 to-red-800 text-white border border-red-500/50
          hover:from-red-500 hover:to-red-700 active:from-red-800 active:to-red-900
          shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.4)]
          active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]`,
    yellow: `bg-gradient-to-b from-amber-500 to-amber-700 text-black border border-amber-400/50
             hover:from-amber-400 hover:to-amber-600 active:from-amber-700 active:to-amber-800
             shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.4)]
             active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]`,
    green: `bg-gradient-to-b from-green-600 to-green-800 text-white border border-green-500/50
            hover:from-green-500 hover:to-green-700 active:from-green-800 active:to-green-900
            shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.4)]
            active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]`,
    blue: `bg-gradient-to-b from-blue-600 to-blue-800 text-white border border-blue-500/50
           hover:from-blue-500 hover:to-blue-700 active:from-blue-800 active:to-blue-900
           shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.4)]
           active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]`,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} rounded
                  ${active ? 'ring-2 ring-white/40' : ''}
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  ${className}`}
    >
      <span className="block leading-tight">{label}</span>
      {sublabel && <span className="block text-[7px] opacity-70 leading-tight mt-0.5">{sublabel}</span>}
    </button>
  );
}

// ============================================================================
// MAIN LIFEPAK 20 MONITOR COMPONENT
// ============================================================================

export function VitalSignsMonitor({
  initialVitals,
  previousVitals,
  deteriorationVitals,
  onVitalChange,
  caseCategory,
  caseSubcategory,
  caseTitle,
  ecgFindings,
  appliedTreatments = [],
  overrideRhythm,
  cprState,
}: VitalSignsMonitorProps) {
  const [currentVitals, setCurrentVitals] = useState<VitalSigns>(initialVitals);
  const [visibleVitals, setVisibleVitals] = useState<Set<string>>(new Set());
  const [assessmentMode, setAssessmentMode] = useState(true);
  const [activeAssessments, setActiveAssessments] = useState<Map<string, { startTime: number; duration: number }>>(new Map());
  const [assessmentProgress, setAssessmentProgress] = useState<Map<string, number>>(new Map());
  const [alarmsEnabled, setAlarmsEnabled] = useState(true);
  const [activeAlarms, setActiveAlarms] = useState<Set<string>>(new Set());
  const [audioEnabled, setAudioEnabled] = useState(false);

  // LIFEPAK-specific states
  const [monitorMode, setMonitorMode] = useState<'monitor' | 'defib' | 'pacer'>('monitor');
  const [selectedEnergy, setSelectedEnergy] = useState(200);
  const [isCharging, setIsCharging] = useState(false);
  const [isCharged, setIsCharged] = useState(false);
  const [syncMode, setSyncMode] = useState(false);
  const [selectedLead, setSelectedLead] = useState<'I' | 'II' | 'III' | 'PADDLES'>('II');
  const [codeTimerRunning, setCodeTimerRunning] = useState(false);
  const [codeTimerSeconds, setCodeTimerSeconds] = useState(0);
  const [heartFlash, setHeartFlash] = useState(false);
  const [showAssessPanel, setShowAssessPanel] = useState(false);
  const [show12Lead, setShow12Lead] = useState(false);
  const [treatmentEffectIndicator, setTreatmentEffectIndicator] = useState<string | null>(null);
  const [prevTreatmentCount, setPrevTreatmentCount] = useState(0);
  const [shockDelivered, setShockDelivered] = useState(false);
  const [shockCount, setShockCount] = useState(0);
  const [nibpCycling, setNibpCycling] = useState(false);
  const [nibpCountdown, setNibpCountdown] = useState(0);
  const [interventionLog, setInterventionLog] = useState<Array<{ time: string; action: string; detail: string }>>([]);
  const [pacerActive, setPacerActive] = useState(false);
  const [pacerRate, setPacerRate] = useState(60);
  const [pacerOutput, setPacerOutput] = useState(80);
  const [shockArtifact, setShockArtifact] = useState(false);

  // Deterioration state (must be declared before any useEffect)
  const [caseSeverity] = useState<CaseSeverity>(() => determineSeverity(caseCategory || 'general', initialVitals));
  const [minutesElapsed, setMinutesElapsed] = useState(0);
  const [deteriorationWarningSigns, setDeteriorationWarningSigns] = useState<string[]>([]);
  const [deteriorationChanges, setDeteriorationChanges] = useState<string[]>([]);
  const activeTreatments = appliedTreatments;

  // Refs
  const assessmentIntervalRef = useRef<number | null>(null);
  const deteriorationTimerRef = useRef<number | null>(null);
  const audioEngineRef = useRef<ClinicalAudioEngine | null>(null);
  const codeTimerRef = useRef<number | null>(null);
  const nibpIntervalRef = useRef<number | null>(null);

  // Pacemaker capture enforcement - continuously enforce pacer rate while active
  // This prevents other vital updates (deterioration, treatment effects) from overriding the paced rate
  useEffect(() => {
    if (!pacerActive || pacerOutput < 60) return;

    // Check every 2 seconds if the HR has drifted from the pacer rate
    const interval = setInterval(() => {
      setCurrentVitals(prev => {
        if (prev.pulse !== pacerRate) {
          return { ...prev, pulse: pacerRate };
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [pacerActive, pacerRate, pacerOutput]);

  // Stop ready tone when leaving defib mode or when charge is cancelled
  useEffect(() => {
    if (monitorMode !== 'defib' || !isCharged) {
      if (audioEngineRef.current) {
        audioEngineRef.current.stopReadyTone();
      }
    }
  }, [monitorMode, isCharged]);

  // ECG Rhythm - from override (dynamic patient state) or case category
  const currentRhythm = useMemo<ECGRhythm>(() => {
    const hr = parseInt(String(currentVitals.pulse)) || 75;
    // If patient state provides a rhythm override (e.g., after defibrillation, atropine),
    // resolve it directly from the rhythm registry before falling back to category matching.
    // The override can be either a rhythm ID ('nsr', 'sinus-tachy') or a display name
    // ('Normal Sinus Rhythm', 'Sinus Tachycardia').
    if (overrideRhythm) {
      // 1. Try direct rhythm ID match (e.g., 'nsr', 'sinus-tachy', 'vfib')
      if (RHYTHM_MAP[overrideRhythm]) {
        return RHYTHM_MAP[overrideRhythm];
      }
      // 2. Try matching by display name (e.g., 'Sinus Rhythm', 'Sinus Tachycardia')
      const byName = ALL_RHYTHMS.find(r => r.name.toLowerCase() === overrideRhythm.toLowerCase());
      if (byName) return byName;
      // 3. Try partial name match for common variations
      const lowerOverride = overrideRhythm.toLowerCase();
      if (lowerOverride === 'sinus rhythm' || lowerOverride === 'normal sinus rhythm') {
        return RHYTHM_MAP['nsr'];
      }
      if (lowerOverride.includes('sinus tachycardia')) {
        return RHYTHM_MAP['sinus-tachy'];
      }
      if (lowerOverride.includes('sinus bradycardia')) {
        return RHYTHM_MAP['sinus-brady'];
      }
      // 4. Fallback to category-based matching using the override as search text
      const overrideResult = getRhythmForCase('cardiac', overrideRhythm, hr, overrideRhythm);
      return overrideResult;
    }
    return getRhythmForCase(caseCategory || 'general', caseSubcategory, hr, caseTitle, ecgFindings);
  }, [caseCategory, caseSubcategory, currentVitals.pulse, caseTitle, ecgFindings, overrideRhythm]);

  // Get the waveform function for the selected lead
  const getWaveformForLead = useCallback((lead: string): WaveformFn => {
    const leadMap: Record<string, LeadName> = {
      'I': 'I', 'II': 'II', 'III': 'III', 'PADDLES': 'II',
    };
    const leadName = leadMap[lead] || 'II';
    return currentRhythm.leads[leadName];
  }, [currentRhythm]);

  // Helper: log an intervention with timestamp
  const logIntervention = useCallback((action: string, detail: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setInterventionLog(prev => [...prev, { time, action, detail }]);
  }, []);

  // Treatment effect indicator - show when new treatment is applied
  useEffect(() => {
    if (appliedTreatments.length > prevTreatmentCount && appliedTreatments.length > 0) {
      const latestTreatment = appliedTreatments[appliedTreatments.length - 1];
      setTreatmentEffectIndicator(latestTreatment);
      logIntervention('TREATMENT', latestTreatment);
      setTimeout(() => setTreatmentEffectIndicator(null), 8000);
    }
    setPrevTreatmentCount(appliedTreatments.length);
  }, [appliedTreatments, prevTreatmentCount, logIntervention]);

  const ENERGY_OPTIONS = [1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 100, 150, 200, 300, 360];

  // Initialize audio engine
  useEffect(() => {
    audioEngineRef.current = new ClinicalAudioEngine();
    return () => {
      audioEngineRef.current?.dispose();
    };
  }, []);

  // Sync currentVitals to parent via onVitalChange - avoids setState-during-render errors
  const prevVitalsRef = useRef(currentVitals);
  useEffect(() => {
    if (onVitalChange && currentVitals !== prevVitalsRef.current) {
      prevVitalsRef.current = currentVitals;
      onVitalChange(currentVitals);
    }
  }, [currentVitals, onVitalChange]);

  // Heart flash effect synced to HR — no flash during arrest rhythms
  useEffect(() => {
    if (!visibleVitals.has('pulse')) return;
    if (currentRhythm.category === 'arrest') {
      setHeartFlash(false);
      return;
    }
    const hr = parseInt(String(currentVitals.pulse)) || 80;
    if (hr === 0) return;
    const intervalMs = (60 / hr) * 1000;

    const flash = () => {
      setHeartFlash(true);
      setTimeout(() => setHeartFlash(false), 100);
    };

    flash();
    const interval = window.setInterval(flash, intervalMs);
    return () => clearInterval(interval);
  }, [currentVitals.pulse, visibleVitals, currentRhythm.category]);

  // Code timer
  useEffect(() => {
    if (codeTimerRunning) {
      codeTimerRef.current = window.setInterval(() => {
        setCodeTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (codeTimerRef.current) clearInterval(codeTimerRef.current);
    }
    return () => {
      if (codeTimerRef.current) clearInterval(codeTimerRef.current);
    };
  }, [codeTimerRunning]);

  // Manage heartbeat sound — no heartbeat during arrest rhythms
  useEffect(() => {
    if (!audioEngineRef.current) return;

    if (audioEnabled && visibleVitals.has('pulse') && currentRhythm.category !== 'arrest') {
      const hr = parseInt(String(currentVitals.pulse)) || 80;
      if (hr > 0) {
        audioEngineRef.current.updateHeartbeatRate(hr);
        if (!audioEngineRef.current['isPlaying']) {
          audioEngineRef.current.playHeartbeat(hr);
        }
      } else {
        audioEngineRef.current.stopHeartbeat();
      }
    } else {
      audioEngineRef.current.stopHeartbeat();
    }
  }, [audioEnabled, visibleVitals, currentVitals.pulse, currentRhythm.category]);

  // Available vitals
  const availableVitals = useMemo(() => {
    return [
      { key: 'pulse' as keyof VitalSigns, label: 'HR', unit: 'bpm' },
      { key: 'bp' as keyof VitalSigns, label: 'NIBP', unit: 'mmHg' },
      { key: 'spo2' as keyof VitalSigns, label: 'SpO2', unit: '%' },
      { key: 'respiration' as keyof VitalSigns, label: 'RR', unit: '/min' },
      { key: 'etco2' as keyof VitalSigns, label: 'EtCO2', unit: 'mmHg' },
      { key: 'gcs' as keyof VitalSigns, label: 'GCS', unit: '/15' },
      { key: 'temperature' as keyof VitalSigns, label: 'Temp', unit: '\u00b0C' },
      { key: 'bloodGlucose' as keyof VitalSigns, label: 'BGL', unit: 'mmol/L' },
      { key: 'painScore' as keyof VitalSigns, label: 'Pain', unit: '/10' },
    ].filter(config => {
      // Pain score is always available for assessment even if not in initial vitals
      if (config.key === 'painScore') return true;
      const value = currentVitals[config.key];
      return value !== undefined && value !== null;
    });
  }, [currentVitals]);

  // Calculate alarms
  useEffect(() => {
    const newAlarms = new Set<string>();

    const pulse = parseInt(String(currentVitals.pulse)) || 80;
    const spo2 = currentVitals.spo2 || 98;
    const respiration = currentVitals.respiration || 16;
    const gcs = currentVitals.gcs || 15;
    const bpParts = String(currentVitals.bp || '120/80').split('/');
    const systolic = parseInt(bpParts[0]) || 120;
    const temp = currentVitals.temperature || 36.5;
    const glucose = currentVitals.bloodGlucose || 5.5;

    if (checkAlarm(pulse, ALARM_THRESHOLDS.pulse).isCritical) newAlarms.add('pulse-critical');
    else if (checkAlarm(pulse, ALARM_THRESHOLDS.pulse).isWarning) newAlarms.add('pulse-warning');

    if (checkAlarm(spo2, ALARM_THRESHOLDS.spo2).isCritical) newAlarms.add('spo2-critical');
    else if (checkAlarm(spo2, ALARM_THRESHOLDS.spo2).isWarning) newAlarms.add('spo2-warning');

    if (checkAlarm(respiration, ALARM_THRESHOLDS.respiration).isCritical) newAlarms.add('respiration-critical');
    else if (checkAlarm(respiration, ALARM_THRESHOLDS.respiration).isWarning) newAlarms.add('respiration-warning');

    if (checkAlarm(systolic, ALARM_THRESHOLDS.systolic).isCritical) newAlarms.add('bp-critical');
    else if (checkAlarm(systolic, ALARM_THRESHOLDS.systolic).isWarning) newAlarms.add('bp-warning');

    if (checkAlarm(gcs, ALARM_THRESHOLDS.gcs).isCritical) newAlarms.add('gcs-critical');
    else if (checkAlarm(gcs, ALARM_THRESHOLDS.gcs).isWarning) newAlarms.add('gcs-warning');

    if (checkAlarm(temp, ALARM_THRESHOLDS.temperature).isCritical) newAlarms.add('temp-critical');
    else if (checkAlarm(temp, ALARM_THRESHOLDS.temperature).isWarning) newAlarms.add('temp-warning');

    if (checkAlarm(glucose, ALARM_THRESHOLDS.bloodGlucose).isCritical) newAlarms.add('glucose-critical');
    else if (checkAlarm(glucose, ALARM_THRESHOLDS.bloodGlucose).isWarning) newAlarms.add('glucose-warning');

    setActiveAlarms(newAlarms);

    if (audioEnabled && audioEngineRef.current && alarmsEnabled) {
      const hasCritical = Array.from(newAlarms).some(a => a.includes('critical'));
      const hasWarning = Array.from(newAlarms).some(a => a.includes('warning'));
      if (hasCritical) audioEngineRef.current.playAlarm(true);
      else if (hasWarning) audioEngineRef.current.playAlarm(false);
    }
  }, [currentVitals, audioEnabled, alarmsEnabled]);

  // Deterioration timer
  useEffect(() => {
    deteriorationTimerRef.current = window.setInterval(() => {
      setMinutesElapsed(prev => {
        const newMinutes = prev + 1;
        const result = applyDeterioration(currentVitals, caseSeverity, 1, activeTreatments);
        setCurrentVitals(result.newVitals);
        setDeteriorationWarningSigns(result.warningSigns);
        setDeteriorationChanges(result.changes);
        return newMinutes;
      });
    }, 60000);

    return () => {
      if (deteriorationTimerRef.current) clearInterval(deteriorationTimerRef.current);
    };
  }, [currentVitals, caseSeverity, activeTreatments]);

  // Assessment progress animation
  useEffect(() => {
    if (activeAssessments.size === 0) return;

    const updateProgress = () => {
      const now = Date.now();
      const newProgress = new Map<string, number>();
      const completed: string[] = [];

      activeAssessments.forEach((assessment, vitalKey) => {
        const elapsed = (now - assessment.startTime) / 1000;
        const progress = Math.min(100, (elapsed / assessment.duration) * 100);
        newProgress.set(vitalKey, progress);
        if (progress >= 100) completed.push(vitalKey);
      });

      setAssessmentProgress(newProgress);

      if (completed.length > 0) {
        setVisibleVitals(prev => {
          const next = new Set(prev);
          completed.forEach(key => next.add(key));
          return next;
        });
        setActiveAssessments(prev => {
          const next = new Map(prev);
          completed.forEach(key => next.delete(key));
          return next;
        });

        // If pain assessment completed but painScore was not in initial vitals, set a default
        if (completed.includes('painScore') && currentVitals.painScore === undefined) {
          setCurrentVitals(prev => ({ ...prev, painScore: 0 }));
        }

        if (audioEnabled && audioEngineRef.current && completed.includes('spo2')) {
          audioEngineRef.current.playSpo2Beep(currentVitals.spo2 || 98);
        }
      }

      if (activeAssessments.size > 0) {
        assessmentIntervalRef.current = requestAnimationFrame(updateProgress);
      }
    };

    assessmentIntervalRef.current = requestAnimationFrame(updateProgress);
    return () => {
      if (assessmentIntervalRef.current) cancelAnimationFrame(assessmentIntervalRef.current);
    };
  }, [activeAssessments, audioEnabled, currentVitals.spo2]);

  const startAssessment = useCallback((vitalKey: string, method: AssessmentMethod) => {
    if (activeAssessments.has(vitalKey) || visibleVitals.has(vitalKey)) return;

    if (audioEnabled && audioEngineRef.current && vitalKey === 'bp') {
      audioEngineRef.current.playBPInflation(method.duration * 1000);
    }

    setActiveAssessments(prev => {
      const next = new Map(prev);
      next.set(vitalKey, { startTime: Date.now(), duration: method.duration });
      return next;
    });
  }, [activeAssessments, visibleVitals, audioEnabled]);

  const hideVital = (vitalKey: string) => {
    setVisibleVitals(prev => {
      const next = new Set(prev);
      next.delete(vitalKey);
      return next;
    });
  };

  const showAllVitals = () => {
    setVisibleVitals(new Set(availableVitals.map(v => v.key)));
    setAssessmentMode(false);
  };

  const hideAllVitals = () => {
    setVisibleVitals(new Set());
    setAssessmentMode(true);
  };

  const getVitalAlarmState = (key: string): { isAlarm: boolean; isWarning: boolean } => {
    return {
      isAlarm: Array.from(activeAlarms).some(a => a.startsWith(key) && a.includes('critical')),
      isWarning: Array.from(activeAlarms).some(a => a.startsWith(key) && a.includes('warning')),
    };
  };

  const alarmStatus = {
    hasCritical: Array.from(activeAlarms).some(a => a.includes('critical')),
    hasWarning: Array.from(activeAlarms).some(a => a.includes('warning')),
    count: activeAlarms.size,
  };

  // During arrest rhythms (VF, asystole, fine VF, PEA), displayed HR is always 0
  // UNLESS arrest has been resolved (ROSC) — check both rhythm category AND cprState
  const rawHrValue = parseInt(String(currentVitals.pulse)) || 0;
  const isArrestRhythm = currentRhythm.category === 'arrest' && cprState?.active !== false;
  const hrValue = isArrestRhythm ? 0 : (rawHrValue || (currentRhythm.category !== 'arrest' ? 80 : 0));
  const spo2Value = currentVitals.spo2 || 98;
  const rrValue = currentVitals.respiration || 16;
  const etco2Value = currentVitals.etco2;

  // NIBP auto-cycle effect
  useEffect(() => {
    if (!nibpCycling) {
      if (nibpIntervalRef.current) clearInterval(nibpIntervalRef.current);
      return;
    }

    // Start first cycle
    setNibpCountdown(120);
    if (!visibleVitals.has('bp') && !activeAssessments.has('bp')) {
      startAssessment('bp', ASSESSMENT_METHODS.bp[1]);
      logIntervention('NIBP', `Auto-cycle initiated - measuring BP`);
    }

    nibpIntervalRef.current = window.setInterval(() => {
      setNibpCountdown(prev => {
        if (prev <= 1) {
          // Trigger new BP measurement
          if (!activeAssessments.has('bp')) {
            startAssessment('bp', ASSESSMENT_METHODS.bp[1]);
            logIntervention('NIBP', `Auto-cycle measurement`);
          }
          return 120; // Reset to 2 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (nibpIntervalRef.current) clearInterval(nibpIntervalRef.current);
    };
  }, [nibpCycling, startAssessment, activeAssessments, visibleVitals, logIntervention]);

  // Treatment effect: gradually modify vitals when treatments are applied
  // Scans ALL applied treatments to determine cumulative effects
  useEffect(() => {
    if (appliedTreatments.length === 0) return;

    // Build a combined treatment profile from all applied treatments
    const allTx = appliedTreatments.map(t => t.toLowerCase()).join(' ');
    const latest = appliedTreatments[appliedTreatments.length - 1]?.toLowerCase() || '';

    const hasOxygen = allTx.includes('oxygen') || allTx.includes('o2') || allTx.includes('nasal cannula') ||
      allTx.includes('nrb') || allTx.includes('bvm') || allTx.includes('high flow') || allTx.includes('mask') ||
      allTx.includes('non-rebreather') || allTx.includes('cpap') || allTx.includes('bipap');
    const hasFluid = allTx.includes('fluid') || allTx.includes('saline') || allTx.includes('hartmann') ||
      allTx.includes('bolus') || allTx.includes('iv ') || allTx.includes('ringer') || allTx.includes('crystalloid');
    const hasAnalgesic = allTx.includes('morphine') || allTx.includes('fentanyl') || allTx.includes('paracetamol') ||
      allTx.includes('analges') || allTx.includes('ketamine') || allTx.includes('methoxyflurane') || allTx.includes('tramadol');
    const hasOpioid = allTx.includes('morphine') || allTx.includes('fentanyl');
    const hasBronchodilator = allTx.includes('salbutamol') || allTx.includes('nebuli') || allTx.includes('broncho') ||
      allTx.includes('ipratropium') || allTx.includes('ventolin') || allTx.includes('combivent');
    const hasAdrenaline = latest.includes('adrenaline') || latest.includes('epinephrine');
    const hasAtropine = latest.includes('atropine');
    const hasGlucose = latest.includes('glucose') || latest.includes('dextrose') || latest.includes('glucagon');
    const hasAmiodarone = latest.includes('amiodarone');
    const hasAdenosine = latest.includes('adenosine');
    const hasGTN = allTx.includes('gtn') || allTx.includes('nitroglycerin') || allTx.includes('nitro');
    const hasAntiemetic = allTx.includes('ondansetron') || allTx.includes('metoclopramide') || allTx.includes('antiemetic');
    const hasMidazolam = latest.includes('midazolam') || latest.includes('diazepam') || latest.includes('lorazepam');
    const hasNaloxone = latest.includes('naloxone') || latest.includes('narcan');
    const hasAspirin = allTx.includes('aspirin');

    // During cardiac arrest, treatment effects on SpO2 are meaningless (no perfusion)
    const isInCardiacArrest = cprState?.active === true;

    // Apply gradual treatment effects
    const applyEffects = () => {
      setCurrentVitals(prev => {
        const updated = { ...prev };
        let changed = false;

        // Oxygen therapy -> SpO2 gradually rises (skip during arrest — no perfusion for SpO2 reading)
        // More aggressive improvement when critically low (proportional to deficit)
        if (hasOxygen && !isInCardiacArrest) {
          const currentSpo2 = prev.spo2 || 92;
          if (currentSpo2 < 98) {
            // Bigger improvement when SpO2 is very low (clinical: high-flow O2 works fast)
            const deficit = 98 - currentSpo2;
            const improvement = deficit > 30 ? Math.random() * 8 + 6    // Critical (<68%): +6-14 per tick
                              : deficit > 15 ? Math.random() * 5 + 3    // Severe (<83%): +3-8 per tick
                              : deficit > 5  ? Math.random() * 3 + 1.5  // Moderate (<93%): +1.5-4.5
                              : Math.random() * 1.5 + 0.5;              // Mild: +0.5-2
            updated.spo2 = Math.min(99, Math.round((currentSpo2 + improvement) * 10) / 10);
            changed = true;
          }
          // Improved oxygenation reduces compensatory tachycardia
          if (prev.pulse && prev.pulse > 100) {
            updated.pulse = Math.max(85, prev.pulse - Math.floor(Math.random() * 3 + 1));
            changed = true;
          }
          // Improved oxygenation reduces tachypnea
          if (prev.respiration && prev.respiration > 20) {
            updated.respiration = Math.max(14, prev.respiration - Math.floor(Math.random() * 2 + 1));
            changed = true;
          }
        }

        // IV fluids -> BP gradually rises, HR decreases (volume resuscitation)
        // More aggressive response proportional to how hypotensive the patient is
        if (hasFluid) {
          const bp = String(prev.bp || '100/60').split('/');
          const sys = parseInt(bp[0]) || 100;
          const dia = parseInt(bp[1]) || 60;
          if (sys < 120) {
            // Bigger improvement when BP is very low
            const deficit = 120 - sys;
            const sysImprove = deficit > 50 ? Math.floor(Math.random() * 10 + 8)  // Severe shock: +8-18
                             : deficit > 25 ? Math.floor(Math.random() * 6 + 4)   // Moderate: +4-10
                             : Math.floor(Math.random() * 4 + 2);                  // Mild: +2-6
            const diaImprove = Math.floor(sysImprove * 0.5);
            const newSys = Math.min(125, sys + sysImprove);
            const newDia = Math.min(80, dia + diaImprove);
            updated.bp = `${newSys}/${newDia}`;
            changed = true;
          }
          // Fluid resuscitation reduces compensatory tachycardia (proportional to HR elevation)
          const hr = prev.pulse || 100;
          if (hr > 85) {
            const hrReduce = hr > 140 ? Math.floor(Math.random() * 8 + 5)  // Very tachy: -5-13
                           : hr > 110 ? Math.floor(Math.random() * 5 + 3)  // Moderate: -3-8
                           : Math.floor(Math.random() * 3 + 1);             // Mild: -1-4
            updated.pulse = Math.max(75, hr - hrReduce);
            changed = true;
          }
        }

        // Analgesics -> pain score decreases
        if (hasAnalgesic) {
          const pain = prev.painScore;
          if (pain !== undefined && pain > 2) {
            updated.painScore = Math.max(1, pain - Math.floor(Math.random() * 2 + 1));
            changed = true;
          }
          // Opioids depress RR
          if (hasOpioid) {
            const rr = prev.respiration || 16;
            if (rr > 10) {
              updated.respiration = Math.max(10, rr - 1);
              changed = true;
            }
          }
        }

        // Bronchodilators -> SpO2 improves, RR normalizes, EtCO2 normalizes
        if (hasBronchodilator) {
          if (!isInCardiacArrest) {
            const spo2 = prev.spo2 || 90;
            if (spo2 < 97) { updated.spo2 = Math.min(97, Math.round((spo2 + Math.random() * 1.5 + 0.5) * 10) / 10); changed = true; }
          }
          const rr = prev.respiration || 24;
          if (rr > 18) { updated.respiration = Math.max(16, rr - Math.floor(Math.random() * 2 + 1)); changed = true; }
          // HR may increase slightly with salbutamol
          const hr = prev.pulse || 80;
          if (hr < 110) { updated.pulse = Math.min(110, hr + Math.floor(Math.random() * 3 + 1)); changed = true; }
        }

        // Adrenaline/Epinephrine -> HR up, BP up (rapid onset)
        if (hasAdrenaline) {
          updated.pulse = Math.min(150, (prev.pulse || 80) + Math.floor(Math.random() * 8 + 5));
          const bp = String(prev.bp || '90/50').split('/');
          updated.bp = `${Math.min(160, (parseInt(bp[0]) || 90) + Math.floor(Math.random() * 12 + 8))}/${Math.min(95, (parseInt(bp[1]) || 50) + Math.floor(Math.random() * 4 + 2))}`;
          changed = true;
        }

        // Atropine -> HR increases
        if (hasAtropine) {
          updated.pulse = Math.min(120, (prev.pulse || 40) + Math.floor(Math.random() * 12 + 8));
          changed = true;
        }

        // Glucose/Dextrose -> BGL rises, GCS may improve
        if (hasGlucose) {
          const bgl = prev.bloodGlucose || 2.0;
          if (bgl < 6) { updated.bloodGlucose = Math.round(Math.min(8, bgl + Math.random() * 1.5 + 0.5) * 10) / 10; changed = true; }
          const gcs = prev.gcs || 10;
          if (gcs < 15) { updated.gcs = Math.min(15, gcs + Math.floor(Math.random() * 2 + 1)); changed = true; }
        }

        // Amiodarone -> HR decreases
        if (hasAmiodarone) {
          updated.pulse = Math.max(60, (prev.pulse || 120) - Math.floor(Math.random() * 8 + 5));
          changed = true;
        }

        // Adenosine -> brief asystole then reset (rapid effect)
        if (hasAdenosine) {
          updated.pulse = Math.max(50, Math.min(100, 60 + Math.floor(Math.random() * 20)));
          changed = true;
        }

        // GTN -> BP may decrease, pain may decrease
        if (hasGTN) {
          const bp = String(prev.bp || '140/90').split('/');
          const sys = parseInt(bp[0]) || 140;
          if (sys > 100) {
            updated.bp = `${Math.max(100, sys - Math.floor(Math.random() * 5 + 3))}/${Math.max(60, (parseInt(bp[1]) || 90) - Math.floor(Math.random() * 3 + 1))}`;
            changed = true;
          }
          const pain = prev.painScore;
          if (pain !== undefined && pain > 2) { updated.painScore = Math.max(1, pain - 1); changed = true; }
        }

        // Midazolam/Benzos -> RR may decrease, GCS may decrease
        if (hasMidazolam) {
          const rr = prev.respiration || 16;
          if (rr > 8) { updated.respiration = Math.max(8, rr - 2); changed = true; }
        }

        // Naloxone -> reverses opioid effects (RR increases, GCS improves)
        if (hasNaloxone) {
          const rr = prev.respiration || 6;
          if (rr < 14) { updated.respiration = Math.min(16, rr + Math.floor(Math.random() * 4 + 2)); changed = true; }
          const gcs = prev.gcs || 8;
          if (gcs < 15) { updated.gcs = Math.min(15, gcs + Math.floor(Math.random() * 3 + 2)); changed = true; }
          if (!isInCardiacArrest) {
            const spo2 = prev.spo2 || 85;
            if (spo2 < 96) { updated.spo2 = Math.min(97, spo2 + Math.random() * 3 + 1); changed = true; }
          }
        }

        return changed ? updated : prev;
      });
    };

    // Gradual onset - apply effects after 5-15 seconds
    const t1 = setTimeout(applyEffects, 5000 + Math.random() * 5000);
    const t2 = setTimeout(applyEffects, 15000 + Math.random() * 10000);
    const t3 = setTimeout(applyEffects, 30000 + Math.random() * 15000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [appliedTreatments.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // CARDIAC ARREST PHYSIOLOGY — EtCO2 and SpO2 alignment
  // During arrest: SpO2 unreliable (no perfusion), EtCO2 low (no cardiac output)
  // During CPR: EtCO2 rises to 15-25 (CPR quality indicator)
  // After ROSC: EtCO2 jumps >40, SpO2 gradually improves
  // ============================================================================
  const prevArrestActiveRef = useRef(cprState?.active ?? false);
  useEffect(() => {
    const arrestActive = cprState?.active === true;
    const cprRunning = cprState?.running === true;
    const justAchievedROSC = prevArrestActiveRef.current && !arrestActive;
    prevArrestActiveRef.current = arrestActive;

    if (justAchievedROSC) {
      // ROSC: EtCO2 jumps up (classic ROSC indicator), SpO2 begins gradual recovery
      setCurrentVitals(prev => ({
        ...prev,
        etco2: 38 + Math.floor(Math.random() * 10), // 38-47 mmHg post-ROSC
      }));
      // Gradual SpO2 recovery over ~15 seconds
      const roscRecovery = setInterval(() => {
        setCurrentVitals(prev => {
          const spo2 = prev.spo2 || 60;
          if (spo2 >= 94) {
            clearInterval(roscRecovery);
            return prev;
          }
          return { ...prev, spo2: Math.min(96, spo2 + Math.random() * 4 + 2) };
        });
      }, 3000);
      return () => clearInterval(roscRecovery);
    }

    if (!arrestActive) return;

    // During cardiac arrest: periodically enforce physiological values
    const arrestPhysiologyInterval = setInterval(() => {
      setCurrentVitals(prev => {
        const updated = { ...prev };
        if (cprRunning) {
          // CPR in progress: EtCO2 reflects CPR quality (15-25 mmHg)
          updated.etco2 = 15 + Math.floor(Math.random() * 11); // 15-25
          // SpO2 unreliable during CPR — show very low/unstable values
          updated.spo2 = 40 + Math.floor(Math.random() * 25); // 40-64% (unreliable)
        } else {
          // No CPR: EtCO2 very low (no cardiac output)
          updated.etco2 = 5 + Math.floor(Math.random() * 10); // 5-14 mmHg
          // SpO2 absent/very low without perfusion
          updated.spo2 = 20 + Math.floor(Math.random() * 20); // 20-39% (no reading)
        }
        return updated;
      });
    }, 4000);

    // Set initial arrest values immediately
    setCurrentVitals(prev => ({
      ...prev,
      etco2: cprRunning ? (15 + Math.floor(Math.random() * 11)) : (5 + Math.floor(Math.random() * 10)),
      spo2: cprRunning ? (40 + Math.floor(Math.random() * 25)) : (20 + Math.floor(Math.random() * 20)),
    }));

    return () => clearInterval(arrestPhysiologyInterval);
  }, [cprState?.active, cprState?.running]); // eslint-disable-line react-hooks/exhaustive-deps

  // LIFEPAK charge handler
  const handleCharge = () => {
    if (isCharging || monitorMode !== 'defib') return;
    setIsCharging(true);
    setIsCharged(false);
    if (audioEnabled && audioEngineRef.current) {
      audioEngineRef.current.playChargeSound();
    }
    logIntervention('CHARGE', `Charging to ${selectedEnergy}J${syncMode ? ' (SYNC)' : ''}`);
    setTimeout(() => {
      setIsCharging(false);
      setIsCharged(true);
      // Play sustained ready tone once charged
      if (audioEnabled && audioEngineRef.current) {
        audioEngineRef.current.playReadyTone();
      }
    }, 2500);
  };

  const handleShock = () => {
    if (!isCharged) return;
    if (audioEnabled && audioEngineRef.current) {
      audioEngineRef.current.stopReadyTone();
      audioEngineRef.current.playShockSound();
    }

    // Show shock delivered indicator
    setShockDelivered(true);
    setShockArtifact(true);
    setShockCount(prev => prev + 1);
    setIsCharged(false);

    // Log the intervention
    logIntervention(
      syncMode ? 'SYNC CARDIOVERSION' : 'DEFIBRILLATION',
      `${selectedEnergy}J delivered - Shock #${shockCount + 1}`
    );

    // Shock artifact on ECG (brief disturbance) - clears after 1.5s
    setTimeout(() => setShockArtifact(false), 1500);

    // "SHOCK DELIVERED" banner - shows for 4 seconds
    setTimeout(() => setShockDelivered(false), 4000);

    // Rhythm disturbance effect - briefly alter HR to simulate rhythm change
    setCurrentVitals(prev => {
      const updated = { ...prev };
      // Simulate post-shock rhythm change
      if (syncMode) {
        // Synchronized cardioversion - rhythm typically converts to slower rate
        updated.pulse = Math.max(60, Math.min(100, (prev.pulse || 150) - Math.floor(Math.random() * 40 + 30)));
      } else {
        // Defibrillation - brief asystole then rhythm change
        updated.pulse = Math.max(40, Math.min(110, 60 + Math.floor(Math.random() * 30)));
      }
      return updated;
    });
  };

  const handleEnergyUp = () => {
    const idx = ENERGY_OPTIONS.indexOf(selectedEnergy);
    if (idx < ENERGY_OPTIONS.length - 1) {
      setSelectedEnergy(ENERGY_OPTIONS[idx + 1]);
      setIsCharged(false);
      if (audioEngineRef.current) audioEngineRef.current.stopReadyTone();
    }
  };

  const handleEnergyDown = () => {
    const idx = ENERGY_OPTIONS.indexOf(selectedEnergy);
    if (idx > 0) {
      setSelectedEnergy(ENERGY_OPTIONS[idx - 1]);
      setIsCharged(false);
      if (audioEngineRef.current) audioEngineRef.current.stopReadyTone();
    }
  };

  const formatCodeTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render vital value for assessment panel
  const renderAssessButton = (key: string, label: string, methods: AssessmentMethod[]) => {
    const isVisible = visibleVitals.has(key);
    const isAssessing = activeAssessments.has(key);
    const progress = assessmentProgress.get(key) || 0;

    if (isVisible) {
      return (
        <div key={key} className="flex items-center justify-between px-2 py-1 bg-green-950/30 rounded border border-green-900/50">
          <span className="text-[10px] text-green-400 font-mono">{label}</span>
          <button
            onClick={() => hideVital(key)}
            className="text-[8px] text-gray-500 hover:text-red-400 font-mono"
          >
            HIDE
          </button>
        </div>
      );
    }

    if (isAssessing) {
      return (
        <div key={key} className="px-2 py-1 bg-blue-950/30 rounded border border-blue-900/50">
          <span className="text-[10px] text-blue-400 font-mono block">{label}</span>
          <Progress value={progress} className="h-1 mt-1" />
          <span className="text-[8px] text-blue-400/60 font-mono">{Math.round(progress)}%</span>
        </div>
      );
    }

    return (
      <div key={key} className="space-y-0.5">
        {methods.slice(0, 2).map((method) => (
          <button
            key={method.id}
            onClick={() => startAssessment(key, method)}
            className="block w-full text-left text-[9px] px-2 py-1 rounded
                       bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50
                       hover:border-gray-600/50 transition-colors text-gray-300 font-mono"
          >
            <span className="text-gray-400">{label}:</span> {method.name}
            <span className="text-gray-500 ml-1">({method.duration}s)</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="select-none">
      {/* ================================================================ */}
      {/* LIFEPAK 20 OUTER HOUSING                                        */}
      {/* ================================================================ */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #3a3d42 0%, #2a2d31 30%, #1e2024 60%, #2a2d31 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Top housing bar - brand area */}
        <div className="px-4 py-2 flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, #3a3d42 0%, #2e3136 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.4)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Power indicator LED */}
            <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
              alarmStatus.hasCritical
                ? 'bg-red-500 shadow-red-500/50 animate-pulse'
                : alarmStatus.hasWarning
                  ? 'bg-amber-400 shadow-amber-400/50 animate-pulse'
                  : 'bg-green-500 shadow-green-500/50'
            }`} />
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] text-gray-300"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                LIFEPAK<span className="text-[8px] align-super ml-0.5">&reg;</span> 20
              </span>
              <span className="text-[8px] text-gray-500 ml-2 tracking-wider">DEFIBRILLATOR/MONITOR</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Assessment mode badge */}
            {assessmentMode && (
              <Badge variant="outline" className="text-[8px] border-amber-600/50 text-amber-400 h-4 bg-amber-950/30">
                ASSESS MODE
              </Badge>
            )}
            {/* Mode selector */}
            <div className="flex rounded overflow-hidden border border-gray-600/50">
              {(['monitor', 'defib', 'pacer'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setMonitorMode(mode)}
                  className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-wider transition-colors ${
                    monitorMode === mode
                      ? mode === 'defib'
                        ? 'bg-red-700 text-white'
                        : mode === 'pacer'
                          ? 'bg-blue-700 text-white'
                          : 'bg-green-700 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* LCD SCREEN AREA - The actual monitor display                     */}
        {/* ================================================================ */}
        <div className="mx-3 my-2 rounded-lg overflow-hidden border-2 border-gray-800"
          style={{
            background: '#001000',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* Screen Header - Status Bar */}
          <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800/50"
            style={{ background: 'rgba(0,20,0,0.5)' }}>
            <div className="flex items-center gap-3">
              {/* Lead indicator */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-green-500/80">LEAD</span>
                <span className="text-[10px] font-mono font-bold text-green-400">{selectedLead}</span>
              </div>
              {/* Sweep speed */}
              <span className="text-[8px] font-mono text-gray-500">25mm/s</span>
              {/* Sync indicator */}
              {syncMode && (
                <span className="text-[8px] font-mono text-yellow-400 animate-pulse">SYNC</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Alarm indicator */}
              {alarmStatus.count > 0 && alarmsEnabled && (
                <span className={`text-[9px] font-mono font-bold animate-pulse ${
                  alarmStatus.hasCritical ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {alarmStatus.hasCritical ? 'ALARM' : 'ALERT'}
                </span>
              )}
              {/* Heart icon - flashes with each QRS */}
              <Heart
                className={`h-3 w-3 transition-all duration-75 ${
                  heartFlash && visibleVitals.has('pulse')
                    ? 'text-green-400 scale-110 fill-green-400'
                    : 'text-green-800 scale-100'
                }`}
              />
              {/* Clock */}
              <span className="text-[9px] font-mono text-gray-500">
                {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Main Screen Content */}
          <div className="flex">
            {/* ============================================================ */}
            {/* LEFT: Waveform Area (takes ~70% width)                       */}
            {/* ============================================================ */}
            <div className="flex-1 min-w-0">
              {/* ECG Waveform Channel */}
              <div className="relative">
                <div className="absolute top-1 left-2 z-10 flex items-center gap-1">
                  <span className="text-[9px] font-mono font-bold text-green-500/90">{selectedLead}</span>
                  <span className="text-[8px] font-mono text-green-500/50">ECG</span>
                </div>
                <ECGWaveform
                  heartRate={hrValue}
                  color="#00ff41"
                  height={70}
                  isVisible={visibleVitals.has('pulse')}
                  waveformFn={getWaveformForLead(selectedLead)}
                  showPacingSpikes={pacerActive && monitorMode === 'pacer'}
                  showShockArtifact={shockArtifact}
                  showSyncMarkers={syncMode && monitorMode === 'defib'}
                />
                {!visibleVitals.has('pulse') && (
                  <div className="h-[70px] flex items-center justify-center"
                    style={{ background: '#001000' }}>
                    {activeAssessments.has('pulse') ? (
                      <div className="text-center">
                        <span className="text-[10px] font-mono text-green-600 block">ACQUIRING ECG...</span>
                        <Progress value={assessmentProgress.get('pulse') || 0} className="h-1 w-24 mt-1" />
                      </div>
                    ) : (
                      <button
                        onClick={() => startAssessment('pulse', ASSESSMENT_METHODS.pulse[2])}
                        className="text-[10px] font-mono text-green-700 hover:text-green-500 transition-colors cursor-pointer"
                      >
                        LEADS OFF - TAP TO CONNECT
                      </button>
                    )}
                  </div>
                )}
                {/* 1mV calibration marker */}
                <div className="absolute bottom-1 right-2 text-[7px] font-mono text-green-500/40">
                  1mV
                </div>
              </div>

              {/* Channel Divider */}
              <div className="h-[3px]" style={{ background: 'linear-gradient(to right, rgba(0,40,0,0.5), rgba(0,60,0,0.3), rgba(0,40,0,0.5))' }} />

              {/* SpO2 Pleth Channel */}
              <div className="relative">
                <div className="absolute top-1 left-2 z-10 flex items-center gap-1">
                  <span className="text-[9px] font-mono font-bold text-cyan-400/90">Pleth</span>
                  <span className="text-[8px] font-mono text-cyan-400/50">SpO2</span>
                </div>
                <PlethWaveform
                  heartRate={hrValue}
                  spo2={spo2Value}
                  color="#00e5ff"
                  height={70}
                  isVisible={visibleVitals.has('spo2')}
                />
                {!visibleVitals.has('spo2') && (
                  <div className="h-[70px] flex items-center justify-center"
                    style={{ background: '#000810' }}>
                    {activeAssessments.has('spo2') ? (
                      <div className="text-center">
                        <span className="text-[10px] font-mono text-cyan-600 block">ACQUIRING SpO2...</span>
                        <Progress value={assessmentProgress.get('spo2') || 0} className="h-1 w-24 mt-1" />
                      </div>
                    ) : (
                      <button
                        onClick={() => startAssessment('spo2', ASSESSMENT_METHODS.spo2[0])}
                        className="text-[10px] font-mono text-cyan-700 hover:text-cyan-500 transition-colors cursor-pointer"
                      >
                        SENSOR OFF - TAP TO CONNECT
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Channel Divider */}
              <div className="h-[3px]" style={{ background: 'linear-gradient(to right, rgba(0,40,40,0.5), rgba(0,60,60,0.3), rgba(0,40,40,0.5))' }} />

              {/* EtCO2 Capnography Channel (if available) */}
              {etco2Value !== undefined && (
                <div className="relative">
                  <div className="absolute top-1 left-2 z-10 flex items-center gap-1">
                    <span className="text-[9px] font-mono font-bold text-fuchsia-400/90">CO2</span>
                    <span className="text-[8px] font-mono text-fuchsia-400/50">mmHg</span>
                  </div>
                  <CapnographyWaveform
                    respiratoryRate={rrValue}
                    etco2={etco2Value}
                    color="#ff66ff"
                    height={70}
                    isVisible={visibleVitals.has('etco2')}
                  />
                  {!visibleVitals.has('etco2') && (
                    <div className="h-[70px] flex items-center justify-center"
                      style={{ background: '#080010' }}>
                      {activeAssessments.has('etco2') ? (
                        <div className="text-center">
                          <span className="text-[10px] font-mono text-fuchsia-600 block">ACQUIRING CO2...</span>
                          <Progress value={assessmentProgress.get('etco2') || 0} className="h-1 w-24 mt-1" />
                        </div>
                      ) : (
                        <button
                          onClick={() => startAssessment('etco2', ASSESSMENT_METHODS.etco2[0])}
                          className="text-[10px] font-mono text-fuchsia-700 hover:text-fuchsia-500 transition-colors cursor-pointer"
                        >
                          CO2 OFF - TAP TO CONNECT
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* RIGHT: Numeric Values Panel (~30% width)                     */}
            {/* ============================================================ */}
            <div className="w-[140px] sm:w-[180px] border-l border-gray-800/50 flex flex-col"
              style={{ background: 'rgba(0,0,0,0.6)' }}>

              {/* HR - Heart Rate (Green) */}
              <div className={`px-3 py-1.5 border-b border-gray-800/30 ${
                getVitalAlarmState('pulse').isAlarm ? 'bg-red-950/40 animate-pulse' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-green-500/80">HR</span>
                  <span className="text-[7px] font-mono text-green-500/50">bpm</span>
                </div>
                <div className={`font-mono font-bold tracking-tight leading-none mt-0.5 ${
                  getVitalAlarmState('pulse').isAlarm
                    ? 'text-red-500 text-3xl sm:text-4xl'
                    : getVitalAlarmState('pulse').isWarning
                      ? 'text-amber-400 text-3xl sm:text-4xl'
                      : 'text-green-400 text-3xl sm:text-4xl'
                }`}>
                  {visibleVitals.has('pulse')
                    ? (currentRhythm.category === 'arrest' ? 0 : Math.round(currentVitals.pulse))
                    : '---'}
                </div>
              </div>

              {/* SpO2 (Cyan) */}
              <div className={`px-3 py-1.5 border-b border-gray-800/30 ${
                getVitalAlarmState('spo2').isAlarm ? 'bg-red-950/40 animate-pulse' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-cyan-400/80">SpO2</span>
                  <span className="text-[7px] font-mono text-cyan-400/50">%</span>
                </div>
                <div className={`font-mono font-bold tracking-tight leading-none mt-0.5 ${
                  getVitalAlarmState('spo2').isAlarm
                    ? 'text-red-500 text-3xl sm:text-4xl'
                    : getVitalAlarmState('spo2').isWarning
                      ? 'text-amber-400 text-3xl sm:text-4xl'
                      : 'text-cyan-400 text-3xl sm:text-4xl'
                }`}>
                  {visibleVitals.has('spo2') ? Math.round(currentVitals.spo2) : '---'}
                </div>
              </div>

              {/* NIBP - Blood Pressure (White/Red) */}
              <div className={`px-3 py-1.5 border-b border-gray-800/30 ${
                getVitalAlarmState('bp').isAlarm ? 'bg-red-950/40 animate-pulse' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-white/80">NIBP</span>
                  <span className="text-[7px] font-mono text-white/50">mmHg</span>
                </div>
                {visibleVitals.has('bp') ? (
                  <div className={`font-mono font-bold tracking-tight leading-none mt-0.5 text-xl sm:text-2xl ${
                    getVitalAlarmState('bp').isAlarm ? 'text-red-500' :
                    getVitalAlarmState('bp').isWarning ? 'text-amber-400' : 'text-white'
                  }`}>
                    {currentVitals.bp}
                  </div>
                ) : activeAssessments.has('bp') ? (
                  <div>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-white/30 mt-0.5">---/---</div>
                    <Progress value={assessmentProgress.get('bp') || 0} className="h-0.5 mt-1" />
                  </div>
                ) : (
                  <button
                    onClick={() => startAssessment('bp', ASSESSMENT_METHODS.bp[1])}
                    className="text-xl sm:text-2xl font-mono font-bold text-white/20 mt-0.5 cursor-pointer hover:text-white/40 transition-colors"
                  >
                    ---/---
                  </button>
                )}
              </div>

              {/* RR - Respiratory Rate (Yellow) */}
              <div className={`px-3 py-1.5 border-b border-gray-800/30 ${
                getVitalAlarmState('respiration').isAlarm ? 'bg-red-950/40 animate-pulse' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-yellow-400/80">RR</span>
                  <span className="text-[7px] font-mono text-yellow-400/50">/min</span>
                </div>
                {visibleVitals.has('respiration') ? (
                  <div className={`font-mono font-bold tracking-tight leading-none mt-0.5 text-2xl sm:text-3xl ${
                    getVitalAlarmState('respiration').isAlarm
                      ? 'text-red-500'
                      : getVitalAlarmState('respiration').isWarning
                        ? 'text-amber-400'
                        : 'text-yellow-400'
                  }`}>
                    {Math.round(currentVitals.respiration)}
                  </div>
                ) : activeAssessments.has('respiration') ? (
                  <div>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-yellow-400/30 mt-0.5">---</div>
                    <Progress value={assessmentProgress.get('respiration') || 0} className="h-0.5 mt-1" />
                  </div>
                ) : (
                  <button
                    onClick={() => startAssessment('respiration', ASSESSMENT_METHODS.respiration[0])}
                    className="text-xl sm:text-2xl font-mono font-bold text-yellow-400/20 mt-0.5 cursor-pointer hover:text-yellow-400/40 transition-colors"
                  >
                    ---
                  </button>
                )}
              </div>

              {/* EtCO2 (Magenta/Pink) */}
              {etco2Value !== undefined && (
                <div className="px-3 py-1.5 border-b border-gray-800/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-fuchsia-400/80">EtCO2</span>
                    <span className="text-[7px] font-mono text-fuchsia-400/50">mmHg</span>
                  </div>
                  <div className={`font-mono font-bold tracking-tight leading-none mt-0.5 text-2xl sm:text-3xl ${
                    visibleVitals.has('etco2') ? 'text-fuchsia-400' : 'text-fuchsia-400/20'
                  }`}>
                    {visibleVitals.has('etco2') ? etco2Value : '---'}
                  </div>
                </div>
              )}

              {/* Temperature (Orange) */}
              {currentVitals.temperature !== undefined && (
                <div className={`px-3 py-1 border-b border-gray-800/30 ${
                  getVitalAlarmState('temperature').isAlarm ? 'bg-red-950/40 animate-pulse' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-orange-400/80">TEMP</span>
                    <span className="text-[7px] font-mono text-orange-400/50">&deg;C</span>
                  </div>
                  <div className={`font-mono font-bold tracking-tight leading-none mt-0.5 text-lg sm:text-xl ${
                    visibleVitals.has('temperature')
                      ? getVitalAlarmState('temperature').isAlarm ? 'text-red-500' : 'text-orange-400'
                      : 'text-orange-400/20'
                  }`}>
                    {visibleVitals.has('temperature') ? currentVitals.temperature?.toFixed(1) : '---'}
                  </div>
                </div>
              )}

              {/* GCS (White) */}
              {currentVitals.gcs !== undefined && (
                <div className={`px-3 py-1 border-b border-gray-800/30 ${
                  getVitalAlarmState('gcs').isAlarm ? 'bg-red-950/40 animate-pulse' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-gray-300/80">GCS</span>
                    <span className="text-[7px] font-mono text-gray-400/50">/15</span>
                  </div>
                  <div className={`font-mono font-bold tracking-tight leading-none mt-0.5 text-lg sm:text-xl ${
                    visibleVitals.has('gcs')
                      ? getVitalAlarmState('gcs').isAlarm ? 'text-red-500' : 'text-white'
                      : 'text-white/20'
                  }`}>
                    {visibleVitals.has('gcs') ? currentVitals.gcs : '---'}
                  </div>
                </div>
              )}

              {/* Blood Glucose (Purple) */}
              {currentVitals.bloodGlucose !== undefined && (
                <div className={`px-3 py-1 border-b border-gray-800/30 ${
                  getVitalAlarmState('bloodGlucose').isAlarm ? 'bg-red-950/40 animate-pulse' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-purple-400/80">BGL</span>
                    <span className="text-[7px] font-mono text-purple-400/50">mmol/L</span>
                  </div>
                  <div className={`font-mono font-bold tracking-tight leading-none mt-0.5 text-lg sm:text-xl ${
                    visibleVitals.has('bloodGlucose')
                      ? getVitalAlarmState('bloodGlucose').isAlarm ? 'text-red-500' : 'text-purple-400'
                      : 'text-purple-400/20'
                  }`}>
                    {visibleVitals.has('bloodGlucose') ? (typeof currentVitals.bloodGlucose === 'number' ? currentVitals.bloodGlucose.toFixed(1) : currentVitals.bloodGlucose) : '---'}
                  </div>
                </div>
              )}

              {/* Pain Score (Red/Pink) - Always visible for assessment */}
              <div className="px-3 py-1 border-b border-gray-800/30">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono font-bold text-rose-400/80">PAIN</span>
                  <span className="text-[7px] font-mono text-rose-400/50">/10</span>
                </div>
                {visibleVitals.has('painScore') ? (
                  <div className="font-mono font-bold tracking-tight leading-none mt-0.5 text-lg sm:text-xl text-rose-400">
                    {currentVitals.painScore}
                  </div>
                ) : activeAssessments.has('painScore') ? (
                  <div>
                    <div className="text-lg sm:text-xl font-mono font-bold text-rose-400/30 mt-0.5">---</div>
                    <Progress value={assessmentProgress.get('painScore') || 0} className="h-0.5 mt-1" />
                  </div>
                ) : (
                  <button
                    onClick={() => startAssessment('painScore', ASSESSMENT_METHODS.painScore[0])}
                    className="text-lg sm:text-xl font-mono font-bold text-rose-400/20 mt-0.5 cursor-pointer hover:text-rose-400/40 transition-colors"
                  >
                    ---
                  </button>
                )}
              </div>

              {/* Code Timer */}
              <div className="px-3 py-2 mt-auto" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono text-gray-500">CODE</span>
                  <button
                    onClick={() => {
                      if (codeTimerRunning) {
                        setCodeTimerRunning(false);
                      } else {
                        setCodeTimerSeconds(0);
                        setCodeTimerRunning(true);
                      }
                    }}
                    className="text-[8px] font-mono text-gray-400 hover:text-white cursor-pointer"
                  >
                    {codeTimerRunning ? 'STOP' : 'START'}
                  </button>
                </div>
                <div className={`text-xl sm:text-2xl font-mono font-bold tracking-wider leading-none mt-0.5 ${
                  codeTimerRunning ? 'text-yellow-300' : 'text-gray-600'
                }`}>
                  {formatCodeTimer(codeTimerSeconds)}
                </div>
              </div>
            </div>
          </div>

          {/* Screen Footer - Energy / Status */}
          {monitorMode === 'defib' && (
            <div className={`flex items-center justify-between px-3 py-1.5 border-t border-gray-800/50 ${
              shockArtifact ? 'bg-white/20' : ''
            }`}
              style={{ background: shockArtifact ? 'rgba(255,255,255,0.15)' : 'rgba(20,0,0,0.4)' }}>
              <div className="flex items-center gap-2">
                <Zap className={`h-3.5 w-3.5 ${shockArtifact ? 'text-white' : 'text-yellow-500'}`} />
                <span className="text-[10px] font-mono font-bold text-yellow-400">
                  {selectedEnergy}J
                </span>
                {syncMode && (
                  <span className="text-[9px] font-mono text-yellow-300 animate-pulse flex items-center gap-1">
                    SYNC
                    {/* Sync markers - small triangles indicating R-wave sync points */}
                    <span className="inline-flex gap-0.5">
                      <span className="w-1 h-1.5 bg-yellow-400 inline-block" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                      <span className="w-1 h-1.5 bg-yellow-400 inline-block" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                    </span>
                  </span>
                )}
                {shockCount > 0 && (
                  <span className="text-[8px] font-mono text-red-400/70">#{shockCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {shockArtifact && (
                  <span className="text-[10px] font-mono text-white font-bold">SHOCK DELIVERED</span>
                )}
                {isCharging && !shockArtifact && (
                  <span className="text-[10px] font-mono text-yellow-400 animate-pulse">CHARGING...</span>
                )}
                {isCharged && !shockArtifact && (
                  <span className="text-[10px] font-mono text-red-400 animate-pulse font-bold">CHARGED - READY</span>
                )}
              </div>
            </div>
          )}

          {/* Screen Footer - Pacer Status */}
          {monitorMode === 'pacer' && (
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-800/50"
              style={{ background: 'rgba(0,0,20,0.4)' }}>
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] font-mono font-bold text-blue-400">
                  {pacerActive ? 'PACING' : 'STANDBY'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-blue-300">{pacerRate}ppm</span>
                <span className="text-[9px] font-mono text-blue-300">{pacerOutput}mA</span>
                {pacerActive && pacerOutput >= 60 && (
                  <span className="text-[8px] font-mono text-green-400 animate-pulse">CAPTURE</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* PHYSICAL BUTTONS AREA                                           */}
        {/* ================================================================ */}
        <div className="px-3 py-2 space-y-2">

          {/* Top button row: LEAD, SIZE, ALARM, AUDIO, ASSESS */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Lead Select */}
            <LP20Button
              label="LEAD"
              sublabel={selectedLead}
              onClick={() => {
                const leads: ('I' | 'II' | 'III' | 'PADDLES')[] = ['I', 'II', 'III', 'PADDLES'];
                const idx = leads.indexOf(selectedLead);
                setSelectedLead(leads[(idx + 1) % leads.length]);
              }}
            />

            {/* Alarm */}
            <LP20Button
              label="ALARM"
              sublabel={alarmsEnabled ? 'ON' : 'OFF'}
              onClick={() => setAlarmsEnabled(!alarmsEnabled)}
              active={alarmsEnabled}
              variant={alarmStatus.hasCritical ? 'red' : alarmStatus.hasWarning ? 'yellow' : 'default'}
            />

            {/* Audio */}
            <LP20Button
              label="AUDIO"
              sublabel={audioEnabled ? 'ON' : 'MUTE'}
              onClick={() => setAudioEnabled(!audioEnabled)}
              active={audioEnabled}
              variant={audioEnabled ? 'green' : 'default'}
            />

            {/* Assess toggle */}
            <LP20Button
              label={assessmentMode ? 'SHOW ALL' : 'ASSESS'}
              sublabel={assessmentMode ? 'BYPASS' : 'MODE'}
              onClick={assessmentMode ? showAllVitals : hideAllVitals}
              variant="blue"
            />

            {/* 12-Lead ECG */}
            <LP20Button
              label="12-LEAD"
              sublabel="ECG"
              onClick={() => setShow12Lead(!show12Lead)}
              variant={show12Lead ? 'green' : 'default'}
              active={show12Lead}
            />

            {/* Expand assess panel */}
            <LP20Button
              label="VITALS"
              sublabel="PANEL"
              onClick={() => setShowAssessPanel(!showAssessPanel)}
              active={showAssessPanel}
            />
          </div>

          {/* Defib controls row (only in defib mode) */}
          {monitorMode === 'defib' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <LP20Button
                label="-"
                onClick={handleEnergyDown}
                size="small"
              />
              <div className="px-3 py-1 rounded bg-black/50 border border-gray-600/50">
                <span className="text-[8px] font-mono text-gray-400 block text-center">ENERGY</span>
                <span className="text-lg font-mono font-bold text-yellow-400 block text-center leading-tight">{selectedEnergy}J</span>
              </div>
              <LP20Button
                label="+"
                onClick={handleEnergyUp}
                size="small"
              />

              <LP20Button
                label="SYNC"
                onClick={() => setSyncMode(!syncMode)}
                active={syncMode}
                variant="yellow"
              />

              <LP20Button
                label="CHARGE"
                onClick={handleCharge}
                variant="yellow"
                disabled={isCharging}
                size="large"
              />

              <LP20Button
                label="SHOCK"
                onClick={handleShock}
                variant="red"
                disabled={!isCharged}
                size="large"
                className={isCharged ? 'animate-pulse ring-2 ring-red-400/60' : ''}
              />
            </div>
          )}

          {/* Pacer controls (only in pacer mode) */}
          {monitorMode === 'pacer' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Pacer Rate controls */}
              <LP20Button label="-" onClick={() => {
                const newRate = Math.max(30, pacerRate - 10);
                setPacerRate(newRate);
                if (pacerActive && pacerOutput >= 60) {
                  setCurrentVitals(prev => ({ ...prev, pulse: newRate }));
                }
              }} size="small" />
              <div className="px-2 py-1 rounded bg-black/50 border border-blue-600/50 min-w-[60px]">
                <span className="text-[7px] font-mono text-blue-400 block text-center">RATE</span>
                <span className="text-sm font-mono font-bold text-blue-300 block text-center leading-tight">{pacerRate}<span className="text-[7px] text-blue-500">ppm</span></span>
              </div>
              <LP20Button label="+" onClick={() => {
                const newRate = Math.min(180, pacerRate + 10);
                setPacerRate(newRate);
                if (pacerActive && pacerOutput >= 60) {
                  setCurrentVitals(prev => ({ ...prev, pulse: newRate }));
                }
              }} size="small" />

              {/* Pacer Output controls */}
              <LP20Button label="-" onClick={() => {
                const newOutput = Math.max(0, pacerOutput - 10);
                setPacerOutput(newOutput);
                if (pacerActive && newOutput < 60) {
                  // Lost capture - revert to intrinsic rate
                  logIntervention('PACER', `Output decreased to ${newOutput}mA - LOSS OF CAPTURE`);
                }
              }} size="small" />
              <div className="px-2 py-1 rounded bg-black/50 border border-blue-600/50 min-w-[60px]">
                <span className="text-[7px] font-mono text-blue-400 block text-center">OUTPUT</span>
                <span className="text-sm font-mono font-bold text-blue-300 block text-center leading-tight">{pacerOutput}<span className="text-[7px] text-blue-500">mA</span></span>
              </div>
              <LP20Button label="+" onClick={() => {
                const newOutput = Math.min(200, pacerOutput + 10);
                setPacerOutput(newOutput);
                if (pacerActive && newOutput >= 60) {
                  // Regained capture
                  setCurrentVitals(prev => ({ ...prev, pulse: pacerRate }));
                }
              }} size="small" />

              {/* Start/Stop Pacer */}
              <LP20Button
                label={pacerActive ? 'STOP' : 'START'}
                sublabel="PACER"
                onClick={() => {
                  const newState = !pacerActive;
                  setPacerActive(newState);
                  logIntervention('PACER', newState
                    ? `Pacing started - Rate: ${pacerRate}ppm, Output: ${pacerOutput}mA`
                    : 'Pacing stopped'
                  );
                  if (newState) {
                    // Pacing effect - set HR to pacer rate if output is sufficient (>= 60mA threshold)
                    if (pacerOutput >= 60) {
                      setCurrentVitals(prev => ({ ...prev, pulse: pacerRate }));
                    }
                  }
                }}
                variant={pacerActive ? 'red' : 'blue'}
                active={pacerActive}
                size="large"
              />
            </div>
          )}

          {/* NIBP Auto-cycle button (all modes) */}
          <div className="flex items-center gap-1.5">
            <LP20Button
              label="NIBP"
              sublabel={nibpCycling ? `q2min (${Math.floor(nibpCountdown / 60)}:${(nibpCountdown % 60).toString().padStart(2, '0')})` : 'CYCLE'}
              onClick={() => {
                const newState = !nibpCycling;
                setNibpCycling(newState);
                if (newState) {
                  logIntervention('NIBP', 'Auto-cycle started (q2min)');
                } else {
                  logIntervention('NIBP', 'Auto-cycle stopped');
                  setNibpCountdown(0);
                }
              }}
              variant={nibpCycling ? 'green' : 'default'}
              active={nibpCycling}
            />

            {/* Quick single NIBP measurement */}
            <LP20Button
              label="NIBP"
              sublabel="STAT"
              onClick={() => {
                if (!activeAssessments.has('bp')) {
                  startAssessment('bp', ASSESSMENT_METHODS.bp[1]);
                  logIntervention('NIBP', 'STAT measurement initiated');
                }
              }}
              variant="default"
              disabled={activeAssessments.has('bp')}
            />

            {/* Show intervention log */}
            {interventionLog.length > 0 && (
              <div className="ml-auto flex items-center gap-1">
                <span className="text-[8px] font-mono text-gray-500">{interventionLog.length} events logged</span>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* CPR MANAGEMENT — integrated into monitor display               */}
        {/* ================================================================ */}
        {cprState?.active && (
          <div className="mx-3 mb-2 p-2 rounded-lg border border-red-600/60"
            style={{ background: 'rgba(80,0,0,0.5)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-red-400 font-bold tracking-wider animate-pulse">
                ● CARDIAC ARREST
              </span>
              <span className="text-[10px] font-mono text-red-300">
                Cycle {cprState.cycleNumber} | Shocks: {cprState.shockCount}
              </span>
            </div>

            {/* CPR Timer */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex-1 text-center py-1.5 rounded font-mono text-lg font-bold ${
                cprState.timerSeconds <= 10 ? 'text-red-400 animate-pulse' : 'text-green-400'
              }`}
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(100,100,100,0.3)' }}>
                {Math.floor(cprState.timerSeconds / 60)}:{String(cprState.timerSeconds % 60).padStart(2, '0')}
              </div>
              <LP20Button
                label={cprState.running ? 'PAUSE' : 'START'}
                sublabel="CPR"
                onClick={() => cprState.running ? cprState.onPauseCPR() : cprState.onStartCPR()}
                variant={cprState.running ? 'red' : 'green'}
                active={cprState.running}
              />
              <LP20Button
                label="SHOCK"
                sublabel={`${cprState.shockCount}`}
                onClick={cprState.onDefibrillate}
                variant="red"
              />
            </div>

            {/* Drug timing indicators */}
            <div className="flex gap-1.5">
              <div className={`flex-1 text-center py-1 rounded text-[8px] font-mono ${
                cprState.lastAdrenalineTime && (Date.now() - cprState.lastAdrenalineTime) > 300000
                  ? 'text-red-300 bg-red-900/40 border border-red-600/50 animate-pulse'
                  : cprState.lastAdrenalineTime && (Date.now() - cprState.lastAdrenalineTime) > 180000
                  ? 'text-yellow-300 bg-yellow-900/30 border border-yellow-600/30'
                  : 'text-gray-400 bg-black/30 border border-gray-700/30'
              }`}>
                ADRENALINE: {cprState.adrenalineDoses}x
                {cprState.lastAdrenalineTime
                  ? ` (${Math.floor((Date.now() - cprState.lastAdrenalineTime) / 60000)}m)`
                  : cprState.shockCount >= 2 ? ' DUE' : ''}
              </div>
              <div className="flex-1 text-center py-1 rounded text-[8px] font-mono text-gray-400 bg-black/30 border border-gray-700/30">
                AMIODARONE: {cprState.amiodaroneDoses}/2
                {cprState.amiodaroneDoses === 0 && cprState.shockCount >= 3 ? ' DUE' : ''}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* EXPANDED ASSESSMENT PANEL (for non-monitor vitals)              */}
        {/* ================================================================ */}
        {showAssessPanel && assessmentMode && (
          <div className="mx-3 mb-2 p-2 rounded-lg border border-gray-700/50 space-y-1"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-gray-400 font-bold">ADDITIONAL PARAMETERS</span>
              <span className="text-[8px] font-mono text-gray-600">
                {visibleVitals.size}/{availableVitals.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {/* Temperature */}
              {currentVitals.temperature !== undefined && renderAssessButton('temperature', 'TEMP', ASSESSMENT_METHODS.temperature)}

              {/* GCS */}
              {currentVitals.gcs !== undefined && renderAssessButton('gcs', 'GCS', ASSESSMENT_METHODS.gcs)}

              {/* Blood Glucose */}
              {currentVitals.bloodGlucose !== undefined && renderAssessButton('bloodGlucose', 'BGL', ASSESSMENT_METHODS.glucose)}

              {/* BP (if not yet visible) */}
              {!visibleVitals.has('bp') && !activeAssessments.has('bp') && renderAssessButton('bp', 'NIBP', ASSESSMENT_METHODS.bp)}

              {/* Respiratory Rate */}
              {!visibleVitals.has('respiration') && !activeAssessments.has('respiration') && renderAssessButton('respiration', 'RR', ASSESSMENT_METHODS.respiration)}

              {/* Pain Score - always available for assessment */}
              {renderAssessButton('painScore', 'PAIN', ASSESSMENT_METHODS.painScore)}
            </div>

            {/* Visible vitals summary */}
            {visibleVitals.size > 0 && (
              <div className="mt-2 pt-1 border-t border-gray-800/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {currentVitals.temperature !== undefined && visibleVitals.has('temperature') && (
                    <div className="flex items-center justify-between px-2 py-1 rounded" style={{ background: 'rgba(255,153,51,0.1)' }}>
                      <span className="text-[9px] font-mono text-orange-400">TEMP</span>
                      <span className="text-sm font-mono font-bold text-orange-300">{currentVitals.temperature}&deg;</span>
                    </div>
                  )}
                  {currentVitals.gcs !== undefined && visibleVitals.has('gcs') && (
                    <div className={`flex items-center justify-between px-2 py-1 rounded ${
                      getVitalAlarmState('gcs').isAlarm ? 'animate-pulse' : ''
                    }`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <span className="text-[9px] font-mono text-gray-300">GCS</span>
                      <span className={`text-sm font-mono font-bold ${
                        getVitalAlarmState('gcs').isAlarm ? 'text-red-400' : 'text-white'
                      }`}>{currentVitals.gcs}/15</span>
                    </div>
                  )}
                  {currentVitals.bloodGlucose !== undefined && visibleVitals.has('bloodGlucose') && (
                    <div className={`flex items-center justify-between px-2 py-1 rounded ${
                      getVitalAlarmState('bloodGlucose').isAlarm ? 'animate-pulse' : ''
                    }`} style={{ background: 'rgba(204,153,255,0.1)' }}>
                      <span className="text-[9px] font-mono text-purple-300">BGL</span>
                      <span className={`text-sm font-mono font-bold ${
                        getVitalAlarmState('bloodGlucose').isAlarm ? 'text-red-400' : 'text-purple-300'
                      }`}>{currentVitals.bloodGlucose}</span>
                    </div>
                  )}
                  {visibleVitals.has('painScore') && (
                    <div className="flex items-center justify-between px-2 py-1 rounded" style={{ background: 'rgba(255,100,100,0.1)' }}>
                      <span className="text-[9px] font-mono text-red-300">PAIN</span>
                      <span className="text-sm font-mono font-bold text-red-300">{currentVitals.painScore ?? 0}/10</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 12-LEAD ECG DISPLAY                                            */}
        {/* ================================================================ */}
        {show12Lead && visibleVitals.has('pulse') && (
          <div className="mx-3 mb-2">
            <TwelveLeadECG
              rhythm={currentRhythm}
              heartRate={hrValue}
              onClose={() => setShow12Lead(false)}
            />
          </div>
        )}

        {/* ================================================================ */}
        {/* SHOCK DELIVERED OVERLAY                                         */}
        {/* ================================================================ */}
        {shockDelivered && (
          <div className="mx-3 mb-2 p-3 rounded-lg border-2 border-red-500 bg-red-950/80 animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div className="text-center">
                <span className="text-lg font-mono font-bold text-red-400 tracking-widest block">SHOCK DELIVERED</span>
                <span className="text-[10px] font-mono text-yellow-300 block mt-0.5">
                  {selectedEnergy}J {syncMode ? 'SYNCHRONIZED' : 'UNSYNCHRONIZED'} - Shock #{shockCount}
                </span>
              </div>
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Pacer active indicator */}
        {pacerActive && monitorMode === 'pacer' && (
          <div className="mx-3 mb-2 p-2 rounded border border-blue-500/60 bg-blue-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-blue-400">PACING ACTIVE</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-blue-300">Rate: {pacerRate}ppm</span>
                <span className="text-[9px] font-mono text-blue-300">Output: {pacerOutput}mA</span>
                {pacerOutput >= 60 ? (
                  <span className="text-[8px] font-mono text-green-400">CAPTURE</span>
                ) : (
                  <span className="text-[8px] font-mono text-red-400">NO CAPTURE</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TREATMENT EFFECT INDICATOR                                      */}
        {/* ================================================================ */}
        {treatmentEffectIndicator && (
          <div className="mx-3 mb-2 p-2 rounded border border-green-700/50 bg-green-950/30 animate-pulse">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-green-400" />
              <span className="text-[10px] font-mono font-bold text-green-400">TREATMENT APPLIED</span>
            </div>
            <span className="text-[9px] font-mono text-green-300/80 block mt-0.5">{treatmentEffectIndicator}</span>
            <span className="text-[8px] font-mono text-green-500/50 block mt-0.5">Monitoring for vital sign changes...</span>
          </div>
        )}

        {/* Rhythm identification banner */}
        {visibleVitals.has('pulse') && currentRhythm.id !== 'nsr' && (
          <div className={`mx-3 mb-2 p-2 rounded border ${
            currentRhythm.category === 'arrest' ? 'border-red-600/60 bg-red-950/40' :
            currentRhythm.category === 'stemi' ? 'border-orange-600/50 bg-orange-950/30' :
            currentRhythm.category === 'arrhythmia' ? 'border-yellow-600/50 bg-yellow-950/30' :
            'border-gray-600/50 bg-gray-950/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-yellow-400" />
                <span className={`text-[10px] font-mono font-bold ${
                  currentRhythm.category === 'arrest' ? 'text-red-400' :
                  currentRhythm.category === 'stemi' ? 'text-orange-400' :
                  'text-yellow-400'
                }`}>
                  RHYTHM: {currentRhythm.name.toUpperCase()}
                </span>
              </div>
              {currentRhythm.category === 'stemi' && (
                <button
                  onClick={() => setShow12Lead(true)}
                  className="text-[8px] font-mono text-green-400 hover:text-green-300 cursor-pointer"
                >
                  VIEW 12-LEAD
                </button>
              )}
            </div>
            <span className="text-[8px] font-mono text-gray-400 block mt-0.5">
              {currentRhythm.description}
            </span>
          </div>
        )}

        {/* ================================================================ */}
        {/* ALARM & DETERIORATION BAR                                       */}
        {/* ================================================================ */}
        {(alarmStatus.count > 0 || minutesElapsed >= 2) && (
          <div className="mx-3 mb-2 space-y-1">
            {/* Alarm Banner */}
            {alarmStatus.count > 0 && alarmsEnabled && (
              <div className={`p-2 rounded border ${
                alarmStatus.hasCritical
                  ? 'bg-red-950/60 border-red-700 animate-pulse'
                  : 'bg-amber-950/40 border-amber-700'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-3.5 w-3.5 ${alarmStatus.hasCritical ? 'text-red-400' : 'text-amber-400'}`} />
                  <span className={`text-[10px] font-mono font-bold ${alarmStatus.hasCritical ? 'text-red-400' : 'text-amber-400'}`}>
                    {alarmStatus.count} ALARM{alarmStatus.count > 1 ? 'S' : ''} ACTIVE
                  </span>
                </div>
              </div>
            )}

            {/* Deterioration Status */}
            {(() => {
              const status = getDeteriorationStatus(caseSeverity, minutesElapsed);
              const reassessmentInterval = getReassessmentInterval(caseSeverity);

              if (status.urgency === 'low' && minutesElapsed < 2) return null;

              const urgencyColors: Record<string, string> = {
                low: 'border-green-800/50 text-green-400',
                medium: 'border-yellow-800/50 text-yellow-400',
                high: 'border-orange-800/50 text-orange-400',
                extreme: 'border-red-700/50 text-red-400 animate-pulse'
              };

              return (
                <div className={`p-2 rounded border bg-black/40 ${urgencyColors[status.urgency]}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      <span className="text-[9px] font-mono font-bold">
                        {status.status.toUpperCase()}
                      </span>
                      {activeTreatments.length > 0 && (
                        <span className="text-[8px] opacity-60 font-mono">[TX]</span>
                      )}
                    </div>
                    <span className="text-[8px] font-mono opacity-50">
                      q{reassessmentInterval}min
                    </span>
                  </div>

                  {status.percentDeteriorated > 20 && (
                    <div className="mt-1">
                      <Progress value={status.percentDeteriorated} className="h-0.5" />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Active Assessments Banner */}
        {activeAssessments.size > 0 && (
          <div className="mx-3 mb-2 p-2 rounded border border-blue-800/50 bg-blue-950/30">
            <div className="flex items-center gap-2 text-blue-400">
              <Timer className="h-3 w-3 animate-pulse" />
              <span className="text-[9px] font-mono font-bold">
                {activeAssessments.size} ASSESSMENT{activeAssessments.size > 1 ? 'S' : ''} IN PROGRESS
              </span>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* INTERVENTION LOG                                               */}
        {/* ================================================================ */}
        {interventionLog.length > 0 && (
          <div className="mx-3 mb-2">
            <details className="group">
              <summary className="cursor-pointer flex items-center gap-2 px-2 py-1.5 rounded-t border border-gray-700/50 bg-gray-900/50 hover:bg-gray-800/50 transition-colors">
                <Timer className="h-3 w-3 text-gray-400" />
                <span className="text-[9px] font-mono font-bold text-gray-400">INTERVENTION LOG</span>
                <span className="text-[8px] font-mono text-gray-600 ml-auto">{interventionLog.length} events</span>
              </summary>
              <div className="border border-t-0 border-gray-700/50 rounded-b bg-black/40 max-h-[200px] overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800/50">
                      <th className="text-[7px] font-mono text-gray-500 text-left px-2 py-1 w-[70px]">TIME</th>
                      <th className="text-[7px] font-mono text-gray-500 text-left px-2 py-1 w-[90px]">ACTION</th>
                      <th className="text-[7px] font-mono text-gray-500 text-left px-2 py-1">DETAIL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...interventionLog].reverse().map((entry, i) => (
                      <tr key={i} className={`border-b border-gray-800/20 ${i === 0 ? 'bg-green-950/20' : ''}`}>
                        <td className="text-[8px] font-mono text-gray-400 px-2 py-0.5">{entry.time}</td>
                        <td className={`text-[8px] font-mono font-bold px-2 py-0.5 ${
                          entry.action.includes('SHOCK') || entry.action.includes('DEFIB') ? 'text-red-400' :
                          entry.action.includes('SYNC') ? 'text-yellow-400' :
                          entry.action.includes('PACER') ? 'text-blue-400' :
                          entry.action.includes('NIBP') ? 'text-white' :
                          'text-green-400'
                        }`}>{entry.action}</td>
                        <td className="text-[8px] font-mono text-gray-300 px-2 py-0.5">{entry.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        )}

        {/* Bottom housing bar */}
        <div className="px-4 py-1.5 flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, #2e3136 0%, #3a3d42 100%)',
            borderTop: '1px solid rgba(255,255,255,0.03)',
          }}
        >
          <span className="text-[8px] font-mono text-gray-500 tracking-wider">
            SIM TRAINER v2.0
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-mono text-gray-600">
              {visibleVitals.size}/{availableVitals.length} PARAMS
            </span>
            {shockCount > 0 && (
              <span className="text-[8px] font-mono text-red-500">
                <Zap className="h-2.5 w-2.5 inline" /> x{shockCount}
              </span>
            )}
            {audioEnabled && (
              <span className="text-[8px] font-mono text-green-600 flex items-center gap-1">
                <Volume2 className="h-2.5 w-2.5" /> ON
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VitalSignsMonitor;
