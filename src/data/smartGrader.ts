/**
 * Deterministic "smart" grader
 * ============================
 *
 * The session already produces an authoritative overall percentage (checklist
 * + treatment bonus − penalties). This module turns the raw signals behind
 * that number into a **reasoning-style breakdown** — four weighted clinical
 * dimensions, plus plain-English strengths, improvements, and a short
 * narrative — so the debrief reads like an examiner's comment rather than a
 * bare score.
 *
 * It is fully deterministic (no LLM, no network, works offline). The shape is
 * deliberately self-contained so an LLM-backed grader (a Supabase Edge
 * Function) can later implement the same `SmartGrade` contract as a drop-in
 * upgrade without touching the UI.
 */

export interface SmartGradeInput {
  /** Authoritative final percentage from the session (0-100). */
  overall: number;
  /** Assessment scoring. */
  assessmentScore: number;
  assessmentTotal: number;
  /** Critical actions. */
  criticalItems: number;
  criticalCompleted: number;
  /** Treatments. */
  treatmentCount: number;
  timeToFirstTreatmentSec: number | null;
  totalTimeSec: number;
  estimatedDurationMin: number;
  /** Oxygenation trend. */
  spo2Improved: boolean;
  /** Number of contraindicated treatments administered. */
  contraindicationCount: number;
  /** Number of treatments that did not fit the presentation. */
  inappropriateTreatmentCount: number;
  /** Number of treatments likely to worsen or distress the patient. */
  harmfulTreatmentCount: number;
  /** Allergy / adverse-reaction outcomes. */
  adverseInduced: number;
  adverseRescued: number;
  adverseArrests: number;
  /** Dangerous vitals left unresolved at case end. */
  finalVitalsDangerous: boolean;
}

export type DimensionKey = 'assessment' | 'management' | 'timing' | 'safety';

export interface SmartGradeDimension {
  key: DimensionKey;
  label: string;
  /** 0-100. */
  score: number;
  /** Relative weight (the four sum to 1). */
  weight: number;
  /** One-line examiner comment for this dimension. */
  summary: string;
}

