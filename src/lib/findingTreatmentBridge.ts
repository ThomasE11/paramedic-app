/**
 * A3 — the finding→treatment bridge (DESIGN_PROPOSAL.md). Maps a revealed
 * clinical exam finding TEXT to where its treatment lives: which jump bag to
 * open and what to pre-type in the bag search. It narrows the shelf — it
 * never picks the drug. Authored by the local worker against the hand-written
 * spec tests; human-patched negation (word-window inspection, not character
 * distances) per the accept-and-patch pattern.
 */
export interface TreatBridge {
  bag: string;
  query: string;
  reason: string;
}

interface BridgeRule {
  keywords: string[];
  bag: string;
  query: string;
  reason: string;
}

// Priority order: upper-airway first, mirroring the breath-sound routing
// precedence (stridor > silent chest > wheeze > crackles), haemorrhage last.
const RULES: BridgeRule[] = [
  { keywords: ['stridor'], bag: 'breathing', query: 'adrenaline', reason: 'Upper-airway noise — nebulised adrenaline territory.' },
  { keywords: ['silent chest'], bag: 'airway', query: 'ventilation', reason: 'No air movement — support ventilation now.' },
  { keywords: ['wheeze', 'wheezing'], bag: 'breathing', query: 'salbutamol', reason: 'Bronchospasm heard — bronchodilator territory.' },
  { keywords: ['crackles', 'crepitations', 'pulmonary oedema'], bag: 'medications', query: 'gtn', reason: 'Fluid on the lungs — preload reduction territory.' },
  { keywords: ['haemorrhage', 'hemorrhage', 'bleeding', 'exsanguinat'], bag: 'circulation', query: 'bleeding', reason: 'Stop the bleed first.' },
];

const NEGATORS = new Set(['no', 'without', 'denies']);

/**
 * True when THIS occurrence of a keyword is negated: one of the up-to-3 words
 * immediately before it is a negator ('no wheeze', 'without any stridor'),
 * or the word immediately after it is 'absent' ('wheeze absent').
 */
function occurrenceNegated(text: string, start: number, keywordLength: number): boolean {
  const before = text.slice(0, start).split(/[^a-z]+/).filter(Boolean);
  const lastThree = before.slice(-3);
  if (lastThree.some(w => NEGATORS.has(w))) return true;
  const after = text.slice(start + keywordLength).split(/[^a-z]+/).filter(Boolean);
  return after[0] === 'absent';
}

/** True when the keyword appears somewhere in the text NOT negated. */
function keywordFires(text: string, keyword: string): boolean {
  let from = 0;
  for (;;) {
    const idx = text.indexOf(keyword, from);
    if (idx === -1) return false;
    if (!occurrenceNegated(text, idx, keyword.length)) return true;
    from = idx + keyword.length;
  }
}

/**
 * Map a finding text to its treatment bridge, or null when nothing bridges.
 * Case-insensitive; the first rule (in priority order) with a non-negated
 * keyword occurrence wins.
 */
export function bridgeForFinding(findingText: string): TreatBridge | null {
  const text = findingText.toLowerCase().trim();
  if (!text) return null;

  for (const rule of RULES) {
    if (rule.keywords.some(k => keywordFires(text, k))) {
      return { bag: rule.bag, query: rule.query, reason: rule.reason };
    }
  }
  return null;
}
