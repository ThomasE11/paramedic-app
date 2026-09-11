#!/usr/bin/env node
/**
 * Read-only extractor for the med-ed curriculum audit.
 * Writes AUDITS/_med-ed-extract.json — not the deliverable.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

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
const allCases = casesMod.allCases ?? [];
const { isCaseAvailableForCohort, yearLevels } = filtersMod;

const YEARS = yearLevels.map((y) => y.value);

function flatten(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(flatten).join(' | ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function summarizeCase(c) {
  const wounds = c.woundDecals || c.visualResources?.wounds || c.scenario?.woundDecals || [];
  const equipment = c.equipmentOnPatient || c.visualState?.equipment || [];
  const checklist = Array.isArray(c.studentChecklist) ? c.studentChecklist : [];
  const treatments = checklist.filter((i) => i.category === 'intervention' || i.category === 'treatment');
  const abcdeItems = checklist.filter((i) => i.category === 'abcde');
  const scene = c.sceneInfo || {};
  const presentation = c.initialPresentation || {};
  const mci = c.mci || null;
  const sourceGuess = guessSource(c.id);

  return {
    id: c.id,
    title: c.title,
    category: c.category,
    subcategory: c.subcategory || null,
    priority: c.priority || null,
    complexity: c.complexity || null,
    yearLevels: c.yearLevels || [],
    estimatedDuration: c.estimatedDuration || null,
    sourceGuess,
    patientAge: c.patientInfo?.age ?? null,
    patientGender: c.patientInfo?.gender ?? null,
    patientWeight: c.patientInfo?.weight ?? null,
    location: c.dispatchInfo?.location || null,
    callReason: c.dispatchInfo?.callReason || null,
    sceneDescription: scene.description || null,
    sceneImagePath: scene.sceneImagePath || null,
    sceneImageCaption: scene.sceneImageCaption || null,
    hazards: scene.hazards || [],
    bystanders: scene.bystanders || null,
    environment: scene.environment || null,
    extricationNeeded: scene.extricationNeeded ?? null,
    position: presentation.position || null,
    appearance: presentation.appearance || null,
    consciousness: presentation.consciousness || null,
    generalImpression: presentation.generalImpression || null,
    woundCount: Array.isArray(wounds) ? wounds.length : (wounds ? 1 : 0),
    woundIds: Array.isArray(wounds) ? wounds.map((w) => w.id || w.type || w.site || flatten(w)).slice(0, 12) : [],
    hasVisualResources: Boolean(c.visualResources?.images?.length || c.visualResources?.videos?.length),
    visualImageCount: c.visualResources?.images?.length || 0,
    visualVideoCount: c.visualResources?.videos?.length || 0,
    equipmentCount: Array.isArray(equipment) ? equipment.length : 0,
    checklistCount: checklist.length,
    interventionCount: treatments.length,
    abcdeChecklistCount: abcdeItems.length,
    teachingPointCount: Array.isArray(c.teachingPoints) ? c.teachingPoints.length : 0,
    pitfallCount: Array.isArray(c.commonPitfalls) ? c.commonPitfalls.length : 0,
    equipmentNeededCount: Array.isArray(c.equipmentNeeded) ? c.equipmentNeeded.length : 0,
    hasUaeProtocols: Boolean(c.uaeProtocols),
    hasMci: Boolean(mci?.isMCI),
    mciPatientCount: mci?.patients?.length || mci?.totalPatients || null,
    managementImmediate: (c.managementPathway?.immediate || []).slice(0, 8),
    mostLikelyDiagnosis: c.expectedFindings?.mostLikelyDiagnosis || null,
    keyObservations: (c.expectedFindings?.keyObservations || []).slice(0, 8),
    redFlags: (c.expectedFindings?.redFlags || []).slice(0, 6),
    abcdeAirwayPatent: c.abcde?.airway?.patent ?? null,
    abcdeRr: c.abcde?.breathing?.rate ?? null,
    abcdeSpo2: c.abcde?.breathing?.spo2 ?? null,
    abcdeHr: c.abcde?.circulation?.pulseRate ?? null,
    abcdeBp: c.abcde?.circulation?.bp || null,
    abcdeGcs: c.abcde?.disability?.gcs?.total ?? null,
    abcdeAvpu: c.abcde?.disability?.avpu ?? null,
    hasSecondarySurvey: Boolean(c.secondarySurvey),
    hasHistory: Boolean(c.history),
  };
}

function guessSource(id) {
  if (!id) return 'unknown';
  if (id.startsWith('fy-') || id.startsWith('year1-') || id.includes('first-year')) return 'firstYearCases';
  if (id.startsWith('sy-') || id.startsWith('year2-') || id.includes('second-year')) return 'secondYearCases';
  if (id.startsWith('litfl-')) return 'litflCases';
  if (id.startsWith('sv-') || id.includes('variant')) return 'severityVariantCases';
  if (id.startsWith('enh-') || id.startsWith('ec-')) return 'enhancedCases';
  return 'core-or-enhanced-or-additional';
}

const summaries = allCases.map(summarizeCase);

const byCategory = {};
for (const s of summaries) {
  byCategory[s.category] = (byCategory[s.category] || 0) + 1;
}

const byYearTag = {};
const unknownYear = [];
const invalidYear = [];
for (const s of summaries) {
  if (!s.yearLevels?.length) unknownYear.push(s.id);
  for (const y of s.yearLevels) {
    byYearTag[y] = (byYearTag[y] || 0) + 1;
    if (!YEARS.includes(y)) invalidYear.push({ id: s.id, year: y });
  }
}

const cohortExact = {};
const cohortProgressive = {};
for (const year of YEARS) {
  cohortExact[year] = summaries.filter((s) => isCaseAvailableForCohort(s.yearLevels, year, 'exact')).map((s) => s.id);
  cohortProgressive[year] = summaries.filter((s) => isCaseAvailableForCohort(s.yearLevels, year, 'progressive')).map((s) => s.id);
}

const trauma = summaries.filter((s) => s.category === 'trauma');
const burns = summaries.filter((s) => s.category === 'burns');
const multiCat = summaries.filter((s) => s.category === 'multiple-patients');
const mciFlagged = summaries.filter((s) => s.hasMci || /mci|mass.?casualt|multiple patient/i.test(`${s.title} ${s.subcategory} ${s.callReason}`));

const year1Only = summaries.filter((s) => s.yearLevels.length === 1 && s.yearLevels[0] === '1st-year');
const year2Only = summaries.filter((s) => s.yearLevels.length === 1 && s.yearLevels[0] === '2nd-year');
const diplomaTagged = summaries.filter((s) => s.yearLevels.includes('diploma'));
const year3Tagged = summaries.filter((s) => s.yearLevels.includes('3rd-year'));
const year4Tagged = summaries.filter((s) => s.yearLevels.includes('4th-year'));

const tooHardForY1 = summaries.filter((s) => {
  const y1 = s.yearLevels.includes('1st-year') || s.yearLevels.includes('diploma');
  if (!y1) return false;
  const expert = s.complexity === 'expert';
  const advanced = s.complexity === 'advanced';
  const critical = s.priority === 'critical';
  const mci = s.hasMci;
  return expert || mci || (advanced && critical && !s.yearLevels.includes('2nd-year') && s.yearLevels.includes('1st-year') && s.yearLevels.length === 1);
});

const hiddenFromSeniors = summaries.filter((s) => {
  // wrongly hidden: tagged only diploma so 3rd/4th progressive degree path misses it
  // diploma-only is visible to diploma progressive, not to degree years
  return s.yearLevels.length && s.yearLevels.every((y) => y === 'diploma');
});

const noYear1ButBasic = summaries.filter((s) =>
  s.complexity === 'basic' && !s.yearLevels.includes('1st-year') && !s.yearLevels.includes('diploma')
);

const out = {
  generatedAt: new Date().toISOString(),
  totalCases: summaries.length,
  byCategory,
  byYearTag,
  unknownYear,
  invalidYear,
  traumaCount: trauma.length,
  burnsCount: burns.length,
  trauma,
  burns,
  multiCat,
  mciFlagged,
  year1OnlyIds: year1Only.map((s) => ({ id: s.id, title: s.title, category: s.category, complexity: s.complexity })),
  year2OnlyIds: year2Only.map((s) => ({ id: s.id, title: s.title, category: s.category, complexity: s.complexity })),
  diplomaTagged: diplomaTagged.map((s) => ({ id: s.id, title: s.title, category: s.category, yearLevels: s.yearLevels, complexity: s.complexity })),
  year3Count: year3Tagged.length,
  year4Count: year4Tagged.length,
  cohortExactCounts: Object.fromEntries(YEARS.map((y) => [y, cohortExact[y].length])),
  cohortProgressiveCounts: Object.fromEntries(YEARS.map((y) => [y, cohortProgressive[y].length])),
  tooHardForY1: tooHardForY1.map((s) => ({ id: s.id, title: s.title, yearLevels: s.yearLevels, complexity: s.complexity, priority: s.priority, category: s.category })),
  diplomaOnly: hiddenFromSeniors.map((s) => ({ id: s.id, title: s.title, category: s.category })),
  basicButNotY1: noYear1ButBasic.map((s) => ({ id: s.id, title: s.title, yearLevels: s.yearLevels, category: s.category })),
  categoryByYearExact: Object.fromEntries(YEARS.map((year) => {
    const ids = new Set(cohortExact[year]);
    const cats = {};
    for (const s of summaries) {
      if (!ids.has(s.id)) continue;
      cats[s.category] = (cats[s.category] || 0) + 1;
    }
    return [year, cats];
  })),
  allSummaries: summaries,
};

mkdirSync(resolve(projectRoot, 'AUDITS'), { recursive: true });
writeFileSync(resolve(projectRoot, 'AUDITS/_med-ed-extract.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify({
  total: out.totalCases,
  trauma: out.traumaCount,
  burns: out.burnsCount,
  byCategory: out.byCategory,
  byYearTag: out.byYearTag,
  unknownYear: out.unknownYear,
  invalidYear: out.invalidYear,
  cohortExact: out.cohortExactCounts,
  cohortProgressive: out.cohortProgressiveCounts,
  year1Only: year1Only.length,
  year2Only: year2Only.length,
  diplomaTagged: diplomaTagged.length,
  year3: year3Tagged.length,
  year4: year4Tagged.length,
  traumaIds: trauma.map((t) => ({ id: t.id, title: t.title, yearLevels: t.yearLevels, complexity: t.complexity, priority: t.priority, subcategory: t.subcategory, woundCount: t.woundCount, sceneImage: Boolean(t.sceneImagePath), hasMci: t.hasMci })),
  mci: mciFlagged.map((t) => ({ id: t.id, title: t.title, category: t.category, yearLevels: t.yearLevels, hasMci: t.hasMci, mciPatientCount: t.mciPatientCount })),
  tooHardForY1: out.tooHardForY1,
  diplomaOnly: out.diplomaOnly,
  basicButNotY1Count: out.basicButNotY1.length,
}, null, 2));
