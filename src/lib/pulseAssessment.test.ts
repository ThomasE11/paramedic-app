import { describe, expect, it } from 'vitest';
import { firstYearCases } from '@/data/firstYearCases';
import { additionalTraumaCases } from '@/data/additionalCases';
import { assessPulseAtSite, derivePulseReassessedTreatmentIds, parsePulseSite } from '@/lib/pulseAssessment';

const stableFracture = firstYearCases.find(caseData => caseData.id === 'y1-020')!;
const amputation = additionalTraumaCases.find(caseData => caseData.id === 'trauma-011')!;

describe('anatomical pulse assessment', () => {
  it('parses every side-specific mannequin action', () => {
    expect(parsePulseSite('pulse-carotid-left')).toBe('carotid-left');
    expect(parsePulseSite('pulse-radial-right')).toBe('radial-right');
    expect(parsePulseSite('pulse-pedal-left')).toBe('pedal-left');
  });

  it('returns a normal distal pulse for a perfused closed fracture', () => {
    expect(assessPulseAtSite({
      site: 'pedal-right',
      caseData: stableFracture,
      vitals: { pulse: 104, bp: '128/78' },
    })).toMatchObject({ palpable: true, rhythm: 'regular', character: 'good volume', capillaryRefillSeconds: 2 });
  });

  it('keeps the unaffected radial pulse while removing the amputated-side pulse', () => {
    expect(assessPulseAtSite({ site: 'radial-right', caseData: amputation, vitals: { pulse: 120, bp: '90/60' } }).palpable).toBe(false);
    expect(assessPulseAtSite({ site: 'radial-left', caseData: amputation, vitals: { pulse: 120, bp: '90/60' } })).toMatchObject({ palpable: true, character: 'weak and thready' });
  });

  it('loses peripheral pulses before the carotid in profound hypotension', () => {
    expect(assessPulseAtSite({ site: 'radial-right', caseData: stableFracture, vitals: { pulse: 130, bp: '70/40' } }).palpable).toBe(false);
    expect(assessPulseAtSite({ site: 'carotid-right', caseData: stableFracture, vitals: { pulse: 130, bp: '70/40' } })).toMatchObject({ palpable: true, character: 'weak and thready' });
  });

  it('makes the distal pulse absent after a tourniquet on that exact limb', () => {
    const result = assessPulseAtSite({
      site: 'pedal-right',
      caseData: stableFracture,
      vitals: { pulse: 104, bp: '128/78' },
      appliedTreatmentIds: ['site:tourniquet:right-leg'],
    });
    expect(result.palpable).toBe(false);
    expect(result.summary).toContain('Expected distal to the applied tourniquet');
  });

  it('credits only the matching limb pulse check as tourniquet reassessment', () => {
    const applied = ['tourniquet', 'site:tourniquet:right-leg'];

    expect(derivePulseReassessedTreatmentIds('pedal-right', applied)).toEqual(['tourniquet']);
    expect(derivePulseReassessedTreatmentIds('pedal-left', applied)).toEqual([]);
    expect(derivePulseReassessedTreatmentIds('radial-right', applied)).toEqual([]);
  });

  it('reports no central pulse during arrest', () => {
    expect(assessPulseAtSite({
      site: 'carotid-left',
      caseData: stableFracture,
      vitals: { pulse: 0, bp: '0/0' },
      isInArrest: true,
    }).palpable).toBe(false);
  });
});
