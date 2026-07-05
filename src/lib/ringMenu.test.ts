/**
 * Spec-as-tests for src/lib/ringMenu.ts — the pure derivation layer of the
 * contextual action ring (DESIGN_PROPOSAL.md A2).
 *
 * Contract:
 *
 *   export interface RingAction { id: string; label: string; technique: string }
 *   export interface RingArm { technique: string; label: string; actionId: string }
 *
 *   deriveRingArms(actions: RingAction[]): RingArm[]
 *     - one arm per DISTINCT technique; the FIRST action of each technique in
 *       the input wins (authored order = clinical priority) and provides actionId
 *     - arms ordered by canon ['inspect','palpate','percuss','auscultate'];
 *       techniques outside the canon follow in first-appearance order
 *     - arm label = technique with first letter upper-cased ('inspect' -> 'Inspect')
 *     - at most 6 arms
 *     - [] for []
 *
 *   ringArmOffsets(count: number, radius: number): Array<{ x: number; y: number }>
 *     - `count` points evenly spaced on a circle of `radius`, SCREEN coords
 *       (+y is down), starting at 12 o'clock (0, -radius), going clockwise
 *     - x and y rounded to 2 decimals; [] when count <= 0
 */
import { describe, it, expect } from 'vitest';
import { deriveRingArms, ringArmOffsets, type RingAction } from './ringMenu';

const chestActions: RingAction[] = [
  { id: 'chest-inspect', label: 'Inspect Chest Wall', technique: 'inspect' },
  { id: 'chest-palpate', label: 'Palpate Ribs / Sternum', technique: 'palpate' },
  { id: 'chest-percuss', label: 'Percuss Lung Fields', technique: 'percuss' },
  { id: 'lung-anterior-auscultate', label: 'Auscultate Anterior', technique: 'auscultate' },
  { id: 'lung-lateral-auscultate', label: 'Auscultate Lateral', technique: 'auscultate' },
  { id: 'heart-auscultate', label: 'Auscultate Heart', technique: 'auscultate' },
];

describe('deriveRingArms', () => {
  it('one arm per distinct technique, canon order, first action wins', () => {
    const arms = deriveRingArms(chestActions);
    expect(arms.map(a => a.technique)).toEqual(['inspect', 'palpate', 'percuss', 'auscultate']);
    // three auscultate actions -> ONE arm, and it fires the FIRST (anterior)
    expect(arms.find(a => a.technique === 'auscultate')!.actionId).toBe('lung-anterior-auscultate');
  });

  it('labels are the capitalized technique', () => {
    const arms = deriveRingArms(chestActions);
    expect(arms.map(a => a.label)).toEqual(['Inspect', 'Palpate', 'Percuss', 'Auscultate']);
  });

  it('canon order applies regardless of input order', () => {
    const arms = deriveRingArms([...chestActions].reverse());
    expect(arms.map(a => a.technique)).toEqual(['inspect', 'palpate', 'percuss', 'auscultate']);
    // reversed input: the first auscultate encountered is now the heart
    expect(arms.find(a => a.technique === 'auscultate')!.actionId).toBe('heart-auscultate');
  });

  it('single-technique region yields a single arm', () => {
    const arms = deriveRingArms([
      { id: 'pupils-size', label: 'Pupil Size (mm)', technique: 'inspect' },
      { id: 'eyes-inspect', label: 'Conjunctiva', technique: 'inspect' },
    ]);
    expect(arms).toEqual([{ technique: 'inspect', label: 'Inspect', actionId: 'pupils-size' }]);
  });

  it('non-canon techniques follow the canon in first-appearance order', () => {
    const arms = deriveRingArms([
      { id: 'x-move', label: 'Move', technique: 'move' },
      { id: 'x-palpate', label: 'Palpate', technique: 'palpate' },
      { id: 'x-special', label: 'Special', technique: 'special' },
    ]);
    expect(arms.map(a => a.technique)).toEqual(['palpate', 'move', 'special']);
    expect(arms.find(a => a.technique === 'move')!.label).toBe('Move');
  });

  it('caps at 6 arms', () => {
    const many: RingAction[] = ['inspect', 'palpate', 'percuss', 'auscultate', 't5', 't6', 't7', 't8']
      .map((t, i) => ({ id: `a${i}`, label: t, technique: t }));
    expect(deriveRingArms(many)).toHaveLength(6);
  });

  it('returns [] for []', () => {
    expect(deriveRingArms([])).toEqual([]);
  });
});

describe('ringArmOffsets', () => {
  it('single arm sits at 12 o\'clock', () => {
    expect(ringArmOffsets(1, 80)).toEqual([{ x: 0, y: -80 }]);
  });

  it('four arms land at the compass points, clockwise from top', () => {
    expect(ringArmOffsets(4, 100)).toEqual([
      { x: 0, y: -100 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
      { x: -100, y: 0 },
    ]);
  });

  it('every offset sits on the circle', () => {
    for (const { x, y } of ringArmOffsets(5, 72)) {
      expect(Math.sqrt(x * x + y * y)).toBeCloseTo(72, 1);
    }
  });

  it('count matches and non-positive count is empty', () => {
    expect(ringArmOffsets(6, 50)).toHaveLength(6);
    expect(ringArmOffsets(0, 50)).toEqual([]);
    expect(ringArmOffsets(-2, 50)).toEqual([]);
  });
});
