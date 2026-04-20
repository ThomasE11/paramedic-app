/**
 * useClassroomVoice — WebRTC audio mesh over the Supabase signaling channel.
 *
 * Goal: any driver can broadcast voice to every other participant, live,
 * with no extra infrastructure. We reuse the realtime channel the
 * classroom session already owns for SDP offers / answers / ICE
 * candidates, and build a simple mesh of RTCPeerConnections:
 *
 *   Broadcaster (usually instructor)
 *        │ offer ─────► listener 1
 *        │ offer ─────► listener 2
 *        │ offer ─────► listener 3
 *        ...
 *        └ each listener sends back its own answer + ICE candidates
 *
 * Design decisions
 * ----------------
 * 1. **One-way by default.** Only the designated broadcaster captures
 *    mic and publishes. Listeners are pure receivers. That matches the
 *    Zoom-style teaching use case ("instructor talks, class listens")
 *    and keeps echo / feedback to a minimum on classroom wifi.
 *    When the instructor hands driving to a student, the hook hands the
 *    broadcaster role with it (call startBroadcast on the new driver).
 *
 * 2. **Mesh scales to ~6 comfortably.** Each listener is one peer-
 *    connection for the broadcaster. For a small paramedic classroom
 *    that's fine. Beyond ~10 participants you'd want an SFU; not this
 *    session's problem.
 *
 * 3. **STUN-only.** Google's public STUN server is enough for most
 *    home / office / campus networks. No TURN fallback — if a student
 *    is behind a symmetric NAT they'll simply miss audio; they still
 *    see the chat + shared state. Good trade-off for a free-tier app.
 *
 * 4. **Signaling via Supabase broadcast.** The classroom channel is
 *    already open and authenticated; we piggy-back four new broadcast
 *    kinds (`webrtc_offer` / `webrtc_answer` / `webrtc_ice` /
 *    `voice_state`). No new servers.
 *
 * 5. **iOS / Safari autoplay.** Incoming audio tracks attach to a
 *    hidden `<audio autoplay>` element. iOS needs a user gesture to
 *    unlock audio playback on first page load — we call `.play()` from
 *    the same click that toggles voice on, which satisfies the rule.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClassroomBroadcast, ClassroomParticipant } from './useClassroomSession';

interface UseClassroomVoiceArgs {
  /** Presence key of this client. */
  selfKey: string;
  /** Every participant currently in the session. */
  participants: ClassroomParticipant[];
  /** Most recent broadcast from the realtime channel — we pick off WebRTC kinds. */
  lastBroadcast: ClassroomBroadcast | null;
  /** Send a broadcast through the session channel. */
  sendBroadcast: (payload: ClassroomBroadcast) => Promise<void> | void;
  /** Is this client currently allowed to speak? (Instructor or driver.) */
  canBroadcast: boolean;
}

interface UseClassroomVoiceResult {
  /** True when this client's mic is on and sending audio. */
  isBroadcasting: boolean;
  /** Presence keys of other clients currently transmitting audio. */
  activeSpeakers: string[];
  /** True when listening audio is playing (user hasn't muted). */
  listenerMuted: boolean;
  /** Mic permission / device error, if any. */
  error: string | null;
  /** Instructor / driver: request mic and start publishing. */
  startBroadcast: () => Promise<void>;
  /** Instructor / driver: stop publishing. */
  stopBroadcast: () => void;
  /** Listener: mute / unmute incoming audio. */
  toggleListenerMute: () => void;
  /** True when at least one other peer is currently speaking. */
  hasIncomingAudio: boolean;
  /** Video: true when local camera track is being published. */
  isCameraOn: boolean;
  /** Local camera MediaStream — bind to a local preview <video>. */
  localVideoStream: MediaStream | null;
  /** Remote video streams keyed by participant presence key. */
  remoteVideoStreams: Map<string, MediaStream>;
  /** Start publishing the local camera (adds video track to every peer). */
  startCamera: () => Promise<void>;
  /** Stop the camera — removes tracks from peers, releases hardware. */
  stopCamera: () => void;
  /** True when the browser's autoplay policy has blocked a remote audio
   *  element from playing. The UI should show a tap-to-unlock banner. */
  audioBlocked: boolean;
  /** Retry playback on all remote audio elements. MUST be called from a
   *  user-gesture handler (click/touch) for browsers to honour it. */
  unlockAudio: () => Promise<void>;
}

// ---------------------------------------------------------------------------

