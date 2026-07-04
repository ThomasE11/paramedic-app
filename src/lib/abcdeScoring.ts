/**
 * abcdeScoring — weighted ABCDE scoring spine (Body Interact pattern A)
 * =====================================================================
 *
 * PATIENT_SIM_RESEARCH.md §2.A: "every exam action timestamped … assessment
 * worth a fixed large slice of the score." This module turns the assessment
 * tracker's timestamped `PerformedAssessment` records into a 0–100 score
 * built from three orthogonal components:
 *
 *   completeness — did the student perform the required primary-survey steps
 *                  and the case-required secondary regions / special
 *                  assessments? (recommended steps count at 40% weight,
 *                  mirroring `createAssessmentTracker`)
 *   sequence     — were the FIRST-touches of the primary survey in
 *                  Scene → A → B → C → D → E order? Life-threat-first
 *                  exceptions (pulse-check/CPR-first in cardiac arrest,
 *                  <C>ABC in catastrophic haemorrhage) are not penalised.
 *                  Re-visits never punish: only first touches are judged.
 *   timeliness   — was the six-step primary survey COMPLETED within a
 *                  year-banded target? Late = partial credit, never zero.
 *
 * The module is PURE: no React, no network, no Date.now(). Input is the
 * performed records (+ tracker required/recommended lists + case flags +
 * student year); output is deterministic.
 *
 * History-taking (SAMPLE) steps are deliberately OUT of scope here — they
 * are interview skills, not the physical survey spine. The integration
 * helper `applyAbcdeToAssessmentScore` keeps their raw point value while
 * scaling the survey share of the assessment points by this module's
 * overall score, so the ABCDE spine drives a fixed share of the final
 * case grade.
 */

import {
  ALL_STEPS,
  PRIMARY_STEPS,
  type AssessmentStepId,
  type AssessmentTracker,
  type PerformedAssessment,
  type PrimaryAssessmentStep,
} from '@/data/assessmentFramework';
import type { StudentYear } from '@/types';

// ---------------------------------------------------------------------------
// Year bands
// ---------------------------------------------------------------------------

export interface AbcdeYearBand {
  /** Seconds from case start by which the six-step primary survey should be complete. */
  primaryTargetSeconds: number;
  /** Component weights — must sum to 1. */
  weights: { completeness: number; sequence: number; timeliness: number };
}

/**
 * Banded expectations per student year.
 *
 * `yearSpecificRubrics.ts` carries instructor-facing domain weights
 * (safety/communication/documentation…) that don't decompose into
 * completeness/sequence/timeliness, so the bands are embedded here but
 * anchored to that file's language:
 *  - 1st-year: "Speed is less important than correctness" → completeness
 *    dominates, generous 10-minute target. The app groups `diploma` with
 *    1st-year expectations (see quickAssessmentTags yearLevels), so diploma
 *    shares the band.
 *  - 2nd-year: "Systematic ABCDE" is the headline domain → sequence weight
 *    steps up.
 *  - 3rd-year: "Rapid but systematic ABCDE" → timeliness starts to matter.
 *  - 4th-year: "Simultaneous assessment and treatment" → tightest target,
 *    heaviest timeliness share.
 */
