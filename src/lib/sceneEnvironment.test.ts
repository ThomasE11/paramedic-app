import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { classifySceneEnvironment } from './sceneEnvironment';

const place = (over: {
  environment?: string;
  description?: string;
  location?: string;
  position?: string;
}): CaseScenario =>
  ({
    sceneInfo: { description: over.description ?? '', environment: over.environment ?? '', hazards: [] },
    dispatchInfo: { callReason: 'Patient unwell', location: over.location ?? '', timeOfDay: 'day', callerInfo: '' },
    initialPresentation: { position: over.position ?? '' },
  }) as unknown as CaseScenario;

describe('classifySceneEnvironment', () => {
  it('maps real library phrasings to the right sets', () => {
    expect(classifySceneEnvironment(place({ location: 'Apartment in Dubai Marina' }))).toBe('home-living');
    expect(classifySceneEnvironment(place({ location: 'Villa in Al Ain' }))).toBe('home-living');
    expect(classifySceneEnvironment(place({ environment: 'small bathroom, rug bunched up' }))).toBe('bathroom');
    expect(classifySceneEnvironment(place({ environment: 'normal bedroom' }))).toBe('home-bedroom');
    expect(classifySceneEnvironment(place({ location: 'Hotel room, Dubai Marina' }))).toBe('home-bedroom');
    expect(classifySceneEnvironment(place({ location: 'Office in Downtown Dubai' }))).toBe('office');
    expect(classifySceneEnvironment(place({ location: 'Restaurant in a Dubai Mall' }))).toBe('restaurant');
    expect(classifySceneEnvironment(place({ location: 'Supermarket in Dubai' }))).toBe('restaurant');
    expect(classifySceneEnvironment(place({ location: 'Sheikh Zayed Road, Dubai' }))).toBe('street');
    expect(classifySceneEnvironment(place({ environment: 'hot weather, asphalt surface' }))).toBe('street');
    expect(classifySceneEnvironment(place({ location: 'Construction site, Dubai' }))).toBe('industrial');
    expect(classifySceneEnvironment(place({ location: 'Industrial area in Jebel Ali, Dubai' }))).toBe('industrial');
    expect(classifySceneEnvironment(place({ environment: 'smoke-filled, hot, chaotic' }))).toBe('industrial');
    expect(classifySceneEnvironment(place({ location: 'Farm in Al Awir, Dubai', environment: 'outdoor farm, hot sun' }))).toBe('outdoor-heat');
    expect(classifySceneEnvironment(place({ location: 'Retirement home in Dubai' }))).toBe('home-bedroom');
  });

  it('the specific beats the generic when both appear', () => {
    expect(classifySceneEnvironment(place({ description: 'Cramped bathroom in an apartment', location: 'Apartment in Sharjah' }))).toBe('bathroom');
    expect(classifySceneEnvironment(place({ description: 'Bedroom of a villa', location: 'Villa in Jumeirah' }))).toBe('home-bedroom');
  });

  it('falls back to the ambulance bay when no place is described', () => {
    expect(classifySceneEnvironment(place({}))).toBe('ambulance-bay');
    expect(classifySceneEnvironment(place({ location: 'Dubai' }))).toBe('ambulance-bay');
  });

  it('reads position when scene fields are bare', () => {
    expect(classifySceneEnvironment(place({ location: 'Deira, Dubai', position: 'Found in bed by family' }))).toBe('home-bedroom');
  });
});
