#!/usr/bin/env node
// @ts-check
/**
 * Executable clinical treatment regression audit.
 *
 * Unlike audit-cases.mjs, which checks authored case consistency, this script
 * runs treatment protocols through the real dynamic physiology engine.
 *
 * Usage:
 *   node scripts/audit-clinical-regressions.mjs [--json] [--id y1-015] [--category respiratory]
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const jiti = require('jiti')(projectRoot, {
  interopDefault: true,
  alias: { '@': resolve(projectRoot, 'src') },
  esmResolve: true,
});

const { allCases } = jiti('./src/data/cases.ts');
const { TREATMENTS } = jiti('./src/data/enhancedTreatmentEffects.ts');
const {
  TREATMENT_PROTOCOLS,
  assessProtocolCompliance,
  determineSeverityFromVitals,
  findProtocol,
} = jiti('./src/data/treatmentProtocols.ts');
const {
  applyDynamicTreatment,
  createInitialPatientState,
} = jiti('./src/data/dynamicTreatmentEngine.ts');
const { buildInitialVitalsFromCase } = jiti('./src/data/treatmentEffects.ts');
const { evaluateTreatmentRealism } = jiti('./src/lib/patientRealism.ts');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const arg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const jsonOut = flag('--json');
const idFilter = arg('--id');
const categoryFilter = arg('--category');

const treatmentById = new Map(TREATMENTS.map((t) => [t.id, t]));
const parseBP = (bp) => {
  const match = String(bp || '').match(/(\d+)\s*\/\s*(\d+)/);
  return match ? { systolic: Number(match[1]), diastolic: Number(match[2]) } : null;
};
const uniq = (items) => [...new Set(items.filter(Boolean))];

/**
 * Distance from current physiology to the case author's expected
 * after-intervention state. Lower is better.
 */
const targetDistance = (vitals, target) => {
  if (!vitals || !target) return null;
  const components = [];
  const add = (current, desired, scale) => {
    if (typeof current === 'number' && typeof desired === 'number') {
      components.push(Math.abs(current - desired) / scale);
    }
  };
  add(vitals.pulse, target.pulse, 30);
  add(vitals.respiration, target.respiration, 8);
  add(vitals.spo2, target.spo2, 5);
  add(vitals.gcs, target.gcs, 3);
  const currentBP = parseBP(vitals.bp);
  const targetBP = parseBP(target.bp);
  if (currentBP && targetBP) {
    add(currentBP.systolic, targetBP.systolic, 25);
    add(currentBP.diastolic, targetBP.diastolic, 15);
  }
  return components.length > 0
    ? components.reduce((sum, value) => sum + value, 0) / components.length
    : null;
};

const findings = [];
const addFinding = (finding) => findings.push(finding);
const findingFor = (caseData, ruleId, severity, message) => ({
  caseId: caseData?.id || 'protocol-database',
  caseTitle: caseData?.title || 'Treatment protocol database',
  category: caseData?.category || 'protocol',
  subcategory: caseData?.subcategory,
  ruleId,
  severity,
  message,
});

