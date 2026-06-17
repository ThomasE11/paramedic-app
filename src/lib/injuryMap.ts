/**
 * Injury inference — single source of truth for "what is visibly wrong with
 * this patient and where".
 *
 * Three surfaces consume this:
 *   1. SceneSurveyPanel's ProceduralPatient (stylised pre-arrival figure)
 *   2. The 2D InjuryMap companion in the active case
 *   3. Injury pips layered onto the 3D body's Html landmark overlay
 *
 * Keeping the detection in one place means a case that says "left leg
 * shortened and externally rotated" lights up the same way everywhere,
 * and adding a new injury phrase fixes all three surfaces at once.
 *
 * Detection is regex over the case's free-text clinical fields. It's
 * deliberately conservative — better to miss a subtle finding than to
 * paint an injury that isn't there. The phrases were tuned against the
 * real case bank (see scripts/audit-cases.mjs for the corpus).
 */

import type { CaseScenario } from '@/types';

// ---------------------------------------------------------------------------
// Legacy shape — consumed by SceneSurveyPanel's ProceduralPatient. Kept
// identical so that component doesn't need rewriting.
// ---------------------------------------------------------------------------
export type PatientAnatomy = {
  leftLeg: { shortened: boolean; externallyRotated: boolean; deformed: boolean; bleeding: boolean };
  rightLeg: { shortened: boolean; externallyRotated: boolean; deformed: boolean; bleeding: boolean };
  leftArm: { deformed: boolean; bleeding: boolean };
  rightArm: { deformed: boolean; bleeding: boolean };
  facialInjury: boolean;
  unconscious: boolean;
  pale: boolean;
  cyanotic: boolean;
};

/**
 * Break the case's clinical free-text into individual clauses (one finding
 * each, roughly). Detection then matches WITHIN a single clause rather than
 * across the whole concatenated blob — this is what stops "open the airway"
 * + "chest pain" from being read as an "open chest wound", or "right
 * coronary" + "blood pressure" as "right leg bleeding".
 *
 * Array fields (secondarySurvey.*, findings) are already one-finding-per-item,
 * so each item is its own clause. String fields are split on sentence and
 * clause punctuation.
 */
function buildClauses(caseData: CaseScenario): string[] {
  const ss = caseData.secondarySurvey;
  const ex = caseData.abcde?.exposure;
  // Each array carries a region word so its items keep their region context
  // (e.g. the pelvis array item "unstable on compression" becomes
  // "pelvis unstable on compression" — recovering region scope without
  // bleeding cross-field noise the way the old single-blob haystack did).
  const labelled: Array<{ prefix: string; items?: string[] }> = [
    { prefix: '', items: ss?.extremities },          // extremities mention left/right leg themselves
    { prefix: 'pelvis', items: ss?.pelvis },
    { prefix: 'head', items: ss?.head },
    { prefix: 'chest', items: ss?.chest },
    { prefix: 'abdomen', items: ss?.abdomen },
    { prefix: 'neck', items: ss?.neck },
    { prefix: 'back', items: ss?.posterior },
    { prefix: '', items: ex?.findings },
    { prefix: '', items: ex?.deformities },
    { prefix: 'chest', items: caseData.abcde?.breathing?.findings },
    { prefix: '', items: caseData.abcde?.circulation?.findings },
  ];
  const strings: (string | undefined)[] = [
    caseData.sceneInfo?.description,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.consciousness,
  ];
  const clauses: string[] = [];
  for (const { prefix, items } of labelled) {
    if (items) for (const item of items) {
      if (item) clauses.push(`${prefix} ${item}`.toLowerCase().trim());
    }
  }
  for (const s of strings) {
    if (s) for (const part of s.split(/[.;,]|\band\b/)) {
      const c = part.toLowerCase().trim();
      if (c) clauses.push(c);
    }
  }
  return clauses;
}

/** True if any clause matches `re` AND that clause isn't negated. */
function anyClause(clauses: string[], re: RegExp): boolean {
  return clauses.some(c => re.test(c) && !isNegated(c, re));
}

