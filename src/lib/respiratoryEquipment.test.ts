import { describe, expect, it } from 'vitest';
import { activeRespiratoryInterface, respiratoryEquipmentReplaced } from './respiratoryEquipment';
import { equipmentCompletionState } from './tacticalCarePresentation';

describe('respiratory interface consistency', () => {
  it('replaces the reservoir mask when a nebuliser is connected, preserving the record', () => {
    const ids = ['oxygen_nonrebreather', 'nebulizer_salbutamol'];
    expect(activeRespiratoryInterface(ids)?.mode).toBe('nebulizer');
    expect(equipmentCompletionState({ treatmentId: ids[0], appliedTreatmentIds: ids }).label).toBe('Replaced');
    expect(equipmentCompletionState({ treatmentId: ids[1], appliedTreatmentIds: ids }).label).toBe('Connected');
    expect(ids).toEqual(['oxygen_nonrebreather', 'nebulizer_salbutamol']);
  });

  it('keeps a combined nebulised dose on one interface', () => {
    const ids = ['nebulizer_salbutamol', 'nebulizer_ipratropium'];
    expect(ids.map(id => respiratoryEquipmentReplaced(id, ids))).toEqual([false, false]);
  });

  it('does not leave a face oxygen mask on a secured airway', () => {
    for (const airway of ['intubation', 'rsi_intubation', 'surgical_cric']) {
      const ids = ['oxygen_venturi', airway];
      expect(activeRespiratoryInterface(ids)).toBeNull();
      expect(respiratoryEquipmentReplaced('oxygen_venturi', ids)).toBe(true);
      expect(activeRespiratoryInterface([...ids, 'bvm_ventilation'])?.mode).toBe('bvm');
    }
  });

  it('does not call never-applied equipment replaced or change non-respiratory status', () => {
    expect(respiratoryEquipmentReplaced('oxygen_nasal', ['cpap_niv'])).toBe(false);
    expect(equipmentCompletionState({ treatmentId: 'tourniquet', appliedTreatmentIds: ['tourniquet'] }).label).toBe('Applied');
  });
});
