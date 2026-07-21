import { describe, it, expect } from 'vitest';
import {
  INJECT_CATALOGUE,
  createInject,
  type InjectType,
  type VitalsChangePayload,
} from './classroomInjects';

const ALL_TYPES: InjectType[] = [
  'bystander_update', 'hospital_radio', 'equipment_failure', 'patient_refusal',
  'new_finding', 'vitals_change', 'rhythm_change', 'environmental',
];

describe('classroomInjects', () => {
  it('catalogue has at least one preset for every inject type', () => {
    for (const type of ALL_TYPES) {
      expect(INJECT_CATALOGUE.some(i => i.type === type)).toBe(true);
    }
    expect(INJECT_CATALOGUE.length).toBeGreaterThanOrEqual(12);
  });

  it('createInject merges partial fields over type defaults', () => {
    const inject = createInject('bystander_update', {
      title: 'Custom bystander',
      payload: { message: 'hello' },
    });
    expect(inject.type).toBe('bystander_update');
    expect(inject.title).toBe('Custom bystander');
    expect(inject.payload).toEqual({ message: 'hello' });
    // Untouched fields fall back to sensible defaults.
    expect(inject.severity).toBe('info');
    expect(inject.description).toBe('');
  });

  it('vitals_change payload shape matches SharedCaseState.vitals fields', () => {
    const preset = INJECT_CATALOGUE.find(i => i.type === 'vitals_change');
    expect(preset).toBeDefined();
    const payload = preset!.payload as VitalsChangePayload;
    expect(typeof payload.reason).toBe('string');
    // Vitals keys must be a subset of the shared-state vitals shape.
    const allowed = new Set(['bp', 'pulse', 'respiration', 'spo2', 'temperature', 'gcs', 'bloodGlucose']);
    for (const key of Object.keys(payload.vitals)) {
      expect(allowed.has(key)).toBe(true);
    }
  });

  it('every preset uses a valid severity', () => {
    const valid = new Set(['info', 'warn', 'critical']);
    for (const inject of INJECT_CATALOGUE) {
      expect(valid.has(inject.severity)).toBe(true);
    }
  });

  it('inject ids are unique across the catalogue and factory output', () => {
    const presetIds = INJECT_CATALOGUE.map(i => i.id);
    expect(new Set(presetIds).size).toBe(presetIds.length);
    // createInject mints a fresh unique id each call.
    const a = createInject('environmental');
    const b = createInject('environmental');
    expect(a.id).not.toBe(b.id);
  });

  it('createInject with an unknown type still produces a valid inject', () => {
    const inject = createInject('not_a_real_type' as InjectType);
    expect(inject.id).toBeTruthy();
    expect(inject.severity).toBe('info');
    expect(inject.payload).toBeDefined();
    expect(typeof inject.timestamp).toBe('number');
  });
});
