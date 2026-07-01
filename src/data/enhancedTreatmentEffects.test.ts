import { describe, it, expect } from 'vitest';
import type { VitalSigns } from '@/types';
import {
  TREATMENTS,
  ONSET_TIMES,
  getTreatmentsByCategory,
  getTreatmentCategories,
  calculateTreatmentProgress,
  applyTreatmentEffectGradual,
  type Treatment,
  type TreatmentApplication,
} from './enhancedTreatmentEffects';

const VALID_VITAL_KEYS: (keyof VitalSigns)[] = [
  'bp', 'pulse', 'respiration', 'spo2', 'temperature', 'gcs', 'bloodGlucose', 'etco2', 'painScore',
];
const VALID_CATEGORIES = [
  'airway', 'breathing', 'circulation', 'medication', 'procedure', 'comfort', 'positioning', 'psychological',
];

const findTreatment = (id: string): Treatment => {
  const t = TREATMENTS.find(t => t.id === id);
  if (!t) throw new Error(`treatment ${id} missing from TREATMENTS`);
  return t;
};

describe('TREATMENTS — data-shape invariants', () => {
  it('is a non-trivial database with unique ids', () => {
    expect(TREATMENTS.length).toBeGreaterThan(50);
    const ids = TREATMENTS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every treatment has id, name, valid category and a known onset', () => {
    for (const t of TREATMENTS) {
      expect(t.id, `id missing on ${t.name}`).toBeTruthy();
      expect(t.name, `name missing on ${t.id}`).toBeTruthy();
      expect(VALID_CATEGORIES, `bad category on ${t.id}`).toContain(t.category);
      expect(Object.keys(ONSET_TIMES), `bad onset on ${t.id}`).toContain(t.onset);
      expect(t.onsetTimeSeconds, `negative onset on ${t.id}`).toBeGreaterThanOrEqual(0);
      expect(t.durationSeconds, `non-positive duration on ${t.id}`).toBeGreaterThan(0);
    }
  });

  // FIXED BUG: several treatments (chest seals, rsi_intubation) declare
  // durationSeconds shorter than onsetTimeSeconds; the progress math used to
  // produce a negative window that clamped progress to 0 FOREVER (a sealed
  // sucking chest wound had zero effect). calculateTreatmentProgress now
  // treats duration <= onset as "instant full effect once onset passes".
  it('treatments with duration <= onset reach full effect right after onset', () => {
    const brokenWindow = TREATMENTS.filter(t => t.durationSeconds <= t.onsetTimeSeconds);
    expect(brokenWindow.length, 'expected the known instant-at-onset treatments').toBeGreaterThan(0);
    for (const t of brokenWindow) {
      const application = { treatment: t, startTime: 0 } as TreatmentApplication;
      // 1s past onset → full effect, not the old permanent 0
      expect(calculateTreatmentProgress(application, (t.onsetTimeSeconds + 1) * 1000),
        `${t.id} never applies its effect`).toBe(1);
      // still 0 before onset
      expect(calculateTreatmentProgress(application, Math.max(0, t.onsetTimeSeconds - 1) * 1000)).toBe(0);
    }
  });

  it('every effect targets a real VitalSigns key with physiologic caps', () => {
    for (const t of TREATMENTS) {
      for (const e of t.effects) {
        expect(VALID_VITAL_KEYS, `bad vitalSign "${String(e.vitalSign)}" on ${t.id}`).toContain(e.vitalSign);
        if (e.vitalSign === 'spo2' && e.maxValue !== undefined) {
          expect(e.maxValue, `SpO2 cap > 100 on ${t.id}`).toBeLessThanOrEqual(100);
        }
        if (e.vitalSign === 'gcs' && e.maxValue !== undefined) {
          expect(e.maxValue, `GCS cap > 15 on ${t.id}`).toBeLessThanOrEqual(15);
        }
        if (e.vitalSign === 'painScore' && e.maxValue !== undefined) {
          expect(e.maxValue, `pain cap > 10 on ${t.id}`).toBeLessThanOrEqual(10);
        }
      }
    }
  });
});

describe('category helpers', () => {
  it('getTreatmentsByCategory returns only that category', () => {
    const breathing = getTreatmentsByCategory('breathing');
    expect(breathing.length).toBeGreaterThan(0);
    expect(breathing.every(t => t.category === 'breathing')).toBe(true);
    expect(breathing.some(t => t.id === 'oxygen_nonrebreather')).toBe(true);
  });

  it('getTreatmentCategories counts partition the whole database', () => {
    const cats = getTreatmentCategories();
    expect(cats.map(c => c.category).sort()).toEqual([...VALID_CATEGORIES].sort());
    const total = cats.reduce((sum, c) => sum + c.count, 0);
    expect(total).toBe(TREATMENTS.length);
  });
});

describe('calculateTreatmentProgress', () => {
  const makeApplication = (treatment: Treatment, startTime: number): TreatmentApplication => ({
    treatment, startTime, progress: 0, currentEffects: {}, isComplete: false,
  });

  it('is 0 before onset, 1 at/after full duration, in [0,1] midway', () => {
    const oxygen = findTreatment('oxygen_nonrebreather'); // onset 10s, duration 60s
    const start = 1_000_000;
    const app = makeApplication(oxygen, start);
    expect(calculateTreatmentProgress(app, start + 5_000)).toBe(0);
    expect(calculateTreatmentProgress(app, start + 60_000)).toBe(1);
    expect(calculateTreatmentProgress(app, start + 600_000)).toBe(1);
    const mid = calculateTreatmentProgress(app, start + 35_000);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
});

describe('applyTreatmentEffectGradual', () => {
  const hypoxic: VitalSigns = {
    bp: '120/80', pulse: 110, respiration: 24, spo2: 85, temperature: 36.5, gcs: 15, bloodGlucose: 5.5,
  };

  it('oxygen at full progress raises SpO2 up to (not beyond) the treatment cap', () => {
    const oxygen = findTreatment('oxygen_nonrebreather');
    const { vitals: after, hasChanges } = applyTreatmentEffectGradual(oxygen, hypoxic, 1);
    expect(after.spo2).toBeGreaterThan(85);
    expect(after.spo2).toBeLessThanOrEqual(98); // effect maxValue
    expect(hasChanges).toBe(true);
  });

  it('partial progress produces a smaller effect than full progress', () => {
    const oxygen = findTreatment('oxygen_nonrebreather');
    const half = applyTreatmentEffectGradual(oxygen, hypoxic, 0.5).vitals.spo2;
    const full = applyTreatmentEffectGradual(oxygen, hypoxic, 1).vitals.spo2;
    expect(half).toBeGreaterThan(85);
    expect(half).toBeLessThan(full);
  });

  it('does not mutate the input vitals object', () => {
    const oxygen = findTreatment('oxygen_nonrebreather');
    const input = { ...hypoxic };
    applyTreatmentEffectGradual(oxygen, input, 1);
    expect(input).toEqual(hypoxic);
  });

  // FIXED BUG: an 'increase' effect with a maxValue used to CLAMP SpO2 DOWN
  // when the patient was already above the cap (SpO2 99 + O2 cap 98 → 98).
  // The gradual applier now floors at the current value, matching the guard
  // in dynamicTreatmentEngine's spo2 path.
  it('oxygen never lowers SpO2 when patient is already above the cap', () => {
    const oxygen = findTreatment('oxygen_nonrebreather');
    const saturated = { ...hypoxic, spo2: 99 };
    const { vitals: after } = applyTreatmentEffectGradual(oxygen, saturated, 1);
    expect(after.spo2).toBeGreaterThanOrEqual(99);
  });
});
