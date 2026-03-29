/**
 * ECG Rhythm Waveform Engine
 *
 * Mathematical waveform generators for different cardiac rhythms.
 * Each rhythm defines the PQRST morphology for all 12 leads.
 * Maps case categories/subcategories to appropriate rhythms.
 *
 * Reference: Life in the Fast Lane (LITFL) ECG Library
 * https://litfl.com/ecg-library/
 */

// Context passed to waveform functions for dynamic behaviour
export interface WaveformContext {
  heartRate?: number;
  beatIndex?: number;
}

// A single-lead waveform generator function
// Input: t (0-1 normalized position within one beat cycle)
// Output: amplitude (-1 to 1)
export type WaveformFn = (t: number, context?: WaveformContext) => number;

// 12-Lead morphology set
export interface TwelveLeadMorphology {
  I: WaveformFn;
  II: WaveformFn;
  III: WaveformFn;
  aVR: WaveformFn;
  aVL: WaveformFn;
  aVF: WaveformFn;
  V1: WaveformFn;
  V2: WaveformFn;
  V3: WaveformFn;
  V4: WaveformFn;
  V5: WaveformFn;
  V6: WaveformFn;
}

export type LeadName = keyof TwelveLeadMorphology;

export const ALL_LEADS: LeadName[] = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

export interface ECGRhythm {
  id: string;
  name: string;
  description: string;
  category: 'normal' | 'tachycardia' | 'bradycardia' | 'arrhythmia' | 'block' | 'stemi' | 'arrest';
  defaultRate: number;
  rateRange: [number, number];
  regular: boolean;
  leads: TwelveLeadMorphology;
  // For irregular rhythms, this modifies the beat-to-beat interval
  irregularityFn?: (beatIndex: number) => number; // multiplier for interval
}

// ============================================================================
// WAVEFORM BUILDING BLOCKS
// ============================================================================

// Normal P wave
const pWave = (t: number, amplitude = 0.08, start = 0, width = 0.1): number => {
  if (t < start || t > start + width) return 0;
  return Math.sin(((t - start) / width) * Math.PI) * amplitude;
};

// Normal QRS complex
const qrsComplex = (t: number, qAmp = -0.1, rAmp = 1.0, sAmp = -0.2, start = 0.16, width = 0.08): number => {
  if (t < start || t > start + width) return 0;
  const pos = (t - start) / width;
  // Q wave (first 20%)
  if (pos < 0.2) return qAmp * Math.sin(pos / 0.2 * Math.PI);
  // R wave (20-50%)
  if (pos < 0.5) return qAmp * (1 - (pos - 0.2) / 0.3) + rAmp * ((pos - 0.2) / 0.3);
  // S wave (50-80%)
  if (pos < 0.8) return rAmp * (1 - (pos - 0.5) / 0.3) + sAmp * ((pos - 0.5) / 0.3);
  // Return to baseline (80-100%)
  return sAmp * (1 - (pos - 0.8) / 0.2);
};

// Normal T wave
const tWave = (t: number, amplitude = 0.15, start = 0.35, width = 0.15): number => {
  if (t < start || t > start + width) return 0;
  return Math.sin(((t - start) / width) * Math.PI) * amplitude;
};

// ST elevation
const stElevation = (t: number, elevation = 0.25, start = 0.24, width = 0.12): number => {
  if (t < start || t > start + width) return 0;
  return elevation * (1 - Math.pow(2 * (t - start) / width - 1, 2));
};

// ST depression
const stDepression = (t: number, depth = -0.15, start = 0.24, width = 0.12): number => {
  if (t < start || t > start + width) return 0;
  return depth * (1 - Math.pow(2 * (t - start) / width - 1, 2));
};

// Wide QRS (for VT, bundle branch blocks)
const wideQRS = (t: number, amplitude = 0.9, start = 0.14, width = 0.16): number => {
  if (t < start || t > start + width) return 0;
  const pos = (t - start) / width;
  return amplitude * Math.sin(pos * Math.PI * 2) * (1 - pos * 0.5);
};

// VFib chaotic waveform
const vfibWave = (t: number): number => {
  return (
    Math.sin(t * Math.PI * 18) * 0.4 +
    Math.sin(t * Math.PI * 23 + 1.3) * 0.3 +
    Math.sin(t * Math.PI * 7 + 0.7) * 0.2 +
    Math.sin(t * Math.PI * 41 + 2.1) * 0.15
  ) * (0.5 + Math.sin(t * Math.PI * 3) * 0.4);
};

// Inverted T wave
const invertedT = (t: number, amplitude = -0.15, start = 0.35, width = 0.15): number => {
  if (t < start || t > start + width) return 0;
  return Math.sin(((t - start) / width) * Math.PI) * amplitude;
};

// Hyperacute T wave (tall, peaked)
const hyperacuteT = (t: number, amplitude = 0.4, start = 0.30, width = 0.2): number => {
  if (t < start || t > start + width) return 0;
  const pos = (t - start) / width;
  return amplitude * Math.pow(Math.sin(pos * Math.PI), 1.5);
};

// Flutter waves (sawtooth pattern for atrial flutter)
// Atrial rate ~300bpm produces classic sawtooth "F-waves" best seen in leads II, III, aVF.
// At 2:1 block (ventricular rate 150bpm), each R-R interval spans 2 atrial cycles.
// At 4:1 block (ventricular rate 75bpm), each R-R interval spans 4 atrial cycles.
// Since t is normalized 0-1 per ventricular beat and we can't dynamically access heart rate,
// we use 4 cycles which produces clearly visible sawtooth waves across the typical rate range.
// At 150bpm (2:1): 4 sawtooth waves in 0.4s = 600/min visible rate (slightly fast but very visible).
// At 75bpm (4:1): 4 sawtooth waves in 0.8s = 300/min (anatomically correct).
const flutterWaves = (t: number, amplitude = 0.18, context?: WaveformContext): number => {
  const hr = context?.heartRate || 75;
  const flutterCycles = Math.max(2, Math.round(300 / hr));
  const phase = (t * flutterCycles) % 1;
  // Sawtooth wave: slow downstroke (70% of cycle) + rapid upstroke (30%) -- classic flutter morphology
  if (phase < 0.7) {
    return amplitude * (1 - (phase / 0.7) * 2); // Gradual negative deflection
  }
  return amplitude * (-1 + ((phase - 0.7) / 0.3) * 2); // Sharp positive upstroke
};

