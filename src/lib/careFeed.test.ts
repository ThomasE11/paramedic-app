import { describe, expect, it } from 'vitest';
import { deduplicateCareFeedItems } from './careFeed';

describe('deduplicateCareFeedItems', () => {
  it('removes the same student-facing finding emitted by different sources', () => {
    const items = deduplicateCareFeedItems([
      { id: 'assessment-burn', label: 'Burn Pattern', detail: 'Deep partial-thickness burn over the chest.' },
      { id: 'visual-burn', label: ' burn pattern ', detail: 'Deep  partial-thickness burn over the chest. ' },
    ]);

    expect(items).toEqual([
      { id: 'assessment-burn', label: 'Burn Pattern', detail: 'Deep partial-thickness burn over the chest.' },
    ]);
  });

  it('keeps distinct findings that happen to share a label', () => {
    const items = deduplicateCareFeedItems([
      { id: 'left-burn', label: 'Burn Pattern', detail: 'Burn over the left forearm.' },
      { id: 'chest-burn', label: 'Burn Pattern', detail: 'Burn over the anterior chest.' },
    ]);

    expect(items).toHaveLength(2);
  });
});
