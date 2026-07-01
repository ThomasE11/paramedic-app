import { describe, it, expect } from 'vitest';
import type { CaseScenario, VitalSigns } from '@/types';
import {
  createInitialPatientState,
  applyDynamicTreatment,
  applyDeterioration,
} from './dynamicTreatmentEngine';
import { TREATMENTS, type Treatment } from './enhancedTreatmentEffects';

// ---------------------------------------------------------------------------
// Fixtures — a deliberately generic case (no subcategory) so no pathology
// modifiers, protocols, or staged deterioration timelines fire; behaviour
// under test is the engine's own core logic.
// ---------------------------------------------------------------------------

const vitals = (overrides: Partial<VitalSigns> = {}): VitalSigns => ({
  bp: '120/80',
  pulse: 80,
  respiration: 16,
  spo2: 98,
  temperature: 36.8,
  gcs: 15,
  bloodGlucose: 5.5,
  ...overrides,
});

const makeCase = (over: Record<string, unknown> = {}): CaseScenario => ({
  id: 'test-case',
  title: 'Test Case',
  category: 'medical',
  priority: 'urgent',
  complexity: 'moderate',
  yearLevels: ['3rd-year'],
  dispatchInfo: { callReason: 'unwell adult', timeOfDay: 'day', location: 'home', callerInfo: 'family' },
  patientInfo: { age: 40, gender: 'male', weight: 80, language: 'English' },
  sceneInfo: { description: 'domestic scene', hazards: [], bystanders: 'family', environment: 'indoor' },
  initialPresentation: { generalImpression: 'unwell adult', position: 'sitting', appearance: 'pale', consciousness: 'alert' },
  vitalSignsProgression: { initial: vitals() },
  ...over,
} as unknown as CaseScenario);

const getTreatment = (id: string): Treatment => {
  const t = TREATMENTS.find(t => t.id === id);
  if (!t) throw new Error(`treatment ${id} missing from TREATMENTS`);
  return t;
};

// ---------------------------------------------------------------------------
// createInitialPatientState
// ---------------------------------------------------------------------------

describe('createInitialPatientState — rhythm & arrest detection', () => {
  it('gives a stable patient normal sinus rhythm and no arrest', () => {
    const state = createInitialPatientState(makeCase());
    expect(state.currentRhythm).toBe('Normal Sinus Rhythm');
    expect(state.isInArrest).toBe(false);
    expect(state.deteriorationLevel).toBe(0);
    expect(state.treatmentHistory).toEqual([]);
  });

  it('honours the explicit initialRhythm override and forces arrest vitals', () => {
    const state = createInitialPatientState(makeCase({
      initialRhythm: 'Ventricular Fibrillation',
      vitalSignsProgression: { initial: vitals({ pulse: 0, bp: '0/0' }) },
    }));
    expect(state.currentRhythm).toBe('Ventricular Fibrillation');
    expect(state.isInArrest).toBe(true);
    expect(state.vitals.pulse).toBe(0);
    expect(state.vitals.bp).toBe('0/0');
    expect(state.vitals.respiration).toBe(0);
    expect(state.vitals.gcs).toBe(3);
    expect(state.deteriorationLevel).toBe(4);
  });

  it('defaults an untagged pulseless patient to Asystole (safe, non-shockable)', () => {
    const state = createInitialPatientState(makeCase({
      vitalSignsProgression: { initial: vitals({ pulse: 0 }) },
    }));
    expect(state.currentRhythm).toBe('Asystole');
    expect(state.isInArrest).toBe(true);
  });

  it('derives sinus brady/tachycardia from the pulse when nothing else matches', () => {
    const brady = createInitialPatientState(makeCase({
      vitalSignsProgression: { initial: vitals({ pulse: 45 }) },
    }));
    expect(brady.currentRhythm).toBe('Sinus Bradycardia');
    expect(brady.isInArrest).toBe(false);

    const tachy = createInitialPatientState(makeCase({
      vitalSignsProgression: { initial: vitals({ pulse: 125 }) },
    }));
    expect(tachy.currentRhythm).toBe('Sinus Tachycardia');
  });
});

// ---------------------------------------------------------------------------
// applyDynamicTreatment — beneficial path
// ---------------------------------------------------------------------------

