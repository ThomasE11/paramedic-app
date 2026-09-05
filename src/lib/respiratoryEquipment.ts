export type OxygenVisualMode = 'nasal' | 'simple-mask' | 'venturi' | 'nonrebreather' | 'nebulizer' | 'bvm' | 'cpap' | 'ventilator';

const RESPIRATORY_INTERFACES: Array<{
  ids: string[];
  mode: OxygenVisualMode;
  label: string;
  detail: string;
}> = [
  { ids: ['mechanical_ventilation', 'ventilator_setup'], mode: 'ventilator', label: 'Ventilator circuit', detail: 'Secured airway with circuit attached' },
  { ids: ['bvm_ventilation'], mode: 'bvm', label: 'BVM ventilation', detail: 'Mask seal and bag-valve device in use' },
  { ids: ['cpap_niv'], mode: 'cpap', label: 'CPAP mask', detail: 'Strapped mask with pressure circuit' },
  { ids: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'nebulised_adrenaline'], mode: 'nebulizer', label: 'Nebuliser mask', detail: 'Aerosol chamber attached to mask' },
  { ids: ['oxygen_nonrebreather'], mode: 'nonrebreather', label: 'Non-rebreather', detail: 'Reservoir mask with high-flow oxygen' },
  { ids: ['oxygen_venturi'], mode: 'venturi', label: 'Venturi mask · 28%', detail: 'Controlled oxygen targeting SpO₂ 88–92%' },
  { ids: ['oxygen_mask'], mode: 'simple-mask', label: 'Simple oxygen mask', detail: 'Mask and oxygen tubing connected' },
  { ids: ['oxygen_nasal'], mode: 'nasal', label: 'Nasal cannula', detail: 'Nasal prongs and tubing fitted' },
];

/** A single source for the interface shown on the face and in the kit. The
 * existing escalation priority is preserved; treatment history is not a list
 * of simultaneous masks. Replaced devices remain in the resuscitation record. */
export function activeRespiratoryInterface(appliedIds: readonly string[]) {
  const applied = new Set(appliedIds);
  const match = RESPIRATORY_INTERFACES.find(device => device.ids.some(id => applied.has(id)));
  const securedAirway = ['intubation', 'endotracheal_intubation', 'rsi_intubation', 'surgical_cric']
    .some(id => applied.has(id));
  if (securedAirway && match && match.mode !== 'ventilator' && match.mode !== 'bvm') return null;
  return match ?? null;
}

export function respiratoryEquipmentReplaced(treatmentId: string | undefined, appliedIds: readonly string[]): boolean {
  if (!treatmentId || !appliedIds.includes(treatmentId)) return false;
  const device = RESPIRATORY_INTERFACES.find(item => item.ids.includes(treatmentId));
  return !!device && device.mode !== activeRespiratoryInterface(appliedIds)?.mode;
}