/** Detect "no X", "without X", "denies X", "absent X" negation in a clause. */
function isNegated(clause: string, re: RegExp): boolean {
  const m = clause.match(re);
  if (!m || m.index === undefined) return false;
  // Look at the ~24 chars before the match for a negation cue.
  const before = clause.slice(Math.max(0, m.index - 24), m.index);
  return /\b(no|not|without|denies|denied|negative for|absent|nil|free of|ruled out)\b[\s\w]*$/.test(before);
}

// "Bleeding" must be an explicit haemorrhage word — NOT bare "blood", which
// catches "blood pressure", "blood glucose", "blood sugar", "blood at meatus".
const BLEED = /\b(bleed(ing)?|haemorrh|hemorrh|blood loss|exsanguinat|active bleed|oozing blood|pooling blood|losing blood)\b/;
// A leg/limb finding must mention the limb AND an injury word in the SAME clause.
const isLeg = (s: string) => /\b(leg|thigh|femur|femoral|knee|tibia|fibula|shin|ankle|foot|lower limb|hip)\b/.test(s);
const isLeftWord = (s: string) => /\bleft\b|\bl\.?\s/.test(s) || /\(l\)/.test(s);
const isRightWord = (s: string) => /\bright\b|\br\.?\s/.test(s) || /\(r\)/.test(s);

export function inferAnatomy(caseData: CaseScenario): PatientAnatomy {
  const clauses = buildClauses(caseData);

  // Find clauses that are clearly about one leg, then test injury words
  // within just those clauses. Side defaults: if a clause says "leg" with
  // neither left nor right, attribute to the side already implicated, else
  // skip (don't guess).
  const legClause = (side: 'left' | 'right', re: RegExp) =>
    clauses.some(c => isLeg(c) && (side === 'left' ? isLeftWord(c) : isRightWord(c)) && re.test(c) && !isNegated(c, re));
  const armClause = (side: 'left' | 'right', re: RegExp) =>
    clauses.some(c => /\b(arm|elbow|wrist|forearm|humerus|shoulder|hand)\b/.test(c) && (side === 'left' ? isLeftWord(c) : isRightWord(c)) && re.test(c) && !isNegated(c, re));

  const ROT = /\b(externally|external)?\s*rotat/;
  const SHORT = /\bshorten/;
  const DEFORM = /\b(deform|fractur|angulat|displac)/;

  return {
    leftLeg: {
      shortened: legClause('left', SHORT),
      externallyRotated: legClause('left', ROT),
      deformed: legClause('left', DEFORM),
      bleeding: legClause('left', BLEED),
    },
    rightLeg: {
      shortened: legClause('right', SHORT),
      externallyRotated: legClause('right', ROT),
      deformed: legClause('right', DEFORM),
      bleeding: legClause('right', BLEED),
    },
    leftArm: {
      deformed: armClause('left', DEFORM),
      bleeding: armClause('left', BLEED),
    },
    rightArm: {
      deformed: armClause('right', DEFORM),
      bleeding: armClause('right', BLEED),
    },
    facialInjury: anyClause(clauses, /\b(facial (fracture|injur|wound|trauma)|head (trauma|injury|laceration|wound)|scalp (lac|wound|haematoma))\b/),
    unconscious: anyClause(clauses, /\b(unconscious|unresponsive)\b/) || (typeof (caseData.abcde?.disability?.gcs?.total) === 'number' && caseData.abcde!.disability!.gcs!.total <= 8),
    pale: anyClause(clauses, /\b(pale|ashen|pallor)\b/),
    cyanotic: anyClause(clauses, /\b(cyanotic|cyanosis|cyanosed)\b/),
  };
}

// ---------------------------------------------------------------------------
// Structured injury list — for the 2D map + 3D pips. Coordinates are % on a
// front-facing anterior body diagram (0,0 = top-left, 100,100 = bottom-right),
// tuned to the InjuryMap SVG silhouette.
// ---------------------------------------------------------------------------

