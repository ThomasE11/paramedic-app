/**
 * TLC Monitor — Defibrillator/Monitor Simulator
 *
 * iSimulate Training Unit-style layout with full hardware fidelity:
 * - Dark charcoal housing with green protective case accent
 * - Left sidebar: PRINT, CODE SUMMARY, TRANSMIT, 12 LEAD buttons + paper slot + speed dial
 * - Central LCD screen with parameter bar, waveforms, battery/timer indicators
 * - Bottom control panel: HOME SCREEN, EVENT, OPTIONS, ALARMS, NIBP, SYNC, SIZE, LEAD, ANALYZE, CPR
 * - Lead selectors (1, 2, 3), PAUSE, CURRENT, RATE, PACER, CHARGE, ENERGY SELECT, ON
 * - "TLC Monitor" vertical branding on right side
 * - Power ON/OFF with boot sequence
 * - PRINT: ECG strip on graph paper with printing sound
 * - Hospital-accurate beep/alarm sounds (IEC 60601-1-8)
 * - Assessment mode for student interaction
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
// LITFL ECG library — image URLs are mapped in RHYTHM_TO_LITFL_IMAGE below

// Map rhythm IDs to local 12-lead ECG reference images.
// Sourced from Life in the Fast Lane (litfl.com) ECG Library under their
// Creative Commons educational licence. Stored locally to avoid cross-origin
// blocking and ensure instant loading.
// When a LITFL image is not available, the system falls back to the
// programmatically generated 12-lead canvas display.
// Use Vite's BASE_URL so paths work on GitHub Pages or any subpath deployment
const BASE = import.meta.env.BASE_URL;

const RHYTHM_TO_LITFL_IMAGE: Record<string, string> = {
  // ----- Normal / Rate-based -----
  'nsr': `${BASE}images/ecg/nsr.jpg`,
  'sinus-tachy': `${BASE}images/ecg/sinus-tachy.jpg`,
  'sinus-brady': `${BASE}images/ecg/sinus-brady.jpg`,
  'pea': `${BASE}images/ecg/nsr.jpg`,  // PEA shows electrical activity (sinus) without pulse

  // ----- Arrhythmias -----
  'afib': `${BASE}images/ecg/afib.jpg`,
  'aflutter': `${BASE}images/ecg/aflutter.jpg`,
  'svt': `${BASE}images/ecg/svt.jpg`,
  'vt': `${BASE}images/ecg/vt.jpg`,
  'vfib': `${BASE}images/ecg/vfib.jpg`,
  'vfib-fine': `${BASE}images/ecg/vfib-fine.jpg`,
  'torsades': `${BASE}images/ecg/torsades.jpg`,
  'pacs': `${BASE}images/ecg/pacs.jpg`,
  'pvcs': `${BASE}images/ecg/pvcs.jpg`,

  // ----- STEMI / ACS -----
  'anterior-stemi': `${BASE}images/ecg/anterior-stemi.jpg`,
  'inferior-stemi': `${BASE}images/ecg/inferior-stemi.jpg`,
  'lateral-stemi': `${BASE}images/ecg/lateral-stemi.jpg`,
  'posterior-stemi': `${BASE}images/ecg/posterior-stemi.jpg`,

  // ----- Heart blocks -----
  'first-degree-block': `${BASE}images/ecg/first-degree-block.jpg`,
  'wenckebach': `${BASE}images/ecg/wenckebach.jpg`,
  'mobitz2': `${BASE}images/ecg/mobitz2.jpg`,
  'chb': `${BASE}images/ecg/chb.jpg`,

  // ----- Escape / slow rhythms -----
  'junctional': `${BASE}images/ecg/junctional.jpg`,
  'aivr': `${BASE}images/ecg/aivr.jpg`,

  // ----- Conduction / Other -----
  'wpw': `${BASE}images/ecg/wpw.jpg`,
  'lbbb': `${BASE}images/ecg/lbbb.jpg`,
  'rbbb': `${BASE}images/ecg/rbbb.png`,

  // ----- Metabolic -----
  'hyperkalemia': `${BASE}images/ecg/hyperkalemia.jpg`,
};

function getLitflImageForRhythm(rhythmId: string): string | null {
  return RHYTHM_TO_LITFL_IMAGE[rhythmId] || null;
}

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
  /** Vitals revealed by ABCDE assessment — auto-show on monitor without tap-to-connect */
  revealedVitals?: Set<string>;
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
  /** Called when a TLC Monitor assessment (BGL, pain, temp, 12-lead) completes — awards scoring credit */
  onAssessmentPerformed?: (stepId: string) => void;
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
// RHYTHM NAME NORMALIZER — maps ECG display names to engine short names
// ============================================================================

function normalizeRhythmName(displayName: string): string {
  const n = displayName.toLowerCase().trim();
  if (n.includes('ventricular fibrillation') || n.includes('fine ventricular fibrillation')) return 'Ventricular Fibrillation';
  if (n.includes('ventricular tachycardia') && !n.includes('supraventricular')) return 'Ventricular Tachycardia';
  if (n.includes('supraventricular') || n === 'svt') return 'SVT';
  if (n.includes('atrial flutter')) return 'Atrial Flutter';
  if (n.includes('atrial fibrillation')) return 'Atrial Fibrillation';
  if (n.includes('asystole')) return 'Asystole';
  if (n.includes('pulseless electrical') || n === 'pea') return 'PEA';
  if (n.includes('torsades')) return 'Torsades de Pointes';
  if (n.includes('normal sinus')) return 'Normal Sinus Rhythm';
  if (n.includes('sinus tachycardia')) return 'Sinus Tachycardia';
  if (n.includes('sinus bradycardia')) return 'Sinus Bradycardia';
  return displayName; // pass through for STEMI, blocks, etc.
}

// ============================================================================
// SPO2 RECOVERY PROFILES — condition-specific oxygen response
// ============================================================================

function getSpO2RecoveryProfile(
  caseCategory: string, caseSubcategory: string | undefined,
  caseTitle: string | undefined, treatments: string
): { rateMultiplier: number; ceiling: number } {
  const cat = (caseCategory || '').toLowerCase();
  const sub = (caseSubcategory || '').toLowerCase();
  const title = (caseTitle || '').toLowerCase();
  const tx = treatments.toLowerCase();

  // Carbon monoxide — SpO2 reads falsely high, minimal real improvement
  if (sub.includes('carbon monoxide') || title.includes('carbon monoxide') || sub.includes('co poisoning')) {
    return { rateMultiplier: 0.3, ceiling: 99 };
  }
  // Pneumothorax
  if (sub.includes('pneumothorax') || title.includes('pneumothorax')) {
    const decompressed = tx.includes('decompress') || tx.includes('needle') || tx.includes('chest drain');
    return decompressed ? { rateMultiplier: 0.8, ceiling: 97 } : { rateMultiplier: 0.1, ceiling: 85 };
  }
  // Asthma / COPD
  if (cat === 'respiratory' && (sub.includes('asthma') || sub.includes('copd') || title.includes('asthma') || title.includes('copd'))) {
    const hasBronchodilator = tx.includes('salbutamol') || tx.includes('ipratropium') || tx.includes('nebuli') || tx.includes('bronchodilator');
    return hasBronchodilator ? { rateMultiplier: 0.5, ceiling: 96 } : { rateMultiplier: 0.15, ceiling: 90 };
  }
  // Pulmonary edema
  if (sub.includes('pulmonary edema') || sub.includes('pulmonary oedema') || title.includes('pulmonary edema') || title.includes('flash pulmonary')) {
    const hasCPAP = tx.includes('cpap') || tx.includes('bipap') || tx.includes('niv');
    return hasCPAP ? { rateMultiplier: 0.6, ceiling: 95 } : { rateMultiplier: 0.25, ceiling: 88 };
  }
  // Pneumonia
  if (sub.includes('pneumonia') || title.includes('pneumonia')) {
    return { rateMultiplier: 0.4, ceiling: 94 };
  }
  // Simple hypoxia — trauma, seizure, overdose, drowning
  if (['trauma', 'neurological', 'toxicology'].includes(cat) || title.includes('seizure') || title.includes('drowning') || title.includes('overdose')) {
    return { rateMultiplier: 1.5, ceiling: 99 };
  }
  return { rateMultiplier: 1.0, ceiling: 98 };
}

// ============================================================================
// AUDIO ENGINE - Clinical monitor sounds
// ============================================================================