// ============================================================================
// RHYTHM DEFINITIONS
// ============================================================================

// Helper: Create a standard lead from a base waveform with amplitude scaling
function makeLeadSet(
  baseWave: WaveformFn,
  scales: Record<LeadName, number>,
  modifiers?: Partial<Record<LeadName, WaveformFn>>
): TwelveLeadMorphology {
  const leads: any = {};
  for (const lead of ALL_LEADS) {
    const scale = scales[lead] ?? 1;
    const modifier = modifiers?.[lead];
    leads[lead] = (t: number, context?: WaveformContext) => {
      const base = baseWave(t, context) * scale;
      return modifier ? base + modifier(t, context) : base;
    };
  }
  return leads as TwelveLeadMorphology;
}

// Normal limb lead amplitude relationships
const NORMAL_SCALES: Record<LeadName, number> = {
  I: 0.7, II: 1.0, III: 0.5, aVR: -0.6, aVL: 0.4, aVF: 0.8,
  V1: 0.4, V2: 0.8, V3: 1.0, V4: 1.0, V5: 0.9, V6: 0.7,
};

// ============================================================================
// NORMAL SINUS RHYTHM
// ============================================================================
const nsrWave: WaveformFn = (t) =>
  pWave(t) + qrsComplex(t) + tWave(t);

export const normalSinusRhythm: ECGRhythm = {
  id: 'nsr',
  name: 'Normal Sinus Rhythm',
  description: 'Regular rhythm, P before every QRS, rate 60-100',
  category: 'normal',
  defaultRate: 75,
  rateRange: [60, 100],
  regular: true,
  leads: makeLeadSet(nsrWave, NORMAL_SCALES),
};

// ============================================================================
// SINUS TACHYCARDIA
// ============================================================================
export const sinusTachycardia: ECGRhythm = {
  id: 'sinus-tachy',
  name: 'Sinus Tachycardia',
  description: 'Regular sinus rhythm, rate >100',
  category: 'tachycardia',
  defaultRate: 120,
  rateRange: [100, 180],
  regular: true,
  leads: makeLeadSet(nsrWave, NORMAL_SCALES),
};

// ============================================================================
// SINUS BRADYCARDIA
// ============================================================================
export const sinusBradycardia: ECGRhythm = {
  id: 'sinus-brady',
  name: 'Sinus Bradycardia',
  description: 'Regular sinus rhythm, rate <60',
  category: 'bradycardia',
  defaultRate: 48,
  rateRange: [25, 59],
  regular: true,
  leads: makeLeadSet(nsrWave, NORMAL_SCALES),
};

// ============================================================================
// ATRIAL FIBRILLATION
// ============================================================================
const afibWave: WaveformFn = (t) => {
  // No P waves, just fibrillatory baseline + QRS + T
  const fibrillation = Math.sin(t * Math.PI * 30) * 0.02 + Math.sin(t * Math.PI * 17) * 0.015;
  return fibrillation + qrsComplex(t) + tWave(t);
};

export const atrialFibrillation: ECGRhythm = {
  id: 'afib',
  name: 'Atrial Fibrillation',
  description: 'Irregularly irregular rhythm, absent P waves, fibrillatory baseline',
  category: 'arrhythmia',
  defaultRate: 90,
  rateRange: [50, 170],
  regular: false,
  leads: makeLeadSet(afibWave, NORMAL_SCALES),
  irregularityFn: (beatIndex) => 0.7 + Math.sin(beatIndex * 2.7) * 0.3 + Math.sin(beatIndex * 1.3) * 0.15,
};

// ============================================================================
// ATRIAL FLUTTER
// ============================================================================
const aflutterWave: WaveformFn = (t, context?) =>
  flutterWaves(t, 0.18, context) + qrsComplex(t) + tWave(t, 0.08);

export const atrialFlutter: ECGRhythm = {
  id: 'aflutter',
  name: 'Atrial Flutter',
  description: 'Sawtooth flutter waves at ~300/min, typically 2:1 or 4:1 block',
  category: 'arrhythmia',
  defaultRate: 150,
  rateRange: [75, 150],
  regular: true,
  leads: makeLeadSet(aflutterWave, {
    ...NORMAL_SCALES,
    II: 1.0, III: 0.6, aVF: 0.9, // Flutter waves most visible in inferior leads
  }),
};

// ============================================================================
// SUPRAVENTRICULAR TACHYCARDIA (SVT)
// ============================================================================
const svtWave: WaveformFn = (t) => {
  // Narrow QRS, no visible P waves (buried in T)
  return qrsComplex(t, -0.05, 0.9, -0.15) + tWave(t, 0.1, 0.28, 0.12);
};

export const svt: ECGRhythm = {
  id: 'svt',
  name: 'SVT (Supraventricular Tachycardia)',
  description: 'Narrow complex tachycardia, regular, rate 150-250',
  category: 'tachycardia',
  defaultRate: 180,
  rateRange: [150, 250],
  regular: true,
  leads: makeLeadSet(svtWave, NORMAL_SCALES),
};

// ============================================================================
// VENTRICULAR TACHYCARDIA (VT)
// ============================================================================
const vtWave: WaveformFn = (t) => wideQRS(t, 0.9, 0.1, 0.2);

export const ventricularTachycardia: ECGRhythm = {
  id: 'vt',
  name: 'Ventricular Tachycardia',
  description: 'Wide complex tachycardia, regular, rate 150-250',
  category: 'arrhythmia',
  defaultRate: 180,
  rateRange: [100, 250],
  regular: true,
  leads: makeLeadSet(vtWave, {
    I: 0.8, II: 1.0, III: 0.9, aVR: -0.7, aVL: 0.5, aVF: 0.95,
    V1: 1.0, V2: 0.9, V3: 0.7, V4: 0.5, V5: 0.4, V6: 0.3,
  }),
};

// ============================================================================
// VENTRICULAR FIBRILLATION
// ============================================================================
export const ventricularFibrillation: ECGRhythm = {
  id: 'vfib',
  name: 'Ventricular Fibrillation',
  description: 'Chaotic, disorganized electrical activity - no cardiac output',
  category: 'arrest',
  defaultRate: 0,
  rateRange: [0, 0],
  regular: false,
  leads: makeLeadSet(vfibWave, {
    I: 0.6, II: 0.8, III: 0.7, aVR: 0.5, aVL: 0.6, aVF: 0.7,
    V1: 0.5, V2: 0.7, V3: 0.9, V4: 1.0, V5: 0.8, V6: 0.6,
  }),
};

