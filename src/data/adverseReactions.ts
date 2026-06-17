/**
 * Adverse Reaction Engine — allergy-driven physiology
 * ===================================================
 *
 * Models what happens when a student administers a drug the patient is
 * ALLERGIC to (or that cross-reacts with a documented allergy). Today the
 * sim only ever applies a treatment's *beneficial* effect; this module adds
 * the missing failure mode the teaching brief asked for:
 *
 *   "…if they do not run [check] allergies and the patient is allergic,
 *    how [does the patient] respond…"
 *
 * Design
 * ------
 * - **Pure + testable.** No React, no timers, no I/O. Just data + functions.
 *   The StudentPanel wiring owns the clock (onset → peak → escalation) and
 *   the animation; this module owns *what the numbers become*.
 * - **Computed from current vitals.** Every projected vital is a function of
 *   the patient's present state, so a reaction looks right whether the
 *   patient started at 120/80 or was already shocked.
 * - **Real rescue pathway.** The reversal treatments map to drug IDs that
 *   actually exist in the treatment database (adrenaline IM, fluids, O2,
 *   nebulised adrenaline, chlorphenamine, hydrocortisone), so "recognise and
 *   treat the anaphylaxis" is a learnable, gradable loop.
 *
 * Clinical scope: this is allergy/anaphylaxis. Non-allergic adverse effects
 * (e.g. opioid-induced respiratory depression on a normal patient) are
 * deliberately out of scope here — they belong to the contraindication
 * checker (runtimeContraindications.ts) and the dose engine.
 */

import type { VitalSigns } from '@/types';
import type { Treatment } from './enhancedTreatmentEffects';

// ============================================================================
// Types
// ============================================================================

/** How the reaction presents clinically — drives severity + trajectory. */
export type ReactionKind = 'anaphylaxis' | 'allergic';

/** Where in the reaction's life-cycle a projected vital set sits. */
export type ReactionStage = 'onset' | 'peak' | 'arrest' | 'recovery';

export interface AllergyMatch {
  /** The patient-allergy string that matched (as written on the case). */
  allergy: string;
  /** The allergen token on the treatment that it matched against. */
  via: string;
  /**
   * `exact` = the patient is documented allergic to *this very drug/class*.
   * `cross` = a cross-reactive class hit (e.g. iodine allergy ↔ amiodarone).
   * Exact matches drive full anaphylaxis; cross matches start milder.
   */
  kind: 'exact' | 'cross';
}

export interface AdverseReaction {
  /** Stable id for logging / dedupe (treatmentId-scoped). */
  id: string;
  /** Triggering treatment. */
  treatmentId: string;
  treatmentName: string;
  /** What the patient is reacting to. */
  match: AllergyMatch;
  /** Severity archetype. */
  kind: ReactionKind;
  /** One-line clinical headline for toasts / the event feed. */
  headline: string;
  /** Progressive examination findings, keyed by stage, newest-relevant first. */
  findings: Record<Exclude<ReactionStage, 'recovery'>, string[]>;
  /** ms after administration before the first signs appear. */
  onsetMs: number;
  /**
   * ms after administration by which, if NO definitive rescue has been given,
   * the patient escalates from `peak` toward `arrest`. anaphylaxis only.
   */
  escalateMs: number;
  /** True when, left untreated, this reaction can progress to cardiac arrest. */
  canProgressToArrest: boolean;
  /** Treatment IDs that definitively reverse the reaction (adrenaline). */
  rescueTreatmentIds: string[];
  /** Treatment IDs that partially help (O2, fluids, bronchodilators, antihistamine, steroid). */
  adjunctTreatmentIds: string[];
}

// ============================================================================
// Allergen knowledge base
// ============================================================================

/**
 * Treatments capable of provoking an allergic reaction, mapped to the
 * allergen *tokens* they expose. We only enumerate drugs that exist in the
 * treatment database AND have meaningful real-world allergy potential.
 * Anything not listed falls back to name/id substring matching below.
 */
const TREATMENT_ALLERGENS: Record<string, string[]> = {
  // NSAIDs / salicylates
  aspirin: ['aspirin', 'salicylate', 'nsaid'],
  ibuprofen_oral: ['ibuprofen', 'nsaid'],
  // Opioids (true allergy is rare; documented allergy → treat seriously)
  morphine_5mg: ['morphine', 'opioid'],
  fentanyl_50mcg: ['fentanyl', 'opioid'],
  fentanyl_infusion: ['fentanyl', 'opioid'],
  // Paracetamol
  paracetamol_oral: ['paracetamol', 'acetaminophen'],
  paracetamol_iv: ['paracetamol', 'acetaminophen'],
  // Iodine-containing — amiodarone cross-reacts with iodine/contrast allergy
  amiodarone_300mg: ['amiodarone', 'iodine'],
  amiodarone_150mg: ['amiodarone', 'iodine'],
  // Antiemetics
  ondansetron_4mg: ['ondansetron'],
  metoclopramide_10mg: ['metoclopramide'],
  // Neuromuscular blockers — classic peri-induction anaphylaxis triggers
  suxamethonium: ['suxamethonium', 'succinylcholine', 'neuromuscular blocker', 'muscle relaxant'],
  rocuronium: ['rocuronium', 'neuromuscular blocker', 'muscle relaxant'],
  // Other
  txa_1g: ['tranexamic', 'txa'],
  chlorphenamine_10mg: ['chlorphenamine'],
  propofol_infusion: ['propofol'],
};

