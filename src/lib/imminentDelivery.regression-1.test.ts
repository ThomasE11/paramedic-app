import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { TREATMENTS } from '@/data/enhancedTreatmentEffects';
import { findProtocol } from '@/data/treatmentProtocols';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import {
  recommendedManagementTabForCase,
  suggestedTreatmentIdsForCase,
} from '@/components/TreatmentJumpBagPanel';
import { getHandsOnProcedurePlan, isHandsOnTreatment } from '@/lib/handsOnProcedures';
import {
  derivePatientMobility,
  derivePatientPosture,
  deriveTreatmentPositioningOverride,
  patientLivePositionPresentation,
} from '@/lib/patientStaging';

describe('regression: imminent delivery is an executable hands-on scenario', () => {
  const deliveryCase = allCases.find(candidate => candidate.id === 'y1-006')!;
  const initialVitals = buildInitialVitalsFromCase(deliveryCase);

  it('opens the exposure pack and prioritises the birth workflow only before completion', () => {
    expect(recommendedManagementTabForCase(deliveryCase)).toBe('exposure');
    expect(suggestedTreatmentIdsForCase(deliveryCase, initialVitals)).toContain('assist_delivery');
    expect(suggestedTreatmentIdsForCase(
      deliveryCase,
      initialVitals,
      false,
      ['assist_delivery'],
    )).not.toContain('assist_delivery');
  });

  it('requires the complete physical sequence from crowning through the third stage', () => {
    const treatment = TREATMENTS.find(candidate => candidate.id === 'assist_delivery');
    const plan = getHandsOnProcedurePlan('assist_delivery', deliveryCase);

    expect(treatment?.category).toBe('comfort');
    expect(isHandsOnTreatment('assist_delivery')).toBe(true);
    expect(plan?.equipmentAsset).toBe('/equipment-assets/delivery-kit.webp');
    expect(plan?.steps.map(step => step.id)).toEqual([
      'confirm-imminent',
      'prepare',
      'position',
      'support-head',
      'cord',
      'birth',
      'newborn',
      'placenta',
    ]);
  });

  it('makes assistance essential to the authored protocol', () => {
    const protocol = findProtocol('normal-delivery');
    expect(protocol?.severityLevels[0].essentialTreatments).toEqual(expect.arrayContaining([
      'assist_delivery',
      'fowlers_position',
    ]));
  });

  it('renders the authored semi-recumbent maternal position instead of a supine trolley pose', () => {
    const mobility = derivePatientMobility(deliveryCase);
    const posture = derivePatientPosture(deliveryCase, {
      mobility,
      respiration: initialVitals.respiration,
    });

    expect(mobility).toBe('seated');
    expect(posture).toBe('seated');
    expect(patientLivePositionPresentation(deliveryCase, {
      stage: 'stretcher',
      mobility,
      posture,
    }).key).toBe('semiRecumbent');
    expect(deriveTreatmentPositioningOverride(['assist_delivery'])).toMatchObject({
      mobility: 'seated',
      posture: 'seated',
      treatmentId: 'assist_delivery',
    });
  });
});