// ============================================================================
// ASYSTOLE
// ============================================================================
const asystoleWave: WaveformFn = (t) =>
  (Math.random() - 0.5) * 0.02; // Just noise

export const asystole: ECGRhythm = {
  id: 'asystole',
  name: 'Asystole',
  description: 'Flat line - no electrical activity',
  category: 'arrest',
  defaultRate: 0,
  rateRange: [0, 0],
  regular: true,
  leads: makeLeadSet(asystoleWave, {
    I: 1, II: 1, III: 1, aVR: 1, aVL: 1, aVF: 1,
    V1: 1, V2: 1, V3: 1, V4: 1, V5: 1, V6: 1,
  }),
};

// ============================================================================
// ANTERIOR STEMI
// ============================================================================
const anteriorSTEMIWave: WaveformFn = (t) =>
  pWave(t) + qrsComplex(t) + stElevation(t, 0.3) + hyperacuteT(t);

const anteriorSTEMIReciprocal: WaveformFn = (t) =>
  pWave(t) + qrsComplex(t, -0.05, 0.8, -0.1) + stDepression(t) + invertedT(t, -0.1);

export const anteriorSTEMI: ECGRhythm = {
  id: 'anterior-stemi',
  name: 'Anterior STEMI',
  description: 'ST elevation V1-V4, reciprocal depression inferior leads. LAD occlusion.',
  category: 'stemi',
  defaultRate: 100,
  rateRange: [60, 140],
  regular: true,
  leads: {
    I: (t) => nsrWave(t) * 0.7,
    II: (t) => anteriorSTEMIReciprocal(t) * 0.8,
    III: (t) => anteriorSTEMIReciprocal(t) * 0.6,
    aVR: (t) => nsrWave(t) * -0.5,
    aVL: (t) => nsrWave(t) * 0.4,
    aVF: (t) => anteriorSTEMIReciprocal(t) * 0.7,
    V1: (t) => anteriorSTEMIWave(t) * 0.6,
    V2: (t) => anteriorSTEMIWave(t) * 0.9,
    V3: (t) => anteriorSTEMIWave(t) * 1.0,
    V4: (t) => anteriorSTEMIWave(t) * 0.85,
    V5: (t) => nsrWave(t) * 0.7,
    V6: (t) => nsrWave(t) * 0.6,
  },
};

// ============================================================================
// INFERIOR STEMI
// ============================================================================
const inferiorSTEMIWave: WaveformFn = (t) =>
  pWave(t) + qrsComplex(t) + stElevation(t, 0.25) + hyperacuteT(t, 0.3);

export const inferiorSTEMI: ECGRhythm = {
  id: 'inferior-stemi',
  name: 'Inferior STEMI',
  description: 'ST elevation II, III, aVF. Reciprocal depression I, aVL. RCA occlusion.',
  category: 'stemi',
  defaultRate: 55,
  rateRange: [40, 100],
  regular: true,
  leads: {
    I: (t) => anteriorSTEMIReciprocal(t) * 0.5,
    II: (t) => inferiorSTEMIWave(t) * 1.0,
    III: (t) => inferiorSTEMIWave(t) * 1.1, // Greater in III than II = RCA
    aVR: (t) => nsrWave(t) * -0.5,
    aVL: (t) => anteriorSTEMIReciprocal(t) * 0.5,
    aVF: (t) => inferiorSTEMIWave(t) * 0.9,
    V1: (t) => (pWave(t) + qrsComplex(t, -0.05, 0.4, -0.1) + stDepression(t, -0.1)) * 0.5,
    V2: (t) => (pWave(t) + qrsComplex(t, -0.05, 0.6, -0.1) + stDepression(t, -0.1)) * 0.6,
    V3: (t) => nsrWave(t) * 0.8,
    V4: (t) => nsrWave(t) * 0.9,
    V5: (t) => nsrWave(t) * 0.8,
    V6: (t) => nsrWave(t) * 0.7,
  },
};

// ============================================================================
// LATERAL STEMI
// ============================================================================
export const lateralSTEMI: ECGRhythm = {
  id: 'lateral-stemi',
  name: 'Lateral STEMI',
  description: 'ST elevation I, aVL, V5-V6. LCx occlusion.',
  category: 'stemi',
  defaultRate: 85,
  rateRange: [60, 120],
  regular: true,
  leads: {
    I: (t) => anteriorSTEMIWave(t) * 0.8,
    II: (t) => nsrWave(t) * 0.8,
    III: (t) => anteriorSTEMIReciprocal(t) * 0.5,
    aVR: (t) => nsrWave(t) * -0.5,
    aVL: (t) => anteriorSTEMIWave(t) * 0.7,
    aVF: (t) => anteriorSTEMIReciprocal(t) * 0.4,
    V1: (t) => nsrWave(t) * 0.4,
    V2: (t) => nsrWave(t) * 0.6,
    V3: (t) => nsrWave(t) * 0.8,
    V4: (t) => nsrWave(t) * 0.9,
    V5: (t) => anteriorSTEMIWave(t) * 0.85,
    V6: (t) => anteriorSTEMIWave(t) * 0.7,
  },
};

// ============================================================================
// NSTEMI (ST depression, T-wave inversion)
// ============================================================================
const nstemiWave: WaveformFn = (t) =>
  pWave(t) + qrsComplex(t) + stDepression(t, -0.12) + invertedT(t, -0.12);

export const nstemi: ECGRhythm = {
  id: 'nstemi',
  name: 'NSTEMI',
  description: 'ST depression and T-wave inversion. Subendocardial ischemia.',
  category: 'stemi',
  defaultRate: 90,
  rateRange: [60, 130],
  regular: true,
  leads: makeLeadSet(nstemiWave, {
    ...NORMAL_SCALES,
    V3: 1.0, V4: 1.0, V5: 0.9,
  }),
};

// ============================================================================
// THIRD DEGREE (COMPLETE) HEART BLOCK
// ============================================================================
// P waves and QRS complexes march independently
const chbWave: WaveformFn = (t) => {
  // QRS at its own rate (escape rhythm)
  const qrs = qrsComplex(t, -0.05, 0.7, -0.15, 0.2, 0.1);
  const tw = tWave(t, 0.12, 0.35, 0.15);
  // P waves at a faster rate (~75bpm) independent of QRS
  const p1 = pWave(t, 0.08, 0.0, 0.08);
  const p2 = pWave(t, 0.08, 0.45, 0.08);
  return p1 + p2 + qrs + tw;
};

