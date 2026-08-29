import { describe, expect, it } from 'vitest';
import { caseDatabase } from '@/data/cases';
import { additionalTraumaCases } from '@/data/additionalCases';
import { inferInjuries } from './injuryMap';

describe('inferInjuries post-operative infection realism', () => {
  it('turns the authored postd-001 incision and infection signs into a visible abdominal wound', () => {
    const scenario = caseDatabase.find(item => item.id === 'postd-001');
    expect(scenario).toBeDefined();

    const injuries = inferInjuries(scenario!);
    expect(injuries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        region: 'abdomen',
        kind: 'wound',
        label: 'Infected surgical wound',
        detail: expect.stringMatching(/erythema|purulent/i),
      }),
    ]));
  });

  it('anchors a right-hand amputation and its bleeding to the right arm', () => {
    const scenario = additionalTraumaCases.find(item => item.id === 'trauma-011');
    expect(scenario).toBeDefined();

    const injuries = inferInjuries(scenario!);
    expect(injuries).toEqual(expect.arrayContaining([
      expect.objectContaining({ region: 'right-arm', kind: 'amputation' }),
      expect.objectContaining({ region: 'right-arm', kind: 'bleeding' }),
    ]));
    expect(injuries).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ region: 'left-arm', kind: 'amputation' }),
    ]));
  });
});
