/**
 * Runtime contraindication checker.
 *
 * Evaluates a treatment against the CURRENT patient state and returns a
 * list of concrete contraindications — not the generic string array on
 * the treatment itself. The student's med-confirm dialog already surfaces
 * the static list; this adds the smart, vitals-aware checks that catch:
 *
 *   - GTN in hypotension (SBP < 90)
 *   - Adenosine / sedatives in shock
 *   - Beta-blockers in bradycardia / decompensated HF
 *   - Aspirin in active GI bleed
 *   - IV adrenaline (1mg) push in non-arrest patients
 *
 * Returns a severity flag so the UI can decide: soft warning (continue
 * with confirmation), or hard block (refuse unless override).
 */

import type { Treatment } from '@/data/enhancedTreatmentEffects';

export type ContraindicationSeverity = 'warn' | 'block';

export interface RuntimeContraindication {
  severity: ContraindicationSeverity;
  reason: string;
  /** Clinician-readable guidance for what to do instead. */
  alternative?: string;
}

interface PatientSnapshot {
  bp?: string;            // e.g. "90/60"
  pulse?: number;
  spo2?: number;
  respiration?: number;
  temperature?: number;
  gcs?: number;
  currentRhythm?: string;
  isInArrest?: boolean;
  /** Free-text findings (abcde.circulation.findings, expectedFindings, etc.) */
  findings?: string[];
  caseSubcategory?: string;
}

function parseSBP(bp?: string): number | null {
  if (!bp) return null;
  const n = parseInt(bp.split('/')[0], 10);
  return Number.isNaN(n) ? null : n;
}

function findingsText(p: PatientSnapshot): string {
  return ((p.findings ?? []).join(' ') + ' ' + (p.caseSubcategory ?? '')).toLowerCase();
}

/**
 * Main check. Returns all contraindications found; caller decides whether
 * to block (any `severity: 'block'`) or warn.
 */
