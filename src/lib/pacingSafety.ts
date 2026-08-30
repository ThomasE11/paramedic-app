export const MODELLED_PACING_CAPTURE_THRESHOLD_MA = 60;

export interface PacingCaptureInput {
  padsAttached: boolean;
  active: boolean;
  rate: number;
  output: number;
}

export interface PacingCaptureAssessment {
  status: 'pads-required' | 'pacer-off' | 'electrical-only' | 'mechanical-capture';
  canCreditTreatment: boolean;
  message: string;
}

/**
 * Keeps electrical pacing separate from clinical capture. The simulator uses
 * a modelled current threshold, but the learner must still palpate a pulse:
 * ECG spikes alone never prove perfusion.
 */
export function assessPacingCapture(input: PacingCaptureInput): PacingCaptureAssessment {
  if (!input.padsAttached) {
    return {
      status: 'pads-required',
      canCreditTreatment: false,
      message: 'PADS OFF — attach anterior/lateral multifunction pads before pacing.',
    };
  }
  if (!input.active) {
    return {
      status: 'pacer-off',
      canCreditTreatment: false,
      message: 'PACER OFF — set a rate, begin pacing, then increase output while watching for capture.',
    };
  }
  if (input.output < MODELLED_PACING_CAPTURE_THRESHOLD_MA) {
    return {
      status: 'electrical-only',
      canCreditTreatment: false,
      message: `Pacing spikes at ${input.rate} ppm, but no palpable pulse — increase output to at least ${MODELLED_PACING_CAPTURE_THRESHOLD_MA} mA and reassess.`,
    };
  }
  return {
    status: 'mechanical-capture',
    canCreditTreatment: true,
    message: `Mechanical capture confirmed: palpable pulse at ${input.rate}/min with ${input.output} mA output.`,
  };
}
