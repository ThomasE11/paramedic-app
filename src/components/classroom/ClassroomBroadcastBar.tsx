/**
 * ClassroomBroadcastBar — sticky banner above the instructor's live case.
 *
 * Concentrates every classroom-specific control the instructor needs
 * while driving (or watching a student drive) the live case:
 *   - LIVE status, PIN, online student count
 *   - Driving indicator (who currently holds driving privileges)
 *   - Countdown timer (when a duration has been set)
 *   - Hand-off menu — pick a single student, a group, open-floor, or
 *     take control back
 *   - Quick broadcast actions — push staged vitals, reveal diagnosis /
 *     red flags, free-text teaching note
 *   - End case / end session
 *
 * The chat sidebar is a separate component — this bar focuses on the
 * case-control surface above the case.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Radio, Users, TrendingDown, Activity, Target,
  AlertTriangle, MessageSquare, X, LogOut, UserCog,
  Check, Clock, Stethoscope, Mic, MicOff, Volume2, VolumeX, Video, VideoOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { CaseScenario } from '@/types';
import type {
  ClassroomBroadcast,
  ClassroomParticipant,
} from '@/hooks/useClassroomSession';

interface Props {
  caseData: CaseScenario;
  participants: ClassroomParticipant[];
  pin: string;
  /** ISO timestamp the case auto-ends — null = no timer. */
  timerEndsAt: string | null;
  /** Driver set — who currently has treatment privileges. */
  driverKeys: string[];
  /** Presence key of this client. */
  selfKey: string;
  onBroadcast: (payload: ClassroomBroadcast) => Promise<void> | void;
  /** Instructor: hand driving to a single student (replaces the set). */
  onGiveControl: (toKey: string) => Promise<void> | void;
  /** Instructor: add a student to the driver group (for pair-working). */
  onAddDriver: (toKey: string) => Promise<void> | void;
  /** Instructor: open-floor mode — everyone can treat. */
  onOpenFloor: (studentKeys: string[]) => Promise<void> | void;
  /** Instructor: take control back. */
  onTakeControl: () => Promise<void> | void;
  onEndCase: () => Promise<void> | void;
  onEndSession: () => Promise<void> | void;
  /** Voice-chat state piped in from useClassroomVoice. */
  voice?: {
    isBroadcasting: boolean;
    activeSpeakers: string[];
    listenerMuted: boolean;
    hasIncomingAudio: boolean;
    error: string | null;
    startBroadcast: () => Promise<void> | void;
    stopBroadcast: () => void;
    toggleListenerMute: () => void;
    isCameraOn: boolean;
    startCamera: () => Promise<void> | void;
    stopCamera: () => void;
  };
}

