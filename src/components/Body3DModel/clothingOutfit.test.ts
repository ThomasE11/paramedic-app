import { describe, expect, it } from 'vitest';
import { pickOutfit } from './ClothingLayer';

describe('pickOutfit', () => {
  it('is deterministic per seed', () => {
    expect(pickOutfit({ seed: 42, gender: 'male', age: 30 }))
      .toEqual(pickOutfit({ seed: 42, gender: 'male', age: 30 }));
  });

  it('different seeds reach different outfits across the pool', () => {
    const tops = new Set(
      Array.from({ length: 12 }, (_, seed) => pickOutfit({ seed, gender: 'male', age: 30 }).top),
    );
    expect(tops.size).toBeGreaterThan(2);
  });

  it('elderly patients draw from the mellow wardrobe', () => {
    const outfit = pickOutfit({ seed: 3, gender: 'male', age: 78 });
    expect(['#8a8272', '#5c6157', '#e8e3d8']).toContain(outfit.top);
  });

  it('always returns a valid outfit even with no options', () => {
    const outfit = pickOutfit();
    expect(outfit.top).toMatch(/^#[0-9a-f]{6}$/);
    expect(outfit.trouser).toMatch(/^#[0-9a-f]{6}$/);
  });
});
