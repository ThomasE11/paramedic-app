import { describe, expect, it } from 'vitest';
import { equipmentCompletionState } from '@/lib/tacticalCarePresentation';

describe('regression: completed equipment uses clinically accurate status language', () => {
  it('calls haemorrhage-control devices applied rather than connected', () => {
    expect(equipmentCompletionState({
      treatmentId: 'tourniquet',
      treatmentCategory: 'circulation',
    })).toEqual({
      label: 'Applied',
      description: 'Applied to the patient and recorded on the resuscitation card.',
    });
  });

  it('distinguishes medicines, positioning and genuine circuits', () => {
    expect(equipmentCompletionState({
      treatmentId: 'morphine_iv',
      treatmentCategory: 'medication',
    }).label).toBe('Administered');

    expect(equipmentCompletionState({
      treatmentId: 'recovery_position',
      treatmentCategory: 'positioning',
    }).label).toBe('Positioned');

    expect(equipmentCompletionState({
      treatmentId: 'monitor_pads',
      treatmentCategory: 'circulation',
    }).label).toBe('Connected');
  });
});
