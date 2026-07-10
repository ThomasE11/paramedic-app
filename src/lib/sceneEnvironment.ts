/**
 * sceneEnvironment — pure classifier from case text to a 3D scene preset.
 *
 * The treatment scene should be the place the patient was FOUND: a villa
 * living room, an office, a restaurant floor, the roadside. Free-text case
 * fields (sceneInfo.environment/description, dispatch location) are mapped
 * to one of a small set of procedural set-dressing presets rendered by
 * SceneEnvironment in the 3D layer. Pure and deterministic — testable
 * without three.js.
 */

import type { CaseScenario } from '@/types';

export type ScenePresetId =
  | 'home-living'
  | 'home-bedroom'
  | 'bathroom'
  | 'office'
  | 'restaurant'
  | 'street'
  | 'outdoor-heat'
  | 'industrial'
  | 'ambulance-bay';

/** Ordered rules — FIRST match wins, so the specific beats the generic
 *  (a "bathroom in an apartment" is a bathroom, not a living room). */
const PRESET_RULES: Array<{ id: ScenePresetId; pattern: RegExp }> = [
  { id: 'bathroom', pattern: /\bbathroom|shower|bathtub|toilet\b/ },
  { id: 'home-bedroom', pattern: /\bbedroom|hotel room|asleep in bed|found in bed|retirement home|nursing home\b/ },
  { id: 'restaurant', pattern: /\brestaurant|cafe|café|food court|dining|shopping mall|supermarket|grocery|souk|market\b/ },
  { id: 'office', pattern: /\boffice|business bay|workplace|meeting room|classroom|school|university|lecture\b/ },
  { id: 'industrial', pattern: /\bconstruction|industrial|warehouse|factory|site accident|jebel ali|scaffold|workshop|smoke-filled|fire scene\b/ },
  { id: 'street', pattern: /\bstreet|road(?:side)?\b|\bhighway|asphalt|traffic|intersection|sheikh zayed|mvc|rtc|collision|crosswalk|sidewalk|pavement|parking\b/ },
  { id: 'outdoor-heat', pattern: /\boutdoor|farm|desert|beach|park\b|\bgarden|dunes|camel|heat exposure|direct sun(?:light)?\b/ },
  { id: 'home-living', pattern: /\bapartment|villa|home|house|flat\b|\bliving room|majlis|residence|indoor\b/ },
];

/** Free text the classifier reads — the PLACE fields only, not clinical text
 *  (a "pneumothorax" mentioning "road traffic collision" in the history is a
 *  mechanism, but the patient may be found at home days later — so history
 *  and findings are excluded). */
function collectPlaceText(caseData: CaseScenario): string {
  return [
    caseData.sceneInfo?.environment,
    caseData.sceneInfo?.description,
    caseData.dispatchInfo?.location,
    caseData.initialPresentation?.position,
  ].filter(Boolean).join(' ').toLowerCase();
}

export function classifySceneEnvironment(caseData: CaseScenario): ScenePresetId {
  const text = collectPlaceText(caseData);
  if (!text) return 'ambulance-bay';
  for (const rule of PRESET_RULES) {
    if (rule.pattern.test(text)) return rule.id;
  }
  return 'ambulance-bay';
}

/** Lighting mood per preset — the 3D layer maps these onto its accent
 *  lights so a villa reads warm, an office reads fluorescent-cool, and the
 *  roadside reads like harsh daylight. */
export interface ScenePresetMood {
  /** Accent light colour (hex). */
  accent: string;
  /** Ambient boost 0..1 relative to the bay's default. */
  warmth: number;
  /** Whether this is an OPEN scene (sky, no back wall). */
  open: boolean;
}

export const PRESET_MOOD: Record<ScenePresetId, ScenePresetMood> = {
  'home-living': { accent: '#f5c56b', warmth: 0.8, open: false },
  'home-bedroom': { accent: '#e8b86b', warmth: 0.7, open: false },
  bathroom: { accent: '#cfe6ee', warmth: 0.4, open: false },
  office: { accent: '#dbe7f5', warmth: 0.3, open: false },
  restaurant: { accent: '#f0a95c', warmth: 0.9, open: false },
  street: { accent: '#fff3d6', warmth: 0.5, open: true },
  'outdoor-heat': { accent: '#ffd9a0', warmth: 1.0, open: true },
  industrial: { accent: '#e6c17a', warmth: 0.5, open: false },
  'ambulance-bay': { accent: '#22d3ee', warmth: 0.4, open: false },
};
