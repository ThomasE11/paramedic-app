import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import {
  matchRealismScenarios,
  deriveScenarioTreatmentResponses,
  deriveScenarioVisuals,
  deriveRealismScenarioState,
  REALISM_SCENARIOS,
} from './patientRealismScenarios';

/* ------------------------------------------------------------------ */
/*  Minimal case factories                                            */
/* ------------------------------------------------------------------ */

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
    dispatchInfo: { callReason: 'Patient unwell', timeOfDay: 'afternoon', location: 'Home', callerInfo: 'Family' },
    sceneInfo: { description: 'Home setting', environment: 'Indoor', hazards: [], bystanders: 'Family present' },
    initialPresentation: { generalImpression: 'Patient appears unwell', appearance: 'Pale', position: 'Supine', consciousness: 'Alert' },
    abcde: {
      airway: { patent: true, findings: [], interventions: [] },
      breathing: { rate: 18, rhythm: 'regular', depth: 'normal', spo2: 97, findings: [], interventions: [], auscultation: [] },
      circulation: { pulseRate: 80, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Warm, dry', findings: [], interventions: [] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
      exposure: { findings: [] },
    },
    secondarySurvey: { head: [], neck: [], chest: [], abdomen: [], pelvis: [], extremities: [], posterior: [], neurological: [] },
    history: { medications: [], allergies: [], medicalConditions: [], surgicalHistory: [], lastMeal: 'Unknown', eventsLeading: 'Unknown' },
    expectedFindings: { keyObservations: [], redFlags: [], differentialDiagnoses: [], mostLikelyDiagnosis: 'Undifferentiated' },
    patientInfo: { age: 40, gender: 'male', weight: 70, language: 'English' },
    vitalSignsProgression: { initial: { bp: '120/80', pulse: 80, respiration: 18, spo2: 97, gcs: 15, bloodGlucose: 5.0 } },
    ...overrides,
  }) as CaseScenario;

/* ------------------------------------------------------------------ */
/*  Sentinel scenario existence                                        */
/* ------------------------------------------------------------------ */

