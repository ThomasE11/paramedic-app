import { describe, expect, it } from 'vitest';
import { caseDatabase } from '@/data/cases';
import { additionalTraumaCases, additionalBurnsCases } from '@/data/additionalCases';
import { moreTraumaCases } from '@/data/enhancedCases';
import { inferInjuries, injuryWorldOffsetX } from './injuryMap';

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

describe('inferInjuries chest laterality and parasternal mapping', () => {
  it('places trauma-003 sucking chest wound on the left hemithorax', () => {
    const scenario = caseDatabase.find(item => item.id === 'trauma-003');
    expect(scenario).toBeDefined();
    const injuries = inferInjuries(scenario!);
    const chestWound = injuries.find(i => i.region === 'chest' && i.kind === 'wound');
    expect(chestWound).toMatchObject({ laterality: 'left' });
    expect(chestWound!.x).toBeGreaterThan(50);
    expect(injuryWorldOffsetX(chestWound!.laterality)).toBeGreaterThan(0);
  });

  it('maps trauma-004 left parasternal stab (no "chest" word in the clause) to a left chest wound', () => {
    const scenario = moreTraumaCases.find(item => item.id === 'trauma-004');
    expect(scenario).toBeDefined();
    const injuries = inferInjuries(scenario!);
    const chestWound = injuries.find(i => i.region === 'chest' && i.kind === 'wound');
    expect(chestWound).toBeDefined();
    expect(chestWound).toMatchObject({ laterality: 'left', kind: 'wound' });
    expect(chestWound!.x).toBeGreaterThan(50);
  });

  it('places trauma-005 flail segment on the right chest, not the midline', () => {
    const scenario = moreTraumaCases.find(item => item.id === 'trauma-005');
    expect(scenario).toBeDefined();
    const flail = inferInjuries(scenario!).find(i => i.kind === 'flail');
    expect(flail).toMatchObject({ region: 'chest', laterality: 'right' });
    expect(flail!.x).toBeLessThan(50);
    expect(injuryWorldOffsetX(flail!.laterality)).toBeLessThan(0);
  });

  it('lands burn-002 entry/exit burns on the named limbs instead of defaulting left', () => {
    const scenario = additionalBurnsCases.find(item => item.id === 'burn-002');
    expect(scenario).toBeDefined();
    const injuries = inferInjuries(scenario!);
    expect(injuries).toEqual(expect.arrayContaining([
      expect.objectContaining({ region: 'right-arm', kind: 'burn', laterality: 'right' }),
      expect.objectContaining({ region: 'left-leg', kind: 'burn', laterality: 'left' }),
    ]));
    expect(injuries.filter(i => i.kind === 'burn' && i.region === 'left-arm')).toHaveLength(0);
  });
});
