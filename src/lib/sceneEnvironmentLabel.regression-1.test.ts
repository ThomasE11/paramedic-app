import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { sceneEnvironmentLabel } from './sceneEnvironment';

// Regression: ISSUE-003 — a construction-site office was labelled as a generic public venue
// Found by /qa on 2026-08-30
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
describe('sceneEnvironmentLabel', () => {
  it('preserves worksite context for an office inside a construction site', () => {
    const caseData = {
      dispatchInfo: { location: 'Construction site office, Al Quoz Industrial Area, Dubai' },
      sceneInfo: { description: 'Patient inside the site portacabin' },
    } as CaseScenario;

    expect(sceneEnvironmentLabel(caseData, 'public')).toBe('worksite office');
  });

  it('keeps an ordinary commercial office as a public venue', () => {
    const caseData = {
      dispatchInfo: { location: 'Office in Downtown Dubai' },
      sceneInfo: { description: 'Open-plan commercial office' },
    } as CaseScenario;

    expect(sceneEnvironmentLabel(caseData, 'public')).toBe('public venue');
  });
});
