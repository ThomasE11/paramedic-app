import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({ useThree: vi.fn() }));
vi.mock('three', () => ({}));

import {
  getVoiceEnabledPreference,
  setVoiceEnabledPreference,
} from '@/hooks/useVoiceNarration';
import { bindAmbientAudioToVoicePreference } from './AmbientAudioLayer';

describe('ambient layer voice preference binding', () => {
  const original = getVoiceEnabledPreference();

  afterEach(() => {
    setVoiceEnabledPreference(original);
  });

  it('applies the current preference and reacts to same-tab mute changes', () => {
    setVoiceEnabledPreference(false);
    const setEnabled = vi.fn();
    const unsubscribe = bindAmbientAudioToVoicePreference({ setEnabled });

    expect(setEnabled).toHaveBeenLastCalledWith(false);

    setVoiceEnabledPreference(true);
    expect(setEnabled).toHaveBeenLastCalledWith(true);

    setVoiceEnabledPreference(false);
    expect(setEnabled).toHaveBeenLastCalledWith(false);

    unsubscribe();
  });
});
