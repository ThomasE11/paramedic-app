/**
 * ClassroomJoin — student-side classroom UI (Phase 4)
 *
 * Flow:
 *   1. Student types the 6-digit PIN their instructor showed on screen,
 *      plus their display name, and hits "Join".
 *   2. Hook looks up the session row and subscribes to the realtime
 *      channel. Status flips to `lobby` and the student sees a "waiting
 *      for the instructor to start" message.
 *   3. When the instructor broadcasts `case_started`, `lastBroadcast`
 *      updates and the student sees the case details inline. This is a
 *      deliberately minimal read-only view — for the MVP, students see
 *      what the case is about but run their own assessment alongside.
 *   4. `session_ended` or a manual "Leave" returns the student to the
 *      role selection screen.
 *
 * Why inline case rendering vs. routing into StudentPanel? For the MVP,
 * keeping the classroom flow self-contained avoids deep coupling with
 * StudentPanel's complex phase machine. A future phase can swap this
 * inline view for a full StudentPanel instance preloaded with the
 * broadcast case.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  LogOut,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Users,
  Monitor,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Suspense, lazy } from 'react';
import { toast } from 'sonner';
import { useClassroomSession } from '@/hooks/useClassroomSession';
import { useClassroomVoice } from '@/hooks/useClassroomVoice';
import { AmbientBackground } from '@/components/AmbientBackground';
import { allCases } from '@/data/cases';
import type { CaseScenario } from '@/types';
import { ClassroomWatchBanner } from './ClassroomWatchBanner';
import { ClassroomChatSidebar } from './ClassroomChatSidebar';
import { ClassroomVideoTiles } from './ClassroomVideoTiles';

// Students run the SAME StudentPanel the instructor drives — just with
// `readOnly` flipped on and live state piped in from broadcasts. Lazy-load
// so non-classroom routes don't pay the bundle cost.
const StudentPanel = lazy(() => import('@/components/StudentPanel'));

const STUDENT_JOIN_FLOW: { label: string; detail: string; icon: LucideIcon }[] = [
  { label: 'Class code', detail: 'six-digit PIN', icon: Radio },
  { label: 'Identity', detail: 'display name', icon: UserCheck },
  { label: 'Waiting room', detail: 'connected', icon: Users },
  { label: 'Live case', detail: 'shared patient', icon: Monitor },
];

interface ClassroomJoinProps {
  onExit: () => void;
}

export function ClassroomJoin({ onExit }: ClassroomJoinProps) {
  const { t } = useTranslation();
  const sessionHook = useClassroomSession();
  const {
    supported,
    isPreviewMode,
    status,
    error,
    session,
    lastBroadcast,
    sharedState,
    joinSession,
    leaveSession,
    clearError,
    requestStateSnapshot,
    isDriver,
    avFloorOpen,
    sendBroadcast,
    liveCaseId,
  } = sessionHook;

  // Voice-chat mesh. Students can only transmit if the instructor has
  // given them driving rights; otherwise they're receive-only and hear the
  // current broadcaster via a hidden <audio> element.
  const voice = useClassroomVoice({
    selfKey: sessionHook.selfKey,
    participants: sessionHook.participants,
    lastBroadcast,
    sendBroadcast,
    // Open floor → every student may transmit mic + camera (tabletop mode),
    // otherwise only the current driver can.
    canBroadcast: isDriver || avFloorOpen,
  });

  const [pinInput, setPinInput] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [activeCase, setActiveCase] = useState<CaseScenario | null>(null);

  // Gate the case panel on the hook's durable `liveCaseId` state rather
  // than the fragile `lastBroadcast` field. `lastBroadcast` only surfaces
  // the most recent broadcast — if `case_started` and a flurry of
  // `state_patch` events arrive in the same React batch, the useEffect
  // only fires once, for the last one, and the student never transitions
  // out of the "Waiting for instructor to start a case…" screen.
  //
  // The hook now tracks `liveCaseId` inside its broadcast dispatcher, so
  // every `case_started` frame is captured regardless of what arrives
  // after it.
  useEffect(() => {
    if (!liveCaseId) {
      // Clear on case_ended / session_ended (hook has already zeroed the
      // live-case state by the time this effect runs).
      setActiveCase(null);
      return;
    }
    // Case is live — resolve it. Prefer the local bundle (full data);
    // fall back to the snapshot on the session row (supports custom
    // cases authored outside the bundle).
    const byId = allCases.find(c => c.id === liveCaseId);
    if (byId) {
      setActiveCase(byId);
    } else if (session?.case_snapshot) {
      setActiveCase(session.case_snapshot as CaseScenario);
    }
    toast.success(t('classroom.caseStartedToast'));
    // Request a full snapshot from the driver so we catch any vitals /
    // treatments the instructor has already touched between their click
    // on "Start case" and our subscription being ready.
    void requestStateSnapshot();
  }, [liveCaseId, session, t, requestStateSnapshot]);

  // Session / instructor-message side-effects still flow via the
  // one-shot broadcast channel. These are rare and idempotent, so the
  // batching risk doesn't apply the same way it does to lifecycle
  // events.
  useEffect(() => {
    if (!lastBroadcast) return;
    if (lastBroadcast.kind === 'session_ended') {
      toast.info(t('classroom.sessionEndedToast'));
      onExit();
    } else if (lastBroadcast.kind === 'instructor_message') {
      toast(lastBroadcast.text);
    } else if (lastBroadcast.kind === 'case_ended') {
      toast.info(t('classroom.caseEndedToast'));
    }
  }, [lastBroadcast, t, onExit]);

  // If the student joined after a case was already running, pick it up
  // from the session row's snapshot (instructor already broadcast to
  // everyone else). Then ask the driver for a fresh state snapshot so
  // we see all the treatments / vitals changes that happened before we
  // arrived.
  useEffect(() => {
    if (session?.status === 'running' && !activeCase) {
      if (session.case_id) {
        const byId = allCases.find(c => c.id === session.case_id);
        if (byId) {
          setActiveCase(byId);
          void requestStateSnapshot();
          return;
        }
      }
      if (session.case_snapshot) {
        setActiveCase(session.case_snapshot as CaseScenario);
        void requestStateSnapshot();
      }
    }
  }, [session, activeCase, requestStateSnapshot]);

  const pinValid = useMemo(() => /^\d{6}$/.test(pinInput.trim()), [pinInput]);
  const students = useMemo(
    () => sessionHook.participants.filter(p => p.role === 'student'),
    [sessionHook.participants],
  );
  const joinFlowStep = session
    ? 2
    : pinValid && displayName.trim()
      ? 1
      : pinValid
        ? 0
        : -1;

  // ------------------------------------------------------------
  // Graceful degradation when Supabase isn't configured
  // ------------------------------------------------------------
  if (!supported) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              {t('classroom.unsupportedTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('classroom.unsupportedBody')}
            </p>
            <Button variant="outline" onClick={onExit} className="gap-2">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('header.back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleJoin = async () => {
    const pin = pinInput.trim();
    const name = displayName.trim();
    if (!pinValid) {
      toast.error(t('classroom.pinMustBe6'));
      return;
    }
    if (!name) {
      toast.error(t('classroom.nameRequired'));
      return;
    }
    await joinSession(pin, name);
  };

  const handleLeave = async () => {
    await leaveSession();
    onExit();
  };

  // ------------------------------------------------------------
  // Case is live → student renders the SAME full-case UI the
  // instructor drives. When the student is a driver (control has
  // been granted to them), buttons are interactive; otherwise the
  // panel is read-only and the UI mirrors the current driver's
  // state via `externalState`.
  // ------------------------------------------------------------
  if (session && activeCase) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        {/* Tap-to-unlock banner — browsers (especially iOS Safari) block
            remote audio playback until the user interacts with the page.
            The hook surfaces `audioBlocked=true` when it detects the
            NotAllowedError; a tap here calls unlockAudio() from a user
            gesture which is what the browser needs. Without this, students
            silently have no audio from the instructor even though the
            mesh is connected. */}
        {voice.audioBlocked && (
          <button
            onClick={() => void voice.unlockAudio()}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 rounded-full bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold shadow-lg hover:bg-amber-400 transition-colors animate-pulse"
          >
            🔊 Tap to enable instructor audio
          </button>
        )}
        <ClassroomVideoTiles
          localStream={voice.localVideoStream}
          remoteStreams={voice.remoteVideoStreams}
          participants={sessionHook.participants}
          selfKey={sessionHook.selfKey}
          onStopCamera={voice.stopCamera}
          spectator
        />
        <ClassroomChatSidebar
          messages={sessionHook.chatMessages}
          onSend={sessionHook.sendChat}
          selfKey={sessionHook.selfKey}
          driverKeys={sessionHook.driverKeys}
        />
        <StudentPanel
          onExit={handleLeave}
          preloadedCase={activeCase}
          readOnly={!isDriver}
          externalState={{
            vitals: sharedState.vitals,
            appliedTreatments: sharedState.appliedTreatments,
            completedItems: sharedState.completedItems,
            assessmentPerformed: sharedState.assessmentPerformed,
            caseStartedAt: sharedState.caseStartedAt,
            monitorRevealedVitals: sharedState.monitorRevealedVitals,
            currentRhythm: sharedState.currentRhythm,
            isInArrest: sharedState.isInArrest,
            arrestState: sharedState.arrestState,
            ventilatorSettings: sharedState.ventilatorSettings,
            bvmVentilationRate: sharedState.bvmVentilationRate,
            arrestTimeline: sharedState.arrestTimeline,
            transportDecision: sharedState.transportDecision,
            pacerState: sharedState.pacerState,
          }}
          // If control is ever granted to this student, THEY become the
          // driver and their actions broadcast to everyone else.
          onClassroomStateChange={isDriver ? sessionHook.broadcastStatePatch : undefined}
          topBanner={
            <ClassroomWatchBanner
              pin={session.pin}
              participants={sessionHook.participants}
              driverKeys={sessionHook.driverKeys}
              selfKey={sessionHook.selfKey}
              timerEndsAt={sessionHook.timerEndsAt}
              onLeave={handleLeave}
              voice={{ ...voice, canBroadcast: isDriver || avFloorOpen }}
            />
          }
        />
      </Suspense>
    );
  }

  // ------------------------------------------------------------
  // Layout (pre-join + waiting room)
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Kimi-spec ambient orbs — extracted into <AmbientBackground/>. */}
      <AmbientBackground />
      <div className="relative z-10">
      {/* Top bar */}
      <div className="border-b border-black/5 nav-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" onClick={handleLeave} className="gap-2">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('header.back')}
          </Button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold">
              {t('classroom.studentTitle')}
            </span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                {error.startsWith('classroom.') ? t(error) : error}
              </p>
            </CardContent>
          </Card>
        )}

        {isPreviewMode && (
          <Card className="glass rounded-2xl border border-amber-400/30 bg-amber-500/8">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/12 text-amber-600 dark:text-amber-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Local classroom preview</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Enter any six-digit PIN to preview the learner waiting room. Real multi-device sync needs Supabase configured.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit border-amber-500/35 bg-background/50 text-amber-700 dark:text-amber-300">
                Preview mode
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* ----------- Join form ----------- */}
        {!session && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.86fr] items-stretch">
            <section className="glass-strong rounded-2xl border border-white/55 dark:border-white/10 p-6 sm:p-7 shadow-xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5 border-blue-500/35 bg-blue-500/8 text-blue-700 dark:text-blue-300">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Student portal
                </Badge>
                <Badge variant="secondary" className="gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Live session
                </Badge>
              </div>
              <div className="mt-7 max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Classroom access
                </p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Join the case exactly where the instructor is driving it.
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground max-w-xl">
                  Enter the room code, join under your real display name, and wait for the shared patient to go live.
                </p>
              </div>

              <div className="mt-7">
                <StudentJoinFlow activeIndex={joinFlowStep} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <JoinSignal icon={Radio} label="PIN" value={pinValid ? 'Ready' : 'Required'} active={pinValid} />
                <JoinSignal icon={UserCheck} label="Name" value={displayName.trim() ? 'Ready' : 'Required'} active={Boolean(displayName.trim())} />
                <JoinSignal icon={Monitor} label="Patient" value="Pending" active={false} />
              </div>
            </section>

            <Card className="glass-strong rounded-2xl border border-white/55 dark:border-white/10 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle>{t('classroom.joinTitle')}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t('classroom.joinBody')}
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('classroom.pinLabel')}
                  </label>
                  <Input
                    value={pinInput}
                    onChange={e => {
                      // Digits only, max 6
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPinInput(clean);
                      if (error) clearError();
                    }}
                    placeholder="123456"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    autoFocus
                    className="h-14 text-3xl tracking-[0.32em] tabular-nums text-center font-semibold"
                    disabled={status === 'connecting'}
                  />
                  {isPreviewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPinInput('123456');
                        setDisplayName(prev => prev.trim() ? prev : 'Sara Ahmed');
                        if (error) clearError();
                      }}
                      disabled={status === 'connecting'}
                      className="h-9 w-full gap-2"
                    >
                      <Radio className="h-4 w-4" />
                      Use demo room
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('classroom.displayName')}
                  </label>
                  <Input
                    value={displayName}
                    onChange={e => {
                      setDisplayName(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder={t('classroom.displayNamePlaceholder')}
                    disabled={status === 'connecting'}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    className="h-11"
                  />
                </div>

                <Button
                  onClick={handleJoin}
                  disabled={status === 'connecting' || !pinValid || !displayName.trim()}
                  className="h-11 w-full gap-2"
                >
                  {status === 'connecting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Radio className="h-4 w-4" />
                  )}
                  {t('classroom.joinButton')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ----------- Waiting room (joined, no case yet) ----------- */}
        {session && !activeCase && (
          <Card className="glass-strong rounded-2xl border border-white/55 dark:border-white/10 overflow-hidden shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle>{t('classroom.connectedTitle')}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('classroom.waitingForInstructor', {
                    name: session.instructor_name,
                  })}
                </p>
              </div>
              <Badge variant="outline" className="gap-1.5 border-emerald-500/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300">
                <Radio className="h-3 w-3" />
                {t('classroom.live')}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-6 py-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-2xl border border-primary/15 bg-primary/[0.045] p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>
                <div className="mt-4 text-lg font-semibold text-foreground">
                  Waiting for case launch
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  You are connected as {displayName || 'student'}.
                </p>
              </div>

              <div className="space-y-3">
                <StudentJoinFlow activeIndex={2} />
                <div className="grid gap-2 sm:grid-cols-3">
                  <JoinSignal icon={Radio} label="PIN" value={session.pin} active />
                  <JoinSignal icon={Users} label="Class" value={`${students.length} joined`} active />
                  <JoinSignal icon={CheckCircle2} label="Status" value="Ready" active />
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="outline" onClick={handleLeave} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    {t('classroom.leaveSession')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* When `session && activeCase` the component early-returns at the
            top with `ClassroomSpectatorView`. Nothing to render here for
            the live-case path. */}
      </div>
      </div>{/* /relative z-10 — ambient-bg wrapper */}
    </div>
  );
}

function StudentJoinFlow({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {STUDENT_JOIN_FLOW.map((step, index) => {
        const Icon = step.icon;
        const active = index <= activeIndex;
        return (
          <div
            key={step.label}
            className={`rounded-xl border px-3 py-3 transition-colors ${
              active
                ? 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                : 'border-border/60 bg-background/45 text-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                active ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-foreground">
                  {step.label}
                </div>
                <div className="truncate text-[10px] uppercase tracking-wider opacity-75">
                  {step.detail}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function JoinSignal({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${
      active
        ? 'border-emerald-500/25 bg-emerald-500/10'
        : 'border-border/60 bg-background/45'
    }`}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${active ? 'text-emerald-600 dark:text-emerald-300' : ''}`} />
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

export default ClassroomJoin;
