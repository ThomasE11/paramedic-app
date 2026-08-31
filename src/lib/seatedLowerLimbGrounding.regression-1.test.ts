import { describe, expect, it } from 'vitest';
import { getTreatmentBayTransform } from '@/components/Body3DModel/BodyMesh';

// Regression: ISSUE-020 — the corrected seated rig hovered when viewed from the side
// Found by /qa on 2026-09-01
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md

const ROOM_FLOOR_Y = -0.05;

function worldSoleY(localSoleZ: number, patientScale: number) {
  const transform = getTreatmentBayTransform('floor', 'seated', 'recumbent', patientScale);
  return transform.position[1] + localSoleZ * transform.scale;
}

describe('seated lower-limb grounding regression', () => {
  it('balances the adult male and female soles around the room floor', () => {
    // Blender measurements from the final adult seated morphs.
    expect(worldSoleY(0.321, 1)).toBeCloseTo(ROOM_FLOOR_Y + 0.017, 3);
    expect(worldSoleY(0.289, 1)).toBeCloseTo(ROOM_FLOOR_Y - 0.017, 3);
  });

  it('scales the grounding correction for an infant without an adult-sized sink', () => {
    const eightMonthScale = 0.6876 / 1.8;

    expect(worldSoleY(0.122, eightMonthScale)).toBeCloseTo(ROOM_FLOOR_Y + 0.006, 3);
  });

  it('grounds seated and tripod postures independently of the requested support stage', () => {
    const seated = getTreatmentBayTransform('stretcher', 'seated', 'recumbent', 1);
    const tripod = getTreatmentBayTransform('floor', 'tripod', 'recumbent', 1);

    expect(seated.position[1]).toBeCloseTo(tripod.position[1]);
    expect(seated.position[1]).toBeCloseTo(-0.3672);
  });
});