export const completeHeartBlock: ECGRhythm = {
  id: 'chb',
  name: 'Complete Heart Block (3rd Degree)',
  description: 'AV dissociation. P waves and QRS independent. Wide escape rhythm.',
  category: 'block',
  defaultRate: 40,
  rateRange: [25, 50],
  regular: true,
  leads: makeLeadSet(chbWave, NORMAL_SCALES),
};

// ============================================================================
// SECOND DEGREE TYPE I (WENCKEBACH)
// ============================================================================
// Dedicated waveform: PR prolongation based on beat index within 4-beat cycle
// Beat 0: PR = 0.16 (normal), Beat 1: PR = 0.20, Beat 2: PR = 0.24, Beat 3: P only (dropped QRS)
const wenckebachWave: WaveformFn = (t, context?) => {
  const cyclePos = (context?.beatIndex ?? 0) % 4;

  // P wave always present
  const p = pWave(t, 0.08, 0, 0.1);

  if (cyclePos === 3) {
    // Dropped beat: P wave only, no QRS or T
    return p;
  }

  // Progressive PR prolongation: 0.16, 0.20, 0.24
  const prDelay = 0.16 + cyclePos * 0.04;
  const qrs = qrsComplex(t, -0.1, 1.0, -0.2, prDelay, 0.08);
  const tw = tWave(t, 0.15, prDelay + 0.19, 0.15);
  return p + qrs + tw;
};

export const wenckebachBlock: ECGRhythm = {
  id: 'wenckebach',
  name: 'Second Degree Type I (Wenckebach)',
  description: 'Progressive PR prolongation then dropped beat',
  category: 'block',
  defaultRate: 60,
  rateRange: [40, 80],
  regular: false,
  leads: makeLeadSet(wenckebachWave, NORMAL_SCALES),
  irregularityFn: (beatIndex) => {
    // Every 4th beat is longer (dropped beat)
    const cyclePos = beatIndex % 4;
    if (cyclePos === 3) return 1.8; // Long pause (dropped beat)
    return 0.85 + cyclePos * 0.05; // Progressively longer
  },
};

// ============================================================================
// SECOND DEGREE TYPE II
// ============================================================================
export const mobiType2: ECGRhythm = {
  id: 'mobitz2',
  name: 'Second Degree Type II (Mobitz)',
  description: 'Fixed PR interval with intermittent dropped QRS',
  category: 'block',
  defaultRate: 55,
  rateRange: [35, 70],
  regular: false,
  leads: makeLeadSet(nsrWave, NORMAL_SCALES),
  irregularityFn: (beatIndex) => {
    // Every 3rd beat is dropped
    return beatIndex % 3 === 2 ? 2.0 : 1.0;
  },
};

// ============================================================================
// TORSADES DE POINTES
// ============================================================================
const torsadesWave: WaveformFn = (t) => {
  // Twisting axis pattern
  const twist = Math.sin(t * Math.PI * 2) * 0.8;
  const rapid = Math.sin(t * Math.PI * 20 + twist * 3) * (0.4 + Math.abs(twist) * 0.5);
  return rapid;
};

export const torsadesDePointes: ECGRhythm = {
  id: 'torsades',
  name: 'Torsades de Pointes',
  description: 'Polymorphic VT with twisting QRS axis. Associated with long QT.',
  category: 'arrest',
  defaultRate: 250,
  rateRange: [200, 300],
  regular: false,
  leads: makeLeadSet(torsadesWave, {
    I: 0.7, II: 1.0, III: 0.8, aVR: 0.6, aVL: 0.5, aVF: 0.9,
    V1: 0.6, V2: 0.8, V3: 1.0, V4: 0.9, V5: 0.7, V6: 0.5,
  }),
};

// ============================================================================
// PEA (Pulseless Electrical Activity) - looks like normal but no pulse
// ============================================================================
export const pea: ECGRhythm = {
  id: 'pea',
  name: 'PEA (Pulseless Electrical Activity)',
  description: 'Organized electrical activity but no palpable pulse',
  category: 'arrest',
  defaultRate: 60,
  rateRange: [20, 120],
  regular: true,
  leads: makeLeadSet(nsrWave, NORMAL_SCALES),
};

// ============================================================================
// FIRST DEGREE HEART BLOCK
// ============================================================================
const firstDegreeBlockWave: WaveformFn = (t) => {
  // Same as NSR but with prolonged PR interval (>200ms)
  // P wave at normal position, then flat segment, then delayed QRS
  const p = pWave(t, 0.08, 0, 0.1);
  // Shift QRS later by adding extra PR delay (start at 0.22 instead of 0.16)
  const qrs = qrsComplex(t, -0.1, 1.0, -0.2, 0.22, 0.08);
  const tw = tWave(t, 0.15, 0.42, 0.15);
  return p + qrs + tw;
};

export const firstDegreeBlock: ECGRhythm = {
  id: 'first-degree-block',
  name: 'First Degree Heart Block',
  description: 'Prolonged PR interval >200ms, all P waves conducted',
  category: 'block',
  defaultRate: 70,
  rateRange: [55, 90],
  regular: true,
  leads: makeLeadSet(firstDegreeBlockWave, NORMAL_SCALES),
};

// ============================================================================
// JUNCTIONAL RHYTHM
// ============================================================================
const junctionalWave: WaveformFn = (t) => {
  // No P wave (or small inverted P near QRS), narrow QRS, rate 40-60
  const invertedP = pWave(t, -0.03, 0.12, 0.05); // Small inverted P near QRS
  const qrs = qrsComplex(t, -0.1, 0.9, -0.15, 0.16, 0.08);
  const tw = tWave(t, 0.12, 0.35, 0.15);
  return invertedP + qrs + tw;
};

export const junctionalRhythm: ECGRhythm = {
  id: 'junctional',
  name: 'Junctional Rhythm',
  description: 'Narrow QRS, absent or inverted P waves, rate 40-60',
  category: 'bradycardia',
  defaultRate: 50,
  rateRange: [40, 60],
  regular: true,
  leads: makeLeadSet(junctionalWave, NORMAL_SCALES),
};

