import { describe, it, expect } from 'vitest';
import type { VitalSigns } from '@/types';
import {
  applyDeterioration,
  getDeteriorationStatus,
  getReassessmentInterval,
  determineSeverity,
  DETERIORATION_PROFILES,
} from './deteriorationSystem';

const baseVitals = (overrides: Partial<VitalSigns> = {}): VitalSigns => ({
  bp: '120/80',
  pulse: 100,
  respiration: 20,
  spo2: 94,
  temperature: 36.8,
  gcs: 14,
  bloodGlucose: 5.5,
  ...overrides,
});

describe('applyDeterioration — untreated decline', () => {
  it('worsens vitals over time for an untreated critical patient', () => {
    const { newVitals, changes } = applyDeterioration(baseVitals(), 'critical', 5, []);
    expect(newVitals.spo2).toBeLessThan(94);       // hypoxia deepens
    expect(newVitals.pulse).toBeGreaterThan(100);  // compensatory tachycardia
    expect(newVitals.respiration).toBeGreaterThan(20);
    expect(parseInt(newVitals.bp.split('/')[0], 10)).toBeLessThan(120); // BP falls
    expect(newVitals.gcs!).toBeLessThan(14);       // consciousness dims
    expect(changes.length).toBeGreaterThan(0);
  });

  it('flags critical state when SpO2 collapses', () => {
    const { isCritical } = applyDeterioration(baseVitals({ spo2: 88 }), 'critical', 5, []);
    expect(isCritical).toBe(true); // 88 - 10 = 78 < 85 threshold
  });

  it('keeps vitals within physiologic bounds after extreme untreated time', () => {
    for (const severity of ['critical', 'periarrest'] as const) {
      const { newVitals } = applyDeterioration(baseVitals(), severity, 120, []);
      expect(newVitals.spo2).toBeGreaterThanOrEqual(0);
      expect(newVitals.spo2).toBeLessThanOrEqual(100);
      expect(newVitals.pulse).toBeGreaterThan(0);
      expect(newVitals.gcs!).toBeGreaterThanOrEqual(3);
      expect(newVitals.gcs!).toBeLessThanOrEqual(15);
      expect(newVitals.respiration).toBeGreaterThan(0);
      expect(parseInt(newVitals.bp.split('/')[0], 10)).toBeGreaterThan(0);
    }
  });

  it('reverses deterioration with broad treatment coverage (3+ categories)', () => {
    const treatments = ['High-flow oxygen via NRB', 'IV saline fluid bolus', 'Adrenaline 1mg IV'];
    const start = baseVitals({ spo2: 80 });
    const { newVitals } = applyDeterioration(start, 'critical', 5, treatments);
    expect(newVitals.spo2).toBeGreaterThan(80); // -0.3x multiplier → improvement
    expect(newVitals.spo2).toBeLessThanOrEqual(100);
  });

  it('never pushes SpO2 above 100 even under prolonged improvement', () => {
    const treatments = ['oxygen mask', 'saline bolus', 'adrenaline', 'intubation airway'];
    const { newVitals } = applyDeterioration(baseVitals({ spo2: 99 }), 'critical', 60, treatments);
    expect(newVitals.spo2).toBeLessThanOrEqual(100);
  });
});

describe('getDeteriorationStatus', () => {
  it('starts stable and escalates to peri-arrest as time runs out', () => {
    const fresh = getDeteriorationStatus('critical', 0);
    expect(fresh.status).toBe('stable');
    expect(fresh.timeRemaining).toBe(DETERIORATION_PROFILES.critical.timeToDeath);

    const late = getDeteriorationStatus('critical', 9); // 90% of 10-min window
    expect(late.status).toBe('periarrest');
    expect(late.urgency).toBe('extreme');
  });

  it('caps percentDeteriorated at 100 and floors timeRemaining at 0', () => {
    const overdue = getDeteriorationStatus('critical', 60);
    expect(overdue.percentDeteriorated).toBe(100);
    expect(overdue.timeRemaining).toBe(0);
  });
});

describe('getReassessmentInterval', () => {
  it('shortens the interval as severity rises', () => {
    expect(getReassessmentInterval('stable')).toBe(15);
    expect(getReassessmentInterval('moderate')).toBe(10);
    expect(getReassessmentInterval('severe')).toBe(5);
    expect(getReassessmentInterval('critical')).toBe(2);
    expect(getReassessmentInterval('periarrest')).toBe(1);
  });
});

describe('determineSeverity', () => {
  it('detects peri-arrest from extreme vitals', () => {
    expect(determineSeverity('medical', baseVitals({ pulse: 30 }))).toBe('periarrest');
    expect(determineSeverity('medical', baseVitals({ pulse: 80, spo2: 75, gcs: 15 }))).toBe('periarrest');
  });

  it('detects critical from moderately deranged vitals', () => {
    expect(determineSeverity('medical', baseVitals({ pulse: 80, spo2: 85, gcs: 15 }))).toBe('critical');
    expect(determineSeverity('trauma', baseVitals({ pulse: 80, spo2: 98, gcs: 15 }))).toBe('critical');
  });

  it('classifies normal vitals in a benign category as stable', () => {
    expect(determineSeverity('medical', baseVitals({ pulse: 75, spo2: 98, gcs: 15 }))).toBe('stable');
  });
});

describe('DETERIORATION_PROFILES — data invariants', () => {
  it('every profile has sane rate bounds', () => {
    for (const profile of Object.values(DETERIORATION_PROFILES)) {
      expect(profile.timeToDeath).toBeGreaterThan(0);
      for (const rate of profile.rates) {
        expect(rate.minValue).toBeLessThanOrEqual(rate.maxValue);
        if (rate.vitalSign === 'spo2') expect(rate.maxValue).toBeLessThanOrEqual(100);
        if (rate.vitalSign === 'gcs') {
          expect(rate.minValue).toBeGreaterThanOrEqual(3);
          expect(rate.maxValue).toBeLessThanOrEqual(15);
        }
        if (rate.vitalSign === 'pulse') expect(rate.minValue).toBeGreaterThan(0);
      }
    }
  });
});