class ClinicalAudioEngine {
  private audioCtx: AudioContext | null = null;
  private heartbeatInterval: number | null = null;
  private bpInflateTimeout: number | null = null;
  private isPlaying = false;
  private _volume = 0.45;
  // SpO2-driven pitch: when set, heartbeat beep uses variable pitch like real pulse ox
  _currentSpo2: number | null = null;
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
        // Real pulse ox: pitch varies with SpO2 (400Hz at 70%, 950Hz at 100%)
        // When SpO2 not connected, use standard 1000Hz QRS beep
        const baseFreq = this._currentSpo2 != null
          ? 400 + ((Math.max(70, Math.min(100, this._currentSpo2)) - 70) / 30) * 550
          : 1000;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.value = baseFreq;
        osc1.type = 'sine';
        gain1.gain.setValueAtTime(this._volume * 0.5, ctx.currentTime);
        gain1.gain.setValueAtTime(this._volume * 0.5, ctx.currentTime + 0.03);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.1);

        // Harmonic overlay at 2x base frequency for crispness
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = baseFreq * 2;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(this._volume * 0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.06);
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
      const vol = this._volume;
      const now = ctx.currentTime;
      const totalSec = durationMs / 1000;

      // Phase timing: 60% inflate, 25% measure/deflate, 15% final deflation + beep
      const inflateEnd = totalSec * 0.60;
      const measureEnd = totalSec * 0.85;
      const fullEnd = totalSec;

      // --- Motor whir (continuous low hum during inflation) ---
      const motorOsc = ctx.createOscillator();
      const motorGain = ctx.createGain();
      const motorFilter = ctx.createBiquadFilter();
      motorOsc.type = 'sawtooth';
      motorOsc.frequency.setValueAtTime(45, now);
      motorOsc.frequency.linearRampToValueAtTime(75, now + inflateEnd);
      motorFilter.type = 'lowpass';
      motorFilter.frequency.value = 200;
      motorGain.gain.setValueAtTime(0, now);
      motorGain.gain.linearRampToValueAtTime(vol * 0.25, now + 0.3);
      motorGain.gain.setValueAtTime(vol * 0.25, now + inflateEnd - 0.2);
      motorGain.gain.linearRampToValueAtTime(0, now + inflateEnd);
      motorOsc.connect(motorFilter);
      motorFilter.connect(motorGain);
      motorGain.connect(ctx.destination);
      motorOsc.start(now);
      motorOsc.stop(now + inflateEnd);

      // --- Pump pulses (rhythmic "chuff-chuff" during inflation) ---
      const pumpCount = Math.floor(inflateEnd / 0.6);
      for (let p = 0; p < pumpCount; p++) {
        const pStart = now + p * 0.6;
        const pumpBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
        const pumpData = pumpBuf.getChannelData(0);
        for (let i = 0; i < pumpData.length; i++) {
          const t = i / ctx.sampleRate;
          const env = Math.exp(-t * 12) * Math.sin(Math.PI * t / 0.25);
          pumpData[i] = (
            Math.sin(2 * Math.PI * 80 * t) * 0.5 +
            Math.sin(2 * Math.PI * 160 * t) * 0.25 +
            (Math.random() - 0.5) * 0.6
          ) * env * vol * 0.4;
        }
        const pSrc = ctx.createBufferSource();
        pSrc.buffer = pumpBuf;
        const pFilt = ctx.createBiquadFilter();
        pFilt.type = 'lowpass';
        pFilt.frequency.value = 350;
        pSrc.connect(pFilt);
        pFilt.connect(ctx.destination);
        pSrc.start(pStart);
      }

      // --- Slow deflation hiss (during measurement phase) ---
      const hissLen = measureEnd - inflateEnd;
      const hissBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * hissLen), ctx.sampleRate);
      const hissData = hissBuf.getChannelData(0);
      for (let i = 0; i < hissData.length; i++) {
        const progress = i / hissData.length;
        const env = (1 - progress * 0.5) * 0.15;
        hissData[i] = (Math.random() - 0.5) * env * vol;
      }
      const hissSrc = ctx.createBufferSource();
      hissSrc.buffer = hissBuf;
      const hissFilt = ctx.createBiquadFilter();
      hissFilt.type = 'bandpass';
      hissFilt.frequency.value = 2000;
      hissFilt.Q.value = 0.5;
      hissSrc.connect(hissFilt);
      hissFilt.connect(ctx.destination);
      hissSrc.start(now + inflateEnd);

      // --- Final rapid deflation (short air release) ---
      const deflatLen = fullEnd - measureEnd - 0.3;
      if (deflatLen > 0) {
        const defBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * deflatLen), ctx.sampleRate);
        const defData = defBuf.getChannelData(0);
        for (let i = 0; i < defData.length; i++) {
          const env = Math.exp(-(i / ctx.sampleRate) * 6);
          defData[i] = (Math.random() - 0.5) * env * vol * 0.3;
        }
        const defSrc = ctx.createBufferSource();
        defSrc.buffer = defBuf;
        const defFilt = ctx.createBiquadFilter();
        defFilt.type = 'lowpass';
        defFilt.frequency.value = 1500;
        defSrc.connect(defFilt);
        defFilt.connect(ctx.destination);
        defSrc.start(now + measureEnd);
      }

      // --- Completion double-beep (monitor "done" tone) ---
      for (let b = 0; b < 2; b++) {
        const beepOsc = ctx.createOscillator();
        const beepGain = ctx.createGain();
        beepOsc.type = 'sine';
        beepOsc.frequency.value = 800;
        beepGain.gain.setValueAtTime(0, now + fullEnd - 0.25 + b * 0.15);
        beepGain.gain.linearRampToValueAtTime(vol * 0.35, now + fullEnd - 0.22 + b * 0.15);
        beepGain.gain.linearRampToValueAtTime(0, now + fullEnd - 0.12 + b * 0.15);
        beepOsc.connect(beepGain);
        beepGain.connect(ctx.destination);
        beepOsc.start(now + fullEnd - 0.25 + b * 0.15);
        beepOsc.stop(now + fullEnd + b * 0.15);
      }
    } catch {
      // Audio may not be available
    }
  }

  playAlarm(isCritical: boolean) {
    try {
      const ctx = this.getCtx();
      if (isCritical) {
        // IEC 60601-1-8 HIGH PRIORITY: ♩♩♩-♩♩ pattern (3 fast + pause + 2 fast)
        const pattern = [0, 0.12, 0.24, 0.48, 0.60];
        pattern.forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.type = 'square';
          const t = ctx.currentTime + offset;
          gain.gain.setValueAtTime(this._volume * 0.45, t);
          gain.gain.setValueAtTime(this._volume * 0.45, t + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          osc.start(t);
          osc.stop(t + 0.1);
        });
      } else {
        // MEDIUM PRIORITY: ♩♩♩ pattern (3 slower tones)
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 660;
          osc.type = 'sine';
          const t = ctx.currentTime + i * 0.22;
          gain.gain.setValueAtTime(this._volume * 0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.start(t);
          osc.stop(t + 0.18);
        }
      }
    } catch {
      // Audio may not be available
    }
  }

  playSpo2Beep(spo2: number) {
    try {
      const ctx = this.getCtx();
      // Real pulse ox: pitch drops as SpO2 drops (audible desaturation warning)
      // 100% = ~900Hz, 90% = ~600Hz, 80% = ~400Hz
      const freq = 400 + ((Math.max(70, Math.min(100, spo2)) - 70) / 30) * 550;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      // Softer, slightly longer tone than QRS beep
      gain.gain.setValueAtTime(this._volume * 0.18, ctx.currentTime);
      gain.gain.setValueAtTime(this._volume * 0.18, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio may not be available
    }
  }

  // TLC Monitor charge-up sound
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

  // TLC Monitor shock delivered sound
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

  // Printing sound — rhythmic mechanical dot-matrix ticking
  playPrintingSound(durationMs: number) {
    try {
      const ctx = this.getCtx();
      const tickInterval = 0.035; // seconds between ticks
      const ticks = Math.floor((durationMs / 1000) / tickInterval);
      for (let i = 0; i < ticks; i++) {
        const startTime = ctx.currentTime + i * tickInterval;
        // High-frequency click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        osc.frequency.value = 4000 + Math.random() * 1000;
        osc.type = 'square';
        gain.gain.setValueAtTime(this._volume * 0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.015);
        osc.start(startTime);
        osc.stop(startTime + 0.015);
        // Mechanical noise component
        const noise = ctx.createBufferSource();
        const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.008), ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let j = 0; j < noiseData.length; j++) noiseData[j] = (Math.random() - 0.5) * 0.3;
        noise.buffer = noiseBuffer;
        const nGain = ctx.createGain();
        noise.connect(nGain);
        nGain.connect(ctx.destination);
        nGain.gain.setValueAtTime(this._volume * 0.08, startTime);
        nGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.008);
        noise.start(startTime);
      }
    } catch { /* Audio may not be available */ }
  }

  // Power-on chime — ascending 3-tone sequence
  playPowerOnSound() {
    try {
      const ctx = this.getCtx();
      const tones = [523.25, 659.25, 783.99]; // C5, E5, G5
      tones.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const start = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(this._volume * 0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch { /* Audio may not be available */ }
  }

  // Rhythm analysis announcement tone — two-tone alert
  playAnalyzeSound() {
    try {
      const ctx = this.getCtx();
      [880, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const start = ctx.currentTime + i * 0.3;
        gain.gain.setValueAtTime(this._volume * 0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch { /* Audio may not be available */ }
  }

  // IEC 60601-1-8 compliant medical alarm patterns
  playMedicalAlarm(priority: 'high' | 'medium' | 'low') {
    try {
      const ctx = this.getCtx();
      if (priority === 'high') {
        // High priority: 5 rapid pulses (IEC pattern)
        const freq = 880;
        for (let i = 0; i < 5; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'square';
          const start = ctx.currentTime + i * 0.12;
          gain.gain.setValueAtTime(this._volume * 0.4, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
          osc.start(start);
          osc.stop(start + 0.08);
        }
      } else if (priority === 'medium') {
        // Medium priority: 3 pulses
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 660;
          osc.type = 'sine';
          const start = ctx.currentTime + i * 0.2;
          gain.gain.setValueAtTime(this._volume * 0.3, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
          osc.start(start);
          osc.stop(start + 0.15);
        }
      } else {
        // Low priority: single tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440;
        osc.type = 'sine';
        gain.gain.setValueAtTime(this._volume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch { /* Audio may not be available */ }
  }

  // Rhythm change alert — three ascending tones
  playRhythmChangeAlert() {
    try {
      const ctx = this.getCtx();
      const freqs = [600, 800, 1000];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(this._volume * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch { /* Audio may not be available */ }
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

function ECGWaveform({ heartRate, color, height = 80, isVisible, waveformFn, showPacingSpikes, showShockArtifact, showSyncMarkers, showCprArtifact }: {
  heartRate: number; color: string; height?: number; isVisible: boolean; waveformFn?: WaveformFn;
  showPacingSpikes?: boolean; showShockArtifact?: boolean; showSyncMarkers?: boolean; showCprArtifact?: boolean;
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

    // Real TLC Monitor 20: constant 25mm/s sweep speed
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

        // CPR artifact: large regular oscillations at ~100 compressions/min (1.67 Hz)
        // Modelled as a broad sine wave that dominates the ECG during active compressions
        if (showCprArtifact) {
          const cprFreq = 100 / 60; // compressions per second
          const cprPhase = (i / pixelsPerSec) * cprFreq;
          const cprWave = Math.sin(cprPhase * 2 * Math.PI) * 0.75
            + Math.sin(cprPhase * 2 * Math.PI * 2) * 0.15; // slight harmonic for realism
          // Blend: CPR artifact is dominant but underlying rhythm still faintly visible
          val = cprWave * 0.9 + val * 0.15;
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
  }, [heartRate, color, height, isVisible, waveformFn, !!showPacingSpikes, !!showShockArtifact, !!showSyncMarkers, !!showCprArtifact]); // eslint-disable-line react-hooks/exhaustive-deps

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
    ctx.fillText('UAE Paramedic Case Generator — TLC Monitor 20 Simulator', 8, totalH - 6);
    ctx.fillText(dateStr, totalW - 150, totalH - 6);

    return exportCanvas.toDataURL('image/png');
  };

  const handleDownload = () => {
    // Prefer LITFL image for download (clinically accurate), fall back to generated
    const litflImage = getLitflImageForRhythm(rhythm.id);
    if (litflImage) {
      // Open LITFL image in new tab for saving (cross-origin prevents direct download)
      window.open(litflImage, '_blank');
      return;
    }
    const dataUrl = generateImage();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `12-Lead-ECG-${rhythm.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePreview = () => {
    // Use LITFL 12-lead ECG image if available (clinically accurate reference ECGs)
    // Falls back to generated image only if LITFL doesn't have this rhythm
    const litflImage = getLitflImageForRhythm(rhythm.id);
    if (litflImage) {
      setPreviewDataUrl(litflImage);
      setShowPreview(true);
    } else {
      const dataUrl = generateImage();
      if (dataUrl) {
        setPreviewDataUrl(dataUrl);
        setShowPreview(true);
      }
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
// iSIMULATE-STYLE BUTTON COMPONENTS
// ============================================================================

// Dark physical button (top sidebar: PRINT, CODE SUMMARY, TRANSMIT, 12 LEAD)
function SideButton({ label, onClick, active = false, disabled = false }: {
  label: string; onClick?: () => void; active?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-sm font-mono font-bold text-[8px] tracking-wider uppercase select-none
        transition-all duration-100
        bg-gradient-to-b from-[#3a3d42] to-[#2a2d31] text-gray-300 border border-[#555]/60
        hover:from-[#4a4d52] hover:to-[#3a3d42] active:from-[#222] active:to-[#333]
        shadow-[0_2px_3px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]
        active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]
        ${active ? 'ring-1 ring-green-400/50 text-green-300' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {label}
    </button>
  );
}

// Control panel button (bottom: HOME SCREEN, EVENT, OPTIONS, etc.)
function ControlButton({ label, onClick, variant = 'dark', active = false, disabled = false, led, className = '' }: {
  label: string; onClick?: () => void;
  variant?: 'dark' | 'yellow' | 'red' | 'green' | 'orange';
  active?: boolean; disabled?: boolean; led?: 'green' | 'orange' | 'red' | 'off'; className?: string;
}) {
  const variants: Record<string, string> = {
    dark: 'bg-gradient-to-b from-[#4a4d52] to-[#3a3d40] text-gray-200 border-[#555]/50 hover:from-[#555] hover:to-[#444]',
    yellow: 'bg-gradient-to-b from-amber-500 to-amber-600 text-black border-amber-400/60 hover:from-amber-400 hover:to-amber-500',
    red: 'bg-gradient-to-b from-red-600 to-red-700 text-white border-red-500/60 hover:from-red-500 hover:to-red-600',
    green: 'bg-gradient-to-b from-green-600 to-green-700 text-white border-green-500/60 hover:from-green-500 hover:to-green-600',
    orange: 'bg-gradient-to-b from-orange-500 to-orange-600 text-white border-orange-400/60 hover:from-orange-400 hover:to-orange-500',
  };

  const ledColors: Record<string, string> = {
    green: 'bg-green-400 shadow-green-400/60',
    orange: 'bg-orange-400 shadow-orange-400/60',
    red: 'bg-red-500 shadow-red-500/60 animate-pulse',
    off: 'bg-gray-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative px-2 py-1.5 rounded-sm font-mono font-bold text-[7px] tracking-wider uppercase select-none
        transition-all duration-100 border
        shadow-[0_2px_3px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
        active:shadow-[inset_0_2px_3px_rgba(0,0,0,0.5)]
        ${variants[variant]}
        ${active ? 'ring-1 ring-white/30' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
    >
      {led && (
        <span className={`absolute -top-0.5 right-0.5 w-1.5 h-1.5 rounded-full shadow-sm ${ledColors[led]}`} />
      )}
      <span className="block leading-tight text-center">{label}</span>
    </button>
  );
}

// Legacy LP20Button — kept for internal use
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
// ECG PRINT STRIP COMPONENT — Graph paper with real-time printing
// ============================================================================

function ECGPrintStrip({ rhythm, heartRate, spo2, onClose, audioEngine }: {
  rhythm: ECGRhythm; heartRate: number; spo2: number; onClose: () => void; audioEngine: ClinicalAudioEngine | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);

  useEffect(() => {
    // Play printing sound
    audioEngine?.playPrintingSound(8000);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    let lastTime = performance.now();
    const pixelsPerSec = 87.5;
    const beatsPerSec = heartRate / 60;
    const pixelsPerBeat = pixelsPerSec / beatsPerSec;
    const smallSq = 4; // 1mm = 4px
    const largeSq = 20; // 5mm

    const ecgMidY = h * 0.3;
    const plethMidY = h * 0.7;

    const draw = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      posRef.current += pixelsPerSec * dt;

      // Clear with ECG paper background
      ctx.fillStyle = '#fff8f0';
      ctx.fillRect(0, 0, w, h);

      // Small grid
      ctx.strokeStyle = 'rgba(255, 180, 180, 0.45)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < h; y += smallSq) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      for (let x = 0; x < w; x += smallSq) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      // Large grid
      ctx.strokeStyle = 'rgba(220, 120, 120, 0.55)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += largeSq) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      for (let x = 0; x < w; x += largeSq) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      // Print boundary — only draw up to current position
      const printHead = Math.min(posRef.current, w);

      // ECG waveform (Lead II) — black on paper
      const wfn = rhythm.leads['II'];
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let first = true;
      let prevBP = 0;
      let bIdx = 0;
      for (let x = 0; x < printHead; x++) {
        const bp = (x / pixelsPerBeat) % 1;
        if (bp < prevBP && prevBP > 0.5) bIdx++;
        prevBP = bp;
        const val = wfn(bp, { heartRate, beatIndex: bIdx });
        const y = ecgMidY - val * (h * 0.2);
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // SpO2 pleth waveform — blue on paper
      const plethWave = (t: number): number => {
        if (t < 0.12) return Math.pow(t / 0.12, 1.8);
        if (t < 0.28) return 1.0 - Math.pow((t - 0.12) / 0.16, 0.7) * 0.45;
        if (t < 0.35) return 0.55 - Math.sin((t - 0.28) * Math.PI / 0.07) * 0.08;
        if (t < 0.45) return 0.50 + Math.sin((t - 0.35) * Math.PI / 0.10) * 0.08;
        if (t < 0.85) return 0.50 * Math.exp(-(t - 0.45) * 3.5);
        return 0.50 * Math.exp(-0.4 * 3.5) * Math.max(0, 1 - (t - 0.85) / 0.15);
      };

      ctx.strokeStyle = '#2255aa';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      first = true;
      prevBP = 0;
      bIdx = 0;
      for (let x = 0; x < printHead; x++) {
        const bp = (x / pixelsPerBeat) % 1;
        if (bp < prevBP && prevBP > 0.5) bIdx++;
        prevBP = bp;
        const val = plethWave(bp);
        const y = plethMidY - val * (h * 0.15);
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Channel labels (rotated on left side like iSimulate print)
      ctx.save();
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.translate(12, ecgMidY - 25);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('II', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#336';
      ctx.font = '10px monospace';
      ctx.translate(12, plethMidY - 25);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('SpO2', 0, 0);
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [rhythm, heartRate, spo2, audioEngine]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-4xl mx-4">
        {/* Close button */}
        <button onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
          <X className="h-4 w-4" />
        </button>
        {/* Labels */}
        <div className="flex items-center gap-4 mb-2 px-2">
          <span className="text-[10px] font-mono text-gray-400">CO2</span>
          <span className="text-[10px] font-mono text-blue-400">SpO2</span>
          <span className="text-[10px] font-mono text-gray-300">II</span>
        </div>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={300}
          className="w-full rounded border border-gray-600"
          style={{ imageRendering: 'crisp-edges' }}
        />
        <div className="flex items-center justify-between mt-2 px-2">
          <span className="text-[9px] font-mono text-gray-500">25mm/s | 10mm/mV</span>
          <span className="text-[9px] font-mono text-gray-500">TLC Monitor ECG Strip</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN TLC MONITOR COMPONENT
// ============================================================================

// Map vital keys to scoring framework assessment step IDs
const VITAL_KEY_TO_STEP_ID: Record<string, string> = {
  bloodGlucose: 'blood-glucose',
  painScore: 'pain-assessment',
  temperature: 'temperature',
};

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
  revealedVitals,
  cprState,
  onAssessmentPerformed,
}: VitalSignsMonitorProps) {
  const [currentVitals, setCurrentVitals] = useState<VitalSigns>(initialVitals);
  const [visibleVitals, setVisibleVitals] = useState<Set<string>>(new Set());
  const [assessmentMode, setAssessmentMode] = useState(true);
  const [activeAssessments, setActiveAssessments] = useState<Map<string, { startTime: number; duration: number }>>(new Map());
  const [assessmentProgress, setAssessmentProgress] = useState<Map<string, number>>(new Map());
  const [alarmsEnabled, setAlarmsEnabled] = useState(true); // Alarms ON by default
  const [activeAlarms, setActiveAlarms] = useState<Set<string>>(new Set());
  const [audioEnabled, setAudioEnabled] = useState(true); // Audio ON by default for realistic experience
  // Track which assessment step IDs have already been reported to prevent repeated calls
  const reportedAssessmentsRef = useRef(new Set<string>());
  // Snapshot of vitals at last assessment — display these instead of live values
  // so BP/SpO2/etc. don't change on-screen until the student re-assesses
  const [assessedVitals, setAssessedVitals] = useState<Partial<VitalSigns>>({});

  // Sync externally revealed vitals (from ABCDE assessments) into visibleVitals
  useEffect(() => {
    if (!revealedVitals || revealedVitals.size === 0) return;
    if (!assessmentMode) {
      // Only auto-reveal when assessment mode is off (bypass mode)
      setVisibleVitals(prev => {
        const next = new Set(prev);
        let changed = false;
        revealedVitals.forEach(v => {
          if (!next.has(v)) { next.add(v); changed = true; }
        });
        return changed ? next : prev;
      });
    }
  }, [revealedVitals, assessmentMode]);

  // TLC Monitor-specific states
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
  // Rhythm override from shock outcomes (takes priority over parent prop)
  const [localRhythmOverride, setLocalRhythmOverride] = useState<string | null>(null);
  const [shockFeedbackMessage, setShockFeedbackMessage] = useState<{ text: string; severity: 'critical' | 'success' | 'warning' } | null>(null);
  const shockCountRef = useRef(0);

  // TLC Monitor states
  const [powerOn, setPowerOn] = useState(true);
  const [bootPhase, setBootPhase] = useState<'off' | 'booting' | 'ready'>('ready');
  const [printMode, setPrintMode] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [waveformGain, setWaveformGain] = useState<0.5 | 1.0 | 1.5 | 2.0>(1.0);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [sweepPaused, setSweepPaused] = useState(false);
  const [showCodeSummary, setShowCodeSummary] = useState(false);
  const [aedMode, setAedMode] = useState(false);
  const [nibpMode, setNibpMode] = useState<'manual' | 'auto'>('manual');
  const [showNibpMenu, setShowNibpMenu] = useState(false);
  const [show12LeadImage, setShow12LeadImage] = useState(false); // Show LITFL image-based 12-lead

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

  // Auto-clear shock feedback message after 8 seconds
  useEffect(() => {
    if (!shockFeedbackMessage) return;
    const t = setTimeout(() => setShockFeedbackMessage(null), 8000);
    return () => clearTimeout(t);
  }, [shockFeedbackMessage]);

  // ECG Rhythm - from override (dynamic patient state) or case category
  // Clear local rhythm override when parent sends a new one (parent takes priority)
  useEffect(() => {
    if (overrideRhythm) setLocalRhythmOverride(null);
  }, [overrideRhythm]);

  const currentRhythm = useMemo<ECGRhythm>(() => {
    const hr = parseInt(String(currentVitals.pulse)) || 75;
    // Local override (from handleShock) takes priority, then parent prop
    const effectiveOverride = localRhythmOverride || overrideRhythm;
    if (effectiveOverride) {
      if (RHYTHM_MAP[effectiveOverride]) return RHYTHM_MAP[effectiveOverride];
      const byName = ALL_RHYTHMS.find(r => r.name.toLowerCase() === effectiveOverride.toLowerCase());
      if (byName) return byName;
      const lowerOverride = effectiveOverride.toLowerCase();
      if (lowerOverride === 'sinus rhythm' || lowerOverride === 'normal sinus rhythm') return RHYTHM_MAP['nsr'];
      // STEMI rhythms must be checked BEFORE generic "sinus tachycardia" to avoid substring match
      if (lowerOverride.includes('anterior stemi') || lowerOverride === 'stem-anterior') return RHYTHM_MAP['anterior-stemi'];
      if (lowerOverride.includes('inferior stemi') || lowerOverride === 'stem-inferior') return RHYTHM_MAP['inferior-stemi'];
      if (lowerOverride.includes('lateral stemi') || lowerOverride === 'stem-lateral') return RHYTHM_MAP['lateral-stemi'];
      if (lowerOverride === 'nstemi' || lowerOverride.includes('non-st elevation')) return RHYTHM_MAP['nstemi'];
      // Conduction blocks
      if (lowerOverride.includes('complete heart block') || lowerOverride.includes('3rd degree') || lowerOverride.includes('third degree')) return RHYTHM_MAP['chb'];
      if (lowerOverride.includes('wenckebach') || lowerOverride.includes('mobitz type i')) return RHYTHM_MAP['wenckebach'];
      if (lowerOverride.includes('mobitz type ii') || lowerOverride.includes('mobitz 2')) return RHYTHM_MAP['mobitz2'];
      if (lowerOverride.includes('first degree block') || lowerOverride.includes('1st degree')) return RHYTHM_MAP['first-degree-block'];
      if (lowerOverride.includes('junctional')) return RHYTHM_MAP['junctional'];
      if (lowerOverride === 'lbbb' || lowerOverride.includes('left bundle branch')) return RHYTHM_MAP['lbbb'];
      if (lowerOverride === 'rbbb' || lowerOverride.includes('right bundle branch')) return RHYTHM_MAP['rbbb'];
      if (lowerOverride.includes('sinus tachycardia')) return RHYTHM_MAP['sinus-tachy'];
      if (lowerOverride.includes('sinus bradycardia')) return RHYTHM_MAP['sinus-brady'];
      if (lowerOverride.includes('ventricular fibrillation')) return RHYTHM_MAP['vfib'];
      if (lowerOverride.includes('asystole')) return RHYTHM_MAP['asystole'];
      const overrideResult = getRhythmForCase('cardiac', effectiveOverride, hr, effectiveOverride);
      return overrideResult;
    }
    return getRhythmForCase(caseCategory || 'general', caseSubcategory, hr, caseTitle, ecgFindings);
  }, [caseCategory, caseSubcategory, currentVitals.pulse, caseTitle, ecgFindings, overrideRhythm, localRhythmOverride]);

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

  // Manage heartbeat sound — pitch varies with SpO2 when probe connected (like real pulse ox)
  useEffect(() => {
    if (!audioEngineRef.current) return;

    // Set SpO2 pitch: when SpO2 probe is connected, heartbeat beep pitch varies with saturation
    audioEngineRef.current._currentSpo2 = visibleVitals.has('spo2') ? (currentVitals.spo2 || 98) : null;

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
  }, [audioEnabled, visibleVitals, currentVitals.pulse, currentVitals.spo2, currentRhythm.category]);

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
    const gcs = Math.min(15, Math.max(3, Math.round(currentVitals.gcs || 15)));
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

  // Deterioration timer — DISABLED: StudentPanel runs its own deterioration via dynamicTreatmentEngine
  // which is more sophisticated (case-specific, staged). Running both caused double deterioration.
  // This timer only tracks elapsed minutes for display purposes now.
  useEffect(() => {
    deteriorationTimerRef.current = window.setInterval(() => {
      setMinutesElapsed(prev => prev + 1);
    }, 60000);

    return () => {
      if (deteriorationTimerRef.current) clearInterval(deteriorationTimerRef.current);
    };
  }, []);

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

        // If assessments completed but values were not in initial vitals, set clinically appropriate defaults
        if (completed.includes('painScore') && currentVitals.painScore === undefined) {
          setCurrentVitals(prev => ({ ...prev, painScore: 0 }));
        }
        if (completed.includes('bloodGlucose') && currentVitals.bloodGlucose === undefined) {
          setCurrentVitals(prev => ({ ...prev, bloodGlucose: 5.5 })); // Normal BGL default
        }
        if (completed.includes('gcs') && currentVitals.gcs === undefined) {
          setCurrentVitals(prev => ({ ...prev, gcs: 15 })); // Normal GCS default
        }

        // Snapshot current vital values at time of assessment — display freezes until re-assessed
        setAssessedVitals(prev => {
          const next = { ...prev };
          completed.forEach(key => {
            if (key === 'bp') next.bp = currentVitals.bp;
            if (key === 'pulse') next.pulse = currentVitals.pulse;
            if (key === 'spo2') next.spo2 = currentVitals.spo2;
            if (key === 'respiration') next.respiration = currentVitals.respiration;
            if (key === 'temperature') next.temperature = currentVitals.temperature;
            if (key === 'bloodGlucose') next.bloodGlucose = currentVitals.bloodGlucose;
            if (key === 'gcs') next.gcs = currentVitals.gcs;
            if (key === 'painScore') next.painScore = currentVitals.painScore ?? 0;
            if (key === 'etco2') next.etco2 = currentVitals.etco2;
          });
          return next;
        });

        // Award assessment scoring credit for BGL, pain, and temperature via TLC Monitor
        // Guard: only fire onAssessmentPerformed once per stepId to prevent repeated prompts
        if (onAssessmentPerformed) {
          completed.forEach(key => {
            const stepId = VITAL_KEY_TO_STEP_ID[key];
            if (stepId && !reportedAssessmentsRef.current.has(stepId)) {
              reportedAssessmentsRef.current.add(stepId);
              onAssessmentPerformed(stepId);
            }
          });
        }

        // SpO2 tone now continuous via heartbeat pitch variation — no one-shot beep needed
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

  const startAssessment = useCallback((vitalKey: string, method: AssessmentMethod, forceRecycle?: boolean) => {
    // Allow BP to re-cycle even if already visible (re-measurement)
    if (activeAssessments.has(vitalKey)) return;
    if (visibleVitals.has(vitalKey) && !forceRecycle) return;

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
    // Bolus drugs — check ALL treatments, but only apply once per new treatment (see bolusApplied flag below)
    const hasAdrenaline = allTx.includes('adrenaline') || allTx.includes('epinephrine');
    const hasAtropine = allTx.includes('atropine');
    const hasGlucose = allTx.includes('glucose') || allTx.includes('dextrose') || allTx.includes('glucagon');
    const hasAmiodarone = allTx.includes('amiodarone');
    const hasAdenosine = allTx.includes('adenosine');
    const hasGTN = allTx.includes('gtn') || allTx.includes('nitroglycerin') || allTx.includes('nitro');
    const hasAntiemetic = allTx.includes('ondansetron') || allTx.includes('metoclopramide') || allTx.includes('antiemetic');
    const hasMidazolam = allTx.includes('midazolam') || allTx.includes('diazepam') || allTx.includes('lorazepam');
    const hasNaloxone = allTx.includes('naloxone') || allTx.includes('narcan');
    const hasAspirin = allTx.includes('aspirin');

    // Track whether bolus effects have already fired for this treatment set
    // Bolus drugs should apply their effect 1-2 times, not on every interval tick
    let bolusApplied = false;

    // During cardiac arrest, treatment effects on SpO2 are meaningless (no perfusion)
    const isInCardiacArrest = cprState?.active === true;

    // === MAINTENANCE EFFECTS (run on every interval tick — ongoing treatments) ===
    const applyMaintenanceEffects = () => {
      setCurrentVitals(prev => {
        const updated = { ...prev };
        let changed = false;

        // Oxygen therapy -> SpO2 gradually rises (condition-specific recovery)
        if (hasOxygen && !isInCardiacArrest) {
          const currentSpo2 = prev.spo2 || 92;
          const profile = getSpO2RecoveryProfile(caseCategory || '', caseSubcategory, caseTitle, allTx);
          if (currentSpo2 < profile.ceiling) {
            const deficit = profile.ceiling - currentSpo2;
            const baseImprovement = deficit > 30 ? Math.random() * 8 + 6
                              : deficit > 15 ? Math.random() * 5 + 3
                              : deficit > 5  ? Math.random() * 3 + 1.5
                              : Math.random() * 1.5 + 0.5;
            const improvement = baseImprovement * profile.rateMultiplier;
            updated.spo2 = Math.min(profile.ceiling, Math.round((currentSpo2 + improvement) * 10) / 10);
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
        if (hasFluid) {
          const bp = String(prev.bp || '100/60').split('/');
          const sys = parseInt(bp[0]) || 100;
          const dia = parseInt(bp[1]) || 60;
          if (sys < 120) {
            const deficit = 120 - sys;
            const sysImprove = deficit > 50 ? Math.floor(Math.random() * 10 + 8)
                             : deficit > 25 ? Math.floor(Math.random() * 6 + 4)
                             : Math.floor(Math.random() * 4 + 2);
            const diaImprove = Math.floor(sysImprove * 0.5);
            const newSys = Math.min(125, sys + sysImprove);
            const newDia = Math.min(80, dia + diaImprove);
            updated.bp = `${newSys}/${newDia}`;
            changed = true;
          }
          const hr = prev.pulse || 100;
          if (hr > 85) {
            const hrReduce = hr > 140 ? Math.floor(Math.random() * 8 + 5)
                           : hr > 110 ? Math.floor(Math.random() * 5 + 3)
                           : Math.floor(Math.random() * 3 + 1);
            updated.pulse = Math.max(75, hr - hrReduce);
            changed = true;
          }
        }

        // Analgesics -> pain score decreases (ongoing absorption)
        if (hasAnalgesic) {
          const pain = prev.painScore;
          if (pain !== undefined && pain > 2) {
            updated.painScore = Math.max(1, pain - Math.floor(Math.random() * 2 + 1));
            changed = true;
          }
          // Opioids depress RR (ongoing effect while active)
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
          // EtCO2 normalizes with effective bronchodilation (trapped CO2 released)
          const etco2 = prev.etco2;
          if (etco2 !== undefined && etco2 > 40) {
            updated.etco2 = Math.max(35, etco2 - Math.floor(Math.random() * 3 + 1));
            changed = true;
          }
        }

        // GTN -> BP may decrease, pain may decrease (ongoing patch/infusion effect)
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

        // Aspirin -> mild pain reduction for cardiac chest pain (ongoing)
        if (hasAspirin) {
          const pain = prev.painScore;
          if (pain !== undefined && pain > 3) { updated.painScore = Math.max(2, pain - 1); changed = true; }
        }

        // Active warming -> temperature gradually increases for hypothermic patients
        const hasWarming = allTx.includes('warm') || allTx.includes('blanket') || allTx.includes('bair hugger') || allTx.includes('heating');
        if (hasWarming) {
          const temp = prev.temperature || 36.5;
          if (temp < 36.5) {
            updated.temperature = Math.round(Math.min(37, temp + Math.random() * 0.3 + 0.1) * 10) / 10;
            changed = true;
          }
        }

        // Active cooling -> temperature gradually decreases for hyperthermic patients
        const hasCooling = allTx.includes('cool') || allTx.includes('ice') || allTx.includes('cold') || allTx.includes('ttm') || allTx.includes('targeted temperature');
        if (hasCooling) {
          const temp = prev.temperature || 37;
          if (temp > 37.5) {
            updated.temperature = Math.round(Math.max(36, temp - Math.random() * 0.3 - 0.1) * 10) / 10;
            changed = true;
          }
        }

        return changed ? updated : prev;
      });
    };

    // === BOLUS EFFECTS (fire once per new treatment application — immediate-onset drugs) ===
    const applyBolusEffects = () => {
      if (bolusApplied) return;
      bolusApplied = true;

      setCurrentVitals(prev => {
        const updated = { ...prev };
        let changed = false;

        // Adrenaline/Epinephrine -> HR up, BP up (rapid onset, wears off in 3-5 min)
        if (hasAdrenaline) {
          updated.pulse = Math.min(150, (prev.pulse || 80) + Math.floor(Math.random() * 8 + 5));
          const bp = String(prev.bp || '90/50').split('/');
          updated.bp = `${Math.min(160, (parseInt(bp[0]) || 90) + Math.floor(Math.random() * 12 + 8))}/${Math.min(95, (parseInt(bp[1]) || 50) + Math.floor(Math.random() * 4 + 2))}`;
          changed = true;
        }

        // Atropine -> HR increases (immediate onset)
        if (hasAtropine) {
          updated.pulse = Math.min(120, (prev.pulse || 40) + Math.floor(Math.random() * 12 + 8));
          changed = true;
        }

        // Glucose/Dextrose -> BGL rises, GCS may improve
        if (hasGlucose) {
          const bgl = prev.bloodGlucose || 2.0;
          if (bgl < 6) { updated.bloodGlucose = Math.round(Math.min(8, bgl + Math.random() * 2.5 + 1.5) * 10) / 10; changed = true; }
          const gcs = prev.gcs || 10;
          if (gcs < 15) { updated.gcs = Math.min(15, gcs + Math.floor(Math.random() * 3 + 2)); changed = true; }
        }

        // Amiodarone -> HR decreases (loading dose effect)
        if (hasAmiodarone) {
          updated.pulse = Math.max(60, (prev.pulse || 120) - Math.floor(Math.random() * 8 + 5));
          changed = true;
        }

        // Adenosine -> brief asystole then reset (6-second drug)
        if (hasAdenosine) {
          updated.pulse = Math.max(50, Math.min(100, 60 + Math.floor(Math.random() * 20)));
          changed = true;
        }

        // Midazolam/Benzos -> RR may decrease (onset 2-5 min)
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

    // Bolus effects fire once (at 3-5s onset) per new treatment application
    const bolusTimeout = setTimeout(() => {
      applyBolusEffects();
      // Second bolus application for dose-dependent drugs (e.g., glucose needs ~5 min to peak)
      setTimeout(applyBolusEffects, 15000 + Math.random() * 10000);
    }, 3000 + Math.random() * 2000);

    // Maintenance effects fire on a recurring interval (ongoing treatment response)
    const t1 = setTimeout(applyMaintenanceEffects, 3000 + Math.random() * 2000);
    const interval = setInterval(applyMaintenanceEffects, 12000 + Math.random() * 6000);

    return () => {
      clearTimeout(bolusTimeout);
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, [appliedTreatments.length, caseCategory, caseSubcategory, caseTitle, cprState?.active]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // TLC Monitor charge handler
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

    setShockDelivered(true);
    setShockArtifact(true);
    const thisShock = shockCountRef.current + 1;
    shockCountRef.current = thisShock;
    setShockCount(thisShock);
    setIsCharged(false);

    setTimeout(() => setShockArtifact(false), 1500);
    setTimeout(() => setShockDelivered(false), 4000);

    // Rhythm-aware shock logic
    const rhythmName = normalizeRhythmName(currentRhythm.name);
    const energy = selectedEnergy;
    const isSynced = syncMode;

    // --- VF / Fine VF ---
    if (rhythmName === 'Ventricular Fibrillation') {
      if (isSynced) {
        logIntervention('SYNC CARDIOVERSION', `${energy}J on VF — sync may fail to find R wave`);
        setShockFeedbackMessage({ text: 'SYNC on VF — sync may not identify R wave. Use unsynchronized defibrillation.', severity: 'warning' });
        return;
      }
      const success = energy >= 150 || (energy >= 100 && thisShock >= 2);
      if (success) {
        logIntervention('DEFIBRILLATION', `${energy}J — VF terminated! ROSC — Shock #${thisShock}`);
        setLocalRhythmOverride('sinus-tachy');
        setCurrentVitals(prev => ({ ...prev, pulse: 80, bp: '100/65', spo2: Math.min(98, (prev.spo2 || 60) + 30) }));
        setShockFeedbackMessage({ text: `ROSC! VF terminated at ${energy}J. Sinus tachycardia restored.`, severity: 'success' });
        if (audioEnabled) audioEngineRef.current?.playRhythmChangeAlert();
      } else {
        logIntervention('DEFIBRILLATION', `${energy}J — VF persists — Shock #${thisShock}`);
        setShockFeedbackMessage({ text: `VF persists after ${energy}J. Continue CPR 2 min. Consider increasing energy.`, severity: 'warning' });
      }
      return;
    }

    // --- Torsades de Pointes (treat like VF for defibrillation) ---
    if (rhythmName === 'Torsades de Pointes') {
      if (!isSynced && energy >= 150) {
        logIntervention('DEFIBRILLATION', `${energy}J — Torsades terminated — Shock #${thisShock}`);
        setLocalRhythmOverride('sinus-tachy');
        setCurrentVitals(prev => ({ ...prev, pulse: 85, bp: '105/65' }));
        setShockFeedbackMessage({ text: `Torsades terminated at ${energy}J. Give IV Magnesium 2g.`, severity: 'success' });
        if (audioEnabled) audioEngineRef.current?.playRhythmChangeAlert();
      } else {
        logIntervention('DEFIBRILLATION', `${energy}J — Torsades persists — Shock #${thisShock}`);
        setShockFeedbackMessage({ text: 'Torsades persists. Increase energy. Give Magnesium 2g IV.', severity: 'warning' });
      }
      return;
    }

    // --- VT ---
    if (rhythmName === 'Ventricular Tachycardia') {
      if (!isSynced) {
        // WRONG: Unsync shock on VT → degenerates to VF
        logIntervention('DEFIBRILLATION', `${energy}J UNSYNC on VT — DEGENERATED TO VF! Shock #${thisShock}`);
        setLocalRhythmOverride('vfib');
        setCurrentVitals(prev => ({ ...prev, pulse: 0, bp: '0/0', spo2: Math.max(40, (prev.spo2 || 94) - 40) }));
        setShockFeedbackMessage({ text: 'CRITICAL: Unsync shock on VT caused VF! Cardiac arrest — begin CPR!', severity: 'critical' });
        if (audioEnabled) audioEngineRef.current?.playRhythmChangeAlert();
        return;
      }
      const success = energy >= 100 || (energy >= 50 && thisShock >= 2);
      if (success) {
        logIntervention('SYNC CARDIOVERSION', `${energy}J — VT converted to NSR — Shock #${thisShock}`);
        setLocalRhythmOverride('nsr');
        setCurrentVitals(prev => ({ ...prev, pulse: 78, bp: '110/70' }));
        setShockFeedbackMessage({ text: `VT cardioverted to NSR at ${energy}J. HR 78, BP 110/70.`, severity: 'success' });
        if (audioEnabled) audioEngineRef.current?.playRhythmChangeAlert();
      } else {
        logIntervention('SYNC CARDIOVERSION', `${energy}J — VT persists — Shock #${thisShock}`);
        setShockFeedbackMessage({ text: `VT persists after ${energy}J sync. Increase energy. Consider Amiodarone 300mg.`, severity: 'warning' });
      }
      return;
    }

    // --- SVT ---
    if (rhythmName === 'SVT') {
      if (!isSynced) {
        logIntervention('DEFIBRILLATION', `${energy}J UNSYNC on SVT — risk of VF!`);
        setShockFeedbackMessage({ text: 'SVT requires SYNCHRONIZED cardioversion! Risk of inducing VF.', severity: 'critical' });
        return;
      }
      if (energy >= 50) {
        logIntervention('SYNC CARDIOVERSION', `${energy}J — SVT terminated — Shock #${thisShock}`);
        setLocalRhythmOverride('nsr');
        setCurrentVitals(prev => ({ ...prev, pulse: 80 }));
        setShockFeedbackMessage({ text: `SVT cardioverted to NSR at ${energy}J. HR 80.${energy > 100 ? ' Lower energy (50-100J) is sufficient for SVT.' : ''}`, severity: 'success' });
        if (audioEnabled) audioEngineRef.current?.playRhythmChangeAlert();
      } else {
        logIntervention('SYNC CARDIOVERSION', `${energy}J — SVT persists`);
        setShockFeedbackMessage({ text: `SVT persists. Increase to 50-100J.`, severity: 'warning' });
      }
      return;
    }

    // --- AF ---
    if (rhythmName === 'Atrial Fibrillation') {
      if (!isSynced) {
        logIntervention('DEFIBRILLATION', `${energy}J UNSYNC on AF — risk of VF!`);
        setShockFeedbackMessage({ text: 'AF requires SYNCHRONIZED cardioversion!', severity: 'critical' });
        return;
      }
      if (energy >= 120 || (energy >= 100 && thisShock >= 2)) {
        logIntervention('SYNC CARDIOVERSION', `${energy}J — AF terminated — Shock #${thisShock}`);
        setLocalRhythmOverride('nsr');
        setCurrentVitals(prev => ({ ...prev, pulse: 76, bp: '118/72' }));
        setShockFeedbackMessage({ text: `AF cardioverted to NSR at ${energy}J. HR 76, BP 118/72.`, severity: 'success' });
        if (audioEnabled) audioEngineRef.current?.playRhythmChangeAlert();
      } else {
        logIntervention('SYNC CARDIOVERSION', `${energy}J — AF persists`);
        setShockFeedbackMessage({ text: `AF persists. Consider 120-200J for AF.`, severity: 'warning' });
      }
      return;
    }

    // --- Atrial Flutter ---
    if (rhythmName === 'Atrial Flutter') {
      if (!isSynced) {
        logIntervention('DEFIBRILLATION', `${energy}J UNSYNC on flutter — risk of VF!`);
        setShockFeedbackMessage({ text: 'Atrial flutter requires SYNCHRONIZED cardioversion!', severity: 'critical' });
        return;
      }
      if (energy >= 50) {
        logIntervention('SYNC CARDIOVERSION', `${energy}J — Flutter terminated — Shock #${thisShock}`);
        setLocalRhythmOverride('nsr');
        setCurrentVitals(prev => ({ ...prev, pulse: 78, bp: '120/75' }));
        setShockFeedbackMessage({ text: `Flutter cardioverted to NSR at ${energy}J.`, severity: 'success' });
        if (audioEnabled) audioEngineRef.current?.playRhythmChangeAlert();
      } else {
        logIntervention('SYNC CARDIOVERSION', `${energy}J — Flutter persists`);
        setShockFeedbackMessage({ text: `Flutter persists. Increase to 50-100J.`, severity: 'warning' });
      }
      return;
    }

    // --- Non-shockable: Asystole / PEA ---
    if (rhythmName === 'Asystole' || rhythmName === 'PEA') {
      logIntervention('DEFIBRILLATION', `${energy}J on ${rhythmName} — NON-SHOCKABLE — Shock #${thisShock}`);
      setShockFeedbackMessage({ text: `${rhythmName} is NON-SHOCKABLE! Do not defibrillate. Continue CPR + Adrenaline.`, severity: 'critical' });
      return;
    }

    // --- Perfusing / Normal rhythm — HARMFUL SHOCK ---
    logIntervention(isSynced ? 'SYNC CARDIOVERSION' : 'DEFIBRILLATION', `${energy}J on ${rhythmName} — INAPPROPRIATE — Shock #${thisShock}`);
    const roll = Math.random();
    let newRhythm: string;
    if (roll < 0.7) { newRhythm = 'vfib'; }
    else if (roll < 0.9) { newRhythm = 'asystole'; }
    else { newRhythm = 'pea'; }
    setLocalRhythmOverride(newRhythm);
    setCurrentVitals(prev => ({
      ...prev,
      pulse: 0,
      bp: '0/0',
      spo2: Math.max(30, (prev.spo2 || 98) - 55),
    }));
    const rhythmLabel = newRhythm === 'vfib' ? 'VF' : newRhythm === 'asystole' ? 'Asystole' : 'PEA';
    setShockFeedbackMessage({
      text: `CRITICAL: Shock on perfusing rhythm caused ${rhythmLabel}! Cardiac arrest — begin CPR immediately!`,
      severity: 'critical',
    });
    if (audioEnabled) audioEngineRef.current?.playRhythmChangeAlert();
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

  // Power ON/OFF handler
  const handlePowerToggle = useCallback(() => {
    if (powerOn) {
      setPowerOn(false);
      setBootPhase('off');
      audioEngineRef.current?.stopHeartbeat();
      audioEngineRef.current?.stopReadyTone();
    } else {
      setBootPhase('booting');
      setPowerOn(true);
      audioEngineRef.current?.playPowerOnSound();
      setTimeout(() => setBootPhase('ready'), 1500);
    }
  }, [powerOn]);

  const handleHomeScreen = useCallback(() => {
    setShow12Lead(false); setPrintMode(false); setShowOptions(false);
    setShowAnalyze(false); setShowCodeSummary(false); setShowAssessPanel(false);
    setAedMode(false); setShow12LeadImage(false); setShowNibpMenu(false);
  }, []);

  const handleAnalyze = useCallback(() => {
    setAedMode(true);
    setMonitorMode('defib');
    audioEngineRef.current?.playAnalyzeSound();
    logIntervention('ANALYZE', `AED: ${currentRhythm.name} — ${
      currentRhythm.id === 'vfib' || currentRhythm.id === 'vtach' ? 'SHOCK ADVISED' : 'NO SHOCK ADVISED'
    }`);
  }, [currentRhythm, logIntervention]);

  const handlePrint = useCallback(() => {
    setShow12LeadImage(true);
    logIntervention('PRINT', '12-Lead ECG printed');
    if (audioEnabled && audioEngineRef.current) audioEngineRef.current.playPrintingSound(3000);
  }, [logIntervention, audioEnabled]);

  const handleGainCycle = useCallback(() => {
    const gains: (0.5 | 1.0 | 1.5 | 2.0)[] = [0.5, 1.0, 1.5, 2.0];
    setWaveformGain(gains[(gains.indexOf(waveformGain) + 1) % gains.length]);
  }, [waveformGain]);

  const litflImageUrl = useMemo(() => getLitflImageForRhythm(currentRhythm.id), [currentRhythm.id]);

  return (
    <div className="select-none">
      {/* ================================================================ */}
      {/* TLC MONITOR — FULL REDESIGN                                      */}
      {/* ================================================================ */}
      <div className="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #3a3d42 0%, #2a2d31 30%, #1e2024 60%, #2a2d31 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          border: '3px solid #4a8c3f',
        }}>

        {/* ================================================================ */}
        {/* TOP BAR — ON button + PRINT/CODE SUMMARY/TRANSMIT/12 LEAD       */}
        {/* ================================================================ */}
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 flex-wrap"
          style={{ background: 'linear-gradient(180deg, #333639 0%, #2a2d31 100%)', borderBottom: '1px solid rgba(0,0,0,0.3)' }}>

          {/* BIG ON BUTTON */}
          <button onClick={handlePowerToggle}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-mono font-bold text-xs sm:text-sm tracking-wider select-none
              transition-all duration-200 border-2 flex items-center justify-center shrink-0 touch-manipulation
              ${powerOn
                ? 'bg-gradient-to-b from-green-500 to-green-700 text-white border-green-400 shadow-[0_0_12px_rgba(74,222,128,0.4)]'
                : 'bg-gradient-to-b from-gray-600 to-gray-800 text-gray-400 border-gray-500'
              }
              hover:brightness-110 active:brightness-90`}
          >
            ON
          </button>

          {/* Side buttons — wrap on mobile */}
          <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
            <SideButton label="PRINT" onClick={handlePrint} active={show12LeadImage} />
            <SideButton label="CODE" onClick={() => setShowCodeSummary(!showCodeSummary)} active={showCodeSummary} />
            <SideButton label="12 LEAD" onClick={() => {
              if (!show12Lead) onAssessmentPerformed?.('12-lead-ecg');
              setShow12Lead(!show12Lead);
            }} active={show12Lead} />
          </div>

          {/* Right: mode selector + branding */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {assessmentMode && (
              <Badge variant="outline" className="text-[7px] border-amber-600/50 text-amber-400 h-4 bg-amber-950/30">ASSESS</Badge>
            )}
            <div className="flex rounded-sm overflow-hidden border border-gray-600/50">
              {(['monitor', 'defib', 'pacer'] as const).map(mode => (
                <button key={mode} onClick={() => { setMonitorMode(mode); setAedMode(false); }}
                  className={`px-2 sm:px-2.5 py-1 text-[7px] sm:text-[8px] font-mono font-bold tracking-wider transition-colors touch-manipulation ${
                    monitorMode === mode
                      ? mode === 'defib' ? 'bg-red-700 text-white' : mode === 'pacer' ? 'bg-blue-700 text-white' : 'bg-green-700 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                  }`}>{mode.toUpperCase()}</button>
              ))}
            </div>
            <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-gray-400 hidden sm:inline"
              style={{ fontFamily: 'system-ui' }}>TLC Monitor</span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* LCD SCREEN — Full width, no sidebar                             */}
        {/* ================================================================ */}
        <div className="mx-2 my-2 rounded-lg overflow-hidden border-2 border-gray-700"
          style={{ background: '#001000', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)' }}>

          {!powerOn && (
            <div className="h-[280px] flex items-center justify-center" style={{ background: '#0a0a0a' }}>
              <span className="text-[12px] font-mono text-gray-700">MONITOR OFF — Press ON to start</span>
            </div>
          )}

          {powerOn && bootPhase === 'booting' && (
            <div className="h-[280px] flex flex-col items-center justify-center" style={{ background: '#001000' }}>
              <span className="text-xl font-mono font-bold text-green-400 tracking-[0.3em] animate-pulse">TLC Monitor</span>
              <span className="text-[9px] font-mono text-green-600 mt-2">SYSTEM SELF-TEST...</span>
              <div className="w-32 h-1 bg-green-900 rounded mt-2 overflow-hidden">
                <div className="h-full bg-green-500 rounded animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {powerOn && bootPhase === 'ready' && (
            <>
              {/* PARAMETER BAR — Click any vital to toggle it on (triggers assessment + sound) */}
              <div className="flex items-stretch border-b border-gray-800/50 overflow-x-auto scrollbar-hide" style={{ background: 'rgba(0,10,0,0.6)' }}>
                <div className="flex-1 px-1.5 py-0.5 border-r border-gray-800/30 text-center cursor-pointer hover:bg-yellow-900/20 transition-colors"
                  onClick={() => {
                    if (!visibleVitals.has('respiration') && !activeAssessments.has('respiration')) {
                      startAssessment('respiration', ASSESSMENT_METHODS.respiration[0]);
                      logIntervention('ASSESS', 'Respiratory rate assessment');
                    }
                  }}>
                  <span className="text-[7px] font-mono text-yellow-500/70 block">RR</span>
                  <span className={`text-sm font-mono font-bold ${visibleVitals.has('respiration') ? 'text-yellow-400' : 'text-yellow-400/20'}`}>
                    {visibleVitals.has('respiration') ? Math.round(currentVitals.respiration) : '--'}
                  </span>
                  {activeAssessments.has('respiration') && (
                    <div className="h-0.5 w-full bg-yellow-900/50 mt-0.5 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress.get('respiration') || 0}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 px-1.5 py-0.5 border-r border-gray-800/30 text-center cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => {
                    if (!activeAssessments.has('bp')) {
                      startAssessment('bp', ASSESSMENT_METHODS.bp[1], true);
                      logIntervention('NIBP', 'Blood pressure measurement');
                    }
                  }}>
                  <span className="text-[7px] font-mono text-white/60 block">NIBP</span>
                  <span className={`text-sm font-mono font-bold ${visibleVitals.has('bp') ? 'text-white' : 'text-white/20'}`}>
                    {visibleVitals.has('bp') ? (assessedVitals.bp || currentVitals.bp) : '--/--'}
                  </span>
                  {activeAssessments.has('bp') && (
                    <>
                      <span className="text-[6px] font-mono text-blue-400 block animate-pulse">MEASURING...</span>
                      <div className="h-0.5 w-full bg-blue-900/50 mt-0.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress.get('bp') || 0}%` }} />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex-1 px-1.5 py-0.5 border-r border-gray-800/30 text-center cursor-pointer hover:bg-orange-900/20 transition-colors"
                  onClick={() => {
                    if (!visibleVitals.has('temperature') && !activeAssessments.has('temperature') && currentVitals.temperature) {
                      startAssessment('temperature', ASSESSMENT_METHODS.temperature[0]);
                      logIntervention('ASSESS', 'Temperature assessment');
                    }
                  }}>
                  <span className="text-[7px] font-mono text-orange-400/70 block">Temp</span>
                  <span className={`text-sm font-mono font-bold ${visibleVitals.has('temperature') ? 'text-orange-400' : 'text-orange-400/20'}`}>
                    {visibleVitals.has('temperature') && currentVitals.temperature ? currentVitals.temperature.toFixed(1) : '--'}
                  </span>
                  {activeAssessments.has('temperature') && (
                    <div className="h-0.5 w-full bg-orange-900/50 mt-0.5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress.get('temperature') || 0}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 px-1.5 py-0.5 border-r border-gray-800/30 text-center cursor-pointer hover:bg-fuchsia-900/20 transition-colors"
                  onClick={() => {
                    if (!visibleVitals.has('etco2') && etco2Value) {
                      setVisibleVitals(prev => { const next = new Set(prev); next.add('etco2'); return next; });
                      logIntervention('ASSESS', 'EtCO2 connected');
                    }
                  }}>
                  <span className="text-[7px] font-mono text-fuchsia-400/70 block">CO2</span>
                  <span className={`text-sm font-mono font-bold ${visibleVitals.has('etco2') ? 'text-fuchsia-400' : 'text-fuchsia-400/20'}`}>
                    {visibleVitals.has('etco2') && etco2Value ? etco2Value : '--'}
                  </span>
                </div>
                <div className="flex-1 px-1.5 py-0.5 border-r border-gray-800/30 text-center cursor-pointer hover:bg-cyan-900/20 transition-colors"
                  onClick={() => {
                    if (!visibleVitals.has('spo2') && !activeAssessments.has('spo2')) {
                      startAssessment('spo2', ASSESSMENT_METHODS.spo2[0]);
                      logIntervention('ASSESS', 'SpO2 probe applied');
                    }
                  }}>
                  <span className="text-[7px] font-mono text-cyan-400/70 block">SpO2</span>
                  <span className={`text-xl font-mono font-bold ${
                    visibleVitals.has('spo2') ? (getVitalAlarmState('spo2').isAlarm ? 'text-red-500' : 'text-cyan-400') : 'text-cyan-400/20'
                  }`}>{visibleVitals.has('spo2') ? Math.round(assessedVitals.spo2 ?? currentVitals.spo2) : '--'}</span>
                  <span className="text-[6px] font-mono text-cyan-400/40 block">%</span>
                  {activeAssessments.has('spo2') && (
                    <div className="h-0.5 w-full bg-cyan-900/50 mt-0.5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress.get('spo2') || 0}%` }} />
                    </div>
                  )}
                </div>
                <div className="px-2 py-0.5 text-center min-w-[55px] cursor-pointer hover:bg-green-900/20 transition-colors"
                  onClick={() => {
                    if (!visibleVitals.has('pulse') && !activeAssessments.has('pulse')) {
                      startAssessment('pulse', ASSESSMENT_METHODS.pulse[0]);
                      logIntervention('ASSESS', 'Pulse check');
                      if (audioEnabled && audioEngineRef.current) audioEngineRef.current.playHeartbeat(currentVitals.pulse || 80);
                    }
                  }}>
                  <span className="text-[7px] font-mono text-green-500/70 block">HR</span>
                  <span className={`text-2xl font-mono font-bold leading-none ${
                    visibleVitals.has('pulse')
                      ? getVitalAlarmState('pulse').isAlarm ? 'text-red-500 animate-pulse' : getVitalAlarmState('pulse').isWarning ? 'text-amber-400' : 'text-green-400'
                      : 'text-green-400/20'
                  }`}>{visibleVitals.has('pulse') ? (currentRhythm.category === 'arrest' ? 0 : Math.round(currentVitals.pulse)) : '--'}</span>
                  {activeAssessments.has('pulse') && (
                    <div className="h-0.5 w-full bg-green-900/50 mt-0.5 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress.get('pulse') || 0}%` }} />
                    </div>
                  )}
                </div>
                {/* Extra vitals: GCS, BGL — always visible so students can initiate assessment */}
                <div className="flex-1 px-2 py-0.5 border-l border-gray-800/30 text-center cursor-pointer hover:bg-gray-700/20 transition-colors"
                  onClick={() => {
                    if (!visibleVitals.has('gcs') && !activeAssessments.has('gcs')) {
                      startAssessment('gcs', ASSESSMENT_METHODS.gcs[0]);
                      logIntervention('ASSESS', 'GCS assessment');
                    }
                  }}>
                  <span className="text-[7px] font-mono text-gray-300/60 block">GCS</span>
                  <span className={`text-sm font-mono font-bold ${visibleVitals.has('gcs') ? 'text-white' : 'text-white/20'}`}>
                    {visibleVitals.has('gcs') ? Math.min(15, Math.round(currentVitals.gcs ?? 15)) : '--'}
                  </span>
                  {activeAssessments.has('gcs') && (
                    <div className="h-0.5 w-full bg-gray-700/50 mt-0.5 rounded-full overflow-hidden">
                      <div className="h-full bg-white/60 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress.get('gcs') || 0}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 px-2 py-0.5 border-l border-gray-800/30 text-center cursor-pointer hover:bg-purple-900/20 transition-colors"
                  onClick={() => {
                    if (!visibleVitals.has('bloodGlucose') && !activeAssessments.has('bloodGlucose')) {
                      startAssessment('bloodGlucose', ASSESSMENT_METHODS.glucose[0]);
                      logIntervention('ASSESS', 'Blood glucose check');
                    }
                  }}>
                    <span className="text-[7px] font-mono text-purple-400/70 block">BGL</span>
                    <span className={`text-sm font-mono font-bold ${visibleVitals.has('bloodGlucose') ? 'text-purple-400' : 'text-purple-400/20'}`}>
                      {visibleVitals.has('bloodGlucose') ? (typeof currentVitals.bloodGlucose === 'number' ? currentVitals.bloodGlucose.toFixed(1) : currentVitals.bloodGlucose) : '--'}
                    </span>
                    {activeAssessments.has('bloodGlucose') && (
                      <div className="h-0.5 w-full bg-purple-900/50 mt-0.5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full transition-all duration-300" style={{ width: `${assessmentProgress.get('bloodGlucose') || 0}%` }} />
                      </div>
                    )}
                  </div>
              </div>

              {/* WAVEFORM AREA + RIGHT STRIP */}
              <div className="flex">
                <div className="flex-1 min-w-0">
                  {/* ECG */}
                  <div className="relative">
                    <div className="absolute top-0.5 left-1.5 z-10"><span className="text-[8px] font-mono text-green-500/70">{selectedLead}</span></div>
                    <ECGWaveform heartRate={hrValue} color="#00ff41" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80} isVisible={visibleVitals.has('pulse') && !sweepPaused}
                      waveformFn={getWaveformForLead(selectedLead)} showPacingSpikes={pacerActive && monitorMode === 'pacer'}
                      showShockArtifact={shockArtifact} showSyncMarkers={syncMode && monitorMode === 'defib'} showCprArtifact={cprState?.running === true} />
                    {!visibleVitals.has('pulse') && (
                      <div className="h-[60px] sm:h-[80px] flex items-center justify-center" style={{ background: '#001000' }}>
                        {activeAssessments.has('pulse') ? (
                          <div className="text-center"><span className="text-[9px] font-mono text-green-600 block">ACQUIRING ECG...</span>
                            <Progress value={assessmentProgress.get('pulse') || 0} className="h-1 w-20 mt-1" /></div>
                        ) : (<button onClick={() => startAssessment('pulse', ASSESSMENT_METHODS.pulse[2])}
                          className="text-[9px] font-mono text-green-700 hover:text-green-500 transition-colors cursor-pointer">LEADS OFF - TAP TO CONNECT</button>)}
                      </div>
                    )}
                  </div>
                  {/* SpO2 */}
                  <div className="relative">
                    <div className="absolute top-0.5 left-1.5 z-10"><span className="text-[8px] font-mono text-cyan-400/70">SpO2</span></div>
                    <PlethWaveform heartRate={hrValue} spo2={spo2Value} color="#00e5ff" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 50 : 65} isVisible={visibleVitals.has('spo2') && !sweepPaused} />
                    {!visibleVitals.has('spo2') && (
                      <div className="h-[50px] sm:h-[65px] flex items-center justify-center" style={{ background: '#000810' }}>
                        {activeAssessments.has('spo2') ? (
                          <div className="text-center"><span className="text-[9px] font-mono text-cyan-600 block">ACQUIRING SpO2...</span>
                            <Progress value={assessmentProgress.get('spo2') || 0} className="h-1 w-20 mt-1" /></div>
                        ) : (<button onClick={() => startAssessment('spo2', ASSESSMENT_METHODS.spo2[0])}
                          className="text-[9px] font-mono text-cyan-700 hover:text-cyan-500 cursor-pointer">SENSOR OFF - TAP TO CONNECT</button>)}
                      </div>
                    )}
                  </div>
                  {/* CO2 */}
                  {etco2Value !== undefined && (
                    <div className="relative">
                      <div className="absolute top-0.5 left-1.5 z-10"><span className="text-[8px] font-mono text-fuchsia-400/70">CO2</span></div>
                      <CapnographyWaveform respiratoryRate={rrValue} etco2={etco2Value} color="#ff66ff" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 45 : 60} isVisible={visibleVitals.has('etco2') && !sweepPaused} />
                      {!visibleVitals.has('etco2') && (
                        <div className="h-[45px] sm:h-[60px] flex items-center justify-center" style={{ background: '#080010' }}>
                          {activeAssessments.has('etco2') ? (
                            <div className="text-center"><span className="text-[9px] font-mono text-fuchsia-600 block">ACQUIRING CO2...</span>
                              <Progress value={assessmentProgress.get('etco2') || 0} className="h-1 w-20 mt-1" /></div>
                          ) : (<button onClick={() => startAssessment('etco2', ASSESSMENT_METHODS.etco2[0])}
                            className="text-[9px] font-mono text-fuchsia-700 hover:text-fuchsia-500 cursor-pointer">CO2 OFF - TAP TO CONNECT</button>)}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Status bar */}
                  {(cprState?.active || (alarmStatus.count > 0 && alarmsEnabled)) && (
                    <div className="px-2 py-1 border-t border-gray-800/40 flex items-center gap-3" style={{ background: 'rgba(0,0,0,0.5)' }}>
                      {cprState?.active && <span className="text-[8px] font-mono text-yellow-300 font-bold">CPR: Adult - {cprState.running ? 'Active' : 'Paused'} 30:2</span>}
                      {alarmStatus.count > 0 && alarmsEnabled && (
                        <span className={`text-[8px] font-mono font-bold ${alarmStatus.hasCritical ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                          {alarmStatus.count} Alarm{alarmStatus.count > 1 ? 's' : ''} {formatCodeTimer(codeTimerSeconds)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* RIGHT STRIP — timer, battery, status (hidden on mobile for space) */}
                <div className="hidden sm:flex w-[65px] border-l border-gray-800/30 flex-col items-center justify-between py-1 shrink-0" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="text-center">
                    <span className={`text-[10px] font-mono font-bold ${codeTimerRunning ? 'text-green-400' : 'text-gray-600'}`}>{formatCodeTimer(codeTimerSeconds)}</span>
                    <button onClick={() => { if (codeTimerRunning) setCodeTimerRunning(false); else { setCodeTimerSeconds(0); setCodeTimerRunning(true); } }}
                      className="text-[6px] font-mono text-gray-500 hover:text-white block cursor-pointer">{codeTimerRunning ? 'STOP' : 'START'}</button>
                  </div>
                  {syncMode && <span className="text-cyan-400 text-[9px]">SYNC</span>}
                  <div className="space-y-0.5">
                    {[1, 2].map(n => (
                      <div key={n} className="flex items-center gap-0.5">
                        <span className="text-[7px] font-mono text-gray-400">{n}</span>
                        <div className="w-5 h-2.5 rounded-sm border border-gray-500/50 flex items-center px-0.5" style={{ background: '#1a1a1a' }}>
                          <div className="flex gap-px">{[0,1,2].map(i => <div key={i} className="w-0.5 h-1.5 bg-green-500 rounded-[1px]" />)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-[7px] font-mono text-gray-400">{selectedLead}x{waveformGain}</span>
                  {monitorMode === 'defib' && (
                    <div className="text-center"><span className="text-[8px] font-mono font-bold text-yellow-400">{selectedEnergy}J</span></div>
                  )}
                  {monitorMode === 'pacer' && (
                    <div className="text-center"><span className="text-[7px] font-mono text-blue-400">{pacerRate}/{pacerOutput}</span></div>
                  )}
                </div>
              </div>

              {/* Charging/Shock status */}
              {monitorMode === 'defib' && (isCharging || isCharged || shockArtifact || aedMode) && (
                <div className={`flex items-center justify-center px-2 py-1.5 border-t border-gray-800/50 ${
                  shockArtifact ? 'bg-white/20' : isCharged ? 'bg-red-950/40' : aedMode ? 'bg-yellow-950/30' : ''}`}>
                  {shockArtifact && <span className="text-sm font-mono text-white font-bold animate-pulse">SHOCK DELIVERED</span>}
                  {isCharging && !shockArtifact && <span className="text-sm font-mono text-yellow-400 animate-pulse">CHARGING {selectedEnergy}J...</span>}
                  {isCharged && !shockArtifact && <span className="text-sm font-mono text-red-400 animate-pulse font-bold">CHARGED {selectedEnergy}J — PRESS SHOCK</span>}
                  {aedMode && !isCharging && !isCharged && !shockArtifact && (
                    <span className="text-[10px] font-mono text-yellow-300 font-bold">
                      AED: {currentRhythm.id === 'vfib' || currentRhythm.id === 'vtach' ? 'SHOCK ADVISED — Press CHARGE' : 'NO SHOCK ADVISED — Continue CPR'}
                    </span>
                  )}
                </div>
              )}

              {/* Clinical shock feedback message */}
              {shockFeedbackMessage && (
                <div className={`flex items-center justify-center px-2 py-1.5 border-t border-gray-800/50 ${
                  shockFeedbackMessage.severity === 'critical' ? 'bg-red-950/60' :
                  shockFeedbackMessage.severity === 'success' ? 'bg-green-950/50' : 'bg-yellow-950/40'
                }`}>
                  <span className={`text-[10px] font-mono font-bold animate-pulse ${
                    shockFeedbackMessage.severity === 'critical' ? 'text-red-400' :
                    shockFeedbackMessage.severity === 'success' ? 'text-green-400' : 'text-yellow-400'
                  }`}>{shockFeedbackMessage.text}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* ================================================================ */}
        {/* CONTROL PANEL                                                    */}
        {/* ================================================================ */}
        <div className="px-3 py-2 space-y-1.5"
          style={{ background: 'linear-gradient(180deg, #444 0%, #3a3d40 20%, #333 100%)', borderTop: '1px solid rgba(0,0,0,0.4)' }}>

          {/* ---- MONITOR MODE CONTROLS ---- */}
          {monitorMode === 'monitor' && (
            <>
              <div className="flex items-center gap-1 flex-wrap">
                <ControlButton label="HOME" onClick={handleHomeScreen} />
                <ControlButton label="EVENT" onClick={() => {
                  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const snap = [visibleVitals.has('pulse') ? `HR:${Math.round(currentVitals.pulse)}` : null,
                    visibleVitals.has('bp') ? `BP:${currentVitals.bp}` : null,
                    visibleVitals.has('spo2') ? `SpO2:${Math.round(currentVitals.spo2)}` : null].filter(Boolean).join(' ');
                  logIntervention('EVENT', `${now} — ${snap || 'Vitals pending'}`);
                  if (audioEnabled) audioEngineRef.current?.playAnalyzeSound();
                }} />
                <ControlButton label="OPTIONS" onClick={() => setShowOptions(!showOptions)} led={showOptions ? 'green' : 'off'} />
                <ControlButton label="ALARMS" variant={alarmStatus.hasCritical ? 'orange' : 'dark'}
                  onClick={() => setAlarmsEnabled(!alarmsEnabled)}
                  led={alarmsEnabled ? (alarmStatus.hasCritical ? 'red' : alarmStatus.hasWarning ? 'orange' : 'green') : 'off'} />
                <ControlButton label="NIBP" onClick={() => {
                  if (!activeAssessments.has('bp')) { startAssessment('bp', ASSESSMENT_METHODS.bp[1]); logIntervention('NIBP', 'Auto measurement'); }
                }} led={activeAssessments.has('bp') ? 'green' : nibpCycling ? 'orange' : 'off'} />
                <ControlButton label="SIZE" onClick={handleGainCycle} />
                <ControlButton label="LEAD" onClick={() => {
                  const leads: ('I' | 'II' | 'III' | 'PADDLES')[] = ['I', 'II', 'III', 'PADDLES'];
                  setSelectedLead(leads[(leads.indexOf(selectedLead) + 1) % leads.length]);
                }} />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <ControlButton label="PAUSE" onClick={() => setSweepPaused(!sweepPaused)} led={sweepPaused ? 'orange' : 'off'} />
                <ControlButton label="VITALS" onClick={() => setShowAssessPanel(!showAssessPanel)} led={showAssessPanel ? 'green' : 'off'} />
                <ControlButton label="AUDIO" onClick={() => setAudioEnabled(!audioEnabled)} led={audioEnabled ? 'green' : 'off'} />
                <ControlButton label="NIBP CYCLE" onClick={() => {
                  const ns = !nibpCycling; setNibpCycling(ns);
                  logIntervention('NIBP', ns ? 'Auto-cycle q2min' : 'Auto-cycle stopped');
                }} led={nibpCycling ? 'green' : 'off'} />
                {interventionLog.length > 0 && <span className="ml-auto text-[7px] font-mono text-gray-500">{interventionLog.length} events</span>}
              </div>
            </>
          )}

          {/* ---- DEFIB MODE CONTROLS ---- */}
          {monitorMode === 'defib' && (
            <>
              <div className="flex items-center gap-1 flex-wrap">
                <ControlButton label="SYNC" onClick={() => { setSyncMode(!syncMode); }}
                  led={syncMode ? 'green' : 'off'} />
                <ControlButton label="ANALYZE" variant="yellow" onClick={handleAnalyze} />
                <ControlButton label="CPR" variant={cprState?.active ? 'red' : 'dark'}
                  led={cprState?.running ? 'red' : cprState?.active ? 'orange' : 'off'}
                  onClick={() => {
                    if (cprState?.active) {
                      if (cprState.running) { cprState.onPauseCPR(); logIntervention('CPR', 'PAUSED'); }
                      else { cprState.onStartCPR(); logIntervention('CPR', 'RESUMED'); }
                    } else if (cprState) {
                      cprState.onStartCPR();
                      logIntervention('CPR', 'CARDIAC ARREST — CPR started');
                      if (audioEnabled) audioEngineRef.current?.playMedicalAlarm('high');
                    }
                  }} />
                <ControlButton label="LEAD" onClick={() => {
                  const leads: ('I' | 'II' | 'III' | 'PADDLES')[] = ['I', 'II', 'III', 'PADDLES'];
                  setSelectedLead(leads[(leads.indexOf(selectedLead) + 1) % leads.length]);
                }} />
                <ControlButton label="AUDIO" onClick={() => setAudioEnabled(!audioEnabled)} led={audioEnabled ? 'green' : 'off'} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Lead 1/2/3 */}
                {(['I', 'II', 'III'] as const).map((lead, i) => (
                  <button key={lead} onClick={() => setSelectedLead(lead)}
                    className={`w-7 h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors border
                      ${selectedLead === lead ? 'bg-gray-500/60 text-white border-gray-400/60' : 'bg-gray-700/40 text-gray-400 border-gray-600/30 hover:bg-gray-600/40'}`}>
                    {i + 1}
                  </button>
                ))}

                <div className="w-px h-6 bg-gray-600/40 mx-1" />

                {/* ENERGY SELECT */}
                <div className="flex items-center gap-0.5">
                  <ControlButton label="▼" className="!px-1.5 !py-2" variant="yellow" onClick={handleEnergyDown} />
                  <div className="px-2 py-1 rounded-sm border border-amber-600/40 text-center min-w-[50px]" style={{ background: 'rgba(80,60,0,0.4)' }}>
                    <span className="text-[6px] font-mono text-amber-400 block">ENERGY</span>
                    <span className="text-sm font-mono font-bold text-amber-300 block leading-tight">{selectedEnergy}J</span>
                  </div>
                  <ControlButton label="▲" className="!px-1.5 !py-2" variant="yellow" onClick={handleEnergyUp} />
                </div>

                {/* CHARGE */}
                <ControlButton label="CHARGE" variant="red" className={`!px-3 !py-2 ${isCharged ? 'animate-pulse ring-2 ring-red-400/60' : ''}`}
                  onClick={() => { handleCharge(); }} disabled={isCharging} />

                {/* SHOCK — BIG BUTTON */}
                <button onClick={handleShock} disabled={!isCharged}
                  className={`px-5 py-2.5 rounded-lg font-mono font-bold text-sm tracking-wider select-none transition-all border-2 flex items-center gap-2
                    ${isCharged
                      ? 'bg-gradient-to-b from-red-500 to-red-700 text-white border-red-400 shadow-[0_0_16px_rgba(239,68,68,0.5)] animate-pulse cursor-pointer hover:brightness-110'
                      : 'bg-gradient-to-b from-gray-600 to-gray-800 text-gray-500 border-gray-600 cursor-not-allowed'
                    }`}>
                  <Zap className="h-4 w-4" />
                  SHOCK
                </button>
              </div>
            </>
          )}

          {/* ---- PACER MODE CONTROLS ---- */}
          {monitorMode === 'pacer' && (
            <>
              <div className="flex items-center gap-1 flex-wrap">
                <ControlButton label="LEAD" onClick={() => {
                  const leads: ('I' | 'II' | 'III' | 'PADDLES')[] = ['I', 'II', 'III', 'PADDLES'];
                  setSelectedLead(leads[(leads.indexOf(selectedLead) + 1) % leads.length]);
                }} />
                <ControlButton label="AUDIO" onClick={() => setAudioEnabled(!audioEnabled)} led={audioEnabled ? 'green' : 'off'} />
                <ControlButton label="ALARMS" variant={alarmStatus.hasCritical ? 'orange' : 'dark'}
                  onClick={() => setAlarmsEnabled(!alarmsEnabled)}
                  led={alarmsEnabled ? (alarmStatus.hasCritical ? 'red' : alarmStatus.hasWarning ? 'orange' : 'green') : 'off'} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Lead 1/2/3 */}
                {(['I', 'II', 'III'] as const).map((lead, i) => (
                  <button key={lead} onClick={() => setSelectedLead(lead)}
                    className={`w-7 h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors border
                      ${selectedLead === lead ? 'bg-gray-500/60 text-white border-gray-400/60' : 'bg-gray-700/40 text-gray-400 border-gray-600/30 hover:bg-gray-600/40'}`}>
                    {i + 1}
                  </button>
                ))}

                <div className="w-px h-6 bg-gray-600/40 mx-1" />

                {/* PACER RATE */}
                <div className="flex items-center gap-0.5">
                  <ControlButton label="▼" className="!px-1" onClick={() => setPacerRate(prev => Math.max(30, prev - 10))} />
                  <div className="px-1 py-0.5 rounded-sm bg-black/40 border border-blue-600/40 text-center min-w-[40px]">
                    <span className="text-[6px] font-mono text-blue-400 block">RATE</span>
                    <span className="text-[9px] font-mono font-bold text-blue-300">{pacerRate}</span>
                  </div>
                  <ControlButton label="▲" className="!px-1" onClick={() => setPacerRate(prev => Math.min(180, prev + 10))} />
                </div>

                {/* PACER OUTPUT mA */}
                <div className="flex items-center gap-0.5">
                  <ControlButton label="▼" className="!px-1" onClick={() => setPacerOutput(prev => Math.max(0, prev - 10))} />
                  <div className="px-1 py-0.5 rounded-sm bg-black/40 border border-blue-600/40 text-center min-w-[40px]">
                    <span className="text-[6px] font-mono text-blue-400 block">mA</span>
                    <span className="text-[9px] font-mono font-bold text-blue-300">{pacerOutput}</span>
                  </div>
                  <ControlButton label="▲" className="!px-1" onClick={() => setPacerOutput(prev => Math.min(200, prev + 10))} />
                </div>

                {/* START/STOP PACE */}
                <ControlButton label={pacerActive ? 'STOP PACE' : 'START PACE'} variant={pacerActive ? 'red' : 'green'}
                  led={pacerActive ? 'green' : 'off'}
                  onClick={() => {
                    const ns = !pacerActive; setPacerActive(ns);
                    logIntervention('PACER', ns ? `Started ${pacerRate}ppm/${pacerOutput}mA` : 'Stopped');
                    if (ns && pacerOutput >= 60) setCurrentVitals(prev => ({ ...prev, pulse: pacerRate }));
                  }} />
              </div>
            </>
          )}
        </div>

        {/* ================================================================ */}
        {/* OVERLAY PANELS                                                   */}
        {/* ================================================================ */}

        {/* CPR Management */}
        {cprState?.active && (
          <div className="mx-3 mb-2 p-2 rounded-lg border border-red-600/60" style={{ background: 'rgba(80,0,0,0.5)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-red-400 font-bold tracking-wider animate-pulse">CARDIAC ARREST</span>
              <span className="text-[10px] font-mono text-red-300">Cycle {cprState.cycleNumber} | Shocks: {cprState.shockCount}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex-1 text-center py-2 rounded font-mono text-xl font-bold ${
                cprState.timerSeconds <= 10 ? 'text-red-400 animate-pulse' : 'text-green-400'
              }`} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(100,100,100,0.3)' }}>
                {Math.floor(cprState.timerSeconds / 60)}:{String(cprState.timerSeconds % 60).padStart(2, '0')}
              </div>
              <LP20Button label={cprState.running ? 'PAUSE' : 'START'} sublabel="CPR"
                onClick={() => cprState.running ? cprState.onPauseCPR() : cprState.onStartCPR()}
                variant={cprState.running ? 'red' : 'green'} active={cprState.running} size="large" />
              <LP20Button label="DEFIB" sublabel={`#${cprState.shockCount}`}
                onClick={cprState.onDefibrillate} variant="red" size="large" />
            </div>
            <div className="flex gap-1.5">
              <div className={`flex-1 text-center py-1 rounded text-[8px] font-mono ${
                cprState.lastAdrenalineTime && (Date.now() - cprState.lastAdrenalineTime) > 300000
                  ? 'text-red-300 bg-red-900/40 border border-red-600/50 animate-pulse'
                  : 'text-gray-400 bg-black/30 border border-gray-700/30'
              }`}>ADRENALINE: {cprState.adrenalineDoses}x{cprState.lastAdrenalineTime ? ` (${Math.floor((Date.now() - cprState.lastAdrenalineTime) / 60000)}m)` : cprState.shockCount >= 2 ? ' DUE' : ''}</div>
              <div className="flex-1 text-center py-1 rounded text-[8px] font-mono text-gray-400 bg-black/30 border border-gray-700/30">
                AMIODARONE: {cprState.amiodaroneDoses}/2{cprState.amiodaroneDoses === 0 && cprState.shockCount >= 3 ? ' DUE' : ''}
              </div>
            </div>
          </div>
        )}

        {/* Assessment Panel */}
        {showAssessPanel && assessmentMode && (
          <div className="mx-3 mb-2 p-2 rounded-lg border border-gray-700/50 space-y-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <span className="text-[9px] font-mono text-gray-400 font-bold block mb-1">ADDITIONAL PARAMETERS ({visibleVitals.size}/{availableVitals.length})</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {currentVitals.temperature !== undefined && renderAssessButton('temperature', 'TEMP', ASSESSMENT_METHODS.temperature)}
              {currentVitals.gcs !== undefined && renderAssessButton('gcs', 'GCS', ASSESSMENT_METHODS.gcs)}
              {currentVitals.bloodGlucose !== undefined && renderAssessButton('bloodGlucose', 'BGL', ASSESSMENT_METHODS.glucose)}
              {!visibleVitals.has('bp') && !activeAssessments.has('bp') && renderAssessButton('bp', 'NIBP', ASSESSMENT_METHODS.bp)}
              {!visibleVitals.has('respiration') && !activeAssessments.has('respiration') && renderAssessButton('respiration', 'RR', ASSESSMENT_METHODS.respiration)}
              {currentVitals.painScore !== undefined && renderAssessButton('painScore', 'PAIN', ASSESSMENT_METHODS.painScore)}
            </div>
          </div>
        )}

        {/* 12-Lead ECG */}
        {show12Lead && (
          <div className="mx-3 mb-2">
            {litflImageUrl ? (
              /* LITFL reference ECG — no diagnosis label, just the ECG image */
              <div className="rounded-lg border border-gray-600/50 overflow-hidden" style={{ background: 'rgba(0,0,0,0.6)' }}>
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <FileHeart className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-[10px] font-mono font-bold text-green-400">12-LEAD ECG</span>
                  </div>
                  <button onClick={() => setShow12Lead(false)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="p-2">
                  <img src={litflImageUrl} alt="12-Lead ECG"
                    className="w-full h-auto rounded border border-gray-700" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                </div>
              </div>
            ) : (
              /* Fallback: generated 12-lead only when no LITFL image exists */
              <TwelveLeadECG rhythm={currentRhythm} heartRate={hrValue} onClose={() => setShow12Lead(false)} />
            )}
          </div>
        )}

        {/* 12-Lead ECG Image from LITFL (shown on PRINT) */}
        {show12LeadImage && (
          <div className="mx-3 mb-2 rounded-lg border border-gray-600/50 overflow-hidden" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700/50">
              <span className="text-[10px] font-mono font-bold text-green-400">12-LEAD ECG — {currentRhythm.name}</span>
              <button onClick={() => setShow12LeadImage(false)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            {litflImageUrl ? (
              <div className="p-2">
                <img src={litflImageUrl} alt={`12-Lead ECG: ${currentRhythm.name}`}
                  className="w-full h-auto rounded border border-gray-700" style={{ maxHeight: '300px', objectFit: 'contain' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="mt-1 text-[8px] font-mono text-gray-500">Source: Life in the Fast Lane (LITFL) ECG Library</div>
              </div>
            ) : (
              <div className="p-4 text-center text-[10px] font-mono text-gray-500">
                No LITFL image available for this rhythm. Use 12 LEAD button for generated ECG.
              </div>
            )}
          </div>
        )}

        {/* Options */}
        {showOptions && (
          <div className="mx-3 mb-2 p-3 rounded-lg border border-gray-600/50" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold text-gray-300">OPTIONS</span>
              <button onClick={() => setShowOptions(false)} className="text-gray-400 hover:text-white"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9px] font-mono">
              {[['Sweep', '25mm/s'], ['Gain', `${waveformGain}x`], ['Lead', selectedLead],
                ['Audio', audioEnabled ? 'ON' : 'OFF'], ['Alarms', alarmsEnabled ? 'ON' : 'OFF'], ['Mode', monitorMode.toUpperCase()]
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-2 py-1 bg-gray-800/40 rounded">
                  <span className="text-gray-400">{k}</span><span className="text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Summary — scrollable */}
        {showCodeSummary && (
          <div className="mx-3 mb-2 p-2 rounded-lg border border-gray-600/50" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-gray-300">CODE SUMMARY ({interventionLog.length} events)</span>
              <button onClick={() => setShowCodeSummary(false)} className="text-gray-400 hover:text-white"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="max-h-[250px] overflow-y-auto scrollbar-thin">
              {interventionLog.length === 0 ? (
                <span className="text-[9px] font-mono text-gray-500 block py-2 text-center">No events recorded yet</span>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800/50">
                    <th className="text-[7px] font-mono text-gray-500 text-left px-2 py-1 w-[65px]">TIME</th>
                    <th className="text-[7px] font-mono text-gray-500 text-left px-2 py-1 w-[80px]">ACTION</th>
                    <th className="text-[7px] font-mono text-gray-500 text-left px-2 py-1">DETAIL</th>
                  </tr></thead>
                  <tbody>
                    {[...interventionLog].reverse().map((e, i) => (
                      <tr key={i} className={`border-b border-gray-800/20 ${i === 0 ? 'bg-green-950/20' : ''}`}>
                        <td className="text-[8px] font-mono text-gray-400 px-2 py-0.5">{e.time}</td>
                        <td className={`text-[8px] font-mono font-bold px-2 py-0.5 ${
                          e.action.includes('SHOCK') || e.action.includes('DEFIB') ? 'text-red-400' :
                          e.action.includes('PACER') ? 'text-blue-400' : 'text-green-400'}`}>{e.action}</td>
                        <td className="text-[8px] font-mono text-gray-300 px-2 py-0.5">{e.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Shock Delivered */}
        {shockDelivered && (
          <div className="mx-3 mb-2 p-3 rounded-lg border-2 border-red-500 bg-red-950/80 animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <Zap className="h-6 w-6 text-yellow-400" />
              <div className="text-center">
                <span className="text-xl font-mono font-bold text-red-400 tracking-widest block">SHOCK DELIVERED</span>
                <span className="text-[10px] font-mono text-yellow-300">{selectedEnergy}J {syncMode ? 'SYNC' : 'ASYNC'} — #{shockCount}</span>
              </div>
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Pacer active */}
        {pacerActive && monitorMode === 'pacer' && (
          <div className="mx-3 mb-2 p-2 rounded border border-blue-500/60 bg-blue-950/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-400"><Zap className="h-3 w-3 inline animate-pulse" /> PACING ACTIVE</span>
              <span className="text-[9px] font-mono text-blue-300">{pacerRate}ppm / {pacerOutput}mA — {pacerOutput >= 60 ? 'CAPTURE' : 'NO CAPTURE'}</span>
            </div>
          </div>
        )}

        {/* Treatment effect */}
        {treatmentEffectIndicator && (
          <div className="mx-3 mb-2 p-2 rounded border border-green-700/50 bg-green-950/30 animate-pulse">
            <span className="text-[10px] font-mono font-bold text-green-400"><TrendingUp className="h-3 w-3 inline" /> TREATMENT: </span>
            <span className="text-[9px] font-mono text-green-300/80">{treatmentEffectIndicator}</span>
          </div>
        )}

        {/* Rhythm banner */}
        {visibleVitals.has('pulse') && currentRhythm.id !== 'nsr' && (
          <div className={`mx-3 mb-2 p-2 rounded border ${
            currentRhythm.category === 'arrest' ? 'border-red-600/60 bg-red-950/40' :
            currentRhythm.category === 'stemi' ? 'border-orange-600/50 bg-orange-950/30' : 'border-yellow-600/50 bg-yellow-950/30'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold ${
                currentRhythm.category === 'arrest' ? 'text-red-400' : currentRhythm.category === 'stemi' ? 'text-orange-400' : 'text-yellow-400'
              }`}>RHYTHM: {currentRhythm.name.toUpperCase()}</span>
              {currentRhythm.category === 'stemi' && (
                <button onClick={() => setShow12Lead(true)} className="text-[8px] font-mono text-green-400 hover:text-green-300 cursor-pointer">VIEW 12-LEAD</button>
              )}
            </div>
          </div>
        )}

        {/* Alarms & deterioration */}
        {(alarmStatus.count > 0 || minutesElapsed >= 2) && (
          <div className="mx-3 mb-2 space-y-1">
            {alarmStatus.count > 0 && alarmsEnabled && (
              <div className={`p-2 rounded border ${alarmStatus.hasCritical ? 'bg-red-950/60 border-red-700 animate-pulse' : 'bg-amber-950/40 border-amber-700'}`}>
                <span className={`text-[10px] font-mono font-bold ${alarmStatus.hasCritical ? 'text-red-400' : 'text-amber-400'}`}>
                  <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />{alarmStatus.count} ALARM{alarmStatus.count > 1 ? 'S' : ''} ACTIVE
                </span>
              </div>
            )}
            {(() => {
              const status = getDeteriorationStatus(caseSeverity, minutesElapsed);
              if (status.urgency === 'low' && minutesElapsed < 2) return null;
              const colors: Record<string, string> = { low: 'text-green-400 border-green-800/50', medium: 'text-yellow-400 border-yellow-800/50',
                high: 'text-orange-400 border-orange-800/50', extreme: 'text-red-400 border-red-700/50 animate-pulse' };
              return (<div className={`p-2 rounded border bg-black/40 ${colors[status.urgency]}`}>
                <span className="text-[9px] font-mono font-bold">{status.status.toUpperCase()}</span>
                {status.percentDeteriorated > 20 && <Progress value={status.percentDeteriorated} className="h-0.5 mt-1" />}
              </div>);
            })()}
          </div>
        )}

        {activeAssessments.size > 0 && (
          <div className="mx-3 mb-2 p-2 rounded border border-blue-800/50 bg-blue-950/30">
            <span className="text-[9px] font-mono font-bold text-blue-400"><Timer className="h-3 w-3 inline animate-pulse mr-1" />
              {activeAssessments.size} ASSESSMENT{activeAssessments.size > 1 ? 'S' : ''} IN PROGRESS</span>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-1 flex items-center justify-between"
          style={{ background: 'linear-gradient(180deg, #2e3136 0%, #3a3d42 100%)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <span className="text-[8px] font-mono text-gray-500 tracking-wider">TLC Monitor v1.0</span>
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-mono text-gray-600">{visibleVitals.size}/{availableVitals.length}</span>
            {shockCount > 0 && <span className="text-[8px] font-mono text-red-500"><Zap className="h-2.5 w-2.5 inline" /> x{shockCount}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VitalSignsMonitor;
