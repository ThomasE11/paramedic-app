/**
 * Spec-as-tests for src/lib/findingTreatmentBridge.ts — A3, the
 * finding→treatment bridge (DESIGN_PROPOSAL.md).
 *
 * A revealed exam finding earns a "Treat" arm on the action ring; this module
 * maps the finding TEXT to where treatment lives: which jump bag to open and
 * what to pre-type in its search. It only narrows the shelf — it never picks
 * the drug — and it must never fire on a NEGATED finding ("no wheeze").
 *
 * Contract:
 *   export interface TreatBridge { bag: string; query: string; reason: string }
 *   export function bridgeForFinding(findingText: string): TreatBridge | null
 *
 * Mappings (priority order when several keywords appear in one text —
 * upper-airway first, mirroring the breath-sound routing precedence):
 *   1. 'stridor'                         -> bag 'breathing',   query 'adrenaline'
 *   2. 'silent chest'                    -> bag 'airway',      query 'ventilation'
 *   3. 'wheeze' / 'wheezing'             -> bag 'breathing',   query 'salbutamol'
 *   4. 'crackles' / 'crepitations' / 'pulmonary oedema'
 *                                        -> bag 'medications', query 'gtn'
 *   5. 'haemorrhage' / 'hemorrhage' / 'bleeding' / 'exsanguinat'
 *                                        -> bag 'circulation', query 'bleeding'
 * Anything else -> null. `reason` is a short teaching line (non-empty string);
 * its exact wording is the module's to choose — tests only pin bag + query.
 *
 * Negation: a keyword preceded (anywhere earlier in the text, within the same
 * text) by 'no ', 'without ', 'denies ' or immediately followed by ' absent'
 * does not count. 'clear' / 'nil' alone never bridge.
 */
import { describe, it, expect } from 'vitest';
import { bridgeForFinding } from './findingTreatmentBridge';

describe('bridgeForFinding — positive mappings', () => {
  it('wheeze -> breathing / salbutamol (the nebuliser lives in the breathing bag)', () => {
    const b = bridgeForFinding('Widespread expiratory wheeze throughout both lung fields');
    expect(b).not.toBeNull();
    expect(b!.bag).toBe('breathing');
    expect(b!.query).toBe('salbutamol');
    expect(b!.reason.length).toBeGreaterThan(0);
  });

  it('stridor -> breathing / adrenaline (nebulised adrenaline)', () => {
    const b = bridgeForFinding('Harsh inspiratory stridor audible without a stethoscope');
    expect(b!.bag).toBe('breathing');
    expect(b!.query).toBe('adrenaline');
  });

  it('silent chest -> airway / ventilation (BVM lives in the airway bag)', () => {
    const b = bridgeForFinding('Silent chest — no air entry bilaterally');
    expect(b!.bag).toBe('airway');
    expect(b!.query).toBe('ventilation');
  });

  it('crackles -> medications / gtn', () => {
    const b = bridgeForFinding('Coarse crackles at both bases, worse on the right');
    expect(b!.bag).toBe('medications');
    expect(b!.query).toBe('gtn');
  });

  it('pulmonary oedema wording also bridges to gtn', () => {
    const b = bridgeForFinding('Signs consistent with acute pulmonary oedema');
    expect(b!.bag).toBe('medications');
    expect(b!.query).toBe('gtn');
  });

  it('bleeding -> circulation / bleeding', () => {
    const b = bridgeForFinding('Active bleeding from a deep laceration to the thigh');
    expect(b!.bag).toBe('circulation');
    expect(b!.query).toBe('bleeding');
  });

  it('haemorrhage (British spelling) bridges too', () => {
    const b = bridgeForFinding('Catastrophic haemorrhage from the femoral region');
    expect(b!.bag).toBe('circulation');
    expect(b!.query).toBe('bleeding');
  });

  it('matching is case-insensitive', () => {
    expect(bridgeForFinding('WHEEZE noted')!.query).toBe('salbutamol');
  });
});

describe('bridgeForFinding — priority', () => {
  it('stridor outranks wheeze in a mixed presentation', () => {
    const b = bridgeForFinding('Upper stridor with scattered wheeze in the lower zones');
    expect(b!.query).toBe('adrenaline');
  });

  it('silent chest outranks wheeze and crackles', () => {
    const b = bridgeForFinding('Progressing to a silent chest; earlier wheeze and basal crackles');
    expect(b!.query).toBe('ventilation');
  });

  it('wheeze outranks crackles (cardiac asthma presents both)', () => {
    const b = bridgeForFinding('Wheeze over basal crackles');
    expect(b!.query).toBe('salbutamol');
  });
});

describe('bridgeForFinding — negation and nulls', () => {
  it('negated keyword does not bridge', () => {
    expect(bridgeForFinding('No wheeze or crackles heard')).toBeNull();
    expect(bridgeForFinding('Chest clear, without stridor')).toBeNull();
    expect(bridgeForFinding('Patient denies bleeding')).toBeNull();
  });

  it("'wheeze absent' does not bridge", () => {
    expect(bridgeForFinding('Wheeze absent on repeat auscultation')).toBeNull();
  });

  it('a negated keyword does not block a later positive one', () => {
    // 'no stridor' suppresses stridor only — the real wheeze still bridges
    const b = bridgeForFinding('No stridor, but loud expiratory wheeze persists');
    expect(b!.query).toBe('salbutamol');
  });

  it('unrelated findings return null', () => {
    expect(bridgeForFinding('Pupils equal and reactive, 3mm')).toBeNull();
    expect(bridgeForFinding('Abdomen soft, non-tender')).toBeNull();
    expect(bridgeForFinding('')).toBeNull();
  });
});
