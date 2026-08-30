import { describe, expect, it } from 'vitest';
import { assessPacingCapture, MODELLED_PACING_CAPTURE_THRESHOLD_MA } from '@/lib/pacingSafety';

describe('transcutaneous pacing safety', () => {
  it('never allows pacing without multifunction pads', () => {
    expect(assessPacingCapture({ padsAttached: false, active: true, rate: 70, output: 100 })).toMatchObject({
      status: 'pads-required',
      canCreditTreatment: false,
    });
  });

  it('does not mistake an ECG pacing spike for mechanical capture', () => {
    expect(assessPacingCapture({
      padsAttached: true,
      active: true,
      rate: 70,
      output: MODELLED_PACING_CAPTURE_THRESHOLD_MA - 10,
    })).toMatchObject({
      status: 'electrical-only',
      canCreditTreatment: false,
    });
  });

  it('credits treatment only after a palpable pulse at capturing output', () => {
    expect(assessPacingCapture({
      padsAttached: true,
      active: true,
      rate: 70,
      output: MODELLED_PACING_CAPTURE_THRESHOLD_MA,
    })).toMatchObject({
      status: 'mechanical-capture',
      canCreditTreatment: true,
    });
  });
});
