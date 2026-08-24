const GENERAL_CONTROL = [
  'bleeding_control',
  'direct_pressure',
  'pressure_dressing',
  'pressure_bandage',
  'wound_packing',
  'haemostatic',
  'hemostatic',
  'bandage',
];

const LIMB_REGIONS = ['left-arm', 'right-arm', 'left-leg', 'right-leg'];

interface SiteControl {
  treatmentId: string;
  region: string;
}
function parseSiteControl(id: string): SiteControl | null {
  const match = id.toLowerCase().match(/^site:([^:]+):(.+)$/);
  return match ? { treatmentId: match[1], region: match[2] } : null;
}

/**
 * Determines whether one visible bleeding site has actually been controlled.
 * Once a treatment has a site token, its generic treatment id no longer hides
 * every other wound. Legacy scenarios without site tokens retain their broad
 * behaviour for backwards compatibility.
 */
export function isBleedRegionControlled(controlIds: Iterable<string>, region: string): boolean {
  const ids = [...controlIds].map(id => id.toLowerCase());
  const siteControls = ids.map(parseSiteControl).filter((value): value is SiteControl => value != null);

  const exactSiteControl = siteControls.some(({ treatmentId, region: target }) => {
    if (target !== region) return false;
    if (treatmentId.includes('tourniquet')) return LIMB_REGIONS.includes(region);
    if (treatmentId.includes('chest_seal') || treatmentId.includes('occlusive')) return region === 'chest';
    return GENERAL_CONTROL.some(control => treatmentId.includes(control));
  });
  if (exactSiteControl) return true;

  const siteBoundTreatments = new Set(siteControls.map(control => control.treatmentId));
  const hasLegacyGeneralControl = ids.some(id =>
    !id.startsWith('site:')
    && !siteBoundTreatments.has(id)
    && GENERAL_CONTROL.some(control => id.includes(control)),
  );
  if (hasLegacyGeneralControl) return true;

  if (region === 'chest') {
    return ids.some(id => !id.startsWith('site:') && (id.includes('chest_seal') || id.includes('occlusive_dressing')));
  }
  if (LIMB_REGIONS.includes(region)) {
    return ids.some(id => !id.startsWith('site:') && !siteBoundTreatments.has(id) && id.includes('tourniquet'));
  }
  return false;
}
