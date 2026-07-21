/**
 * classroomInjects — typed catalogue of instructor-driven case complications.
 *
 * An "inject" is a mid-case curveball the instructor throws to steer teaching:
 * a bystander arrives with new information, the receiving hospital calls with a
 * divert, the defibrillator dies, the patient refuses transport, rain starts.
 * Injects are broadcast instructor → students; students only receive them.
 *
 * Two payload types (vitals_change / rhythm_change) deliberately reuse the same
 * field shapes as SharedCaseState.vitals / .currentRhythm so the student side
 * can patch them straight onto the displayed monitor with no translation.
 *
 * Pure module: no React, no side effects. Safe to import anywhere.
 */

export type InjectType =
  | 'bystander_update'
  | 'hospital_radio'
  | 'equipment_failure'
  | 'patient_refusal'
  | 'new_finding'
  | 'vitals_change'
  | 'rhythm_change'
  | 'environmental';

export type InjectSeverity = 'info' | 'warn' | 'critical';

/** Same shape as SharedCaseState.vitals — patched directly onto the monitor. */
export interface InjectVitals {
  bp?: string;
  pulse?: number;
  respiration?: number;
  spo2?: number;
  temperature?: number;
  gcs?: number;
  bloodGlucose?: number;
}

export interface BystanderUpdatePayload { message: string }
export interface HospitalRadioPayload { message: string; hospitalName: string }
export interface EquipmentFailurePayload { equipment: string; cause: string }
export interface PatientRefusalPayload { what: string; reason: string }
export interface NewFindingPayload { finding: string; region: string }
export interface VitalsChangePayload { vitals: InjectVitals; reason: string }
export interface RhythmChangePayload { rhythm: string; reason: string }
export interface EnvironmentalPayload { event: string; impact: string }

/** Discriminated by the inject's `type`. */
export type InjectPayload =
  | BystanderUpdatePayload
  | HospitalRadioPayload
  | EquipmentFailurePayload
  | PatientRefusalPayload
  | NewFindingPayload
  | VitalsChangePayload
  | RhythmChangePayload
  | EnvironmentalPayload;

export interface ClassroomInject {
  id: string;
  type: InjectType;
  title: string;
  description: string;
  severity: InjectSeverity;
  payload: InjectPayload;
  /** Epoch ms the inject was sent. Presets carry 0 until fired via createInject. */
  timestamp: number;
}

/** Default payload for each inject type — used to fill gaps in createInject. */
function defaultPayload(type: InjectType): InjectPayload {
  switch (type) {
    case 'bystander_update': return { message: '' };
    case 'hospital_radio': return { message: '', hospitalName: '' };
    case 'equipment_failure': return { equipment: '', cause: '' };
    case 'patient_refusal': return { what: '', reason: '' };
    case 'new_finding': return { finding: '', region: '' };
    case 'vitals_change': return { vitals: {}, reason: '' };
    case 'rhythm_change': return { rhythm: '', reason: '' };
    case 'environmental': return { event: '', impact: '' };
    default: return { message: '' } as InjectPayload; // unknown type → benign shape
  }
}

/**
 * Build a fresh inject. Merges `partial` over a type-appropriate default so a
 * caller can pass only the fields they care about. Always stamps a unique id +
 * current timestamp. An unknown `type` still yields a structurally valid inject
 * (info severity, empty-message payload) — fail soft, never throw.
 */
export function createInject(
  type: InjectType,
  partial: Partial<Omit<ClassroomInject, 'type'>> = {},
): ClassroomInject {
  return {
    id: partial.id ?? `inject-${type}-${crypto.randomUUID()}`,
    type,
    title: partial.title ?? '',
    description: partial.description ?? '',
    severity: partial.severity ?? 'info',
    payload: partial.payload ?? defaultPayload(type),
    timestamp: partial.timestamp ?? Date.now(),
  };
}

/**
 * Pre-built inject presets covering all 8 types. `timestamp: 0` marks them as
 * templates; the instructor UI passes a preset through createInject (or bumps
 * the timestamp) when actually firing one so every sent inject is unique.
 */
