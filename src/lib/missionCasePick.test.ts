import { describe, expect, it, vi, afterEach } from 'vitest';
import { pickRandomFromPool, skillFocusForCategory } from './missionCasePick';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('pickRandomFromPool', () => {
  it('returns null for an empty pool', () => {
    expect(pickRandomFromPool([])).toBeNull();
  });

  it('returns the only case when the pool has one item', () => {
    expect(pickRandomFromPool([{ id: 'trauma-011' }])?.id).toBe('trauma-011');
  });

  it('picks from the filtered pool, not a fixed seed', () => {
    const pool = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(pickRandomFromPool(pool)?.id).toBe('c');
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickRandomFromPool(pool)?.id).toBe('a');
  });

  it('avoids the last-launched case when other options exist', () => {
    const pool = [{ id: 'trauma-001' }, { id: 'trauma-011' }];
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickRandomFromPool(pool, { excludeId: 'trauma-001' })?.id).toBe('trauma-011');
  });
});

describe('skillFocusForCategory', () => {
  it('maps trauma presentations onto trauma goals', () => {
    expect(skillFocusForCategory.trauma).toBe('trauma');
    expect(skillFocusForCategory.burns).toBe('trauma');
  });
});
