import { describe, expect, it } from 'vitest';
import { tacticalCareHeadline } from '@/lib/tacticalCarePresentation';

describe('regression: patient care ribbon describes interventions truthfully', () => {
  it('does not call non-device care a connected device', () => {
    expect(tacticalCareHeadline({ pendingCount: 0, completedCount: 0, activeCount: 1 }))
      .toBe('1 active intervention');
    expect(tacticalCareHeadline({ pendingCount: 0, completedCount: 0, activeCount: 2 }))
      .toBe('2 active interventions');
  });

  it('retains reassessment and confirmed-response priority', () => {
    expect(tacticalCareHeadline({ pendingCount: 2, completedCount: 1, activeCount: 3 }))
      .toBe('2 reassessment pending');
    expect(tacticalCareHeadline({ pendingCount: 0, completedCount: 1, activeCount: 3 }))
      .toBe('1 response confirmed');
    expect(tacticalCareHeadline({ pendingCount: 0, completedCount: 0, activeCount: 0 }))
      .toBe('No interventions applied yet');
  });
});
