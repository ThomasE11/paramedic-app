import { describe, expect, it, vi } from 'vitest';

import {
  resolveTreatmentBayActionTarget,
  treatmentBayActionFramingRadius,
} from './cameraFraming';

// Regression: ISSUE-027 — selecting a face technique double-transformed an
// already-world-space surface sample and pulled the camera to the full body.
// Found by /qa on 2026-09-04.
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-09-04.md
describe('treatment-bay action camera coordinates', () => {
  it('uses a sampled world point without projecting it again', () => {
    const sampledWorld: [number, number, number] = [0.01, 1.58, 0.92];
    const projector = vi.fn((): [number, number, number] => [9, 9, 9]);

    expect(resolveTreatmentBayActionTarget(sampledWorld, [0, 1.56, 0.08], projector))
      .toBe(sampledWorld);
    expect(projector).not.toHaveBeenCalled();
  });

  it('projects the authored clinical point when the mesh has not sampled yet', () => {
    const projected: [number, number, number] = [0, 1.02, 0.7];
    const projector = vi.fn(() => projected);

    expect(resolveTreatmentBayActionTarget(null, [0, 1.56, 0.08], projector))
      .toBe(projected);
    expect(projector).toHaveBeenCalledOnce();
  });

  it('keeps the lip action framed as a face close-up in a narrow viewport', () => {
    expect(treatmentBayActionFramingRadius(0.065, 1)).toBeCloseTo(0.104);
  });
});
