/**
 * Round 5 — Sentinel case polish: REAL-case end-to-end verification.
 *
 * sentinelCaseAudit.test.ts verifies the realism layer against synthetic
 * replica cases. This file closes the remaining gap in the TRACKER: run the
 * ACTUAL premium cases from cases.ts through the full pipeline and verify,
 * per case family:
 *
 *   a. Scenario matching — the correct scenario is the TOP match (no over-
 *      or under-matching against the real authored text).
 *   b. Finding visibility — key findings surface as visuals the student can
 *      see via assessment (showWhen immediate/on-assessment, not hidden).
 *   c. Treatment attachment — the correct treatment run through the real
 *      vitals engine (applyDynamicTreatment) actually improves vitals.
 *   d. Wrong-action behavior — contraindicated treatments cause adverse
 *      events; mismatched treatments have minimal effect.
 *   e. Gradual vitals — sentinel treatments have a non-instant onset and
 *      applyTreatmentEffectGradual produces intermediate values (the
 *      useGradualVitalChanges hook interpolates on this contract).
 *   f. Reassessment — each correct treatment has a concrete assessment step
 *      that closes its loop, and the matched scenario demands reassessment.
 *
 * The opioid-OD family has no authored case in cases.ts (scenario matching is
 * covered synthetically in sentinelCaseAudit.test.ts); its engine-level
 * naloxone behavior and reassessment loop are still verified here.
 */

import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import type { CaseScenario } from '@/types';
import {
  matchRealismScenarios,
  deriveScenarioVisuals,
  deriveRealismScenarioState,
  type RealismVisualEffectKind,
} from '@/lib/patientRealismScenarios';
import {
  applyDynamicTreatment,
  createInitialPatientState,
} from '@/data/dynamicTreatmentEngine';
import {
  TREATMENTS,
  applyTreatmentEffectGradual,
  type Treatment,
} from '@/data/enhancedTreatmentEffects';
import { deriveReassessmentStepForTreatment } from '@/lib/caseManagementRealism';

function realCase(id: string): CaseScenario {
  const found = allCases.find(caseData => caseData.id === id);
  expect(found, `real case ${id} must exist in cases.ts`).toBeDefined();
  return found!;
}

function treatment(id: string): Treatment {
  const found = TREATMENTS.find(candidate => candidate.id === id);
  expect(found, `treatment ${id} must exist`).toBeDefined();
  return found!;
}

function systolic(bp: string): number {
  return Number(bp.split('/')[0]);
}

function apply(caseData: CaseScenario, treatmentId: string, priorTreatmentIds: string[] = []) {
  let state = createInitialPatientState(caseData);
  for (const priorId of priorTreatmentIds) {
    state = applyDynamicTreatment(treatment(priorId), state, caseData).newState;
  }
  const before = { ...state.vitals };
  const { newState, response } = applyDynamicTreatment(treatment(treatmentId), state, caseData);
  return { before, after: newState.vitals, response };
}

/** Visible = the student can find it through assessment, not gated on deterioration. */
function visibleKinds(caseData: CaseScenario): RealismVisualEffectKind[] {
  return deriveScenarioVisuals(caseData, caseData.vitalSignsProgression.initial)
    .filter(effect => effect.showWhen === 'immediate' || effect.showWhen === 'on-assessment')
    .map(effect => effect.kind);
}

interface SentinelSpec {
  caseId: string;
  family: string;
  topScenarioId: string;
  visibleFindings: RealismVisualEffectKind[];
  correctTreatmentId: string;
  /** Which vital the correct treatment must improve, verified via the engine. */
  expectImprovement: (before: ReturnType<typeof apply>['before'], after: ReturnType<typeof apply>['after']) => void;
}