// ICE servers used by every RTCPeerConnection. We always include public
// Google STUN (free, low-latency, sufficient for most home/office/campus
// networks). Without TURN, ~20% of users behind symmetric NAT (common on
// corporate Wi-Fi, some mobile carriers, and hotel networks) fail silently:
// peers never connect, student never hears instructor, camera tile never
// appears.
//
// Two TURN sources, in preference order:
//   1. Self-hosted — supply VITE_TURN_URL / VITE_TURN_USERNAME / VITE_TURN_PASSWORD
//      in Vercel env for production. Recommended for real classroom deployments.
//   2. Metered.ca's OpenRelay free public TURN — no credentials, works over
//      tcp:443 which bypasses most firewalls. Rate-limited and not SLA-backed
//      but gets us the critical "student can connect at all" case.
function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  const customUrl = import.meta.env.VITE_TURN_URL as string | undefined;
  const customUser = import.meta.env.VITE_TURN_USERNAME as string | undefined;
  const customPass = import.meta.env.VITE_TURN_PASSWORD as string | undefined;
  if (customUrl && customUser && customPass) {
    servers.push({ urls: customUrl, username: customUser, credential: customPass });
  }

  // Always include OpenRelay as a last-resort fallback. The ICE agent will
  // prefer a peer-reflexive (STUN) candidate when available and only fall
  // through to TURN when no direct path exists, so this doesn't meaningfully
  // cost latency for the 80% who'd succeed on STUN alone.
  servers.push(
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
  );

  return servers;
}

const ICE_SERVERS: RTCIceServer[] = buildIceServers();

