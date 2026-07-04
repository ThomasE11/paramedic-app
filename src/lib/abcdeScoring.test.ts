import { describe, it, expect } from 'vitest';
import {
  ALL_STEPS,
  type AssessmentStepId,
  type PerformedAssessment,
} from '@/data/assessmentFramework';
import {
  ABCDE_YEAR_BANDS,
  applyAbcdeToAssessmentScore,
  computeAbcdeScore,
  deriveAbcdeCaseFlags,
  type AbcdeCaseFlags,
} from './abcdeScoring';

// ---------------------------------------------------------------------------
// Fixtures — mirror the shapes the assessment tracker actually records
// ---------------------------------------------------------------------------

const T0 = Date.UTC(2026, 6, 2, 10, 0, 0); // case start epoch ms

/** Build one performed-assessment record the way `performAssessment` does. */
const perf = (stepId: AssessmentStepId, elapsedSeconds: number, order: number): PerformedAssessment => ({
  stepId,
  phase: ALL_STEPS[stepId].phase,
  performedAt: new Date(T0 + elapsedSeconds * 1000).toISOString(),
  elapsedSeconds,
  findings: [],
  order,
});

/** Build a run from an ordered list of [stepId, elapsedSeconds]. */
const run = (steps: Array<[AssessmentStepId, number]>): PerformedAssessment[] =>
  steps.map(([id, t], i) => perf(id, t, i + 1));

// Cardiac-style case profile (primary + history + chest + 12-lead required)
const REQUIRED: AssessmentStepId[] = [
  'scene-safety', 'airway', 'breathing', 'circulation', 'disability', 'exposure',
  'signs-symptoms', 'allergies', 'medications', 'past-medical', 'last-meal', 'events-leading',
  'chest', '12-lead-ecg',
];
const RECOMMENDED: AssessmentStepId[] = ['abdomen', 'extremities', 'neck-cspine', 'pain-assessment', 'blood-glucose'];

const NO_FLAGS: AbcdeCaseFlags = { isArrestCase: false, hasCatastrophicHaemorrhage: false };
const ARREST_FLAGS: AbcdeCaseFlags = { isArrestCase: true, hasCatastrophicHaemorrhage: false };

/** Canonical, complete, on-time run: every required + recommended survey step. */
const perfectSteps: Array<[AssessmentStepId, number]> = [
  ['scene-safety', 10], ['airway', 30], ['breathing', 60], ['circulation', 90],
  ['disability', 120], ['exposure', 150],
  ['chest', 200], ['12-lead-ecg', 230],
  ['abdomen', 240], ['extremities', 250], ['neck-cspine', 260],
  ['pain-assessment', 270], ['blood-glucose', 280],
];