// ---------------------------------------------------------------------------
// Protocol database integrity
// ---------------------------------------------------------------------------
for (const protocol of TREATMENT_PROTOCOLS) {
  for (const severity of protocol.severityLevels) {
    const recommended = uniq([
      ...severity.essentialTreatments,
      ...severity.optimalTreatments,
      ...severity.beneficialTreatments,
    ]);
    const contraindicated = uniq(severity.contraindicatedTreatments);
    const allReferenced = uniq([
      ...recommended,
      ...contraindicated,
      ...severity.positioningEffects.map((effect) => effect.positionId),
      ...severity.synergies.flatMap((synergy) => synergy.treatments),
    ]);

    for (const id of allReferenced) {
      if (!treatmentById.has(id)) {
        addFinding(findingFor(null, 'protocol-treatment-id-missing', 'ERROR',
          `${protocol.condition}/${severity.severity} references treatment "${id}", which is absent from TREATMENTS.`));
      }
    }

    for (const id of recommended.filter((item) => contraindicated.includes(item))) {
      addFinding(findingFor(null, 'protocol-recommends-contraindicated', 'ERROR',
        `${protocol.condition}/${severity.severity} both recommends and contraindicates "${id}".`));
    }

    for (const synergy of severity.synergies) {
      const contraindicatedMembers = synergy.treatments.filter((id) => contraindicated.includes(id));
      if (contraindicatedMembers.length > 0) {
        addFinding(findingFor(null, 'synergy-contains-contraindicated', 'ERROR',
          `${protocol.condition}/${severity.severity} synergy contains contraindicated treatment(s): ${contraindicatedMembers.join(', ')}.`));
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Case-level executable regression checks
// ---------------------------------------------------------------------------
const cases = allCases.filter((caseData) => {
  if (idFilter && caseData.id !== idFilter) return false;
  if (categoryFilter && String(caseData.category).toLowerCase() !== categoryFilter.toLowerCase()) return false;
  return true;
});

let protocolCoveredCases = 0;
let executablePathways = 0;
let perfectScorePathways = 0;

for (const caseData of cases) {
  // Top-level vitals are placeholders in MCI cases; patient-specific treatment
  // simulation belongs in a future dedicated multi-patient audit.
  if (caseData.mci || caseData.category === 'multiple-patients') continue;

  const protocol = findProtocol(caseData.subcategory || '', caseData.category);
  if (!protocol) {
    addFinding(findingFor(caseData, 'case-has-no-treatment-protocol', 'INFO',
      `No executable treatment protocol matches subcategory "${caseData.subcategory || '(none)'}".`));
    continue;
  }
  protocolCoveredCases += 1;

  const initialVitals = buildInitialVitalsFromCase(caseData);
  const severity = determineSeverityFromVitals(protocol, initialVitals);
  const recommendedIds = uniq([
    ...severity.essentialTreatments,
    ...severity.optimalTreatments,
  ]);
  const correctTreatments = recommendedIds
    .map((id) => treatmentById.get(id))
    .filter(Boolean);

  if (severity.essentialTreatments.length === 0) {
    addFinding(findingFor(caseData, 'severity-has-no-essential-treatment', 'WARN',
      `${protocol.condition}/${severity.severity} has no essential treatments, so the algorithm cannot teach a clear first-line priority.`));
  }

  // A protocol recommendation must agree with the patient-realism layer.
  let recommendedRealismConflict = false;
  for (const treatment of correctTreatments) {
    const realism = evaluateTreatmentRealism({
      treatment,
      caseData,
      vitals: initialVitals,
      appliedTreatmentIds: recommendedIds,
    });
    if (realism.status === 'harmful' || realism.status === 'mismatch') {
      recommendedRealismConflict = true;
      addFinding(findingFor(caseData, 'recommended-treatment-fails-realism-check', 'WARN',
        `${protocol.condition}/${severity.severity} recommends "${treatment.id}", but realism classified it as ${realism.status}: ${realism.debriefNote}`));
    }
  }

  // Execute the authored correct pathway through the same engine used in-app.
  let state = createInitialPatientState(caseData);
  const concerningResponses = [];
  for (const treatment of correctTreatments) {
    const { newState, response } = applyDynamicTreatment(treatment, state, caseData);
    state = newState;
    if (/contraindicat|ineffective|may worsen|withheld/i.test(response.warningMessage || '')) {
      concerningResponses.push(`${treatment.id}: ${response.warningMessage}`);
    }
  }

  const compliance = assessProtocolCompliance(severity, recommendedIds);
  const target = caseData.vitalSignsProgression.afterIntervention;
  const beforeDistance = targetDistance(initialVitals, target);
  const afterDistance = targetDistance(state.vitals, target);
  const pathwayImproved = beforeDistance === null || afterDistance === null || afterDistance < beforeDistance - 0.01;

  if (compliance.completionPercent < 100) {
    addFinding(findingFor(caseData, 'recommended-pathway-not-protocol-complete', 'ERROR',
      `Applying every recommended treatment only reaches ${compliance.completionPercent}% protocol completion.`));
  } else if (concerningResponses.length === 0 && pathwayImproved) {
    executablePathways += 1;
  }

  if (concerningResponses.length > 0) {
    addFinding(findingFor(caseData, 'recommended-pathway-triggers-warning', 'ERROR',
      `Correct pathway triggered concerning response(s): ${concerningResponses.join(' | ')}`));
  }

  if (!pathwayImproved) {
    addFinding(findingFor(caseData, 'recommended-pathway-does-not-improve-target-distance', 'WARN',
      `Correct pathway did not move physiology toward afterIntervention target (distance ${beforeDistance?.toFixed(2)} -> ${afterDistance?.toFixed(2)}).`));
  }

  // Student scoring now uses protocol completeness for covered cases. A true
  // perfect-score pathway therefore requires a complete protocol whose own
  // recommendations do not trigger the realism or response safety layers.
  if (compliance.completionPercent === 100 && concerningResponses.length === 0 && !recommendedRealismConflict) {
    perfectScorePathways += 1;
  }

  // Every contraindicated branch must provide an observable consequence:
  // worsening physiology relative to the authored target and/or an explicit
  // warning. Silent wrong-drug branches are dangerous teaching failures.
  for (const id of uniq(severity.contraindicatedTreatments)) {
    const treatment = treatmentById.get(id);
    if (!treatment) continue; // Already reported as a database integrity error.
    const wrongStart = createInitialPatientState(caseData);
    const wrongBefore = targetDistance(wrongStart.vitals, target);
    const { newState, response } = applyDynamicTreatment(treatment, wrongStart, caseData);
    const wrongAfter = targetDistance(newState.vitals, target);
    const becameWorse = wrongBefore !== null && wrongAfter !== null && wrongAfter > wrongBefore + 0.01;
    const hasWarning = Boolean(response.warningMessage) || /contraindicat|harm|worsen|unsafe|risk/i.test(response.description);
    if (!becameWorse && !hasWarning) {
      addFinding(findingFor(caseData, 'contraindicated-treatment-has-no-consequence', 'ERROR',
        `"${id}" is contraindicated for ${protocol.condition}/${severity.severity}, but produced neither worsening physiology nor a warning.`));
    }
  }
}

const severityOrder = { ERROR: 0, WARN: 1, INFO: 2 };
findings.sort((a, b) =>
  severityOrder[a.severity] - severityOrder[b.severity]
  || a.category.localeCompare(b.category)
  || a.caseId.localeCompare(b.caseId)
  || a.ruleId.localeCompare(b.ruleId));

const summary = {
  totalCases: cases.length,
  protocolCoveredCases,
  executablePathways,
  perfectScorePathways,
  totalProtocols: TREATMENT_PROTOCOLS.length,
  totalFindings: findings.length,
  casesWithFindings: new Set(findings.map((finding) => finding.caseId)).size,
  bySeverity: { ERROR: 0, WARN: 0, INFO: 0 },
  byRule: {},
};
for (const finding of findings) {
  summary.bySeverity[finding.severity] += 1;
  summary.byRule[finding.ruleId] = (summary.byRule[finding.ruleId] || 0) + 1;
}

if (jsonOut) {
  console.log(JSON.stringify({ summary, findings }, null, 2));
} else {
  console.log('');
  console.log('='.repeat(88));
  console.log(` CLINICAL REGRESSION AUDIT — ${cases.length} cases, ${TREATMENT_PROTOCOLS.length} protocols`);
  console.log('='.repeat(88));
  console.log(`  Protocol coverage:       ${protocolCoveredCases}/${cases.length} cases`);
  console.log(`  Executable pathways:     ${executablePathways}/${protocolCoveredCases} covered cases`);
  console.log(`  Perfect-score pathways:  ${perfectScorePathways}/${protocolCoveredCases} covered cases`);
  console.log(`  Findings: ERROR=${summary.bySeverity.ERROR} WARN=${summary.bySeverity.WARN} INFO=${summary.bySeverity.INFO}`);
  console.log('');
  for (const [ruleId, count] of Object.entries(summary.byRule).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${ruleId}`);
  }
  for (const severity of ['ERROR', 'WARN', 'INFO']) {
    const group = findings.filter((finding) => finding.severity === severity);
    if (group.length === 0) continue;
    console.log('');
    console.log('─'.repeat(88));
    console.log(` ${severity}`);
    console.log('─'.repeat(88));
    for (const finding of group) {
      console.log(`  [${finding.category}/${finding.caseId}] ${finding.caseTitle}`);
      console.log(`    ${finding.ruleId}: ${finding.message}`);
    }
  }

  const outDir = resolve(projectRoot, 'test-results');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = resolve(outDir, `clinical-regression-audit-${stamp}.json`);
  writeFileSync(outPath, JSON.stringify({ summary, findings }, null, 2));
  console.log('');
  console.log(`Full JSON report -> ${outPath}`);
}

process.exit(findings.some((finding) => finding.severity === 'ERROR') ? 1 : 0);
