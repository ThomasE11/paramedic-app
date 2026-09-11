#!/usr/bin/env node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const jiti = require('jiti')(projectRoot, {
  interopDefault: true,
  alias: { '@': resolve(projectRoot, 'src') },
  esmResolve: true,
});

const casesMod = jiti('./src/data/cases.ts');
const filtersMod = jiti('./src/data/caseFilters.ts');
const injuryMod = jiti('./src/lib/injuryMap.ts');
const fy = jiti('./src/data/firstYearCases.ts');
const sy = jiti('./src/data/secondYearCases.ts');
const { isCaseAvailableForCohort } = filtersMod;
const allCases = casesMod.allCases;
const inferInjuries = injuryMod.inferInjuries;

const fyIds = fy.firstYearCases.map((c) => ({ id: c.id, title: c.title, category: c.category, yearLevels: c.yearLevels, complexity: c.complexity, priority: c.priority, position: c.initialPresentation?.position }));
const syIds = sy.secondYearCases.map((c) => ({ id: c.id, title: c.title, category: c.category, yearLevels: c.yearLevels, complexity: c.complexity, priority: c.priority }));

const trauma = allCases.filter((c) => c.category === 'trauma');
const traumaInjuries = trauma.map((c) => {
  const injuries = inferInjuries(c) || [];
  return {
    id: c.id,
    title: c.title,
    yearLevels: c.yearLevels,
    complexity: c.complexity,
    injuryCount: injuries.length,
    injuries: injuries.map((i) => ({ kind: i.kind, region: i.region, severity: i.severity, label: i.label, detail: (i.detail || '').slice(0, 80) })),
    sceneImagePath: c.sceneInfo?.sceneImagePath || null,
    environmentVariant: c.sceneInfo?.environmentVariant || null,
    position: c.initialPresentation?.position,
  };
});

const mci = allCases.find((c) => c.id === 'multi-001');
const diplomaProgressiveTrauma = allCases.filter((c) => c.category === 'trauma' && isCaseAvailableForCohort(c.yearLevels, 'diploma', 'progressive'));
const y2ProgressiveTrauma = allCases.filter((c) => c.category === 'trauma' && isCaseAvailableForCohort(c.yearLevels, '2nd-year', 'progressive'));
const y1ProgressiveTrauma = allCases.filter((c) => c.category === 'trauma' && isCaseAvailableForCohort(c.yearLevels, '1st-year', 'progressive'));

const y1MisTags = allCases.filter((c) => {
  const y1 = (c.yearLevels || []).includes('1st-year') || (c.yearLevels || []).includes('diploma');
  if (!y1) return false;
  const hard =
    c.complexity === 'advanced' ||
    c.complexity === 'expert' ||
    /arrest|delivery|anaphyla|stroke|seizure|ingestion|croup/i.test(c.title);
  return hard;
});

const diplomaLeakAdvanced = allCases.filter((c) =>
  isCaseAvailableForCohort(c.yearLevels, 'diploma', 'progressive') &&
  (c.complexity === 'advanced' || c.complexity === 'expert')
);

const missingYear = allCases.filter((c) => !(c.yearLevels || []).length);

const sourceCounts = {
  core: casesMod.caseDatabase.length,
  enhanced: (jiti('./src/data/enhancedCases.ts').enhancedCaseDatabase || []).length,
  additional: (jiti('./src/data/additionalCases.ts').additionalCaseDatabase || []).length,
  firstYear: fy.firstYearCases.length,
  secondYear: sy.secondYearCases.length,
  litfl: (jiti('./src/data/litflCases.ts').litflCaseDatabase || []).length,
  severity: (jiti('./src/data/severityVariantCases.ts').severityVariantCases || []).length,
};

const y1ExactCats = {};
for (const c of allCases.filter((c) => isCaseAvailableForCohort(c.yearLevels, '1st-year', 'exact'))) {
  y1ExactCats[c.category] = (y1ExactCats[c.category] || 0) + 1;
}

console.log(JSON.stringify({
  sourceCounts,
  fyIds,
  syIds,
  traumaInjuries,
  mci: mci ? {
    id: mci.id,
    yearLevels: mci.yearLevels,
    totalPatients: mci.mci?.totalPatients,
    patientsLength: mci.mci?.patients?.length,
    patientIds: (mci.mci?.patients || []).map((p) => ({ id: p.id, priority: p.priority, name: p.name, age: p.age })),
    triage: mci.mci?.triageCategories,
    abcdeIsAggregate: true,
    patientAge: mci.patientInfo?.age,
    weight: mci.patientInfo?.weight,
  } : null,
  diplomaProgressiveTrauma: diplomaProgressiveTrauma.map((c) => ({ id: c.id, title: c.title, yearLevels: c.yearLevels, complexity: c.complexity })),
  y1ProgressiveTrauma: y1ProgressiveTrauma.map((c) => c.id),
  y2ProgressiveTrauma: y2ProgressiveTrauma.map((c) => ({ id: c.id, title: c.title, yearLevels: c.yearLevels, complexity: c.complexity })),
  y1MisTags: y1MisTags.map((c) => ({ id: c.id, title: c.title, yearLevels: c.yearLevels, complexity: c.complexity, priority: c.priority, category: c.category })),
  diplomaLeakAdvanced: diplomaLeakAdvanced.map((c) => ({ id: c.id, title: c.title, yearLevels: c.yearLevels, complexity: c.complexity, category: c.category })),
  missingYear: missingYear.map((c) => c.id),
  y1ExactCats,
}, null, 2));
