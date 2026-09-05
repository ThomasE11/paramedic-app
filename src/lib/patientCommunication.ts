import type { CaseScenario, VitalSigns } from '@/types';
import type { ResponseContext } from '@/lib/historyTaking';

export interface PatientCommunicationInput {
  vitals?: Partial<VitalSigns> | null;
  isInArrest?: boolean;
  appliedTreatmentIds?: readonly string[];
}

/** One live source for history, spoken examination reactions and speech cues. */
export function derivePatientCommunication(
  caseData: CaseScenario,
  { vitals, isInArrest, appliedTreatmentIds = [] }: PatientCommunicationInput = {},
) {
  const initial = caseData.vitalSignsProgression?.initial;
  const gcs = vitals?.gcs ?? caseData.abcde?.disability?.gcs?.total ?? initial?.gcs;
  const rr = vitals?.respiration ?? caseData.abcde?.breathing?.rate ?? initial?.respiration;
  const spo2 = vitals?.spo2 ?? caseData.abcde?.breathing?.spo2 ?? initial?.spo2;
  const pulse = vitals?.pulse ?? initial?.pulse;
  const systolic = vitals?.bp != null
    ? Number.parseInt(vitals.bp.split('/')[0], 10)
    : caseData.abcde?.circulation?.bp?.systolic ?? Number.parseInt(initial?.bp ?? '', 10);
  // Dispatch AVPU/consciousness describes arrival. It cannot overrule an
  // explicitly reassessed GCS after recovery or deterioration.
  const initiallyUnresponsive = vitals?.gcs == null && (
    caseData.abcde?.disability?.avpu?.toUpperCase() === 'U'
    || /\b(unresponsive|no response|unconscious)\b/i.test(caseData.initialPresentation?.consciousness ?? '')
  );
  const airwaySecured = appliedTreatmentIds.some(id =>
    ['intubation', 'rsi_intubation', 'surgical_cric'].includes(id),
  );
  const age = caseData.patientInfo?.age;
  const tooYoungForHistory = typeof age === 'number' && age < 3;
  const inArrest = isInArrest === true || pulse === 0;
  const apnoeic = typeof rr === 'number' && rr <= 0;
  const lowConsciousness = initiallyUnresponsive || (typeof gcs === 'number' && gcs <= 8);
  const canVocalize = !inArrest && !apnoeic && !lowConsciousness && !airwaySecured && !tooYoungForHistory;

  const appearance = [
    caseData.initialPresentation?.appearance,
    ...(caseData.abcde?.breathing?.findings ?? []),
  ].filter(Boolean).join(' ');
  const authoredBreathless = /can't speak|unable to speak|single words|two[- ]word|tripod|severe (asthma|dyspn)|gasping/i.test(appearance);
  const breathless = (typeof rr === 'number' && rr >= 28)
    || (typeof spo2 === 'number' && spo2 < 92)
    || (vitals?.respiration == null && vitals?.spo2 == null && authoredBreathless);
  const initiallyBreathless = authoredBreathless
    || (initial?.respiration ?? 0) >= 28
    || (initial?.spo2 != null && initial.spo2 < 92);
  const altered = typeof gcs === 'number' && gcs >= 9 && gcs <= 12;
  const responseContext: ResponseContext = {
    severity: breathless || altered || systolic < 90 ? 'severe' : 'mild',
    altered,
    breathless,
    painScore: vitals?.painScore,
    breathingImproved: Boolean(vitals && initiallyBreathless && !breathless),
  };

  const status = inArrest ? 'Patient cannot answer during cardiac arrest.'
    : apnoeic ? 'Patient is not breathing and cannot answer.'
    : lowConsciousness ? 'Patient cannot give a verbal history at the current level of consciousness.'
    : airwaySecured ? 'An advanced airway is in place; the patient cannot give a spoken answer.'
    : tooYoungForHistory ? 'Obtain the history from a parent or caregiver; this patient is too young to answer these questions.'
    : breathless ? 'Patient is breathless. Ask short questions and allow time to respond.'
    : altered ? 'Patient is confused. Confirm answers with collateral history where available.'
    : 'Patient can answer. Ask, listen, then reassess after treatment.';

  return { canVocalize, isAwake: canVocalize && (gcs ?? 15) >= 13, status, responseContext };
}
