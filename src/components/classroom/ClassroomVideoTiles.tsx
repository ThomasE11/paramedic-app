/**
 * ClassroomVideoTiles — floating video-tile cluster for classroom mesh.
 *
 * Bottom-right corner of the screen. Shows:
 *   - the user's own camera (small "self" tile, mirrored)
 *   - one tile per remote peer with an active camera
 *
 * Deliberately small so the clinical surface stays dominant. Collapses
 * to a single "N cameras" chip when minimised. No video data ever
 * leaves the WebRTC mesh — all tiles are local <video srcObject> binds.
 */

import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClassroomParticipant } from '@/hooks/useClassroomSession';

interface Props {
  /** This client's local camera stream, if publishing. */
  localStream: MediaStream | null;
  /** Incoming remote streams, keyed by presence key. */
  remoteStreams: Map<string, MediaStream>;
  /** For looking up remote display names. */
  participants: ClassroomParticipant[];
  selfKey: string;
  /** Camera toggle handler (so the tile cluster also offers a quick off). */
  onStopCamera: () => void;
  /** True when this client is a student waiting to receive instructor
   *  video — controls whether to show the "waiting for instructor camera"
   *  placeholder when there's nothing to render yet. */
  spectator?: boolean;
}

export function ClassroomVideoTiles({
  localStream, remoteStreams, participants, selfKey, onStopCamera, spectator = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const hasAny = Boolean(localStream) || remoteStreams.size > 0;
  // For spectators, always render the container so we can show a "waiting
  // for instructor camera" placeholder when no tracks are connected yet.
  // Previously this component returned null in that state and the student
  // had zero feedback that they were even listening for video.
  if (!hasAny && !spectator) return null;

  const remoteEntries = Array.from(remoteStreams.entries()).filter(([k]) => k !== selfKey);
  const totalCount = (localStream ? 1 : 0) + remoteEntries.length;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-3 bottom-20 z-40 inline-flex items-center gap-1.5 rounded-full bg-background/95 border border-border px-3 py-1.5 shadow-lg text-xs font-medium hover:bg-muted transition-colors"
        aria-label="Expand video tiles"
      >
        <Video className="w-3.5 h-3.5 text-primary" />
        {totalCount} camera{totalCount !== 1 ? 's' : ''}
        <Maximize2 className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="fixed right-3 bottom-3 z-40 flex flex-col gap-2 max-w-[200px] pb-16">
      {/* Controls header */}
      <div className="flex items-center gap-1 self-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCollapsed(true)}
          className="h-7 w-7 p-0 bg-background/90 border border-border shadow-sm"
          aria-label="Collapse video tiles"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Remote tiles — stacked vertically on the right */}
      {remoteEntries.map(([key, stream]) => {
        const name = participants.find(p => p.key === key)?.displayName ?? 'Student';
        return <VideoTile key={key} stream={stream} label={name} />;
      })}

      {/* Student-side placeholder — tells the student they ARE connected
          and just waiting for the instructor to turn their camera on. */}
      {spectator && remoteEntries.length === 0 && !localStream && (
        <div className="rounded-xl overflow-hidden bg-muted/60 border border-dashed border-border aspect-[4/3] w-48 flex flex-col items-center justify-center p-3 text-center">
          <Video className="w-5 h-5 text-muted-foreground/70 mb-1.5" />
          <span className="text-[10px] font-medium text-muted-foreground leading-tight">
            Waiting for instructor to start their camera
          </span>
        </div>
      )}

      {/* Local (self) tile — always at the bottom, mirrored preview */}
      {localStream && (
        <VideoTile
          stream={localStream}
          label="You"
          mirrored
          onClose={onStopCamera}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// Single video tile
// -------------------------------------------------------------------------

function VideoTile({
  stream, label, mirrored = false, onClose,
}: {
  stream: MediaStream;
  label: string;
  mirrored?: boolean;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.srcObject !== stream) {
      el.srcObject = stream;
      el.play().catch(() => { /* autoplay policy — swallow */ });
    }
  }, [stream]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-black border border-border shadow-xl aspect-[4/3] w-48">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={mirrored /* own camera is muted to prevent feedback */}
        className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
      />
      <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-white truncate">{label}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-0.5 rounded bg-black/40 hover:bg-black/60 text-white/90"
              aria-label="Turn off camera"
            >
              <VideoOff className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassroomVideoTiles;