describe('applyDynamicTreatment — oxygen therapy', () => {
  const hypoxicCase = makeCase({
    vitalSignsProgression: { initial: vitals({ spo2: 85, pulse: 110, respiration: 24 }) },
  });

  it('raises SpO2 (never above the treatment cap) and records the application', () => {
    const state = createInitialPatientState(hypoxicCase);
    const oxygen = getTreatment('oxygen_nonrebreather');
    const { newState, response } = applyDynamicTreatment(oxygen, state, hypoxicCase);

    expect(newState.vitals.spo2).toBeGreaterThan(85);
    expect(newState.vitals.spo2).toBeLessThanOrEqual(98); // effect maxValue
    expect(newState.treatmentCounts['oxygen_nonrebreather']).toBe(1);
    expect(newState.treatmentHistory).toHaveLength(1);
    expect(response.vitalChanges.length).toBeGreaterThan(0);
    expect(response.vitalChanges.find(c => c.vital === 'SpO2')?.direction).toBe('improved');
  });

  it('an "increase" effect never LOWERS SpO2 when already above the cap', () => {
    const satCase = makeCase({
      vitalSignsProgression: { initial: vitals({ spo2: 99 }) },
    });
    const state = createInitialPatientState(satCase);
    const oxygen = getTreatment('oxygen_nonrebreather'); // spo2 +15 capped at 98
    const { newState } = applyDynamicTreatment(oxygen, state, satCase);
    expect(newState.vitals.spo2).toBe(99); // untouched, not clamped down to 98
  });

  it('does not mutate the input patient state', () => {
    const state = createInitialPatientState(hypoxicCase);
    const before = JSON.parse(JSON.stringify(state.vitals));
    applyDynamicTreatment(getTreatment('oxygen_nonrebreather'), state, hypoxicCase);
    expect(state.vitals).toEqual(before);
    expect(state.treatmentHistory).toHaveLength(0);
  });
});

