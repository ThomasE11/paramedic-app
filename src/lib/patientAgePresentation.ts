export type PatientAgeBand = 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult';

export function patientAgeBand(age?: number | null): PatientAgeBand {
  if (age == null || !Number.isFinite(age) || age >= 18) return 'adult';
  if (age < 1) return 'infant';
  if (age < 5) return 'toddler';
  if (age < 13) return 'child';
  return 'adolescent';
}

/** Approximate standing-height ratio used by lightweight scene figures. */
export function patientAgeScale(age?: number | null): number {
  switch (patientAgeBand(age)) {
    case 'infant': return 0.38;
    case 'toddler': return 0.56;
    case 'child': return 0.72;
    case 'adolescent': return 0.86;
    case 'adult': return 1;
  }
}
