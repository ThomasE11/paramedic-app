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

import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { useClassroomSession } from '@/hooks/useClassroomSession';
import { ClassroomLobby } from './ClassroomLobby';
import { ClassroomBroadcastBar } from './ClassroomBroadcastBar';
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
  } = sessionHook;

  // Before a case is live, show the lobby (includes pre-lobby name entry,
  // PIN, student list, and case picker). Also renders during the 'lobby'
  // state between cases after endCase() so the instructor can pick another.
  const caseSnapshot = session?.status === 'running' ? (session.case_snapshot as CaseScenario | null) : null;

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

  // Case is live — render the full case panel with a broadcast overlay.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <StudentPanel
        onExit={handleEndSession}
        preloadedCase={caseSnapshot}
        // Only the current driver broadcasts state changes. In Phase 1 that's
        // always the instructor; when control-handoff ships the student who
        // has been granted driver privileges will take over broadcasting.
        onClassroomStateChange={isDriver ? broadcastStatePatch : undefined}
        topBanner={
          <ClassroomBroadcastBar
            caseData={caseSnapshot}
            participants={participants}
            pin={session?.pin ?? ''}
            onBroadcast={sendBroadcast}
            onEndCase={handleEndCase}
            onEndSession={handleEndSession}
          />
        }
      />
    </Suspense>
  );
}

export default ClassroomHost;
