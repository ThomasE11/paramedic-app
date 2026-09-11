import { readFileSync } from 'node:fs';
const d = JSON.parse(readFileSync('AUDITS/_med-ed-extract.json', 'utf8'));

function pick(t, keys) {
  const o = {};
  for (const k of keys) o[k] = t[k];
  return o;
}

const traumaKeys = [
  'id','title','subcategory','yearLevels','complexity','priority','estimatedDuration',
  'location','callReason','sceneDescription','sceneImagePath','woundCount','woundIds',
  'hasVisualResources','visualImageCount','visualVideoCount','checklistCount',
  'interventionCount','abcdeChecklistCount','teachingPointCount','hasMci','position',
  'appearance','consciousness','mostLikelyDiagnosis','managementImmediate','abcdeRr',
  'abcdeSpo2','abcdeHr','abcdeBp','abcdeGcs','abcdeAvpu','patientAge','patientGender',
  'keyObservations','redFlags','sourceGuess','equipmentNeededCount','hasUaeProtocols',
  'hasSecondarySurvey','hasHistory','hazards','environment','extricationNeeded',
];

const out = {
  total: d.totalCases,
  byCategory: d.byCategory,
  byYearTag: d.byYearTag,
  unknownYear: d.unknownYear,
  invalidYear: d.invalidYear,
  cohortExact: d.cohortExactCounts,
  cohortProgressive: d.cohortProgressiveCounts,
  year1Only: d.year1OnlyIds,
  year2Only: d.year2OnlyIds,
  diplomaTagged: d.diplomaTagged,
  year3: d.year3Count,
  year4: d.year4Count,
  traumaCount: d.traumaCount,
  burnsCount: d.burnsCount,
  trauma: d.trauma.map((t) => pick(t, traumaKeys)),
  burns: d.burns.map((t) => pick(t, ['id','title','yearLevels','complexity','priority','subcategory','woundCount','sceneImagePath','callReason','location'])),
  categoryByYearExact: d.categoryByYearExact,
  basicButNotY1: d.basicButNotY1,
  tooHardForY1: d.tooHardForY1,
  diplomaOnly: d.diplomaOnly,
  mciFlagged: d.mciFlagged.map((t) => pick(t, ['id','title','category','yearLevels','complexity','hasMci','mciPatientCount','callReason','sceneDescription','checklistCount'])),
  multiCat: d.multiCat.map((t) => pick(t, ['id','title','yearLevels','complexity','hasMci','mciPatientCount'])),
};
console.log(JSON.stringify(out, null, 2));
