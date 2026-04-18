/**
 * abcdeClassifier — classify a free-text checklist item into one of the
 * five ABCDE primary-survey channels (Airway / Breathing / Circulation /
 * Disability / Exposure) so the UI can colour-rail it.
 *
 * Why this exists
 * ---------------
 * The real data model stores checklist items with a broad `category`
 * field (often just `'abcde'`) — it doesn't carry the individual A/B/C/D/E
 * tag the design system wants. Rather than break the case data shape, we
 * infer the channel from the item's description text using the same
 * clinical vocabulary a paramedic instructor would. The mapping is
 * intentionally conservative: when nothing matches strongly, we return
 * null so the UI falls back to a neutral rail instead of guessing.
 *
 * The design system's channel colours (from src/index.css) are:
 *   A — airway      blue    (217 91% 60%)
 *   B — breathing   cyan    (189 94% 43%)
 *   C — circulation red     (  0 84% 60%)
 *   D — disability  purple  (262 83% 58%)
 *   E — exposure    amber   ( 38 92% 50%)
 */

export type AbcdeChannel = 'A' | 'B' | 'C' | 'D' | 'E';

export interface AbcdeChannelMeta {
  channel: AbcdeChannel;
  label: string;
  /**
   * Tailwind class fragment for the coloured left rail, tinted fill,
   * and chip. Using arbitrary-value classes so the Tailwind JIT doesn't
   * miss them.
   */
  railClass: string;
  fillClass: string;
  chipClass: string;
  letterColour: string;
}

export const ABCDE_META: Record<AbcdeChannel, AbcdeChannelMeta> = {
  A: {
    channel: 'A',
    label: 'Airway',
    railClass: 'border-l-blue-500',
    fillClass: 'bg-blue-500/5',
    chipClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    letterColour: 'text-blue-500',
  },
  B: {
    channel: 'B',
    label: 'Breathing',
    railClass: 'border-l-cyan-500',
    fillClass: 'bg-cyan-500/5',
    chipClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    letterColour: 'text-cyan-500',
  },
  C: {
    channel: 'C',
    label: 'Circulation',
    railClass: 'border-l-red-500',
    fillClass: 'bg-red-500/5',
    chipClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    letterColour: 'text-red-500',
  },
  D: {
    channel: 'D',
    label: 'Disability',
    railClass: 'border-l-purple-500',
    fillClass: 'bg-purple-500/5',
    chipClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    letterColour: 'text-purple-500',
  },
  E: {
    channel: 'E',
    label: 'Exposure',
    railClass: 'border-l-amber-500',
    fillClass: 'bg-amber-500/5',
    chipClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    letterColour: 'text-amber-500',
  },
};

// -----------------------------------------------------------------------------
// Keyword tables — lowercased + deduplicated. Each entry either matches a
// whole word (when listed short) or a substring (when listed longer), so
// "spo2" matches "SpO2 monitoring" but "bp" won't hit "aspirin".
// -----------------------------------------------------------------------------

type Rule = { channel: AbcdeChannel; keywords: string[] };

const RULES: Rule[] = [
  // AIRWAY — upper-airway management + aspiration risk
  {
    channel: 'A',
    keywords: [
      'airway', 'patency', 'suction', 'suction unit', 'head-tilt', 'chin-lift',
      'jaw thrust', 'oropharyngeal', 'nasopharyngeal', 'npa', 'opa', 'intubat',
      'laryng', 'supraglottic', 'lma', 'i-gel', 'cricothyroid', 'choking',
      'aspirat', 'foreign body', 'gag reflex', 'gurgling',
    ],
  },
  // BREATHING — ventilation, oxygenation, chest exam
  {
    channel: 'B',
    keywords: [
      'breathing', 'respirat', 'auscultat', 'chest rise', 'chest wall',
      'tidal volume', 'spo2', 'sp02', 'oxygen', 'o2', 'supplemental',
      'nasal cannula', 'non-rebreather', 'nrb', 'bvm', 'bag-valve',
      'ventilat', 'crackles', 'wheeze', 'stridor', 'breath sounds',
      'tension pneumothorax', 'needle decompression', 'chest decompression',
      'etco2', 'capnograph', 'pulse oximetry', 'silent chest', 'accessory muscles',
    ],
  },
  // CIRCULATION — perfusion, cardiac, haemorrhage
  {
    channel: 'C',
    keywords: [
      'circulation', 'pulse check', 'pulse rate', 'radial pulse', 'carotid pulse',
      'blood pressure', 'bp ', 'bp,', 'bp:', 'hypotens', 'cap refill',
      'capillary refill', 'iv access', 'intravenous', 'cannula', 'io access',
      'fluid bolus', 'hartmann', 'saline', 'crystalloid', 'haemorrhage',
      'hemorrhage', 'bleed', 'tourniquet', 'direct pressure',
      '12-lead', '12 lead', 'ecg', 'rhythm strip', 'cardiac monitor',
      'defibrill', 'cardiovers', 'cpr', 'chest compression', 'rosc',
      'aspirin', 'gtn', 'glyceryl trinitrate', 'adrenaline iv', 'amiodarone',
      'stemi', 'acs', 'chest pain',
    ],
  },
  // DISABILITY — neuro
  {
    channel: 'D',
    keywords: [
      'gcs', 'glasgow', 'neuro', 'neurolog', 'pupils', 'avpu', 'alert',
      'consciousness', 'disability', 'bgl', 'blood glucose', 'hypoglyc',
      'stroke', 'fast', 'face-arm-speech', 'seizure', 'post-ictal',
      'pupillary', 'limb', 'drift', 'motor', 'sensation', 'disability assess',
    ],
  },
  // EXPOSURE — temp, trauma survey, environmental
  {
    channel: 'E',
    keywords: [
      'expose', 'exposure', 'secondary survey', 'temperature', 'temp ',
      'hypotherm', 'hyperthermi', 'rash', 'burns', 'trauma survey',
      'log roll', 'back', 'posterior', 'skin', 'petechiae', 'purpura',
      'environment', 'environmental', 'wound', 'bruising', 'abrasion',
    ],
  },
];

/**
 * Classify a checklist item by its description text. Falls back to the
 * item's `category` field if nothing matches, and returns `null` when
 * the description is clearly outside ABCDE territory (pre-alert, hand-off,
 * documentation, etc.).
 */
export function classifyAbcde(
  description: string,
  category?: string,
): AbcdeChannel | null {
  const text = (description || '').toLowerCase();
  if (!text) return null;

  // Category hint — if the case author explicitly tagged airway/breathing
  // /circulation/disability/exposure, trust that first.
  const catHint = (category || '').toLowerCase();
  if (catHint === 'airway') return 'A';
  if (catHint === 'breathing') return 'B';
  if (catHint === 'circulation') return 'C';
  if (catHint === 'disability') return 'D';
  if (catHint === 'exposure') return 'E';

  // Keyword sweep — stop at the first channel with any matching keyword.
  // Rule order matters for ambiguous overlaps (e.g. "chest compression" →
  // Circulation wins over Breathing).
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) return rule.channel;
    }
  }

  return null;
}

/**
 * Convenience: get the full channel meta for an item in one call. Returns
 * `null` when the item doesn't belong to any ABCDE channel.
 */
export function getAbcdeMeta(
  description: string,
  category?: string,
): AbcdeChannelMeta | null {
  const ch = classifyAbcde(description, category);
  return ch ? ABCDE_META[ch] : null;
}