/**
 * Patient-allergy synonym expansion. A documented allergy to the *class* (or
 * a common brand/related agent) should trigger on any member. Keys and values
 * are lower-case tokens.
 */
const ALLERGY_SYNONYMS: Record<string, string[]> = {
  nsaid: ['nsaid', 'nsaids', 'aspirin', 'salicylate', 'ibuprofen', 'naproxen', 'diclofenac', 'ketorolac'],
  aspirin: ['aspirin', 'salicylate', 'nsaid'],
  salicylate: ['salicylate', 'aspirin', 'nsaid'],
  opioid: ['opioid', 'opiate', 'morphine', 'fentanyl', 'codeine', 'oxycodone', 'tramadol', 'pethidine'],
  opiate: ['opioid', 'opiate', 'morphine', 'fentanyl', 'codeine'],
  morphine: ['morphine', 'opioid', 'opiate'],
  codeine: ['codeine', 'opioid', 'opiate'],
  iodine: ['iodine', 'contrast', 'amiodarone'],
  contrast: ['contrast', 'iodine', 'amiodarone'],
  penicillin: ['penicillin', 'amoxicillin', 'augmentin', 'co-amoxiclav', 'flucloxacillin', 'cephalosporin'],
  paracetamol: ['paracetamol', 'acetaminophen'],
  acetaminophen: ['acetaminophen', 'paracetamol'],
};

/**
 * Drug classes whose documented allergy produces full IgE-mediated
 * anaphylaxis when the drug is given. Others (e.g. opioid pseudo-allergy)
 * start as a milder allergic reaction that can still escalate.
 */
const HIGH_RISK_TOKENS = new Set([
  'nsaid', 'aspirin', 'salicylate', 'ibuprofen',
  'iodine', 'contrast', 'amiodarone',
  'penicillin', 'cephalosporin',
  'neuromuscular blocker', 'muscle relaxant', 'suxamethonium', 'rocuronium',
]);

/** Definitive reversal — IM/IV adrenaline (adult + paediatric variants). */
const RESCUE_IDS = [
  'adrenaline_im',
  'adrenaline_im_child',
  'adrenaline_im_older',
  'adrenaline_im_infant',
  'adrenaline_1mg', // arrest-dose IV, valid once peri-arrest / arrested
];

/** Supportive measures that partially improve the reaction. */
const ADJUNCT_IDS = [
  'fluids_250ml', 'fluids_500ml', 'fluids_1000ml',
  'oxygen_mask', 'oxygen_nonrebreather', 'oxygen_nasal',
  'nebulizer_salbutamol', 'salbutamol_iv', 'nebulised_adrenaline',
  'chlorphenamine_10mg', 'hydrocortisone_200mg',
];

const RESCUE_SET = new Set(RESCUE_IDS);
const ADJUNCT_SET = new Set(ADJUNCT_IDS);

/** True when a treatment definitively reverses anaphylaxis (adrenaline). */
export function isDefinitiveRescue(treatmentId: string): boolean {
  return RESCUE_SET.has(treatmentId);
}

/** True when a treatment is a supportive adjunct in anaphylaxis management. */
export function isAdjunctRescue(treatmentId: string): boolean {
  return ADJUNCT_SET.has(treatmentId);
}

// ============================================================================
// Allergy matching
// ============================================================================

function normalise(s: string): string {
  return s.toLowerCase().trim();
}

/** Is the allergy list effectively "no known allergies"? */
function isNoKnownAllergies(allergies: string[]): boolean {
  if (!allergies || allergies.length === 0) return true;
  const first = normalise(String(allergies[0]));
  return first === 'nkda' || first.includes('no known') || first === 'none' || first === 'nil';
}

/** Expand a patient allergy string into its token set (incl. synonyms). */
function expandAllergyTokens(allergy: string): string[] {
  const base = normalise(allergy);
  const tokens = new Set<string>([base]);
  // Whole-string synonym hit
  for (const [key, syns] of Object.entries(ALLERGY_SYNONYMS)) {
    if (base === key || base.includes(key)) syns.forEach(t => tokens.add(t));
  }
  // Also add individual significant words (handles "Penicillin (rash)" etc.)
  for (const word of base.split(/[^a-z]+/).filter(w => w.length >= 4)) {
    tokens.add(word);
    const syns = ALLERGY_SYNONYMS[word];
    if (syns) syns.forEach(t => tokens.add(t));
  }
  return Array.from(tokens);
}

