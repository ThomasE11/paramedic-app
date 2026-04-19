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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Suspense, lazy } from 'react';
import { toast } from 'sonner';
import { useClassroomSession } from '@/hooks/useClassroomSession';
import { useClassroomVoice } from '@/hooks/useClassroomVoice';
import { allCases } from '@/data/cases';
import type { CaseScenario } from '@/types';
import { ClassroomWatchBanner } from './ClassroomWatchBanner';
import { ClassroomChatSidebar } from './ClassroomChatSidebar';
import { ClassroomVideoTiles } from './ClassroomVideoTiles';

// Students run the SAME StudentPanel the instructor drives — just with
// `readOnly` flipped on and live state piped in from broadcasts. Lazy-load
// so non-classroom routes don't pay the bundle cost.
const StudentPanel = lazy(() => import('@/components/StudentPanel'));

interface ClassroomJoinProps {
  onExit: () => void;
}

export function ClassroomJoin({ onExit }: ClassroomJoinProps) {
  const { t } = useTranslation();
  const sessionHook = useClassroomSession();
  const {
    supported,
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
    sendBroadcast,
  } = sessionHook;

  // Voice-chat mesh. Students can only transmit if the instructor has
  // given them driving rights; otherwise they're receive-only and hear the
  // current broadcaster via a hidden <audio> element.
  const voice = useClassroomVoice({
    selfKey: sessionHook.selfKey,
    participants: sessionHook.participants,
    lastBroadcast,
    sendBroadcast,
    canBroadcast: isDriver,
  });

  const [pinInput, setPinInput] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [activeCase, setActiveCase] = useState<CaseScenario | null>(null);

  // React to broadcast events from the instructor.
  useEffect(() => {
    if (!lastBroadcast) return;

    if (lastBroadcast.kind === 'case_started') {
      // Prefer the local case object (full data) — fall back to the
      // snapshot in the session row if the case isn't in the bundle
      // (e.g. instructor is running a custom case).
      const byId = allCases.find(c => c.id === lastBroadcast.caseId);
      if (byId) {
        setActiveCase(byId);
      } else if (session?.case_snapshot) {
        setActiveCase(session.case_snapshot as CaseScenario);
      }
      toast.success(t('classroom.caseStartedToast'));
    } else if (lastBroadcast.kind === 'case_ended') {
      setActiveCase(null);
      toast.info(t('classroom.caseEndedToast'));
    } else if (lastBroadcast.kind === 'session_ended') {
      toast.info(t('classroom.sessionEndedToast'));
      setActiveCase(null);
      // Hand control back to the role selection screen.
      onExit();
    } else if (lastBroadcast.kind === 'instructor_message') {
      toast(lastBroadcast.text);
    }
  }, [lastBroadcast, session, t, onExit]);

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
        <ClassroomVideoTiles
          localStream={voice.localVideoStream}
          remoteStreams={voice.remoteVideoStreams}
          participants={sessionHook.participants}
          selfKey={sessionHook.selfKey}
          onStopCamera={voice.stopCamera}
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
              voice={{ ...voice, canBroadcast: isDriver }}
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
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
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

      <div className="max-w-2xl mx-auto p-6 space-y-6">
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

        {/* ----------- Join form ----------- */}
        {!session && (
          <Card>
            <CardHeader>
              <CardTitle>{t('classroom.joinTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                {t('classroom.joinBody')}
              </p>

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
                  className="text-2xl tracking-[0.3em] tabular-nums text-center font-semibold"
                  disabled={status === 'connecting'}
                />
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
                />
              </div>

              <Button
                onClick={handleJoin}
                disabled={status === 'connecting' || !pinValid || !displayName.trim()}
                className="w-full gap-2"
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
        )}

        {/* ----------- Waiting room (joined, no case yet) ----------- */}
        {session && !activeCase && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{t('classroom.connectedTitle')}</CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Radio className="h-3 w-3 text-emerald-500" />
                {t('classroom.live')}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground max-w-xs">
                  {t('classroom.waitingForInstructor', {
                    name: session.instructor_name,
                  })}
                </p>
              </div>
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleLeave} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  {t('classroom.leaveSession')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* When `session && activeCase` the component early-returns at the
            top with `ClassroomSpectatorView`. Nothing to render here for
            the live-case path. */}
      </div>
    </div>
  );
}

export default ClassroomJoin;