export const ABCDE_YEAR_BANDS: Record<StudentYear, AbcdeYearBand> = {
  '1st-year': { primaryTargetSeconds: 600, weights: { completeness: 0.60, sequence: 0.25, timeliness: 0.15 } },
  'diploma':  { primaryTargetSeconds: 600, weights: { completeness: 0.60, sequence: 0.25, timeliness: 0.15 } },
  '2nd-year': { primaryTargetSeconds: 480, weights: { completeness: 0.55, sequence: 0.30, timeliness: 0.15 } },
  '3rd-year': { primaryTargetSeconds: 360, weights: { completeness: 0.50, sequence: 0.30, timeliness: 0.20 } },
  '4th-year': { primaryTargetSeconds: 300, weights: { completeness: 0.45, sequence: 0.30, timeliness: 0.25 } },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AbcdeCaseFlags {
  /** Cardiac-arrest presentation — pulse check / compressions before airway is correct (CAB). */
  isArrestCase: boolean;
  /** Catastrophic external haemorrhage — <C>ABC: control the bleed before airway. */
  hasCatastrophicHaemorrhage: boolean;
}

export interface AbcdeScoreInput {
  performed: PerformedAssessment[];
  required: AssessmentStepId[];
  recommended: AssessmentStepId[];
  studentYear: StudentYear;
  caseFlags?: AbcdeCaseFlags;
}

export type AbcdeStepChannel = 'scene' | 'A' | 'B' | 'C' | 'D' | 'E' | 'secondary' | 'special';

export interface AbcdePerStep {
  stepId: AssessmentStepId;
  label: string;
  channel: AbcdeStepChannel;
  status: 'performed' | 'missed-required' | 'missed-recommended' | 'extra';
  required: boolean;
  /** Seconds since case start of the FIRST touch (undefined when never performed). */
  firstTouchSeconds?: number;
  /** Global performance order of the first touch (1-indexed). */
  order?: number;
}

export interface AbcdeScore {
  /** Weighted 0–100 combination of the three components for the year band. */
  overall: number;
  components: { completeness: number; sequence: number; timeliness: number };
  /** The band actually applied (echoed for UI/debrief transparency). */
  band: AbcdeYearBand;
  perStep: AbcdePerStep[];
  feedback: string[];
  primarySurvey: {
    performedCount: number;
    totalSteps: number;
    completed: boolean;
    /** Elapsed seconds when the LAST primary step was first touched (null if incomplete). */
    completedAtSeconds: number | null;
    targetSeconds: number;
  };
}

// ---------------------------------------------------------------------------
// Case-flag derivation
// ---------------------------------------------------------------------------

const ARREST_RE = /cardiac-arrest|\barrest\b|vfib|v-fib|asystole|\bpea\b/i;
const PULSELESS_RE = /pulseless|no palpable pulse|no pulse|cardiac arrest/i;
const CAT_HAEM_RE = /catastrophic|massive (external )?ha?emorrhage|exsanguinat|arterial bleed|traumatic amputation|amputat/i;

/**
 * Structural subset of `CaseScenario` needed to derive the flags — a full
 * case object is assignable, and tests can pass a light fixture.
 */
export interface AbcdeFlagSource {
  category?: string;
  subcategory?: string;
  abcde?: {
    circulation?: { findings?: string[] };
    exposure?: { findings?: string[]; wounds?: string[] };
  };
}

/**
 * Derive the life-threat-first flags from case data. Conservative: only the
 * unambiguous signals used elsewhere in the app (subcategory keywords,
 * pulseless circulation findings, catastrophic-bleed vocabulary).
 */
export function deriveAbcdeCaseFlags(caseData: AbcdeFlagSource): AbcdeCaseFlags {
  const sub = `${caseData.subcategory || ''} ${caseData.category || ''}`;
  const circFindings = (caseData.abcde?.circulation?.findings || []).join(' ');
  const isArrestCase = ARREST_RE.test(sub) || PULSELESS_RE.test(circFindings);

  const bleedText = [
    circFindings,
    ...(caseData.abcde?.exposure?.findings || []),
    ...(caseData.abcde?.exposure?.wounds || []),
  ].join(' ');
  const hasCatastrophicHaemorrhage = CAT_HAEM_RE.test(bleedText);

  return { isArrestCase, hasCatastrophicHaemorrhage };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const PRIMARY_ORDER: PrimaryAssessmentStep[] = ['scene-safety', 'airway', 'breathing', 'circulation', 'disability', 'exposure'];
const PRIMARY_RANK: Record<string, number> = Object.fromEntries(PRIMARY_ORDER.map((id, i) => [id, i]));
const PRIMARY_LETTER: Record<PrimaryAssessmentStep, AbcdeStepChannel> = {
  'scene-safety': 'scene',
  airway: 'A',
  breathing: 'B',
  circulation: 'C',
  disability: 'D',
  exposure: 'E',
};

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const RECOMMENDED_WEIGHT = 0.4; // mirrors createAssessmentTracker / performAssessment

function fmtMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function channelFor(stepId: AssessmentStepId): AbcdeStepChannel {
  const letter = PRIMARY_LETTER[stepId as PrimaryAssessmentStep];
  if (letter) return letter;
  const phase = ALL_STEPS[stepId]?.phase;
  return phase === 'secondary' ? 'secondary' : 'special';
}

/** First touch per step, in performance order. Re-visits are ignored by design. */
function firstTouches(performed: PerformedAssessment[]): Map<AssessmentStepId, PerformedAssessment> {
  const map = new Map<AssessmentStepId, PerformedAssessment>();
  for (const p of [...performed].sort((a, b) => a.order - b.order)) {
    if (!map.has(p.stepId)) map.set(p.stepId, p);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface ComponentResult { score: number; feedback: string[] }

function scoreCompleteness(
  touches: Map<AssessmentStepId, PerformedAssessment>,
  required: AssessmentStepId[],
  recommended: AssessmentStepId[],
): ComponentResult & { perStep: AbcdePerStep[] } {
  const feedback: string[] = [];
  const perStep: AbcdePerStep[] = [];
  let earned = 0;
  let total = 0;

  const surveyStep = (id: AssessmentStepId) => ALL_STEPS[id] && ALL_STEPS[id].phase !== 'history';

  for (const id of required.filter(surveyStep)) {
    const step = ALL_STEPS[id];
    const touch = touches.get(id);
    total += step.points;
    if (touch) earned += step.points;
    perStep.push({
      stepId: id,
      label: step.label,
      channel: channelFor(id),
      status: touch ? 'performed' : 'missed-required',
      required: true,
      firstTouchSeconds: touch?.elapsedSeconds,
      order: touch?.order,
    });
  }

  for (const id of recommended.filter(surveyStep)) {
    if (required.includes(id)) continue;
    const step = ALL_STEPS[id];
    const touch = touches.get(id);
    const pts = Math.floor(step.points * RECOMMENDED_WEIGHT);
    total += pts;
    if (touch) earned += pts;
    perStep.push({
      stepId: id,
      label: step.label,
      channel: channelFor(id),
      status: touch ? 'performed' : 'missed-recommended',
      required: false,
      firstTouchSeconds: touch?.elapsedSeconds,
      order: touch?.order,
    });
  }

  // Extra survey assessments performed beyond the case profile — recorded for
  // the debrief but worth nothing (score is driven by doing the RIGHT steps).
  for (const [id, touch] of touches) {
    if (required.includes(id) || recommended.includes(id)) continue;
    if (!surveyStep(id)) continue;
    perStep.push({
      stepId: id,
      label: ALL_STEPS[id].label,
      channel: channelFor(id),
      status: 'extra',
      required: false,
      firstTouchSeconds: touch.elapsedSeconds,
      order: touch.order,
    });
  }

  const missedPrimary = perStep.filter(s => s.status === 'missed-required' && PRIMARY_RANK[s.stepId] !== undefined);
  if (missedPrimary.length > 0) {
    feedback.push(
      `Primary survey incomplete — never assessed: ${missedPrimary.map(s => s.label).join(', ')}. Every patient gets a full ABCDE.`,
    );
  }
  const missedOther = perStep.filter(s => s.status === 'missed-required' && PRIMARY_RANK[s.stepId] === undefined);
  if (missedOther.length > 0) {
    feedback.push(`Required for this case but not performed: ${missedOther.map(s => s.label).join(', ')}.`);
  }

  const score = total > 0 ? clamp(Math.round((earned / total) * 100)) : 100;
  return { score, feedback, perStep };
}

function scoreSequence(
  touches: Map<AssessmentStepId, PerformedAssessment>,
  flags: AbcdeCaseFlags,
): ComponentResult {
  const feedback: string[] = [];
  const primaryTouches = PRIMARY_ORDER
    .filter(id => touches.has(id))
    .map(id => ({ id, rank: PRIMARY_RANK[id], order: touches.get(id)!.order }));

  if (primaryTouches.length === 0) {
    return { score: 0, feedback: ['No primary-survey steps were performed — the ABCDE sequence could not be assessed.'] };
  }
  if (primaryTouches.length === 1) {
    return { score: 50, feedback: ['Only one primary-survey step was performed — not enough to demonstrate a systematic sequence.'] };
  }

  const lifeThreatFirst = flags.isArrestCase || flags.hasCatastrophicHaemorrhage;
  const isExceptedPair = (lowId: string, highId: string) =>
    lifeThreatFirst && highId === 'circulation' && (lowId === 'airway' || lowId === 'breathing');

  let totalPairs = 0;
  let correctPairs = 0;
  let exceptionUsed = false;
  const inversions: Array<{ earlier: string; later: string }> = [];

  for (let i = 0; i < primaryTouches.length; i++) {
    for (let j = i + 1; j < primaryTouches.length; j++) {
      // primaryTouches is in canonical rank order, so [i] should come first.
      const low = primaryTouches[i];
      const high = primaryTouches[j];
      totalPairs += 1;
      if (low.order < high.order) {
        correctPairs += 1;
      } else if (isExceptedPair(low.id, high.id)) {
        // C touched before A/B in an arrest / catastrophic-bleed case —
        // pulse check / haemorrhage control first is the correct priority.
        correctPairs += 1;
        exceptionUsed = true;
      } else {
        inversions.push({ earlier: high.id, later: low.id });
      }
    }
  }

  if (exceptionUsed) {
    feedback.push(
      flags.isArrestCase
        ? 'Circulation was prioritised before airway/breathing — correct in cardiac arrest (no sequence penalty).'
        : 'Circulation was prioritised before airway/breathing — correct for catastrophic haemorrhage (no sequence penalty).',
    );
  }

  if (inversions.length === 0) {
    feedback.push('Primary survey followed the systematic A→B→C→D→E sequence.');
  } else {
    const label = (id: string) => ALL_STEPS[id as AssessmentStepId]?.shortLabel || id;
    const worst = inversions[0];
    feedback.push(
      `${label(worst.earlier)} was assessed before ${label(worst.later)} — work through Scene → A → B → C → D → E in order.`,
    );
    if (touches.has('scene-safety') && inversions.some(inv => inv.later === 'scene-safety')) {
      feedback.push('Scene safety was not your first action — always size up the scene before touching the patient.');
    }
  }

  const score = clamp(Math.round((correctPairs / totalPairs) * 100));
  return { score, feedback };
}

function scoreTimeliness(
  touches: Map<AssessmentStepId, PerformedAssessment>,
  band: AbcdeYearBand,
  studentYear: StudentYear,
): ComponentResult & { performedCount: number; completed: boolean; completedAtSeconds: number | null } {
  const feedback: string[] = [];
  const target = band.primaryTargetSeconds;
  const primaryTouches = PRIMARY_ORDER.filter(id => touches.has(id)).map(id => touches.get(id)!);
  const performedCount = primaryTouches.length;

  if (performedCount === 0) {
    return { score: 0, feedback, performedCount, completed: false, completedAtSeconds: null };
  }

  // Late = partial credit, not zero: 100 inside the target, linear decay to
  // 40 at twice the target, floor of 30 beyond that.
  const curve = (t: number) => (t <= target ? 100 : Math.max(30, Math.round(100 - ((t - target) / target) * 60)));

  const lastTouch = Math.max(...primaryTouches.map(p => p.elapsedSeconds));
  const firstTouch = Math.min(...primaryTouches.map(p => p.elapsedSeconds));
  const completed = performedCount === PRIMARY_ORDER.length;

  let score: number;
  if (completed) {
    score = curve(lastTouch);
    feedback.push(
      lastTouch <= target
        ? `Primary survey completed in ${fmtMmSs(lastTouch)} — inside the ${fmtMmSs(target)} target for ${studentYear}.`
        : `Primary survey took ${fmtMmSs(lastTouch)} — aim to finish within ${fmtMmSs(target)} at ${studentYear} level.`,
    );
  } else {
    // Incomplete survey: score the pace of what WAS done, scaled by coverage,
    // so a fast-but-partial survey still earns proportionate credit.
    score = Math.round(curve(lastTouch) * (performedCount / PRIMARY_ORDER.length));
    feedback.push(`Primary survey was never completed (${performedCount}/${PRIMARY_ORDER.length} steps).`);
  }

  if (firstTouch > 120) {
    feedback.push(`Primary survey started ${fmtMmSs(firstTouch)} into the case — begin ABCDE within the first 2 minutes.`);
  }

  return {
    score: clamp(score),
    feedback,
    performedCount,
    completed,
    completedAtSeconds: completed ? lastTouch : null,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const NO_FLAGS: AbcdeCaseFlags = { isArrestCase: false, hasCatastrophicHaemorrhage: false };

export function computeAbcdeScore(input: AbcdeScoreInput): AbcdeScore {
  const band = ABCDE_YEAR_BANDS[input.studentYear] ?? ABCDE_YEAR_BANDS['3rd-year'];
  const flags = input.caseFlags ?? NO_FLAGS;
  const touches = firstTouches(input.performed);

  const completeness = scoreCompleteness(touches, input.required, input.recommended);
  const sequence = scoreSequence(touches, flags);
  const timeliness = scoreTimeliness(touches, band, input.studentYear);

  const overall = clamp(Math.round(
    completeness.score * band.weights.completeness +
    sequence.score * band.weights.sequence +
    timeliness.score * band.weights.timeliness,
  ));

  return {
    overall,
    components: {
      completeness: completeness.score,
      sequence: sequence.score,
      timeliness: timeliness.score,
    },
    band,
    perStep: completeness.perStep,
    feedback: [...completeness.feedback, ...sequence.feedback, ...timeliness.feedback],
    primarySurvey: {
      performedCount: timeliness.performedCount,
      totalSteps: PRIMARY_STEPS.length,
      completed: timeliness.completed,
      completedAtSeconds: timeliness.completedAtSeconds,
      targetSeconds: band.primaryTargetSeconds,
    },
  };
}

/**
 * Integration helper: fold the ABCDE spine into the session's assessment
 * points.
 *
 * The session grade is `(assessmentScore + treatmentBonus) / (assessmentTotal
 * + treatmentBonusCap)`. `assessmentTotal` (and therefore the survey's share
 * of the final grade) is untouched; this replaces the SURVEY portion of the
 * earned points with `surveyTotal × overall/100`, so what/when/order all move
 * the grade. History-taking (SAMPLE) points keep their raw completeness value
 * — interview skills aren't judged by ABCDE ordering.
 */
export function applyAbcdeToAssessmentScore(
  tracker: Pick<AssessmentTracker, 'performed' | 'required' | 'recommended'>,
  abcdeOverall: number,
): number {
  const touches = firstTouches(tracker.performed);
  let historyEarned = 0;
  let surveyTotal = 0;

  for (const id of tracker.required) {
    const step = ALL_STEPS[id];
    if (!step) continue;
    if (step.phase === 'history') {
      if (touches.has(id)) historyEarned += step.points;
    } else {
      surveyTotal += step.points;
    }
  }
  for (const id of tracker.recommended) {
    const step = ALL_STEPS[id];
    if (!step || tracker.required.includes(id)) continue;
    const pts = Math.floor(step.points * RECOMMENDED_WEIGHT);
    if (step.phase === 'history') {
      if (touches.has(id)) historyEarned += pts;
    } else {
      surveyTotal += pts;
    }
  }

  return Math.round(historyEarned + surveyTotal * (clamp(abcdeOverall) / 100));
}
