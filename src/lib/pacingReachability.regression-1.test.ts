import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { TREATMENTS } from '@/data/enhancedTreatmentEffects';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import {
  bagKeyForTreatment,
  suggestedTreatmentIdsForCase,
} from '@/components/TreatmentJumpBagPanel';

describe('regression: transcutaneous pacing is reachable from a pacing case', () => {
  it('routes the device to circulation and surfaces pads before pacing', () => {
    const treatment = TREATMENTS.find(candidate => candidate.id === 'pacing_transcutaneous');
    const pacingCase = allCases.find(candidate => candidate.id === 'cardiac-015');

    expect(treatment).toBeDefined();
    expect(pacingCase).toBeDefined();
    expect(bagKeyForTreatment(treatment!)).toBe('circulation');

    const suggestions = suggestedTreatmentIdsForCase(
      pacingCase!,
      buildInitialVitalsFromCase(pacingCase!),
      false,
      [],
      pacingCase!.initialRhythm,
    );

    expect(suggestions).toContain('monitor_pads');
    expect(suggestions).toContain('pacing_transcutaneous');
    expect(suggestions.indexOf('monitor_pads')).toBeLessThan(suggestions.indexOf('pacing_transcutaneous'));
  });
});
