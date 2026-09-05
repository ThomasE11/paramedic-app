import { respiratoryEquipmentReplaced } from './respiratoryEquipment';

export function tacticalCareHeadline({
  pendingCount,
  completedCount,
  activeCount,
}: {
  pendingCount: number;
  completedCount: number;
  activeCount: number;
}): string {
  if (pendingCount > 0) return `${pendingCount} reassessment pending`;
  if (completedCount > 0) return `${completedCount} response confirmed`;
  if (activeCount > 0) return `${activeCount} active ${activeCount === 1 ? 'intervention' : 'interventions'}`;
  return 'No interventions applied yet';
}

export type EquipmentCompletionState = {
  label: 'Applied' | 'Administered' | 'Connected' | 'Positioned' | 'Replaced';
  description: string;
};

const CONNECTED_TREATMENT_IDS = new Set([
  'bvm_ventilation',
  'cpap_niv',
  'mechanical_ventilation',
  'monitor_pads',
  'nebulised_adrenaline',
  'nebulizer_salbutamol',
  'nebulizer_ipratropium',
  'oxygen_mask',
  'oxygen_nasal',
  'oxygen_venturi',
  'oxygen_nonrebreather',
  'targeted_temp_mgmt',
  'ventilator_setup',
]);

/**
 * Describe completed equipment truthfully. A tourniquet, bandage or splint is
 * applied, medicine is administered and a patient position is achieved; only
 * oxygen, ventilation and monitoring circuits should be called connected.
 */
export function equipmentCompletionState({
  treatmentId,
  treatmentCategory,
  appliedTreatmentIds,
}: {
  treatmentId?: string;
  treatmentCategory?: string;
  appliedTreatmentIds?: readonly string[];
}): EquipmentCompletionState {
  if (appliedTreatmentIds && respiratoryEquipmentReplaced(treatmentId, appliedTreatmentIds)) {
    return {
      label: 'Replaced',
      description: 'Replaced by the current respiratory interface. The earlier treatment remains in the resuscitation record.',
    };
  }
  if (treatmentCategory === 'medication') {
    return {
      label: 'Administered',
      description: 'Administered to the patient and recorded on the resuscitation card.',
    };
  }

  if (treatmentCategory === 'positioning') {
    return {
      label: 'Positioned',
      description: 'Patient positioned and the change recorded on the resuscitation card.',
    };
  }

  if (treatmentId && CONNECTED_TREATMENT_IDS.has(treatmentId)) {
    return {
      label: 'Connected',
      description: 'Connected to the patient and recorded on the resuscitation card.',
    };
  }

  return {
    label: 'Applied',
    description: 'Applied to the patient and recorded on the resuscitation card.',
  };
}
