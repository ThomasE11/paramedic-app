/**
 * Async case-library loader.
 *
 * `cases.ts` aggregates ~1.2 MB of clinical case data across six source
 * files. Statically importing it (as StudentPanel / ClassroomLobby /
 * ClassroomJoin used to) drags the whole payload onto the first-case entry
 * path. This module wraps the import behind a cached promise so the case
 * bundle streams in as lazy chunks while the user browses the mission board.
 *
 * Cheap, sync filter metadata (yearLevels, caseCategories, …) lives in
 * `caseFilters.ts` and is re-exported here so callers have one import site.
 */
import type { CaseScenario, StudentYear } from '@/types';

export { yearLevels, caseCategories, complexityLevels, priorities } from './caseFilters';

type CasesModule = typeof import('./cases');

// Module-level cache — load the bundle exactly once, share the resolved
// promise across every caller (StudentPanel, classroom, educator panel).
let _casesPromise: Promise<CasesModule> | null = null;

const loadModule = (): Promise<CasesModule> => {
  if (!_casesPromise) _casesPromise = import('./cases');
  return _casesPromise;
};

/** Load every case. Cached — resolves to the same array reference on repeat calls. */
export const loadAllCases = async (): Promise<CaseScenario[]> => {
  const mod = await loadModule();
  return mod.allCases;
};

/** Load all cases filtered to a cohort using the bundle's own cohort rule. */
export const loadCasesForCohort = async (
  year: StudentYear,
  options?: { mode?: 'exact' | 'progressive' },
): Promise<CaseScenario[]> => {
  const mod = await loadModule();
  return mod.getCasesForCohort(year, options);
};

/** Sorted list of every unique condition name (for the search dropdown). */
export const loadConditionNames = async (): Promise<string[]> => {
  const mod = await loadModule();
  return mod.allConditionNames;
};
