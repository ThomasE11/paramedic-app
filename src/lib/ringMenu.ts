/**
 * Pure derivation layer for the contextual action ring (DESIGN_PROPOSAL.md A2):
 * click a body region on the 3D patient, get a compact radial menu of the
 * region's assessment verbs at the click point. Authored by the local worker
 * against the hand-written spec tests; two-line human patch (canon ordering,
 * -0 normalization).
 */
export interface RingAction { id: string; label: string; technique: string }
export interface RingArm { technique: string; label: string; actionId: string }

/**
 * One arm per distinct technique — the FIRST action of each technique in
 * input order wins (authored order = clinical priority) and supplies the
 * actionId the arm fires. Arms follow the canon exam order (inspect, palpate,
 * percuss, auscultate); techniques outside the canon come after, in
 * first-appearance order. Capped at 6 arms.
 */
export function deriveRingArms(actions: RingAction[]): RingArm[] {
  const canon = ['inspect', 'palpate', 'percuss', 'auscultate'];
  const armMap = new Map<string, RingArm>();

  for (const action of actions) {
    if (!armMap.has(action.technique)) {
      armMap.set(action.technique, { technique: action.technique, label: capitalize(action.technique), actionId: action.id });
    }
  }

  // Map insertion order preserves first appearance; a stable sort by canon
  // rank (non-canon ranks after the whole canon) keeps that order for ties.
  const rank = (t: string): number => {
    const i = canon.indexOf(t);
    return i === -1 ? canon.length : i;
  };
  const sortedTechniques = [...armMap.keys()].sort((a, b) => rank(a) - rank(b));

  const result: RingArm[] = [];
  for (const technique of sortedTechniques) {
    result.push(armMap.get(technique)!);
    if (result.length === 6) break;
  }
  return result;
}

/**
 * `count` points evenly spaced on a circle of `radius` in SCREEN coordinates
 * (+y down), starting at 12 o'clock (0, -radius) and going clockwise.
 * Rounded to 2 decimals; -0 normalized to 0.
 */
export function ringArmOffsets(count: number, radius: number): Array<{ x: number; y: number }> {
  if (count <= 0) return [];

  const offsets: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = round2(radius * Math.sin(angle));
    const y = round2(-radius * Math.cos(angle));
    offsets.push({ x, y });
  }
  return offsets;
}

function round2(v: number): number {
  const r = Math.round(v * 100) / 100;
  return r === 0 ? 0 : r; // normalize -0
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
