/**
 * replayTimeline — pure data layer for the event-synced replay debrief
 * (PATIENT_SIM_RESEARCH.md §2, interaction pattern C — iSimulate-style replay).
 *
 * Takes the session artifacts StudentPanel already records (vitals history,
 * applied treatments, performed assessments, arrest timeline, adverse events,
 * case start/end epochs) and normalizes them into a single time-sorted
 * timeline on a seconds-since-case-start axis:
 *
 *   { tStart: 0, tEnd: durationSeconds, frames: [{t, vitals}], events: [{t, kind, label, detail?}] }
 *
 * Everything here is defensive: missing/empty/partial inputs never throw —
 * they simply produce a smaller (possibly empty) timeline. Vitals entries
 * without a parseable timestamp are linearly interpolated between their
 * timestamped neighbours (or spread evenly if nothing is timestamped).
 *
 * No React, no side effects — unit-testable in a node environment.
 */

import type { VitalSigns } from '@/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ReplayEventKind =
  | 'assessment'
  | 'treatment'
  | 'complication'
  | 'phase'
  | 'critical';

export interface ReplayFrame {
  /** Seconds since case start (>= 0, <= tEnd). */
  t: number;
  vitals: VitalSigns;
}

export interface ReplayEvent {
  /** Seconds since case start (>= 0, <= tEnd). */
  t: number;
  kind: ReplayEventKind;
  label: string;
  detail?: string;
}

export interface ReplayTimeline {
  /** Always 0 when the timeline is non-empty. */
  tStart: number;
  /** Case duration in whole-ish seconds (>= 1 when any data exists, else 0). */
  tEnd: number;
  /** Time-sorted vitals snapshots. */
  frames: ReplayFrame[];
  /** Time-sorted event markers. */
  events: ReplayEvent[];
}

/** Structural subset of AppliedTreatment (src/types). */
export interface ReplayTreatmentInput {
  name?: string;
  description?: string;
  /** ISO timestamp. */
  appliedAt?: string;
}

/** Structural subset of PerformedAssessment (src/data/assessmentFramework). */
export interface ReplayAssessmentInput {
  stepId: string;
  /** ISO timestamp. */
  performedAt?: string;
  /** Seconds since case start — preferred when finite. */
  elapsedSeconds?: number;
  findings?: { label: string; value: string; severity?: string }[];
}

/** Structural match for StudentPanel's arrestTimeline entries. */
export interface ReplayArrestEventInput {
  /** Epoch milliseconds. */
  time: number;
  event: string;
  type: string;
}

/** Structural match for StudentPanel's adverseEventsRef records. */
export interface ReplayAdverseEventInput {
  treatmentName?: string;
  kind?: string;
  allergy?: string;
  /** Epoch milliseconds. */
  administeredAt?: number;
  /** Epoch milliseconds, if the student recognized + treated the reaction. */
  recognizedRescueAt?: number | null;
  reachedArrest?: boolean;
}

