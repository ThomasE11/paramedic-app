import type { PupilProfile } from '@/lib/pupilExam';

/** Visual response model, not quantitative pupillometry. The pilot has intact
 * afferent pathways: either eye illuminates both efferent responses. Do not use
 * this to infer an RAPD from an authored 'fixed' / 'sluggish' description.
 * Normal direct/consensual response: Merck Manual, pupil examination.
 * https://www.merckmanuals.com/professional/eye-disorders/approach-to-the-ophthalmologic-patient/evaluation-of-the-ophthalmologic-patient
 */
export function stepPupilLightResponse(
  current: readonly [number, number],
  profile: PupilProfile,
  illuminated: boolean,
  secondsLit: number,
  delta: number,
): [number, number] {
  const step = (value: number, baseline: number, reaction: string) => {
    if (/fixed|non.?reactive|unreactive/i.test(reaction)) return baseline;
    const sluggish = /sluggish|slow/i.test(reaction);
    if (illuminated && secondsLit < (sluggish ? .35 : .18)) return value;
    const target = illuminated ? Math.max(1, baseline * (sluggish ? .78 : .6)) : baseline;
    const tau = illuminated ? (sluggish ? .65 : .16) : .65;
    return value + (target - value) * (1 - Math.exp(-Math.max(0, Math.min(delta, .05)) / tau));
  };
  return [step(current[0], profile.leftMm, profile.leftReaction), step(current[1], profile.rightMm, profile.rightReaction)];
}
