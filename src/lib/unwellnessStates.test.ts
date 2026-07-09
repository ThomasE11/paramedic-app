import { describe, it, expect } from 'vitest';
import {
  deriveUnwellness,
  collectUnwellnessText,
  parseSystolic,
  shockIndex,
  type UnwellnessState,
} from './unwellnessStates';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Well-perfused adult baseline — nothing should trip. */
const HEALTHY = { bp: '120/80', pulse: 72, respiration: 14, spo2: 98, bloodGlucose: 5.5 };

const derive = (
  vitals?: Record<string, unknown> | null,
  caseText = '',
  previous: UnwellnessState | null = null,
) => deriveUnwellness({ vitals: vitals as never, caseText, previous });

describe('parseSystolic', () => {
  it('parses "120/80" and "120/80 mmHg" and bare numbers', () => {
    expect(parseSystolic('120/80')).toBe(120);
    expect(parseSystolic('90/60 mmHg')).toBe(90);
    expect(parseSystolic('75')).toBe(75);
    expect(parseSystolic(110)).toBe(110);
    expect(parseSystolic(undefined)).toBeNull();
    expect(parseSystolic('')).toBeNull();
  });
});

describe('shockIndex', () => {
  it('computes pulse/systolic and guards missing/zero inputs', () => {
    expect(shockIndex({ bp: '100/70', pulse: 120 })).toBeCloseTo(1.2, 5);
    expect(shockIndex({ bp: '0/0', pulse: 120 })).toBeNull();
    expect(shockIndex({ bp: '120/80' })).toBeNull();
    expect(shockIndex(null)).toBeNull();
  });
});

describe('deriveUnwellness — baseline', () => {
  it('a well-perfused patient shows no unwellness states', () => {
    expect(derive(HEALTHY)).toEqual({ diaphoresis: 0, jaundice: 0, mottling: 0, angioedema: 0, urticaria: 0 });
  });

  it('missing vitals and empty text derive an all-clear state', () => {
    expect(derive(null, '')).toEqual({ diaphoresis: 0, jaundice: 0, mottling: 0, angioedema: 0, urticaria: 0 });
  });
});

describe('deriveUnwellness — diaphoresis drivers', () => {
  it('shock index > 0.9 ramps sweat (HR 110 / systolic 100 = 1.1)', () => {
    const s = derive({ bp: '100/70', pulse: 110, respiration: 16, spo2: 97 });
    expect(s.diaphoresis).toBeGreaterThan(0.3);
    expect(s.diaphoresis).toBeLessThanOrEqual(1);
    // Just under the shock-index threshold stays dry.
    expect(derive({ bp: '120/80', pulse: 100 }).diaphoresis).toBe(0);
  });

  it('BGL < 4 mmol/L drives clammy sweat, lower glucose = wetter', () => {
    const mild = derive({ bp: '120/80', pulse: 72, bloodGlucose: 3.9 });
    const severe = derive({ bp: '120/80', pulse: 72, bloodGlucose: 1.8 });
    expect(mild.diaphoresis).toBeGreaterThan(0);
    expect(severe.diaphoresis).toBeGreaterThan(mild.diaphoresis);
    // BGL exactly 4.0 is not hypoglycaemic → dry.
    expect(derive({ bp: '120/80', pulse: 72, bloodGlucose: 4.0 }).diaphoresis).toBe(0);
  });

  it('severe respiratory distress (RR>28 AND SpO2<92) drives sweat', () => {
    expect(derive({ bp: '120/80', pulse: 72, respiration: 32, spo2: 88 }).diaphoresis).toBeGreaterThanOrEqual(0.6);
    // High RR alone with adequate sats does NOT (no distress sweat).
    expect(derive({ bp: '120/80', pulse: 72, respiration: 32, spo2: 96 }).diaphoresis).toBe(0);
  });

  it('appearance text (/diaphore|sweat|clammy/i) drives sweat with well vitals', () => {
    expect(derive(HEALTHY, 'pale, profuse sweating, trembling').diaphoresis).toBeGreaterThan(0.5);
    expect(derive(HEALTHY, 'diaphoretic and confused').diaphoresis).toBeGreaterThan(0.5);
    expect(derive(HEALTHY, 'warm and dry, comfortable').diaphoresis).toBe(0);
  });

  it('diaphoresis never exceeds 1 even with stacked drivers', () => {
    const s = derive({ bp: '60/30', pulse: 140, respiration: 34, spo2: 84, bloodGlucose: 1.0 }, 'drenched in sweat');
    expect(s.diaphoresis).toBe(1);
  });
});

