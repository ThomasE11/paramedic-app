import { describe, expect, it } from 'vitest';
import type { AppliedTreatment, CaseScenario, VitalSigns } from '@/types';
import { deriveRealismDirectorState, deriveTreatmentLoopStates } from './patientRealismDirector';

const SHOCKY_VITALS: VitalSigns = {
  bp: '88/50',
  pulse: 128,
  respiration: 30,
  spo2: 90,
  gcs: 15,
  bloodGlucose: 5.6,
};

const traumaCase: CaseScenario = {
  id: 'test-trauma-open-chest',
  title: 'Stab wound to chest',
  category: 'trauma',
  subcategory: 'penetrating-chest',
  priority: 'critical',
  complexity: 'advanced',
  yearLevels: ['3rd-year', '4th-year'],
  dispatchInfo: {
    callReason: 'Stab wound to chest, bleeding heavily',
    timeOfDay: 'evening',
    location: 'Street in Deira, Dubai',
    callerInfo: 'Bystander',
  },
  patientInfo: {
    age: 30,
    gender: 'male',
    weight: 75,
    language: 'Arabic',
  },
  sceneInfo: {
    description: 'Outdoor street scene with police officers present',
    hazards: ['Police incident'],
    bystanders: 'Police officers',
    environment: 'Outdoor',
    accessIssues: ['Crowd control'],
  },
  initialPresentation: {
    generalImpression: 'Young male, sitting, holding chest',
    position: 'Sitting, leaning forward',
    appearance: 'Pale, distressed, blood on chest',
    consciousness: 'Alert',
  },
  abcde: {
    airway: {
      patent: true,
      findings: ['Speaking short phrases'],
      interventions: [],
    },
    breathing: {
      rate: 30,
      rhythm: 'rapid',
      depth: 'shallow',
      spo2: 90,
      findings: ['Sucking chest wound left side', 'Reduced air entry left'],
      interventions: ['High-flow oxygen', 'Seal open chest wound'],
      auscultation: ['Reduced breath sounds left'],
    },
    circulation: {
      pulseRate: 128,
      pulseQuality: 'weak',
      bp: { systolic: 88, diastolic: 50 },
      capillaryRefill: 4,
      skin: 'Pale, cool, clammy',
      findings: ['Moderate bleeding from chest wound', 'Shock signs'],
      interventions: ['Bleeding control', 'IV access'],
    },
    disability: {
      avpu: 'A',
      gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
      pupils: 'equal and reactive',
      findings: [],
      interventions: [],
    },
    exposure: {
      findings: ['2cm stab wound 5th intercostal space left anterior chest'],
      interventions: ['Expose chest', 'Prevent hypothermia'],
      wounds: ['Open chest wound'],
    },
  },
  secondarySurvey: {
    head: [],
    neck: [],
    chest: ['2cm stab wound 5th intercostal space left anterior chest', 'Moderate bleeding'],
    abdomen: [],
    pelvis: [],
    extremities: [],
    posterior: [],
    neurological: [],
  },
  history: {
    medications: [],
    allergies: [],
    medicalConditions: [],
    surgicalHistory: [],
    lastMeal: 'Unknown',
    eventsLeading: 'Stabbed during altercation',
  },
  vitalSignsProgression: {
    initial: SHOCKY_VITALS,
  },
  expectedFindings: {
    keyObservations: ['Sucking chest wound', 'Hemodynamic compromise', 'Open pneumothorax'],
    redFlags: ['Shock', 'Open chest wound'],
    differentialDiagnoses: ['Open pneumothorax', 'Hemothorax'],
    mostLikelyDiagnosis: 'Open pneumothorax with shock',
  },
  studentChecklist: [],
  teachingPoints: [],
  createdAt: '2026-07-05',
  updatedAt: '2026-07-05',
  version: 1,
};

