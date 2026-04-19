/**
 * ClassroomHost — instructor-side classroom route wrapper.
 *
 * Flow:
 *   1. Pre-lobby (no session yet) — render ClassroomLobby so the
 *      instructor can enter their name, open a lobby, see students
 *      join, and pick a case.
 *   2. Case-live (session.status === 'running' + case_snapshot present)
 *      — render StudentPanel with the case pre-loaded, plus a
 *      ClassroomBroadcastBar at the top. The instructor now drives
 *      the exact same live-case UI (LIFEPAK monitor, 3D body,
 *      ABCDE, treatments, transport decisions) that students see
 *      in single-player mode.
 *   3. Between cases (session.status === 'lobby' again after endCase)
 *      — returns to ClassroomLobby for case re-picking without
 *      tearing down the session.
 *
 * This route replaces the old "ClassroomLobby only" approach where
 * hitting "Case live" broadcast to students but left the instructor
 * with no case view to drive.
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useClassroomSession } from '@/hooks/useClassroomSession';
import { useClassroomVoice } from '@/hooks/useClassroomVoice';
import { ClassroomLobby } from './ClassroomLobby';
import { InstructorLiveControls, type InstructorOverride } from './InstructorLiveControls';
import { ClassroomBroadcastBar } from './ClassroomBroadcastBar';
import { ClassroomChatSidebar } from './ClassroomChatSidebar';
import { ClassroomVideoTiles } from './ClassroomVideoTiles';
import type { CaseScenario } from '@/types';

// Reuse the student panel — it contains the full case-running UI.
const StudentPanel = lazy(() => import('@/components/StudentPanel'));

interface Props {
  onExit: () => void;
}

/**
 * Owns the useClassroomSession hook instance and passes it down to both
 * sub-views (lobby + live case). This keeps a SINGLE Supabase channel /
 * participant list across both states — previously rendering ClassroomLobby
 * as a child caused a second hook instance and a duplicate channel.
 */
export function ClassroomHost({ onExit }: Props) {
  const sessionHook = useClassroomSession();
  const {
    session,
    participants,
    sendBroadcast,
    endCase,
    leaveSession,
    broadcastStatePatch,
    isDriver,
    driverKeys,
    selfKey,
    timerEndsAt,
    sharedState,
    giveControl,
    addDriver,
    setDrivers,
    takeControl,
    lastBroadcast,
  } = sessionHook;

  // Instructor "puppet-master" override state. The InstructorLiveControls
  // panel bumps this; StudentPanel (on the driver side) merges the payload
  // into its patientState, and the existing broadcast effects carry the
  // change to every watching student automatically.
  const [instructorOverride, setInstructorOverride] = useState<InstructorOverride | null>(null);

  // Voice-chat mesh. The instructor is allowed to broadcast whenever they
  // are currently driving (which is the default). When they hand control to
  // a student, the student's hook takes over the `canBroadcast=true` side.
  const voice = useClassroomVoice({
    selfKey,
    participants,
    lastBroadcast,
    sendBroadcast,
    canBroadcast: isDriver,
  });

  // Before a case is live, show the lobby (includes pre-lobby name entry,
  // PIN, student list, and case picker). Also renders during the 'lobby'
  // state between cases after endCase() so the instructor can pick another.
  const caseSnapshot = session?.status === 'running' ? (session.case_snapshot as CaseScenario | null) : null;

  // --- Hooks must sit BEFORE any conditional return (rules of hooks).
  // These effects are no-ops when no timer is set or when the case isn't
  // running, but they still need to register in the same order on every
  // render to keep React's hook-sequence invariant.

  // Auto-end when the countdown expires — only the instructor re-arms the
  // setTimeout so we don't get multi-writer races with students.
  useEffect(() => {
    if (!caseSnapshot) return;
    if (!timerEndsAt) return;
    if (!isDriver) return;
    const remaining = new Date(timerEndsAt).getTime() - Date.now();
    if (remaining <= 0) {
      void endCase();
      toast.info('⏰ Session time is up — case ended');
      return;
    }
    const id = window.setTimeout(() => {
      void endCase();
      toast.info('⏰ Session time is up — case ended');
    }, remaining);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerEndsAt, isDriver, caseSnapshot]);

  // Friendly 2-minute warning toast for everyone.
  useEffect(() => {
    if (!caseSnapshot) return;
    if (!timerEndsAt) return;
    const warnAt = new Date(timerEndsAt).getTime() - 2 * 60_000;
    const wait = warnAt - Date.now();
    if (wait <= 0) return;
    const id = window.setTimeout(() => {
      toast.warning('⏰ 2 minutes left', { duration: 5000 });
    }, wait);
    return () => window.clearTimeout(id);
  }, [timerEndsAt, caseSnapshot]);

  if (!caseSnapshot) {
    return <ClassroomLobby onExit={onExit} sessionHook={sessionHook} />;
  }

  const handleEndCase = async () => {
    await endCase();
  };

  const handleEndSession = async () => {
    await leaveSession();
    onExit();
  };

  // Case is live — render the full case panel with a broadcast overlay
  // + chat sidebar. Both instructor and student mount the sidebar so
  // everyone can see / send messages in the same live thread.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ClassroomVideoTiles
        localStream={voice.localVideoStream}
        remoteStreams={voice.remoteVideoStreams}
        participants={participants}
        selfKey={selfKey}
        onStopCamera={voice.stopCamera}
      />
      <ClassroomChatSidebar
        messages={sessionHook.chatMessages}
        onSend={sessionHook.sendChat}
        selfKey={selfKey}
        driverKeys={driverKeys}
      />
      {/* Instructor-only live controls — lets the educator steer the live
          case (force rhythm change, override vitals, flip to/from arrest)
          without editing the case script. Only rendered on the driver
          (instructor) side; students never see this panel. */}
      {isDriver && (
        <InstructorLiveControls
          override={instructorOverride}
          setOverride={setInstructorOverride}
          currentVitals={sharedState.vitals}
          currentRhythm={sharedState.currentRhythm}
        />
      )}
      <StudentPanel
        onExit={handleEndSession}
        preloadedCase={caseSnapshot}
        instructorOverride={isDriver ? instructorOverride ?? undefined : undefined}
        // Only the current driver broadcasts state changes. When control is
        // handed to a student, the instructor stops broadcasting and starts
        // RECEIVING patches via externalState.
        onClassroomStateChange={isDriver ? broadcastStatePatch : undefined}
        readOnly={!isDriver}
        externalState={!isDriver ? {
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
        } : undefined}
        topBanner={
          <ClassroomBroadcastBar
            caseData={caseSnapshot}
            participants={participants}
            pin={session?.pin ?? ''}
            timerEndsAt={timerEndsAt}
            driverKeys={driverKeys}
            selfKey={selfKey}
            onBroadcast={sendBroadcast}
            onGiveControl={giveControl}
            onAddDriver={addDriver}
            onOpenFloor={setDrivers}
            onTakeControl={takeControl}
            onEndCase={handleEndCase}
            onEndSession={handleEndSession}
            voice={voice}
          />
        }
      />
    </Suspense>
  );
}

export default ClassroomHost;