describe('deriveUnwellness — jaundice', () => {
  it('is text-driven and constant (not vitals)', () => {
    expect(derive(HEALTHY, 'scleral icterus, RUQ tenderness').jaundice).toBe(1);
    expect(derive(HEALTHY, 'jaundiced, tender liver edge').jaundice).toBe(1);
    expect(derive(HEALTHY, 'yellow sclera noted').jaundice).toBe(1);
    // No hepatic language → no jaundice, regardless of how sick the vitals are.
    expect(derive({ bp: '60/30', pulse: 140, spo2: 80 }, 'crushing chest pain').jaundice).toBe(0);
  });
});

describe('deriveUnwellness — mottling hysteresis (late shock)', () => {
  it('latches ON at shock index >= 1.3', () => {
    // SI just under threshold — off.
    expect(derive({ bp: '100/70', pulse: 125 }).mottling).toBe(0); // 1.25
    // SI at threshold — on.
    expect(derive({ bp: '100/70', pulse: 130 }).mottling).toBe(1); // 1.3
  });

  it('latches ON at systolic <= 75 even with a modest heart rate', () => {
    expect(derive({ bp: '74/40', pulse: 90 }).mottling).toBe(1);
    expect(derive({ bp: '80/50', pulse: 90 }).mottling).toBe(0);
  });

  it('stays ON through the hysteresis band and only clears past recovery', () => {
    const mottled = { diaphoresis: 0, jaundice: 0, mottling: 1, angioedema: 0, urticaria: 0 } as const;
    // Recovered into the band (SI 1.2, systolic 80) — still on (hysteresis).
    expect(derive({ bp: '80/50', pulse: 96 }, '', mottled).mottling).toBe(1);
    // Recovered past BOTH off-bands (SI < 1.1 AND systolic > 85) — clears.
    expect(derive({ bp: '110/70', pulse: 100 }, '', mottled).mottling).toBe(0);
  });

  it('does not flap on for a transient dip once previously clear', () => {
    const clear = { diaphoresis: 0, jaundice: 0, mottling: 0, angioedema: 0, urticaria: 0 } as const;
    // SI 1.2 with normal-ish systolic — below the ON threshold, stays off.
    expect(derive({ bp: '95/60', pulse: 114 }, '', clear).mottling).toBe(0);
  });
});

