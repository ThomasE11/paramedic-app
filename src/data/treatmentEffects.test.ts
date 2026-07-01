import { describe, it, expect } from 'vitest';
import type { VitalSigns } from '@/types';
import {
  applyTreatmentEffectEnhanced,
  getCaseSpecificTreatments,
  ensureCompleteVitals,
  getCaseType,
  parseBP,
  formatBP,
} from './treatmentEffects';

const vitals = (overrides: Partial<VitalSigns> = {}): VitalSigns => ({
  bp: '120/80',
  pulse: 80,
  respiration: 16,
  spo2: 98,
  temperature: 36.5,
  gcs: 15,
  bloodGlucose: 5.5,
  ...overrides,
});

describe('applyTreatmentEffectEnhanced — oxygen therapy', () => {
  it('raises SpO2 toward target in a hypoxic patient, never above 98', () => {
    const result = applyTreatmentEffectEnhanced(
      'Administer high flow oxygen 15L via non-rebreather mask',
      vitals({ spo2: 82, pulse: 115, respiration: 28 }),
      'respiratory',
    );
    expect(result.vitals.spo2).toBeGreaterThan(82);
    expect(result.vitals.spo2).toBeLessThanOrEqual(98);
    expect(result.hasImprovement).toBe(true);
    // improved oxygenation relieves compensatory tachycardia + tachypnoea
    expect(result.vitals.pulse).toBeLessThan(115);
    expect(result.vitals.respiration).toBeLessThan(28);
  });

  it('never lowers SpO2 when the patient is already at target', () => {
    const result = applyTreatmentEffectEnhanced(
      'Administer oxygen via nasal cannula',
      vitals({ spo2: 98 }),
      'respiratory',
    );
    expect(result.vitals.spo2).toBe(98);
    expect(result.hasImprovement).toBe(false);
  });

  it('respects the lower COPD target ceiling (88-92%)', () => {
    const result = applyTreatmentEffectEnhanced(
      'Administer controlled oxygen for COPD patient',
      vitals({ spo2: 84 }),
      'respiratory',
    );
    expect(result.vitals.spo2).toBeGreaterThan(84);
    expect(result.vitals.spo2).toBeLessThanOrEqual(92);
  });
});

describe('applyTreatmentEffectEnhanced — other treatments', () => {
  it('glucose corrects hypoglycaemia and improves GCS, capped at physiologic limits', () => {
    const result = applyTreatmentEffectEnhanced(
      'Administer oral glucose for hypoglycemia',
      vitals({ bloodGlucose: 2.2, gcs: 11 }),
      'medical',
    );
    expect(result.vitals.bloodGlucose!).toBeGreaterThan(2.2);
    expect(result.vitals.bloodGlucose!).toBeLessThanOrEqual(7);
    expect(result.vitals.gcs!).toBeGreaterThan(11);
    expect(result.vitals.gcs!).toBeLessThanOrEqual(15);
  });

  it('GTN lowers a hypertensive BP but not below the 120 floor', () => {
    const result = applyTreatmentEffectEnhanced('Administer GTN spray', vitals({ bp: '170/95' }));
    const sys = parseBP(result.vitals.bp).systolic;
    expect(sys).toBeLessThan(170);
    expect(sys).toBeGreaterThanOrEqual(120);
  });

  it('CPR restores minimal perfusion in an arrested patient', () => {
    const result = applyTreatmentEffectEnhanced('Start CPR chest compressions', vitals({ pulse: 0, bp: '0/0' }));
    expect(result.vitals.pulse).toBe(60);
    expect(result.vitals.bp).toBe('60/40');
  });
});

describe('helpers', () => {
  it('ensureCompleteVitals fills sensible defaults for missing fields', () => {
    const full = ensureCompleteVitals({});
    expect(full.bp).toBe('120/80');
    expect(full.pulse).toBe(80);
    expect(full.spo2).toBe(98);
    expect(full.gcs).toBe(15);
  });

  it('parseBP handles well-formed and malformed strings', () => {
    expect(parseBP('90/60')).toEqual({ systolic: 90, diastolic: 60 });
    expect(parseBP('garbage')).toEqual({ systolic: 120, diastolic: 80 });
    expect(formatBP(117.6, 79.4)).toBe('118/79');
  });

  it('getCaseType maps categories including aliases', () => {
    expect(getCaseType('cardiac-ecg')).toBe('cardiac');
    expect(getCaseType('thoracic')).toBe('respiratory');
    expect(getCaseType('TRAUMA')).toBe('trauma');
    expect(getCaseType('something-unknown')).toBe('general');
  });

  it('getCaseSpecificTreatments always includes the ABCDE base set', () => {
    for (const cat of ['cardiac', 'respiratory', 'unknown-cat']) {
      const list = getCaseSpecificTreatments(cat);
      expect(list).toContain('Assess ABCDE');
      expect(list.length).toBeGreaterThanOrEqual(12);
    }
  });
});
