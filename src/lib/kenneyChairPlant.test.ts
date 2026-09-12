import { describe, expect, it } from 'vitest';
import {
  KENNEY_CHAIR_NATIVE,
  PATIENT_CHAIR_SEAT_Y,
  PATIENT_CHAIR_SEAT_Z,
  kenneyChairPlant,
  kenneyChairWorldSeat,
  type KenneyChairKind,
} from './kenneyChairPlant';

const KINDS = Object.keys(KENNEY_CHAIR_NATIVE) as KenneyChairKind[];

describe('kenneyChairPlant', () => {
  it.each(KINDS)('plants the %s seat pan on the seated patient chair height', (kind) => {
    const world = kenneyChairWorldSeat(kind);
    expect(world.seatY).toBeCloseTo(PATIENT_CHAIR_SEAT_Y, 5);
    expect(world.seatZ).toBeCloseTo(PATIENT_CHAIR_SEAT_Z, 5);
  });

  it.each(KINDS)('keeps the %s backrest behind the seat pan (patient faces +Z)', (kind) => {
    const world = kenneyChairWorldSeat(kind);
    expect(world.backZ).toBeLessThan(world.seatZ);
  });

  it.each(KINDS)('centres the %s chair on the patient x=0 plant', (kind) => {
    const plant = kenneyChairPlant(kind);
    const native = KENNEY_CHAIR_NATIVE[kind];
    expect(plant.position[0] + native.centerX * plant.scale).toBeCloseTo(0, 5);
    expect(plant.position[1]).toBe(0);
    expect(plant.url).toMatch(/\/models\/props\/kenney-.+\.glb$/);
  });

  it('scales the doll-sized dining chair up to an adult seat', () => {
    expect(kenneyChairPlant('dining').scale).toBeGreaterThan(2);
    expect(kenneyChairPlant('desk').scale).toBeGreaterThan(1.5);
  });
});
