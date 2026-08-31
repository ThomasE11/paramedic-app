import { describe, expect, it } from 'vitest';
import { assessPacingCapture, assessPacingStart } from './pacingSafety';

describe('pacing output prerequisite regression', () => {
  it('keeps pacing output locked until multifunction pads are attached', () => {
    expect(assessPacingStart(false)).toMatchObject({
      canStart: false,
      message: expect.stringContaining('PADS OFF'),
    });
  });

  it('makes pacing output available once the pads are connected', () => {
    expect(assessPacingStart(true)).toMatchObject({
      canStart: true,
      message: expect.stringContaining('output available'),
    });
  });

  it('still requires a pulse check after output becomes available', () => {
    expect(assessPacingCapture({
      padsAttached: true,
      active: true,
      rate: 70,
      output: 30,
    })).toMatchObject({
      status: 'electrical-only',
      canCreditTreatment: false,
    });
  });
});
