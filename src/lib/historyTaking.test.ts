import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import {
  generateCollateralResponse,
  generatePatientResponse,
  sceneHasAskableBystander,
} from './historyTaking';

function fakeCase(overrides: Partial<CaseScenario> = {}): CaseScenario {
  return {
    history: {
      allergies: ['NKDA'],
      medications: [],
      medicalConditions: [],
      eventsLeading: 'Sudden shortness of breath twenty minutes ago while watching television.',
    },
    sceneInfo: { bystanders: 'Wife present and helpful' },
    dispatchInfo: { callReason: 'Severe shortness of breath' },
    ...overrides,
  } as unknown as CaseScenario;
}

describe('sceneHasAskableBystander', () => {
  it('treats named witnesses as askable', () => {
    expect(sceneHasAskableBystander(fakeCase())).toBe(true);
    expect(sceneHasAskableBystander(fakeCase({
      sceneInfo: { bystanders: 'Security guard who called ambulance' },
    } as Partial<CaseScenario>))).toBe(true);
  });

  it('rejects empty, missing and explicit none fields', () => {
    expect(sceneHasAskableBystander(fakeCase({
      sceneInfo: { bystanders: 'None' },
    } as Partial<CaseScenario>))).toBe(false);
    expect(sceneHasAskableBystander(fakeCase({
      sceneInfo: { bystanders: 'nobody on scene' },
    } as Partial<CaseScenario>))).toBe(false);
    expect(sceneHasAskableBystander({} as CaseScenario)).toBe(false);
  });
});

describe('generateCollateralResponse', () => {
  it('lets a named bystander answer even when the patient can still talk', () => {
    const answer = generateCollateralResponse(fakeCase(), 'events');
    expect(answer).toMatch(/His wife/i);
    expect(answer).toMatch(/Sudden shortness of breath/i);
  });

  it('refuses collateral when the scene is unattended', () => {
    const answer = generateCollateralResponse(fakeCase({
      sceneInfo: { bystanders: 'None' },
    } as Partial<CaseScenario>), 'events');
    expect(answer).toMatch(/no-one here/i);
  });
});

describe('generatePatientResponse', () => {
  it('fragments speech when the patient is breathless', () => {
    const answer = generatePatientResponse(fakeCase(), 'introduction', {
      severity: 'severe',
      altered: false,
      breathless: true,
    });
    expect(answer).toMatch(/\.\.\./);
    expect(answer?.toLowerCase()).toMatch(/can't|breath/);
  });

  it('keeps a full greeting when the patient can talk', () => {
    const answer = generatePatientResponse(fakeCase(), 'introduction', {
      severity: 'mild',
      altered: false,
      breathless: false,
    });
    expect(answer).toMatch(/hello|hi|thank/i);
    expect(answer).not.toMatch(/can't\.\.\. talk/i);
  });

  it('fragments OPQRST severity when breathless (severe asthma)', () => {
    const answer = generatePatientResponse(fakeCase({
      vitalSignsProgression: {
        initial: { bp: '120/80', pulse: 100, respiration: 32, spo2: 88, gcs: 14, painScore: 8 },
      },
    } as Partial<CaseScenario>), 'opqrst-severity', {
      severity: 'severe',
      altered: false,
      breathless: true,
    });
    expect(answer).toMatch(/\.\.\./);
    expect(answer?.toLowerCase()).toMatch(/can't|breath|out of 10|nine|eight/);
  });

  it('does not invent a pain score for severe asthma with no authored pain', () => {
    const answer = generatePatientResponse(fakeCase({
      expectedFindings: { mostLikelyDiagnosis: 'Life-threatening asthma' },
      vitalSignsProgression: {
        initial: { bp: '130/80', pulse: 120, respiration: 32, spo2: 88, gcs: 14 },
      },
    } as Partial<CaseScenario>), 'opqrst-severity', {
      severity: 'severe',
      altered: false,
      breathless: true,
    });

    expect(answer).toMatch(/no pain/i);
    expect(answer).toMatch(/\.\.\./);
    expect(answer).not.toMatch(/eight|nine|\b[2-9]\s*out of 10/i);
  });
});
