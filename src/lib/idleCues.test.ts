import { describe, expect, it } from 'vitest';
import { deriveIdleCues } from './idleCues';
import type { CaseScenario, VitalSigns } from '@/types';
import type { PatientVisualState } from '@/lib/patientVisualState';

function fakeCase(over: Record<string, unknown> = {}): CaseScenario {
  return {
    title: 'Test case',
    category: 'medical',
    dispatchInfo: { callReason: 'Emergency call' },
    initialPresentation: { appearance: '', generalImpression: '' },
    ...over,
  } as unknown as CaseScenario;
}

const fakeVitals = (over: Partial<VitalSigns> = {}): VitalSigns =>
  ({ bp: '120/80', pulse: 80, respiration: 16, spo2: 98, ...over }) as VitalSigns;

const fakeVisual = (over: Partial<PatientVisualState> = {}): PatientVisualState =>
  ({
    skinEffects: [], eyeEffects: { kind: 'normal', detail: '' },
    chestRiseAsymmetry: null, woundOverlays: [], equipmentAnchors: [],
    hasSeizureActivity: false, hasTremor: false, vomitRisk: false,
    hasAccessoryMuscleUse: false, breathingEffort: 0, ...over,
  }) as PatientVisualState;

describe('deriveIdleCues', () => {
  it('stays quiet for a well patient', () => {
    const cues = deriveIdleCues(fakeCase(), fakeVitals(), fakeVisual());
    expect(cues).toEqual({
      pain01: 0, gasping: false, shivering: false, seizure: false,
      tremor: false, agitated: false, chestClutch: false,
    });
  });

  it('reads pain from painScore, falling back to case text', () => {
    expect(deriveIdleCues(fakeCase(), fakeVitals({ painScore: 8 }), fakeVisual()).pain01).toBeCloseTo(0.8);
    const textCase = fakeCase({ initialPresentation: { appearance: 'writhing in severe pain' } });
    expect(deriveIdleCues(textCase, fakeVitals(), fakeVisual()).pain01).toBeCloseTo(0.85);
  });

  it('gasps on hypoxia or visible breathing effort', () => {
    expect(deriveIdleCues(fakeCase(), fakeVitals({ spo2: 86 }), fakeVisual()).gasping).toBe(true);
    expect(deriveIdleCues(fakeCase(), fakeVitals(), fakeVisual({ breathingEffort: 0.66 })).gasping).toBe(true);
  });

  it('does not turn haemodynamic shock into arm vibration', () => {
    expect(deriveIdleCues(fakeCase(), fakeVitals({ pulse: 130, bp: '90/60' }), fakeVisual()).shivering).toBe(false);
  });

  it('shivers only with hypothermia or an explicit shivering presentation', () => {
    expect(deriveIdleCues(fakeCase(), fakeVitals({ temperature: 34.8 }), fakeVisual()).shivering).toBe(true);
    const shiveringCase = fakeCase({ initialPresentation: { appearance: 'Shivering after cold exposure' } });
    expect(deriveIdleCues(shiveringCase, fakeVitals(), fakeVisual()).shivering).toBe(true);
  });

  it('forwards seizure/tremor flags from the visual state', () => {
    const cues = deriveIdleCues(fakeCase(), fakeVitals(), fakeVisual({ hasSeizureActivity: true, hasTremor: true }));
    expect(cues.seizure).toBe(true);
    expect(cues.tremor).toBe(true);
  });

  it('clutches the chest only for cardiac chest-pain cases', () => {
    const acs = fakeCase({
      category: 'cardiac',
      dispatchInfo: { callReason: 'Crushing chest pain at home' },
    });
    expect(deriveIdleCues(acs, fakeVitals(), fakeVisual()).chestClutch).toBe(true);
    const cardiacNoPain = fakeCase({ category: 'cardiac', dispatchInfo: { callReason: 'Palpitations' } });
    expect(deriveIdleCues(cardiacNoPain, fakeVitals(), fakeVisual()).chestClutch).toBe(false);
    const trauma = fakeCase({ category: 'trauma', dispatchInfo: { callReason: 'Crushing chest pain' } });
    expect(deriveIdleCues(trauma, fakeVitals(), fakeVisual()).chestClutch).toBe(false);
  });

  it('flags agitation from distressed presentation text', () => {
    const agitated = fakeCase({ initialPresentation: { appearance: 'anxious and restless' } });
    expect(deriveIdleCues(agitated, fakeVitals(), fakeVisual()).agitated).toBe(true);
  });

  it('clears arrival-only anxiety after respiratory physiology normalises', () => {
    const respiratoryDistress = fakeCase({
      initialPresentation: {
        appearance: 'diaphoretic and anxious',
        generalImpression: 'severe respiratory distress',
      },
    });

    expect(deriveIdleCues(
      respiratoryDistress,
      fakeVitals({ respiration: 32, spo2: 88 }),
      fakeVisual(),
    ).agitated).toBe(true);
    expect(deriveIdleCues(
      respiratoryDistress,
      fakeVitals({ respiration: 16, spo2: 97 }),
      fakeVisual(),
    ).agitated).toBe(false);
  });

  it('never crashes on missing vitals and visual state', () => {
    expect(() => deriveIdleCues(fakeCase(), undefined, null)).not.toThrow();
  });
});