export type BodyRegion =
  | 'head' | 'face' | 'neck' | 'airway'
  | 'chest' | 'abdomen' | 'pelvis'
  | 'left-arm' | 'right-arm'
  | 'left-leg' | 'right-leg'
  | 'back';

export type InjuryKind =
  | 'deformity' | 'rotation' | 'shortening' | 'fracture'
  | 'bleeding' | 'wound' | 'burn' | 'bruising'
  | 'flail' | 'swelling' | 'amputation' | 'distension';

export type InjurySeverity = 'critical' | 'major' | 'minor';

export interface BodyInjury {
  id: string;
  region: BodyRegion;
  kind: InjuryKind;
  /** Short label shown on the pip, e.g. "Ext. rotation", "Flail segment". */
  label: string;
  /** Longer clinical description for the side list / tooltip. */
  detail: string;
  severity: InjurySeverity;
  /** Anterior body-diagram coordinates (%), for the 2D map. */
  x: number;
  y: number;
}

export interface GeneralAppearance {
  pale: boolean;
  cyanotic: boolean;
  diaphoretic: boolean;
  unconscious: boolean;
  distressed: boolean;
}

// Anterior diagram anchor points per region (front view, patient's own
// left is on the VIEWER's right — mirrored, standard clinical convention).
const REGION_ANCHOR: Record<BodyRegion, { x: number; y: number }> = {
  head: { x: 50, y: 8 },
  face: { x: 50, y: 10 },
  neck: { x: 50, y: 17 },
  airway: { x: 50, y: 15 },
  chest: { x: 50, y: 30 },
  abdomen: { x: 50, y: 44 },
  pelvis: { x: 50, y: 53 },
  'right-arm': { x: 28, y: 40 }, // viewer-left = patient's right
  'left-arm': { x: 72, y: 40 },
  'right-leg': { x: 43, y: 76 },
  'left-leg': { x: 57, y: 76 },
  back: { x: 50, y: 32 },
};

function sev(kind: InjuryKind): InjurySeverity {
  switch (kind) {
    case 'amputation':
    case 'flail':
      return 'critical';
    case 'bleeding':
    case 'fracture':
    case 'deformity':
    case 'rotation':
    case 'distension':
      return 'major';
    default:
      return 'minor';
  }
}

/**
 * Build the structured injury list. Reuses the legacy anatomy detection for
 * the limbs, then adds torso/chest/abdomen/airway findings the procedural
 * figure didn't cover.
 */
