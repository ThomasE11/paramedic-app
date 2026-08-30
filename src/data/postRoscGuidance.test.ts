import { describe, expect, it } from 'vitest';
import { cardiacArrestGuideline } from './clinicalGuidelines';
import { EVIDENCE_LIBRARY } from './evidenceLibrary';
import { secondYearCases } from './secondYearCases';

describe('post-ROSC temperature guidance', () => {
  it('keeps teaching registries aligned with fever prevention', () => {
    const studentFacingText = JSON.stringify({
      cardiacArrestGuideline,
      evidence: EVIDENCE_LIBRARY.find(topic => topic.id === 'ttm-post-rosc'),
      secondYearCases,
    });

    expect(studentFacingText).toContain('37.5');
    expect(studentFacingText).toContain('36-72');
    expect(studentFacingText).not.toMatch(/target 32-36.{0,40}(?:hour|post-ROSC)/i);
  });

  it('links the live temperature-control treatment to its evidence topic', () => {
    const topic = EVIDENCE_LIBRARY.find(entry => entry.id === 'ttm-post-rosc');
    expect(topic?.treatmentIds).toContain('targeted_temp_mgmt');
  });
});
