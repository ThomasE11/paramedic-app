export interface SkinDetailProfile {
  readonly url: string;
  /** Provisional UV repeats; tune only against an actual resp-001 render. */
  readonly tiles: number;
  /** Provisional tangent-normal blend; tune only against an actual resp-001 render. */
  readonly scale: number;
}

/**
 * Opt-in material profile for the resp-001 realism pilot. Generic male cases
 * intentionally retain the existing detail-normal path.
 */
export const RESP001_SKIN_DETAIL_PROFILE: SkinDetailProfile = Object.freeze({
  url: '/models/patient-male-skin-resp001-pore-detail-normal.png',
  // Current face UV density gives ~0.77 mm median pore spacing at 28 repeats.
  tiles: 28,
  scale: 0.8,
});

export function skinDetailProfileForPilot(enabled: boolean): SkinDetailProfile | undefined {
  return enabled ? RESP001_SKIN_DETAIL_PROFILE : undefined;
}