export function useClassroomVoice({
  selfKey,
  participants,
  lastBroadcast,
  sendBroadcast,
  canBroadcast,
}: UseClassroomVoiceArgs): UseClassroomVoiceResult {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);
  const [listenerMuted, setListenerMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Peer connections keyed by the remote participant's presence key.
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Remote audio elements (one per incoming stream). Hidden but DOM-mounted.
  const audioEls = useRef<Map<string, HTMLAudioElement>>(new Map());
  // Local mic stream — kept once per broadcast cycle.
  const localStreamRef = useRef<MediaStream | null>(null);
  const isBroadcastingRef = useRef(false);
  const listenerMutedRef = useRef(false);
  const participantsRef = useRef<ClassroomParticipant[]>([]);

  // -- Video state -----------------------------------------------------------
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [remoteVideoStreams, setRemoteVideoStreams] = useState<Map<string, MediaStream>>(new Map());
  const localVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoSendersRef = useRef<Map<string, RTCRtpSender>>(new Map());

  useEffect(() => { isBroadcastingRef.current = isBroadcasting; }, [isBroadcasting]);
  useEffect(() => { listenerMutedRef.current = listenerMuted; }, [listenerMuted]);
  useEffect(() => { participantsRef.current = participants; }, [participants]);

  // ------ helpers --------------------------------------------------------

  const closePeer = useCallback((remoteKey: string) => {
    const pc = peersRef.current.get(remoteKey);
    if (pc) {
      try { pc.close(); } catch { /* noop */ }
      peersRef.current.delete(remoteKey);
    }
    const audio = audioEls.current.get(remoteKey);
    if (audio) {
      try { audio.pause(); } catch { /* noop */ }
      try { audio.srcObject = null; } catch { /* noop */ }
      audio.remove();
      audioEls.current.delete(remoteKey);
    }
    videoSendersRef.current.delete(remoteKey);
    setRemoteVideoStreams(prev => {
      if (!prev.has(remoteKey)) return prev;
      const next = new Map(prev);
      next.delete(remoteKey);
      return next;
    });
    setActiveSpeakers(prev => prev.filter(k => k !== remoteKey));
  }, []);

  const closeAllPeers = useCallback(() => {
    for (const key of Array.from(peersRef.current.keys())) closePeer(key);
  }, [closePeer]);

  // True when at least one remote audio element was blocked by the browser's
  // autoplay policy (common on iOS Safari and some mobile Chrome versions
  // when the user never tapped the page). The UI uses this to show a
  // "Tap to enable audio" banner that re-triggers .play() from a user
  // gesture, which is the one thing that unblocks the stream.
  const [audioBlocked, setAudioBlocked] = useState(false);

  /** Attach a fresh <audio> element for an incoming remote stream. */
  const attachRemoteAudio = useCallback((remoteKey: string, stream: MediaStream) => {
    let el = audioEls.current.get(remoteKey);
    if (!el) {
      el = document.createElement('audio');
      el.autoplay = true;
      // iOS needs `playsInline` to allow inline audio without fullscreen.
      el.setAttribute('playsinline', '');
      // Hide the element — we want audio only.
      el.style.position = 'fixed';
      el.style.top = '-9999px';
      document.body.appendChild(el);
      audioEls.current.set(remoteKey, el);
    }
    el.srcObject = stream;
    el.muted = listenerMutedRef.current;
    // .play() may reject because the user hasn't interacted with the page
    // yet (autoplay policy). Surface that so the UI can prompt a tap.
    el.play().catch((err) => {
      if (err && typeof err === 'object' && 'name' in err && (err as DOMException).name === 'NotAllowedError') {
        setAudioBlocked(true);
      }
    });
  }, []);

  /** Retry playback on every remote <audio> element — must be called from
   *  a user gesture (e.g. click handler) to satisfy autoplay policies. */
  const unlockAudio = useCallback(async () => {
    const attempts = Array.from(audioEls.current.values()).map(el => el.play().catch(() => undefined));
    await Promise.all(attempts);
    setAudioBlocked(false);
  }, []);

  /** Keep every mounted <audio> muted state in sync with listenerMuted. */
  useEffect(() => {
    for (const el of audioEls.current.values()) {
      el.muted = listenerMuted;
      if (!listenerMuted) el.play().catch(() => { /* noop */ });
    }
  }, [listenerMuted]);

  /**
   * Build a new RTCPeerConnection targeting `remoteKey`. Sets up the
   * standard event handlers (ontrack / onicecandidate / oniceconnection-
   * statechange) and wires them back through the session broadcast.
   */
  const makePeer = useCallback((remoteKey: string): RTCPeerConnection => {
    const existing = peersRef.current.get(remoteKey);
    if (existing) return existing;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peersRef.current.set(remoteKey, pc);

    pc.onicecandidate = (ev) => {
      // `ev.candidate === null` signals end-of-candidates — we still
      // forward it so the remote knows we're done.
      void sendBroadcast({
        kind: 'webrtc_ice',
        fromKey: selfKey,
        toKey: remoteKey,
        candidate: ev.candidate ? ev.candidate.toJSON() : null,
      });
    };

    pc.ontrack = (ev) => {
      const [stream] = ev.streams;
      if (!stream) return;
      // Audio track: attach to hidden audio element + update speakers.
      if (ev.track.kind === 'audio') {
        attachRemoteAudio(remoteKey, stream);
        setActiveSpeakers(prev => Array.from(new Set([...prev, remoteKey])));
      }
      // Video track: expose the stream so the UI can render a tile.
      if (ev.track.kind === 'video') {
        setRemoteVideoStreams(prev => {
          const next = new Map(prev);
          next.set(remoteKey, stream);
          return next;
        });
        // If the remote ends the track, drop the tile.
        ev.track.onended = () => {
          setRemoteVideoStreams(prev => {
            const next = new Map(prev);
            next.delete(remoteKey);
            return next;
          });
        };
      }
    };

    pc.oniceconnectionstatechange = () => {
      // A closed / failed connection means the remote is no longer
      // speaking; drop them from the active-speakers list.
      if (['failed', 'closed', 'disconnected'].includes(pc.iceConnectionState)) {
        setActiveSpeakers(prev => prev.filter(k => k !== remoteKey));
      }
    };

    return pc;
  }, [selfKey, sendBroadcast, attachRemoteAudio]);

  /**
   * Create a peer (if missing), attach all local audio tracks, send an
   * SDP offer. Factored out so startBroadcast AND the late-joiner
   * reconcile effect can share the same path.
   */
  const openAndOfferTo = useCallback(async (remoteKey: string, stream: MediaStream) => {
    const pc = makePeer(remoteKey);
    for (const track of stream.getAudioTracks()) {
      // addTrack throws if the track is already on this connection.
      const already = pc.getSenders().some(s => s.track === track);
      if (!already) {
        try { pc.addTrack(track, stream); } catch { /* noop */ }
      }
    }
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendBroadcast({
        kind: 'webrtc_offer',
        fromKey: selfKey,
        toKey: remoteKey,
        sdp: JSON.stringify(offer),
      });
      console.info('[classroom-voice] offered to', remoteKey);
    } catch (e) {
      console.warn('[classroom-voice] failed to offer', remoteKey, e);
    }
  }, [makePeer, selfKey, sendBroadcast]);

  // ------ start / stop broadcasting --------------------------------------

  const startBroadcast = useCallback(async () => {
    if (!canBroadcast) {
      setError('not-allowed');
      return;
    }
    if (isBroadcastingRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      localStreamRef.current = stream;
      setError(null);
      setIsBroadcasting(true);

      // Announce broadcasting so every listener's UI can show the
      // "speaking" badge even before their peer-connection handshake
      // completes.
      await sendBroadcast({
        kind: 'voice_state',
        fromKey: selfKey,
        broadcasting: true,
      });

      // Open a peer connection to every OTHER participant and send them
      // an SDP offer. Listeners reply with answers; we hook up ICE
      // candidates as they arrive. NOTE: any late-joining students are
      // handled separately by the reconcile-on-participants effect below,
      // so even if they weren't in the list when we hit Talk, they still
      // get offered once they show up.
      const others = participantsRef.current.filter(p => p.key !== selfKey);
      console.info('[classroom-voice] startBroadcast — offering to', others.length, 'peer(s)');
      for (const peer of others) {
        await openAndOfferTo(peer.key, stream);
      }
    } catch (e) {
      const msg = (e as { name?: string })?.name === 'NotAllowedError'
        ? 'mic-denied'
        : (e as { name?: string })?.name === 'NotFoundError'
          ? 'no-mic'
          : 'mic-error';
      setError(msg);
      setIsBroadcasting(false);
    }
  }, [canBroadcast, selfKey, sendBroadcast, makePeer]);

  const stopBroadcast = useCallback(() => {
    // Stop local mic tracks — releases the OS mic indicator too.
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getTracks()) {
        try { t.stop(); } catch { /* noop */ }
      }
      localStreamRef.current = null;
    }
    // Close all outgoing peer connections (we're no longer publishing).
    closeAllPeers();
    setIsBroadcasting(false);
    void sendBroadcast({
      kind: 'voice_state',
      fromKey: selfKey,
      broadcasting: false,
    });
  }, [closeAllPeers, selfKey, sendBroadcast]);

  const toggleListenerMute = useCallback(() => {
    setListenerMuted(m => !m);
  }, []);

  // ------ signaling: react to incoming WebRTC broadcasts ------------------

  useEffect(() => {
    if (!lastBroadcast) return;
    // Only handle messages addressed to us (by `toKey`).
    if (lastBroadcast.kind === 'webrtc_offer' && lastBroadcast.toKey === selfKey) {
      (async () => {
        try {
          const pc = makePeer(lastBroadcast.fromKey);
          await pc.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(lastBroadcast.sdp)),
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendBroadcast({
            kind: 'webrtc_answer',
            fromKey: selfKey,
            toKey: lastBroadcast.fromKey,
            sdp: JSON.stringify(answer),
          });
        } catch (e) {
          console.warn('[classroom-voice] failed to answer offer', e);
        }
      })();
    } else if (lastBroadcast.kind === 'webrtc_answer' && lastBroadcast.toKey === selfKey) {
      const pc = peersRef.current.get(lastBroadcast.fromKey);
      if (pc && pc.signalingState !== 'closed') {
        (async () => {
          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription(JSON.parse(lastBroadcast.sdp)),
            );
          } catch (e) {
            console.warn('[classroom-voice] failed to set answer', e);
          }
        })();
      }
    } else if (lastBroadcast.kind === 'webrtc_ice' && lastBroadcast.toKey === selfKey) {
      const pc = peersRef.current.get(lastBroadcast.fromKey);
      if (pc && lastBroadcast.candidate) {
        pc.addIceCandidate(new RTCIceCandidate(lastBroadcast.candidate)).catch(e => {
          console.warn('[classroom-voice] addIceCandidate failed', e);
        });
      }
    } else if (lastBroadcast.kind === 'voice_state') {
      setActiveSpeakers(prev => {
        const next = new Set(prev);
        if (lastBroadcast.broadcasting) next.add(lastBroadcast.fromKey);
        else next.delete(lastBroadcast.fromKey);
        return Array.from(next);
      });
      // If a peer stopped broadcasting, tear down the peer connection
      // on our side too so we don't hoard stale audio elements.
      if (!lastBroadcast.broadcasting) {
        closePeer(lastBroadcast.fromKey);
      }
    } else if (lastBroadcast.kind === 'session_ended' || lastBroadcast.kind === 'case_ended') {
      // Clean break between cases / on session end.
      if (isBroadcastingRef.current) stopBroadcast();
      closeAllPeers();
    }
  }, [lastBroadcast, selfKey, sendBroadcast, makePeer, closePeer, closeAllPeers, stopBroadcast]);

  // Reconcile peers when the participant list changes while broadcasting.
  // Without this, anyone who joins AFTER the instructor hits Talk never
  // receives an SDP offer and hears nothing. We also tear down peers for
  // participants who left.
  useEffect(() => {
    if (!isBroadcasting) return;
    const stream = localStreamRef.current;
    if (!stream) return;

    const liveKeys = new Set(participants.map(p => p.key));
    liveKeys.delete(selfKey);

    // Drop peers for participants that left.
    for (const key of Array.from(peersRef.current.keys())) {
      if (!liveKeys.has(key)) closePeer(key);
    }

    // Open + offer to any participant we don't already have a peer for.
    for (const key of liveKeys) {
      if (!peersRef.current.has(key)) {
        console.info('[classroom-voice] reconcile: offering to late-joiner', key);
        void openAndOfferTo(key, stream);
      }
    }
  }, [participants, isBroadcasting, selfKey, openAndOfferTo, closePeer]);

  // Tear down on unmount — releases the mic + peer connections.
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        for (const t of localStreamRef.current.getTracks()) {
          try { t.stop(); } catch { /* noop */ }
        }
        localStreamRef.current = null;
      }
      for (const pc of peersRef.current.values()) {
        try { pc.close(); } catch { /* noop */ }
      }
      peersRef.current.clear();
      for (const el of audioEls.current.values()) {
        try { el.pause(); el.srcObject = null; el.remove(); } catch { /* noop */ }
      }
      audioEls.current.clear();
    };
  }, []);

  const hasIncomingAudio = activeSpeakers.some(k => k !== selfKey);

  // -- Camera (video) --------------------------------------------------------
  // Video is added as an ADDITIONAL track to existing peer connections.
  // Each peer gets the same video track via RTCPeerConnection.addTrack.
  // Turning the camera off stops the track + removes the sender + renegotiates.
  const startCamera = useCallback(async () => {
    if (localVideoTrackRef.current) return; // already on
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15, max: 24 } },
        audio: false,
      });
      const track = videoStream.getVideoTracks()[0];
      if (!track) throw new Error('no-video-track');
      localVideoTrackRef.current = track;
      setLocalVideoStream(videoStream);
      setIsCameraOn(true);

      // Attach to every existing peer. Renegotiation required.
      const peers = Array.from(peersRef.current.entries());
      for (const [remoteKey, pc] of peers) {
        try {
          const sender = pc.addTrack(track, videoStream);
          videoSendersRef.current.set(remoteKey, sender);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendBroadcast({
            kind: 'webrtc_offer',
            fromKey: selfKey,
            toKey: remoteKey,
            sdp: JSON.stringify(offer),
          });
        } catch (e) {
          console.warn('[classroom-voice] camera addTrack failed', remoteKey, e);
        }
      }

      // End track if user stops it externally (e.g. OS revoke).
      track.onended = () => stopCamera();
    } catch (e) {
      const msg = (e as { name?: string })?.name === 'NotAllowedError'
        ? 'camera-denied'
        : (e as { name?: string })?.name === 'NotFoundError'
          ? 'no-camera'
          : 'camera-error';
      setError(msg);
      setIsCameraOn(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfKey, sendBroadcast]);

  const stopCamera = useCallback(() => {
    const track = localVideoTrackRef.current;
    if (track) {
      try { track.stop(); } catch { /* noop */ }
      localVideoTrackRef.current = null;
    }
    // Remove video senders from every peer + renegotiate.
    for (const [remoteKey, sender] of videoSendersRef.current.entries()) {
      const pc = peersRef.current.get(remoteKey);
      if (pc) {
        try { pc.removeTrack(sender); } catch { /* noop */ }
      }
    }
    videoSendersRef.current.clear();
    setLocalVideoStream(null);
    setIsCameraOn(false);
  }, []);

  return {
    isBroadcasting,
    activeSpeakers: activeSpeakers.filter(k => k !== selfKey),
    listenerMuted,
    error,
    startBroadcast,
    stopBroadcast,
    toggleListenerMute,
    hasIncomingAudio,
    isCameraOn,
    localVideoStream,
    remoteVideoStreams,
    startCamera,
    stopCamera,
    audioBlocked,
    unlockAudio,
  };
}
