#!/usr/bin/env node
// @ts-check
/**
 * Case consistency auditor (Phase 1 of the case-physiology audit).
 *
 * Usage:   node scripts/audit-cases.mjs [--json] [--category cardiac] [--id some-case-id]
 *
 * Loads every case from src/data/cases.ts via jiti (which handles the @/* TS
 * path alias) and runs a set of structural consistency rules against each.
 *
 * Rules are organised by severity — ERROR (must fix, runtime misbehaviour),
 * WARN (correlation mismatch between narrative and vitals), INFO (minor
 * polish). Each rule has a stable `id` so the report stays diffable across
 * runs and a case can be allowlisted for a specific rule if we decide the
 * apparent mismatch is clinically justified.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);

// jiti handles TS, ESM, and tsconfig path aliases (@/*).
const jiti = require('jiti')(projectRoot, {
  interopDefault: true,
  alias: { '@': resolve(projectRoot, 'src') },
  esmResolve: true,
});

/** @type {{ allCases: any[] }} */
const mod = jiti('./src/data/cases.ts');
const allCases = mod.allCases ?? mod.default?.allCases ?? [];

if (!Array.isArray(allCases) || allCases.length === 0) {
  console.error('Could not load allCases from src/data/cases.ts');
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const arg = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const jsonOut = flag('--json');
const categoryFilter = arg('--category');
const idFilter = arg('--id');

// ============================================================================
// Helpers
// ============================================================================
const has = (haystack, needle) => {
  if (!haystack) return false;
  const s = Array.isArray(haystack) ? haystack.join(' ') : String(haystack);
  return s.toLowerCase().includes(needle.toLowerCase());
};
const anyHas = (arr, needles) => {
  if (!Array.isArray(arr)) return false;
  const s = arr.join(' ').toLowerCase();
  return needles.some((n) => s.includes(n.toLowerCase()));
};
const parseBP = (bp) => {
  if (!bp) return null;
  if (typeof bp === 'object' && 'systolic' in bp) return { sys: bp.systolic, dia: bp.diastolic };
  const m = String(bp).match(/(\d+)\s*\/\s*(\d+)/);
  return m ? { sys: parseInt(m[1], 10), dia: parseInt(m[2], 10) } : null;
};

// ============================================================================
// Rules
// ============================================================================
/**
 * Each rule returns an array of findings (empty if clean).
 * { ruleId, severity: 'ERROR'|'WARN'|'INFO', message, detail? }
 */
const RULES = [
  // ---- BGL / disability sync ---------------------------------------------
  {
    id: 'bgl-not-mirrored-in-vitals',
    severity: 'WARN',
    check: (c) => {
      const abcdeBGL = c.abcde?.disability?.bloodGlucose;
      const vitalsBGL = c.vitalSignsProgression?.initial?.bloodGlucose;
      if (typeof abcdeBGL === 'number' && vitalsBGL === undefined) {
        return [{
          message: `abcde.disability.bloodGlucose is ${abcdeBGL} but vitalSignsProgression.initial.bloodGlucose is missing — monitor will default to 5.5 until the buildInitialVitalsFromCase fallback kicks in.`,
        }];
      }
      if (typeof abcdeBGL === 'number' && typeof vitalsBGL === 'number' && Math.abs(abcdeBGL - vitalsBGL) > 0.5) {
        return [{
          message: `BGL mismatch: abcde.disability=${abcdeBGL} vs vitals.initial=${vitalsBGL}`,
        }];
      }
      return [];
    },
  },

  // ---- GCS / AVPU sync ---------------------------------------------------
  {
    id: 'gcs-avpu-mismatch',
    severity: 'WARN',
    check: (c) => {
      const gcs = c.abcde?.disability?.gcs?.total;
      const avpu = c.abcde?.disability?.avpu;
      if (gcs == null || !avpu) return [];
      // Rough mapping: A≈15, V≈11-14, P≈8-10, U≤8
      const expected =
        avpu === 'A' ? gcs === 15 :
        avpu === 'V' ? gcs >= 10 && gcs <= 14 :
        avpu === 'P' ? gcs >= 6 && gcs <= 9 :
        avpu === 'U' ? gcs <= 8 : true;
      if (!expected) {
        return [{ message: `AVPU=${avpu} but GCS total=${gcs} — ranges expected A:15, V:10-14, P:6-9, U:≤8.` }];
      }
      return [];
    },
  },

  // ---- GCS in vitals vs abcde -------------------------------------------
  {
    id: 'gcs-not-mirrored-in-vitals',
    severity: 'INFO',
    check: (c) => {
      const abcdeG = c.abcde?.disability?.gcs?.total;
      const vitalsG = c.vitalSignsProgression?.initial?.gcs;
      if (typeof abcdeG === 'number' && vitalsG === undefined) {
        return [{ message: `GCS total=${abcdeG} in abcde.disability but not in vitalSignsProgression.initial.` }];
      }
      if (typeof abcdeG === 'number' && typeof vitalsG === 'number' && abcdeG !== vitalsG) {
        return [{ message: `GCS mismatch: abcde=${abcdeG} vs vitals.initial=${vitalsG}` }];
      }
      return [];
    },
  },

  // ---- Breathing: SpO2 vs findings --------------------------------------
  {
    id: 'crackles-but-spo2-normal',
    severity: 'WARN',
    check: (c) => {
      const spo2 = c.abcde?.breathing?.spo2 ?? c.vitalSignsProgression?.initial?.spo2;
      const findings = c.abcde?.breathing?.findings || [];
      const ausc = c.abcde?.breathing?.auscultation || [];
      const hasCrackles = anyHas([...findings, ...ausc], ['crackle', 'rales', 'pulmonary oedema', 'pulmonary edema']);
      if (hasCrackles && typeof spo2 === 'number' && spo2 >= 97) {
        return [{ message: `Crackles/oedema in findings but SpO2=${spo2}% (≥97). Expected some desaturation.` }];
      }
      return [];
    },
  },
  {
    id: 'silent-chest-spo2-too-high',
    severity: 'ERROR',
    check: (c) => {
      const spo2 = c.abcde?.breathing?.spo2 ?? c.vitalSignsProgression?.initial?.spo2;
      const findings = c.abcde?.breathing?.findings || [];
      const ausc = c.abcde?.breathing?.auscultation || [];
      if (anyHas([...findings, ...ausc], ['silent chest', 'absent breath']) && typeof spo2 === 'number' && spo2 >= 92) {
        return [{ message: `Silent/absent breath sounds but SpO2=${spo2}% — silent chest = pre-arrest, expect ≤90%.` }];
      }
      return [];
    },
  },
  {
    id: 'stridor-but-upper-airway-clear',
    severity: 'WARN',
    check: (c) => {
      const bFindings = c.abcde?.breathing?.findings || [];
      const aFindings = c.abcde?.airway?.findings || [];
      const ausc = c.abcde?.breathing?.auscultation || [];
      const hasStridor = anyHas([...bFindings, ...ausc], ['stridor']);
      const airwayNotesCompromise = anyHas(aFindings, ['stridor', 'swelling', 'oedema', 'edema', 'obstruct', 'foreign body', 'angioedema', 'choking', 'unable to']);
      if (hasStridor && !airwayNotesCompromise) {
        return [{ message: `Stridor in breathing findings but airway.findings doesn't mention upper-airway compromise.` }];
      }
      return [];
    },
  },

  // ---- GCS low but airway not protected ----------------------------------
  {
    id: 'low-gcs-airway-not-addressed',
    severity: 'ERROR',
    check: (c) => {
      const gcs = c.abcde?.disability?.gcs?.total ?? c.vitalSignsProgression?.initial?.gcs;
      const airway = c.abcde?.airway;
      if (typeof gcs === 'number' && gcs < 9 && airway?.patent !== false) {
        const mentionsCompromise = anyHas(airway?.findings || [], ['snoring', 'gurgling', 'obstruct', 'at risk', 'compromised', 'unprotected', 'requires']);
        const hasIntervention = anyHas(airway?.interventions || [], ['opa', 'npa', 'suction', 'igel', 'i-gel', 'supraglottic', 'intubat', 'manoeuvre', 'jaw thrust', 'recovery position', 'adjunct', 'bvm', 'ett']);
        if (!mentionsCompromise && !hasIntervention) {
          return [{ message: `GCS=${gcs} (<9) but airway flagged patent with no compromise noted and no airway adjunct in interventions.` }];
        }
      }
      return [];
    },
  },

  // ---- Rhythm vs HR consistency -----------------------------------------
  {
    id: 'chb-but-hr-too-fast',
    severity: 'ERROR',
    check: (c) => {
      const rhythm = (c.initialRhythm || '').toLowerCase();
      const ecg = (c.abcde?.circulation?.ecgFindings || []).join(' ').toLowerCase();
      const hr = c.abcde?.circulation?.pulseRate ?? c.vitalSignsProgression?.initial?.pulse;
      const looksLikeCHB = /complete heart block|3rd degree|third degree/.test(rhythm) || /complete heart block|3rd degree|third degree/.test(ecg);
      if (looksLikeCHB && typeof hr === 'number' && hr > 60) {
        return [{ message: `Complete heart block suggested but HR=${hr} (CHB escape rhythm is typically 20-45 bpm).` }];
      }
      return [];
    },
  },
  {
    id: 'vt-but-hr-too-slow',
    severity: 'ERROR',
    check: (c) => {
      const rhythm = (c.initialRhythm || '').toLowerCase();
      const ecg = (c.abcde?.circulation?.ecgFindings || []).join(' ').toLowerCase();
      const hr = c.abcde?.circulation?.pulseRate ?? c.vitalSignsProgression?.initial?.pulse;
      const looksLikeVT = /\bventricular tachycardia\b|\bvt\b/.test(rhythm + ' ' + ecg) && !/svt/.test(rhythm + ' ' + ecg);
      if (looksLikeVT && typeof hr === 'number' && hr < 100) {
        return [{ message: `VT in rhythm/ECG but HR=${hr} (<100). VT is by definition tachycardic.` }];
      }
      return [];
    },
  },
  {
    id: 'arrest-but-hr-nonzero',
    severity: 'ERROR',
    check: (c) => {
      const rhythm = (c.initialRhythm || '').toLowerCase();
      const sub = (c.subcategory || '').toLowerCase();
      const isArrest = /asystole|ventricular fibrillation|\bvf\b|\bpea\b|cardiac arrest/.test(rhythm)
        || /asystole|pea|cardiac-arrest/.test(sub);
      const hr = c.abcde?.circulation?.pulseRate ?? c.vitalSignsProgression?.initial?.pulse;
      if (isArrest && typeof hr === 'number' && hr > 0) {
        return [{ message: `Arrest rhythm (${rhythm || sub}) but circulation.pulseRate=${hr} — cardiac arrest should have pulse 0.` }];
      }
      return [];
    },
  },

  // ---- Deterioration vitals should be worse, not better -----------------
  // Skipped for arrest cases (initial pulse 0) where the `deterioration`
  // slot is conventionally used for a post-ROSC-then-crash state rather
  // than straight worsening of the initial flatline.
  {
    id: 'deterioration-better-than-initial',
    severity: 'WARN',
    check: (c) => {
      const init = c.vitalSignsProgression?.initial;
      const det = c.vitalSignsProgression?.deterioration;
      if (!init || !det) return [];
      const isArrest = init.pulse === 0 || parseBP(init.bp)?.sys === 0;
      if (isArrest) return [];
      const findings = [];
      if (typeof det.spo2 === 'number' && typeof init.spo2 === 'number' && det.spo2 > init.spo2 + 1) {
        findings.push({ message: `Deterioration.spo2=${det.spo2} is HIGHER than initial.spo2=${init.spo2}.` });
      }
      if (typeof det.gcs === 'number' && typeof init.gcs === 'number' && det.gcs > init.gcs) {
        findings.push({ message: `Deterioration.gcs=${det.gcs} is HIGHER than initial.gcs=${init.gcs}.` });
      }
      const ibp = parseBP(init.bp);
      const dbp = parseBP(det.bp);
      if (ibp && dbp && dbp.sys > ibp.sys + 10 && ibp.sys < 100) {
        findings.push({ message: `Deterioration SBP=${dbp.sys} is much higher than initial SBP=${ibp.sys} despite hypotensive start.` });
      }
      return findings;
    },
  },

  // ---- Vitals suggest severity mismatch with priority -------------------
  // Skipped for MCI/multiple-patients since the top-level vitals there
  // are a placeholder; actual patient vitals live under `mci.patients[]`.
  {
    id: 'critical-priority-but-vitals-normal',
    severity: 'INFO',
    check: (c) => {
      if (c.priority !== 'critical') return [];
      if (c.category === 'multiple-patients') return [];
      const v = c.vitalSignsProgression?.initial;
      if (!v) return [];
      const bp = parseBP(v.bp);
      const looksStable = (typeof v.spo2 !== 'number' || v.spo2 >= 96)
        && (typeof v.pulse !== 'number' || (v.pulse >= 60 && v.pulse <= 100))
        && (!bp || (bp.sys >= 100 && bp.sys <= 140))
        && (typeof v.gcs !== 'number' || v.gcs === 15);
      if (looksStable) {
        return [{ message: `Priority=critical but all initial vitals are in the normal range — expected at least one abnormality.` }];
      }
      return [];
    },
  },

  // ---- Checklist vs managementPathway ------------------------------------
  // Some drugs (paracetamol, aspirin) can appear in checklist items as the
  // *ingested substance* in overdose/poisoning cases, not as treatment.
  // We skip the check for cases whose most-likely diagnosis / subcategory
  // mentions overdose/poisoning to avoid the false positive.
  {
    id: 'checklist-mentions-missing-treatment',
    severity: 'INFO',
    check: (c) => {
      const checklist = c.studentChecklist || [];
      const mp = c.managementPathway;
      if (!mp || checklist.length === 0) return [];
      const isOverdose = /overdose|poisoning|toxicity|toxicolog/i.test(
        `${c.subcategory || ''} ${c.category || ''} ${c.expectedFindings?.mostLikelyDiagnosis || ''}`,
      );
      const mpAll = [...(mp.immediate || []), ...(mp.definitive || []), ...(mp.monitoring || []), ...(mp.transportConsiderations || [])]
        .join(' ').toLowerCase();
      const findings = [];
      const keywords = ['aspirin', 'gtn', 'adrenaline', 'amiodarone', 'salbutamol', 'ipratropium', 'hydrocortisone', 'dextrose', 'glucagon', 'naloxone', 'tranexamic'];
      // In overdose cases the substance name (paracetamol, aspirin) is
      // often in the checklist as recognition, not as treatment — skip
      // those drug names entirely.
      const safeKeywords = isOverdose
        ? keywords.filter(k => !['paracetamol', 'aspirin'].includes(k))
        : keywords.concat(['paracetamol']);
      for (const item of checklist) {
        const desc = (item.description || '').toLowerCase();
        for (const kw of safeKeywords) {
          if (desc.includes(kw) && !mpAll.includes(kw)) {
            findings.push({ message: `Checklist item "${item.description.slice(0, 80)}" mentions "${kw}" but no managementPathway step references it.` });
            break;
          }
        }
      }
      return findings;
    },
  },

  // ---- Heart failure / oedema cross-check --------------------------------
  {
    id: 'heart-failure-without-peripheral-signs',
    severity: 'INFO',
    check: (c) => {
      const dx = String(c.expectedFindings?.mostLikelyDiagnosis || '').toLowerCase();
      if (!/heart failure|chf|pulmonary oedema|pulmonary edema/.test(dx)) return [];
      const ausc = c.abcde?.breathing?.auscultation || [];
      const sec = c.secondarySurvey || {};
      const hasCrackles = anyHas(ausc.concat(c.abcde?.breathing?.findings || []), ['crackle', 'rales', 'oedema', 'edema']);
      const hasPeripheralEdema = anyHas([...(sec.extremities || []), ...(sec.chest || [])], ['peripheral oedema', 'peripheral edema', 'pitting oedema', 'pitting edema', 'JVP', 'jvd']);
      if (!hasCrackles || !hasPeripheralEdema) {
        return [{ message: `Diagnosis "${dx}" but missing ${!hasCrackles ? 'crackles/pulmonary oedema in auscultation' : ''}${!hasCrackles && !hasPeripheralEdema ? ' and ' : ''}${!hasPeripheralEdema ? 'peripheral oedema / JVD in secondary survey' : ''}.` }];
      }
      return [];
    },
  },

  // ---- DKA sanity ---------------------------------------------------------
  {
    id: 'dka-missing-kussmaul-or-ketones',
    severity: 'WARN',
    check: (c) => {
      const dx = String(c.expectedFindings?.mostLikelyDiagnosis || '').toLowerCase();
      const sub = (c.subcategory || '').toLowerCase();
      if (!/dka|diabetic ketoacidosis/.test(dx) && !/dka/.test(sub)) return [];
      const bFindings = (c.abcde?.breathing?.findings || []).concat(c.initialPresentation?.sounds || [], c.initialPresentation?.odor || []);
      const hasKussmaul = anyHas(bFindings, ['kussmaul', 'deep rapid', 'air hunger']);
      const hasKetonesOrFruity = anyHas(bFindings.concat([c.initialPresentation?.appearance || '']), ['acetone', 'ketone', 'fruity']);
      const bgl = c.abcde?.disability?.bloodGlucose ?? c.vitalSignsProgression?.initial?.bloodGlucose;
      const findings = [];
      if (!hasKussmaul) findings.push({ message: `DKA case missing Kussmaul/deep-rapid breathing mention.` });
      if (!hasKetonesOrFruity) findings.push({ message: `DKA case missing acetone/fruity-breath/ketones mention.` });
      if (typeof bgl === 'number' && bgl < 15) findings.push({ message: `DKA case but BGL=${bgl} (<15 mmol/L) — typically >15 for DKA.` });
      return findings;
    },
  },

  // ---- Hypoglycaemia sanity ----------------------------------------------
  {
    id: 'hypoglycaemia-bgl-not-low',
    severity: 'WARN',
    check: (c) => {
      const dx = String(c.expectedFindings?.mostLikelyDiagnosis || '').toLowerCase();
      const sub = (c.subcategory || '').toLowerCase();
      if (!/hypoglyc|hypo-?glycaemia/.test(dx + ' ' + sub)) return [];
      const bgl = c.abcde?.disability?.bloodGlucose ?? c.vitalSignsProgression?.initial?.bloodGlucose;
      if (typeof bgl === 'number' && bgl >= 4) {
        return [{ message: `Hypoglycaemia case but BGL=${bgl} (≥4 mmol/L).` }];
      }
      return [];
    },
  },

  // ---- Clinical gotchas: case author should flag contraindications ------
  // The engine already enforces these at runtime (cross-system physiology,
  // runtime contraindications); the audit checks that the CASE NARRATIVE
  // also teaches them — so debrief, teaching points, or common pitfalls
  // mention the trap. Missing clinical education is the failure mode here,
  // not a data bug.
  {
    id: 'iv-fluid-in-heart-failure-unflagged',
    severity: 'WARN',
    check: (c) => {
      const dx = String(c.expectedFindings?.mostLikelyDiagnosis || '').toLowerCase();
      const sub = String(c.subcategory || '').toLowerCase();
      // "decompensated" alone is too broad (matches septic shock); require
      // an adjacent "heart" / cardiac term to avoid tagging decompensated
      // shock / decompensated liver disease etc.
      const isHF = /heart failure|\bchf\b|pulmonary oedema|pulmonary edema|decompensated heart|\bads\b|acute decompensated heart/i.test(dx + ' ' + sub);
      if (!isHF) return [];
      const haystack = [
        ...(c.commonPitfalls || []),
        ...(c.teachingPoints || []),
        ...((c.managementPathway?.immediate) || []),
        ...((c.managementPathway?.definitive) || []),
      ].join(' ').toLowerCase();
      const flagged = /(avoid|caution|contraindic|do not give|withhold|restrict|judicious).*(fluid|iv bolus|crystalloid|saline)|fluid.{0,30}(avoid|caution|contraindic|do not)/i.test(haystack);
      if (!flagged) {
        return [{ message: `Heart-failure case but no fluid-overload caution in commonPitfalls / teachingPoints / managementPathway.` }];
      }
      return [];
    },
  },

  {
    id: 'gtn-in-inferior-stemi-without-RV-warning',
    severity: 'WARN',
    check: (c) => {
      const sub = String(c.subcategory || '').toLowerCase();
      const dx = String(c.expectedFindings?.mostLikelyDiagnosis || '').toLowerCase();
      const isInferior = /inferior/.test(sub + ' ' + dx) && /stemi|mi|occlusion/.test(sub + ' ' + dx);
      if (!isInferior) return [];
      const haystack = [
        ...(c.commonPitfalls || []),
        ...(c.teachingPoints || []),
        ...((c.managementPathway?.immediate) || []),
        ...((c.managementPathway?.definitive) || []),
      ].join(' ').toLowerCase();
      const rvWarning = /(right ventric|rv infarct|rv involve|v4r|preload|gtn.{0,40}(caution|avoid|contraindic|hypoten))|nitrate.{0,40}(caution|avoid|contraindic|hypoten)/i.test(haystack);
      if (!rvWarning) {
        return [{ message: `Inferior STEMI case but no RV-infarct / GTN-preload warning in commonPitfalls / teachingPoints / managementPathway.` }];
      }
      return [];
    },
  },

  {
    id: 'opioid-in-severe-copd-unflagged',
    severity: 'WARN',
    check: (c) => {
      const sub = String(c.subcategory || '').toLowerCase();
      const dx = String(c.expectedFindings?.mostLikelyDiagnosis || '').toLowerCase();
      const bSpO2 = c.abcde?.breathing?.spo2 ?? c.vitalSignsProgression?.initial?.spo2;
      const isCOPD = /copd|chronic obstructive/i.test(sub + ' ' + dx);
      const isSevere = typeof bSpO2 === 'number' && bSpO2 <= 90;
      if (!isCOPD || !isSevere) return [];
      const haystack = [
        ...(c.commonPitfalls || []),
        ...(c.teachingPoints || []),
        ...((c.managementPathway?.immediate) || []),
        ...((c.managementPathway?.definitive) || []),
      ].join(' ').toLowerCase();
      // Match in either direction (opioid→caution or caution→opioid),
      // so narratives that lead with "Avoid opioids…" also count.
      const opioidTerm = /(morphine|fentanyl|opioid|opiate|diamorphine)/i;
      const cautionTerm = /(avoid|caution|contraindic|respirator(y| )depress|reduce|small dose|withhold)/i;
      const flagged = new RegExp(`${opioidTerm.source}.{0,80}${cautionTerm.source}|${cautionTerm.source}.{0,80}${opioidTerm.source}`, 'i').test(haystack);
      if (!flagged) {
        return [{ message: `Severe COPD case (SpO2 ≤90) but no opioid / respiratory-depression caution in commonPitfalls / teachingPoints / managementPathway.` }];
      }
      return [];
    },
  },

  // ---- Required fields ---------------------------------------------------
  {
    id: 'missing-core-fields',
    severity: 'INFO',
    check: (c) => {
      const findings = [];
      if (!c.vitalSignsProgression?.initial) findings.push({ message: 'No vitalSignsProgression.initial.' });
      if (!c.abcde) findings.push({ message: 'No abcde section.' });
      if (!c.expectedFindings?.mostLikelyDiagnosis) findings.push({ message: 'No mostLikelyDiagnosis.' });
      if (!Array.isArray(c.studentChecklist) || c.studentChecklist.length === 0) findings.push({ message: 'Empty studentChecklist.' });
      return findings;
    },
  },
];

// ============================================================================
// Run
// ============================================================================
const cases = allCases.filter((c) => {
  if (categoryFilter && String(c.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
  if (idFilter && c.id !== idFilter) return false;
  return true;
});

/** @type {Array<{caseId:string,caseTitle:string,category:string,subcategory?:string,ruleId:string,severity:string,message:string}>} */
const findings = [];
for (const c of cases) {
  for (const rule of RULES) {
    try {
      const hits = rule.check(c) || [];
      for (const h of hits) {
        findings.push({
          caseId: c.id,
          caseTitle: c.title,
          category: c.category,
          subcategory: c.subcategory,
          ruleId: rule.id,
          severity: rule.severity,
          message: h.message,
        });
      }
    } catch (err) {
      findings.push({
        caseId: c.id,
        caseTitle: c.title,
        category: c.category,
        subcategory: c.subcategory,
        ruleId: rule.id,
        severity: 'ERROR',
        message: `Rule crashed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }
}

// ============================================================================
// Output
// ============================================================================
const severityOrder = { ERROR: 0, WARN: 1, INFO: 2 };
findings.sort((a, b) => {
  const s = severityOrder[a.severity] - severityOrder[b.severity];
  if (s !== 0) return s;
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.caseId.localeCompare(b.caseId);
});

const summary = {
  totalCases: cases.length,
  totalFindings: findings.length,
  byRule: {},
  bySeverity: { ERROR: 0, WARN: 0, INFO: 0 },
  casesWithFindings: new Set(findings.map((f) => f.caseId)).size,
};
for (const f of findings) {
  summary.bySeverity[f.severity]++;
  summary.byRule[f.ruleId] = (summary.byRule[f.ruleId] || 0) + 1;
}

if (jsonOut) {
  console.log(JSON.stringify({ summary, findings }, null, 2));
} else {
  console.log('');
  console.log('='.repeat(80));
  console.log(` CASE AUDIT — ${cases.length} cases scanned, ${findings.length} findings`);
  console.log('='.repeat(80));
  console.log('');
  console.log(`  Severity: ERROR=${summary.bySeverity.ERROR}  WARN=${summary.bySeverity.WARN}  INFO=${summary.bySeverity.INFO}`);
  console.log(`  Cases with findings: ${summary.casesWithFindings}/${cases.length}`);
  console.log('');
  console.log('  By rule:');
  for (const [rid, n] of Object.entries(summary.byRule).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${n.toString().padStart(4)}  ${rid}`);
  }
  console.log('');

  let currentSeverity = null;
  for (const f of findings) {
    if (f.severity !== currentSeverity) {
      currentSeverity = f.severity;
      console.log('');
      console.log('─'.repeat(80));
      console.log(` ${f.severity}`);
      console.log('─'.repeat(80));
    }
    console.log(`  [${f.category}/${f.caseId}] ${f.caseTitle}`);
    console.log(`    ${f.ruleId}: ${f.message}`);
  }

  // Also save report to test-results/audit-<timestamp>.json for diffing
  const outDir = resolve(projectRoot, 'test-results');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = resolve(outDir, `case-audit-${stamp}.json`);
  writeFileSync(outPath, JSON.stringify({ summary, findings }, null, 2));
  console.log('');
  console.log(`Full JSON report → ${outPath}`);
}

process.exit(findings.some((f) => f.severity === 'ERROR') ? 1 : 0);