const SENTINELS: SentinelSpec[] = [
  {
    caseId: 'resp-001', // Severe asthma
    family: 'respiratory',
    topScenarioId: 'respiratory-bronchospasm',
    visibleFindings: ['accessory_muscle_use'],
    correctTreatmentId: 'nebulizer_salbutamol',
    expectImprovement: (before, after) => {
      expect(after.spo2).toBeGreaterThan(before.spo2);
      expect(after.respiration).toBeLessThan(before.respiration);
    },
  },
  {
    caseId: 'resp-010', // Refractory anaphylaxis
    family: 'respiratory',
    topScenarioId: 'anaphylaxis-systemic',
    visibleFindings: ['rash', 'facial_swelling'],
    correctTreatmentId: 'adrenaline_im',
    expectImprovement: (before, after) => {
      expect(systolic(after.bp)).toBeGreaterThan(systolic(before.bp));
    },
  },
  {
    caseId: 'metab-001', // Severe hypoglycaemia
    family: 'metabolic',
    topScenarioId: 'metabolic-hypoglycaemia-seizure',
    visibleFindings: ['diaphoresis', 'tremor'],
    correctTreatmentId: 'dextrose_10',
    expectImprovement: (before, after) => {
      expect(after.bloodGlucose!).toBeGreaterThan(before.bloodGlucose!);
      expect(after.bloodGlucose!).toBeGreaterThanOrEqual(4);
      expect(after.gcs!).toBeGreaterThan(before.gcs!);
    },
  },
  {
    caseId: 'cardiac-001', // Anterior STEMI
    family: 'cardiac',
    topScenarioId: 'cardiac-acs-instability',
    visibleFindings: ['diaphoresis', 'pallor'],
    correctTreatmentId: 'aspirin',
    expectImprovement: (before, after) => {
      // Aspirin is antiplatelet — no dramatic vitals swing, but it must never worsen.
      expect(after.pulse).toBeLessThanOrEqual(before.pulse);
      expect(systolic(after.bp)).toBeGreaterThanOrEqual(systolic(before.bp) - 1);
    },
  },
  {
    caseId: 'neuro-001', // Acute ischaemic stroke
    family: 'neurology',
    topScenarioId: 'neurology-stroke-seizure',
    visibleFindings: ['facial_droop'],
    correctTreatmentId: 'oxygen_nonrebreather',
    expectImprovement: (before, after) => {
      expect(after.spo2).toBeGreaterThanOrEqual(before.spo2);
    },
  },
  {
    caseId: 'trauma-003', // Penetrating chest wound (open pneumothorax)
    family: 'trauma',
    topScenarioId: 'trauma-haemorrhage-open-chest',
    visibleFindings: ['open_wound', 'active_bleeding', 'asymmetric_chest_rise'],
    correctTreatmentId: 'chest_seal_vented',
    expectImprovement: (before, after) => {
      expect(after.spo2).toBeGreaterThan(before.spo2);
    },
  },
  {
    caseId: 'burn-001', // Industrial burns + inhalation injury
    family: 'burns',
    topScenarioId: 'burns-inhalation-risk',
    visibleFindings: ['burn_pattern', 'soot'],
    correctTreatmentId: 'oxygen_nonrebreather',
    expectImprovement: (before, after) => {
      expect(after.spo2).toBeGreaterThan(before.spo2);
    },
  },
];

describe('Sentinel polish — real cases end-to-end', () => {
  for (const sentinel of SENTINELS) {
    describe(`${sentinel.caseId} (${sentinel.family})`, () => {
      const caseData = realCase(sentinel.caseId);

      it('matches the correct realism scenario as top priority', () => {
        const matched = matchRealismScenarios(caseData);
        expect(matched.length).toBeGreaterThan(0);
        expect(matched[0].id).toBe(sentinel.topScenarioId);
      });

      it('reveals key findings through assessment (not hidden)', () => {
        const kinds = visibleKinds(caseData);
        for (const kind of sentinel.visibleFindings) {
          expect(kinds, `${sentinel.caseId} should surface ${kind}`).toContain(kind);
        }
      });

      it('correct treatment improves vitals through the real engine', () => {
        const { before, after, response } = apply(caseData, sentinel.correctTreatmentId);
        expect(response.criticalEvent?.type).not.toBe('adverse-reaction');
        sentinel.expectImprovement(before, after);
      });

      it('correct treatment has gradual (non-instant) onset with intermediate values', () => {
        const sentinelTreatment = treatment(sentinel.correctTreatmentId);
        expect(sentinelTreatment.onset).not.toBe('immediate');
        expect(sentinelTreatment.onsetTimeSeconds).toBeGreaterThan(0);

        const vitals = { ...caseData.vitalSignsProgression.initial };
        const half = applyTreatmentEffectGradual(sentinelTreatment, vitals, 0.5);
        const full = applyTreatmentEffectGradual(sentinelTreatment, vitals, 1);
        expect(half.hasChanges).toBe(true);
        // At half progress no vital may have already reached its full-progress
        // delta magnitude — that would be an instant jump, not a transition.
        const deltaAtProgress = (result: typeof half) =>
          Math.abs(result.vitals.spo2 - vitals.spo2)
          + Math.abs(result.vitals.respiration - vitals.respiration)
          + Math.abs(result.vitals.pulse - vitals.pulse)
          + Math.abs((result.vitals.bloodGlucose ?? 0) - (vitals.bloodGlucose ?? 0))
          + Math.abs(systolic(result.vitals.bp) - systolic(vitals.bp));
        expect(deltaAtProgress(half)).toBeGreaterThan(0);
        expect(deltaAtProgress(half)).toBeLessThan(deltaAtProgress(full));
      });

      it('requires meaningful reassessment after the correct treatment', () => {
        const step = deriveReassessmentStepForTreatment(sentinel.correctTreatmentId);
        expect(step, `${sentinel.correctTreatmentId} must map to a reassessment step`).not.toBeNull();

        const state = deriveRealismScenarioState({
          caseData,
          appliedTreatmentIds: [sentinel.correctTreatmentId],
        });
        expect(state.reassessmentRequirements.length).toBeGreaterThan(0);
      });
    });
  }
});

