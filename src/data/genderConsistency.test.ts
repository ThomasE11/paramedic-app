import { describe, it, expect } from 'vitest';
import { allCases } from './cases';

/**
 * Field bug guard: a student generated a case narrated as male and the 3D
 * scene showed the female model (the mesh is picked from
 * caseData.patientInfo.gender). The narrative demographics and
 * patientInfo.gender must agree on EVERY case — including programmatically
 * built variants that static grep can't see.
 */

// Extract a gendered demographic phrase ABOUT THE PATIENT (not bystanders):
// "45yo Male", "23-year-old woman", "Elderly Male", "(45-year-old male)" etc.
const PATIENT_PHRASE = /(?:\d+\s*(?:yo|y\/o|[- ]?years?[- ]old)|elderly|young|middle[- ]aged|adult|teenage)\s*[,–-]?\s*(male|female|man|woman|boy|girl)\b/i;

function phraseGender(text: string): 'male' | 'female' | null {
  const m = PATIENT_PHRASE.exec(text);
  if (!m) return null;
  return /male|man|boy/i.test(m[1]) && !/female|woman|girl/i.test(m[1]) ? 'male' : 'female';
}

describe('case gender consistency (narrative vs patientInfo)', () => {
  it('title and dispatch demographics match patientInfo.gender on every case', () => {
    const mismatches: string[] = [];
    for (const c of allCases) {
      const declared = c.patientInfo?.gender;
      if (!declared) continue;
      const sources: Array<[string, string | undefined]> = [
        ['title', c.title],
        ['callReason', c.dispatchInfo?.callReason],
        ['callerInfo', c.dispatchInfo?.callerInfo],
        ['appearance', c.initialPresentation?.appearance],
        ['generalImpression', c.initialPresentation?.generalImpression],
      ];
      for (const [field, text] of sources) {
        if (!text) continue;
        const narrated = phraseGender(text);
        if (narrated && narrated !== declared) {
          mismatches.push(`${c.id} [${field}] says ${narrated} but patientInfo.gender=${declared}: "${text.slice(0, 70)}"`);
        }
      }
    }
    expect(mismatches, mismatches.join('\n')).toEqual([]);
  });

  it('every case declares a patient gender (the 3D mesh depends on it)', () => {
    const missing = allCases.filter(c => c.patientInfo?.gender !== 'male' && c.patientInfo?.gender !== 'female').map(c => c.id);
    expect(missing, `cases without patientInfo.gender: ${missing.join(', ')}`).toEqual([]);
  });
});
