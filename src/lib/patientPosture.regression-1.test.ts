import { describe, expect, it } from 'vitest';
import { additionalTraumaCases } from '@/data/additionalCases';
import { allCases } from '@/data/cases';
import type { CaseScenario } from '@/types';
import { derivePatientMobility, derivePatientPosture } from './patientStaging';

// Regression: any seated patient with RR >= 24 was forced into a respiratory
// tripod, including the industrial amputation case with pain-related tachypnoea.
describe('scenario-specific seated posture', () => {
  it('keeps the actual amputation scenario seated despite its elevated respiratory rate', () => {
    const patient = additionalTraumaCases.find(item => item.id === 'trauma-011');
    expect(patient).toBeDefined();
    expect(derivePatientPosture(patient!, {
      mobility: derivePatientMobility(patient!),
      respiration: patient!.abcde.breathing.rate,
    })).toBe('seated');
  });

  it.each(['Pain after a fall', 'Heavy bleeding', 'Heat exhaustion', 'Panic attack'])(
    'does not infer tripod from a fast respiratory rate in %s', callReason => {
      const patient = {
        initialPresentation: { position: 'Sitting' },
        dispatchInfo: { callReason },
      } as CaseScenario;
      expect(derivePatientPosture(patient, { mobility: 'seated', respiration: 32 })).toBe('seated');
    },
  );

  it('relaxes inferred respiratory bracing after improvement without overriding explicit posture', () => {
    const patient = {
      initialPresentation: { position: 'Sitting upright' },
      dispatchInfo: { callReason: 'Severe asthma attack' },
    } as CaseScenario;
    expect(derivePatientPosture(patient, { mobility: 'seated', respiration: 32 })).toBe('tripod');
    expect(derivePatientPosture(patient, { mobility: 'seated', respiration: 18 })).toBe('seated');
    patient.initialPresentation.position = 'Sitting in tripod position';
    expect(derivePatientPosture(patient, { mobility: 'seated', respiration: 18 })).toBe('tripod');
  });

  it('keeps general-001 sitting with legs elevated rather than a floor-foot seat', () => {
    const patient = allCases.find(item => item.id === 'general-001');
    expect(patient).toBeDefined();
    expect(derivePatientMobility(patient!)).toBe('seated');
    expect(derivePatientPosture(patient!, {
      mobility: 'seated',
      respiration: patient!.abcde.breathing.rate,
    })).toBe('legs-elevated');
  });
});
