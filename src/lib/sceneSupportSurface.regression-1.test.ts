import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import {
  derivePatientSupportSurface,
  patientLivePositionPresentation,
  type PatientMobility,
  type PatientPosture,
  type PatientStage,
} from './patientStaging';

function sceneCase(
  position: string,
  patientSupportSurface?: CaseScenario['sceneInfo']['patientSupportSurface'],
): CaseScenario {
  return {
    id: `support-${position}`,
    title: 'Support-surface test case',
    sceneInfo: {
      description: '',
      hazards: [],
      bystanders: '',
      environment: '',
      patientSupportSurface,
    },
    initialPresentation: { position, appearance: '', generalImpression: '' },
  } as unknown as CaseScenario;
}

function support(
  position: string,
  stage: PatientStage,
  mobility: PatientMobility,
  loadedOnStretcher = false,
) {
  const caseData = sceneCase(position);
  return derivePatientSupportSurface(caseData, { stage, mobility, loadedOnStretcher });
}

describe('authored patient support surface regression', () => {
  it('keeps a bed or sofa under the patient described at dispatch', () => {
    expect(support('Lying in bed, clutching chest', 'stretcher', 'recumbent')).toBe('bed');
    expect(support('Lying on sofa in recovery position', 'stretcher', 'recumbent')).toBe('sofa');
    expect(support('Sitting on examination couch', 'stretcher', 'seated')).toBe('bed');
  });

  it('keeps floor and ambulatory staging authoritative', () => {
    expect(support('Sitting on floor, leaning against bed', 'floor', 'seated')).toBe('floor');
    expect(support('Standing beside the bed', 'stretcher', 'standing')).toBe('none');
  });

  it('replaces the scene furniture only after a deliberate stretcher load', () => {
    expect(support('Lying in bed', 'stretcher', 'recumbent', true)).toBe('stretcher');
  });

  it('keeps a Business Bay syncope patient on a seat, not a bed or the floor', () => {
    expect(support('Sitting with legs elevated', 'stretcher', 'seated')).toBe('seat');
  });

  it('keeps the displayed position label consistent with the rendered surface', () => {
    const bedCase = sceneCase('Lying in bed');
    const sofaCase = sceneCase('Lying on sofa in recovery position');
    const presentation = (
      caseData: CaseScenario,
      supportSurface: 'bed' | 'sofa',
      posture: PatientPosture,
    ) => patientLivePositionPresentation(caseData, {
      stage: 'stretcher',
      mobility: 'recumbent',
      posture,
      supportSurface,
    });

    expect(presentation(bedCase, 'bed', 'supine').key).toBe('supineBed');
    expect(presentation(sofaCase, 'sofa', 'recovery').key).toBe('recoverySofa');
  });
});
