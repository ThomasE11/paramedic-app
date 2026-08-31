import type { CaseScenario, VitalSigns } from '@/types';
import { collectActualCaseClauses } from '@/lib/tractionSplintSafety';

export type AmbulationSafetyCode =
  | 'arrest'
  | 'consciousness'
  | 'weight-bearing-injury'
  | 'gait-symptoms'
  | 'internal-bleeding'
  | 'active-labour'
  | 'acute-neurological'
  | 'cardiac-ischaemia'
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
const INTERNAL_BLEEDING_RISK = /\b(internal (?:haemorrhage|hemorrhage|bleeding)|splenic (?:injury|laceration|rupture)|haemoperitoneum|hemoperitoneum|FAST positive (?:for )?(?:LUQ|RUQ|pelvic|free )?fluid|rebound tenderness)\b/i;
const ACTIVE_LABOUR_RISK = /\b(active (?:second stage of )?labour|crowning|urge to push|delivery imminent|imminent (?:vaginal )?delivery)\b/i;
const ACUTE_NEUROLOGICAL_RISK = /\b(stroke|transient isch(?:a)?emic attack|TIA|FAST positive|focal neurological deficit|facial droop|slurred speech|dysarthria|hemiparesis|unilateral weakness)\b/i;
const CARDIAC_ISCHAEMIA_RISK = /\b(STEMI|NSTEMI|acute coronary syndrome|Wellens(?: syndrome)?|de Winter|angina|myocardial infarction|cardiogenic shock)\b/i;

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
  if (INTERNAL_BLEEDING_RISK.test(clinicalText)) {
    return { allowed: false, code: 'internal-bleeding', reason: 'Suspected internal bleeding or evolving shock requires supine management, haemorrhage care and rapid transport — do not stand the patient.' };
  }
  if (ACTIVE_LABOUR_RISK.test(clinicalText)) {
    return { allowed: false, code: 'active-labour', reason: 'Active second-stage labour or crowning requires a supported delivery position and immediate birth preparation, not an assisted walking trial.' };
  }
  if (ACUTE_NEUROLOGICAL_RISK.test(clinicalText)) {
    return { allowed: false, code: 'acute-neurological', reason: 'A suspected stroke or TIA carries weakness, balance and deterioration risk. Keep the patient supported and prioritise time-critical neurological care.' };
  }
  if (CARDIAC_ISCHAEMIA_RISK.test(clinicalText)) {
    return { allowed: false, code: 'cardiac-ischaemia', reason: 'Suspected myocardial ischaemia must be managed at rest with monitoring and time-critical treatment; exertional walking is unsafe.' };
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
