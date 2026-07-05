import { describe, it, expect } from 'vitest';
import { classifyBodyPoint, type RegionHit } from './regionClassifier';

describe('classifyBodyPoint', () => {
  it('classifies forehead front point as face', () => {
    const result: RegionHit = classifyBodyPoint(0, 1.62, 0.16);
    expect(result.region).toBe('face');
    expect(result.foot).toBe(false);
  });

  it('classifies back of head as head', () => {
    const result: RegionHit = classifyBodyPoint(0, 1.62, -0.1);
    expect(result.region).toBe('head');
    expect(result.foot).toBe(false);
  });

  it('classifies crown as head', () => {
    const result: RegionHit = classifyBodyPoint(0, 1.75, 0);
    expect(result.region).toBe('head');
    expect(result.foot).toBe(false);
  });

  it('classifies neck as neck-cspine', () => {
    const result: RegionHit = classifyBodyPoint(0, 1.45, 0.1);
    expect(result.region).toBe('neck-cspine');
    expect(result.foot).toBe(false);
  });

  it('classifies sternum as chest', () => {
    const result: RegionHit = classifyBodyPoint(0, 1.25, 0.18);
    expect(result.region).toBe('chest');
    expect(result.foot).toBe(false);
  });

  it('classifies belly as abdomen', () => {
    const result: RegionHit = classifyBodyPoint(0.03, 1.0, 0.2);
    expect(result.region).toBe('abdomen');
    expect(result.foot).toBe(false);
  });

  it('classifies pelvis as pelvis', () => {
    const result: RegionHit = classifyBodyPoint(0, 0.85, 0.2);
    expect(result.region).toBe('pelvis');
    expect(result.foot).toBe(false);
  });

  it('classifies right wrist as right-arm', () => {
    const result: RegionHit = classifyBodyPoint(-0.2, 0.82, 0.15);
    expect(result.region).toBe('right-arm');
    expect(result.foot).toBe(false);
  });

  it('classifies left mid-arm as left-arm', () => {
    const result: RegionHit = classifyBodyPoint(0.3, 1.1, 0);
    expect(result.region).toBe('left-arm');
    expect(result.foot).toBe(false);
  });

  it('classifies right thigh as right-leg with foot=false', () => {
    const result: RegionHit = classifyBodyPoint(-0.1, 0.5, 0.1);
    expect(result.region).toBe('right-leg');
    expect(result.foot).toBe(false);
  });

  it('classifies left shin as left-leg with foot=false', () => {
    const result: RegionHit = classifyBodyPoint(0.12, 0.25, 0.1);
    expect(result.region).toBe('left-leg');
    expect(result.foot).toBe(false);
  });

  it('classifies right foot as right-leg with foot=true', () => {
    const result: RegionHit = classifyBodyPoint(-0.13, 0.05, 0.15);
    expect(result.region).toBe('right-leg');
    expect(result.foot).toBe(true);
  });

  it('classifies left foot as left-leg with foot=true', () => {
    const result: RegionHit = classifyBodyPoint(0.13, 0.03, 0.1);
    expect(result.region).toBe('left-leg');
    expect(result.foot).toBe(true);
  });

  it('does not classify boundary y=0.09 as foot', () => {
    const result: RegionHit = classifyBodyPoint(0, 0.09, 0.1);
    // y === 0.09 is still the leg region — just above the foot band.
    expect(result.region).toBe('left-leg');
    expect(result.foot).toBe(false);
  });
});
