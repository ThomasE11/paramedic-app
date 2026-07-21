import { describe, it, expect } from 'vitest';
import {
  measureRhythm,
  normalSinusRhythm,
  atrialFibrillation,
  ventricularTachycardia,
  asystole,
  anteriorSTEMI,
  inferiorSTEMI,
  ALL_RHYTHMS,
  ALL_LEADS,
  type ECGRhythm,
} from './ecgRhythms';

describe('measureRhythm — intervals', () => {
  it('returns the rate it was asked for (NSR at 75)', () => {
    expect(measureRhythm(normalSinusRhythm, 75).rate).toBe(75);
  });

  it('computes a normal PR interval for NSR', () => {
    const pr = measureRhythm(normalSinusRhythm, 75).prIntervalMs;
    expect(pr).not.toBeNull();
    expect(pr!).toBeGreaterThanOrEqual(120);
    expect(pr!).toBeLessThanOrEqual(200);
  });

  it('computes a normal QRS duration for NSR', () => {
    const qrs = measureRhythm(normalSinusRhythm, 75).qrsDurationMs;
    expect(qrs).toBeGreaterThan(60);
    expect(qrs).toBeLessThan(120);
  });

  it('computes QTc via Bazett (QT/sqrt(RR)); at 75/min QTc > QT', () => {
    const m = measureRhythm(normalSinusRhythm, 75);
    // RR = 0.8s at 75/min → sqrt(0.8)=0.894 → QTc = QT/0.894 > QT
    const expected = Math.round(m.qtIntervalMs / Math.sqrt(60 / 75));
    expect(m.qtcMs).toBe(expected);
    expect(m.qtcMs).toBeGreaterThan(m.qtIntervalMs);
  });
});

describe('measureRhythm — axis', () => {
  it('NSR has a normal axis (roughly +30 to +75)', () => {
    const m = measureRhythm(normalSinusRhythm, 75);
    expect(m.axisLabel).toBe('Normal axis');
    expect(m.axisDegrees).toBeGreaterThanOrEqual(0);
    expect(m.axisDegrees).toBeLessThanOrEqual(90);
  });

  it('detects left axis deviation when I is upright and aVF is negative', () => {
    // Synthetic LAD: strong positive QRS in I, deeply negative in aVF.
    const qrsUp = (t: number) => (t > 0.15 && t < 0.25 ? 1 : 0);
    const qrsDown = (t: number) => (t > 0.15 && t < 0.25 ? -1 : 0);
    const flat = () => 0;
    const lad: ECGRhythm = {
      ...normalSinusRhythm,
      id: 'synthetic-lad',
      leads: {
        ...normalSinusRhythm.leads,
        I: qrsUp,
        aVF: qrsDown,
        II: flat, III: qrsDown,
      },
    };
    const m = measureRhythm(lad, 75);
    expect(m.axisLabel).toBe('Left axis deviation');
    expect(m.axisDegrees).toBeLessThan(-30);
  });
});

describe('measureRhythm — interpretation banners', () => {
  it('anterior STEMI interpretation includes an ACUTE MI banner', () => {
    const lines = measureRhythm(anteriorSTEMI, 100).interpretation.join(' ');
    expect(lines).toContain('ACUTE MI');
    expect(lines).toContain('ANTERIOR');
  });

  it('inferior STEMI interpretation names the inferior territory', () => {
    const lines = measureRhythm(inferiorSTEMI, 55).interpretation.join(' ');
    expect(lines).toContain('ACUTE MI');
    expect(lines).toContain('INFERIOR');
  });

  it('AFib reports no P waves and null PR', () => {
    const m = measureRhythm(atrialFibrillation, 90);
    expect(m.prIntervalMs).toBeNull();
    expect(m.interpretation.join(' ')).toContain('No P waves');
  });

  it('VT has a wide QRS (>120 ms)', () => {
    const m = measureRhythm(ventricularTachycardia, 180);
    expect(m.qrsDurationMs).toBeGreaterThan(120);
    expect(m.interpretation.join(' ')).toContain('wide');
  });

  it('asystole reports rate 0 and a flatline interpretation', () => {
    const m = measureRhythm(asystole, 0);
    expect(m.rate).toBe(0);
    expect(m.axisLabel).toBe('Indeterminate');
    expect(m.interpretation.join(' ')).toContain('ASYSTOLE');
  });
});

describe('waveform integrity across all rhythms', () => {
  it('every lead function stays within a sane amplitude range', () => {
    for (const rhythm of ALL_RHYTHMS) {
      for (const lead of ALL_LEADS) {
        const wfn = rhythm.leads[lead];
        for (let i = 0; i <= 20; i++) {
          const v = wfn(i / 20, { heartRate: 75, beatIndex: 0 });
          expect(Number.isFinite(v)).toBe(true);
          // Amplitudes are in mV-ish units; allow generous headroom for tall
          // hyperacute T / STEMI stacking but catch runaway values.
          expect(v).toBeGreaterThan(-2);
          expect(v).toBeLessThan(2);
        }
      }
    }
  });

  it('all 25+ rhythms define all 12 leads', () => {
    expect(ALL_RHYTHMS.length).toBeGreaterThanOrEqual(25);
    for (const rhythm of ALL_RHYTHMS) {
      for (const lead of ALL_LEADS) {
        expect(typeof rhythm.leads[lead]).toBe('function');
      }
    }
  });
});
