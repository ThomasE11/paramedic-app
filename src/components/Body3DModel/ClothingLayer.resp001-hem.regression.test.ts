import { describe, expect, it } from 'vitest';

import {
  GARMENT_GLBS,
  RESP001_GARMENT_GLBS,
  shirtHemDropForSpec,
} from './ClothingLayer';

describe('resp-001 shirt-hem ownership', () => {
  it('opts only the tripod shirt out of the generic 50 mm base-hem extension', () => {
    const standardShirt = GARMENT_GLBS.find(garment => garment.name === 'scrub-top');
    const resp001Shirt = RESP001_GARMENT_GLBS.find(garment => garment.name === 'scrub-top');

    expect(standardShirt).toBeDefined();
    expect(resp001Shirt).toBeDefined();
    expect(shirtHemDropForSpec(standardShirt!)).toBeCloseTo(0.05);
    expect(shirtHemDropForSpec(resp001Shirt!)).toBe(0);
  });

  it('uses a case-owned spec without replacing the authored morph-bearing shirt asset', () => {
    const standardShirt = GARMENT_GLBS.find(garment => garment.name === 'scrub-top');
    const resp001Shirt = RESP001_GARMENT_GLBS.find(garment => garment.name === 'scrub-top');

    expect(resp001Shirt).not.toBe(standardShirt);
    expect(resp001Shirt).toMatchObject({
      url: standardShirt!.url,
      name: standardShirt!.name,
      color: standardShirt!.color,
      offset: standardShirt!.offset,
      hemDrop: 0,
    });
  });
});