/** Allergen tokens a given treatment exposes (class map + name/id words). */
function treatmentAllergenTokens(treatment: Treatment): string[] {
  const tokens = new Set<string>(TREATMENT_ALLERGENS[treatment.id] ?? []);
  const name = normalise(treatment.name);
  // Pull drug-name words from the display name (e.g. "Aspirin 300mg" → aspirin)
  for (const word of name.split(/[^a-z]+/).filter(w => w.length >= 4)) {
    tokens.add(word);
  }
  // id words minus dose/route noise
  for (const word of treatment.id.split('_').filter(w => w.length >= 4 && !/^\d/.test(w))) {
    tokens.add(word);
  }
  return Array.from(tokens);
}

/**
 * Does administering `treatment` violate one of the patient's documented
 * allergies? Returns the match (with exact/cross classification) or null.
 * Only `medication`-category treatments are considered.
 */
export function matchAllergy(
  treatment: Treatment,
  allergies: string[] | undefined,
): AllergyMatch | null {
  if (!allergies || isNoKnownAllergies(allergies)) return null;
  if (treatment.category !== 'medication') return null;

  const treatmentTokens = treatmentAllergenTokens(treatment);
  const explicitTokens = new Set(TREATMENT_ALLERGENS[treatment.id] ?? []);

  for (const allergy of allergies) {
    if (!allergy || isNoKnownAllergies([allergy])) continue;
    const allergyTokens = expandAllergyTokens(allergy);
    for (const at of allergyTokens) {
      if (!treatmentTokens.includes(at)) continue;
      // Classify: an explicit class-map hit on a high-risk token, or a direct
      // drug-name hit, is "exact". A synonym/cross-class hit is "cross".
      const directName = normalise(treatment.name).includes(at) || treatment.id.includes(at);
      const explicitHit = explicitTokens.has(at);
      const isExact = directName || (explicitHit && HIGH_RISK_TOKENS.has(at));
      return { allergy, via: at, kind: isExact ? 'exact' : 'cross' };
    }
  }
  return null;
}

// ============================================================================
// Vitals projection
// ============================================================================

function parseBP(bp: string | undefined): { sys: number; dia: number } {
  const parts = String(bp ?? '120/80').split('/').map(p => parseInt(p.trim(), 10));
  return { sys: Number.isFinite(parts[0]) ? parts[0] : 120, dia: Number.isFinite(parts[1]) ? parts[1] : 80 };
}

const fmtBP = (sys: number, dia: number) => `${Math.round(sys)}/${Math.round(dia)}`;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Project the patient's vitals for a given reaction stage, computed from
 * their CURRENT vitals so the trajectory is sane from any starting point.
 *
 * anaphylaxis: distributive shock + bronchospasm/laryngeal oedema —
 *   progressive hypotension, compensatory tachycardia, falling SpO2, rising
 *   RR, then a falling GCS; peri-arrest if untreated.
 * allergic: urticaria + mild bronchospasm + modest haemodynamic dip that
 *   plateaus (does not, by itself, arrest the patient).
 */