describe('Sentinel polish — wrong-action behavior on real cases', () => {
  it('GTN on hypotensive anaphylaxis (resp-010, BP 65 systolic) causes adverse deterioration', () => {
    const { before, after, response } = apply(realCase('resp-010'), 'gtn_spray');
    expect(response.criticalEvent?.type).toBe('adverse-reaction');
    expect(systolic(after.bp)).toBeLessThan(systolic(before.bp));
    expect(response.effectivenessPercent).toBe(0);
  });

  it('GTN on hypotensive burns patient (burn-001, BP 85 systolic) causes adverse deterioration', () => {
    const { before, after, response } = apply(realCase('burn-001'), 'gtn_spray');
    expect(response.criticalEvent?.type).toBe('adverse-reaction');
    expect(systolic(after.bp)).toBeLessThan(systolic(before.bp));
  });

  it('salbutamol on a stroke patient (neuro-001) has minimal effect, not improvement theatre', () => {
    const { response } = apply(realCase('neuro-001'), 'nebulizer_salbutamol');
    expect(response.effectivenessPercent).toBeLessThan(40);
    expect(response.criticalEvent).toBeUndefined();
  });

  it('first salbutamol dose in life-threatening asthma (resp-001, RR 32) is partial and demands repeat', () => {
    const { response } = apply(realCase('resp-001'), 'nebulizer_salbutamol');
    expect(response.isPartialResponse).toBe(true);
    expect(response.requiresRepeat).toBe(true);
  });

  it('oral glucose is scenario-blocked for the real hypoglycaemia case (GCS 13 airway risk)', () => {
    const scenario = matchRealismScenarios(realCase('metab-001'))
      .find(candidate => candidate.family === 'metabolic');
    expect(scenario).toBeDefined();
    const oral = scenario!.treatmentResponses.find(rule =>
      rule.treatmentIdFragments.some(fragment => fragment.includes('oral_glucose')));
    expect(oral).toBeDefined();
    expect(oral!.expectedFit).toBe('blocked');
  });
});

describe('Sentinel polish — opioid family (engine + loop; no authored case in cases.ts)', () => {
  it('naloxone has fast-but-gradual onset and raises RR toward target, not past it', () => {
    const naloxone = treatment('naloxone_04mg');
    expect(naloxone.onset).not.toBe('immediate');
    expect(naloxone.onsetTimeSeconds).toBeGreaterThan(0);

    const opioidVitals = { bp: '100/65', pulse: 55, respiration: 6, spo2: 82, gcs: 7 };
    const half = applyTreatmentEffectGradual(naloxone, opioidVitals, 0.5);
    const full = applyTreatmentEffectGradual(naloxone, opioidVitals, 1);
    expect(half.vitals.respiration).toBeGreaterThan(6);
    expect(half.vitals.respiration).toBeLessThan(full.vitals.respiration);
    expect(full.vitals.respiration).toBeLessThanOrEqual(20); // titrate to RR, no overshoot
    expect(full.vitals.gcs!).toBeGreaterThan(7);
  });

  it('naloxone closes its loop through a breathing reassessment', () => {
    expect(deriveReassessmentStepForTreatment('naloxone_04mg')).toBe('breathing');
  });
});
