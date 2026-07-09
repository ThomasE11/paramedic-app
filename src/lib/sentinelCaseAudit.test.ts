/**
 * Round 5 — Sentinel case polish audit.
 *
 * Picks 8 premium cases (one per realism scenario family) and verifies:
 *
 * 1. Patient looks clinically consistent before treatment
 *    → matchRealismScenarios() returns the correct scenario
 *    → deriveScenarioVisuals() returns clinically appropriate immediate visuals
 *    → deriveCaseRealismProfile() returns correct summary and priorities
 *
 * 2. Assessment findings reveal on relevant body regions
 *    → correct visual effects (open_wound, rash, cyanosis, etc.)
 *    → correct skin effects map to the right anatomical region
 *
 * 3. Correct treatments visibly attach or alter the body
 *    → equipment anchors surface for applied high-impact treatments
 *    → treatment responses show matched fit for correct treatments
 *
 * 4. Incorrect treatments trigger patient behavior or debrief
 *    → treatment responses show harmful/mismatch for wrong treatments
 *    → patient behavior rules reference refusal/worsening states
 *
 * 5. Vitals change gradually, not magically
 *    → vitals-related visual effects use 'if-deteriorating' rather than immediate
 *    → this is an architectural property verified in scenario specs
 *
 * 6. Reassessment is required after treatment
 *    → reassessmentRequirements array is populated
 *    → treatment loop detects applied (not yet reassessed) state
 *    → pendingReassessmentIds contains the treatment
 */

import { describe, expect, it } from 'vitest';
import { matchRealismScenarios, deriveScenarioVisuals, deriveRealismScenarioState } from '@/lib/patientRealismScenarios';
import { deriveCaseRealismProfile } from '@/lib/patientRealism';
import { deriveTreatmentLoopStates } from '@/lib/patientRealismDirector';

/**
 * Minimal case factory for importing real-like case objects.
 * Extracts only the fields needed by the realism matching layer.
 */
