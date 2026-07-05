/**
 * Maps a 3D click point on a patient mesh to a body-region id.
 * The patient is in normalized app space:
 * - feet at y=0, top of head at y=1.8
 * - facing +z, patient's RIGHT side at NEGATIVE x (mirrored: screen-left is the patient's right)
 * - arms hang at the sides
 *
 * @param x - The x-coordinate of the click point.
 * @param y - The y-coordinate of the click point.
 * @param z - The z-coordinate of the click point.
 * @returns An object containing the body region and whether it is a foot.
 */
export type BodyRegion = 'face' | 'head' | 'neck-cspine' | 'chest' | 'abdomen' | 'pelvis' | 'right-arm' | 'left-arm' | 'right-leg' | 'left-leg';

export interface RegionHit {
  region: BodyRegion;
  foot: boolean;
}

export function classifyBodyPoint(x: number, y: number, z: number): RegionHit {
  if (y >= 1.72) return { region: 'head', foot: false };
  else if (y >= 1.50) return z >= 0.02 ? { region: 'face', foot: false } : { region: 'head', foot: false };
  else if (y >= 1.40) return { region: 'neck-cspine', foot: false };
  else if (y >= 0.78 && Math.abs(x) > 0.13) return x < 0 ? { region: 'right-arm', foot: false } : { region: 'left-arm', foot: false };
  else if (y >= 1.13) return { region: 'chest', foot: false };
  else if (y >= 0.93) return { region: 'abdomen', foot: false };
  else if (y >= 0.80) return { region: 'pelvis', foot: false };
  else return y < 0.09 ? { region: x < 0 ? 'right-leg' : 'left-leg', foot: true } : { region: x < 0 ? 'right-leg' : 'left-leg', foot: false };
}