describe('deriveRealismDirectorState', () => {
  it('surfaces critical trauma cues, scene constraints, and reassessment prompts', () => {
    const state = deriveRealismDirectorState({
      caseData: traumaCase,
      vitals: SHOCKY_VITALS,
    });

    expect(state.caseFamily).toBe('trauma');
    expect(state.severity).toBe('critical');
    expect(state.sceneConstraints).toEqual(expect.arrayContaining([
      'Environment: Outdoor',
      'Hazard: Police incident',
      'Access: Crowd control',
    ]));
    expect(state.visibleCues.map(cue => cue.label)).toContain('Shock look');
    expect(state.reassessmentPrompts.join(' ')).toContain('MARCH / ABCDE');

    // Round 2: scenario layer fields
    expect(state.matchedScenarioIds).toContain('trauma-haemorrhage-open-chest');
    expect(state.activeProblems.length).toBeGreaterThan(0);
    expect(state.visualEffects.some(v => v.kind === 'open_wound')).toBe(true);
    expect(state.visualEffects.some(v => v.kind === 'active_bleeding')).toBe(true);
    // Equipment anchors require applied treatments; none applied in this test
    expect(state.equipmentAnchors).toEqual([]);
    expect(state.debriefSignals.length).toBeGreaterThan(0);
    expect(state.reassessmentRequirements.length).toBeGreaterThan(0);
    expect(state.patientBehavior.length).toBeGreaterThan(0);
  });

  it('adds treatment evidence and reassessment prompts after oxygen is applied', () => {
    const appliedTreatments: AppliedTreatment[] = [{
      id: 'oxygen_nonrebreather',
      name: 'Non-rebreather mask',
      description: 'High-flow oxygen via non-rebreather',
      appliedAt: '2026-07-05T18:00:00.000Z',
      effects: [],
      category: 'breathing',
      isActive: true,
    }];

    const state = deriveRealismDirectorState({
      caseData: traumaCase,
      vitals: SHOCKY_VITALS,
      appliedTreatmentIds: ['oxygen_nonrebreather'],
      appliedTreatments,
    });

    expect(state.treatmentEvidence.join(' ')).toContain('Airway equipment should be visible');
    expect(state.treatmentEvidence.join(' ')).toContain('Latest: Non-rebreather mask');
    expect(state.reassessmentPrompts.join(' ')).toContain('Recheck RR, SpO2');
    expect(state.visibleCues.map(cue => cue.label)).toContain('Oxygen connected');

    // Round 2: oxygen equipment anchor surfaces in scenario state
    expect(state.equipmentAnchors.some(a => a.region === 'face')).toBe(true);
    expect(state.equipmentAnchors.some(a => a.treatmentIdFragments.some(f => f.includes('oxygen')))).toBe(true);
    expect(state.reassessmentRequirements.some(r => r.toLowerCase().includes('spo2'))).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Round 4 — Treatment loop                                          */
/* ------------------------------------------------------------------ */

describe('deriveTreatmentLoopStates', () => {
  it('returns empty array when no treatments applied', () => {
    const loops = deriveTreatmentLoopStates([], []);
    expect(loops).toEqual([]);
  });

  it('returns applied state when reassessment not yet performed', () => {
    const loops = deriveTreatmentLoopStates(['oxygen_nonrebreather'], []);
    expect(loops).toHaveLength(1);
    expect(loops[0].treatmentId).toBe('oxygen_nonrebreather');
    expect(loops[0].state).toBe('applied');
    expect(loops[0].categoryLabel).toBe('Oxygen');
    expect(loops[0].reassessmentPrompt).toContain('SpO2');
  });

  it('returns reassessed state when reassessment has been performed', () => {
    const loops = deriveTreatmentLoopStates(['oxygen_nonrebreather'], ['oxygen_nonrebreather']);
    expect(loops).toHaveLength(1);
    expect(loops[0].state).toBe('reassessed');
    expect(loops[0].pendingNote).toContain('full credit');
  });

  it('treats matching reassessment by category key', () => {
    // Student reassessed using the canonical key, not the exact treatment ID
    const loops = deriveTreatmentLoopStates(['oxygen_nonrebreather'], ['oxygen']);
    expect(loops).toHaveLength(1);
    expect(loops[0].state).toBe('reassessed');
  });

  it('returns multiple loop states for multiple high-impact treatments', () => {
    const loops = deriveTreatmentLoopStates(
      ['oxygen_nonrebreather', 'adrenaline_im', 'iv_cannula'],
      ['oxygen_nonrebreather'], // oxygen reassessed, adrenaline and IV pending
    );
    expect(loops).toHaveLength(3);

    const oxygen = loops.find(l => l.treatmentId === 'oxygen_nonrebreather');
    expect(oxygen!.state).toBe('reassessed');

    const adrenaline = loops.find(l => l.treatmentId === 'adrenaline_im');
    expect(adrenaline!.state).toBe('applied');

    const iv = loops.find(l => l.treatmentId === 'iv_cannula');
    expect(iv!.state).toBe('applied');
  });

  it('skips treatments not in the high-impact catalogue', () => {
    const loops = deriveTreatmentLoopStates(['positioning_sitting', 'reassurance'], []);
    expect(loops).toEqual([]);
  });

  it('marks pending and fully realized IDs correctly', () => {
    const applied = ['oxygen_nonrebreather', 'iv_cannula', 'aspirin'];
    const reassessed = ['iv_cannula', 'aspirin'];

    const loops = deriveTreatmentLoopStates(applied, reassessed);
    const pending = loops.filter(l => l.state === 'applied').map(l => l.treatmentId);
    const realized = loops.filter(l => l.state === 'reassessed').map(l => l.treatmentId);

    expect(pending).toEqual(['oxygen_nonrebreather']);
    expect(realized).toEqual(['iv_cannula', 'aspirin']);
  });

  it('tracks real catalogue aliases such as IV access and vented chest seals', () => {
    const loops = deriveTreatmentLoopStates(
      ['iv_access', 'chest_seal_vented', 'fluids_500ml', 'sam_splint'],
      ['iv_access', 'chest_seal_vented'],
    );

    expect(loops.map(loop => loop.treatmentId)).toEqual([
      'iv_access',
      'chest_seal_vented',
      'fluids_500ml',
      'sam_splint',
    ]);
    expect(loops.filter(loop => loop.state === 'reassessed').map(loop => loop.treatmentId)).toEqual([
      'iv_access',
      'chest_seal_vented',
    ]);
    expect(loops.filter(loop => loop.state === 'applied').map(loop => loop.treatmentId)).toEqual([
      'fluids_500ml',
      'sam_splint',
    ]);
  });
});

/** Minimal case that satisfies the director's data access patterns. */
function minimalCase(id: string, title: string, category: string): any {
  return {
    id,
    title,
    category,
    dispatchInfo: { callReason: 'Test case', timeOfDay: 'day', location: 'Test', callerInfo: 'Self' },
    sceneInfo: { description: 'Test', environment: 'Indoor' },
    initialPresentation: { generalImpression: 'Unwell', appearance: 'Normal', position: 'Supine', consciousness: 'Alert' },
    abcde: {
      airway: { patent: true, findings: [], interventions: [] },
      breathing: { rate: 20, rhythm: 'regular', depth: 'normal', spo2: 95, findings: [], interventions: [], auscultation: [] },
      circulation: { pulseRate: 90, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Warm', findings: [], interventions: [] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
      exposure: { findings: [] },
    },
    secondarySurvey: { head: [], neck: [], chest: [], abdomen: [], pelvis: [], extremities: [], posterior: [], neurological: [] },
    history: { medications: [], allergies: [], medicalConditions: [], surgicalHistory: [] },
    expectedFindings: { keyObservations: [], redFlags: [] },
    patientInfo: { age: 40, gender: 'male', weight: 70 },
    vitalSignsProgression: { initial: { bp: '120/80', pulse: 80, respiration: 18, spo2: 97, gcs: 15, bloodGlucose: 5.0 } },
  };
}

describe('deriveRealismDirectorState — Round 4 treatment loop integration', () => {
  it('returns empty loop state when no treatments applied', () => {
    const state = deriveRealismDirectorState({
      caseData: minimalCase('test-empty-loop', 'Routine', 'general'),
      vitals: { bp: '120/80', pulse: 72, respiration: 16, spo2: 98, gcs: 15, bloodGlucose: 5.0 },
    });
    expect(state.treatmentLoopStates).toEqual([]);
    expect(state.pendingReassessmentIds).toEqual([]);
    expect(state.fullyRealizedTreatmentIds).toEqual([]);
  });

  it('tracks oxygen as pending when applied but not reassessed', () => {
    const state = deriveRealismDirectorState({
      caseData: minimalCase('test-loop-oxygen', 'SOB', 'respiratory'),
      vitals: { bp: '120/80', pulse: 100, respiration: 24, spo2: 93, gcs: 15, bloodGlucose: 5.0 },
      appliedTreatmentIds: ['oxygen_nonrebreather'],
    });

    expect(state.treatmentLoopStates).toHaveLength(1);
    expect(state.treatmentLoopStates[0].state).toBe('applied');
    expect(state.pendingReassessmentIds).toContain('oxygen_nonrebreather');
    expect(state.fullyRealizedTreatmentIds).not.toContain('oxygen_nonrebreather');
  });

  it('promotes oxygen to reassessed when reassessment is tracked', () => {
    const state = deriveRealismDirectorState({
      caseData: minimalCase('test-loop-reassessed', 'SOB', 'respiratory'),
      vitals: { bp: '120/80', pulse: 100, respiration: 24, spo2: 93, gcs: 15, bloodGlucose: 5.0 },
      appliedTreatmentIds: ['oxygen_nonrebreather'],
      reassessedTreatmentIds: ['oxygen_nonrebreather'],
    });

    expect(state.treatmentLoopStates).toHaveLength(1);
    expect(state.treatmentLoopStates[0].state).toBe('reassessed');
    expect(state.pendingReassessmentIds).not.toContain('oxygen_nonrebreather');
    expect(state.fullyRealizedTreatmentIds).toContain('oxygen_nonrebreather');
  });

  it('handles mixed applied/reassessed states across multiple treatments', () => {
    const state = deriveRealismDirectorState({
      caseData: minimalCase('test-loop-mixed', 'Trauma with multiple interventions', 'trauma'),
      vitals: { bp: '100/60', pulse: 110, respiration: 22, spo2: 95, gcs: 15, bloodGlucose: 5.0 },
      appliedTreatmentIds: ['oxygen_nonrebreather', 'iv_cannula', 'chest_seal', 'splinting'],
      reassessedTreatmentIds: ['oxygen_nonrebreather', 'chest_seal'],
    });

    expect(state.treatmentLoopStates).toHaveLength(4);

    expect(state.pendingReassessmentIds).toEqual(
      expect.arrayContaining(['iv_cannula', 'splinting']),
    );
    expect(state.pendingReassessmentIds).not.toContain('oxygen_nonrebreather');
    expect(state.pendingReassessmentIds).not.toContain('chest_seal');

    expect(state.fullyRealizedTreatmentIds).toEqual(
      expect.arrayContaining(['oxygen_nonrebreather', 'chest_seal']),
    );
    expect(state.fullyRealizedTreatmentIds).not.toContain('iv_cannula');
    expect(state.fullyRealizedTreatmentIds).not.toContain('splinting');
  });

  it('tracks traction splint application and its documented post-application CSM check', () => {
    const pending = deriveRealismDirectorState({
      caseData: minimalCase('test-loop-traction', 'Right femoral shaft fracture', 'trauma'),
      vitals: { bp: '100/60', pulse: 110, respiration: 22, spo2: 95, gcs: 15, bloodGlucose: 5.0 },
      appliedTreatmentIds: ['traction_splint'],
    });
    expect(pending.pendingReassessmentIds).toContain('traction_splint');

    const reassessed = deriveRealismDirectorState({
      caseData: minimalCase('test-loop-traction', 'Right femoral shaft fracture', 'trauma'),
      vitals: { bp: '100/60', pulse: 110, respiration: 22, spo2: 95, gcs: 15, bloodGlucose: 5.0 },
      appliedTreatmentIds: ['traction_splint'],
      reassessedTreatmentIds: ['traction_splint'],
    });
    expect(reassessed.fullyRealizedTreatmentIds).toContain('traction_splint');
  });
});