// ============================================================================
// IDIOVENTRICULAR RHYTHM
// ============================================================================
const idioventricularWave: WaveformFn = (t) => {
  // Wide bizarre QRS, no P waves, very slow rate 20-40
  return wideQRS(t, 0.7, 0.12, 0.2);
};

export const idioventricularRhythm: ECGRhythm = {
  id: 'idioventricular',
  name: 'Idioventricular Rhythm',
  description: 'Wide QRS escape rhythm, no P waves, rate 20-40',
  category: 'bradycardia',
  defaultRate: 30,
  rateRange: [20, 40],
  regular: true,
  leads: makeLeadSet(idioventricularWave, {
    I: 0.8, II: 1.0, III: 0.9, aVR: -0.7, aVL: 0.5, aVF: 0.95,
    V1: 1.0, V2: 0.9, V3: 0.7, V4: 0.5, V5: 0.4, V6: 0.3,
  }),
};

// ============================================================================
// ACCELERATED IDIOVENTRICULAR RHYTHM (AIVR)
// ============================================================================
const aivrWave: WaveformFn = (t) => {
  // Wide QRS, no P waves, rate 60-120 (faster than idioventricular)
  // Often seen post-reperfusion
  return wideQRS(t, 0.8, 0.12, 0.18);
};

export const aivr: ECGRhythm = {
  id: 'aivr',
  name: 'Accelerated Idioventricular Rhythm (AIVR)',
  description: 'Wide QRS, no P waves, rate 60-120. Often post-reperfusion.',
  category: 'arrhythmia',
  defaultRate: 80,
  rateRange: [60, 120],
  regular: true,
  leads: makeLeadSet(aivrWave, {
    I: 0.8, II: 1.0, III: 0.9, aVR: -0.7, aVL: 0.5, aVF: 0.95,
    V1: 1.0, V2: 0.9, V3: 0.7, V4: 0.5, V5: 0.4, V6: 0.3,
  }),
};

// ============================================================================
// FINE VENTRICULAR FIBRILLATION
// ============================================================================
const fineVfibWave: WaveformFn = (t) => {
  // Same as VF but very low amplitude - almost mimics asystole
  return vfibWave(t) * 0.25;
};

export const fineVF: ECGRhythm = {
  id: 'vfib-fine',
  name: 'Fine Ventricular Fibrillation',
  description: 'Very low amplitude chaotic waves, can mimic asystole. Still shockable.',
  category: 'arrest',
  defaultRate: 0,
  rateRange: [0, 0],
  regular: false,
  leads: makeLeadSet(fineVfibWave, {
    I: 0.6, II: 0.8, III: 0.7, aVR: 0.5, aVL: 0.6, aVF: 0.7,
    V1: 0.5, V2: 0.7, V3: 0.9, V4: 1.0, V5: 0.8, V6: 0.6,
  }),
};

// ============================================================================
// WPW (WOLFF-PARKINSON-WHITE)
// ============================================================================
const wpwWave: WaveformFn = (t) => {
  // Short PR interval, delta wave (slurred QRS upstroke), wide QRS
  const p = pWave(t, 0.08, 0, 0.1);
  // Delta wave: slurred upstroke starting early (short PR)
  const deltaStart = 0.12; // Short PR
  const deltaWidth = 0.05;
  let delta = 0;
  if (t >= deltaStart && t < deltaStart + deltaWidth) {
    const pos = (t - deltaStart) / deltaWidth;
    delta = pos * 0.4; // Gradual slurred upstroke
  }
  // QRS starts slightly later, wider than normal
  const qrs = qrsComplex(t, -0.05, 0.9, -0.2, 0.15, 0.12);
  const tw = tWave(t, 0.12, 0.38, 0.15);
  return p + delta + qrs + tw;
};

export const wpw: ECGRhythm = {
  id: 'wpw',
  name: 'WPW (Wolff-Parkinson-White)',
  description: 'Short PR, delta wave (slurred QRS upstroke), wide QRS. Pre-excitation syndrome.',
  category: 'arrhythmia',
  defaultRate: 80,
  rateRange: [60, 100],
  regular: true,
  leads: makeLeadSet(wpwWave, NORMAL_SCALES),
};

// ============================================================================
// LEFT BUNDLE BRANCH BLOCK (LBBB)
// ============================================================================
// Wide QRS with M-shaped pattern in lateral leads (I, aVL, V5, V6)
// Deep QS (inverted) in V1, discordant ST/T waves
const lbbbLateralQRS = (t: number, _context?: WaveformContext): number => {
  // M-shaped wide QRS: two peaks
  const start = 0.14;
  const width = 0.16;
  if (t < start || t > start + width) return 0;
  const pos = (t - start) / width;
  // First peak (R), dip, second peak (R')
  const r1 = Math.sin(pos * Math.PI * 2) * 0.8;
  const r2 = Math.sin((pos - 0.35) * Math.PI * 2) * 0.6;
  return Math.max(r1, 0) + Math.max(r2, 0) * (pos > 0.3 ? 1 : 0);
};

const lbbbV1QRS = (t: number, _context?: WaveformContext): number => {
  // Deep QS pattern (inverted) in V1
  const start = 0.14;
  const width = 0.16;
  if (t < start || t > start + width) return 0;
  const pos = (t - start) / width;
  return -0.9 * Math.sin(pos * Math.PI) * (1 - pos * 0.3);
};

// Discordant ST/T: opposite direction to QRS
const lbbbDiscordantST_Lateral = (t: number, _context?: WaveformContext): number => {
  // QRS is upright in lateral leads, so ST/T is depressed/inverted
  return stDepression(t, -0.1, 0.30, 0.1) + invertedT(t, -0.12, 0.38, 0.15);
};

const lbbbDiscordantST_V1 = (t: number, _context?: WaveformContext): number => {
  // QRS is inverted in V1, so ST/T is elevated/upright
  return stElevation(t, 0.1, 0.30, 0.1) + tWave(t, 0.15, 0.38, 0.15);
};

const lbbbWaveLateral: WaveformFn = (t, context?) =>
  pWave(t) + lbbbLateralQRS(t, context) + lbbbDiscordantST_Lateral(t, context);

const lbbbWaveV1: WaveformFn = (t, context?) =>
  pWave(t) + lbbbV1QRS(t, context) + lbbbDiscordantST_V1(t, context);

const lbbbWaveNeutral: WaveformFn = (t, context?) =>
  pWave(t) + wideQRS(t, 0.6, 0.14, 0.16) + tWave(t, 0.1, 0.38, 0.15);

