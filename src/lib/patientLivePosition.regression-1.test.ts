import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { patientLivePositionLabel } from './patientStaging';

const caseWithPosition = (position: string): CaseScenario => ({
  initialPresentation: { generalImpression: 'Critically unwell infant', position, appearance: 'Floppy', consciousness: 'Reduced response' },
}) as unknown as CaseScenario;

describe('live patient position continuity regression', () => {
  it('explains the transfer when a caregiver-held infant is rendered supine for assessment', () => {
    expect(patientLivePositionLabel(caseWithPosition('Held by mother, head unsupported'), {
      stage: 'stretcher',
      mobility: 'recumbent',
      posture: 'supine',
    })).toBe('Supine on ambulance stretcher — transferred from caregiver for assessment');
  });

  it('reports treatment-driven movement instead of retaining stale arrival prose', () => {
    const patient = caseWithPosition('Supine on floor');
    expect(patientLivePositionLabel(patient, {
      stage: 'floor',
      mobility: 'recumbent',
      posture: 'recovery',
    })).toBe('Recovery position on scene floor');
    expect(patientLivePositionLabel(patient, {
      stage: 'floor',
      mobility: 'pacing',
      posture: null,
    })).toBe('Walking / pacing in scene');
  });

  it('reports sitting with legs elevated instead of a generic seated label', () => {
    expect(patientLivePositionLabel(caseWithPosition('Sitting with legs elevated'), {
      stage: 'stretcher',
      mobility: 'seated',
      posture: 'legs-elevated',
      supportSurface: 'seat',
    })).toBe('Sitting with legs elevated');
  });
});
