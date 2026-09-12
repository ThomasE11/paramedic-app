import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getVoiceEnabledPreference,
  setVoiceEnabledPreference,
  subscribeVoiceEnabledPreference,
} from './useVoiceNarration';

describe('shared voice enabled preference', () => {
  const original = getVoiceEnabledPreference();

  afterEach(() => {
    setVoiceEnabledPreference(original);
  });

  it('publishes same-tab changes to every hook subscriber immediately', () => {
    const header = vi.fn();
    const patient = vi.fn();
    const unsubscribeHeader = subscribeVoiceEnabledPreference(header);
    const unsubscribePatient = subscribeVoiceEnabledPreference(patient);

    setVoiceEnabledPreference(false);

    expect(getVoiceEnabledPreference()).toBe(false);
    expect(header).toHaveBeenLastCalledWith(false);
    expect(patient).toHaveBeenLastCalledWith(false);

    unsubscribeHeader();
    unsubscribePatient();
  });

  it('uses the latest shared value rather than a stale per-instance snapshot', () => {
    setVoiceEnabledPreference(false);
    expect(getVoiceEnabledPreference()).toBe(false);

    setVoiceEnabledPreference(true);
    expect(getVoiceEnabledPreference()).toBe(true);
  });
});