export const INJECT_CATALOGUE: ClassroomInject[] = [
  {
    id: 'preset-bystander-medlist',
    type: 'bystander_update',
    title: 'Family member arrives with medication list',
    description: 'A relative hands you a printed list of the patient’s regular medications.',
    severity: 'info',
    payload: { message: 'Daughter: “He takes warfarin, metformin, and bisoprolol every morning.”' },
    timestamp: 0,
  },
  {
    id: 'preset-bystander-collapse',
    type: 'bystander_update',
    title: 'Bystander describes the collapse',
    description: 'A witness gives a clearer account of what happened before you arrived.',
    severity: 'info',
    payload: { message: 'Witness: “He clutched his chest, said he felt dizzy, then dropped.”' },
    timestamp: 0,
  },
  {
    id: 'preset-hospital-stemi',
    type: 'hospital_radio',
    title: 'Receiving hospital: STEMI alert, divert to Cardiac Center',
    description: 'The receiving hospital activates the cath lab and asks you to divert.',
    severity: 'warn',
    payload: {
      message: 'Cath lab activated. Divert to the Cardiac Center — ETA to us, please.',
      hospitalName: 'Sheikh Khalifa Cardiac Center',
    },
    timestamp: 0,
  },
  {
    id: 'preset-hospital-full',
    type: 'hospital_radio',
    title: 'Receiving hospital: ED on divert, reroute',
    description: 'The nearest ED is on divert and asks you to take the patient elsewhere.',
    severity: 'warn',
    payload: {
      message: 'We are on divert — no resus beds. Please reroute to the next nearest facility.',
      hospitalName: 'Tawam Hospital',
    },
    timestamp: 0,
  },
  {
    id: 'preset-equip-defib',
    type: 'equipment_failure',
    title: 'Defibrillator battery failure',
    description: 'The defibrillator powers down mid-case — battery is dead.',
    severity: 'critical',
    payload: { equipment: 'Defibrillator', cause: 'Battery dead — no spare charged.' },
    timestamp: 0,
  },
  {
    id: 'preset-equip-o2',
    type: 'equipment_failure',
    title: 'Oxygen cylinder runs empty',
    description: 'The main O₂ cylinder empties — switch to the spare or bag on air.',
    severity: 'critical',
    payload: { equipment: 'Oxygen cylinder', cause: 'Empty — gauge reads zero.' },
    timestamp: 0,
  },
  {
    id: 'preset-refusal-mask',
    type: 'patient_refusal',
    title: 'Patient grabbing at oxygen mask',
    description: 'The patient is agitated and keeps pulling the oxygen mask off.',
    severity: 'warn',
    payload: { what: 'Oxygen mask', reason: 'Feels claustrophobic and is fighting the mask off.' },
    timestamp: 0,
  },
  {
    id: 'preset-refusal-transport',
    type: 'patient_refusal',
    title: 'Patient refuses transport to hospital',
    description: 'The patient is competent and declines to be taken in.',
    severity: 'warn',
    payload: { what: 'Transport to hospital', reason: 'Says they feel fine now and want to stay home.' },
    timestamp: 0,
  },
  {
    id: 'preset-finding-legs',
    type: 'new_finding',
    title: 'Reassessment reveals bilateral leg swelling',
    description: 'On re-examination you notice new pitting oedema in both legs.',
    severity: 'info',
    payload: { finding: 'Bilateral pitting oedema to the shins', region: 'lower_legs' },
    timestamp: 0,
  },
  {
    id: 'preset-finding-abdo',
    type: 'new_finding',
    title: 'Reassessment reveals abdominal rigidity',
    description: 'The abdomen is now tense and guarding on palpation.',
    severity: 'warn',
    payload: { finding: 'Rigid, guarded abdomen with rebound tenderness', region: 'abdomen' },
    timestamp: 0,
  },
  {
    id: 'preset-vitals-bpdrop',
    type: 'vitals_change',
    title: 'Sudden BP drop to 70/palp',
    description: 'The patient’s blood pressure crashes — reassess perfusion.',
    severity: 'critical',
    payload: {
      vitals: { bp: '70/palp', pulse: 128, spo2: 90 },
      reason: 'Sudden hypotension — the patient is decompensating.',
    },
    timestamp: 0,
  },
  {
    id: 'preset-vitals-spo2',
    type: 'vitals_change',
    title: 'SpO₂ falls to 84%',
    description: 'Oxygen saturation drops despite current management.',
    severity: 'warn',
    payload: {
      vitals: { spo2: 84, respiration: 28 },
      reason: 'Worsening hypoxia — escalate oxygen and reassess the airway.',
    },
    timestamp: 0,
  },
  {
    id: 'preset-rhythm-vt',
    type: 'rhythm_change',
    title: 'Rhythm decompensates to VT',
    description: 'The monitor shows a broad-complex tachycardia — ventricular tachycardia.',
    severity: 'critical',
    payload: { rhythm: 'Ventricular Tachycardia', reason: 'Deteriorated into VT — check for a pulse.' },
    timestamp: 0,
  },
  {
    id: 'preset-rhythm-vf',
    type: 'rhythm_change',
    title: 'Rhythm degenerates to VF',
    description: 'The patient arrests in ventricular fibrillation.',
    severity: 'critical',
    payload: { rhythm: 'Ventricular Fibrillation', reason: 'VF arrest — start CPR and prepare to defibrillate.' },
    timestamp: 0,
  },
  {
    id: 'preset-env-rain',
    type: 'environmental',
    title: 'Rain begins, equipment getting wet',
    description: 'A sudden downpour starts — the scene and your kit are getting soaked.',
    severity: 'info',
    payload: { event: 'Heavy rain starts', impact: 'Monitor and airway kit getting wet; consider moving the patient.' },
    timestamp: 0,
  },
  {
    id: 'preset-env-crowd',
    type: 'environmental',
    title: 'Crowd gathering around the scene',
    description: 'Onlookers press in and start filming, crowding the working space.',
    severity: 'warn',
    payload: { event: 'Crowd gathers and starts filming', impact: 'Scene control compromised; consider requesting police.' },
    timestamp: 0,
  },
];