export interface ReplayTimelineInput {
  /** Epoch milliseconds. */
  caseStartTime?: number | null;
  /** Epoch milliseconds. */
  caseEndTime?: number | null;
  vitalsHistory?: readonly (VitalSigns | null | undefined)[] | null;
  appliedTreatments?: readonly (ReplayTreatmentInput | null | undefined)[] | null;
  performedAssessments?: readonly (ReplayAssessmentInput | null | undefined)[] | null;
  arrestEvents?: readonly (ReplayArrestEventInput | null | undefined)[] | null;
  adverseEvents?: readonly (ReplayAdverseEventInput | null | undefined)[] | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const EMPTY_TIMELINE: ReplayTimeline = Object.freeze({
  tStart: 0,
  tEnd: 0,
  frames: [],
  events: [],
});

/**
 * Real sessions can record vitals every animation tick (observed: ~7,700
 * entries in a 90s case). Cap the frame count so the replay stays cheap;
 * stride-sample preserving the first and last entries.
 */
export const MAX_REPLAY_FRAMES = 1200;

const downsample = <T>(items: T[], max: number): T[] => {
  if (items.length <= max) return items;
  const out: T[] = [];
  const step = (items.length - 1) / (max - 1);
  for (let i = 0; i < max; i++) out.push(items[Math.round(i * step)]);
  return out;
};

/** Parse an epoch-ms number or a date string into epoch ms; null when unusable. */
const parseEpochMs = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (typeof value === 'string' && value.length > 0) {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
};

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

const round1 = (v: number): number => Math.round(v * 10) / 10;

/** Acronyms that should stay uppercase when prettifying assessment step ids. */
const STEP_ACRONYMS = new Set([
  'ecg', 'bp', 'bgl', 'gcs', 'spo2', 'avpu', 'ppe', 'iv', 'io',
  'sample', 'opqrst', 'dcap', 'btls', 'cpr',
]);

/** 'scene-safety' -> 'Scene Safety', '12-lead-ecg' -> '12 Lead ECG'. */
export const prettifyStepId = (stepId: string): string =>
  String(stepId || '')
    .split('-')
    .filter(Boolean)
    .map(word =>
      STEP_ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');

/** Map StudentPanel arrest-timeline event types onto replay event kinds. */
export const classifyArrestEvent = (type: string): ReplayEventKind => {
  switch (type) {
    case 'arrest-start':
    case 'rosc':
    case 'shock':
      return 'critical';
    case 'rhythm-check':
      return 'assessment';
    case 'drug':
    case 'lucas':
    case 'cpr-start':
    case 'cpr-pause':
    case 'treatment':
      return 'treatment';
    default:
      return 'critical';
  }
};

/** Pick the most clinically interesting finding for an assessment's detail line. */
const summarizeFindings = (
  findings: ReplayAssessmentInput['findings'],
): string | undefined => {
  if (!Array.isArray(findings) || findings.length === 0) return undefined;
  const pick =
    findings.find(f => f?.severity === 'critical') ??
    findings.find(f => f?.severity === 'abnormal') ??
    findings[0];
  if (!pick || (!pick.label && !pick.value)) return undefined;
  return [pick.label, pick.value].filter(Boolean).join(': ');
};

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function buildReplayTimeline(input?: ReplayTimelineInput | null): ReplayTimeline {
  if (!input) return EMPTY_TIMELINE;

  const vitalsHistory = downsample(
    (input.vitalsHistory ?? []).filter(
      (v): v is VitalSigns => v != null && typeof v === 'object',
    ),
    MAX_REPLAY_FRAMES,
  );
  const treatments = (input.appliedTreatments ?? []).filter(
    (t): t is ReplayTreatmentInput => t != null && typeof t === 'object',
  );
  const assessments = (input.performedAssessments ?? []).filter(
    (a): a is ReplayAssessmentInput => a != null && typeof a === 'object' && !!a.stepId,
  );
  const arrestEvents = (input.arrestEvents ?? []).filter(
    (e): e is ReplayArrestEventInput => e != null && typeof e === 'object' && !!e.event,
  );
  const adverseEvents = (input.adverseEvents ?? []).filter(
    (e): e is ReplayAdverseEventInput => e != null && typeof e === 'object',
  );

  const hasAnyData =
    vitalsHistory.length > 0 ||
    treatments.length > 0 ||
    assessments.length > 0 ||
    arrestEvents.length > 0 ||
    adverseEvents.length > 0;
  if (!hasAnyData) return EMPTY_TIMELINE;

  // --- Resolve the absolute time window -----------------------------------
  const absCandidates: number[] = [];
  for (const v of vitalsHistory) {
    const ms = parseEpochMs(v.time);
    if (ms != null) absCandidates.push(ms);
  }
  for (const t of treatments) {
    const ms = parseEpochMs(t.appliedAt);
    if (ms != null) absCandidates.push(ms);
  }
  for (const a of assessments) {
    const ms = parseEpochMs(a.performedAt);
    if (ms != null) absCandidates.push(ms);
  }
  for (const e of arrestEvents) {
    const ms = parseEpochMs(e.time);
    if (ms != null) absCandidates.push(ms);
  }
  for (const e of adverseEvents) {
    const ms = parseEpochMs(e.administeredAt);
    if (ms != null) absCandidates.push(ms);
    const rescueMs = parseEpochMs(e.recognizedRescueAt);
    if (rescueMs != null) absCandidates.push(rescueMs);
  }

  const explicitStart = parseEpochMs(input.caseStartTime);
  const explicitEnd = parseEpochMs(input.caseEndTime);
  const startEpoch =
    explicitStart ?? (absCandidates.length ? Math.min(...absCandidates) : null);
  const endEpoch =
    explicitEnd ?? (absCandidates.length ? Math.max(...absCandidates) : null);

  const durFromAbs =
    startEpoch != null && endEpoch != null && endEpoch > startEpoch
      ? (endEpoch - startEpoch) / 1000
      : 0;
  const relCandidates = assessments
    .map(a => a.elapsedSeconds)
    .filter((s): s is number => typeof s === 'number' && Number.isFinite(s) && s >= 0);
  const durFromRel = relCandidates.length ? Math.max(...relCandidates) : 0;
  // With zero usable duration signal anywhere, spread frames one second apart
  // as a last resort. Never let this override a real window: recorded vitals
  // arrays can be enormous (one entry per animation tick), so the count says
  // nothing about wall-clock duration when timestamps exist.
  const durFallback =
    durFromAbs === 0 && durFromRel === 0 && vitalsHistory.length > 1
      ? vitalsHistory.length - 1
      : 0;

  const tEnd = round1(Math.max(durFromAbs, durFromRel, durFallback, 1));

  /** Absolute epoch ms -> clamped relative seconds. Null when unresolvable. */
  const toRel = (ms: number | null): number | null => {
    if (ms == null || startEpoch == null) return null;
    return round1(clamp((ms - startEpoch) / 1000, 0, tEnd));
  };

  // --- Frames: resolve each vitals entry to a relative time ----------------
  // Known timestamps are used directly; unknown ones are linearly interpolated
  // between the nearest known neighbours (or spread evenly across the gap).
  //
  // Duplicate-run collapse: real recordings write long runs of entries that
  // all carry the same stale `time` (ensureCompleteVitals only stamps a time
  // when one is missing, so the generation-time timestamp is carried through
  // every subsequent snapshot). Treat only the FIRST entry of an equal-time
  // run as a trusted anchor and interpolate the rest, so a run spreads across
  // the gap to the next distinct anchor (or to tEnd) instead of stacking on
  // one instant.
  const rawTimes: (number | null)[] = vitalsHistory.map(v => toRel(parseEpochMs(v.time)));
  let prevAnchor: number | null = null;
  for (let i = 0; i < rawTimes.length; i++) {
    if (rawTimes[i] == null) continue;
    if (prevAnchor != null && rawTimes[i] === prevAnchor) {
      rawTimes[i] = null; // duplicate of the previous anchor — interpolate it
    } else {
      prevAnchor = rawTimes[i];
    }
  }
  const resolvedTimes: number[] = new Array(vitalsHistory.length).fill(0);
  const knownIdx = rawTimes
    .map((t, i) => (t != null ? i : -1))
    .filter(i => i >= 0);

  if (vitalsHistory.length > 0) {
    if (knownIdx.length === 0) {
      // Nothing timestamped: spread evenly across the case.
      const step = vitalsHistory.length > 1 ? tEnd / (vitalsHistory.length - 1) : 0;
      for (let i = 0; i < vitalsHistory.length; i++) resolvedTimes[i] = round1(i * step);
    } else {
      for (const i of knownIdx) resolvedTimes[i] = rawTimes[i] as number;
      // Leading gap: spread from 0 up to the first known anchor.
      const first = knownIdx[0];
      for (let i = 0; i < first; i++) {
        resolvedTimes[i] = round1(((rawTimes[first] as number) * i) / first);
      }
      // Interior gaps: linear interpolation between anchors.
      for (let k = 0; k < knownIdx.length - 1; k++) {
        const a = knownIdx[k];
        const b = knownIdx[k + 1];
        const ta = rawTimes[a] as number;
        const tb = rawTimes[b] as number;
        for (let i = a + 1; i < b; i++) {
          resolvedTimes[i] = round1(ta + ((tb - ta) * (i - a)) / (b - a));
        }
      }
      // Trailing gap: spread from the last anchor out to tEnd.
      const last = knownIdx[knownIdx.length - 1];
      const remaining = vitalsHistory.length - 1 - last;
      if (remaining > 0) {
        const tLast = rawTimes[last] as number;
        const span = Math.max(0, tEnd - tLast);
        for (let i = last + 1; i < vitalsHistory.length; i++) {
          resolvedTimes[i] = round1(tLast + (span * (i - last)) / remaining);
        }
      }
    }
  }

  const frames: ReplayFrame[] = vitalsHistory
    .map((vitals, i) => ({ t: clamp(resolvedTimes[i], 0, tEnd), vitals, i }))
    .sort((a, b) => a.t - b.t || a.i - b.i)
    .map(({ t, vitals }) => ({ t, vitals }));
  // Enforce a monotonic axis even if source timestamps were shuffled/bad.
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].t < frames[i - 1].t) frames[i] = { ...frames[i], t: frames[i - 1].t };
  }

  // --- Events ---------------------------------------------------------------
  const events: ReplayEvent[] = [];

  events.push({ t: 0, kind: 'phase', label: 'Case started' });

  for (const a of assessments) {
    const rel =
      typeof a.elapsedSeconds === 'number' && Number.isFinite(a.elapsedSeconds) && a.elapsedSeconds >= 0
        ? round1(clamp(a.elapsedSeconds, 0, tEnd))
        : toRel(parseEpochMs(a.performedAt));
    if (rel == null) continue;
    events.push({
      t: rel,
      kind: 'assessment',
      label: prettifyStepId(a.stepId),
      detail: summarizeFindings(a.findings),
    });
  }

  for (const tx of treatments) {
    const rel = toRel(parseEpochMs(tx.appliedAt));
    if (rel == null) continue;
    const label = tx.name || tx.description || 'Treatment';
    events.push({
      t: rel,
      kind: 'treatment',
      label,
      detail: tx.name && tx.description && tx.description !== tx.name ? tx.description : undefined,
    });
  }

  for (const e of arrestEvents) {
    const rel = toRel(parseEpochMs(e.time));
    if (rel == null) continue;
    events.push({ t: rel, kind: classifyArrestEvent(e.type), label: e.event });
  }

  for (const e of adverseEvents) {
    const rel = toRel(parseEpochMs(e.administeredAt));
    if (rel != null) {
      const detailParts = [
        e.kind ? `Reaction: ${e.kind}` : null,
        e.allergy ? `Allergy: ${e.allergy}` : null,
        e.reachedArrest ? 'Progressed to arrest' : null,
      ].filter(Boolean);
      events.push({
        t: rel,
        kind: 'complication',
        label: `Adverse reaction — ${e.treatmentName || 'medication'}`,
        detail: detailParts.length ? detailParts.join(' · ') : undefined,
      });
    }
    const rescueRel = toRel(parseEpochMs(e.recognizedRescueAt));
    if (rescueRel != null) {
      events.push({
        t: rescueRel,
        kind: 'treatment',
        label: `Reaction recognised — rescue treatment given${e.treatmentName ? ` (${e.treatmentName})` : ''}`,
      });
    }
  }

  events.push({ t: tEnd, kind: 'phase', label: 'Case complete' });

  // Stable sort by time (preserve insertion order on ties).
  const sortedEvents = events
    .map((e, i) => ({ e, i }))
    .sort((a, b) => a.e.t - b.e.t || a.i - b.i)
    .map(({ e }) => e);

  return { tStart: 0, tEnd, frames, events: sortedEvents };
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Binary search: the vitals frame in effect at time t — i.e. the last frame
 * with frame.t <= t. Falls back to the first frame when t precedes it.
 * Returns null for an empty timeline.
 */
export function frameAt(timeline: ReplayTimeline, t: number): ReplayFrame | null {
  const frames = timeline?.frames;
  if (!frames || frames.length === 0) return null;
  if (!Number.isFinite(t) || t <= frames[0].t) return frames[0];

  let lo = 0;
  let hi = frames.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (frames[mid].t <= t) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return frames[ans];
}

/**
 * Binary search: index of the event closest to time t (earlier event wins
 * exact ties). Returns -1 for an empty timeline.
 */
export function nearestEventIndex(timeline: ReplayTimeline, t: number): number {
  const events = timeline?.events;
  if (!events || events.length === 0) return -1;
  if (!Number.isFinite(t)) return 0;

  // First index with event.t > t.
  let lo = 0;
  let hi = events.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (events[mid].t <= t) lo = mid + 1;
    else hi = mid;
  }
  const before = lo - 1;
  const after = lo;
  if (before < 0) return 0;
  if (after >= events.length) return before;
  return t - events[before].t <= events[after].t - t ? before : after;
}
