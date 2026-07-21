/**
 * voiceIntents — builds the spoken-command registry for voice-first mode.
 *
 * Senior students (3rd/4th year) can run a whole case hands-free. This module
 * turns a case + its available treatments + the current phase into a flat list
 * of `VoiceIntent`s: assessment ("assess chest"), treatment ("give adrenaline"),
 * and navigation ("open jump bag"). Each intent carries an `action` the caller
 * routes on, a `phase[]` filter, and a `requiresConfirm` flag (drug pushes must
 * be confirmed before they fire).
 *
 * Pure — no React, no browser, no side effects. That keeps it unit-testable and
 * lets `VoiceCommandButton` stay a dumb renderer.
 *
 * `VoiceIntent` extends the hook's `VoiceCommand` so the same matcher works:
 * we fold `phrase[]` into the hook's `label` + `aliases`. The extra fields
 * (action / phase / requiresConfirm) ride along and are ignored by the matcher.
 */

import type { VoiceCommand } from '@/hooks/useVoiceInput';
import type { CaseScenario } from '@/types';
import type { Treatment } from '@/data/enhancedTreatmentEffects';

/** Phase names the student flow exposes to voice. Mirrors StudentPhase's live states. */
export type VoicePhase = 'briefing' | 'scene' | 'treatment' | 'debrief';

export type VoiceAction =
  | { type: 'assess'; payload: { stepId: string } }
  | { type: 'listen'; payload: { region: string } }
  | { type: 'vital'; payload: { vital: string } }
  | { type: 'treatment'; payload: { treatmentId: string } }
  | { type: 'nav'; payload: { target: 'jump-bag' | 'monitor' | 'anatomy'; open: boolean } };

export interface VoiceIntent extends VoiceCommand {
  /** All spoken phrases that trigger this intent (label + aliases, deduped). */
  phrase: string[];
  action: VoiceAction;
  /** Drug administration must be confirmed before it executes. */
  requiresConfirm: boolean;
  /** Phases this intent is offered in. */
  phase: VoicePhase[];
}

// ---------------------------------------------------------------------------
// Natural-language verb aliases. "give" = "administer" = "push" etc. Keeping
// them here (not scattered) makes the alias contract testable in one place.
// ---------------------------------------------------------------------------
const GIVE_VERBS = ['give', 'administer', 'push'];
const APPLY_VERBS = ['apply', 'attach', 'put on'];
const EXAMINE_VERBS = ['assess', 'examine', 'look at', 'check'];

/** Regions the secondary survey covers — spoken as "assess <region>". */
const REGIONS: { stepId: string; label: string }[] = [
  { stepId: 'head', label: 'head' },
  { stepId: 'face', label: 'face' },
  { stepId: 'neck-cspine', label: 'neck' },
  { stepId: 'chest', label: 'chest' },
  { stepId: 'abdomen', label: 'abdomen' },
  { stepId: 'pelvis', label: 'pelvis' },
  { stepId: 'right-arm', label: 'right arm' },
  { stepId: 'left-arm', label: 'left arm' },
  { stepId: 'right-leg', label: 'right leg' },
  { stepId: 'left-leg', label: 'left leg' },
  { stepId: 'posterior-logroll', label: 'back' },
];

/** ABCDE primary-survey steps — spoken as "check airway" etc. */
const PRIMARY: { stepId: string; label: string; aliases: string[] }[] = [
  { stepId: 'airway', label: 'airway', aliases: ['open airway'] },
  { stepId: 'breathing', label: 'breathing', aliases: [] },
  { stepId: 'circulation', label: 'circulation', aliases: ['pulse', 'cap refill'] },
  { stepId: 'disability', label: 'disability', aliases: ['neuro', 'gcs', 'pupils'] },
  { stepId: 'exposure', label: 'exposure', aliases: ['expose patient'] },
];

/** Auscultation targets — "listen to lungs/heart/bowel". */
const LISTEN: { region: string; label: string; aliases: string[] }[] = [
  { region: 'lungs', label: 'lungs', aliases: ['chest', 'breath sounds'] },
  { region: 'heart', label: 'heart', aliases: ['heart sounds'] },
  { region: 'bowel', label: 'bowel', aliases: ['bowel sounds', 'abdomen'] },
];

/** Vitals that map to a discrete assessment step, spoken as "check <vital>". */
const VITALS: { vital: string; label: string; aliases: string[] }[] = [
  { vital: 'blood-glucose', label: 'glucose', aliases: ['blood sugar', 'bm', 'sugar'] },
  { vital: 'temperature', label: 'temperature', aliases: ['temp'] },
];

function cross(verbs: string[], target: string): string[] {
  return verbs.map(v => `${v} ${target}`);
}

/** Dedupe while preserving order — phrase lists must be unique per intent. */
function uniq(xs: string[]): string[] {
  return [...new Set(xs.map(x => x.trim().toLowerCase()).filter(Boolean))];
}