export const lbbb: ECGRhythm = {
  id: 'lbbb',
  name: 'Left Bundle Branch Block (LBBB)',
  description: 'Wide QRS with M-shaped pattern in lateral leads, deep QS in V1, discordant ST/T changes',
  category: 'block',
  defaultRate: 75,
  rateRange: [40, 130],
  regular: true,
  leads: {
    I: (t, ctx?) => lbbbWaveLateral(t, ctx) * 0.8,
    II: (t, ctx?) => lbbbWaveNeutral(t, ctx) * 1.0,
    III: (t, ctx?) => lbbbWaveNeutral(t, ctx) * 0.5,
    aVR: (t, ctx?) => lbbbWaveNeutral(t, ctx) * -0.6,
    aVL: (t, ctx?) => lbbbWaveLateral(t, ctx) * 0.6,
    aVF: (t, ctx?) => lbbbWaveNeutral(t, ctx) * 0.7,
    V1: (t, ctx?) => lbbbWaveV1(t, ctx) * 0.9,
    V2: (t, ctx?) => lbbbWaveV1(t, ctx) * 0.7,
    V3: (t, ctx?) => lbbbWaveNeutral(t, ctx) * 0.6,
    V4: (t, ctx?) => lbbbWaveNeutral(t, ctx) * 0.8,
    V5: (t, ctx?) => lbbbWaveLateral(t, ctx) * 0.9,
    V6: (t, ctx?) => lbbbWaveLateral(t, ctx) * 0.7,
  },
};

// ============================================================================
// RIGHT BUNDLE BRANCH BLOCK (RBBB)
// ============================================================================
// rsR' pattern in V1-V2, wide S wave in I, V5, V6
const rbbbV1QRS = (t: number, _context?: WaveformContext): number => {
  // rsR' pattern: small r, small s, then tall R'
  const start = 0.14;
  const width = 0.14;
  if (t < start || t > start + width) return 0;
  const pos = (t - start) / width;
  if (pos < 0.2) return 0.3 * Math.sin(pos / 0.2 * Math.PI); // small r
  if (pos < 0.4) return -0.2 * Math.sin((pos - 0.2) / 0.2 * Math.PI); // small s
  if (pos < 0.75) return 0.9 * Math.sin((pos - 0.4) / 0.35 * Math.PI); // tall R'
  return 0.9 * (1 - (pos - 0.75) / 0.25) * 0.3; // return to baseline
};

const rbbbLateralQRS = (t: number, _context?: WaveformContext): number => {
  // Normal R then wide slurred S wave
  const start = 0.14;
  const width = 0.14;
  if (t < start || t > start + width) return 0;
  const pos = (t - start) / width;
  if (pos < 0.35) return 0.8 * Math.sin(pos / 0.35 * Math.PI); // Normal R
  // Wide S wave
  return -0.35 * Math.sin((pos - 0.35) / 0.65 * Math.PI);
};

const rbbbWaveV1: WaveformFn = (t, _context?) =>
  pWave(t) + rbbbV1QRS(t) + tWave(t, -0.1, 0.36, 0.15); // Inverted T in V1

const rbbbWaveLateral: WaveformFn = (t, _context?) =>
  pWave(t) + rbbbLateralQRS(t) + tWave(t, 0.12, 0.36, 0.15);

const rbbbWaveNeutral: WaveformFn = (t, _context?) =>
  pWave(t) + qrsComplex(t, -0.1, 0.9, -0.2, 0.14, 0.12) + tWave(t, 0.12, 0.36, 0.15);

export const rbbb: ECGRhythm = {
  id: 'rbbb',
  name: 'Right Bundle Branch Block (RBBB)',
  description: 'rsR\' pattern in V1-V2, wide S wave in lateral leads, slightly wide QRS',
  category: 'block',
  defaultRate: 75,
  rateRange: [40, 130],
  regular: true,
  leads: {
    I: (t, ctx?) => rbbbWaveLateral(t, ctx) * 0.7,
    II: (t, ctx?) => rbbbWaveNeutral(t, ctx) * 1.0,
    III: (t, ctx?) => rbbbWaveNeutral(t, ctx) * 0.5,
    aVR: (t, ctx?) => rbbbWaveNeutral(t, ctx) * -0.6,
    aVL: (t, ctx?) => rbbbWaveLateral(t, ctx) * 0.4,
    aVF: (t, ctx?) => rbbbWaveNeutral(t, ctx) * 0.8,
    V1: (t, ctx?) => rbbbWaveV1(t, ctx) * 1.0,
    V2: (t, ctx?) => rbbbWaveV1(t, ctx) * 0.8,
    V3: (t, ctx?) => rbbbWaveNeutral(t, ctx) * 0.8,
    V4: (t, ctx?) => rbbbWaveNeutral(t, ctx) * 0.9,
    V5: (t, ctx?) => rbbbWaveLateral(t, ctx) * 0.9,
    V6: (t, ctx?) => rbbbWaveLateral(t, ctx) * 0.7,
  },
};

// ============================================================================
// PREMATURE ATRIAL COMPLEXES (PACs)
// ============================================================================
export const pacs: ECGRhythm = {
  id: 'pacs',
  name: 'Premature Atrial Complexes (PACs)',
  description: 'Occasional early beats with normal QRS morphology, compensatory pauses',
  category: 'arrhythmia',
  defaultRate: 75,
  rateRange: [60, 100],
  regular: false,
  leads: makeLeadSet(nsrWave, NORMAL_SCALES),
  irregularityFn: (beatIndex) => {
    // Every 5th beat is 25% early, followed by compensatory pause
    const cyclePos = beatIndex % 5;
    if (cyclePos === 4) return 0.75; // PAC: 25% early
    if (cyclePos === 0 && beatIndex > 0) return 1.25; // Compensatory pause after PAC
    return 1.0;
  },
};

// ============================================================================
// PREMATURE VENTRICULAR COMPLEXES (PVCs)
// ============================================================================
// PVC waveform: every 4th beat uses wide QRS, normal beats use NSR
const pvcWave: WaveformFn = (t, context?) => {
  const beatIdx = context?.beatIndex ?? 0;
  if (beatIdx % 4 === 3) {
    // PVC beat: wide, bizarre QRS with no preceding P wave
    return wideQRS(t, 0.9, 0.12, 0.18);
  }
  // Normal sinus beat
  return nsrWave(t, context);
};

