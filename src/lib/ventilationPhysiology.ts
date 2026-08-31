const safeWeightKg = (weightKg: number): number => (
  Number.isFinite(weightKg) ? Math.min(250, Math.max(1, weightKg)) : 70
);

/**
 * Estimate a visible, chest-rise-sized BVM breath at roughly 7 mL/kg.
 *
 * The former blanket 250 mL paediatric value delivered adult-sized breaths to
 * newborns. Clamp only at realistic equipment limits so the same calculation
 * scales from a neonatal bag to a large adult bag.
 */
export function estimatedBvmTidalVolumeLitres(weightKg: number): number {
  return Math.min(0.55, Math.max(0.02, safeWeightKg(weightKg) * 0.007));
}

/**
 * Approximate resting minute ventilation for simulator feedback. Younger
 * patients need more ventilation per kilogram because dead-space fraction and
 * metabolic demand are higher.
 */
export function targetMinuteVentilationLitres(weightKg: number): number {
  const weight = safeWeightKg(weightKg);
  const litresPerKgMinute = weight <= 5 ? 0.32 : weight < 30 ? 0.14 : 0.09;
  return weight * litresPerKgMinute;
}

export function projectedEtco2Target(
  providedMinuteVentilationLitres: number,
  targetMinuteVentilation: number,
): number {
  const ratio = providedMinuteVentilationLitres / Math.max(0.1, targetMinuteVentilation);
  if (ratio >= 1.5) return 25;
  if (ratio >= 1.1) return 32;
  if (ratio >= 0.85) return 40;
  if (ratio >= 0.6) return 50;
  return 60;
}
