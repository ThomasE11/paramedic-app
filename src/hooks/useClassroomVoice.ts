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
}

// ---------------------------------------------------------------------------

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

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
    setActiveSpeakers(prev => prev.filter(k => k !== remoteKey));
  }, []);

  const closeAllPeers = useCallback(() => {
    for (const key of Array.from(peersRef.current.keys())) closePeer(key);
  }, [closePeer]);

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
    // `.play()` may reject on autoplay policy — swallow. The UI has a
    // "Unmute" toggle the user can click to resume.
    el.play().catch(() => { /* ignored */ });
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
      attachRemoteAudio(remoteKey, stream);
      setActiveSpeakers(prev => Array.from(new Set([...prev, remoteKey])));
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

  return {
    isBroadcasting,
    activeSpeakers: activeSpeakers.filter(k => k !== selfKey),
    listenerMuted,
    error,
    startBroadcast,
    stopBroadcast,
    toggleListenerMute,
    hasIncomingAudio,
  };
}