export const pvcs: ECGRhythm = {
  id: 'pvcs',
  name: 'Premature Ventricular Complexes (PVCs)',
  description: 'Every 4th beat is a wide-complex PVC with compensatory pause',
  category: 'arrhythmia',
  defaultRate: 75,
  rateRange: [60, 100],
  regular: false,
  leads: makeLeadSet(pvcWave, NORMAL_SCALES),
  irregularityFn: (beatIndex) => {
    const cyclePos = beatIndex % 4;
    if (cyclePos === 3) return 0.85; // PVC comes 15% early
    if (cyclePos === 0 && beatIndex > 0) return 1.40; // 40% longer compensatory pause
    return 1.0;
  },
};

// ============================================================================
// RHYTHM REGISTRY
// ============================================================================

export const ALL_RHYTHMS: ECGRhythm[] = [
  normalSinusRhythm,
  sinusTachycardia,
  sinusBradycardia,
  atrialFibrillation,
  atrialFlutter,
  svt,
  ventricularTachycardia,
  ventricularFibrillation,
  asystole,
  anteriorSTEMI,
  inferiorSTEMI,
  lateralSTEMI,
  nstemi,
  completeHeartBlock,
  wenckebachBlock,
  mobiType2,
  torsadesDePointes,
  pea,
  firstDegreeBlock,
  junctionalRhythm,
  idioventricularRhythm,
  aivr,
  fineVF,
  wpw,
  lbbb,
  rbbb,
  pacs,
  pvcs,
];

export const RHYTHM_MAP: Record<string, ECGRhythm> = Object.fromEntries(
  ALL_RHYTHMS.map(r => [r.id, r])
);

// ============================================================================
// CASE CATEGORY -> RHYTHM MAPPING
// ============================================================================

/**
 * Maps case category + subcategory to the appropriate ECG rhythm.
 * Falls back to sinus tachycardia for unknown categories.
 */
export function getRhythmForCase(category: string, subcategory?: string, heartRate?: number, caseTitle?: string, ecgFindings?: string[]): ECGRhythm {
  const cat = category.toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  const title = (caseTitle || '').toLowerCase();
  const ecgText = (ecgFindings || []).join(' ').toLowerCase();

  // Combined search text for matching — subcategory + title + ecg findings
  const searchText = `${sub} ${title} ${ecgText}`;

  // ===== Bundle branch blocks (check BEFORE STEMI to avoid false matches like LBBB-STEMI) =====
  if (searchText.includes('lbbb') || searchText.includes('left bundle branch block')) return lbbb;
  if (searchText.includes('rbbb') || searchText.includes('right bundle branch block')) return rbbb;

  // ===== STEMI cases =====
  if (searchText.includes('anterior stemi') || searchText.includes('stem-anterior') || sub === 'stem-anterior') return anteriorSTEMI;
  if (searchText.includes('inferior stemi') || searchText.includes('stem-inferior') || sub === 'stem-inferior') return inferiorSTEMI;
  if (searchText.includes('lateral stemi') || searchText.includes('stem-lateral') || sub === 'stem-lateral') return lateralSTEMI;
  if (searchText.includes('posterior stemi') || searchText.includes('stem-posterior') || sub === 'stem-posterior') return inferiorSTEMI;
  if (searchText.includes('nstemi') || searchText.includes('non-st elevation') || sub === 'nstemi') return nstemi;
  if (searchText.includes('de winter') || sub.includes('de-winter')) return nstemi; // De Winter = STEMI equivalent WITHOUT ST elevation

  // ===== Arrhythmias (check BEFORE generic "stemi" to avoid false matches) =====
  if (searchText.includes('atrial fibrillation') || searchText.includes('afib') || sub === 'afib' || sub.includes('atrial-fib')) return atrialFibrillation;
  if (searchText.includes('atrial flutter') || searchText.includes('aflutter') || sub === 'aflutter' || sub.includes('atrial-flutter')) return atrialFlutter;
  if (searchText.includes('svt') || searchText.includes('supraventricular tachycardia') || sub === 'svt' || sub.includes('supraventricular')) return svt;
  if (searchText.includes('ventricular tachycardia') || searchText.includes('vtach') || sub === 'vtach' || sub.includes('ventricular-tach')) return ventricularTachycardia;
  // Check specific arrest rhythms BEFORE generic "cardiac arrest"
  if (searchText.includes('asystole') || sub.includes('asystole')) return asystole;
  if (searchText.includes('pea') || searchText.includes('pulseless electrical') || sub.includes('pea')) return pea;
  if (searchText.includes('torsades') || sub.includes('torsades')) return torsadesDePointes;
  if (searchText.includes('fine vf') || searchText.includes('fine ventricular fibrillation')) return fineVF;
  if (searchText.includes('vfib') || searchText.includes('ventricular fibrillation') || searchText.includes('vf ') || sub === 'vfib') return ventricularFibrillation;
  // Generic cardiac arrest defaults to VF (most common shockable)
  if (searchText.includes('cardiac arrest') || searchText.includes('cardiac-arrest')) return ventricularFibrillation;

  // ===== Conduction blocks =====
  if (searchText.includes('heart-block') || searchText.includes('heart block') || searchText.includes('complete heart block') || searchText.includes('3rd degree') || searchText.includes('third degree') || sub.includes('3rd-degree')) return completeHeartBlock;
  if (searchText.includes('wenckebach') || searchText.includes('mobitz type i') || searchText.includes('2nd degree type i') || sub.includes('wenckebach') || sub.includes('mobitz-1')) return wenckebachBlock;
  if (searchText.includes('mobitz type ii') || searchText.includes('mobitz 2') || searchText.includes('2nd degree type ii') || sub.includes('mobitz-2') || sub.includes('type-ii')) return mobiType2;

  // ===== Stable angina / ACS / normal cardiac =====
  if (searchText.includes('stable angina') || searchText.includes('stable-angina') || sub.includes('stable-angina')) return normalSinusRhythm;
  if (searchText.includes('acute coronary syndrome') || searchText.includes('acute-coronary-syndrome') || sub.includes('acute-coronary-syndrome')) {
    if (heartRate && heartRate > 100) return sinusTachycardia;
    return normalSinusRhythm;
  }
  if (searchText.includes('syncope') || sub.includes('syncope')) return normalSinusRhythm;
  if (searchText.includes('hypertensive') || sub.includes('hypertensive')) return normalSinusRhythm;

  // ===== Heart failure (sinus tachy with LVH) =====
  if (searchText.includes('heart failure') || searchText.includes('heart-failure') || sub.includes('heart-failure')) {
    if (heartRate && heartRate > 100) return sinusTachycardia;
    return normalSinusRhythm;
  }

  // ===== Sinus tachycardia (explicit) =====
  if (searchText.includes('sinus tachycardia') || searchText.includes('sinus-tachycardia') || sub === 'sinus-tachycardia') return sinusTachycardia;

  // ===== Junctional / idioventricular rhythms =====
  if (searchText.includes('junctional') || sub.includes('junctional')) return junctionalRhythm;
  if (searchText.includes('idioventricular') || sub.includes('idioventricular')) return idioventricularRhythm;

  // ===== WPW / pre-excitation =====
  if (searchText.includes('wpw') || searchText.includes('wolff-parkinson') || searchText.includes('pre-excitation') || sub.includes('wpw')) return wpw;

  // ===== PACs / PVCs =====
  if (searchText.includes('premature atrial') || searchText.includes('pacs') || sub.includes('pacs')) return pacs;
  if (searchText.includes('premature ventricular') || searchText.includes('pvcs') || sub.includes('pvcs')) return pvcs;

  // ===== First degree block =====
  if (searchText.includes('first degree') || searchText.includes('1st degree') || sub.includes('first-degree') || sub.includes('1st-degree')) return firstDegreeBlock;

  // ===== Specific conditions =====
  if (searchText.includes('hyperkalemia') || searchText.includes('hyperkalaemia')) return sinusBradycardia; // Broad QRS bradycardia
  if (searchText.includes('hypothermia')) return sinusBradycardia; // Osborn waves + bradycardia
  if (searchText.includes('pulmonary embolism') || searchText.includes('pe ') || sub.includes('pulmonary-embolism')) return sinusTachycardia; // Sinus tachy with RV strain

  // ===== Generic STEMI (catch-all for "stemi" in title without anterior/inferior) =====
  if (searchText.includes('stemi')) return anteriorSTEMI;

  // ===== Category-level defaults =====
  if (cat === 'cardiac' || cat === 'cardiac-ecg') {
    if (heartRate && heartRate > 150) return svt;
    if (heartRate && heartRate > 100) return sinusTachycardia;
    if (heartRate && heartRate < 60) return sinusBradycardia;
    return normalSinusRhythm;
  }

  if (cat === 'respiratory' || cat === 'thoracic') {
    return heartRate && heartRate > 100 ? sinusTachycardia : normalSinusRhythm;
  }

  if (cat === 'trauma') {
    return heartRate && heartRate > 100 ? sinusTachycardia : normalSinusRhythm;
  }

  if (cat === 'neurological') {
    if (heartRate && heartRate < 60) return sinusBradycardia;
    return normalSinusRhythm;
  }

  // Default based on heart rate
  if (heartRate) {
    if (heartRate > 150) return svt;
    if (heartRate > 100) return sinusTachycardia;
    if (heartRate < 60) return sinusBradycardia;
  }

  return normalSinusRhythm;
}

