import { describe, it, expect } from 'vitest';
import type { VitalSigns } from '@/types';
import {
  buildReplayTimeline,
  frameAt,
  nearestEventIndex,
  prettifyStepId,
  classifyArrestEvent,
  type ReplayTimeline,
} from './replayTimeline';

// ---------------------------------------------------------------------------
// Fixtures — mirror the shapes StudentPanel actually records
// ---------------------------------------------------------------------------

const T0 = Date.UTC(2026, 6, 2, 10, 0, 0); // case start epoch ms

const iso = (offsetSeconds: number): string => new Date(T0 + offsetSeconds * 1000).toISOString();

const vitals = (overrides: Partial<VitalSigns> = {}): VitalSigns => ({
  bp: '120/80',
  pulse: 80,
  respiration: 16,
  spo2: 98,
  temperature: 36.5,
  gcs: 15,
  ...overrides,
});

const fullInput = () => ({
  caseStartTime: T0,
  caseEndTime: T0 + 600_000, // 10 min case
  vitalsHistory: [
    vitals({ pulse: 118, spo2: 84, time: iso(0) }),
    vitals({ pulse: 110, spo2: 90, time: iso(180) }),
    vitals({ pulse: 96, spo2: 95, time: iso(420) }),
    vitals({ pulse: 88, spo2: 97, time: iso(590) }),
  ],
  appliedTreatments: [
    { name: 'High-flow oxygen', description: 'NRB 15 L/min applied', appliedAt: iso(120) },
    { name: 'IV access', description: 'IV access', appliedAt: iso(300) },
  ],
  performedAssessments: [
    { stepId: 'scene-safety', performedAt: iso(5), elapsedSeconds: 5, findings: [] },
    {
      stepId: 'breathing',
      performedAt: iso(60),
      elapsedSeconds: 60,
      findings: [
        { label: 'SpO2', value: '84%', severity: 'critical' },
        { label: 'Air entry', value: 'Reduced left base', severity: 'abnormal' },
      ],
    },
  ],
  arrestEvents: [
    { time: T0 + 400_000, event: 'Cardiac arrest confirmed by student', type: 'arrest-start' },
    { time: T0 + 430_000, event: 'Adrenaline 1mg IV (dose #1)', type: 'drug' },
    { time: T0 + 520_000, event: 'ROSC achieved', type: 'rosc' },
  ],
  adverseEvents: [
    {
      treatmentName: 'Benzylpenicillin',
      kind: 'anaphylaxis',
      allergy: 'penicillin',
      administeredAt: T0 + 200_000,
      recognizedRescueAt: T0 + 260_000,
      reachedArrest: false,
    },
  ],
});

// ---------------------------------------------------------------------------
// buildReplayTimeline — empty / defensive inputs
// ---------------------------------------------------------------------------

