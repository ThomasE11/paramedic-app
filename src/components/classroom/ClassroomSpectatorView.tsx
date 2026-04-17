/**
 * ClassroomSpectatorView — what a student sees while an instructor (or
 * a delegated student driver) is running a classroom case.
 *
 * Live mirror of the shared case state:
 *   - Case header with dispatch, patient, priority, ticking timer
 *   - LIFEPAK-style vitals strip that updates as the driver changes vitals
 *   - Running action feed (treatments applied, assessment steps performed,
 *     instructor messages) in timestamp order — spectators watch the
 *     case unfold like a narrated replay
 *   - Presence panel on the right with online dots + driver badge
 *   - Read-only: no interactive controls. When the instructor grants this
 *     student driver privileges, the parent route swaps this view out for
 *     a full StudentPanel.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Heart, Thermometer, Gauge, Eye, Droplet, Brain,
  Users, Radio, ClipboardCheck, Stethoscope, MessageSquare,
  ArrowLeft, LogOut,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CaseScenario } from '@/types';
import type {
  ClassroomBroadcast,
  ClassroomParticipant,
  SharedCaseState,
} from '@/hooks/useClassroomSession';

interface Props {
  caseData: CaseScenario;
  sharedState: SharedCaseState;
  participants: ClassroomParticipant[];
  currentDriverKey: string | null;
  selfKey: string;
  /** Stream of broadcasts — used to surface instructor messages inline. */
  lastBroadcast: ClassroomBroadcast | null;
  onLeave: () => void;
}

// --- helpers --------------------------------------------------------------