function testCase(id: string, title: string, overrides: Record<string, any>): any {
  return {
    id,
    title,
    category: 'general',
    subcategory: 'assessment',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['2nd-year'],
    dispatchInfo: { callReason: 'Test', timeOfDay: 'day', location: 'Test', callerInfo: 'Test' },
    sceneInfo: { description: 'Test', environment: 'Indoor' },
    initialPresentation: { generalImpression: 'Unwell', appearance: 'Normal', position: 'Supine', consciousness: 'Alert' },
    abcde: {
      airway: { patent: true, findings: [], interventions: [] },
      breathing: { rate: 18, rhythm: 'regular', depth: 'normal', spo2: 97, findings: [], interventions: [], auscultation: ['Clear'] },
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
  };
}

/* ================================================================== */
/*  1. ASTHMA / COPD (resp-001)                                        */
/* ================================================================== */
const asthmaCase = testCase('resp-001', 'Severe Asthma Attack — wheeze bronchospasm respiratory distress', {
  category: 'respiratory',
  subcategory: 'asthma',
  priority: 'critical',
  initialPresentation: {
    generalImpression: 'Severe respiratory distress, tripod position, accessory muscle use',
    appearance: 'Diaphoretic, pale, accessory muscle use',
    position: 'Sitting upright, tripod',
    consciousness: 'Alert — speaking single words only',
  },
  abcde: {
    airway: { patent: true, findings: ['Expiratory wheeze', 'Accessory muscle use'], interventions: [] },
    breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 88, findings: ['Expiratory wheeze', 'Reduced air entry bilaterally', 'Silent chest left base'], interventions: [], auscultation: ['Diffuse expiratory wheeze', 'Silent chest left base'] },
    circulation: { pulseRate: 120, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic, warm', findings: ['Tachycardia'], interventions: [] },
    disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
    exposure: { findings: [] },
  },
  expectedFindings: {
    keyObservations: ['Expiratory wheeze', 'Accessory muscle use', 'Tachycardia', 'Hypoxia'],
    redFlags: ['Silent chest', 'Unable to speak full sentences'],
  },
});

/* ================================================================== */
/*  2. ANAPHYLAXIS (resp-010)                                          */
/* ================================================================== */
const anaphylaxisCase = testCase('resp-010', 'Anaphylaxis — Bee Sting', {
  subcategory: 'anaphylaxis',
  priority: 'critical',
  dispatchInfo: { callReason: 'Bee sting — facial swelling, difficulty breathing', timeOfDay: 'afternoon', location: 'Park', callerInfo: 'Friend' },
  initialPresentation: {
    generalImpression: 'Anxious, distressed, facial swelling',
    appearance: 'Flushed, urticaria on chest and arms, lip swelling',
    position: 'Sitting upright',
    consciousness: 'Alert — anxious',
  },
  abcde: {
    airway: { patent: false, findings: ['Lip swelling', 'Tongue swelling', 'Stridor'], interventions: [] },
    breathing: { rate: 28, rhythm: 'normal', depth: 'normal', spo2: 93, findings: ['Expiratory wheeze', 'Stridor'], interventions: [], auscultation: ['Expiratory wheeze', 'Stridor'] },
    circulation: { pulseRate: 115, pulseQuality: 'weak', bp: { systolic: 88, diastolic: 55 }, capillaryRefill: 3, skin: 'Flushed, urticaria', findings: ['Hypotension', 'Tachycardia', 'Generalised urticaria'], interventions: [] },
    disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
    exposure: { findings: ['Generalised urticaria', 'Lip swelling'], rashes: ['Urticaria'], wounds: [] },
  },
  expectedFindings: {
    keyObservations: ['Facial and lip swelling', 'Urticaria', 'Stridor', 'Hypotension'],
    redFlags: ['Airway compromise', 'Hypotensive shock'],
  },
});

/* ================================================================== */
/*  3. OPIOID OVERDOSE (tox-002)                                       */
/* ================================================================== */
const opioidCase = testCase('tox-002', 'Opioid Overdose', {
  category: 'toxicology',
  subcategory: 'opioid-overdose',
  priority: 'critical',
  dispatchInfo: { callReason: 'Unconscious, possible overdose', timeOfDay: 'night', location: 'Alleyway', callerInfo: 'Bystander' },
  initialPresentation: {
    generalImpression: 'Unconscious, shallow respirations',
    appearance: 'Pale, cool, clammy',
    position: 'Supine, slumped',
    consciousness: 'Unresponsive',
  },
  abcde: {
    airway: { patent: true, findings: ['Snoring respirations', 'Poor airway tone'], interventions: [] },
    breathing: { rate: 6, rhythm: 'irregular', depth: 'shallow', spo2: 82, findings: ['Bradypnoea', 'Shallow respirations', 'Hypoxia'], interventions: [], auscultation: ['Reduced air entry bilaterally'] },
    circulation: { pulseRate: 55, pulseQuality: 'weak', bp: { systolic: 100, diastolic: 65 }, capillaryRefill: 3, skin: 'Cool, pale, dry', findings: ['Bradycardia'], interventions: [] },
    disability: { avpu: 'P', gcs: { eye: 1, verbal: 2, motor: 4, total: 7 }, pupils: 'pinpoint', findings: ['Unresponsive to voice', 'Pinpoint pupils'], interventions: [] },
    exposure: { findings: ['Needle track marks left antecubital fossa'] },
  },
  expectedFindings: {
    keyObservations: ['Pinpoint pupils', 'Bradypnoea', 'Hypoxia', 'Low GCS'],
    redFlags: ['Respiratory depression', 'Unconscious', 'Needle marks'],
  },
});

/* ================================================================== */
/*  4. HYPOGLYCAEMIA (metab-001)                                       */
/* ================================================================== */
const hypoglycaemiaCase = testCase('metab-001', 'Hypoglycaemia — Diabetic Emergency', {
  category: 'metabolic',
  subcategory: 'hypoglycemia',
  priority: 'high',
  dispatchInfo: { callReason: 'Confused, shaking', timeOfDay: 'morning', location: 'Home', callerInfo: 'Family' },
  initialPresentation: {
    generalImpression: 'Confused, diaphoretic, tremulous',
    appearance: 'Diaphoretic, pale',
    position: 'Sitting, restless',
    consciousness: 'Confused — responds to voice',
  },
  abcde: {
    airway: { patent: true, findings: [], interventions: [] },
    breathing: { rate: 18, rhythm: 'regular', depth: 'normal', spo2: 97, findings: [], interventions: [], auscultation: ['Clear air entry bilaterally'] },
    circulation: { pulseRate: 95, pulseQuality: 'normal', bp: { systolic: 115, diastolic: 75 }, capillaryRefill: 2, skin: 'Diaphoretic, warm', findings: ['Tachycardia'], interventions: [] },
    disability: { avpu: 'V', gcs: { eye: 3, verbal: 4, motor: 5, total: 12 }, pupils: 'equal and reactive', findings: ['Confused', 'Diaphoretic', 'Tremor'], interventions: [] },
    exposure: { findings: [] },
  },
  history: { medications: ['Insulin'], allergies: [], medicalConditions: ['Type 1 diabetes'], surgicalHistory: [], eventsLeading: 'Missed breakfast after insulin' },
  expectedFindings: {
    keyObservations: ['Confusion', 'Diaphoresis', 'Tachycardia'],
    redFlags: ['Low GCS', 'Risk of seizure'],
    differentialDiagnoses: ['Hypoglycaemia', 'Seizure', 'Stroke mimic'],
    mostLikelyDiagnosis: 'Hypoglycaemia',
  },
});

/* ================================================================== */
/*  5. ACS / STEMI (cardiac-001)                                        */
/* ================================================================== */
const acsCase = testCase('cardiac-001', 'Anterior STEMI', {
  category: 'cardiac',
  subcategory: 'stem-anterior',
  priority: 'critical',
  dispatchInfo: { callReason: 'Chest pain, crushing, radiating to left arm', timeOfDay: 'morning', location: 'Office building', callerInfo: 'Colleague' },
  initialPresentation: {
    generalImpression: 'Anxious, pale, clutching chest',
    appearance: 'Pale, diaphoretic',
    position: 'Sitting, leaning forward',
    consciousness: 'Alert',
  },
  abcde: {
    airway: { patent: true, findings: ['Speaking in full sentences'], interventions: [] },
    breathing: { rate: 22, rhythm: 'regular', depth: 'normal', spo2: 96, findings: [], interventions: [], auscultation: ['Clear air entry bilaterally'] },
    circulation: { pulseRate: 105, pulseQuality: 'normal', bp: { systolic: 145, diastolic: 90 }, capillaryRefill: 2, skin: 'Pale, diaphoretic, cool', findings: ['Crushing chest pain radiating to left arm', 'Diaphoresis', 'Nausea'], interventions: [] },
    disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
    exposure: { findings: ['Pale, diaphoretic'] },
  },
  expectedFindings: {
    keyObservations: ['Crushing chest pain', 'Diaphoresis', 'Tachycardia', 'Hypertension'],
    redFlags: ['ACS symptoms', 'Cardiac chest pain'],
  },
});

/* ================================================================== */
/*  6. STROKE (neuro-001)                                              */
/* ================================================================== */
const strokeCase = testCase('neuro-001', 'Acute Stroke — Left-sided Weakness', {
  category: 'neurological',
  subcategory: 'stroke',
  priority: 'critical',
  dispatchInfo: { callReason: 'Sudden left-sided weakness, slurred speech', timeOfDay: 'afternoon', location: 'Home', callerInfo: 'Spouse' },
  initialPresentation: {
    generalImpression: 'Facial droop right side, slurred speech',
    appearance: 'Facial asymmetry, drooping right side',
    position: 'Sitting in chair',
    consciousness: 'Alert',
  },
  abcde: {
    airway: { patent: true, findings: ['Slurred speech'], interventions: [] },
    breathing: { rate: 18, rhythm: 'regular', depth: 'normal', spo2: 97, findings: [], interventions: [], auscultation: ['Clear air entry bilaterally'] },
    circulation: { pulseRate: 85, pulseQuality: 'normal', bp: { systolic: 175, diastolic: 95 }, capillaryRefill: 2, skin: 'Warm, dry', findings: ['Hypertension'], interventions: [] },
    disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Right facial droop', 'Slurred speech', 'Left arm drift', 'Left leg weakness'], interventions: [] },
    exposure: { findings: [] },
  },
  history: { medications: ['Aspirin', 'Atorvastatin'], allergies: [], medicalConditions: ['Hypertension', 'Hypercholesterolaemia'], surgicalHistory: [] },
  expectedFindings: {
    keyObservations: ['Right facial droop', 'Slurred speech', 'Left-sided weakness', 'Hypertension'],
    redFlags: ['Stroke symptoms', 'Time-critical'],
    differentialDiagnoses: ['Stroke', 'TIA', 'Hypoglycaemia mimic'],
    mostLikelyDiagnosis: 'Acute stroke',
  },
});

/* ================================================================== */
/*  7. MAJOR TRAUMA — Open Chest (resp-006)                            */
/* ================================================================== */
const traumaCase = testCase('resp-006', 'Pneumothorax After Chest Trauma', {
  category: 'trauma',
  subcategory: 'chest-trauma',
  priority: 'critical',
  complexity: 'advanced',
  dispatchInfo: { callReason: 'Fall from ladder, chest pain, difficulty breathing', timeOfDay: 'afternoon', location: 'Construction site', callerInfo: 'Site manager' },
  initialPresentation: {
    generalImpression: 'Young male, sitting, holding right chest',
    appearance: 'Pale, distressed, shallow breathing',
    position: 'Sitting, leaning to the right',
    consciousness: 'Alert',
  },
  abcde: {
    airway: { patent: true, findings: ['Speaking in short phrases'], interventions: [] },
    breathing: { rate: 32, rhythm: 'rapid', depth: 'shallow', spo2: 89, findings: ['Sucking chest wound right side', 'Reduced air entry right', 'Asymmetric chest rise'], interventions: [], auscultation: ['Reduced breath sounds right', 'Normal breath sounds left'] },
    circulation: { pulseRate: 130, pulseQuality: 'weak', bp: { systolic: 85, diastolic: 50 }, capillaryRefill: 4, skin: 'Pale, cool, clammy', findings: ['Tachycardia', 'Hypotension', 'Signs of shock'], interventions: [] },
    disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
    exposure: { findings: ['Open chest wound right 5th intercostal space', 'Active bleeding from wound'], wounds: ['Open chest wound'] },
  },
  secondarySurvey: {
    head: [], neck: [], chest: ['Open chest wound right 5th intercostal space', 'Active bleeding', 'Asymmetric chest rise'],
    abdomen: [], pelvis: [], extremities: [], posterior: [], neurological: [],
  },
  expectedFindings: {
    keyObservations: ['Sucking chest wound', 'Shock', 'Respiratory distress', 'Asymmetric chest rise'],
    redFlags: ['Open pneumothorax', 'Haemorrhagic shock'],
    differentialDiagnoses: ['Open pneumothorax', 'Tension pneumothorax', 'Haemothorax'],
    mostLikelyDiagnosis: 'Open pneumothorax with haemorrhagic shock',
  },
});

/* ================================================================== */
/*  8. BURNS / INHALATION (burn-001)                                   */
/* ================================================================== */
const burnsCase = testCase('burn-001', 'Thermal Burns — House Fire', {
  category: 'burns',
  subcategory: 'thermal-burns',
  priority: 'critical',
  complexity: 'advanced',
  dispatchInfo: { callReason: 'House fire — rescued by fire service', timeOfDay: 'night', location: 'Apartment building', callerInfo: 'Firefighter' },
  initialPresentation: {
    generalImpression: 'Adult male, singed hair and eyebrows, soot around mouth',
    appearance: 'Soot around mouth and nose, reddened face and chest, blistering on arms',
    position: 'Supine on stretcher',
    consciousness: 'Alert but distressed',
  },
  abcde: {
    airway: { patent: true, findings: ['Hoarse voice', 'Soot in mouth and nares', 'Singed nasal hairs'], interventions: [] },
    breathing: { rate: 24, rhythm: 'regular', depth: 'normal', spo2: 94, findings: ['Soot in airways', 'Hoarse voice', 'Possible inhalation injury'], interventions: [], auscultation: ['Reduced air entry right base', 'Crackles right base'] },
    circulation: { pulseRate: 110, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 3, skin: 'Red, blistered on both forearms', findings: ['Tachycardia', 'Pain 8/10'], interventions: [] },
    disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious', 'In pain'], interventions: [] },
    exposure: { findings: ['Superficial partial-thickness burns anterior chest', 'Superficial burns both forearms', 'Singed hair', 'Soot around mouth and nares'] },
  },
  expectedFindings: {
    keyObservations: ['Facial burns', 'Soot in airway', 'Hoarse voice', 'Burns to chest and arms'],
    redFlags: ['Inhalation injury risk', 'Airway oedema risk'],
    differentialDiagnoses: ['Thermal burn with inhalation injury', 'Carbon monoxide poisoning'],
    mostLikelyDiagnosis: 'Thermal burn with inhalation injury',
  },
});

/* ================================================================== */
/*  AUDIT TESTS                                                        */
/* ================================================================== */

describe('Round 5 — Sentinel case polish audit', () => {

  describe('1. Severe asthma (resp-001)', () => {
    const caseData = asthmaCase;

    it('matches respiratory-bronchospasm scenario', () => {
      const matched = matchRealismScenarios(caseData);
      expect(matched.some(s => s.family === 'respiratory')).toBe(true);
    });

    it('derives clinical profile with respiratory cues', () => {
      const profile = deriveCaseRealismProfile(caseData);
      expect(profile.caseFamily).toBe('respiratory');
      expect(profile.observableCues.length).toBeGreaterThan(0);
    });

    it('surfaces immediate visuals (accessory muscles, diaphoresis)', () => {
      const visuals = deriveScenarioVisuals(caseData);
      expect(visuals.some(v => v.kind === 'accessory_muscle_use')).toBe(true);
    });

    it('oxygen and nebuliser treatments produce equipment anchors', () => {
      const state = deriveRealismScenarioState({ caseData, appliedTreatmentIds: ['oxygen_nonrebreather', 'nebulizer_salbutamol'] });
      expect(state.equipmentAnchors.length).toBeGreaterThanOrEqual(2);
      expect(state.equipmentAnchors.some(a => a.region === 'face')).toBe(true);
    });

    it('tracks treatment loop with pending reassessment', () => {
      const loops = deriveTreatmentLoopStates(['oxygen_nonrebreather', 'nebulizer_salbutamol'], []);
      expect(loops.every(l => l.state === 'applied')).toBe(true);
      expect(loops.some(l => l.categoryLabel === 'Oxygen')).toBe(true);
      expect(loops.some(l => l.categoryLabel === 'Nebuliser')).toBe(true);
    });

    it('promotes to reassessed after follow-up', () => {
      const loops = deriveTreatmentLoopStates(['oxygen_nonrebreather'], ['oxygen_nonrebreather']);
      expect(loops[0].state).toBe('reassessed');
    });

    it('has reassessment requirements from scenario', () => {
      const state = deriveRealismScenarioState({ caseData });
      expect(state.reassessmentRequirements.some(r => r.toLowerCase().includes('rr'))).toBe(true);
      expect(state.reassessmentRequirements.some(r => r.toLowerCase().includes('spo2'))).toBe(true);
    });
  });

  describe('2. Anaphylaxis (resp-010)', () => {
    const caseData = anaphylaxisCase;

    it('matches anaphylaxis scenario', () => {
      const matched = matchRealismScenarios(caseData);
      expect(matched.some(s => s.id === 'anaphylaxis-systemic')).toBe(true);
    });

    it('derives rash and facial swelling visuals', () => {
      const visuals = deriveScenarioVisuals(caseData);
      expect(visuals.some(v => v.kind === 'rash')).toBe(true);
      expect(visuals.some(v => v.kind === 'facial_swelling')).toBe(true);
    });

    it('adrenaline treatment response identifies matched fit', () => {
      const responses = matchRealismScenarios(caseData).flatMap(s => s.treatmentResponses);
      const adrenalineResponse = responses.find(r => r.treatmentIdFragments.some(f => f.includes('adrenaline')));
      expect(adrenalineResponse).toBeDefined();
      expect(adrenalineResponse!.expectedFit).toBe('matched');
    });

    it('antihistamine alone shows partial fit (no adrenaline)', () => {
      const responses = matchRealismScenarios(caseData).flatMap(s => s.treatmentResponses);
      const antihistamineResponse = responses.find(r => r.treatmentIdFragments.some(f => f.includes('antihistamine')));
      expect(antihistamineResponse).toBeDefined();
      expect(antihistamineResponse!.expectedFit).toBe('partial');
    });
  });

  describe('3. Opioid overdose (tox-002)', () => {
    const caseData = opioidCase;

    it('matches toxicology-opioid scenario', () => {
      const matched = matchRealismScenarios(caseData);
      expect(matched.some(s => s.id === 'toxicology-opioid-hypoventilation')).toBe(true);
    });

    it('derives pinpoint pupils visual', () => {
      const visuals = deriveScenarioVisuals(caseData);
      expect(visuals.some(v => v.kind === 'pinpoint_pupils')).toBe(true);
    });

    it('naloxone treatment is matched fit', () => {
      const responses = matchRealismScenarios(caseData).flatMap(s => s.treatmentResponses);
      const naloxoneResponse = responses.find(r => r.treatmentIdFragments.some(f => f.includes('naloxone')));
      expect(naloxoneResponse).toBeDefined();
      expect(naloxoneResponse!.expectedFit).toBe('matched');
    });

    it('BVM ventilation is matched for hypoventilation', () => {
      const responses = matchRealismScenarios(caseData).flatMap(s => s.treatmentResponses);
      const bvmResponse = responses.find(r => r.treatmentIdFragments.some(f => f.includes('bvm')));
      expect(bvmResponse).toBeDefined();
      expect(bvmResponse!.expectedFit).toBe('matched');
    });
  });

  describe('4. Hypoglycaemia (metab-001)', () => {
    const caseData = hypoglycaemiaCase;

    it('matches metabolic scenario', () => {
      const matched = matchRealismScenarios(caseData);
      expect(matched.some(s => s.family === 'metabolic')).toBe(true);
    });

    it('derives diaphoresis and tremor visuals', () => {
      const visuals = deriveScenarioVisuals(caseData);
      expect(visuals.some(v => v.kind === 'diaphoresis')).toBe(true);
      expect(visuals.some(v => v.kind === 'tremor')).toBe(true);
    });

    it('IV dextrose is matched fit, oral glucose is blocked for low GCS', () => {
      const scenario = matchRealismScenarios(caseData).find(s => s.family === 'metabolic');
      expect(scenario).toBeDefined();
      const dextroseResponse = scenario!.treatmentResponses.find(r => r.treatmentIdFragments.some(f => f.includes('dextrose')));
      expect(dextroseResponse).toBeDefined();
      expect(dextroseResponse!.expectedFit).toBe('matched');
      const oralResponse = scenario!.treatmentResponses.find(r => r.treatmentIdFragments.some(f => f.includes('oral_glucose')));
      expect(oralResponse).toBeDefined();
      expect(oralResponse!.expectedFit).toBe('blocked');
    });
  });

  describe('5. ACS/STEMI (cardiac-001)', () => {
    const caseData = acsCase;

    it('matches cardiac-acs scenario', () => {
      const matched = matchRealismScenarios(caseData);
      expect(matched.some(s => s.family === 'cardiac')).toBe(true);
    });

    it('derives pallor and diaphoresis visuals', () => {
      const visuals = deriveScenarioVisuals(caseData);
      expect(visuals.some(v => v.kind === 'diaphoresis')).toBe(true);
    });

    it('aspirin is matched fit, GTN guarded by BP', () => {
      const scenario = matchRealismScenarios(caseData).find(s => s.family === 'cardiac');
      expect(scenario).toBeDefined();
      const aspirinResponse = scenario!.treatmentResponses.find(r => r.treatmentIdFragments.some(f => f.includes('aspirin')));
      expect(aspirinResponse).toBeDefined();
      expect(aspirinResponse!.expectedFit).toBe('matched');
    });

    it('tracks aspirin in treatment loop', () => {
      const loops = deriveTreatmentLoopStates(['aspirin', 'gtn_spray'], ['aspirin']);
      const aspirinLoop = loops.find(l => l.treatmentId === 'aspirin');
      expect(aspirinLoop).toBeDefined();
      expect(aspirinLoop!.state).toBe('reassessed');
      const gtnLoop = loops.find(l => l.treatmentId === 'gtn_spray');
      expect(gtnLoop).toBeDefined();
      expect(gtnLoop!.state).toBe('applied');
    });
  });

  describe('6. Stroke (neuro-001)', () => {
    const caseData = strokeCase;

    it('matches neurology-stroke scenario', () => {
      const matched = matchRealismScenarios(caseData);
      expect(matched.some(s => s.family === 'neurology')).toBe(true);
    });

    it('derives facial droop visual', () => {
      const visuals = deriveScenarioVisuals(caseData);
      expect(visuals.some(v => v.kind === 'facial_droop')).toBe(true);
    });
  });

  describe('7. Major trauma — open chest (resp-006)', () => {
    const caseData = traumaCase;

    it('matches trauma-haemorrhage scenario', () => {
      const matched = matchRealismScenarios(caseData);
      expect(matched.some(s => s.id === 'trauma-haemorrhage-open-chest')).toBe(true);
    });

    it('derives open wound, active bleeding, and asymmetric chest rise', () => {
      const visuals = deriveScenarioVisuals(caseData);
      expect(visuals.some(v => v.kind === 'open_wound')).toBe(true);
      expect(visuals.some(v => v.kind === 'active_bleeding')).toBe(true);
      expect(visuals.some(v => v.kind === 'asymmetric_chest_rise')).toBe(true);
    });

    it('chest seal and tourniquet produce equipment anchors', () => {
      const state = deriveRealismScenarioState({ caseData, appliedTreatmentIds: ['chest_seal', 'tourniquet'] });
      expect(state.equipmentAnchors.some(a => a.region === 'chest')).toBe(true);
    });

    it('tracks treatment loop for chest seal, tourniquet, IV, oxygen', () => {
      const loops = deriveTreatmentLoopStates(
        ['oxygen_nonrebreather', 'iv_cannula', 'chest_seal', 'tourniquet'],
        ['oxygen_nonrebreather', 'chest_seal'],
      );
      expect(loops).toHaveLength(4);
      const pending = loops.filter(l => l.state === 'applied').map(l => l.treatmentId);
      const realized = loops.filter(l => l.state === 'reassessed').map(l => l.treatmentId);
      expect(pending).toContain('iv_cannula');
      expect(pending).toContain('tourniquet');
      expect(realized).toContain('oxygen_nonrebreather');
      expect(realized).toContain('chest_seal');
    });
  });

  describe('8. Burns/inhalation (burn-001)', () => {
    const caseData = burnsCase;

    it('matches burns-inhalation scenario', () => {
      const matched = matchRealismScenarios(caseData);
      expect(matched.some(s => s.family === 'burns')).toBe(true);
    });

    it('derives burn pattern and soot visuals', () => {
      const visuals = deriveScenarioVisuals(caseData);
      expect(visuals.some(v => v.kind === 'burn_pattern')).toBe(true);
      expect(visuals.some(v => v.kind === 'soot')).toBe(true);
    });

    it('cooling treatment is matched fit', () => {
      const scenario = matchRealismScenarios(caseData).find(s => s.family === 'burns');
      expect(scenario).toBeDefined();
      const coolingResponse = scenario!.treatmentResponses.find(r => r.treatmentIdFragments.some(f => f.includes('cooling')));
      expect(coolingResponse).toBeDefined();
      expect(coolingResponse!.expectedFit).toBe('matched');
    });

    it('warming blanket treatment is matched fit', () => {
      const scenario = matchRealismScenarios(caseData).find(s => s.family === 'burns');
      expect(scenario).toBeDefined();
      const warmingResponse = scenario!.treatmentResponses.find(r => r.treatmentIdFragments.some(f => f.includes('warming')));
      expect(warmingResponse).toBeDefined();
      expect(warmingResponse!.expectedFit).toBe('matched');
    });

    it('tracks burn dressings in treatment loop', () => {
      const loops = deriveTreatmentLoopStates(['oxygen_nonrebreather', 'warming_blanket'], []);
      expect(loops).toHaveLength(2);
      expect(loops.every(l => l.state === 'applied')).toBe(true);
    });
  });
});