describe('buildReplayTimeline — empty and malformed inputs', () => {
  it('returns an empty timeline for undefined/null input', () => {
    expect(buildReplayTimeline()).toEqual({ tStart: 0, tEnd: 0, frames: [], events: [] });
    expect(buildReplayTimeline(null)).toEqual({ tStart: 0, tEnd: 0, frames: [], events: [] });
  });

  it('returns an empty timeline when every collection is empty or missing', () => {
    const timeline = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 60_000,
      vitalsHistory: [],
      appliedTreatments: [],
      performedAssessments: [],
      arrestEvents: [],
      adverseEvents: [],
    });
    expect(timeline.frames).toHaveLength(0);
    expect(timeline.events).toHaveLength(0);
    expect(timeline.tEnd).toBe(0);
  });

  it('tolerates null entries inside collections without throwing', () => {
    const timeline = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 60_000,
      vitalsHistory: [null, vitals({ time: iso(10) }), undefined],
      appliedTreatments: [null, { name: 'Oxygen', description: 'O2', appliedAt: iso(20) }],
      performedAssessments: [undefined],
      arrestEvents: [null],
      adverseEvents: [null],
    });
    expect(timeline.frames).toHaveLength(1);
    expect(timeline.events.some(e => e.label === 'Oxygen')).toBe(true);
  });

  it('handles missing case start/end by inferring the window from the data', () => {
    const timeline = buildReplayTimeline({
      vitalsHistory: [
        vitals({ time: iso(0) }),
        vitals({ time: iso(120) }),
      ],
      appliedTreatments: [{ name: 'Aspirin', description: 'PO', appliedAt: iso(60) }],
    });
    expect(timeline.tEnd).toBe(120);
    expect(timeline.frames.map(f => f.t)).toEqual([0, 120]);
    const aspirin = timeline.events.find(e => e.label === 'Aspirin');
    expect(aspirin?.t).toBe(60);
  });

  it('spreads untimestamped vitals evenly when no timestamps exist anywhere', () => {
    const timeline = buildReplayTimeline({
      vitalsHistory: [vitals(), vitals(), vitals(), vitals()],
    });
    // 4 frames, fallback duration = 3s, evenly spaced.
    expect(timeline.tEnd).toBe(3);
    expect(timeline.frames.map(f => f.t)).toEqual([0, 1, 2, 3]);
  });

  it('interpolates vitals entries with unparseable times between timestamped anchors', () => {
    const timeline = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 100_000,
      vitalsHistory: [
        vitals({ time: iso(0) }),
        vitals({ time: '14:32' }), // legacy display-time — not parseable
        vitals({ time: iso(100) }),
      ],
    });
    expect(timeline.frames.map(f => f.t)).toEqual([0, 50, 100]);
  });

  it('clamps out-of-window timestamps into [0, tEnd]', () => {
    const timeline = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 60_000,
      vitalsHistory: [
        vitals({ time: iso(-30) }), // recorded before caseStartTime was set
        vitals({ time: iso(90) }), // after case end
      ],
      appliedTreatments: [{ name: 'Late drug', description: 'x', appliedAt: iso(75) }],
    });
    expect(timeline.frames[0].t).toBe(0);
    expect(timeline.frames[1].t).toBe(60);
    expect(timeline.events.find(e => e.label === 'Late drug')?.t).toBe(60);
  });

  // Regression: observed in a live session — the vitals monitor records an
  // entry per animation tick (~7,700 entries in a 90s case) and every entry
  // carries the SAME stale timestamp (ensureCompleteVitals only stamps a time
  // when missing, so the case-generation time is carried through forever).
  it('does not let a huge duplicate-timestamped history inflate the case duration', () => {
    const spammy = Array.from({ length: 500 }, (_, i) =>
      vitals({ pulse: 120 - Math.floor(i / 10), time: iso(0) }),
    );
    const timeline = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 90_000, // real case: 90 seconds
      vitalsHistory: spammy,
    });
    expect(timeline.tEnd).toBe(90);
    // Frames spread across the case instead of stacking on one instant.
    expect(timeline.frames[0].t).toBe(0);
    expect(timeline.frames[timeline.frames.length - 1].t).toBe(90);
    const mid = timeline.frames[Math.floor(timeline.frames.length / 2)];
    expect(mid.t).toBeGreaterThan(20);
    expect(mid.t).toBeLessThan(70);
  });

  it('caps enormous vitals histories while preserving the first and last samples', () => {
    const huge = Array.from({ length: 5000 }, (_, i) =>
      vitals({ pulse: i === 0 ? 111 : i === 4999 ? 55 : 80, time: iso(0) }),
    );
    const timeline = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 120_000,
      vitalsHistory: huge,
    });
    expect(timeline.frames.length).toBeLessThanOrEqual(1200);
    expect(timeline.frames[0].vitals.pulse).toBe(111);
    expect(timeline.frames[timeline.frames.length - 1].vitals.pulse).toBe(55);
  });

  it('spreads a duplicate-timestamp run between distinct anchors', () => {
    const timeline = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 60_000,
      vitalsHistory: [
        vitals({ pulse: 100, time: iso(0) }),
        vitals({ pulse: 98, time: iso(0) }), // stale duplicate
        vitals({ pulse: 96, time: iso(0) }), // stale duplicate
        vitals({ pulse: 90, time: iso(60) }),
      ],
    });
    expect(timeline.frames.map(f => f.t)).toEqual([0, 20, 40, 60]);
  });

  it('never produces a zero-length window when data exists (min 1s)', () => {
    const timeline = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0, // degenerate: end === start
      vitalsHistory: [vitals({ time: iso(0) })],
    });
    expect(timeline.tEnd).toBeGreaterThanOrEqual(1);
    expect(timeline.frames).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// buildReplayTimeline — ordering & classification
