/**
 * classroomRoles — clinical role definitions for classroom sessions.
 *
 * A classroom case can be run as a resus team: the instructor assigns each
 * connected student a clinical role (team lead, airway, circulation,
 * medication, scribe). Roles are *advisory* — they drive soft warnings and
 * badges, never hard blocks. The instructor is always in charge and can
 * override; roles are orthogonal to the driver_set privilege that decides
 * who may actually mutate the shared state.
 *
 * `allowedActions` is matched against a treatment's `category`
 * (see the Treatment.category union in src/types) plus a couple of
 * simulation verbs ('assess', 'navigate', 'override'). The team lead holds
 * the '*' wildcard — they can do everything.
 *
 * Pure module: no React, no side effects. Safe to import anywhere.
 */

export type ClinicalRole = 'lead' | 'airway' | 'circulation' | 'medication' | 'scribe';

/** Action kinds a role may be allowed to perform. '*' = everything. */
export type ActionType =
  | '*'
  | 'assess'
  | 'navigate'
  | 'override'
  // Treatment.category values that matter for role gating:
  | 'airway'
  | 'breathing'
  | 'circulation'
  | 'medication'
  | 'documentation';

export interface RoleDefinition {
  id: ClinicalRole;
  /** Short human label (also an i18n key: `classroom.roles.<id>.label`). */
  label: string;
  /** Lucide icon name — resolved by the consuming component. */
  icon: string;
  description: string;
  allowedActions: ActionType[];
  /** Base tailwind colour token for the role (e.g. 'emerald', 'sky'). */
  color: string;
}

export const CLINICAL_ROLES: Record<ClinicalRole, RoleDefinition> = {
  lead: {
    id: 'lead',
    label: 'Team Lead',
    icon: 'Crown',
    description: 'Primary clinician — directs the team, may perform any action.',
    allowedActions: ['*'],
    color: 'amber',
  },
  airway: {
    id: 'airway',
    label: 'Airway',
    icon: 'Wind',
    description: 'Airway & breathing — head tilt, jaw thrust, suction, adjuncts, BVM, intubation, oxygen.',
    allowedActions: ['airway', 'breathing'],
    color: 'sky',
  },
  circulation: {
    id: 'circulation',
    label: 'Circulation',
    icon: 'HeartPulse',
    description: 'Circulation — CPR, defibrillation, IV access, fluids, haemorrhage control.',
    allowedActions: ['circulation'],
    color: 'rose',
  },
  medication: {
    id: 'medication',
    label: 'Medication',
    icon: 'Syringe',
    description: 'Drug administration by any route, plus dose calculations.',
    allowedActions: ['medication'],
    color: 'violet',
  },
  scribe: {
    id: 'scribe',
    label: 'Scribe',
    icon: 'ClipboardList',
    description: 'Documentation only — records events and timestamps, performs no clinical action.',
    allowedActions: ['documentation'],
    color: 'slate',
  },
};

/** Every clinical role id, in team order. */
export const CLINICAL_ROLE_IDS = Object.keys(CLINICAL_ROLES) as ClinicalRole[];

/**
 * Is `actionKind` permitted for `role`? The team lead ('*') can do anything.
 * Unknown roles return false — fail closed so a typo never silently grants
 * privileges. `actionKind` is typically a Treatment.category string but may
 * be any simulation verb.
 */
export function isActionAllowedForRole(role: ClinicalRole, actionKind: string): boolean {
  const def = CLINICAL_ROLES[role];
  if (!def) return false;
  if (def.allowedActions.includes('*')) return true;
  return (def.allowedActions as string[]).includes(actionKind);
}

/**
 * Tailwind classes for a role badge. Static map (not string-interpolated)
 * so Tailwind's JIT can see every class at build time.
 */
export function getRoleBadgeStyle(role: ClinicalRole): { bg: string; text: string; border: string } {
  switch (role) {
    case 'lead':
      return { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/40' };
    case 'airway':
      return { bg: 'bg-sky-500/15', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-500/40' };
    case 'circulation':
      return { bg: 'bg-rose-500/15', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500/40' };
    case 'medication':
      return { bg: 'bg-violet-500/15', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-500/40' };
    case 'scribe':
      return { bg: 'bg-slate-500/15', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-500/40' };
  }
}
