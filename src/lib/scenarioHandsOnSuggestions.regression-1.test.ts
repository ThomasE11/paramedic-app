import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { suggestedTreatmentIdsForCase } from '@/components/TreatmentJumpBagPanel';

function suggestions(caseId: string): string[] {
  const caseData = allCases.find(candidate => candidate.id === caseId)!;
  return suggestedTreatmentIdsForCase(
    caseData,
    buildInitialVitalsFromCase(caseData),
    false,
    [],
    caseData.initialRhythm,
  );
}

describe('regression: authored hands-on actions are surfaced by scenario', () => {
  it('surfaces both components of syncope positioning', () => {
    expect(suggestions('general-001')).toEqual(expect.arrayContaining([
      'supine_position',
      'leg_elevation',
    ]));
  });

  it('surfaces the pelvic binder and spinal transfer devices for pelvic trauma', () => {
    expect(suggestions('trauma-008')).toEqual(expect.arrayContaining([
      'pelvic_binder',
      'spinal_board',
    ]));
  });

  it('puts first-line choking manoeuvres before advanced airway rescue', () => {
    expect(suggestions('resp-009').slice(0, 2)).toEqual([
      'back_blows',
      'abdominal_thrusts',
    ]);
  });

  it('uses local cooling for a flash burn without treating infection fever as heat stroke', () => {
    expect(suggestions('y2-004')).toContain('active_cooling');
    expect(suggestions('sepsis-001')).not.toContain('active_cooling');
    expect(suggestions('neuro-003')).not.toContain('active_cooling');
  });
});
