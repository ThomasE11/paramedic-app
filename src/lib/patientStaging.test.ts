import { describe, expect, it } from 'vitest';
import { deriveScenePatientStage } from './patientStaging';
import type { CaseScenario } from '@/types';

function fakeCase(position: string, callReason = 'Emergency call'): CaseScenario {
  return {
    initialPresentation: { generalImpression: '', position, appearance: '' },
    dispatchInfo: { callReason },
  } as unknown as CaseScenario;
}

describe('deriveScenePatientStage', () => {
  it('stages explicit ground scenes on the floor', () => {
    expect(deriveScenePatientStage(fakeCase('Supine on the floor'))).toBe('floor');
    expect(deriveScenePatientStage(fakeCase('Sitting on floor, leaning against bed'))).toBe('floor');
    expect(deriveScenePatientStage(fakeCase('Supine', 'Male collapsed at the mall'))).toBe('floor');
    expect(deriveScenePatientStage(fakeCase('Lying on side', 'Motorcyclist down at roadside'))).toBe('floor');
  });

  it('keeps ambiguous or seated scenes on the stretcher', () => {
    expect(deriveScenePatientStage(fakeCase('Sitting upright, leaning forward (tripod)'))).toBe('stretcher');
    expect(deriveScenePatientStage(fakeCase('Supine'))).toBe('stretcher');
    expect(deriveScenePatientStage(fakeCase('Semi-recumbent', 'Chest pain at home'))).toBe('stretcher');
  });

  it('never crashes on missing scene fields', () => {
    expect(deriveScenePatientStage({} as CaseScenario)).toBe('stretcher');
  });
});