export function checkRuntimeContraindications(
  treatment: Treatment,
  patient: PatientSnapshot,
): RuntimeContraindication[] {
  const hits: RuntimeContraindication[] = [];
  const id = treatment.id;
  const sbp = parseSBP(patient.bp);
  const hr = patient.pulse ?? undefined;
  const findings = findingsText(patient);
  const rhythm = (patient.currentRhythm || '').toLowerCase();

  // ---- GTN / nitrates — bad in hypotension -------------------------------
  if (id === 'gtn_spray' || id === 'nitroglycerin' || id.includes('gtn')) {
    if (sbp !== null && sbp < 90) {
      hits.push({
        severity: 'block',
        reason: `GTN is contraindicated — SBP ${sbp} mmHg (below 90). Giving GTN now will drop BP further and risk arrest.`,
        alternative: 'Treat hypotension first: position supine, IV fluids, reassess cause (inferior MI? RV infarct? bleeding?).',
      });
    }
    // Inferior STEMI — RV infarct risk, GTN can crash BP
    if (rhythm.includes('inferior stemi') || findings.includes('inferior stemi')) {
      hits.push({
        severity: 'warn',
        reason: 'Inferior STEMI — up to 40% have RV involvement. GTN can precipitate profound hypotension by dropping preload.',
        alternative: 'Skip GTN. IV fluids if RV infarct suspected (clear lungs + elevated JVP).',
      });
    }
  }

  // ---- Adenosine — pulseless / wide-complex / hypotensive ---------------
  if (id === 'adenosine_6mg' || id === 'adenosine_12mg') {
    if (patient.isInArrest) {
      hits.push({
        severity: 'block',
        reason: 'Patient is in cardiac arrest — adenosine will not work on a pulseless rhythm.',
        alternative: 'ALS algorithm: CPR + rhythm check + defibrillate if shockable + adrenaline.',
      });
    }
    if (rhythm.includes('atrial fibrillation') || rhythm.includes('atrial flutter')) {
      hits.push({
        severity: 'warn',
        reason: 'Adenosine has minimal effect on atrial fibrillation / flutter — it slows conduction briefly but will NOT cardiovert.',
        alternative: 'Rate control (beta-blocker / diltiazem) or electrical cardioversion if unstable.',
      });
    }
    if (sbp !== null && sbp < 90) {
      hits.push({
        severity: 'warn',
        reason: `Adenosine in SBP ${sbp} — transient AV block can further drop perfusion. Consider synchronised DC cardioversion instead.`,
      });
    }
    if (rhythm.includes('wide')) {
      hits.push({
        severity: 'warn',
        reason: 'Wide-complex tachycardia — treat as VT unless proven SVT-with-aberrancy. Adenosine in VT is diagnostic-at-best.',
      });
    }
  }

  // ---- Morphine / Fentanyl / Midazolam in shock -------------------------
  if (id === 'morphine_5mg' || id === 'fentanyl_50mcg' || id === 'midazolam_5mg' || id === 'midazolam_buccal') {
    if (sbp !== null && sbp < 90) {
      hits.push({
        severity: 'warn',
        reason: `${treatment.name}: patient is hypotensive (SBP ${sbp}). Opioids/benzos blunt sympathetic drive and can deepen shock.`,
        alternative: 'Treat the cause of hypotension first (fluids / blood / adrenaline for anaphylaxis). Use smaller doses + monitor closely if still required.',
      });
    }
    if ((patient.respiration ?? 16) < 10) {
      hits.push({
        severity: 'warn',
        reason: `${treatment.name}: RR already ${patient.respiration}. Respiratory depression risk — plan for airway support.`,
      });
    }
  }

  // ---- Beta-blockers in bradycardia / AV block --------------------------
  if (id === 'metoprolol_5mg' || id === 'labetalol_20mg') {
    if (hr !== undefined && hr < 60) {
      hits.push({
        severity: 'block',
        reason: `Beta-blocker in HR ${hr} — high risk of inducing heart block / asystole.`,
        alternative: 'Address the underlying cause. If rate control is still needed once HR > 60, reassess.',
      });
    }
    if (rhythm.includes('complete heart block') || rhythm.includes('mobitz') || rhythm.includes('3rd degree')) {
      hits.push({
        severity: 'block',
        reason: 'Beta-blocker in high-grade AV block will worsen the block and cause pre-arrest.',
        alternative: 'Pacing pads + atropine 500 mcg + transcutaneous pacing if unstable.',
      });
    }
    // Decompensated HF
    if (findings.includes('pulmonary oedema') || findings.includes('pulmonary edema') || findings.includes('crackles') || findings.includes('chf exacerbat')) {
      hits.push({
        severity: 'warn',
        reason: 'Beta-blocker in decompensated heart failure — negative inotropy can precipitate cardiogenic shock.',
        alternative: 'Treat the decompensation first: CPAP, GTN if SBP > 100, furosemide.',
      });
    }
  }

  // ---- Aspirin in active bleeding ---------------------------------------
  if (id === 'aspirin_300mg' || id.includes('aspirin')) {
    if (findings.includes('gi bleed') || findings.includes('haematemesis') || findings.includes('melaena')
        || findings.includes('active bleeding') || findings.includes('haemorrhag') || findings.includes('hemorrhag')) {
      hits.push({
        severity: 'warn',
        reason: 'Aspirin in active GI or haemorrhagic bleeding — antiplatelet effect can worsen bleed severity.',
        alternative: 'Withhold pending ED review. Address haemodynamic compromise + consider reversal agents at hospital.',
      });
    }
    if (findings.includes('haemorrhagic stroke') || findings.includes('intracranial h') || findings.includes('sah') || findings.includes('ich')) {
      hits.push({
        severity: 'block',
        reason: 'Aspirin in suspected haemorrhagic stroke / intracranial bleed — contraindicated, worsens bleed.',
        alternative: 'Stroke unit pre-alert. Aspirin only after CT excludes bleed.',
      });
    }
  }

  // ---- Adrenaline 1mg IV push in a patient with a pulse -----------------
  if (id === 'adrenaline_1mg') {
    if (!patient.isInArrest && (hr === undefined || hr > 30)) {
      hits.push({
        severity: 'warn',
        reason: `IV adrenaline 1 mg push is an ARREST dose. Patient has HR ${hr ?? '?'} — this will cause severe tachycardia, hypertension, and arrhythmia risk.`,
        alternative: 'For anaphylaxis use 0.5 mg IM (adult). For bradycardia / post-ROSC use 1–10 mcg/min IV infusion, not a push dose.',
      });
    }
  }

  // ---- Salbutamol in tachyarrhythmia ------------------------------------
  if (id === 'salbutamol_iv' && hr !== undefined && hr > 150) {
    hits.push({
      severity: 'warn',
      reason: `Salbutamol IV in HR ${hr} — beta-2 effect worsens tachycardia and can precipitate arrhythmia.`,
      alternative: 'Maximise nebulised route first. If IV is required, start low (2-5 mcg/min) and titrate.',
    });
  }

  // ---- Fluids in known heart failure / pulm oedema ----------------------
  if (id === 'fluids_500ml' || id === 'fluids_1000ml' || id === 'hartmanns_1l' || id === 'saline_1l') {
    if (findings.includes('pulmonary oedema') || findings.includes('pulmonary edema')
        || (patient.caseSubcategory || '').toLowerCase().includes('heart failure')) {
      hits.push({
        severity: 'warn',
        reason: 'Crystalloid bolus in decompensated heart failure / pulmonary oedema — worsens fluid overload and drops SpO2.',
        alternative: 'CPAP, GTN if SBP > 100, and furosemide 40–80 mg IV. Fluids only if frankly hypotensive with a clear alternative cause.',
      });
    }
  }

  return hits;
}
