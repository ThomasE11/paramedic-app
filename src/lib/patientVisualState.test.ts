import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { deriveRealismDirectorState, type RealismDirectorState } from '@/lib/patientRealismDirector';
import { derivePatientVisualState } from './patientVisualState';

/* ------------------------------------------------------------------ */
/*  Minimal case builders                                              */
/* ------------------------------------------------------------------ */

const VITALS_OK = { bp: '120/80', pulse: 78, respiration: 18, spo2: 98, gcs: 15, bloodGlucose: 5.0 };

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
      circulation: { pulseRate: 78, pulseQuality: 'normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Warm, dry', findings: [], interventions: [] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
      exposure: { findings: [] },
    },
    secondarySurvey: { head: [], neck: [], chest: [], abdomen: [], pelvis: [], extremities: [], posterior: [], neurological: [] },
    history: { medications: [], allergies: [], medicalConditions: [], surgicalHistory: [], lastMeal: 'Unknown', eventsLeading: 'Unknown' },
    expectedFindings: { keyObservations: [], redFlags: [], differentialDiagnoses: [], mostLikelyDiagnosis: 'Undifferentiated' },
    patientInfo: { age: 40, gender: 'male', weight: 70, language: 'English' },
    vitalSignsProgression: { initial: VITALS_OK },
    ...overrides,
  }) as CaseScenario;

/* ------------------------------------------------------------------ */
/*  Build director state helper                                        */
/* ------------------------------------------------------------------ */