export function inferInjuries(caseData: CaseScenario): BodyInjury[] {
  const clauses = buildClauses(caseData);
  const has = (re: RegExp) => anyClause(clauses, re);
  const a = inferAnatomy(caseData);
  const injuries: BodyInjury[] = [];

  const push = (region: BodyRegion, kind: InjuryKind, label: string, detail: string, dx = 0, dy = 0) => {
    const anchor = REGION_ANCHOR[region];
    injuries.push({
      id: `${region}-${kind}-${injuries.length}`,
      region, kind, label, detail,
      severity: sev(kind),
      x: anchor.x + dx,
      y: anchor.y + dy,
    });
  };

  // ---- Limbs (from legacy anatomy) ----
  const legLabel = (l: PatientAnatomy['leftLeg']): { kind: InjuryKind; label: string } | null => {
    if (l.externallyRotated) return { kind: 'rotation', label: 'Ext. rotation' };
    if (l.shortened) return { kind: 'shortening', label: 'Shortened' };
    if (l.deformed) return { kind: 'deformity', label: 'Deformity' };
    return null;
  };
  const ll = legLabel(a.leftLeg);
  if (ll) push('left-leg', ll.kind, ll.label, `Left leg: ${ll.label.toLowerCase()} — classic of proximal femur / pelvic injury.`);
  if (a.leftLeg.bleeding) push('left-leg', 'bleeding', 'Bleeding', 'Active haemorrhage from the left lower limb.', 2, 6);
  const rl = legLabel(a.rightLeg);
  if (rl) push('right-leg', rl.kind, rl.label, `Right leg: ${rl.label.toLowerCase()}.`);
  if (a.rightLeg.bleeding) push('right-leg', 'bleeding', 'Bleeding', 'Active haemorrhage from the right lower limb.', -2, 6);

  if (a.leftArm.deformed) push('left-arm', 'deformity', 'Deformity', 'Left upper limb deformity / fracture.');
  if (a.leftArm.bleeding) push('left-arm', 'bleeding', 'Bleeding', 'Active haemorrhage from the left arm.', 0, 6);
  if (a.rightArm.deformed) push('right-arm', 'deformity', 'Deformity', 'Right upper limb deformity / fracture.');
  if (a.rightArm.bleeding) push('right-arm', 'bleeding', 'Bleeding', 'Active haemorrhage from the right arm.', 0, 6);

  // ---- Head / face ----
  if (a.facialInjury) {
    push('head', 'wound', 'Head injury', 'Visible head / facial trauma. Consider C-spine.');
  }
  if (has(/\b(angioedema|swollen face|face swelling|facial swelling|lips grossly swollen|tongue swollen|periorbital angioedema)\b/)) {
    push('face', 'swelling', 'Facial swelling', 'Angioedema / airway-risk swelling visible in the face, lips, or tongue.');
  }
  // Base-of-skull: blood/CSF from EAR or NOSE specifically (NOT urethral
  // meatus — that's a pelvic finding), or Battle's/raccoon signs.
  if (has(/\b(blood|csf|fluid)\b[\s\w]*\b(from|at|in)\b[\s\w]*\b(ear|nose|nostril)\b/) || has(/\b(battle'?s sign|raccoon eyes|periorbital (bruis|ecchymos)|mastoid bruis)\b/)) {
    push('head', 'bleeding', 'Base-of-skull signs', 'Blood/CSF from ear or nose, or periorbital/mastoid bruising — base-of-skull fracture markers.', 6, 0);
  }

  // ---- Neck / airway ----
  if (has(/\btrachea(l)?\b[\s\w]*\b(deviat|shift)|\bdeviated trachea\b/)) {
    push('neck', 'deformity', 'Tracheal deviation', 'Trachea deviated — late tension pneumothorax sign.');
  }
  if (has(/\b(jvd|jugular venous distension|distended neck veins|raised jvp|elevated jvp)\b/)) {
    push('neck', 'distension', 'JVD', 'Distended neck veins — obstructive shock (tension PTX / tamponade).', -8, 0);
  }

  // ---- Chest ----
  if (has(/\b(flail (segment|chest)|paradoxical (chest|movement|wall))\b/)) {
    push('chest', 'flail', 'Flail segment', 'Flail chest — paradoxical movement, underlying pulmonary contusion.', -8, 0);
  }
  // Open chest wound: keywords must co-occur with chest IN THE SAME CLAUSE.
  if (has(/\b(penetrating|stab(bed| wound)?|gsw|gunshot|sucking|open)\b[\s\w]*\b(chest|thorax|thoracic)\b/) || has(/\b(chest|thorax)\b[\s\w]*\b(stab|gsw|gunshot|penetrat|sucking|open wound)\b/) || has(/\bsucking chest\b|\bopen pneumothorax\b/)) {
    push('chest', 'wound', 'Open chest wound', 'Penetrating / sucking chest wound — needs a chest seal.', 8, -2);
  }
  if (has(/\b(chest|sternum|sternal)\b[\s\w]*\b(bruis|ecchymos|seatbelt)\b/) || has(/\bseatbelt sign\b/)) {
    push('chest', 'bruising', 'Chest bruising', 'Chest-wall bruising / seatbelt sign — suspect underlying injury.', 0, 4);
  }

  // ---- Abdomen / pelvis ----
  if (has(/\b(abdomen|abdominal)\b[\s\w]*\b(distend|rigid|guard|periton)\b/) || has(/\b(distended|rigid|guarded) abdomen\b/) || has(/\bperitonism\b/)) {
    push('abdomen', 'distension', 'Abdominal distension', 'Distended / rigid abdomen — intra-abdominal bleeding or peritonitis.');
  }
  if (has(/\b(penetrating|stab|gsw|gunshot|eviscerat|open)\b[\s\w]*\b(abdomen|abdominal)\b/) || has(/\babdominal evisc|\bevisceration\b/)) {
    push('abdomen', 'wound', 'Abdominal wound', 'Penetrating abdominal trauma / evisceration.', 8, 0);
  }
  if (has(/\bpelvi(c|s)\b[\s\w]*\b(unstable|fractur|deformit|instab|sprung)\b/) || has(/\bunstable pelvis\b/)) {
    push('pelvis', 'fracture', 'Unstable pelvis', 'Unstable pelvic ring — apply a binder, do NOT spring the pelvis.');
  }

  // ---- Burns ----
  if (has(/\b(burn|burns|scald|charred|singed|partial thickness|full thickness|tbsa)\b/)) {
    const burnRegion: BodyRegion = has(/\b(facial|face|airway|singed (nasal|facial|eyebrow)|soot)\b/) ? 'face'
      : has(/\b(arm|hand|upper limb)\b/) ? 'left-arm'
      : has(/\b(leg|thigh|lower limb)\b/) ? 'left-leg'
      : 'chest';
    push(burnRegion, 'burn', 'Burn', 'Burn injury — estimate TBSA, watch for airway involvement.');
  }

  // ---- Amputation ----
  if (has(/\b(amputat|traumatic amput|degloving|deglov)\b/)) {
    const region: BodyRegion = has(/\b(leg|foot|thigh|lower limb)\b/) ? 'left-leg' : 'left-arm';
    push(region, 'amputation', 'Amputation', 'Traumatic amputation — tourniquet, retrieve the part.');
  }

  return injuries;
}

export function inferGeneralAppearance(caseData: CaseScenario): GeneralAppearance {
  const clauses = buildClauses(caseData);
  const gcs = caseData.abcde?.disability?.gcs?.total ?? caseData.vitalSignsProgression?.initial?.gcs;
  return {
    pale: anyClause(clauses, /\b(pale|ashen|pallor)\b/),
    cyanotic: anyClause(clauses, /\b(cyanotic|cyanosis|cyanosed)\b/),
    diaphoretic: anyClause(clauses, /\b(diaphor|sweating|sweaty|clammy)\b/),
    unconscious: anyClause(clauses, /\b(unconscious|unresponsive)\b/) || (typeof gcs === 'number' && gcs <= 8),
    distressed: anyClause(clauses, /\b(distress|gasping|agonal|writhing|moaning|laboured)\b/),
  };
}

/**
 * Map a BodyInjury region to the 3D body's region IDs (used to anchor
 * injury pips on the existing Html landmark layer).
 */
// Maps to the Body3DModel region IDs (BodyMesh.tsx): head, face,
// neck-cspine, chest, abdomen, pelvis, left/right-arm, left/right-leg,
// posterior-logroll. These are the keys that land in `assessedRegions`,
// so a finding reveals exactly when its region has been examined.
export function injuryRegionTo3D(region: BodyRegion): string {
  switch (region) {
    case 'left-arm': return 'left-arm';
    case 'right-arm': return 'right-arm';
    case 'left-leg': return 'left-leg';
    case 'right-leg': return 'right-leg';
    case 'face': return 'face';
    case 'head': return 'head';
    case 'airway':
    case 'neck': return 'neck-cspine';
    case 'chest': return 'chest';
    case 'abdomen': return 'abdomen';
    case 'pelvis': return 'pelvis';
    case 'back': return 'posterior-logroll';
    default: return 'chest';
  }
}

export const SEVERITY_STYLE: Record<InjurySeverity, { ring: string; dot: string; text: string; bg: string }> = {
  critical: { ring: 'ring-rose-500/60', dot: 'bg-rose-500', text: 'text-rose-50', bg: 'bg-rose-600/90' },
  major:    { ring: 'ring-orange-500/60', dot: 'bg-orange-500', text: 'text-orange-50', bg: 'bg-orange-600/90' },
  minor:    { ring: 'ring-amber-400/60', dot: 'bg-amber-400', text: 'text-amber-950', bg: 'bg-amber-300/90' },
};