// ---------------------------------------------------------------------------

describe('buildReplayTimeline — ordering', () => {
  it('sorts frames by time even when the source array is shuffled', () => {
    const timeline = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 300_000,
      vitalsHistory: [
        vitals({ pulse: 90, time: iso(200) }),
        vitals({ pulse: 120, time: iso(10) }),
        vitals({ pulse: 100, time: iso(100) }),
      ],
    });
    expect(timeline.frames.map(f => f.t)).toEqual([10, 100, 200]);
    expect(timeline.frames.map(f => f.vitals.pulse)).toEqual([120, 100, 90]);
  });

  it('sorts all event sources into one ascending stream', () => {
    const timeline = buildReplayTimeline(fullInput());
    const times = timeline.events.map(e => e.t);
    const sorted = [...times].sort((a, b) => a - b);
    expect(times).toEqual(sorted);
    // Bookend phase markers.
    expect(timeline.events[0]).toMatchObject({ t: 0, kind: 'phase', label: 'Case started' });
    expect(timeline.events[timeline.events.length - 1]).toMatchObject({
      t: 600,
      kind: 'phase',
      label: 'Case complete',
    });
  });

  it('produces a monotonic frame axis', () => {
    const timeline = buildReplayTimeline(fullInput());
    for (let i = 1; i < timeline.frames.length; i++) {
      expect(timeline.frames[i].t).toBeGreaterThanOrEqual(timeline.frames[i - 1].t);
    }
  });
});

describe('buildReplayTimeline — event classification', () => {
  const timeline = buildReplayTimeline(fullInput());
  const byLabel = (label: string) => timeline.events.find(e => e.label.includes(label));

  it('classifies assessments as sky "assessment" events with prettified labels', () => {
    const scene = byLabel('Scene Safety');
    expect(scene).toMatchObject({ kind: 'assessment', t: 5 });
    const breathing = byLabel('Breathing');
    expect(breathing).toMatchObject({ kind: 'assessment', t: 60 });
    // Detail prefers the critical finding.
    expect(breathing?.detail).toBe('SpO2: 84%');
  });

  it('classifies applied treatments as "treatment" events', () => {
    expect(byLabel('High-flow oxygen')).toMatchObject({ kind: 'treatment', t: 120 });
    // description === name collapse: no redundant detail.
    expect(byLabel('IV access')?.detail).toBeUndefined();
    // name+description both present: description becomes the detail.
    expect(byLabel('High-flow oxygen')?.detail).toBe('NRB 15 L/min applied');
  });

  it('classifies arrest milestones as "critical" and arrest drugs as "treatment"', () => {
    expect(byLabel('Cardiac arrest confirmed')).toMatchObject({ kind: 'critical', t: 400 });
    expect(byLabel('ROSC achieved')).toMatchObject({ kind: 'critical', t: 520 });
    expect(byLabel('Adrenaline 1mg')).toMatchObject({ kind: 'treatment', t: 430 });
  });

  it('classifies adverse reactions as "complication" plus a rescue "treatment" event', () => {
    const reaction = byLabel('Adverse reaction — Benzylpenicillin');
    expect(reaction).toMatchObject({ kind: 'complication', t: 200 });
    expect(reaction?.detail).toContain('anaphylaxis');
    expect(reaction?.detail).toContain('penicillin');
    expect(byLabel('rescue treatment given')).toMatchObject({ kind: 'treatment', t: 260 });
  });

  it('falls back to elapsedSeconds when performedAt is missing', () => {
    const t = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 120_000,
      performedAssessments: [{ stepId: 'airway', elapsedSeconds: 42 }],
    });
    expect(t.events.find(e => e.label === 'Airway')).toMatchObject({ kind: 'assessment', t: 42 });
  });
});

