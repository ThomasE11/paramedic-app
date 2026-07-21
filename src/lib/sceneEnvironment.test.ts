import { describe, expect, it } from 'vitest';
import { deriveSceneEnvironment } from './sceneEnvironment';
import type { CaseScenario } from '@/types';

function fakeCase(location: string, description = ''): CaseScenario {
  return {
    dispatchInfo: { location, callReason: 'Emergency call' },
    sceneInfo: { description, environment: '' },
  } as unknown as CaseScenario;
}

describe('deriveSceneEnvironment', () => {
  it('maps domestic scenes to home', () => {
    expect(deriveSceneEnvironment(fakeCase('Private villa in Al Barsha, Dubai'))).toBe('home');
    expect(deriveSceneEnvironment(fakeCase('Apartment in Deira, Dubai'))).toBe('home');
    expect(deriveSceneEnvironment(fakeCase('Hotel room, Dubai Marina'))).toBe('home');
  });

  it('maps commercial/public scenes to public', () => {
    expect(deriveSceneEnvironment(fakeCase('Office in Downtown Dubai'))).toBe('public');
    expect(deriveSceneEnvironment(fakeCase('Dubai Mall food court'))).toBe('public');
  });

  it('maps outdoor scenes to roadside — and roadside wins over home', () => {
    expect(deriveSceneEnvironment(fakeCase('Sheikh Zayed Road, Dubai'))).toBe('roadside');
    expect(deriveSceneEnvironment(fakeCase('Construction site, Dubai'))).toBe('roadside');
    expect(deriveSceneEnvironment(fakeCase('Street in Deira, Dubai'))).toBe('roadside');
    expect(deriveSceneEnvironment(fakeCase('Villa in Jumeirah', 'RTA outside the villa gate'))).toBe('roadside');
  });

  it('falls back to clinic for ambiguous or missing scene info', () => {
    expect(deriveSceneEnvironment(fakeCase('Dubai Healthcare City'))).toBe('clinic');
    expect(deriveSceneEnvironment({} as CaseScenario)).toBe('clinic');
  });
});