/**
 * Get the LITFL ECG data for a given rhythm (for 12-lead display details)
 */
export function getLitflDataForRhythm(rhythmId: string): {
  litflUrl?: string;
  teachingPoints: string[];
  management: string[];
} {
  const data: Record<string, { litflUrl?: string; teachingPoints: string[]; management: string[] }> = {
    'anterior-stemi': {
      litflUrl: 'https://litfl.com/anterior-stemi-ecg-library/',
      teachingPoints: [
        'LAD occlusion - anterior wall involvement',
        'Look for tombstone ST elevation V1-V4',
        'Reciprocal depression in inferior leads confirms',
        'Hyperacute T waves may precede ST elevation',
        'Q waves = transmural infarction (irreversible)',
      ],
      management: [
        'Aspirin 300mg chewed',
        'Activate cath lab / pre-alert',
        'GTN if SBP >90',
        'Morphine for pain',
        'Door-to-balloon <90 min',
      ],
    },
    'inferior-stemi': {
      litflUrl: 'https://litfl.com/inferior-stemi-ecg-library/',
      teachingPoints: [
        'RCA occlusion (ST elevation III > II)',
        'LCx if ST elevation II = III',
        'Check V4R for RV infarction',
        'NO nitrates if RV infarct!',
        'Associated with bradycardia/AV block',
      ],
      management: [
        'Aspirin 300mg',
        'Right-sided ECG (V4R)',
        'Cautious fluids if hypotensive',
        'Atropine for bradycardia',
        'Avoid nitrates until RV infarct excluded',
      ],
    },
    'vt': {
      litflUrl: 'https://litfl.com/ventricular-tachycardia-ecg-library/',
      teachingPoints: [
        'Wide QRS >120ms, regular',
        'AV dissociation = pathognomonic',
        'Capture and fusion beats confirm VT',
        'Treat as VT until proven otherwise',
      ],
      management: [
        'Unstable: synchronized cardioversion',
        'Stable: Amiodarone 150mg IV over 10min',
        'Check and correct electrolytes',
        'Treat reversible causes (4Hs/4Ts)',
      ],
    },
    'vfib': {
      litflUrl: 'https://litfl.com/ventricular-fibrillation-ecg-library/',
      teachingPoints: [
        'Chaotic, disorganized - no cardiac output',
        'Shockable rhythm',
        'Coarse VF more responsive to defibrillation',
        'Fine VF can mimic asystole - check in 2 leads',
      ],
      management: [
        'Immediate defibrillation (200J biphasic)',
        'High-quality CPR',
        'Adrenaline 1mg every 3-5 min',
        'Amiodarone 300mg after 3rd shock',
      ],
    },
    'afib': {
      litflUrl: 'https://litfl.com/atrial-fibrillation-ecg-library/',
      teachingPoints: [
        'Irregularly irregular - hallmark feature',
        'Absent P waves, fibrillatory baseline',
        'Assess for hemodynamic compromise',
        'Risk of thromboembolism',
      ],
      management: [
        'Rate control: Metoprolol/Diltiazem',
        'If unstable: synchronized cardioversion',
        'Anticoagulation assessment',
        'CHA2DS2-VASc score for stroke risk',
      ],
    },
  };

  return data[rhythmId] || { teachingPoints: [], management: [] };
}
