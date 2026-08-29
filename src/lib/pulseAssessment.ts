import type { CaseScenario, VitalSigns } from '@/types';
import { inferInjuries, type BodyRegion } from '@/lib/injuryMap';
import { collectActualCaseClauses } from '@/lib/tractionSplintSafety';

export type PulseSite =
  | 'carotid-right'
  | 'carotid-left'
  | 'radial-right'
  | 'radial-left'
  | 'pedal-right'
  | 'pedal-left';

export interface PulseAssessmentResult {
  site: PulseSite;
  label: string;
  palpable: boolean;
  rate: number;
  rhythm: 'regular' | 'irregular';
  character: 'absent' | 'weak and thready' | 'good volume' | 'strong and bounding';
  capillaryRefillSeconds: number | null;
  summary: string;
}

const ABSENT = /\b(absent|no pulse|pulseless|not palpable|not present|cold and pulseless|cold,?\s*pulseless)\b/i;
const PRESENT = /\b(present|palpable|intact|strong|normal)\b/i;
const PULSE_WORD = /\b(pulse|dorsalis pedis|posterior tibial|pedal|radial)\b/i;

export function parsePulseSite(actionId: string): PulseSite {
  const value = actionId.toLowerCase();
  const side = value.includes('left') || /(?:^|-)l(?:-|$)/.test(value) ? 'left' : 'right';
  if (value.includes('carotid')) return `carotid-${side}`;
  if (value.includes('pedal') || value.includes('leg')) return `pedal-${side}`;
  return `radial-${side}`;
}

function siteRegion(site: PulseSite): BodyRegion | null {
  if (site.startsWith('carotid')) return null;
  const side = site.endsWith('left') ? 'left' : 'right';
  return site.startsWith('radial') ? `${side}-arm` : `${side}-leg`;
}

function siteLabel(site: PulseSite): string {
  const side = site.endsWith('left') ? 'Left' : 'Right';
  if (site.startsWith('carotid')) return `${side} carotid`;
  if (site.startsWith('radial')) return `${side} radial`;
  return `${side} pedal (DP/PT)`;
}

function clauseMatchesSite(clause: string, site: PulseSite): boolean {
  const side = site.endsWith('left') ? 'left' : 'right';
  const opposite = side === 'left' ? 'right' : 'left';
  if (new RegExp(`\\b${opposite}\\b`, 'i').test(clause)) return false;
  if (site.startsWith('carotid')) return /\b(carotid|central pulse)\b/i.test(clause);
  if (site.startsWith('radial')) return /\b(radial|wrist|hand|arm|upper limb|distal pulse)\b/i.test(clause);
  return /\b(dorsalis pedis|posterior tibial|pedal|foot|ankle|leg|lower limb|distal pulse)\b/i.test(clause);
}

function explicitPulseState(caseData: CaseScenario, site: PulseSite): 'absent' | 'present' | null {
  const clauses = collectActualCaseClauses(caseData);
  const hasSide = (clause: string) => /\b(left|right)\b/i.test(clause);
  const relevant = clauses.filter(clause =>
    PULSE_WORD.test(clause)
    && clauseMatchesSite(clause, site)
    && (site.startsWith('carotid') || hasSide(clause)),
  );
  if (relevant.some(clause => ABSENT.test(clause))) return 'absent';
  if (relevant.some(clause => PRESENT.test(clause) && !/^\s*no\b/i.test(clause))) return 'present';

  const region = siteRegion(site);
  if (!region) return null;
  const injuries = inferInjuries(caseData);
  if (injuries.some(injury => injury.region === region && injury.kind === 'amputation')) return 'absent';

  // Some case authors place "distal pulse absent" in a separate finding
  // immediately after the only injured limb. Preserve that structured meaning
  // without assigning a side when several limbs are injured.
  const injuredLimbRegions = [...new Set(
    injuries
      .filter(injury => ['left-arm', 'right-arm', 'left-leg', 'right-leg'].includes(injury.region))
      .map(injury => injury.region),
  )];
  const unscopedPulseClauses = clauses.filter(clause => PULSE_WORD.test(clause) && !hasSide(clause) && clauseMatchesSite(clause, site));
  if (injuredLimbRegions.length === 1 && injuredLimbRegions[0] === region) {
    if (unscopedPulseClauses.some(clause => ABSENT.test(clause))) return 'absent';
    if (unscopedPulseClauses.some(clause => PRESENT.test(clause) && !/^\s*no\b/i.test(clause))) return 'present';
  }
  return null;
}

function hasTourniquetAtSite(appliedTreatmentIds: Iterable<string>, site: PulseSite): boolean {
  const region = siteRegion(site);
  if (!region) return false;
  return [...appliedTreatmentIds].some(id => {
    const match = id.toLowerCase().match(/^site:([^:]+):(.+)$/);
    return Boolean(match && match[1].includes('tourniquet') && match[2] === region);
  });
}

export function assessPulseAtSite({
  site,
  caseData,
  vitals,
  rhythm = '',
  isInArrest = false,
  appliedTreatmentIds = [],
}: {
  site: PulseSite;
  caseData: CaseScenario;
  vitals: Pick<VitalSigns, 'pulse' | 'bp'>;
  rhythm?: string;
  isInArrest?: boolean;
  appliedTreatmentIds?: Iterable<string>;
}): PulseAssessmentResult {
  const rate = Number(vitals.pulse) || 0;
  const systolic = Number.parseInt(String(vitals.bp ?? '').split('/')[0], 10) || 0;
  const explicit = explicitPulseState(caseData, site);
  const authoredQuality = String(caseData.abcde?.circulation?.pulseQuality ?? '').toLowerCase();
  const central = site.startsWith('carotid');
  const pressurePalpable = systolic === 0 || (central ? systolic >= 60 : systolic >= 80);
  const palpable = !isInArrest
    && rate > 0
    && !hasTourniquetAtSite(appliedTreatmentIds, site)
    && explicit !== 'absent'
    && (explicit === 'present' || pressurePalpable);
  const irregular = /fib|flutter|irregular|ectopic|bigemin|\baf\b/i.test(rhythm);
  const character: PulseAssessmentResult['character'] = !palpable ? 'absent'
    : /weak|thready|faint/.test(authoredQuality) || (systolic > 0 && systolic < 90) || rate > 130 ? 'weak and thready'
      : /bounding/.test(authoredQuality) || systolic >= 160 || (rate < 55 && systolic >= 110) ? 'strong and bounding'
        : 'good volume';
  const crt = site.startsWith('carotid') ? null : caseData.abcde?.circulation?.capillaryRefill ?? null;
  const label = siteLabel(site);
  const summary = palpable
    ? `${label}: approximately ${rate} bpm, ${irregular ? 'irregular' : 'regular'}, ${character}.${typeof crt === 'number' ? ` Capillary refill ${crt}s (${crt > 2 ? 'delayed' : 'normal'}).` : ''}`
    : `${label}: no pulse palpable.${hasTourniquetAtSite(appliedTreatmentIds, site) ? ' Expected distal to the applied tourniquet; confirm bleeding control and continue limb surveillance.' : central ? ' Confirm cardiac arrest immediately if there are no other signs of life.' : ' Compare with a central pulse and assess perfusion or limb vascular injury.'}`;

  return {
    site,
    label,
    palpable,
    rate,
    rhythm: irregular ? 'irregular' : 'regular',
    character,
    capillaryRefillSeconds: typeof crt === 'number' ? crt : null,
    summary,
  };
}