function formatElapsed(since?: string): string {
  if (!since) return '00:00';
  const s = Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function timeShort(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

// ---- live action feed ----------------------------------------------------

interface FeedEntry {
  id: string;
  kind: 'treatment' | 'assessment' | 'message' | 'case' | 'vitals';
  label: string;
  detail?: string;
  timestamp: string;
}

/**
 * Compose a chronological action feed from the shared case state + the
 * most recent instructor_message broadcasts. The feed is capped at the
 * last 200 entries so even a long case doesn't runaway the DOM.
 */
function useActionFeed(
  sharedState: SharedCaseState,
  lastBroadcast: ClassroomBroadcast | null,
): FeedEntry[] {
  const [messages, setMessages] = useState<FeedEntry[]>([]);

  // Append instructor_message broadcasts as they land.
  useEffect(() => {
    if (!lastBroadcast) return;
    if (lastBroadcast.kind !== 'instructor_message') return;
    setMessages(prev => [
      ...prev.slice(-200),
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind: 'message',
        label: lastBroadcast.text,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [lastBroadcast]);

  return useMemo(() => {
    const entries: FeedEntry[] = [];

    if (sharedState.caseStartedAt) {
      entries.push({
        id: 'case-started',
        kind: 'case',
        label: 'Case started',
        timestamp: sharedState.caseStartedAt,
      });
    }

    (sharedState.appliedTreatments ?? []).forEach(t => {
      entries.push({
        id: `t-${t.id}-${t.appliedAt}`,
        kind: 'treatment',
        label: t.name,
        detail: t.detail,
        timestamp: t.appliedAt,
      });
    });

    // We don't have per-step timestamps for assessments here; they show as
    // a single rolling summary so the feed stays timestamp-sortable.
    const perf = sharedState.assessmentPerformed ?? [];
    if (perf.length > 0) {
      entries.push({
        id: `assess-${perf.length}`,
        kind: 'assessment',
        label: `${perf.length} assessment step${perf.length === 1 ? '' : 's'} performed`,
        detail: perf.slice(-3).join(' · '),
        timestamp: new Date().toISOString(),
      });
    }

    entries.push(...messages);
    return entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-50);
  }, [sharedState, messages]);
}

// ---- vitals tile ---------------------------------------------------------

function VitalTile({
  label, value, unit, icon: Icon, revealed,
}: {
  label: string;
  value: string | number | undefined;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  revealed: boolean;
}) {
  const display = revealed && value !== undefined && value !== null && value !== ''
    ? value
    : '---';
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <Icon className="w-4 h-4 text-primary/70 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-mono text-base font-semibold tabular-nums">
          {display}
          {revealed && unit && value !== undefined && (
            <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- main view -----------------------------------------------------------

export function ClassroomSpectatorView({
  caseData, sharedState, participants, currentDriverKey, selfKey, lastBroadcast, onLeave,
}: Props) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick(n => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const feed = useActionFeed(sharedState, lastBroadcast);
  const elapsed = formatElapsed(sharedState.caseStartedAt);
  const vitals = sharedState.vitals ?? {};
  const revealedSet = new Set(sharedState.monitorRevealedVitals ?? []);

  // Everyone sees the initial vitals as "revealed" so the monitor isn't
  // stuck on "---" for signals the instructor hasn't explicitly revealed.
  // (The assess-to-reveal UX is instructor-side only; spectators watch.)
  const isRevealed = (key: string) => true || revealedSet.has(key);
  void revealedSet;

  const driverName = useMemo(() => {
    if (!currentDriverKey) return null;
    const p = participants.find(pp => pp.key === currentDriverKey);
    return p?.displayName ?? null;
  }, [currentDriverKey, participants]);

  const selfIsDriver = currentDriverKey === selfKey;
  const students = participants.filter(p => p.role === 'student');
  const instructor = participants.find(p => p.role === 'instructor');

  // ---- render ----
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border sticky top-0 z-20 bg-background/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onLeave} className="gap-2">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            Leave
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <Radio className="w-4 h-4 text-emerald-500" />
                <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Classroom · live
              </span>
            </div>
            {driverName && (
              <Badge variant={selfIsDriver ? 'default' : 'secondary'} className="gap-1">
                <Stethoscope className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {selfIsDriver ? 'You are driving' : `${driverName} is driving`}
                </span>
              </Badge>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-mono tabular-nums">
              {elapsed}
            </div>
            <Button variant="outline" size="sm" onClick={onLeave} className="gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              End
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-4">
          {/* Case header */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="py-4 px-5">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] uppercase">{caseData.category}</Badge>
                {caseData.priority && (
                  <Badge variant={caseData.priority === 'critical' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                    {caseData.priority}
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-bold leading-tight">{caseData.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {caseData.patientInfo ? `${caseData.patientInfo.age}y · ${caseData.patientInfo.gender}` : ''}
                {caseData.dispatchInfo?.callReason && ` · ${caseData.dispatchInfo.callReason}`}
              </p>
              {caseData.dispatchInfo?.location && (
                <p className="text-xs text-muted-foreground mt-0.5">{caseData.dispatchInfo.location}</p>
              )}
            </CardContent>
          </Card>

          {/* Live vitals strip */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Live vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <VitalTile label="BP" value={vitals.bp} icon={Gauge} revealed={isRevealed('bp')} />
                <VitalTile label="HR" value={vitals.pulse} unit="bpm" icon={Heart} revealed={isRevealed('pulse')} />
                <VitalTile label="RR" value={vitals.respiration} unit="/min" icon={Activity} revealed={isRevealed('respiration')} />
                <VitalTile label="SpO2" value={vitals.spo2} unit="%" icon={Droplet} revealed={isRevealed('spo2')} />
                <VitalTile label="Temp" value={vitals.temperature} unit="°C" icon={Thermometer} revealed={isRevealed('temperature')} />
                <VitalTile label="GCS" value={vitals.gcs} icon={Brain} revealed={isRevealed('gcs')} />
                <VitalTile label="BGL" value={vitals.bloodGlucose} unit="mmol" icon={Eye} revealed={isRevealed('bloodGlucose')} />
              </div>
            </CardContent>
          </Card>

          {/* Action feed */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary/80" />
                Live action feed
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">{feed.length} event{feed.length === 1 ? '' : 's'}</Badge>
            </CardHeader>
            <CardContent>
              {feed.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  Waiting for the driver's first action…
                </p>
              ) : (
                <ul className="space-y-1.5 max-h-[420px] overflow-y-auto">
                  {feed.slice().reverse().map(entry => (
                    <li
                      key={entry.id}
                      className={`flex items-start gap-2.5 rounded-lg px-3 py-2 border-l-4 ${
                        entry.kind === 'treatment' ? 'bg-emerald-500/5 border-l-emerald-500' :
                        entry.kind === 'assessment' ? 'bg-blue-500/5 border-l-blue-500' :
                        entry.kind === 'message' ? 'bg-amber-500/5 border-l-amber-500' :
                        'bg-muted border-l-primary'
                      }`}
                    >
                      <div className="text-[10px] font-mono tabular-nums text-muted-foreground shrink-0 pt-0.5">
                        {timeShort(entry.timestamp)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium">
                          {entry.kind === 'treatment' && '💉 '}
                          {entry.kind === 'assessment' && '🔎 '}
                          {entry.kind === 'message' && '🎙 '}
                          {entry.kind === 'case' && '▶ '}
                          {entry.label}
                        </div>
                        {entry.detail && (
                          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{entry.detail}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Presence sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Online
              </CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {participants.length}
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {instructor && (
                  <li className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse" />
                      </span>
                      <span className="font-medium text-xs truncate">{instructor.displayName}</span>
                    </span>
                    <Badge variant="outline" className="text-[9px] uppercase">Instructor</Badge>
                  </li>
                )}
                {students.map(p => {
                  const isYou = p.key === selfKey;
                  const isDrv = p.key === currentDriverKey;
                  return (
                    <li key={p.key} className="flex items-center justify-between py-1">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="absolute inset-0 rounded-full bg-emerald-500" />
                        </span>
                        <span className={`text-xs truncate ${isYou ? 'font-bold' : 'font-medium'}`}>
                          {p.displayName}{isYou && ' (you)'}
                        </span>
                      </span>
                      {isDrv && (
                        <Badge className="text-[9px] uppercase bg-primary text-primary-foreground">Driving</Badge>
                      )}
                    </li>
                  );
                })}
                {students.length === 0 && !instructor && (
                  <li className="text-xs text-muted-foreground italic py-2">No one online yet…</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Last instructor message */}
          {lastBroadcast?.kind === 'instructor_message' && (
            <Card className="border-amber-500/40 bg-amber-500/5 animate-in fade-in slide-in-from-right-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                  From the instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{lastBroadcast.text}</p>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ClassroomSpectatorView;