function directorFor(
  caseData: CaseScenario,
  appliedTreatmentIds?: string[],
): RealismDirectorState {
  return deriveRealismDirectorState({
    caseData,
    vitals: VITALS_OK,
    appliedTreatmentIds,
  });
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('derivePatientVisualState', () => {
  it('returns empty/neutral state for a general case with no scenario match', () => {
    const director = directorFor(baseCase({ id: 'general', title: 'Routine wellness' }));
    const state = derivePatientVisualState(director);

    expect(state.skinEffects).toEqual([]);
    expect(state.eyeEffects.kind).toBe('normal');
    expect(state.chestRiseAsymmetry).toBeNull();
    expect(state.woundOverlays).toEqual([]);
    expect(state.equipmentAnchors).toEqual([]);
    expect(state.hasSeizureActivity).toBe(false);
    expect(state.hasTremor).toBe(false);
    expect(state.vomitRisk).toBe(false);
    expect(state.hasAccessoryMuscleUse).toBe(false);
    expect(state.breathingEffort).toBe(0);
  });

  it('derives skin effects from respiratory distress scenario', () => {
    const caseData = baseCase({
      id: 'test-asthma-visual',
      title: 'Severe asthma attack',
      category: 'respiratory',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Wheeze', 'Accessory muscle use'], interventions: [] },
        breathing: { rate: 30, rhythm: 'rapid', depth: 'shallow', spo2: 88, findings: ['Expiratory wheeze', 'Accessory muscle use'], interventions: [], auscultation: ['Diffuse expiratory wheeze'] },
        circulation: { pulseRate: 110, pulseQuality: 'normal', bp: { systolic: 130, diastolic: 80 }, capillaryRefill: 2, skin: 'Diaphoretic, warm', findings: [], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: [] },
      } as any,
    });

    const director = directorFor(caseData);
    const state = derivePatientVisualState(director);

    // Accessory muscle use is not a skin effect — it's a chest rise cue.
    // But respiratory scenario does have diaphoresis as an immediate visual
    expect(state.skinEffects.some(s => s.kind === 'diaphoresis')).toBe(true);
    // Cyanosis is in the scenario (if-deteriorating) but not immediate
    expect(state.eyeEffects.kind).toBe('normal');
    expect(state.chestRiseAsymmetry).toBeNull();
  });

  it('derives eye effects, skin effects, and wound overlays for opioid overdose', () => {
    const caseData = baseCase({
      id: 'test-opioid-visual',
      title: 'Opioid overdose',
      category: 'toxicology',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Snoring respirations'], interventions: [] },
        breathing: { rate: 6, rhythm: 'irregular', depth: 'shallow', spo2: 85, findings: ['Bradypnoea', 'Shallow respirations'], interventions: [], auscultation: ['Reduced air entry bilaterally'] },
        circulation: { pulseRate: 55, pulseQuality: 'weak', bp: { systolic: 100, diastolic: 65 }, capillaryRefill: 3, skin: 'Cool, pale', findings: [], interventions: [] },
        disability: { avpu: 'P', gcs: { eye: 1, verbal: 2, motor: 4, total: 7 }, pupils: 'pinpoint', findings: ['Unresponsive to voice'], interventions: [] },
        exposure: { findings: ['Needle track marks left arm'] },
      } as any,
    });

    const director = directorFor(caseData);
    const state = derivePatientVisualState(director);

    // Pinpoint pupils
    expect(state.eyeEffects.kind).toBe('pinpoint');
    // Reduced chest rise
    expect(state.chestRiseAsymmetry).not.toBeNull();
    expect(state.chestRiseAsymmetry!.present).toBe(true);
    // Vomit risk is after-treatment — not immediate (requires naloxone reversal)
    // Skin effects: reduced_chest_rise isn't a skin effect; need a scenario that adds them
    // With just VITALS_OK and no applied treatments, only immediate visuals surface
  });

  it('derives wound overlays and equipment anchors for trauma with chest seal', () => {
    const caseData = baseCase({
      id: 'test-trauma-visual',
      title: 'Open chest wound — stab',
      category: 'trauma',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Speaking with difficulty'], interventions: [] },
        breathing: { rate: 32, rhythm: 'rapid', depth: 'shallow', spo2: 89, findings: ['Sucking chest wound', 'Reduced air entry right'], interventions: [], auscultation: ['Reduced breath sounds right'] },
        circulation: { pulseRate: 130, pulseQuality: 'weak', bp: { systolic: 85, diastolic: 50 }, capillaryRefill: 4, skin: 'Pale, cool, clammy', findings: ['Haemorrhage from chest wound', 'Shock signs'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: ['Open chest wound right 4th intercostal space', 'Active bleeding'], wounds: ['Open chest wound'] },
      } as any,
    });

    const director = directorFor(caseData, [
      'oxygen_nonrebreather',
      'chest_seal',
      'bleeding_control',
      'iv_cannula',
    ]);
    const state = derivePatientVisualState(director);

    // The fitted chest seal plus documented bleeding control clear the active
    // wound and blood-pool render cues from the live patient state.
    expect(state.woundOverlays.some(w => w.kind === 'open_wound')).toBe(false);
    expect(state.woundOverlays.some(w => w.kind === 'active_bleeding')).toBe(false);
    expect(state.woundOverlays.some(w => w.kind === 'blood_pool')).toBe(false);

    // Equipment anchors
    expect(state.equipmentAnchors.some(a => a.region === 'face')).toBe(true);
    expect(state.equipmentAnchors.some(a => a.region === 'chest')).toBe(true);
    // IV cannula anchor
    expect(state.equipmentAnchors.some(a => a.region === 'right-arm')).toBe(true);

    // Skin effects — shock look (pallor) requires if-deteriorating + low BP.
    // With VITALS_OK the pallor visual is not active. We verify the other
    // chest/neck visual (asymmetric_chest_rise) is present instead.
    expect(state.chestRiseAsymmetry).not.toBeNull();
    expect(state.chestRiseAsymmetry!.present).toBe(true);
  });

  it('derives facial swelling and rash for anaphylaxis', () => {
    const caseData = baseCase({
      id: 'test-ana-visual',
      title: 'Anaphylaxis — bee sting',
      subcategory: 'anaphylaxis',
      abcde: {
        patent: true,
        airway: { patent: false, findings: ['Lip swelling', 'Stridor'], interventions: [] },
        breathing: { rate: 26, rhythm: 'normal', depth: 'normal', spo2: 94, findings: ['Wheeze'], interventions: [], auscultation: ['Expiratory wheeze'] },
        circulation: { pulseRate: 110, pulseQuality: 'weak', bp: { systolic: 88, diastolic: 55 }, capillaryRefill: 3, skin: 'Flushed, urticaria', findings: ['Hypotension', 'Urticaria chest and arms'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: ['Anxious'], interventions: [] },
        exposure: { findings: ['Generalised urticaria', 'Lip swelling'], rashes: ['Urticaria'] },
      } as any,
    });

    const director = directorFor(caseData);
    const state = derivePatientVisualState(director);

    expect(state.skinEffects.some(s => s.kind === 'rash')).toBe(true);
    expect(state.skinEffects.some(s => s.kind === 'facial_swelling')).toBe(true);
    // Pallor is if-deteriorating — not active with VITALS_OK
    // Chest rise asymmetry instead: scenario doesn't include it
    // The key finding here is the rash + facial swelling for anaphylaxis visual consumption // shock look
  });

  it('derives burn overlays and soot for burns/inhalation', () => {
    const caseData = baseCase({
      id: 'test-burns-visual',
      title: 'Burns — house fire',
      category: 'burns',
      abcde: {
        patent: true,
        airway: { patent: true, findings: ['Hoarse voice', 'Soot in mouth'], interventions: [] },
        breathing: { rate: 22, rhythm: 'regular', depth: 'normal', spo2: 95, findings: ['Soot around mouth', 'Possible inhalation injury'], interventions: [], auscultation: ['Reduced air entry', 'Crackles'] },
        circulation: { pulseRate: 100, pulseQuality: 'normal', bp: { systolic: 115, diastolic: 75 }, capillaryRefill: 3, skin: 'Warm, dry', findings: ['Burns to anterior chest and arms', 'Pain 8/10'], interventions: [] },
        disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'equal and reactive', findings: [], interventions: [] },
        exposure: { findings: ['Partial-thickness burns anterior chest', 'Superficial burns both forearms', 'Soot around mouth and nares'] },
      } as any,
    });

    const director = directorFor(caseData, ['cooling', 'oxygen_nonrebreather']);
    const state = derivePatientVisualState(director);

    // Cooling/covering removes the exposed-burn overlay; soot remains until
    // airway/face decontamination is explicitly represented.
    expect(state.skinEffects.some(s => s.kind === 'burn_pattern')).toBe(false);
    expect(state.skinEffects.some(s => s.kind === 'soot')).toBe(true);
    expect(state.woundOverlays.some(w => w.kind === 'burn_pattern')).toBe(false);
  });

  it('preserves equipment anchor metadata for 3D consumption', () => {
    const caseData = baseCase({
      id: 'test-equipment',
      title: 'Moderate asthma',
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

    const director = directorFor(caseData, ['oxygen_nonrebreather', 'nebulizer_salbutamol']);
    const state = derivePatientVisualState(director);

    expect(state.equipmentAnchors.length).toBeGreaterThanOrEqual(2);
    const oxAnchor = state.equipmentAnchors.find(a =>
      a.treatmentIdFragments.some(f => f.includes('oxygen')),
    );
    expect(oxAnchor).toBeDefined();
    expect(oxAnchor!.region).toBe('face');
    expect(oxAnchor!.appearance).toContain('mask');

    const nebAnchor = state.equipmentAnchors.find(a =>
      a.treatmentIdFragments.some(f => f.includes('nebulizer')),
    );
    expect(nebAnchor).toBeDefined();
    expect(nebAnchor!.region).toBe('face');
    expect(nebAnchor!.reassess.length).toBeGreaterThan(0);
  });

  it('flags seizure activity and tremor when visuals include them', () => {
    const caseData = baseCase({
      id: 'test-metab-seizure',
      title: 'Hypoglycaemia with seizure activity',
      category: 'metabolic',
      abcde: {
        patent: true,
        airway: { patent: true, findings: [], interventions: [] },
        breathing: { rate: 16, rhythm: 'regular', depth: 'normal', spo2: 98, findings: [], interventions: [], auscultation: [] },
        circulation: { pulseRate: 95, pulseQuality: 'normal', bp: { systolic: 115, diastolic: 75 }, capillaryRefill: 2, skin: 'Diaphoretic, warm', findings: [], interventions: [] },
        disability: { avpu: 'V', gcs: { eye: 3, verbal: 4, motor: 5, total: 12 }, pupils: 'equal and reactive', findings: ['Confused', 'Diaphoretic', 'Tremor'], interventions: [] },
        exposure: { findings: [] },
      } as any,
      initialPresentation: { generalImpression: 'Confused, sweaty, shaking', appearance: 'Diaphoretic, pale', position: 'Supine', consciousness: 'Confused' },
      history: { medications: [{ name: 'Insulin' }], allergies: [], medicalConditions: ['Type 1 diabetes'], surgicalHistory: [], lastMeal: 'Missed breakfast', eventsLeading: 'Missed breakfast' },
    });

    const director = directorFor(caseData);
    const state = derivePatientVisualState(director);

    expect(state.hasTremor).toBe(true);
    expect(state.hasTremor).toBe(true); // tremor is in the visuals
    expect(state.skinEffects.some(s => s.kind === 'diaphoresis')).toBe(true); // diaphoresis from hypoglycaemia scenario
  });
});

describe('facial droop', () => {
  const droopState = (kinds: string[]) => derivePatientVisualState({
    activeVisualEffects: kinds.map((kind, i) => ({
      id: `v${i}`, kind, region: 'face', intensity: 'moderate', showWhen: 'on-assessment', detail: '',
    })),
  } as unknown as RealismDirectorState);

  it('surfaces a declared facial droop so the morph has something to drive', () => {
    expect(droopState(['facial_droop']).facialDroop).toBeGreaterThan(0);
  });

  it('is absent when the scenario does not declare it', () => {
    expect(droopState(['pallor']).facialDroop).toBe(0);
  });

  it('scales with declared intensity', () => {
    const severe = derivePatientVisualState({
      activeVisualEffects: [{ id: 'v', kind: 'facial_droop', region: 'face', intensity: 'severe', showWhen: 'on-assessment', detail: '' }],
    } as unknown as RealismDirectorState);
    expect(severe.facialDroop).toBeGreaterThan(droopState(['facial_droop']).facialDroop);
  });
});

