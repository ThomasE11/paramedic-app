import { describe, it, expect } from 'vitest';
import { classifyAbcde, getAbcdeMeta, ABCDE_META, type AbcdeChannel } from './abcdeClassifier';

describe('classifyAbcde — keyword classification', () => {
  it('maps airway actions to A', () => {
    expect(classifyAbcde('Perform jaw thrust to maintain airway patency')).toBe('A');
    expect(classifyAbcde('Insert oropharyngeal (OPA) adjunct')).toBe('A');
    expect(classifyAbcde('Suction the airway to clear secretions')).toBe('A');
  });

  it('maps breathing / oxygenation actions to B', () => {
    expect(classifyAbcde('Auscultate breath sounds bilaterally')).toBe('B');
    expect(classifyAbcde('Ventilate with BVM at 10 breaths per minute')).toBe('B');
    expect(classifyAbcde('Monitor SpO2 continuously')).toBe('B');
  });

  it('maps circulation actions to C', () => {
    expect(classifyAbcde('Obtain 12-lead ECG')).toBe('C');
    expect(classifyAbcde('Start chest compressions (CPR)')).toBe('C');
    expect(classifyAbcde('Establish IV access and give a fluid bolus')).toBe('C');
  });

  it('maps disability / neuro actions to D', () => {
    expect(classifyAbcde('Record GCS and check pupillary response')).toBe('D');
    expect(classifyAbcde('Check blood glucose (BGL)')).toBe('D');
  });

  it('maps exposure / environmental actions to E', () => {
    expect(classifyAbcde('Measure temperature and check the skin for rash')).toBe('E');
    expect(classifyAbcde('Log roll and inspect the posterior surfaces')).toBe('E');
  });

  it('returns null for empty or non-clinical input without crashing', () => {
    expect(classifyAbcde('')).toBeNull();
    expect(classifyAbcde('Handover to receiving hospital staff')).toBeNull();
  });

  it('trusts an explicit category tag over keyword sweep', () => {
    expect(classifyAbcde('some untagged free text', 'airway')).toBe('A');
    expect(classifyAbcde('some untagged free text', 'exposure')).toBe('E');
    // Unknown category falls through to keywords (here: none match)
    expect(classifyAbcde('some untagged free text', 'documentation')).toBeNull();
  });
});

describe('getAbcdeMeta / ABCDE_META', () => {
  it('returns full channel meta for a classified item', () => {
    const meta = getAbcdeMeta('Administer oxygen via non-rebreather mask');
    expect(meta).not.toBeNull();
    expect(meta!.channel).toBe('B');
    expect(meta!.label).toBe('Breathing');
  });

  it('returns null when the item is outside ABCDE territory', () => {
    expect(getAbcdeMeta('Complete the patient report form')).toBeNull();
  });

  it('has consistent meta for all five channels', () => {
    const channels: AbcdeChannel[] = ['A', 'B', 'C', 'D', 'E'];
    expect(Object.keys(ABCDE_META).sort()).toEqual(channels);
    for (const ch of channels) {
      const meta = ABCDE_META[ch];
      expect(meta.channel).toBe(ch);
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.railClass).toContain('border-l-');
    }
  });
});
