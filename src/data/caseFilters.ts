/**
 * Filter constants for the case picker.
 *
 * These were previously exported from `src/data/cases.ts`, which meant
 * anything wanting a simple filter-chip list (App.tsx role selection,
 * stat bars) had to pull the entire 2.5 MB case-data module into the
 * initial bundle. This standalone module exists so App.tsx can get the
 * filters without transitively loading every case file.
 *
 * `caseCategories` is hardcoded to the 18 categories that currently have
 * live cases. When a new category is introduced, add it here too — the
 * audit script (scripts/audit-cases.mjs) will surface any case that
 * references a category not in this list.
 */
export const yearLevels = [
  { value: 'diploma', label: 'Diploma' },
  { value: '1st-year', label: '1st Year' },
  { value: '2nd-year', label: '2nd Year' },
  { value: '3rd-year', label: '3rd Year' },
  { value: '4th-year', label: '4th Year' },
] as const;

export const complexityLevels = [
  { value: 'basic', label: 'Basic', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { value: 'advanced', label: 'Advanced', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  { value: 'expert', label: 'Expert', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
] as const;

export const priorities = [
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
] as const;

/**
 * All 18 live case categories with their display labels + Tailwind
 * colour tokens. Mirrors the category_info in cases.ts but doesn't
 * require the case bundle to be loaded.
 */
export const caseCategories = [
  { value: 'anxiety-related', label: 'Anxiety Related', color: 'bg-teal-500' },
  { value: 'burns', label: 'Burns', color: 'bg-orange-600' },
  { value: 'cardiac', label: 'Cardiac', color: 'bg-red-500' },
  { value: 'cardiac-ecg', label: 'Cardiac ECG', color: 'bg-red-600' },
  { value: 'elderly-fall', label: 'Elderly Fall', color: 'bg-indigo-500' },
  { value: 'environmental', label: 'Environmental', color: 'bg-amber-500' },
  { value: 'general', label: 'General', color: 'bg-gray-500' },
  { value: 'metabolic', label: 'Metabolic', color: 'bg-green-500' },
  { value: 'multiple-patients', label: 'Multiple Patients', color: 'bg-slate-500' },
  { value: 'neurological', label: 'Neurological', color: 'bg-purple-500' },
  { value: 'obstetric', label: 'Obstetric', color: 'bg-pink-600' },
  { value: 'pediatric', label: 'Pediatric', color: 'bg-yellow-500' },
  { value: 'post-discharge', label: 'Post-Discharge', color: 'bg-cyan-500' },
  { value: 'psychiatric', label: 'Psychiatric', color: 'bg-pink-500' },
  { value: 'respiratory', label: 'Respiratory', color: 'bg-blue-500' },
  { value: 'rule-out', label: 'Rule-Out', color: 'bg-lime-500' },
  { value: 'toxicology', label: 'Toxicology', color: 'bg-violet-500' },
  { value: 'trauma', label: 'Trauma', color: 'bg-orange-500' },
] as const;