function toIntent(
  id: string,
  phrases: string[],
  action: VoiceAction,
  phase: VoicePhase[],
  requiresConfirm: boolean,
): VoiceIntent {
  const phrase = uniq(phrases);
  return {
    id,
    label: phrase[0],
    aliases: phrase.slice(1),
    phrase,
    action,
    phase,
    requiresConfirm,
  };
}

export interface BuildVoiceIntentsOptions {
  /**
   * Optional harm predicate. Return true for a treatment that is contraindicated
   * for THIS patient right now — it will be excluded from the spoken registry so
   * students can't voice a harmful drug. Caller wires this to
   * `evaluateTreatmentQuality(...).level === 'harmful'`.
   * ponytail: predicate injected, not a vitals model rebuilt here.
   */
  isHarmful?: (treatment: Treatment) => boolean;
}

/**
 * Build the spoken-command registry for a case at a given phase.
 *
 * @param caseData    current case (reserved for future case-specific tuning)
 * @param treatments  treatments the jump bag currently offers
 * @param phase       current voice phase — intents not tagged for it are dropped
 */
export function buildVoiceIntents(
  caseData: CaseScenario,
  treatments: Treatment[],
  phase: VoicePhase,
  options: BuildVoiceIntentsOptions = {},
): VoiceIntent[] {
  void caseData; // reserved — signature is part of the task contract
  const { isHarmful } = options;
  const intents: VoiceIntent[] = [];

  // --- Assessment: primary survey (ABCDE) ---
  for (const p of PRIMARY) {
    intents.push(
      toIntent(
        `assess:${p.stepId}`,
        [...cross(EXAMINE_VERBS, p.label), p.label, ...p.aliases],
        { type: 'assess', payload: { stepId: p.stepId } },
        ['scene', 'treatment'],
        false,
      ),
    );
  }

  // --- Assessment: secondary survey regions ---
  for (const r of REGIONS) {
    intents.push(
      toIntent(
        `assess:${r.stepId}`,
        cross(EXAMINE_VERBS, r.label),
        { type: 'assess', payload: { stepId: r.stepId } },
        ['scene', 'treatment'],
        false,
      ),
    );
  }

  // --- Assessment: auscultation ---
  for (const l of LISTEN) {
    intents.push(
      toIntent(
        `listen:${l.region}`,
        [`listen to ${l.label}`, `auscultate ${l.label}`, ...l.aliases.map(a => `listen to ${a}`)],
        { type: 'listen', payload: { region: l.region } },
        ['scene', 'treatment'],
        false,
      ),
    );
  }

  // --- Assessment: point-of-care vitals ---
  for (const v of VITALS) {
    intents.push(
      toIntent(
        `vital:${v.vital}`,
        [...cross(['check', 'take'], v.label), ...v.aliases],
        { type: 'vital', payload: { vital: v.vital } },
        ['scene', 'treatment'],
        false,
      ),
    );
  }

  // --- Treatments (only in the treatment phase) ---
  for (const tx of treatments) {
    if (isHarmful?.(tx)) continue; // never let a student voice a contraindicated drug
    const isDrug = tx.category === 'medication';
    const verbs = isDrug ? GIVE_VERBS : APPLY_VERBS;
    const name = tx.name.toLowerCase();
    intents.push(
      toIntent(
        `treatment:${tx.id}`,
        cross(verbs, name),
        { type: 'treatment', payload: { treatmentId: tx.id } },
        ['treatment'],
        isDrug, // drug pushes require a confirm beat
      ),
    );
  }

  // --- Navigation ---
  const nav: VoiceIntent[] = [
    toIntent('nav:open-bag', ['open jump bag', 'open bag', 'open the bag'], { type: 'nav', payload: { target: 'jump-bag', open: true } }, ['scene', 'treatment'], false),
    toIntent('nav:open-monitor', ['open monitor', 'show monitor', 'show vitals'], { type: 'nav', payload: { target: 'monitor', open: true } }, ['scene', 'treatment'], false),
    toIntent('nav:open-anatomy', ['open anatomy', 'show anatomy'], { type: 'nav', payload: { target: 'anatomy', open: true } }, ['scene', 'treatment'], false),
    toIntent('nav:close-bag', ['close jump bag', 'close bag'], { type: 'nav', payload: { target: 'jump-bag', open: false } }, ['scene', 'treatment'], false),
    toIntent('nav:close-monitor', ['close monitor'], { type: 'nav', payload: { target: 'monitor', open: false } }, ['scene', 'treatment'], false),
    toIntent('nav:close-anatomy', ['close anatomy'], { type: 'nav', payload: { target: 'anatomy', open: false } }, ['scene', 'treatment'], false),
  ];
  intents.push(...nav);

  // Phase filter — only intents tagged for the current phase survive.
  return intents.filter(i => i.phase.includes(phase));
}
