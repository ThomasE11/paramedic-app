import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { deriveScenarioVisuals, deriveActivePatientBehaviors, derivePatientVoicePrompt, REALISM_SCENARIOS } from './patientRealismScenarios';

const baseCase = (overrides: Partial<CaseScenario> & { id: string; title: string }): CaseScenario =>
  ({
    version: 1,
    createdAt: '2026-07-06T00:00:00.000Z',
    updatedAt: '2026-07-06T00:00:00.000Z',
    category: 'general',
    subcategory: 'assessment',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['2nd-year'],
    dispatchInfo: { callReason: 'Patient unwell', timeOfDay: 'day', location: 'Home', callerInfo: 'Family' },
    sceneInfo: { description: 'Home setting', environment: 'Indoor' },
    initialPresentation: { generalImpression: 'Patient appears unwell', appearance: 'Pale', position: 'Supine', consciousness: 'Alert' },
    abcde: {
      airway: { patent: true, findings: [], interventions: [] },
      breathing: { rate: 18, rhythm: 'regular', depth: 'normal', spo2: 97, findings: [], interventions: [], auscultation: [] },
      circulation: { pulseRate: 80, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Warm, dry', findings: [], interventions: [] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
      exposure: { findings: [] },
    },
    secondarySurvey: { head: [], neck: [], chest: [], abdomen: [], pelvis: [], extremities: [], posterior: [], neurological: [] },
    history: { medications: [], allergies: [], medicalConditions: [], surgicalHistory: [] },
    expectedFindings: { keyObservations: [], redFlags: [] },
    patientInfo: { age: 40, gender: 'male', weight: 70 },
    vitalSignsProgression: { initial: { bp: '120/80', pulse: 80, respiration: 18, spo2: 97, gcs: 15, bloodGlucose: 5.0 } },
    ...overrides,
  }) as CaseScenario;

/* ------------------------------------------------------------------ */
/*  clearsWhen enforcement                                            */
/* ------------------------------------------------------------------ */

describe('clearsWhen enforcement', () => {
  it('surfaces trauma bleeding visual when no source control applied', () => {
    const caseData = baseCase({
      id: 'test-clears-bleeding',
      title: 'Stab wound chest',
      category: 'trauma',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Sucking chest wound'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 89, findings: ['Sucking chest wound', 'Reduced air entry'], interventions: [], auscultation: ['Reduced breath sounds'] },
        circulation: { pulseRate: 128, pulseQuality: 'weak', bp: { systolic: 85, diastolic: 50 }, capillaryRefill: 4, skin: 'Pale, cool', findings: ['Haemorrhage from chest wound', 'Shock signs'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: ['Open chest wound', 'Active bleeding'], wounds: ['Open chest wound'] },
      } as any,
    });

    const visuals = deriveScenarioVisuals(caseData, null, []);
    // active_bleeding has clearsWhen: ['source control applied correctly']
    expect(visuals.some(v => v.kind === 'active_bleeding')).toBe(true);
  });

  it('suppresses bleeding visual when chest seal applied (clearsWhen met)', () => {
    const caseData = baseCase({
      id: 'test-clears-suppressed',
      title: 'Stab wound chest',
      category: 'trauma',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Sucking chest wound'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 89, findings: ['Sucking chest wound', 'Reduced air entry'], interventions: [], auscultation: ['Reduced breath sounds'] },
        circulation: { pulseRate: 128, pulseQuality: 'weak', bp: { systolic: 85, diastolic: 50 }, capillaryRefill: 4, skin: 'Pale, cool', findings: ['Haemorrhage from chest wound', 'Shock signs'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: ['Open chest wound', 'Active bleeding'], wounds: ['Open chest wound'] },
      } as any,
    });

    // Apply chest_seal — should clear active_bleeding and open_wound
    const visuals = deriveScenarioVisuals(caseData, null, ['chest_seal']);
    expect(visuals.some(v => v.kind === 'active_bleeding')).toBe(false);
  });

  it('suppresses trauma blood_pool when bleeding controlled', () => {
    const caseData = baseCase({
      id: 'test-clears-bloodpool',
      title: 'Leg wound with bleeding',
      category: 'trauma',
      abcde: {
        patent: true,
        airway: { patent: true, findings: [], interventions: [] },
        breathing: { rate: 24, rhythm: 'regular', depth: 'normal', spo2: 96, findings: [], interventions: [], auscultation: [] },
        circulation: { pulseRate: 110, pulseQuality: 'normal', bp: { systolic: 110, diastolic: 70 }, capillaryRefill: 2, skin: 'Pale', findings: ['Bleeding from leg wound'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: ['Leg wound', 'Active bleeding'], wounds: ['Open wound leg'] },
      } as any,
      secondarySurvey: { head: [], neck: [], chest: [], abdomen: [], pelvis: [], extremities: ['Bleeding from right leg'], posterior: [], neurological: [] },
    });

    // blood_pool has clearsWhen: ['bleeding controlled and packaged']
    const without = deriveScenarioVisuals(caseData, null, []);
    expect(without.some(v => v.kind === 'blood_pool')).toBe(true);

    const withControl = deriveScenarioVisuals(caseData, null, ['bleeding_control']);
    // bleeding_control is in the CLEAR_TREATMENT_MAP for 'dressing' which doesn't match 'bleeding controlled'
    // Actually check: blood_pool's clearsWhen is 'bleeding controlled and packaged' and the map has
    // 'source control': ['bleeding_control', 'tourniquet', 'dressing', 'chest_seal', 'txa']
    // The keyword 'source control' is not in 'bleeding controlled and packaged', so this depends on the direct match
    // The direct check does: appliedTreatmentIds.some(id => lower.includes(id))
    // 'bleeding controlled and packaged' includes 'bleeding_control'? Let's check: 'bleeding controlled' does include 'bleeding_control' as substring? 
    // No — 'bleeding_control' (with underscore) check: lower = 'bleeding controlled and packaged'.replace(/_/g,' ') = 'bleeding controlled and packaged'
    // id = 'bleeding_control'.replace(/_/g,' ') = 'bleeding control'. 'bleeding control' IS in 'bleeding controlled and packaged'
    // So it SHOULD clear. Let's just verify.
    expect(withControl.some(v => v.kind === 'blood_pool')).toBe(false);
  });

  it('clears diaphoresis and tremor when glucose given (hypoglycaemia)', () => {
    const caseData = baseCase({
      id: 'test-clears-hypogly',
      title: 'Hypoglycaemia diabetic emergency low BGL',
      category: 'metabolic',
      abcde: {
        patent: true,
        airway: { patent: true, findings: [], interventions: [] },
        breathing: { rate: 16, rhythm: 'regular', depth: 'normal', spo2: 98, findings: [], interventions: [], auscultation: [] },
        circulation: { pulseRate: 95, pulseQuality: 'normal', bp: { systolic: 115, diastolic: 75 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'V', gcs: { eye: 3, verbal: 4, motor: 5, total: 12 }, pupils: 'equal and reactive', findings: ['Confused', 'Diaphoretic'], interventions: [] },
        exposure: { findings: [] },
      } as any,
      initialPresentation: { generalImpression: 'Confused diaphoretic', appearance: 'Diaphoretic', position: 'Supine', consciousness: 'Confused' },
      history: {
        medications: [{ name: 'Insulin' }],
        allergies: [],
        medicalConditions: ['Diabetes'],
        surgicalHistory: [],
        lastMeal: 'Unknown',
        eventsLeading: 'Found confused',
      },
    });

    const before = deriveScenarioVisuals(caseData, null, []);
    expect(before.some(v => v.kind === 'diaphoresis')).toBe(true);
    expect(before.some(v => v.kind === 'tremor')).toBe(true);

    // After glucose, clearsWhen says 'glucose corrected'
    const after = deriveScenarioVisuals(caseData, null, ['dextrose_10']);
    expect(after.some(v => v.kind === 'diaphoresis')).toBe(false);
    expect(after.some(v => v.kind === 'tremor')).toBe(false);
  });

  it('clears cyanosis when oxygen applied (if-deteriorating + clearsWhen)', () => {
    const caseData = baseCase({
      id: 'test-clears-cyanosis',
      title: 'Severe respiratory distress asthma wheeze hypoxia',
      category: 'respiratory',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 85, findings: ['Wheeze', 'Hypoxia'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 110, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    // Cyanosis is if-deteriorating + clearsWhen['oxygenation improves']
    // With SpO2=85, it should show
    const before = deriveScenarioVisuals(caseData, { bp: '130/80', pulse: 110, respiration: 30, spo2: 85, gcs: 15, bloodGlucose: 5.0 }, []);
    expect(before.some(v => v.kind === 'cyanosis')).toBe(true);

    // After oxygen applied with SpO2 improved to 95, it should clear
    const after = deriveScenarioVisuals(caseData, { bp: '130/80', pulse: 100, respiration: 24, spo2: 95, gcs: 15, bloodGlucose: 5.0 }, ['oxygen_nonrebreather']);
    expect(after.some(v => v.kind === 'cyanosis')).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Patient behavior derivation                                       */
/* ------------------------------------------------------------------ */

describe('deriveActivePatientBehaviors', () => {
  it('returns empty when no treatments applied', () => {
    const behaviors = REALISM_SCENARIOS.flatMap(s => s.patientBehavior);
    const active = deriveActivePatientBehaviors(behaviors, []);
    expect(active).toEqual([]);
  });

  it('returns BVM refusal behavior when BVM applied to wake patient', () => {
    const behaviors = REALISM_SCENARIOS.flatMap(s => s.patientBehavior);
    const active = deriveActivePatientBehaviors(behaviors, ['bvm_ventilation']);
    expect(active.some(b => b.responseType === 'refuse')).toBe(true);
    expect(active.some(b => b.quote && b.quote.includes('Stop'))).toBe(true);
  });

  it('returns adrenaline improvement behavior when adrenaline applied to anaphylaxis', () => {
    const behaviors = REALISM_SCENARIOS.flatMap(s => s.patientBehavior);
    const active = deriveActivePatientBehaviors(behaviors, ['adrenaline_im']);
    expect(active.some(b => b.responseType === 'improve')).toBe(true);
    expect(active.some(b => b.quote && b.quote.includes('throat'))).toBe(true);
  });

  it('returns naloxone agitation behavior when naloxone applied to opioid', () => {
    const behaviors = REALISM_SCENARIOS.flatMap(s => s.patientBehavior);
    const active = deriveActivePatientBehaviors(behaviors, ['naloxone_04mg']);
    expect(active.some(b => b.responseType === 'agitate')).toBe(true);
    expect(active.some(b => b.quote && b.quote.includes('sick'))).toBe(true);
  });

  it('returns guard/pain behavior for trauma when treatment touches injury', () => {
    const behaviors = REALISM_SCENARIOS.flatMap(s => s.patientBehavior);
    const active = deriveActivePatientBehaviors(behaviors, ['splinting']);
    expect(active.some(b => b.responseType === 'guard')).toBe(true);
  });

  it('returns null voice prompt when no behaviors active', () => {
    const prompt = derivePatientVoicePrompt([]);
    expect(prompt).toBeNull();
  });

  it('returns highest-priority behavior for voice prompt', () => {
    const behaviors = REALISM_SCENARIOS.flatMap(s => s.patientBehavior);
    const active = deriveActivePatientBehaviors(behaviors, ['bvm_ventilation']);
    const prompt = derivePatientVoicePrompt(active);
    expect(prompt).not.toBeNull();
    expect(prompt!.responseType).toBe('refuse');
  });

  it('promotes improve response over silent when both active', () => {
    const behaviors = REALISM_SCENARIOS.flatMap(s => s.patientBehavior);
    const active = deriveActivePatientBehaviors(behaviors, ['adrenaline_im', 'iv_cannula']);
    const prompt = derivePatientVoicePrompt(active);
    expect(prompt).not.toBeNull();
    expect(['improve', 'cooperate']).toContain(prompt!.responseType);
  });
});
