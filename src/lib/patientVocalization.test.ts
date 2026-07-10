import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { canPatientVocalize } from './patientVocalization';

const mk = (over: Record<string, unknown>): CaseScenario => ({
  id: 'test-voc', title: 'T', category: 'general',
  sceneInfo: { description: '', environment: '', hazards: [] },
  dispatchInfo: { callReason: '', location: '', timeOfDay: '', callerInfo: '' },
  initialPresentation: { generalImpression: '', appearance: '', position: '', consciousness: 'Alert' },
  abcde: {
    airway: { patent: true, findings: [], interventions: [] },
    breathing: { rate: 16, findings: [], interventions: [], auscultation: [] },
    circulation: { findings: [], interventions: [] },
    disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: '', findings: [], interventions: [] },
    exposure: { findings: [] },
  },
  vitalSignsProgression: { initial: { bp: '120/80', pulse: 80, respiration: 16, spo2: 98, gcs: 15 } },
  ...over,
} as unknown as CaseScenario);

describe('canPatientVocalize', () => {
  it('an alert patient talks', () => {
    expect(canPatientVocalize(mk({}))).toBe(true);
  });

  it('an ACTIVELY SEIZING patient does not talk — even with GCS above 8', () => {
    const seizing = mk({
      initialPresentation: {
        generalImpression: 'Adult convulsing on the floor',
        appearance: 'Rhythmic jerking movements of all limbs',
        position: 'Supine', consciousness: 'Unresponsive during seizure',
      },
      abcde: {
        airway: { patent: true, findings: [], interventions: [] },
        breathing: { rate: 16, findings: [], interventions: [], auscultation: [] },
        circulation: { findings: [], interventions: [] },
        disability: { avpu: 'P', gcs: { eye: 1, verbal: 2, motor: 4, total: 9 }, pupils: '', findings: [], interventions: [] },
        exposure: { findings: [] },
      },
    });
    expect(canPatientVocalize(seizing)).toBe(false);
  });

  it('a post-ictal patient still mumbles (talking allowed)', () => {
    const postictal = mk({
      initialPresentation: {
        generalImpression: 'Young female, post-ictal, confused',
        appearance: 'Drowsy, bitten tongue, twitching', position: 'Recovery position',
        consciousness: 'Post-ictal confusion',
      },
    });
    expect(canPatientVocalize(postictal)).toBe(true);
  });

  it('arrest / GCS 8 / apnoea stay silent', () => {
    expect(canPatientVocalize(mk({ abcde: { airway: { patent: false, findings: [], interventions: [] }, breathing: { rate: 0, findings: [], interventions: [], auscultation: [] }, circulation: { findings: [], interventions: [] }, disability: { avpu: 'U', gcs: { eye: 1, verbal: 1, motor: 1, total: 3 }, pupils: '', findings: [], interventions: [] }, exposure: { findings: [] } } }))).toBe(false);
  });
});
