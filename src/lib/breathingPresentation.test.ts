import { describe, expect, it } from 'vitest';
import { breathingEffortImproved, getBreathingPattern, liveBreathingDepth } from './breathingPresentation';
import type { CaseScenario } from '@/types';

describe('live respiratory appearance', () => {
  const initial = { respiration: 32, spo2: 88 };
  const caseData = { vitalSignsProgression: { initial }, title: 'Respiratory assessment' } as CaseScenario;
  it('does not label slow hypoxic breathing as tachypnoea', () => {
    expect(getBreathingPattern(caseData, { respiration: 6, spo2: 75 }).label).toBe('Slow / shallow');
  });
  it('does not infer respiratory rate from oxygen saturation', () => {
    const pattern = getBreathingPattern(caseData, { respiration: 16, spo2: 86 });
    expect(pattern.rate).toBe(16);
    expect(pattern.label).not.toBe('Tachypnoeic, laboured');
    expect(pattern.label).not.toBe('Effort easing');
  });
  it('does not treat improved colour on oxygen as resolved bronchospasm', () => {
    expect(breathingEffortImproved(initial, { respiration: 28, spo2: 98 })).toBe(false);
    expect(liveBreathingDepth('shallow', initial, { respiration: 28, spo2: 98 })).toBe(0.45);
  });
  it('lets chest excursion recover with a measured respiratory response', () => {
    expect(breathingEffortImproved(initial, { respiration: 22, spo2: 96 })).toBe(true);
    expect(liveBreathingDepth('shallow', initial, { respiration: 22, spo2: 96 })).toBe(1);
  });
  it('does not call fatigue, apnoea or missing measurements recovery', () => {
    for (const live of [{ respiration: 6, spo2: 98 }, { respiration: 0, spo2: 98 }, { spo2: 98 }, { respiration: 22, spo2: 88 }]) {
      expect(breathingEffortImproved(initial, live)).toBe(false);
    }
  });
});
