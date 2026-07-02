/**
 * DebriefReplay — event-synced replay of a finished case
 * (PATIENT_SIM_RESEARCH.md §2, interaction pattern C — iSimulate-style).
 *
 * Collapsed-by-default card for the post-case summary. Scrub through the case
 * timeline, watch the vitals evolve, and jump straight to event markers
 * (assessments, treatments, complications, arrest milestones).
 *
 * All data normalization lives in src/lib/replayTimeline.ts (pure + tested);
 * this component only renders and drives the playhead.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, History, Pause, Play } from 'lucide-react';
import {
  buildReplayTimeline,
  frameAt,
  nearestEventIndex,
  type ReplayEventKind,
  type ReplayTimelineInput,
} from '@/lib/replayTimeline';

// ---------------------------------------------------------------------------
// Styling maps — kind → colour (treatment emerald, assessment sky, critical rose)
// ---------------------------------------------------------------------------

const KIND_STYLES: Record<ReplayEventKind, { marker: string; dot: string; text: string; row: string }> = {
  treatment: {
    marker: 'bg-emerald-500 hover:bg-emerald-400',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    row: 'bg-emerald-500/10 border-emerald-500/40',
  },
  assessment: {
    marker: 'bg-sky-500 hover:bg-sky-400',
    dot: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-400',
    row: 'bg-sky-500/10 border-sky-500/40',
  },
  critical: {
    marker: 'bg-rose-500 hover:bg-rose-400',
    dot: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    row: 'bg-rose-500/10 border-rose-500/40',
  },
  complication: {
    marker: 'bg-amber-500 hover:bg-amber-400',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    row: 'bg-amber-500/10 border-amber-500/40',
  },
  phase: {
    marker: 'bg-slate-400 hover:bg-slate-300',
    dot: 'bg-slate-400',
    text: 'text-muted-foreground',
    row: 'bg-muted/40 border-border/50',
  },
};

const formatClock = (seconds: number): string => {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

// ---------------------------------------------------------------------------
// Trend graph — hand-rolled SVG polyline (HR + SpO2) with a playhead line
// ---------------------------------------------------------------------------

const GRAPH_W = 100;
const GRAPH_H = 40;

interface Series {
  points: string;
  min: number;
  max: number;
}

function buildSeries(
  frames: { t: number; value: number | null }[],
  tEnd: number,
): Series | null {
  const usable = frames.filter(
    (f): f is { t: number; value: number } => f.value != null && Number.isFinite(f.value),
  );
  if (usable.length === 0 || tEnd <= 0) return null;
  let min = Math.min(...usable.map(f => f.value));
  let max = Math.max(...usable.map(f => f.value));
  if (max - min < 4) {
    // Flat line — pad the domain so it doesn't hug an edge.
    min -= 2;
    max += 2;
  }
  const pad = (max - min) * 0.12;
  min -= pad;
  max += pad;
  const points = usable
    .map(f => {
      const x = (f.t / tEnd) * GRAPH_W;
      const y = GRAPH_H - ((f.value - min) / (max - min)) * GRAPH_H;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  return { points, min, max };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface DebriefReplayProps extends ReplayTimelineInput {
  /** Optional extra classes on the outer card. */
  className?: string;
}

