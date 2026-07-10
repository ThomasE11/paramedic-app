/**
 * patientVocalization — the ONE answer to "can this patient talk right now?"
 *
 * Used by every speech path (voice hook, treatment challenge quotes, realism
 * response quotes) so a patient who cannot physiologically speak is silent
 * EVERYWHERE. A patient cannot vocalize when:
 *   • apnoeic or in arrest,
 *   • unresponsive (AVPU U / GCS ≤ 8), or
 *   • ACTIVELY SEIZING — a convulsing patient does not hold a conversation.
 *     (Post-ictal confusion still talks — that's realistic and stays.)
 */

import type { CaseScenario } from '@/types';
import { deriveAuthoredMotionVisuals } from '@/lib/patientRealismScenarios';

export function canPatientVocalize(caseData: CaseScenario): boolean {
  const gcs = caseData.abcde?.disability?.gcs?.total
    ?? caseData.vitalSignsProgression?.initial?.gcs;
  const avpu = String(caseData.abcde?.disability?.avpu || '').toUpperCase();
  const consciousness = String(caseData.initialPresentation?.consciousness || '').toLowerCase();
  const apneic = caseData.abcde?.breathing?.rate === 0;
  const arrest = /asystole|pea|vf|cardiac arrest|unresponsive|no response/.test(consciousness) || avpu === 'U';
  const activelySeizing = deriveAuthoredMotionVisuals(caseData)
    .some(v => v.kind === 'seizure_activity');
  return !apneic && !arrest && !activelySeizing && !(typeof gcs === 'number' && gcs <= 8);
}
