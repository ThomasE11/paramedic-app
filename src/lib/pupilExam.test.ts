import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import type { PatientVisualState } from '@/lib/patientVisualState';
import {
  applyVisualEyeEffect,
  describePupilFinding,
  getPupilProfile,
  nearestPupilExamAction,
} from './pupilExam';

function caseWithPupils(pupils: string | string[]): CaseScenario {
  return {
    abcde: {
      disability: { pupils },
    },
  } as CaseScenario;
}

const visual = (kind: PatientVisualState['eyeEffects']['kind'], detail = ''): PatientVisualState =>
  ({
    eyeEffects: { kind, detail },
  }) as PatientVisualState;

describe('getPupilProfile', () => {
  it('reads per-eye millimetres and reactivity from an array finding', () => {
    const profile = getPupilProfile(caseWithPupils([
      'Right dilated 6mm non-reactive',
      'Left 4mm sluggish',
    ]));

    expect(profile).toMatchObject({
      leftMm: 4,
      rightMm: 6,
      leftReaction: 'sluggish',
      rightReaction: 'fixed',
      abnormal: true,
    });
  });

  it('keeps equal reactive pupils as a normal 3 mm exam', () => {
    const profile = getPupilProfile(caseWithPupils('Equal 3mm, reactive to light'));
    expect(profile).toMatchObject({
      leftMm: 3,
      rightMm: 3,
      leftReaction: 'brisk',
      rightReaction: 'brisk',
      abnormal: false,
    });
  });

  it('flags pinpoint and fixed-dilated string findings', () => {
    expect(getPupilProfile(caseWithPupils('Pinpoint (miosis) bilaterally'))).toMatchObject({
      leftMm: 1,
      rightMm: 1,
      abnormal: true,
    });
    expect(getPupilProfile(caseWithPupils('Fixed and dilated bilaterally'))).toMatchObject({
      leftMm: 6,
      rightMm: 6,
      leftReaction: 'fixed',
      rightReaction: 'fixed',
      abnormal: true,
    });
  });
});

describe('applyVisualEyeEffect', () => {
  it('does not flatten authored anisocoria with a generic dilated overlay', () => {
    const base = getPupilProfile(caseWithPupils([
      'Right dilated 6mm non-reactive',
      'Left 4mm sluggish',
    ]));
    const next = applyVisualEyeEffect(base, visual('dilated', 'Pupil/gaze findings appear in eye zoom'));
    expect(next.leftMm).toBe(4);
    expect(next.rightMm).toBe(6);
    expect(next.rightReaction).toBe('fixed');
  });

  it('fills a normal exam with pinpoint toxidrome visuals', () => {
    const base = getPupilProfile(caseWithPupils('Equal and reactive'));
    const next = applyVisualEyeEffect(base, visual('pinpoint', 'Toxidrome pupils'));
    expect(next).toMatchObject({ leftMm: 1, rightMm: 1, abnormal: true });
  });
});

describe('describePupilFinding', () => {
  it('writes size, equality and reactivity from the profile, not a string-only parser', () => {
    const profile = getPupilProfile(caseWithPupils([
      'Right dilated 6mm non-reactive',
      'Left 4mm sluggish',
    ]));
    expect(describePupilFinding(profile, 'pupils-size')).toBe('Left: 4mm. Right: 6mm.');
    expect(describePupilFinding(profile, 'pupils-equality')).toBe('Unequal — right larger than left.');
    expect(describePupilFinding(profile, 'pupils-reactivity')).toBe(
      'Left: Sluggish response. Right: Fixed, non-reactive.',
    );
  });
});

describe('nearestPupilExamAction', () => {
  it('registers a tap on either eye as a pupil exam', () => {
    expect(nearestPupilExamAction({ x: -0.029, y: 1.55, z: 0.16 })).toBe('pupils-size');
    expect(nearestPupilExamAction({ x: 0.029, y: 1.55, z: 0.16 })).toBe('pupils-equality');
    expect(nearestPupilExamAction({ x: -0.04, y: 1.54, z: 0.15 })).toBe('pupils-size');
  });

  it('does not steal a mouth tap', () => {
    expect(nearestPupilExamAction({ x: 0, y: 1.478, z: 0.165 })).toBeNull();
  });
});
