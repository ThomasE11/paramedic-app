import { describe, it, expect } from 'vitest';
import { phaseTransitionKey, sceneEntryOrigin, VILLA_DOORWAY } from './cinematicPhase';

describe('phaseTransitionKey', () => {
  it('crossfades briefing → scene → treat as distinct keys', () => {
    expect(phaseTransitionKey('prebriefing')).toBe('prebriefing');
    expect(phaseTransitionKey('scene-survey')).toBe('scene-survey');
    expect(phaseTransitionKey('vitals')).toBe('live-treatment');
    expect(phaseTransitionKey('prebriefing')).not.toBe(phaseTransitionKey('scene-survey'));
    expect(phaseTransitionKey('scene-survey')).not.toBe(phaseTransitionKey('vitals'));
  });

  it('keeps vitals and case on the same key so the monitor never remounts', () => {
    expect(phaseTransitionKey('vitals')).toBe(phaseTransitionKey('case'));
    expect(phaseTransitionKey('vitals')).toBe('live-treatment');
  });

  it('gives select and postcase their own keys', () => {
    expect(phaseTransitionKey('select')).toBe('select');
    expect(phaseTransitionKey('postcase')).toBe('postcase');
  });
});

describe('sceneEntryOrigin', () => {
  it('starts the villa dolly just outside the living-room front wall', () => {
    expect(sceneEntryOrigin('home')).toEqual(VILLA_DOORWAY);
    expect(VILLA_DOORWAY[2]).toBeGreaterThan(2);
  });

  it('leaves clinic / roadside / public on the short pull-back', () => {
    expect(sceneEntryOrigin('clinic')).toBeUndefined();
    expect(sceneEntryOrigin('roadside')).toBeUndefined();
    expect(sceneEntryOrigin('public')).toBeUndefined();
    expect(sceneEntryOrigin(undefined)).toBeUndefined();
  });
});
