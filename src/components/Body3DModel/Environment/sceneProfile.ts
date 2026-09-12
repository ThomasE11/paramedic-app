/** Optional authored dressing layered onto a shared environment variant. */
export type SceneProfile = 'resp-001-villa';

export function isResp001VillaProfile(profile: SceneProfile | undefined): boolean {
  return profile === 'resp-001-villa';
}

/** Keep the room dressed after transfer while removing the vacated support. */
export function resp001VillaMeshVisible(name: string, showPatientSeat: boolean): boolean {
  return showPatientSeat || !name.startsWith('asthma_chair_');
}
