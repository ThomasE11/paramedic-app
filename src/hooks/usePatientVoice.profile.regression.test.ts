import { describe, expect, it } from 'vitest';

import { patientVoiceProfileForCase } from './usePatientVoice';

describe('case-scoped patient voice profile', () => {
  it('uses a male voice only for the resp-001 realism slice', () => {
    expect(patientVoiceProfileForCase('resp-001')).toEqual({ gender: 'male' });
    expect(patientVoiceProfileForCase('resp-002')).toBeUndefined();
    expect(patientVoiceProfileForCase('card-001')).toBeUndefined();
  });
});