export function projectReactionVitals(
  current: VitalSigns,
  kind: ReactionKind,
  stage: ReactionStage,
): VitalSigns {
  const { sys, dia } = parseBP(current.bp);
  const hr = current.pulse ?? 80;
  const spo2 = current.spo2 ?? 98;
  const rr = current.respiration ?? 16;
  const gcs = current.gcs ?? 15;

  // Recovery is computed toward a "stabilising" target rather than relative
  // to the (bad) current numbers, so adrenaline visibly pulls the patient up.
  if (stage === 'recovery') {
    return {
      ...current,
      bp: fmtBP(clamp(Math.max(sys, 100), 95, 135), clamp(Math.max(dia, 65), 60, 90)),
      pulse: clamp(hr > 110 ? hr - 25 : 95, 70, 115),
      spo2: clamp(Math.max(spo2, 95), 94, 100),
      respiration: clamp(rr > 20 ? rr - 8 : 16, 12, 22),
      gcs: clamp(Math.max(gcs, 14), 13, 15),
      time: new Date().toISOString(),
    };
  }

  if (kind === 'anaphylaxis') {
    switch (stage) {
      case 'onset':
        return {
          ...current,
          bp: fmtBP(clamp(sys * 0.9, 90, sys), clamp(dia * 0.9, 55, dia)),
          pulse: clamp(hr + 20, hr, 150),
          spo2: clamp(spo2 - 4, 88, spo2),
          respiration: clamp(rr + 6, rr, 28),
          gcs: clamp(gcs - 1, 13, 15),
          time: new Date().toISOString(),
        };
      case 'peak':
        return {
          ...current,
          bp: fmtBP(clamp(sys * 0.5, 55, 95), clamp(dia * 0.5, 35, 60)),
          pulse: clamp(hr + 55, 120, 165),
          spo2: clamp(Math.min(spo2 - 14, 85), 80, 92),
          respiration: clamp(rr + 16, 28, 36),
          gcs: clamp(gcs - 4, 7, 13),
          time: new Date().toISOString(),
        };
      case 'arrest':
        // Peri-arrest → the wiring flips rhythm to PEA and hands off to the
        // arrest pathway. Numbers reflect imminent loss of output.
        return {
          ...current,
          bp: fmtBP(40, 25),
          pulse: clamp(hr > 140 ? 45 : 38, 30, 50), // bradycardic pre-arrest
          spo2: clamp(70, 60, 78),
          respiration: clamp(6, 0, 10),
          gcs: 3,
          time: new Date().toISOString(),
        };
    }
  }

  // allergic (moderate) — plateaus at peak, no arrest
  switch (stage) {
    case 'onset':
      return {
        ...current,
        bp: fmtBP(clamp(sys * 0.96, 100, sys), dia),
        pulse: clamp(hr + 12, hr, 130),
        spo2: clamp(spo2 - 2, 92, spo2),
        respiration: clamp(rr + 3, rr, 24),
        gcs,
        time: new Date().toISOString(),
      };
    case 'peak':
    case 'arrest': // allergic never truly arrests; treat as its capped peak
      return {
        ...current,
        bp: fmtBP(clamp(sys * 0.82, 85, sys), clamp(dia * 0.85, 55, dia)),
        pulse: clamp(hr + 28, 95, 135),
        spo2: clamp(Math.min(spo2 - 6, 92), 88, 96),
        respiration: clamp(rr + 8, 20, 28),
        gcs: clamp(gcs - 1, 13, 15),
        time: new Date().toISOString(),
      };
  }
}

// ============================================================================
// Reaction builder
// ============================================================================

const ANAPHYLAXIS_FINDINGS: AdverseReaction['findings'] = {
  onset: ['Generalised urticaria and flushing', 'Itching of palms and scalp', 'Patient reports tingling lips / "feeling strange"'],
  peak: ['Angioedema — lip and tongue swelling', 'Audible stridor and expiratory wheeze', 'Profound hypotension', 'Sense of impending doom', 'Cool, mottled peripheries'],
  arrest: ['Loss of palpable central pulse', 'Silent chest — no air entry', 'Unresponsive — peri-arrest'],
};

const ALLERGIC_FINDINGS: AdverseReaction['findings'] = {
  onset: ['Localised urticaria / hives', 'Flushing and itching', 'Mild anxiety'],
  peak: ['Widespread urticaria', 'Mild expiratory wheeze', 'Tachycardia with a modest BP dip'],
  arrest: ['Symptoms plateau — monitor for escalation'],
};

/**
 * Build the adverse reaction triggered by giving `treatment` to a patient
 * with the supplied allergy list + current vitals. Returns null when the
 * treatment is safe for this patient.
 */
export function buildReactionForTreatment(
  treatment: Treatment,
  patient: { vitals?: VitalSigns | null; allergies?: string[] },
): AdverseReaction | null {
  const match = matchAllergy(treatment, patient.allergies);
  if (!match) return null;

  // Exact documented allergy → anaphylaxis. Cross-reactive class hit →
  // milder allergic reaction (still escalatable for high-risk tokens).
  const highRisk = HIGH_RISK_TOKENS.has(match.via);
  const kind: ReactionKind = match.kind === 'exact' || highRisk ? 'anaphylaxis' : 'allergic';

  const headline = kind === 'anaphylaxis'
    ? `Anaphylaxis — ${treatment.name} given despite documented "${match.allergy}" allergy`
    : `Allergic reaction to ${treatment.name} (cross-reacts with "${match.allergy}")`;

  return {
    id: `reaction-${treatment.id}`,
    treatmentId: treatment.id,
    treatmentName: treatment.name,
    match,
    kind,
    headline,
    findings: kind === 'anaphylaxis' ? ANAPHYLAXIS_FINDINGS : ALLERGIC_FINDINGS,
    onsetMs: kind === 'anaphylaxis' ? 4000 : 6000,
    escalateMs: 90000, // 90s to give adrenaline before peri-arrest (anaphylaxis)
    canProgressToArrest: kind === 'anaphylaxis',
    rescueTreatmentIds: RESCUE_IDS,
    adjunctTreatmentIds: ADJUNCT_IDS,
  };
}