describe('classifyArrestEvent / prettifyStepId', () => {
  it('maps arrest event types onto replay kinds', () => {
    expect(classifyArrestEvent('arrest-start')).toBe('critical');
    expect(classifyArrestEvent('rosc')).toBe('critical');
    expect(classifyArrestEvent('shock')).toBe('critical');
    expect(classifyArrestEvent('rhythm-check')).toBe('assessment');
    expect(classifyArrestEvent('drug')).toBe('treatment');
    expect(classifyArrestEvent('lucas')).toBe('treatment');
    expect(classifyArrestEvent('cpr-start')).toBe('treatment');
    expect(classifyArrestEvent('something-unknown')).toBe('critical');
  });

  it('prettifies assessment step ids, keeping clinical acronyms uppercase', () => {
    expect(prettifyStepId('scene-safety')).toBe('Scene Safety');
    expect(prettifyStepId('12-lead-ecg')).toBe('12 Lead ECG');
    expect(prettifyStepId('blood-glucose')).toBe('Blood Glucose');
    expect(prettifyStepId('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// frameAt — binary-search lookup
// ---------------------------------------------------------------------------

describe('frameAt', () => {
  const timeline = buildReplayTimeline({
    caseStartTime: T0,
    caseEndTime: T0 + 400_000,
    vitalsHistory: [
      vitals({ pulse: 120, time: iso(10) }),
      vitals({ pulse: 100, time: iso(100) }),
      vitals({ pulse: 90, time: iso(200) }),
      vitals({ pulse: 80, time: iso(300) }),
    ],
  });

  it('returns null for an empty timeline', () => {
    expect(frameAt(buildReplayTimeline(), 10)).toBeNull();
  });

  it('returns the first frame for t before the first sample', () => {
    expect(frameAt(timeline, 0)?.vitals.pulse).toBe(120);
    expect(frameAt(timeline, -5)?.vitals.pulse).toBe(120);
  });

  it('returns the frame in effect at exactly a sample time', () => {
    expect(frameAt(timeline, 100)?.vitals.pulse).toBe(100);
  });

  it('returns the most recent frame between samples', () => {
    expect(frameAt(timeline, 150)?.vitals.pulse).toBe(100);
    expect(frameAt(timeline, 250)?.vitals.pulse).toBe(90);
  });

  it('returns the last frame past the end', () => {
    expect(frameAt(timeline, 10_000)?.vitals.pulse).toBe(80);
  });

  it('agrees with a linear scan across the whole axis', () => {
    for (let t = 0; t <= timeline.tEnd; t += 7) {
      const linear = [...timeline.frames].reverse().find(f => f.t <= t) ?? timeline.frames[0];
      expect(frameAt(timeline, t)).toEqual(linear);
    }
  });
});

// ---------------------------------------------------------------------------
// nearestEventIndex
// ---------------------------------------------------------------------------

describe('nearestEventIndex', () => {
  const timeline: ReplayTimeline = buildReplayTimeline(fullInput());

  it('returns -1 for an empty timeline', () => {
    expect(nearestEventIndex(buildReplayTimeline(), 10)).toBe(-1);
  });

  it('returns the closest event to the playhead', () => {
    // events include t=0 (phase), 5 (scene), 60 (breathing), 120 (O2)...
    const idxAt4 = nearestEventIndex(timeline, 4);
    expect(timeline.events[idxAt4].t).toBe(5);
    const idxAt100 = nearestEventIndex(timeline, 100);
    expect(timeline.events[idxAt100].t).toBe(120);
    const idxAt61 = nearestEventIndex(timeline, 61);
    expect(timeline.events[idxAt61].t).toBe(60);
  });

  it('clamps to the first/last events at the extremes', () => {
    expect(nearestEventIndex(timeline, -100)).toBe(0);
    const lastIdx = nearestEventIndex(timeline, 999_999);
    expect(lastIdx).toBe(timeline.events.length - 1);
  });

  it('prefers the earlier event on exact midpoint ties', () => {
    const t = buildReplayTimeline({
      caseStartTime: T0,
      caseEndTime: T0 + 100_000,
      appliedTreatments: [
        { name: 'A', description: 'A', appliedAt: iso(10) },
        { name: 'B', description: 'B', appliedAt: iso(20) },
      ],
    });
    const aIdx = t.events.findIndex(e => e.label === 'A');
    expect(nearestEventIndex(t, 15)).toBe(aIdx);
  });
});
