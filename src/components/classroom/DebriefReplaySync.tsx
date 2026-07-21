/**
 * DebriefReplaySync — synchronized classroom debrief.
 *
 * Wraps the existing solo DebriefReplay and adds instructor-driven scrub
 * sync: the instructor scrubs, every student's playhead follows — like a
 * teacher playing a video for the class. A student can detach by scrubbing
 * their own timeline, then re-sync back to the instructor's position.
 *
 * The solo (non-classroom) debrief path is untouched — it renders plain
 * DebriefReplay with no seek props.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, Unlink, Users } from 'lucide-react';
import { DebriefReplay } from '@/components/DebriefReplay';
import type { DebriefTimelineSnapshot } from '@/hooks/useClassroomSession';

interface Props {
  timelineSnapshot: DebriefTimelineSnapshot;
  /** Instructor's current playhead (seconds), or null before the first seek. */
  seekPosition: number | null;
  /** Called when THIS user moves the scrubber. Instructor broadcasts it. */
  onSeek: (timestamp: number) => void;
  isInstructor: boolean;
  /** Student count — instructor sees "broadcasting to N students". */
  studentCount?: number;
  className?: string;
}

export function DebriefReplaySync({
  timelineSnapshot,
  seekPosition,
  onSeek,
  isInstructor,
  studentCount = 0,
  className,
}: Props) {
  const { t } = useTranslation();
  // Students start attached (following). Instructor is always the source of
  // truth, so "detached" is meaningless for them.
  const [detached, setDetached] = useState(false);

  // A brand-new debrief (new snapshot) re-attaches the student.
  useEffect(() => {
    setDetached(false);
  }, [timelineSnapshot]);

  // Map the serializable snapshot → DebriefReplay's timeline input. The
  // snapshot only carries IDs for assessments (no per-step timestamps), so
  // replayTimeline spreads them evenly across the case — good enough for a
  // spectator debrief.
  const startMs = timelineSnapshot.caseStartedAt ?? undefined;
  const endMs = timelineSnapshot.caseEndedAt;
  const appliedTreatments = timelineSnapshot.appliedTreatments.map(tr => ({
    name: tr.name,
    description: tr.detail,
    appliedAt: tr.appliedAt,
  }));
  const performedAssessments = timelineSnapshot.assessmentPerformed.map(stepId => ({ stepId }));

  // Instructor drives the playhead directly (their scrubbing IS the source).
  // Students follow `seekPosition` unless they've detached.
  const controlledSeek = isInstructor ? undefined : detached ? undefined : seekPosition;

  const handleUserSeek = (ts: number) => {
    if (isInstructor) {
      onSeek(ts);
    } else {
      // Student scrubbed their own timeline → detach from the instructor.
      setDetached(true);
    }
  };

  return (
    <div className={className}>
      {/* Sync status strip */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {isInstructor ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Radio className="h-3 w-3" />
            {t('classroom.debrief.broadcasting', { count: studentCount })}
          </span>
        ) : detached ? (
          <button
            type="button"
            onClick={() => setDetached(false)}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-600 transition-colors hover:bg-amber-500/25 dark:text-amber-400"
            title={t('classroom.debrief.reSyncHint')}
          >
            <Unlink className="h-3 w-3" />
            {t('classroom.debrief.detached')} · {t('classroom.debrief.reSync')}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Users className="h-3 w-3" />
            {t('classroom.debrief.following')}
          </span>
        )}
      </div>

      <DebriefReplay
        defaultOpen
        caseStartTime={startMs}
        caseEndTime={endMs}
        appliedTreatments={appliedTreatments}
        performedAssessments={performedAssessments}
        arrestEvents={timelineSnapshot.arrestTimeline}
        controlledSeek={controlledSeek}
        onUserSeek={handleUserSeek}
      />
    </div>
  );
}

export default DebriefReplaySync;