function formatCountdown(endsAt: string | null): { text: string; urgent: boolean; expired: boolean } {
  if (!endsAt) return { text: '', urgent: false, expired: false };
  const remaining = new Date(endsAt).getTime() - Date.now();
  if (remaining <= 0) return { text: 'time up', urgent: true, expired: true };
  const total = Math.floor(remaining / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return { text: `${mm}:${ss}`, urgent: total <= 120, expired: false };
}

function vitalsToSummary(v: NonNullable<CaseScenario['vitalSignsProgression']['initial']>): string {
  const parts: string[] = [];
  if (v.bp) parts.push(`BP ${v.bp}`);
  if (v.pulse !== undefined) parts.push(`HR ${v.pulse}`);
  if (v.respiration !== undefined) parts.push(`RR ${v.respiration}`);
  if (v.spo2 !== undefined) parts.push(`SpO2 ${v.spo2}%`);
  if (v.gcs !== undefined) parts.push(`GCS ${v.gcs}`);
  if (v.temperature !== undefined) parts.push(`Temp ${v.temperature}°C`);
  return parts.join(' · ');
}

export function ClassroomBroadcastBar({
  caseData, participants, pin, timerEndsAt,
  driverKeys, selfKey,
  onBroadcast,
  onGiveControl, onAddDriver, onOpenFloor, onTakeControl,
  onEndCase, onEndSession,
  voice,
}: Props) {
  const speakerNames = (voice?.activeSpeakers ?? [])
    .map(k => participants.find(p => p.key === k)?.displayName)
    .filter((n): n is string => Boolean(n));
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [revealedDx, setRevealedDx] = useState(false);
  const [revealedFlags, setRevealedFlags] = useState(false);
  // Record the most recent instructor broadcast so the panel can show
  // a "Latest broadcast" receipt — design-system pattern for giving
  // the instructor a quick visual confirmation of what they just sent.
  const [lastSent, setLastSent] = useState<{ text: string; at: Date } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const students = participants.filter(p => p.role === 'student');
  const driverNames = driverKeys
    .map(k => participants.find(p => p.key === k)?.displayName)
    .filter((n): n is string => Boolean(n));
  const selfIsDriver = driverKeys.includes(selfKey);
  const someoneElseDriving = driverKeys.length > 0 && !selfIsDriver;
  const openFloor = driverKeys.length > 1 && students.every(s => driverKeys.includes(s.key));

  // Tick once a second when a timer is running so the countdown refreshes.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!timerEndsAt) return;
    const id = window.setInterval(() => setTick(n => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerEndsAt]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const recordSent = (text: string) => setLastSent({ text, at: new Date() });

  const pushVitals = async (stage: 'afterIntervention' | 'enRoute' | 'deterioration') => {
    const v = caseData.vitalSignsProgression?.[stage];
    if (!v) return;
    const labels = {
      afterIntervention: 'After intervention',
      enRoute: 'En route',
      deterioration: '⚠ Deterioration',
    } as const;
    const text = `📊 ${labels[stage]} vitals — ${vitalsToSummary(v)}`;
    await onBroadcast({ kind: 'instructor_message', text });
    recordSent(text);
    toast.success(`${labels[stage]} vitals sent to students`);
  };

  const revealDx = async () => {
    const dx = caseData.expectedFindings?.mostLikelyDiagnosis;
    if (!dx) return;
    const text = `🎯 Working diagnosis: ${dx}`;
    await onBroadcast({ kind: 'instructor_message', text });
    recordSent(text);
    setRevealedDx(true);
    toast.success('Diagnosis revealed to students');
  };

  const revealFlags = async () => {
    const flags = caseData.expectedFindings?.redFlags ?? [];
    if (flags.length === 0) return;
    const text = `🚩 Red flags to recognise:\n${flags.map(f => `• ${f}`).join('\n')}`;
    await onBroadcast({ kind: 'instructor_message', text });
    recordSent(text);
    setRevealedFlags(true);
    toast.success('Red flags shared with students');
  };

  const sendMessage = async () => {
    const text = message.trim();
    if (!text) return;
    await onBroadcast({ kind: 'instructor_message', text });
    recordSent(text);
    toast.success('Message sent to students');
    setMessage('');
    inputRef.current?.focus();
  };

  // Format the last-sent timestamp as HH:MM:SS — matches the design
  // bundle's mono clock style for broadcast receipts.
  const formatBroadcastTime = (d: Date) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const countdown = formatCountdown(timerEndsAt);

  return (
    <Card className="mb-4 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent">
      <CardContent className="py-3 px-4">
        {/* --- Collapsed bar --- */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center justify-center">
              <Radio className="w-4 h-4 text-emerald-500" />
              <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Classroom live
            </span>
          </div>

          <Badge variant="outline" className="gap-1 text-xs font-mono">PIN {pin}</Badge>
          {/* Student roster — show actual names inline instead of a bare
              count. Instructors need to see *who* has joined (and who's
              driving) without opening the Hand-off dropdown. Long rosters
              truncate to N names + "+X more" to keep the bar compact. */}
          {students.length === 0 ? (
            <Badge variant="secondary" className="gap-1">
              <Users className="w-3 h-3" />
              <span className="text-xs font-medium text-muted-foreground">Waiting for students…</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 items-center" title={students.map(s => s.displayName).join(', ')}>
              <Users className="w-3 h-3" />
              <span className="text-xs font-medium">{students.length}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs font-medium flex items-center gap-1 flex-wrap">
                {students.slice(0, 3).map((s, i) => {
                  const isDriver = driverKeys.includes(s.key);
                  return (
                    <span key={s.key} className={isDriver ? 'font-semibold text-emerald-700 dark:text-emerald-300' : ''}>
                      {s.displayName}{isDriver ? ' 🩺' : ''}{i < Math.min(students.length, 3) - 1 ? ',' : ''}
                    </span>
                  );
                })}
                {students.length > 3 && (
                  <span className="text-muted-foreground">+{students.length - 3} more</span>
                )}
              </span>
            </Badge>
          )}

          {/* Driver status */}
          {driverKeys.length > 0 && (
            <Badge variant={selfIsDriver ? 'default' : 'secondary'} className="gap-1">
              <Stethoscope className="w-3 h-3" />
              <span className="text-xs font-medium">
                {selfIsDriver && driverKeys.length === 1 && 'You are driving'}
                {selfIsDriver && driverKeys.length > 1 && openFloor && 'Open floor — everyone can treat'}
                {selfIsDriver && driverKeys.length > 1 && !openFloor && `Co-driving with ${driverNames.length - 1} other${driverNames.length - 1 !== 1 ? 's' : ''}`}
                {!selfIsDriver && driverKeys.length === 1 && `${driverNames[0]} is driving`}
                {!selfIsDriver && driverKeys.length > 1 && `Driving: ${driverNames.join(' + ')}`}
              </span>
            </Badge>
          )}

          {/* Countdown — running-state chip. Adds a pulsing dot when less
              than 2 minutes remain so the instructor's peripheral vision
              can see "time is nearly up" without reading the digits. */}
          {timerEndsAt && (
            <Badge
              variant={countdown.urgent ? 'destructive' : 'outline'}
              className={`gap-1.5 text-xs font-mono tabular-nums ${countdown.expired ? 'opacity-70' : ''}`}
            >
              {countdown.urgent && !countdown.expired ? (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {countdown.text}
            </Badge>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Voice controls */}
            {voice && (
              <>
                <Button
                  size="sm"
                  variant={voice.isBroadcasting ? 'default' : 'outline'}
                  onClick={() => {
                    if (voice.isBroadcasting) voice.stopBroadcast();
                    else void voice.startBroadcast();
                  }}
                  className={`h-7 gap-1.5 text-xs ${voice.isBroadcasting ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                  aria-pressed={voice.isBroadcasting}
                  aria-label={voice.isBroadcasting ? 'Stop speaking' : 'Start speaking'}
                  title={
                    voice.error === 'mic-denied'
                      ? 'Microphone permission denied — enable in browser settings'
                      : voice.error === 'no-mic'
                        ? 'No microphone detected'
                        : voice.isBroadcasting
                          ? 'Click to mute your microphone'
                          : 'Click to talk to the class'
                  }
                >
                  {voice.isBroadcasting ? (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                      Speaking
                    </>
                  ) : (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      Talk
                    </>
                  )}
                </Button>
                {voice.hasIncomingAudio && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={voice.toggleListenerMute}
                    className="h-7 gap-1.5 text-xs"
                    aria-pressed={voice.listenerMuted}
                    aria-label={voice.listenerMuted ? 'Unmute incoming audio' : 'Mute incoming audio'}
                    title={speakerNames.length > 0 ? `Hearing: ${speakerNames.join(', ')}` : 'Incoming audio'}
                  >
                    {voice.listenerMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </Button>
                )}
                {/* Camera toggle — adds a local video track to the peer
                    mesh so other participants get a small video tile. */}
                <Button
                  size="sm"
                  variant={voice.isCameraOn ? 'default' : 'outline'}
                  onClick={() => {
                    if (voice.isCameraOn) voice.stopCamera();
                    else void voice.startCamera();
                  }}
                  className={`h-7 gap-1.5 text-xs ${voice.isCameraOn ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
                  aria-pressed={voice.isCameraOn}
                  aria-label={voice.isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                  title={voice.isCameraOn ? 'Camera on — click to turn off' : 'Click to turn on your camera'}
                >
                  {voice.isCameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  {voice.isCameraOn ? 'Camera' : 'Video'}
                </Button>
              </>
            )}

            {/* Hand off / control menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                  <UserCog className="w-3.5 h-3.5" />
                  Hand off
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Give control</DropdownMenuLabel>
                {students.length === 0 && (
                  <DropdownMenuItem disabled className="text-xs italic text-muted-foreground">
                    No students connected yet
                  </DropdownMenuItem>
                )}
                {students.map(s => {
                  const isDriver = driverKeys.includes(s.key);
                  return (
                    <DropdownMenuItem
                      key={s.key}
                      onSelect={() => void onGiveControl(s.key)}
                      className="text-xs"
                    >
                      <Stethoscope className="w-3 h-3 mr-2" />
                      {s.displayName}
                      {isDriver && <Check className="w-3 h-3 ml-auto text-emerald-500" />}
                    </DropdownMenuItem>
                  );
                })}

                {students.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Pair / group
                    </DropdownMenuLabel>
                    {students.map(s => {
                      const alreadyIn = driverKeys.includes(s.key);
                      return (
                        <DropdownMenuItem
                          key={`add-${s.key}`}
                          disabled={alreadyIn}
                          onSelect={() => void onAddDriver(s.key)}
                          className="text-xs"
                        >
                          {alreadyIn ? <Check className="w-3 h-3 mr-2 text-emerald-500" /> : <span className="w-3 h-3 mr-2" />}
                          Add {s.displayName} to drivers
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuItem
                      onSelect={() => void onOpenFloor(students.map(s => s.key))}
                      className="text-xs"
                    >
                      <Users className="w-3 h-3 mr-2" />
                      Open floor — everyone can treat
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => void onTakeControl()}
                  className="text-xs font-medium"
                >
                  <UserCog className="w-3 h-3 mr-2" />
                  Take control back
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="ghost" onClick={() => setExpanded(v => !v)} className="h-7 gap-1.5 text-xs" aria-expanded={expanded}>
              <MessageSquare className="w-3.5 h-3.5" />
              {expanded ? 'Hide' : 'Broadcast'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => void onEndCase()} className="h-7 text-xs">
              End case
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void onEndSession()}
              className="h-7 text-xs text-destructive hover:text-destructive"
              aria-label="End classroom session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* --- Expanded broadcast panel --- */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Latest broadcast receipt — gives the instructor a quick
                visual confirmation of what they just pushed, and when.
                Matches the design system's broadcast-panel pattern. */}
            {lastSent && (
              <div className="rounded-lg bg-muted/60 border border-border/60 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Latest broadcast
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                    {formatBroadcastTime(lastSent.at)}
                  </span>
                </div>
                <p className="text-xs mt-0.5 leading-snug whitespace-pre-wrap line-clamp-2">
                  {lastSent.text}
                </p>
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => void pushVitals('afterIntervention')} disabled={!caseData.vitalSignsProgression?.afterIntervention} className="h-7 gap-1.5 text-xs">
                <Activity className="w-3 h-3" /> Push post-int vitals
              </Button>
              <Button size="sm" variant="outline" onClick={() => void pushVitals('enRoute')} disabled={!caseData.vitalSignsProgression?.enRoute} className="h-7 gap-1.5 text-xs">
                <Activity className="w-3 h-3" /> Push en-route
              </Button>
              <Button size="sm" variant="outline" onClick={() => void pushVitals('deterioration')} disabled={!caseData.vitalSignsProgression?.deterioration} className="h-7 gap-1.5 text-xs text-amber-600 border-amber-300">
                <TrendingDown className="w-3 h-3" /> Deterioration
              </Button>
              <Button size="sm" variant="outline" onClick={() => void revealDx()} disabled={!caseData.expectedFindings?.mostLikelyDiagnosis || revealedDx} className="h-7 gap-1.5 text-xs">
                <Target className="w-3 h-3" /> {revealedDx ? 'Dx revealed' : 'Reveal diagnosis'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => void revealFlags()} disabled={(caseData.expectedFindings?.redFlags?.length ?? 0) === 0 || revealedFlags} className="h-7 gap-1.5 text-xs">
                <AlertTriangle className="w-3 h-3" /> {revealedFlags ? 'Flags sent' : 'Send red flags'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Teaching note to push to every student (Enter to send)"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
                }}
                className="h-8 text-xs"
              />
              <Button size="sm" onClick={() => void sendMessage()} disabled={!message.trim()} className="h-8 text-xs gap-1.5 shrink-0">
                <MessageSquare className="w-3 h-3" /> Send
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setExpanded(false)} className="h-8 w-8 p-0 shrink-0" aria-label="Close">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {someoneElseDriving && (
          <div className="mt-2 text-[11px] text-muted-foreground italic">
            💡 You handed control to {driverNames.join(' + ')}. Their actions broadcast to everyone.
            Use the Hand-off menu to reclaim control when you're ready.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ClassroomBroadcastBar;