describe('applyDynamicTreatment — repeated dosing', () => {
  it('shows diminishing effectiveness on the second identical dose', () => {
    const hypoCase = makeCase({
      vitalSignsProgression: { initial: vitals({ bloodGlucose: 2.5, gcs: 12 }) },
    });
    const glucose = getTreatment('glucose_10g');
    const first = applyDynamicTreatment(glucose, createInitialPatientState(hypoCase), hypoCase);
    const second = applyDynamicTreatment(glucose, first.newState, hypoCase);

    expect(first.newState.vitals.bloodGlucose!).toBeGreaterThan(2.5);
    expect(second.newState.vitals.bloodGlucose!).toBeLessThanOrEqual(8); // effect maxValue
    expect(second.response.effectivenessPercent).toBeLessThan(first.response.effectivenessPercent);
    expect(second.newState.treatmentCounts['glucose_10g']).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// applyDynamicTreatment — wrong-action consequences
// ---------------------------------------------------------------------------

describe('applyDynamicTreatment — contraindications & adverse events', () => {
  it('GTN in hypotension drops BP further and raises an adverse-reaction event', () => {
    const hypotensiveCase = makeCase({
      vitalSignsProgression: { initial: vitals({ bp: '82/50', pulse: 105 }) },
    });
    const state = createInitialPatientState(hypotensiveCase);
    const { newState, response } = applyDynamicTreatment(getTreatment('gtn_spray'), state, hypotensiveCase);

    expect(response.effectivenessPercent).toBe(0);
    expect(response.criticalEvent?.type).toBe('adverse-reaction');
    expect(response.warningMessage).toMatch(/CONTRAINDICATED/i);
    const sysAfter = parseInt(newState.vitals.bp.split('/')[0], 10);
    expect(sysAfter).toBeLessThan(82);
  });

  it('withholds ALL medications below 30°C core temperature (hypothermia protocol)', () => {
    const coldCase = makeCase({
      vitalSignsProgression: { initial: vitals({ temperature: 28 }) },
    });
    const state = createInitialPatientState(coldCase);
    const { newState, response } = applyDynamicTreatment(getTreatment('morphine_5mg'), state, coldCase);

    expect(response.effectivenessPercent).toBe(0);
    expect(response.vitalChanges).toEqual([]);
    expect(response.warningMessage).toMatch(/hypothermia/i);
    expect(newState.vitals.pulse).toBe(state.vitals.pulse); // untouched
  });
});

// ---------------------------------------------------------------------------
// applyDynamicTreatment — defibrillation logic
// ---------------------------------------------------------------------------

describe('applyDynamicTreatment — defibrillation', () => {
  const defib = getTreatment('defibrillation');

  it('refuses to convert Asystole — non-shockable rhythm stays in arrest', () => {
    const arrestCase = makeCase({
      vitalSignsProgression: { initial: vitals({ pulse: 0, bp: '0/0' }) },
    });
    const state = createInitialPatientState(arrestCase);
    expect(state.currentRhythm).toBe('Asystole');

    const { newState, response } = applyDynamicTreatment(defib, state, arrestCase, {
      energy: 200, synchronized: false, currentRhythm: state.currentRhythm,
    });

    expect(response.effectivenessPercent).toBe(0);
    expect(response.warningMessage).toMatch(/non-shockable/i);
    expect(newState.isInArrest).toBe(true);
    expect(newState.vitals.pulse).toBe(0);
  });

  it('achieves ROSC after adequate-energy unsynchronized shock on VF', () => {
    const vfCase = makeCase({
      initialRhythm: 'Ventricular Fibrillation',
      vitalSignsProgression: { initial: vitals({ pulse: 0, bp: '0/0', spo2: 60 }) },
    });
    const state = createInitialPatientState(vfCase);
    const { newState, response } = applyDynamicTreatment(defib, state, vfCase, {
      energy: 200, synchronized: false, currentRhythm: 'Ventricular Fibrillation',
    });

    expect(response.criticalEvent?.type).toBe('rosc');
    expect(newState.isInArrest).toBe(false);
    expect(newState.vitals.pulse).toBeGreaterThan(0);
    expect(newState.vitals.spo2).toBeLessThanOrEqual(100);
  });

  it('unsynchronized shock on VT-with-pulse degenerates to VF arrest', () => {
    const vtCase = makeCase({
      initialRhythm: 'Ventricular Tachycardia',
      vitalSignsProgression: { initial: vitals({ pulse: 170, bp: '95/60' }) },
    });
    const state = createInitialPatientState(vtCase);
    expect(state.isInArrest).toBe(false); // VT with a pulse is perfusing

    const { newState, response } = applyDynamicTreatment(defib, state, vtCase, {
      energy: 200, synchronized: false, currentRhythm: 'Ventricular Tachycardia',
    });

    expect(response.criticalEvent?.type).toBe('cardiac-arrest');
    expect(newState.currentRhythm).toBe('Ventricular Fibrillation');
    expect(newState.isInArrest).toBe(true);
    expect(newState.vitals.pulse).toBe(0);
  });

  it('synchronized cardioversion at adequate energy converts VT to sinus rhythm', () => {
    const vtCase = makeCase({
      initialRhythm: 'Ventricular Tachycardia',
      vitalSignsProgression: { initial: vitals({ pulse: 170, bp: '95/60' }) },
    });
    const state = createInitialPatientState(vtCase);
    const { newState, response } = applyDynamicTreatment(defib, state, vtCase, {
      energy: 100, synchronized: true, currentRhythm: 'Ventricular Tachycardia',
    });

    expect(response.criticalEvent?.type).toBe('rhythm-change');
    expect(newState.currentRhythm).toBe('Normal Sinus Rhythm');
    expect(newState.vitals.pulse).toBeGreaterThanOrEqual(60);
    expect(newState.vitals.pulse).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// applyDeterioration (engine version — generic category fallback)
// ---------------------------------------------------------------------------

describe('applyDeterioration — untreated decline', () => {
  it('leaves vitals alone inside the 60s treatment-grace window', () => {
    const c = makeCase();
    const state = createInitialPatientState(c);
    const after = applyDeterioration(state, c, 30);
    expect(after.vitals).toEqual(state.vitals);
    expect(after.timeWithoutTreatment).toBe(30);
  });

  it('worsens a respiratory patient once untreated past the window', () => {
    const respCase = makeCase({
      category: 'respiratory',
      vitalSignsProgression: { initial: vitals({ spo2: 90, pulse: 100, respiration: 22 }) },
    });
    const state = createInitialPatientState(respCase);
    const after = applyDeterioration(state, respCase, 180);

    expect(after.timeWithoutTreatment).toBe(180);
    expect(after.vitals.spo2).toBeLessThan(90);
    expect(after.vitals.pulse).toBeGreaterThan(100);
    expect(after.vitals.respiration).toBeGreaterThan(22);
    // physiologic floors/ceilings hold
    expect(after.vitals.spo2).toBeGreaterThanOrEqual(0);
    expect(after.vitals.pulse).toBeLessThanOrEqual(180);
  });

  it('keeps degrading an arrested patient toward SpO2 floor without resurrecting them', () => {
    const arrestCase = makeCase({
      vitalSignsProgression: { initial: vitals({ pulse: 0, bp: '0/0', spo2: 40 }) },
    });
    const state = createInitialPatientState(arrestCase);
    const after = applyDeterioration(state, arrestCase, 120);
    expect(after.isInArrest).toBe(true);
    expect(after.vitals.pulse).toBe(0);
    expect(after.vitals.spo2).toBeLessThan(40);
    expect(after.vitals.spo2).toBeGreaterThanOrEqual(0);
    expect(after.deteriorationLevel).toBe(4);
  });
});
