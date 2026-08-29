import type { CaseScenario, VitalSigns } from '@/types';
import { collectActualCaseClauses } from '@/lib/tractionSplintSafety';

export type AmbulationSafetyCode =
  | 'arrest'
  | 'consciousness'
  | 'weight-bearing-injury'
  | 'gait-symptoms'
  | 'haemodynamic-instability'
  | 'hypoxia'
  | 'respiratory-instability'
  | 'pulse-instability'
  | 'allowed';

export interface AmbulationSafetyDecision {
  allowed: boolean;
  code: AmbulationSafetyCode;
  reason: string;
}

const WEIGHT_BEARING_RISK = /\b(spinal|c-?spine|pelvi[cs]|hip (?:pain\w*|tender\w*|injur\w*)|femur|thigh (?:pain\w*|tender\w*|injur\w*)|knee (?:pain\w*|tender\w*|injur\w*)|leg (?:pain\w*|tender\w*|injur\w*)|ankle (?:pain\w*|tender\w*|injur\w*)|foot (?:pain\w*|tender\w*|injur\w*)|lower[- ]limb|unstable fracture|open fracture|unable to (?:stand|walk|get up|bear weight)|non[- ]weight[- ]bearing|back pain)\b/i;
const GAIT_RISK = /\b(dizz|vertigo|syncope|syncopal|faint|collapse|unsteady|ataxi|new weakness|loss of balance)\w*/i;

export function assessAmbulationSafety({
  caseData,
  vitals,
  isInArrest = false,
}: {
  caseData: CaseScenario;
  vitals: Pick<VitalSigns, 'bp' | 'pulse' | 'respiration' | 'spo2' | 'gcs'>;
  isInArrest?: boolean;
}): AmbulationSafetyDecision {
  if (isInArrest) {
    return { allowed: false, code: 'arrest', reason: 'A patient in cardiac arrest must remain supine on a firm surface for resuscitation.' };
  }

  const gcs = Number(vitals.gcs ?? caseData.abcde?.disability?.gcs?.total ?? 15);
  const avpu = String(caseData.abcde?.disability?.avpu ?? '').toUpperCase();
  if (gcs < 15 || (avpu && avpu !== 'A')) {
    return { allowed: false, code: 'consciousness', reason: 'Assisted walking requires a fully alert patient who can follow instructions and protect themselves from a fall.' };
  }

  const clinicalText = collectActualCaseClauses(caseData).join(' ');
  if (WEIGHT_BEARING_RISK.test(clinicalText)) {
    return { allowed: false, code: 'weight-bearing-injury', reason: 'The case describes pain, injury or inability to weight-bear involving the spine, pelvis, hip or lower limb. Do not stand the patient before that injury is assessed and safely managed.' };
  }
  if (GAIT_RISK.test(clinicalText)) {
    return { allowed: false, code: 'gait-symptoms', reason: 'Collapse, dizziness or impaired balance makes a walking trial unsafe until the cause is assessed and the patient is stable.' };
  }

  const systolic = Number.parseInt(String(vitals.bp ?? '').split('/')[0], 10);
  if (!Number.isFinite(systolic) || systolic < 100) {
    return { allowed: false, code: 'haemodynamic-instability', reason: 'Confirm a systolic blood pressure of at least 100 mmHg before attempting an observed walk.' };
  }
  if (Number(vitals.spo2) < 94) {
    return { allowed: false, code: 'hypoxia', reason: 'Correct hypoxia and reassess before standing or walking the patient.' };
  }
  const respiration = Number(vitals.respiration);
  if (respiration < 10 || respiration > 24) {
    return { allowed: false, code: 'respiratory-instability', reason: 'The respiratory rate is outside the safe range for an observed walking trial.' };
  }
  const pulse = Number(vitals.pulse);
  if (pulse < 50 || pulse > 120) {
    return { allowed: false, code: 'pulse-instability', reason: 'The pulse rate is outside the safe range for an observed walking trial.' };
  }

  return { allowed: true, code: 'allowed', reason: 'The patient is alert, physiologically stable and has no documented weight-bearing contraindication.' };
}