export function DebriefReplay({ className, ...input }: DebriefReplayProps) {
  const timeline = useMemo(
    () =>
      buildReplayTimeline({
        caseStartTime: input.caseStartTime,
        caseEndTime: input.caseEndTime,
        vitalsHistory: input.vitalsHistory,
        appliedTreatments: input.appliedTreatments,
        performedAssessments: input.performedAssessments,
        arrestEvents: input.arrestEvents,
        adverseEvents: input.adverseEvents,
      }),
    // Post-case these arrays are settled; identity-compare is fine.
    [
      input.caseStartTime,
      input.caseEndTime,
      input.vitalsHistory,
      input.appliedTreatments,
      input.performedAssessments,
      input.arrestEvents,
      input.adverseEvents,
    ],
  );

  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 4>(1);
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const speedRef = useRef<number>(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const seek = useCallback((next: number) => {
    tRef.current = next;
    setT(next);
  }, []);

  // Single interval drives playback at ~10fps; advances a ref then mirrors to state.
  useEffect(() => {
    if (!playing || timeline.tEnd <= 0) return;
    const id = window.setInterval(() => {
      const next = Math.min(timeline.tEnd, tRef.current + 0.1 * speedRef.current);
      tRef.current = next;
      setT(next);
      if (next >= timeline.tEnd) setPlaying(false);
    }, 100);
    return () => window.clearInterval(id);
  }, [playing, timeline.tEnd]);

  // Stop playback when collapsed.
  useEffect(() => {
    if (!open) setPlaying(false);
  }, [open]);

  const togglePlay = useCallback(() => {
    if (!playing && tRef.current >= timeline.tEnd) seek(0); // replay from the top
    setPlaying(p => !p);
  }, [playing, timeline.tEnd, seek]);

  const frame = useMemo(() => frameAt(timeline, t), [timeline, t]);
  const activeEventIdx = useMemo(() => nearestEventIndex(timeline, t), [timeline, t]);

  // Trend series (whole case) — memoized once per timeline.
  const hrSeries = useMemo(
    () =>
      buildSeries(
        timeline.frames.map(f => ({ t: f.t, value: f.vitals.pulse ?? null })),
        timeline.tEnd,
      ),
    [timeline],
  );
  const spo2Series = useMemo(
    () =>
      buildSeries(
        timeline.frames.map(f => ({ t: f.t, value: f.vitals.spo2 ?? null })),
        timeline.tEnd,
      ),
    [timeline],
  );

  // Keep the active event visible inside the (scrollable) log.
  const listRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const box = listRef.current;
    const row = activeEventIdx >= 0 ? rowRefs.current[activeEventIdx] : null;
    if (!box || !row) return;
    const top = row.offsetTop;
    if (top < box.scrollTop || top + row.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = top - box.clientHeight / 2 + row.offsetHeight / 2;
    }
  }, [activeEventIdx]);

  // Nothing recorded — nothing to replay.
  if (timeline.frames.length === 0 && timeline.events.length === 0) return null;

  const playheadX = timeline.tEnd > 0 ? (t / timeline.tEnd) * GRAPH_W : 0;

  const vitalsCells: { label: string; value: string }[] = [
    { label: 'HR', value: frame ? String(frame.vitals.pulse) : '—' },
    { label: 'BP', value: frame ? frame.vitals.bp : '—' },
    { label: 'SpO2', value: frame?.vitals.spo2 != null ? `${frame.vitals.spo2}%` : '—' },
    { label: 'RR', value: frame ? String(frame.vitals.respiration) : '—' },
    { label: 'GCS', value: frame?.vitals.gcs != null ? String(frame.vitals.gcs) : '—' },
  ];

  return (
    <Card className={`bg-card border border-border rounded-2xl overflow-hidden ${className ?? ''}`}>
      {/* Header — collapsed by default */}
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <CardHeader className={`pb-3 ${open ? 'border-b border-border/30' : ''}`}>
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15">
              <History className="h-3.5 w-3.5 text-violet-500" />
            </div>
            Case Replay
            <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider">
              {formatClock(timeline.tEnd)} · {timeline.events.length} events
            </span>
            {open ? (
              <ChevronUp className="h-4 w-4 ml-auto text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
      </button>

      {open && (
        <CardContent className="pt-4 space-y-4">
          {/* Vitals readout at the playhead */}
          <div className="grid grid-cols-5 gap-2">
            {vitalsCells.map(cell => (
              <div
                key={cell.label}
                className="rounded-xl bg-muted/40 border border-border/40 px-2 py-2 text-center"
              >
                <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  {cell.label}
                </p>
                <p className="font-mono font-bold text-sm sm:text-base tabular-nums truncate">
                  {cell.value}
                </p>
              </div>
            ))}
          </div>

          {/* Trend graph — HR + SpO2 over the whole case, monitor-style backing */}
          {(hrSeries || spo2Series) && (
            <div className="rounded-xl bg-slate-950 border border-border/50 p-3">
              <svg
                viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
                preserveAspectRatio="none"
                className="w-full h-24"
                role="img"
                aria-label="Heart rate and SpO2 trend across the case"
              >
                {/* faint midline */}
                <line
                  x1="0"
                  y1={GRAPH_H / 2}
                  x2={GRAPH_W}
                  y2={GRAPH_H / 2}
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="1.5 1.5"
                  vectorEffect="non-scaling-stroke"
                />
                {hrSeries && (
                  <polyline
                    points={hrSeries.points}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                {spo2Series && (
                  <polyline
                    points={spo2Series.points}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                {/* playhead */}
                <line
                  x1={playheadX}
                  y1="0"
                  x2={playheadX}
                  y2={GRAPH_H}
                  stroke="#f8fafc"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="mt-2 flex items-center gap-4 text-[10px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-1.5 w-3 rounded-full bg-emerald-500 inline-block" /> HR
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="h-1.5 w-3 rounded-full bg-sky-400 inline-block" /> SpO2
                </span>
                <span className="ml-auto font-mono text-slate-300 tabular-nums normal-case">
                  {formatClock(t)} / {formatClock(timeline.tEnd)}
                </span>
              </div>
            </div>
          )}

          {/* Transport controls + scrubber */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              aria-label={playing ? 'Pause replay' : 'Play replay'}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => setSpeed(s => (s === 1 ? 4 : 1))}
              className="h-9 shrink-0 rounded-xl border border-border bg-muted/40 px-2.5 font-mono text-xs font-semibold hover:bg-muted transition-colors"
              aria-label={`Playback speed ${speed}x — click to toggle`}
            >
              {speed}x
            </button>

            <div className="flex-1 min-w-0">
              <input
                type="range"
                min={0}
                max={timeline.tEnd}
                step={0.1}
                value={t}
                onChange={e => {
                  setPlaying(false);
                  seek(Number(e.target.value));
                }}
                className="w-full accent-primary cursor-pointer"
                aria-label="Scrub through the case timeline"
              />
              {/* Event marker ticks — clickable, colour-coded by kind */}
              <div className="relative h-3 mx-[7px]" aria-hidden="false">
                {timeline.events.map((ev, i) => (
                  <button
                    key={i}
                    type="button"
                    title={`${formatClock(ev.t)} — ${ev.label}`}
                    aria-label={`Jump to ${ev.label} at ${formatClock(ev.t)}`}
                    onClick={() => {
                      setPlaying(false);
                      seek(ev.t);
                    }}
                    className={`absolute top-0 h-3 w-[3px] -translate-x-1/2 rounded-full transition-colors ${KIND_STYLES[ev.kind].marker}`}
                    style={{ left: `${timeline.tEnd > 0 ? (ev.t / timeline.tEnd) * 100 : 0}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Event log — highlights + follows the event nearest the playhead */}
          {timeline.events.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Event Log
              </h4>
              <div
                ref={listRef}
                className="relative max-h-52 overflow-y-auto rounded-xl border border-border/40 bg-muted/20 p-1.5 space-y-1"
              >
                {timeline.events.map((ev, i) => {
                  const style = KIND_STYLES[ev.kind];
                  const active = i === activeEventIdx;
                  return (
                    <button
                      key={i}
                      type="button"
                      ref={el => {
                        rowRefs.current[i] = el;
                      }}
                      onClick={() => {
                        setPlaying(false);
                        seek(ev.t);
                      }}
                      className={`w-full flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
                        active ? style.row : 'border-transparent hover:bg-muted/40'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground w-9 shrink-0 tabular-nums pt-px">
                        {formatClock(ev.t)}
                      </span>
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                      <span className="min-w-0">
                        <span className={`font-medium ${active ? style.text : ''}`}>{ev.label}</span>
                        {ev.detail && (
                          <span className="block text-muted-foreground mt-0.5 leading-snug">
                            {ev.detail}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default DebriefReplay;
