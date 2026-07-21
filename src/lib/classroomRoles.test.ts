import { describe, it, expect } from 'vitest';
import {
  CLINICAL_ROLES,
  CLINICAL_ROLE_IDS,
  isActionAllowedForRole,
  getRoleBadgeStyle,
  type ClinicalRole,
} from './classroomRoles';

describe('classroomRoles', () => {
  it('lead can do everything', () => {
    for (const action of ['airway', 'circulation', 'medication', 'documentation', 'assess', 'navigate', 'override', 'anything-else']) {
      expect(isActionAllowedForRole('lead', action)).toBe(true);
    }
  });

  it('scribe cannot treat but can document', () => {
    expect(isActionAllowedForRole('scribe', 'documentation')).toBe(true);
    expect(isActionAllowedForRole('scribe', 'medication')).toBe(false);
    expect(isActionAllowedForRole('scribe', 'circulation')).toBe(false);
    expect(isActionAllowedForRole('scribe', 'airway')).toBe(false);
  });

  it('airway role is limited to airway + breathing actions', () => {
    expect(isActionAllowedForRole('airway', 'airway')).toBe(true);
    expect(isActionAllowedForRole('airway', 'breathing')).toBe(true);
    expect(isActionAllowedForRole('airway', 'circulation')).toBe(false);
    expect(isActionAllowedForRole('airway', 'medication')).toBe(false);
  });

  it('circulation role can do circulation but not airway (intubation)', () => {
    expect(isActionAllowedForRole('circulation', 'circulation')).toBe(true);
    expect(isActionAllowedForRole('circulation', 'airway')).toBe(false);
  });

  it('medication role can give drugs but not airway/circulation', () => {
    expect(isActionAllowedForRole('medication', 'medication')).toBe(true);
    expect(isActionAllowedForRole('medication', 'airway')).toBe(false);
    expect(isActionAllowedForRole('medication', 'circulation')).toBe(false);
  });

  it('returns false for an unknown role (fail closed)', () => {
    expect(isActionAllowedForRole('ghost' as ClinicalRole, 'medication')).toBe(false);
    expect(isActionAllowedForRole('ghost' as ClinicalRole, 'documentation')).toBe(false);
  });

  it('all 5 roles have valid definitions', () => {
    expect(CLINICAL_ROLE_IDS).toHaveLength(5);
    for (const id of CLINICAL_ROLE_IDS) {
      const def = CLINICAL_ROLES[id];
      expect(def.id).toBe(id);
      expect(def.label.length).toBeGreaterThan(0);
      expect(def.icon.length).toBeGreaterThan(0);
      expect(def.description.length).toBeGreaterThan(0);
      expect(def.allowedActions.length).toBeGreaterThan(0);
      expect(def.color.length).toBeGreaterThan(0);
    }
  });

  it('role badges have distinct colours', () => {
    const backgrounds = CLINICAL_ROLE_IDS.map(id => getRoleBadgeStyle(id).bg);
    expect(new Set(backgrounds).size).toBe(CLINICAL_ROLE_IDS.length);
  });
});