const score = (
  performed: PerformedAssessment[],
  overrides: Partial<Parameters<typeof computeAbcdeScore>[0]> = {},
) => computeAbcdeScore({
  performed,
  required: REQUIRED,
  recommended: RECOMMENDED,
  studentYear: '3rd-year',
  caseFlags: NO_FLAGS,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Perfect run
// ---------------------------------------------------------------------------

describe('computeAbcdeScore — perfect run', () => {
  it('scores 100 across the board for a complete, ordered, on-time survey', () => {
    const result = score(run(perfectSteps));
    expect(result.components.completeness).toBe(100);
    expect(result.components.sequence).toBe(100);
    expect(result.components.timeliness).toBe(100);
    expect(result.overall).toBe(100);
    expect(result.primarySurvey.completed).toBe(true);
    expect(result.primarySurvey.completedAtSeconds).toBe(150);
    expect(result.feedback.join(' ')).toContain('A→B→C→D→E');
  });

  it('marks every scored step as performed in perStep', () => {
    const result = score(run(perfectSteps));
    const performed = result.perStep.filter(s => s.status === 'performed');
    // 8 required survey steps + 5 recommended survey steps (history excluded)
    expect(performed.length).toBe(13);
    expect(result.perStep.some(s => s.status.startsWith('missed'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Missing steps
// ---------------------------------------------------------------------------

describe('computeAbcdeScore — missing steps', () => {
  it('drops completeness and names the missed required steps', () => {
    // Skip exposure (required primary, 5 pts) and 12-lead (required special, 10 pts)
    const steps = perfectSteps.filter(([id]) => id !== 'exposure' && id !== '12-lead-ecg');
    const result = score(run(steps));
    // Survey pool: required 68 pts + recommended 10 pts = 78; earned 63 → 81%
    expect(result.components.completeness).toBe(81);
    const fb = result.feedback.join(' ');
    expect(fb).toContain('Exposure');
    expect(fb).toContain('12-Lead ECG');
    expect(result.primarySurvey.completed).toBe(false);
    expect(result.primarySurvey.performedCount).toBe(5);
  });

  it('scales timeliness by primary-survey coverage when the survey is incomplete', () => {
    const steps = perfectSteps.filter(([id]) => id !== 'exposure');
    const result = score(run(steps));
    // Fast pace (within target) but only 5/6 primary steps → 100 × 5/6 = 83
    expect(result.components.timeliness).toBe(83);
    expect(result.feedback.join(' ')).toContain('never completed (5/6');
  });

  it('gives zero components when nothing was performed', () => {
    const result = score([]);
    expect(result.components).toEqual({ completeness: 0, sequence: 0, timeliness: 0 });
    expect(result.overall).toBe(0);
    expect(result.perStep.filter(s => s.status === 'missed-required').length).toBe(8);
  });

  it('gives partial sequence credit for a single primary step (insufficient evidence)', () => {
    const result = score(run([['airway', 20]]));
    expect(result.components.sequence).toBe(50);
  });

  it('records extra survey steps performed beyond the profile without awarding points', () => {
    const steps: Array<[AssessmentStepId, number]> = [...perfectSteps, ['pelvis', 300]];
    const result = score(run(steps));
    const extra = result.perStep.find(s => s.stepId === 'pelvis');
    expect(extra?.status).toBe('extra');
    expect(result.components.completeness).toBe(100); // unchanged
  });
});

// ---------------------------------------------------------------------------
// Sequence
// ---------------------------------------------------------------------------

describe('computeAbcdeScore — sequence', () => {
  it('penalises out-of-order primary steps and names the inversion', () => {
    // Exposure jumped ahead of breathing/circulation/disability
    const result = score(run([
      ['scene-safety', 10], ['airway', 30], ['exposure', 45],
      ['breathing', 60], ['circulation', 90], ['disability', 120],
      ['chest', 200], ['12-lead-ecg', 230],
      ['abdomen', 240], ['extremities', 250], ['neck-cspine', 260],
      ['pain-assessment', 270], ['blood-glucose', 280],
    ]));
    // 15 pairs, 3 inversions (B/E, C/E, D/E) → 12/15 = 80
    expect(result.components.sequence).toBe(80);
    expect(result.feedback.join(' ')).toMatch(/assessed before/);
    expect(result.components.completeness).toBe(100); // ordering doesn't touch completeness
  });

  it('flags scene safety not being the first action', () => {
    const result = score(run([
      ['airway', 10], ['scene-safety', 20], ['breathing', 40],
      ['circulation', 60], ['disability', 80], ['exposure', 100],
    ]));
    expect(result.components.sequence).toBeLessThan(100);
    expect(result.feedback.join(' ')).toContain('Scene safety');
  });

  it('only judges FIRST touches — re-visits never punish', () => {
    const steps = run(perfectSteps);
    // Defensive: a duplicate airway re-check recorded at the end must not
    // create an inversion (the live tracker dedupes, but stay robust).
    steps.push(perf('airway', 500, steps.length + 1));
    const result = score(steps);
    expect(result.components.sequence).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Life-threat-first exceptions
// ---------------------------------------------------------------------------

describe('computeAbcdeScore — justified exceptions', () => {
  const circulationFirst: Array<[AssessmentStepId, number]> = [
    ['scene-safety', 5], ['circulation', 15], ['airway', 40], ['breathing', 60],
    ['disability', 90], ['exposure', 110],
    ['chest', 150], ['12-lead-ecg', 180],
    ['abdomen', 200], ['extremities', 210], ['neck-cspine', 220],
    ['pain-assessment', 230], ['blood-glucose', 240],
  ];

  it('does not penalise circulation-first in a cardiac arrest case', () => {
    const result = score(run(circulationFirst), { caseFlags: ARREST_FLAGS });
    expect(result.components.sequence).toBe(100);
    expect(result.overall).toBe(100);
    expect(result.feedback.join(' ')).toContain('cardiac arrest');
  });

  it('does not penalise circulation-first for catastrophic haemorrhage (<C>ABC)', () => {
    const result = score(run(circulationFirst), {
      caseFlags: { isArrestCase: false, hasCatastrophicHaemorrhage: true },
    });
    expect(result.components.sequence).toBe(100);
    expect(result.feedback.join(' ')).toContain('catastrophic haemorrhage');
  });

  it('penalises the same order when no life threat justifies it', () => {
    const result = score(run(circulationFirst));
    // 2 inversions (A/C, B/C) out of 15 pairs → 13/15 = 87
    expect(result.components.sequence).toBe(87);
    expect(result.overall).toBeLessThan(100);
  });

  it('still expects scene safety first even in arrest', () => {
    const result = score(run([
      ['circulation', 5], ['scene-safety', 15], ['airway', 30], ['breathing', 50],
      ['disability', 70], ['exposure', 90],
    ]), { caseFlags: ARREST_FLAGS });
    expect(result.components.sequence).toBeLessThan(100);
  });
});

// ---------------------------------------------------------------------------
// Timeliness & year bands
// ---------------------------------------------------------------------------

describe('computeAbcdeScore — timeliness and year bands', () => {
  /** Complete ordered survey finishing the primary at `t` seconds. */
  const slowRun = (t: number) => run([
    ['scene-safety', 10], ['airway', 60], ['breathing', 130], ['circulation', 260],
    ['disability', Math.round(t * 0.8)], ['exposure', t],
    ['chest', t + 30], ['12-lead-ecg', t + 60],
    ['abdomen', t + 70], ['extremities', t + 80], ['neck-cspine', t + 90],
    ['pain-assessment', t + 100], ['blood-glucose', t + 110],
  ]);

  it('gives partial (never zero) credit for a slow but complete survey', () => {
    const result = score(slowRun(720), { studentYear: '3rd-year' }); // 2× the 360s target
    expect(result.components.timeliness).toBe(40);
    expect(result.components.timeliness).toBeGreaterThan(0);
    expect(result.components.completeness).toBe(100);
    expect(result.feedback.join(' ')).toContain('aim to finish within');
  });

  it('floors extreme lateness at 30 rather than zero', () => {
    const result = score(slowRun(3000), { studentYear: '4th-year' });
    expect(result.components.timeliness).toBe(30);
  });

  it('is more generous to 1st-year/diploma than 4th-year for the same pace', () => {
    const y1 = score(slowRun(550), { studentYear: '1st-year' });
    const dip = score(slowRun(550), { studentYear: 'diploma' });
    const y4 = score(slowRun(550), { studentYear: '4th-year' });
    // 550s: inside the 600s 1st-year/diploma target, well past the 300s 4th-year target
    expect(y1.components.timeliness).toBe(100);
    expect(dip.components.timeliness).toBe(100);
    expect(y4.components.timeliness).toBe(50); // 100 − (250/300)×60
    expect(y1.overall).toBeGreaterThan(y4.overall);
  });

  it('flags a late start of the primary survey', () => {
    const late = run(perfectSteps.map(([id, t]) => [id, t + 200] as [AssessmentStepId, number]));
    const result = score(late);
    expect(result.feedback.join(' ')).toContain('begin ABCDE within the first 2 minutes');
  });

  it('exposes coherent year-band config (weights sum to 1, targets tighten with seniority)', () => {
    for (const band of Object.values(ABCDE_YEAR_BANDS)) {
      const sum = band.weights.completeness + band.weights.sequence + band.weights.timeliness;
      expect(sum).toBeCloseTo(1, 10);
    }
    expect(ABCDE_YEAR_BANDS['1st-year'].primaryTargetSeconds)
      .toBeGreaterThan(ABCDE_YEAR_BANDS['2nd-year'].primaryTargetSeconds);
    expect(ABCDE_YEAR_BANDS['2nd-year'].primaryTargetSeconds)
      .toBeGreaterThan(ABCDE_YEAR_BANDS['3rd-year'].primaryTargetSeconds);
    expect(ABCDE_YEAR_BANDS['3rd-year'].primaryTargetSeconds)
      .toBeGreaterThan(ABCDE_YEAR_BANDS['4th-year'].primaryTargetSeconds);
    expect(ABCDE_YEAR_BANDS['diploma']).toEqual(ABCDE_YEAR_BANDS['1st-year']);
  });
});

// ---------------------------------------------------------------------------
// Grade integration
// ---------------------------------------------------------------------------

describe('applyAbcdeToAssessmentScore', () => {
  // Survey pool: 68 required + 10 recommended = 78 pts. History pool: 31 pts.
  const historySteps: Array<[AssessmentStepId, number]> = [
    ['signs-symptoms', 300], ['allergies', 310], ['medications', 320],
    ['past-medical', 330], ['last-meal', 340], ['events-leading', 350],
  ];
  const fullTracker = {
    performed: run([...perfectSteps, ...historySteps]),
    required: REQUIRED,
    recommended: RECOMMENDED,
  };

  it('returns the full point pool for a perfect run at overall 100', () => {
    // 31 history + 78 survey = 109 = tracker totalPoints for this profile
    expect(applyAbcdeToAssessmentScore(fullTracker, 100)).toBe(109);
  });

  it('scales only the survey share — history points keep raw value', () => {
    expect(applyAbcdeToAssessmentScore(fullTracker, 50)).toBe(31 + 39);
    expect(applyAbcdeToAssessmentScore(fullTracker, 0)).toBe(31);
  });

  it('credits only the history actually taken', () => {
    const partial = {
      ...fullTracker,
      performed: run([...perfectSteps, ['allergies', 310] as [AssessmentStepId, number], ['medications', 320] as [AssessmentStepId, number]]),
    };
    expect(applyAbcdeToAssessmentScore(partial, 100)).toBe(10 + 78);
  });

  it('clamps out-of-range overall values', () => {
    expect(applyAbcdeToAssessmentScore(fullTracker, 150)).toBe(109);
    expect(applyAbcdeToAssessmentScore(fullTracker, -20)).toBe(31);
  });
});

// ---------------------------------------------------------------------------
// Case-flag derivation
// ---------------------------------------------------------------------------

describe('deriveAbcdeCaseFlags', () => {
  it('detects arrest cases from subcategory keywords', () => {
    expect(deriveAbcdeCaseFlags({ subcategory: 'cardiac-arrest' }).isArrestCase).toBe(true);
    expect(deriveAbcdeCaseFlags({ subcategory: 'vfib' }).isArrestCase).toBe(true);
    expect(deriveAbcdeCaseFlags({ subcategory: 'asystole' }).isArrestCase).toBe(true);
  });

  it('detects arrest from pulseless circulation findings', () => {
    const flags = deriveAbcdeCaseFlags({
      subcategory: 'collapse',
      abcde: { circulation: { findings: ['No palpable pulse, CPR in progress'] } },
    });
    expect(flags.isArrestCase).toBe(true);
  });

  it('detects catastrophic haemorrhage from wound vocabulary', () => {
    const flags = deriveAbcdeCaseFlags({
      subcategory: 'penetrating-trauma',
      abcde: { exposure: { wounds: ['Catastrophic arterial bleeding from left thigh'] } },
    });
    expect(flags.hasCatastrophicHaemorrhage).toBe(true);
    expect(flags.isArrestCase).toBe(false);
  });

  it('returns both flags false for a routine medical case', () => {
    const flags = deriveAbcdeCaseFlags({
      category: 'respiratory',
      subcategory: 'asthma',
      abcde: {
        circulation: { findings: ['Warm and well perfused'] },
        exposure: { findings: ['No rash'], wounds: [] },
      },
    });
    expect(flags).toEqual({ isArrestCase: false, hasCatastrophicHaemorrhage: false });
  });
});