describe('REALISM_SCENARIOS', () => {
  it('contains at least 8 sentinel scenarios', () => {
    expect(REALISM_SCENARIOS.length).toBeGreaterThanOrEqual(8);
  });

  it('has unique scenario IDs', () => {
    const ids = REALISM_SCENARIOS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes all required problem families', () => {
    const families = REALISM_SCENARIOS.map(s => s.family);
    expect(families).toContain('respiratory');
    expect(families).toContain('toxicology');
    expect(families).toContain('metabolic');
    expect(families).toContain('cardiac');
    expect(families).toContain('neurology');
    expect(families).toContain('trauma');
    expect(families).toContain('burns');
  });

  it('each scenario has match keywords', () => {
    for (const scenario of REALISM_SCENARIOS) {
      expect(scenario.match.length).toBeGreaterThan(0);
      expect(scenario.priority).toBeGreaterThan(0);
    }
  });

  it('each scenario has immediateVisuals', () => {
    for (const scenario of REALISM_SCENARIOS) {
      expect(scenario.immediateVisuals.length).toBeGreaterThan(0);
    }
  });

  it('each scenario has treatmentResponses', () => {
    for (const scenario of REALISM_SCENARIOS) {
      expect(scenario.treatmentResponses.length).toBeGreaterThan(0);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  Mapping: case text → scenario                                      */
/* ------------------------------------------------------------------ */

describe('matchRealismScenarios', () => {
  it('maps asthma case to respiratory scenario', () => {
    const scenario = baseCase({
      id: 'test-asthma',
      title: 'Asthma attack',
      category: 'respiratory',
      subcategory: 'asthma',
      vitalSignsProgression: {
        initial: { bp: '130/80', pulse: 110, respiration: 30, spo2: 88, gcs: 15, bloodGlucose: 5.0 },
      },
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze audible', 'Accessory muscle use'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 88, findings: ['Expiratory wheeze', 'Reduced air entry'], interventions: [], auscultation: ['Diffuse expiratory wheeze'] },
        circulation: { pulseRate: 110, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Warm, diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
      initialPresentation: { generalImpression: 'Tripod position, accessory muscle use', appearance: 'Diaphoretic, distressed', position: 'Sitting upright, tripod', consciousness: 'Alert' },
      dispatchInfo: { callReason: 'Short of breath', timeOfDay: 'afternoon', location: 'Home', callerInfo: 'Family' },
    });

    const matched = matchRealismScenarios(scenario);
    const respiratoryScenario = matched.find(s => s.family === 'respiratory');
    expect(respiratoryScenario).toBeDefined();
    expect(respiratoryScenario!.id).toBe('respiratory-bronchospasm');
    expect(respiratoryScenario!.activeProblems).toContain('bronchospasm');
  });

  it('does not render differential diagnoses as active patient visuals', () => {
    const scenario = baseCase({
      id: 'test-asthma-with-differential',
      title: 'Severe asthma using inhaler repeatedly',
      category: 'respiratory',
      subcategory: 'asthma',
      dispatchInfo: {
        callReason: 'Cannot breathe, using inhaler repeatedly',
        timeOfDay: 'evening',
        location: 'Home',
        callerInfo: 'Parent',
      },
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Speaking one-word answers'], interventions: [] },
        breathing: { rate: 32, rhythm: 'rapid', depth: 'shallow', spo2: 88, findings: ['Wheeze', 'Accessory muscle use'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 120, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
        exposure: { findings: [] },
      } as any,
      expectedFindings: {
        keyObservations: ['Severe bronchospasm', 'Hypoxia'],
        redFlags: ['Silent chest risk'],
        differentialDiagnoses: ['Anaphylaxis', 'Foreign body aspiration'],
        mostLikelyDiagnosis: 'Severe asthma',
      },
    });

    const matched = matchRealismScenarios(scenario);
    expect(matched.some(s => s.id === 'respiratory-bronchospasm')).toBe(true);
    expect(matched.some(s => s.id === 'anaphylaxis-systemic')).toBe(false);
  });

  it('maps anaphylaxis case to anaphylaxis scenario', () => {
    const scenario = baseCase({
      id: 'test-anaphylaxis',
      title: 'Allergic reaction / anaphylaxis',
      subcategory: 'anaphylaxis',
      dispatchInfo: { callReason: 'Bee sting — facial swelling', timeOfDay: 'afternoon', location: 'Park', callerInfo: 'Friend' },
      abcde: {
        patent: true,
        airway: { patent: false, findings: ['Lip swelling', 'Stridor'], interventions: [] },
        breathing: { rate: 26, rhythm: 'normal', depth: 'normal', spo2: 94, findings: ['Wheeze'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 110, pulseQuality: 'weak', bp: { systolic: 90, diastolic: 55 }, capillaryRefill: 3, skin: 'Flushed, urticaria', findings: ['Hypotension', 'Urticaria chest and arms'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
        exposure: { findings: ['Generalised urticaria', 'Lip swelling'], rashes: ['Urticaria'], wounds: [] },
      } as any,
    });

    const matched = matchRealismScenarios(scenario);
    const anaScenario = matched.find(s => s.family === 'respiratory' && s.id === 'anaphylaxis-systemic');
    expect(anaScenario).toBeDefined();
    expect(anaScenario!.activeProblems).toContain('anaphylaxis');
  });

  it('maps opioid overdose to toxicology scenario', () => {
    const scenario = baseCase({
      id: 'test-opioid',
      title: 'Opioid overdose',
      category: 'toxicology',
      dispatchInfo: { callReason: 'Unconscious, possible overdose', timeOfDay: 'evening', location: 'Alley', callerInfo: 'Bystander' },
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Snoring respirations'], interventions: [] },
        breathing: { rate: 6, rhythm: 'irregular', depth: 'shallow', spo2: 85, findings: ['Bradypnoea', 'Shallow respirations'], interventions: [], auscultation: ['Reduced air entry bilaterally'] },
        circulation: { pulseRate: 55, pulseQuality: 'weak', bp: { systolic: 100, diastolic: 65 }, capillaryRefill: 3, skin: 'Cool, pale', findings: [], interventions: [] },
        disability: { avpu: 'P', gcs: { eye: 1, verbal: 2, motor: 4, total: 7 }, pupils: 'pinpoint', findings: ['Unresponsive to voice'], interventions: [] },
        exposure: { findings: ['Needle track marks left arm'] },
      } as any,
    });

    const matched = matchRealismScenarios(scenario);
    const toxScenario = matched.find(s => s.id === 'toxicology-opioid-hypoventilation');
    expect(toxScenario).toBeDefined();
    expect(toxScenario!.activeProblems).toContain('opioid toxidrome');
  });

  it('maps hypoglycaemia to metabolic scenario', () => {
    const scenario = baseCase({
      id: 'test-hypogly',
      title: 'Hypoglycaemia / diabetic emergency',
      category: 'metabolic',
      abcde: {
        patent: true,
        airway: { patent: true, findings: [], interventions: [] },
        breathing: { rate: 16, rhythm: 'regular', depth: 'normal', spo2: 98, findings: [], interventions: [], auscultation: [] },
        circulation: { pulseRate: 95, pulseQuality: 'normal', bp: { systolic: 115, diastolic: 75 }, capillaryRefill: 2, skin: 'Diaphoretic, warm', findings: [], interventions: [] },
        disability: { avpu: 'V', gcs: { eye: 3, verbal: 4, motor: 5, total: 12 }, pupils: 'equal and reactive', findings: ['Confused', 'Diaphoretic'], interventions: [] },
        exposure: { findings: [] },
      } as any,
      initialPresentation: { generalImpression: 'Confused, sweaty', appearance: 'Diaphoretic, pale', position: 'Supine', consciousness: 'Confused' },
      history: { medications: [{ name: 'Insulin' }], allergies: [], medicalConditions: ['Type 1 diabetes'], surgicalHistory: [], lastMeal: 'Missed breakfast', eventsLeading: 'Missed breakfast' },
    });

    const matched = matchRealismScenarios(scenario);
    const metabScenario = matched.find(s => s.id === 'metabolic-hypoglycaemia-seizure');
    expect(metabScenario).toBeDefined();
    expect(metabScenario!.activeProblems).toContain('glucose-driven altered mentation');
  });

  it('maps trauma case to trauma-haemorrhage scenario', () => {
    const scenario = baseCase({
      id: 'test-trauma',
      title: 'Stab wound to chest',
      category: 'trauma',
      subcategory: 'penetrating-chest',
      priority: 'critical',
      dispatchInfo: { callReason: 'Stab wound to chest, bleeding heavily', timeOfDay: 'evening', location: 'Street', callerInfo: 'Bystander' },
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Speaking short phrases'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 90, findings: ['Sucking chest wound left side', 'Reduced air entry left'], interventions: [], auscultation: ['Reduced breath sounds left'] },
        circulation: { pulseRate: 128, pulseQuality: 'weak', bp: { systolic: 88, diastolic: 50 }, capillaryRefill: 4, skin: 'Pale, cool, clammy', findings: ['Moderate bleeding from chest wound', 'Shock signs'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: ['2cm stab wound 5th intercostal space left anterior chest'], wounds: ['Open chest wound'] },
      } as any,
      initialPresentation: { generalImpression: 'Young male, holding chest', appearance: 'Pale, distressed, blood on chest', position: 'Sitting, leaning forward', consciousness: 'Alert' },
    });

    const matched = matchRealismScenarios(scenario);
    const traumaScenario = matched.find(s => s.id === 'trauma-haemorrhage-open-chest');
    expect(traumaScenario).toBeDefined();
    expect(traumaScenario!.activeProblems).toContain('external bleeding or open wound');
    expect(traumaScenario!.immediateVisuals.some(v => v.kind === 'open_wound')).toBe(true);
  });

  it('does not map non-traumatic intracranial haemorrhage language to external trauma visuals', () => {
    const scenario = baseCase({
      id: 'test-headache-haemorrhage',
      title: 'Severe headache with vision changes',
      category: 'cardiac',
      subcategory: 'hypertensive-emergency',
      dispatchInfo: {
        callReason: 'Severe headache, vision changes',
        timeOfDay: 'evening',
        location: 'Villa',
        callerInfo: 'Housekeeper',
      },
      initialPresentation: {
        generalImpression: 'Middle-aged male, distressed, holding head',
        appearance: 'Flushed, diaphoretic',
        position: 'Sitting',
        consciousness: 'Alert',
      },
      expectedFindings: {
        keyObservations: ['Hypertension', 'Headache', 'Visual disturbance'],
        redFlags: ['Possible intracranial haemorrhage'],
        differentialDiagnoses: ['Hypertensive emergency', 'Subarachnoid haemorrhage'],
        mostLikelyDiagnosis: 'Hypertensive emergency',
      },
    });

    const matched = matchRealismScenarios(scenario);
    expect(matched.some(s => s.id === 'trauma-haemorrhage-open-chest')).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Scenario visuals                                                   */
/* ------------------------------------------------------------------ */

describe('deriveScenarioVisuals', () => {
  it('returns immediate visuals from matched respiratory scenario', () => {
    const scenario = baseCase({
      id: 'test-visuals-asthma',
      title: 'Asthma exacerbation',
      category: 'respiratory',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze'], interventions: [] },
        breathing: { rate: 28, rhythm: 'rapid', depth: 'shallow', spo2: 91, findings: ['Expiratory wheeze', 'Accessory muscle use'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 100, pulseQuality: 'normal', bp: { systolic: 125, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    const visuals = deriveScenarioVisuals(scenario);
    expect(visuals.length).toBeGreaterThan(0);
    expect(visuals.some(v => v.kind === 'accessory_muscle_use')).toBe(true);
    expect(visuals.some(v => v.kind === 'diaphoresis')).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Treatment response                                                 */
/* ------------------------------------------------------------------ */

describe('deriveScenarioTreatmentResponses', () => {
  it('returns matched oxygen response for asthma', () => {
    const scenario = baseCase({
      id: 'test-tx-asthma',
      title: 'Asthma attack',
      category: 'respiratory',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 88, findings: ['Expiratory wheeze'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 110, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    const responses = deriveScenarioTreatmentResponses(scenario, ['oxygen_nonrebreather']);
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.some(r => r.expectedFit === 'matched' && r.debriefSignal.includes('oxygen'))).toBe(true);
  });

  it('returns adrenaline response for anaphylaxis', () => {
    const scenario = baseCase({
      id: 'test-tx-ana',
      title: 'Anaphylactic shock',
      subcategory: 'anaphylaxis',
      dispatchInfo: { callReason: 'Bee sting', timeOfDay: 'afternoon', location: 'Park', callerInfo: 'Friend' },
      abcde: {
        patent: true,
        airway: { patent: false, findings: ['Facial swelling', 'Stridor'], interventions: [] },
        breathing: { rate: 26, rhythm: 'normal', depth: 'normal', spo2: 94, findings: ['Wheeze'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 115, pulseQuality: 'weak', bp: { systolic: 88, diastolic: 55 }, capillaryRefill: 3, skin: 'Urticaria', findings: ['Hypotension'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
        exposure: { findings: ['Generalised urticaria'], rashes: ['Urticaria'] },
      } as any,
    });

    const responses = deriveScenarioTreatmentResponses(scenario, ['adrenaline_im']);
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.some(r => r.expectedFit === 'matched' && r.debriefSignal.includes('IM adrenaline'))).toBe(true);
  });

  it('returns naloxone response for opioid overdose', () => {
    const scenario = baseCase({
      id: 'test-tx-naloxone',
      title: 'Opioid overdose',
      category: 'toxicology',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Snoring'], interventions: [] },
        breathing: { rate: 6, rhythm: 'irregular', depth: 'shallow', spo2: 82, findings: ['Bradypnoea'], interventions: [], auscultation: ['Reduced air entry'] },
        circulation: { pulseRate: 55, pulseQuality: 'weak', bp: { systolic: 100, diastolic: 65 }, capillaryRefill: 3, skin: 'Pale, cool', findings: [], interventions: [] },
        disability: { avpu: 'P', gcs: { eye: 1, verbal: 2, motor: 4, total: 7 }, pupils: 'pinpoint', findings: ['Unresponsive'], interventions: [] },
        exposure: { findings: ['Needle tracks'] },
      } as any,
    });

    const responses = deriveScenarioTreatmentResponses(scenario, ['naloxone_04mg']);
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.some(r => r.expectedFit === 'matched')).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Integrated scenario state                                          */
/* ------------------------------------------------------------------ */

describe('deriveRealismScenarioState', () => {
  it('returns aggregated state for matched trauma scenario', () => {
    const scenario = baseCase({
      id: 'test-state-trauma',
      title: 'MVA — open chest wound',
      category: 'trauma',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Speaking with difficulty'], interventions: [] },
        breathing: { rate: 32, rhythm: 'rapid', depth: 'shallow', spo2: 89, findings: ['Sucking chest wound', 'Reduced air entry right'], interventions: [], auscultation: ['Reduced breath sounds right'] },
        circulation: { pulseRate: 130, pulseQuality: 'weak', bp: { systolic: 85, diastolic: 50 }, capillaryRefill: 4, skin: 'Pale, cool, clammy', findings: ['Haemorrhage from chest wound', 'Shock'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: ['Open chest wound right 4th intercostal space', 'Active bleeding'], wounds: ['Open chest wound'] },
      } as any,
    });

    const state = deriveRealismScenarioState({ caseData: scenario, appliedTreatmentIds: ['oxygen_nonrebreather', 'chest_seal'] });

    expect(state.matchedScenarioIds).toContain('trauma-haemorrhage-open-chest');
    expect(state.families).toContain('trauma');
    expect(state.activeProblems.length).toBeGreaterThan(0);
    expect(state.activeProblems).toContain('external bleeding or open wound');
    expect(state.visualEffects.some(v => v.kind === 'open_wound')).toBe(true);
    expect(state.visualEffects.some(v => v.kind === 'active_bleeding')).toBe(true);
    expect(state.equipmentAnchors.length).toBeGreaterThan(0);
    expect(state.equipmentAnchors.some(a => a.region === 'chest')).toBe(true);
    expect(state.patientBehavior.length).toBeGreaterThan(0);
    expect(state.reassessmentRequirements.length).toBeGreaterThan(0);
    expect(state.debriefSignals.length).toBeGreaterThan(0);
  });

  it('returns empty state for unmatched case', () => {
    const scenario = baseCase({
      id: 'test-no-match',
      title: 'Routine check-up',
      category: 'general',
      abcde: {
        patent: true,
        airway: { patent: true, findings: [], interventions: [] },
        breathing: { rate: 16, rhythm: 'regular', depth: 'normal', spo2: 99, findings: [], interventions: [], auscultation: ['Clear air entry bilaterally'] },
        circulation: { pulseRate: 72, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Warm, dry', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    const state = deriveRealismScenarioState({ caseData: scenario });
    expect(state.matchedScenarioIds).toEqual([]);
    expect(state.families).toEqual([]);
    expect(state.activeProblems).toEqual([]);
    expect(state.visualEffects).toEqual([]);
    expect(state.equipmentAnchors).toEqual([]);
    expect(state.reassessmentRequirements).toEqual([]);
  });

  it('includes equipment anchors for applied treatments', () => {
    const scenario = baseCase({
      id: 'test-anchors-asthma',
      title: 'Asthma exacerbation',
      category: 'respiratory',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze'], interventions: [] },
        breathing: { rate: 28, rhythm: 'rapid', depth: 'shallow', spo2: 91, findings: ['Expiratory wheeze'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 100, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    const state = deriveRealismScenarioState({ caseData: scenario, appliedTreatmentIds: ['oxygen_nonrebreather'] });
    expect(state.equipmentAnchors.length).toBeGreaterThan(0);
    expect(state.equipmentAnchors.some(a => a.region === 'face')).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Case-authored motion (seizing / twitching / tremor on arrival)     */
/* ------------------------------------------------------------------ */

describe('deriveAuthoredMotionVisuals', () => {
  it('an actively-convulsing presentation seizes immediately', () => {
    const scenario = baseCase({
      id: 'test-active-seizure',
      title: 'Seizure in progress',
      initialPresentation: {
        generalImpression: 'Adult male convulsing on the floor',
        appearance: 'Rhythmic jerking movements of all limbs',
        position: 'Supine on floor',
        consciousness: 'Unresponsive during seizure',
      },
    });
    const state = deriveRealismScenarioState({ caseData: scenario });
    const seizure = state.visualEffects.find(v => v.kind === 'seizure_activity');
    expect(seizure).toBeDefined();
    expect(seizure?.showWhen).toBe('immediate');
    expect(seizure?.intensity).toBe('severe');
  });

  it('post-ictal residual twitching reads as fine motion, not convulsion', () => {
    const scenario = baseCase({
      id: 'test-postictal-twitching',
      title: 'Febrile seizure, post-ictal',
      initialPresentation: {
        generalImpression: 'Small child, post-ictal, hot to touch',
        appearance: 'Flushed, hot skin, eyes closed, twitching',
        position: 'Held by mother',
        consciousness: 'Responding to pain, post-ictal',
      },
    });
    const state = deriveRealismScenarioState({ caseData: scenario });
    expect(state.visualEffects.some(v => v.kind === 'seizure_activity' && v.showWhen === 'immediate')).toBe(false);
    const tremor = state.visualEffects.find(v => v.id === 'authored-residual-twitching');
    expect(tremor).toBeDefined();
    expect(tremor?.kind).toBe('tremor');
  });

  it('teaching text about status epilepticus does NOT set the patient shaking', () => {
    const scenario = baseCase({
      id: 'test-teaching-text-guard',
      title: 'Post-ictal patient',
      initialPresentation: {
        generalImpression: 'Young female, post-ictal, confused',
        appearance: 'Drowsy, bitten tongue',
        position: 'Recovery position',
        consciousness: 'Post-ictal confusion',
      },
      expectedFindings: {
        keyObservations: ['Status epilepticus: defined as >5 minutes continuous seizure'],
        redFlags: ['Seizure recurs or >5 min (status epilepticus) — convulsing beyond 5 minutes needs midazolam'],
        differentialDiagnoses: [],
        mostLikelyDiagnosis: 'Generalized tonic-clonic seizure, resolved',
      },
    });
    const state = deriveRealismScenarioState({ caseData: scenario });
    expect(state.visualEffects.some(v => v.id === 'authored-active-seizure')).toBe(false);
    expect(state.visualEffects.some(v => v.id === 'authored-residual-twitching')).toBe(false);
  });

  it('authored tremor/shivering in the presentation shows immediately', () => {
    const scenario = baseCase({
      id: 'test-authored-tremor',
      title: 'Hypoglycaemic episode',
      initialPresentation: {
        generalImpression: 'Diaphoretic adult, trembling',
        appearance: 'Pale, sweaty, visible tremor of both hands',
        position: 'Seated',
        consciousness: 'Confused',
      },
    });
    const state = deriveRealismScenarioState({ caseData: scenario });
    expect(state.visualEffects.some(v => v.id === 'authored-tremor' && v.showWhen === 'immediate')).toBe(true);
  });
});
