/**
 * usePatientVoice
 *
 * Gives a case's patient a spoken voice for two surfaces:
 *   1. VoiceHistoryPanel — speaks the patient's answers to history questions.
 *   2. RegionAssessmentPanel — emits short pain reactions when the student
 *      palpates a provocative region.
 *
 * The patient can only be heard when they are physiologically able to
 * vocalise. We reuse the same responsiveness model the 3D body scene uses
 * (see getPatientResponsiveness in Body3DModel/index.tsx): no voice if the
 * patient is apneic, in arrest, or deeply obtunded (GCS ≤ 8). Callers can
 * always check `canVocalize` to decide whether to fall back to collateral
 * history; `say`/`react` also self-guard so an unconscious patient silently
 * no-ops rather than speaking.
 *
 * All synthesis is delegated to useVoiceNarration with the 'patient' role, so
 * the patient inherits the same ElevenLabs → Supertonic → Web Speech engine
 * chain and the global single-lane playback arbitration (a pain reaction
 * correctly interrupts an in-progress answer, etc.).
 */

import { useCallback, useMemo } from 'react';
import type { CaseScenario } from '@/types';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

/** Kinds of provocative-exam reactions the body scene can request. */
export type PatientReactionKind = 'tender-palpation' | 'movement-pain';

// Short, first-person pain reactions. Kept varied so repeated palpation of the
// same region doesn't replay an identical line. These are deliberately generic
// (no body-part) so any region can trigger them.
const REACTION_LINES: Record<PatientReactionKind, string[]> = {
  'tender-palpation': [
    'Ah! That hurts.',
    'Ow — careful, that\'s really tender.',
    'Aah, please, not so hard there.',
    'That\'s sore — right there.',
  ],
  'movement-pain': [
    'Aah, don\'t move it!',
    'No, no — that hurts when you move it.',
    'Please, it hurts too much to move.',
    'Ahh, stop, leave it still.',
  ],
};

function pickLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Derive whether the patient is physiologically able to speak. Mirrors the
 * canVocalize rule used by the 3D body scene so the two surfaces stay in sync.
 */
function derivesCanVocalize(caseData: CaseScenario): boolean {
  const gcs = caseData.abcde?.disability?.gcs?.total
    ?? caseData.vitalSignsProgression?.initial?.gcs;
  const avpu = String(caseData.abcde?.disability?.avpu || '').toUpperCase();
  const consciousness = String(caseData.initialPresentation?.consciousness || '').toLowerCase();
  const apneic = caseData.abcde?.breathing?.rate === 0;
  const arrest = /asystole|pea|vf|cardiac arrest|unresponsive|no response/.test(consciousness) || avpu === 'U';
  return !apneic && !arrest && !(typeof gcs === 'number' && gcs <= 8);
}

export function usePatientVoice(caseData: CaseScenario) {
  const narration = useVoiceNarration();

  const canVocalize = useMemo(() => derivesCanVocalize(caseData), [caseData]);

  // Speak an arbitrary line as the patient (used for history answers).
  const say = useCallback((text: string) => {
    if (!canVocalize) return;
    if (!text || !text.trim()) return;
    narration.speak(text, { role: 'patient' });
  }, [canVocalize, narration]);

  // Emit a short scripted pain reaction. Silently no-ops for an unconscious
  // patient or an unknown reaction kind.
  const react = useCallback((kind: PatientReactionKind) => {
    if (!canVocalize) return;
    const lines = REACTION_LINES[kind];
    if (!lines || lines.length === 0) return;
    narration.speak(pickLine(lines), { role: 'patient' });
  }, [canVocalize, narration]);

  return {
    /** True when the patient is physiologically able to be heard. */
    canVocalize,
    /** True while the patient's voice is currently playing. */
    isSpeaking: narration.isSpeaking,
    say,
    react,
    stop: narration.stop,
  };
}
