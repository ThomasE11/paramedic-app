const DEFIBRILLATOR_PAD_TREATMENTS = new Set(['monitor_pads', 'aed']);

/**
 * A shock-capable device is physically connected only after the student has
 * completed the pad-placement procedure. Defibrillation itself is deliberately
 * not accepted as proof: that would let the action satisfy its own prerequisite.
 */
export function hasAttachedDefibrillatorPads(appliedTreatmentIds: readonly string[]): boolean {
  return appliedTreatmentIds.some(treatmentId => DEFIBRILLATOR_PAD_TREATMENTS.has(treatmentId));
}