export interface SmartGrade {
  /** Mirrors the authoritative session percentage. */
  overall: number;
  band: { label: string; tone: 'excellent' | 'good' | 'fair' | 'poor' };
  dimensions: SmartGradeDimension[];
  strengths: string[];
  improvements: string[];
  /** 2–3 sentence synthesis. */
  narrative: string;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const pct = (n: number, d: number) => (d > 0 ? clamp(Math.round((n / d) * 100)) : 0);

function band(overall: number): SmartGrade['band'] {
  if (overall >= 85) return { label: 'Excellent', tone: 'excellent' };
  if (overall >= 70) return { label: 'Competent', tone: 'good' };
  if (overall >= 55) return { label: 'Developing', tone: 'fair' };
  return { label: 'Needs Improvement', tone: 'poor' };
}

export function computeSmartGrade(input: SmartGradeInput): SmartGrade {
  // ── Assessment & Recognition ────────────────────────────────────────────
  const assessmentPct = pct(input.assessmentScore, input.assessmentTotal);
  const criticalPct = input.criticalItems > 0
    ? pct(input.criticalCompleted, input.criticalItems)
    : 100;
  const assessment = Math.round(assessmentPct * 0.6 + criticalPct * 0.4);
  const assessmentSummary = assessment >= 80
    ? 'Systematic, thorough assessment — most critical findings identified.'
    : assessment >= 55
      ? 'Reasonable assessment, but some critical findings were missed.'
      : 'Assessment was incomplete — key findings were not identified.';

  // ── Clinical Management ─────────────────────────────────────────────────
  // Anchored to the overall (which already reflects treatment bonus/penalties)
  // then nudged by concrete signals.
  let management = clamp(input.overall + (input.spo2Improved ? 6 : 0));
  if (input.treatmentCount === 0) management = clamp(management - 25);
  management = clamp(management - input.contraindicationCount * 12);
  management = clamp(management - input.inappropriateTreatmentCount * 5);
  management = clamp(management - input.harmfulTreatmentCount * 12);
  const managementSummary = input.harmfulTreatmentCount > 0
    ? `Management included ${input.harmfulTreatmentCount} intervention${input.harmfulTreatmentCount > 1 ? 's' : ''} likely to cause harm or distress.`
    : input.contraindicationCount > 0
    ? `Management undermined by ${input.contraindicationCount} contraindicated treatment${input.contraindicationCount > 1 ? 's' : ''}.`
    : input.inappropriateTreatmentCount > 0
      ? `${input.inappropriateTreatmentCount} intervention${input.inappropriateTreatmentCount > 1 ? 's did' : ' did'} not fit the presentation.`
    : management >= 80
      ? 'Appropriate, well-targeted interventions for this presentation.'
      : input.treatmentCount === 0
        ? 'No treatment was delivered — the patient needed active management.'
        : 'Interventions were partially appropriate; review the protocol.';

  // ── Timing & Efficiency ─────────────────────────────────────────────────
  let timing = 75;
  if (input.timeToFirstTreatmentSec != null) {
    if (input.timeToFirstTreatmentSec <= 120) timing += 20;
    else if (input.timeToFirstTreatmentSec <= 300) timing += 5;
    else timing -= 10;
  } else if (input.treatmentCount === 0) {
    timing -= 20;
  }
  const overrun = input.totalTimeSec - input.estimatedDurationMin * 60;
  if (overrun > 300) timing -= 15;
  else if (overrun < 0) timing += 5;
  timing = clamp(timing);
  const timingSummary = timing >= 80
    ? 'Time-critical actions were delivered promptly.'
    : timing >= 55
      ? 'Acceptable pace, with room to act sooner on key interventions.'
      : 'Important interventions were delayed — speed matters in these cases.';

  // ── Patient Safety ──────────────────────────────────────────────────────
  let safety = 100;
  safety -= input.contraindicationCount * 20;
  safety -= input.inappropriateTreatmentCount * 8;
  safety -= input.harmfulTreatmentCount * 20;
  safety -= input.adverseInduced * 45;
  safety += input.adverseRescued * 18; // recognising + treating the reaction
  safety -= input.adverseArrests * 15;
  if (input.finalVitalsDangerous) safety -= 15;
  safety = clamp(safety);
  const safetySummary = input.adverseInduced > 0
    ? input.adverseRescued >= input.adverseInduced
      ? 'Administered an allergen, but recognised and treated the reaction.'
      : 'Administered a drug the patient was allergic to — a serious safety event.'
    : input.harmfulTreatmentCount > 0
      ? 'A harmful intervention was attempted — match every treatment to the patient’s physiology.'
    : input.contraindicationCount > 0
      ? 'A contraindicated drug was given — check vitals/history before administering.'
      : input.inappropriateTreatmentCount > 0
        ? 'Some interventions did not fit the presentation.'
      : safety >= 90
        ? 'Safe practice — no contraindicated or allergenic drugs given.'
        : 'Some safety concerns at case end.';

  const dimensions: SmartGradeDimension[] = [
    { key: 'assessment', label: 'Assessment & Recognition', score: assessment, weight: 0.30, summary: assessmentSummary },
    { key: 'management', label: 'Clinical Management', score: management, weight: 0.30, summary: managementSummary },
    { key: 'timing', label: 'Timing & Efficiency', score: timing, weight: 0.15, summary: timingSummary },
    { key: 'safety', label: 'Patient Safety', score: safety, weight: 0.25, summary: safetySummary },
  ];

  // ── Strengths / improvements ────────────────────────────────────────────
  const strengths: string[] = [];
  const improvements: string[] = [];
  if (assessment >= 80) strengths.push('Strong systematic assessment (ABCDE).');
  else improvements.push('Complete the primary survey before moving to treatment.');
  if (input.criticalItems > 0 && input.criticalCompleted === input.criticalItems) strengths.push('All critical actions performed.');
  else if (input.criticalItems > 0) improvements.push(`Perform all critical actions (${input.criticalCompleted}/${input.criticalItems} done).`);
  if (timing >= 80) strengths.push('Prompt, decisive intervention.');
  else if (input.timeToFirstTreatmentSec == null && input.treatmentCount === 0) improvements.push('Treat the patient — recognition without action does not help.');
  if (input.spo2Improved) strengths.push('Interventions improved oxygenation.');
  if (input.adverseInduced > 0 && input.adverseRescued >= input.adverseInduced) strengths.push('Recognised and managed the anaphylaxis you triggered.');
  if (input.adverseInduced > 0) improvements.push('Always check allergies (SAMPLE) before giving any drug — you administered an allergen.');
  if (input.contraindicationCount > 0) improvements.push('Re-check contraindications against current vitals before administering.');
  if (input.inappropriateTreatmentCount > 0) improvements.push('Match each intervention to a confirmed indication before applying it.');
  if (input.harmfulTreatmentCount > 0) improvements.push('Avoid interventions likely to worsen physiology or distress an alert patient.');
  if (input.finalVitalsDangerous) improvements.push('Do not stop until vitals are stabilised or handed over.');
  if (improvements.length === 0) improvements.push('Maintain this standard and push for speed and reassessment.');

  // ── Narrative ───────────────────────────────────────────────────────────
  const b = band(input.overall);
  const lead = b.tone === 'excellent'
    ? 'A strong, safe performance.'
    : b.tone === 'good'
      ? 'A competent performance overall.'
      : b.tone === 'fair'
        ? 'A developing performance with clear gaps to close.'
        : 'This case needs significant review.';
  const safetyNote = input.adverseInduced > 0
    ? input.adverseRescued >= input.adverseInduced
      ? ' Critically, you gave a drug the patient was allergic to — but you recognised the anaphylaxis and treated it, which recovered the situation.'
      : ' The most serious issue was administering a drug the patient was documented allergic to; this must be caught with an allergy check before every medication.'
    : input.harmfulTreatmentCount > 0
      ? ' A harmful intervention was attempted; pause and confirm the indication before applying invasive or physiologically risky care.'
    : input.contraindicationCount > 0
      ? ' Watch contraindications — a drug was given that this presentation does not tolerate.'
      : input.inappropriateTreatmentCount > 0
        ? ' Some care did not match the presentation; make the indication explicit before treating.'
      : '';
  const focus = improvements[0] ? ` Focus next on: ${improvements[0].toLowerCase()}` : '';
  const narrative = `${lead} ${assessmentSummary}${safetyNote}${focus}`.replace(/\s+/g, ' ').trim();

  return { overall: input.overall, band: b, dimensions, strengths, improvements, narrative };
}
