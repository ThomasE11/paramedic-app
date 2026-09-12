import { describe, expect, it } from 'vitest';
import { hasPainfulPalpationFinding } from './palpationReaction';

describe('palpation patient response evidence', () => {
  it.each([
    'No tenderness. No crepitus. No subcutaneous emphysema. Trachea central.',
    'Soft, non-tender. No guarding, rigidity, rebound tenderness, or palpable mass.',
    'TMJ nontender. Full range of movement. No crepitus.',
    'Pain-free movement. Painless palpation. Without swelling or deformity.',
    'Denies pain. No bruising, contusions or burns.',
    'Tenderness absent. Rebound negative.',
    'Nil tenderness; negative for crepitus.',
    'No guarding, rigidity or rebound tenderness',
    'Chest expansion symmetrical.',
  ])('does not invent pain from %s', finding => {
    expect(hasPainfulPalpationFinding(finding)).toBe(false);
  });

  it.each([
    'Tender over right ribs. No crepitus.',
    'No guarding, but focal tenderness in RUQ.',
    'Soft, with rebound tenderness.',
    'No deformity. Pain on palpation.',
    'Marked guarding and a rigid abdomen.',
    'Swelling and deformity over the fracture site.',
    'Crepitus present. Bruising over the chest wall.',
  ])('retains affirmative painful findings: %s', finding => {
    expect(hasPainfulPalpationFinding(finding)).toBe(true);
  });
});
