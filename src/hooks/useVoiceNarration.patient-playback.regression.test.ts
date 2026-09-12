import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  derivePlaybackSignals,
  mouthTargetForPlayback,
  playAudioWithRetry,
  resolveSupertonicVoice,
  voicePriorityForRole,
} from './useVoiceNarration';

describe('patient-only audible playback state', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps synthesis/loading busy without claiming that the patient is audible', () => {
    expect(derivePlaybackSignals('loading', 'patient')).toEqual({
      busy: true,
      audiblePatient: false,
    });
    expect(mouthTargetForPlayback('loading', 'patient', 'web-speech', 0.25, 0.5)).toBe(0);
  });

  it('does not animate the patient for dispatcher or narrator speech', () => {
    expect(derivePlaybackSignals('speaking', 'dispatcher').audiblePatient).toBe(false);
    expect(mouthTargetForPlayback('speaking', 'narrator', 'web-speech', 0.25, 0.5)).toBe(0);
  });

  it('uses real cloud audio energy and never fabricates syllables for silence', () => {
    expect(mouthTargetForPlayback('speaking', 'patient', 'analysed-audio', 0.25, 0)).toBe(0);
    expect(mouthTargetForPlayback('speaking', 'patient', 'analysed-audio', 0.25, 0.1)).toBeCloseTo(0.55);
  });

  it('limits the approximate envelope to audible Web Speech patient playback', () => {
    expect(mouthTargetForPlayback('speaking', 'patient', 'web-speech', 0.25, 0)).toBeGreaterThan(0);
    expect(mouthTargetForPlayback('error', 'patient', 'web-speech', 0.25, 0)).toBe(0);
  });

  it('returns an error after both media play attempts reject', async () => {
    vi.useFakeTimers();
    const audio = {
      play: vi.fn().mockRejectedValue(new Error('autoplay blocked')),
    } as unknown as HTMLAudioElement;

    const result = playAudioWithRetry(audio, () => true);
    await vi.advanceTimersByTimeAsync(120);

    await expect(result).resolves.toBe('error');
    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(derivePlaybackSignals('error', 'patient').busy).toBe(false);
  });

  it('does not retry a rejected play after the narration session is cancelled', async () => {
    vi.useFakeTimers();
    let current = true;
    const audio = {
      play: vi.fn().mockRejectedValue(new Error('autoplay blocked')),
    } as unknown as HTMLAudioElement;

    const result = playAudioWithRetry(audio, () => current);
    await Promise.resolve();
    current = false;
    await vi.advanceTimersByTimeAsync(120);

    await expect(result).resolves.toBe('cancelled');
    expect(audio.play).toHaveBeenCalledTimes(1);
  });

  it('selects a male Supertonic profile without changing the patient role default', () => {
    expect(resolveSupertonicVoice('patient')).toBe('F1');
    expect(resolveSupertonicVoice('patient', { gender: 'male' })).toBe('M1');
    expect(voicePriorityForRole('patient')[0]).toContain('Samantha');
    expect(voicePriorityForRole('patient', { gender: 'male' })[0]).toContain('Daniel');
  });
});