describe('collectUnwellnessText', () => {
  it('gathers appearance + finding strings, lower-cased', () => {
    const text = collectUnwellnessText({
      initialPresentation: { generalImpression: 'Diaphoretic, confused', appearance: 'Pale, profuse sweating' },
      abcde: { circulation: { skin: 'Pale, diaphoretic', findings: ['Tachycardic'] } },
      expectedFindings: { keyObservations: ['Blood glucose 1.8 mmol/L'] },
    });
    expect(text).toContain('diaphoretic');
    expect(text).toContain('profuse sweating');
    expect(text).toBe(text.toLowerCase());
  });

  it('returns empty string for a null case', () => {
    expect(collectUnwellnessText(null)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Real case data — the hypoglycaemia case (cases.ts metab-001) must read as
// diaphoretic straight from its authored presentation + severe-hypo BGL.
// ---------------------------------------------------------------------------
describe('deriveUnwellness — real case shapes', () => {
  it('severe hypoglycaemia (metab-001) shows sweat, no mottling, no jaundice', () => {
    const caseText = collectUnwellnessText({
      initialPresentation: {
        generalImpression: 'Middle-aged male, diaphoretic, confused',
        appearance: 'Pale, profuse sweating, trembling',
      },
      abcde: { circulation: { skin: 'Pale, diaphoretic' } },
    });
    const s = derive({ bp: '130/80', pulse: 95, respiration: 18, spo2: 98, bloodGlucose: 1.8 }, caseText);
    expect(s.diaphoresis).toBeGreaterThan(0.6); // text + severe hypo
    expect(s.jaundice).toBe(0);
    expect(s.mottling).toBe(0); // BP is maintained early — not late shock yet
  });

  it('decompensating anaphylaxis (resp-010, BP 65/30) crosses into mottling', () => {
    const s = derive({ bp: '65/30', pulse: 140, respiration: 36, spo2: 82 }, 'drenched in sweat, cyanotic lips');
    expect(s.mottling).toBe(1); // systolic 65 <= 75 and SI ~2.15
    expect(s.diaphoresis).toBe(1);
  });
});

describe('angioedema (anaphylaxis facial/lip swelling — finding_angioedema driver)', () => {
  const derive = (caseText: string) =>
    deriveUnwellness({ vitals: { bp: '110/70', pulse: 100, respiration: 20, spo2: 95 }, caseText });

  it('fires on the classic anaphylaxis phrasings', () => {
    expect(derive('marked angioedema of the face').angioedema).toBe(1);
    expect(derive('angio-oedema with stridor').angioedema).toBe(1);
    expect(derive('swollen lips and tongue, audible wheeze').angioedema).toBe(1);
    expect(derive('significant lip swelling after eating prawns').angioedema).toBe(1);
    expect(derive('facial swelling and widespread urticaria').angioedema).toBe(1);
    expect(derive('tongue swollen, drooling').angioedema).toBe(1);
  });

  it('stays off for unrelated presentations', () => {
    expect(derive('crushing central chest pain, diaphoretic').angioedema).toBe(0);
    expect(derive('ankle swelling after a fall').angioedema).toBe(0);
    expect(derive('').angioedema).toBe(0);
  });

  it('is constant like jaundice — vitals do not drive it', () => {
    const s = deriveUnwellness({ vitals: { bp: '60/30', pulse: 150 }, caseText: 'no facial features of note' });
    expect(s.angioedema).toBe(0);
  });
});

describe('angioedema — real authored case (end-to-end derivation guard)', () => {
  it('y1-015 (anaphylaxis, prawns) fires angioedema from its shipped text', async () => {
    const { firstYearCases } = await import('@/data/firstYearCases');
    const c = firstYearCases.find(x => x.id === 'y1-015');
    expect(c).toBeDefined();
    const text = collectUnwellnessText(c as never);
    const s = deriveUnwellness({ vitals: c!.vitalSignsProgression?.initial, caseText: text });
    expect(s.angioedema).toBe(1); // "swollen lips and eyes" / airway "Swollen lips and tongue"
  });
});

describe('urticaria (anaphylaxis rash — UrticariaLayer driver)', () => {
  const derive = (caseText: string) =>
    deriveUnwellness({ vitals: { bp: '110/70', pulse: 100, respiration: 20, spo2: 95 }, caseText });

  it('fires on urticarial phrasings', () => {
    expect(derive('widespread urticaria on the trunk').urticaria).toBe(1);
    expect(derive('urticarial rash and facial swelling').urticaria).toBe(1);
    expect(derive('covered in hives after the sting').urticaria).toBe(1);
    expect(derive('raised red welts on arms and torso').urticaria).toBe(1);
    expect(derive('multiple wheals across the chest').urticaria).toBe(1);
  });

  it('stays OFF for non-urticarial rashes (conservative — no false wheals)', () => {
    expect(derive('petechial rash, non-blanching').urticaria).toBe(0);
    expect(derive('maculopapular rash on the trunk').urticaria).toBe(0);
    expect(derive('nappy rash noted').urticaria).toBe(0);
    expect(derive('crushing chest pain, diaphoretic').urticaria).toBe(0);
    expect(derive('').urticaria).toBe(0);
  });

  it('real case y1-015 (prawns anaphylaxis) fires urticaria from shipped text', async () => {
    const { firstYearCases } = await import('@/data/firstYearCases');
    const c = firstYearCases.find(x => x.id === 'y1-015');
    const text = collectUnwellnessText(c as never);
    expect(deriveUnwellness({ vitals: c!.vitalSignsProgression?.initial, caseText: text }).urticaria).toBe(1);
  });
});
