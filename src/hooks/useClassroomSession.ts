/**
 * useClassroomSession — Kahoot-style classroom multiplayer (Phase 4)
 *
 * This hook is the single entry point for the classroom feature. One hook
 * powers both sides:
 *
 *   - Instructor: call `createSession()` to mint a 6-digit PIN. The hook
 *     subscribes to a realtime presence channel, tracks connected students
 *     via Supabase presence state, and exposes `startCase()` / `endSession()`
 *     which broadcast events to every joined student.
 *
 *   - Student: call `joinSession(pin, displayName)` to look up the session
 *     row, join its presence channel, and listen for broadcast events from
 *     the instructor (case_started, session_ended, etc.).
 *
 * Why this shape?
 *   - One table, one channel per session. Keeps the backend surface tiny.
 *   - Realtime presence handles the "who's connected" problem without DB
 *     writes on every join/leave.
 *   - Broadcast is fire-and-forget — good fit for classroom events.
 *
 * Graceful degradation: if Supabase env vars are missing (`isSupabaseConfigured()`
 * returns false), the hook returns `supported: false` and every action is
 * a no-op. The rest of the app still works in single-player mode.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabaseConfig';

// ============================================================================
// Types
// ============================================================================

export type ClassroomRole = 'instructor' | 'student';

export type ClassroomStatus = 'idle' | 'connecting' | 'lobby' | 'running' | 'ended' | 'error';

export interface ClassroomSessionRow {
  id: string;
  pin: string;
  instructor_name: string;
  case_id: string | null;
  case_snapshot: unknown | null;
  status: 'lobby' | 'running' | 'ended';
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface ClassroomParticipant {
  key: string;             // presence-ref key, stable per client
  displayName: string;
  role: ClassroomRole;
  joinedAt: string;
}

/**
 * Shared live-case state mirrored to every participant in a classroom
 * session. The current driver (instructor by default, a delegated student
 * if control was granted) owns writes and broadcasts patches; everybody
 * else renders those patches.
 *
 * Kept deliberately small: only the observable signals that matter for
 * spectator teaching — vital signs, treatments, assessment progress,
 * current phase, optional timer start. Everything else (UI micro-state
 * like which accordion is open) stays local to each client.
 */
export interface SharedCaseState {
  /** Current vital signs (what the LIFEPAK monitor shows). */
  vitals?: Partial<{
    bp: string; pulse: number; respiration: number; spo2: number;
    temperature: number; gcs: number; bloodGlucose: number;
  }>;
  /**
   * Running ordered list of treatments the driver has applied.
   * Each entry is a minimal shape — name, dose/route, and a timestamp —
   * so the spectator side can render an action feed without needing the
   * full Treatment object.
   */
  appliedTreatments?: Array<{
    id: string;
    name: string;
    detail?: string;
    appliedAt: string;
  }>;
  /** IDs of studentChecklist items marked complete. */
  completedItems?: string[];
  /** Assessment step IDs performed (primary + secondary survey etc.). */
  assessmentPerformed?: string[];
  /** ISO timestamp the driver pressed Start Case. */
  caseStartedAt?: string;
  /** Which LIFEPAK vitals the driver has revealed so far (assess-required). */
  monitorRevealedVitals?: string[];
  /** Current transport decision state, if the wizard is in flight. */
  transportDecision?: {
    priority?: string;
    position?: string;
    preAlert?: boolean;
    destination?: string;
    provisionalDiagnosis?: string;
  };
  /**
   * Current cardiac rhythm string as the engine sees it on the driver's
   * side (e.g. 'Asystole', 'Ventricular Fibrillation', 'Sinus Tachycardia').
   * Broadcasting this is essential for the spectator's LIFEPAK monitor to
   * render the same waveform the driver sees — without it, the student's
   * monitor falls back to static case data and doesn't evolve through
   * shock → ROSC transitions.
   */
  currentRhythm?: string;
  /** True while the patient is in cardiac arrest on the driver's side. */
  isInArrest?: boolean;
  /** Arrest-run state: CPR running, shock count, drug counts, cycle number. */
  arrestState?: {
    cprRunning?: boolean;
    shockCount?: number;
    adrenalineDoses?: number;
    amiodaroneDoses?: number;
    cycleNumber?: number;
  };
  /**
   * Ventilator settings the driver chose — students need to see the mode
   * / tidal volume / FiO2 / PEEP the instructor set so their monitor's
   * SpO2 trajectory and vent-related cues stay in sync.
   */
  ventilatorSettings?: {
    mode: string;
    tidalVolumeMl: number;
    respiratoryRate: number;
    fio2Percent: number;
    peepCmH2O: number;
    ieRatio: string;
  };
  /** BVM rate the driver picked (10/12/20/25 bpm). */
  bvmVentilationRate?: number | null;
  /**
   * Ordered timeline of arrest events the driver has logged
   * (CPR start/pause, shocks, drug doses, rhythm checks, ROSC).
   * Broadcasting this lets spectators see the ACLS progression as it
   * happens rather than reconstructing it from counters.
   */
  arrestTimeline?: Array<{
    time: number;
    event: string;
    type: string;
  }>;
  /** Transcutaneous pacer state. Rate in ppm, output in mA. */
  pacerState?: {
    active: boolean;
    rate: number;
    output: number;
  };
}

/**
 * Broadcast event vocabulary. Everything that moves through the session
 * goes through this union so both sides stay in lockstep.
 */
export type ClassroomBroadcast =
  | { kind: 'case_started'; caseId: string; startedAt: string }
  | { kind: 'case_ended'; endedAt: string }
  | { kind: 'session_ended'; reason?: string }
  | { kind: 'instructor_message'; text: string }
  | { kind: 'student_action'; participant: string; action: string; timestamp: string }
  | { kind: 'student_score'; participant: string; score: number }
  /** Partial update to the shared case state. Sent by the driver. */
  | { kind: 'state_patch'; patch: SharedCaseState; fromKey: string }
  /** Full snapshot of the shared case state. Used to bootstrap late-joiners. */
  | { kind: 'state_snapshot'; state: SharedCaseState; fromKey: string }
  /** A participant asking the driver for a fresh snapshot on join. */
  | { kind: 'state_request'; askerKey: string }
  /**
   * Instructor setting who has driving privileges. `toKeys` is the set of
   * presence keys allowed to mutate. Empty array = nobody (pause); a single
   * key = solo driver; multiple keys = a group working together; including
   * every connected student's key = "open floor" / everyone-can-treat mode.
   */
  | { kind: 'driver_set'; toKeys: string[]; fromKey: string }
  /** A chat message sent to everyone in the session. */
  | {
      kind: 'chat_message';
      fromKey: string;
      fromName: string;
      fromRole: ClassroomRole;
      text: string;
      sentAt: string;
    }
  /**
   * Timer countdown announcement from the instructor. `endsAt` is the ISO
   * timestamp the case auto-ends. Broadcast once at case start and can be
   * re-sent if the instructor adjusts duration mid-case.
   */
  | { kind: 'timer_set'; endsAt: string; fromKey: string }
  /**
   * WebRTC signaling — offer / answer / ICE candidate exchange. The
   * classroom realtime channel doubles as a WebRTC signaling bus so the
   * voice feature adds zero new infrastructure.
   */
  | { kind: 'webrtc_offer'; fromKey: string; toKey: string; sdp: string }
  | { kind: 'webrtc_answer'; fromKey: string; toKey: string; sdp: string }
  | {
      kind: 'webrtc_ice';
      fromKey: string;
      toKey: string;
      candidate: RTCIceCandidateInit | null;
    }
  /**
   * Voice broadcast state — tells every participant who's currently
   * transmitting audio so UIs can show a "speaking" indicator.
   */
  | { kind: 'voice_state'; fromKey: string; broadcasting: boolean };

// ============================================================================
// Helpers
// ============================================================================

/**
 * Merge a partial shared-state update into the current aggregate.
 *
 * Simple shallow merge with two carve-outs: `appliedTreatments` replaces
 * wholesale (the driver always sends the latest ordered list, so replace
 * is correct and cheaper than trying to dedupe by id), and `vitals` /
 * `transportDecision` merge field-by-field (preserves any keys the
 * driver didn't touch).
 */
function mergePatch(current: SharedCaseState, patch: SharedCaseState): SharedCaseState {
  const next: SharedCaseState = { ...current };
  if (patch.vitals !== undefined) next.vitals = { ...current.vitals, ...patch.vitals };
  if (patch.appliedTreatments !== undefined) next.appliedTreatments = patch.appliedTreatments;
  if (patch.completedItems !== undefined) next.completedItems = patch.completedItems;
  if (patch.assessmentPerformed !== undefined) next.assessmentPerformed = patch.assessmentPerformed;
  if (patch.caseStartedAt !== undefined) next.caseStartedAt = patch.caseStartedAt;
  if (patch.monitorRevealedVitals !== undefined) next.monitorRevealedVitals = patch.monitorRevealedVitals;
  if (patch.transportDecision !== undefined) next.transportDecision = { ...current.transportDecision, ...patch.transportDecision };
  if (patch.currentRhythm !== undefined) next.currentRhythm = patch.currentRhythm;
  if (patch.isInArrest !== undefined) next.isInArrest = patch.isInArrest;
  if (patch.arrestState !== undefined) next.arrestState = { ...current.arrestState, ...patch.arrestState };
  if (patch.ventilatorSettings !== undefined) next.ventilatorSettings = patch.ventilatorSettings;
  if (patch.bvmVentilationRate !== undefined) next.bvmVentilationRate = patch.bvmVentilationRate;
  // Arrest timeline is append-only — replace wholesale so the driver's
  // authoritative order is preserved. The spectator-side mirror only
  // ever sets, never mutates, so we don't need smart merging.
  if (patch.arrestTimeline !== undefined) next.arrestTimeline = patch.arrestTimeline;
  if (patch.pacerState !== undefined) next.pacerState = patch.pacerState;
  return next;
}

/** Generate a 6-digit classroom PIN. Zero-padded, never leading zero. */
function generatePin(): string {
  // 100000..999999 — avoids leading zeros so students never wonder whether
  // they have to type the "0". 900,000 possibilities is more than enough
  // for short-lived classroom sessions (collisions are retried).
  return String(Math.floor(100000 + Math.random() * 900000));
}

function channelName(pin: string): string {
  return `classroom:${pin}`;
}

// ============================================================================
// Hook
// ============================================================================

export interface UseClassroomSessionResult {
  /** `false` when Supabase isn't configured — UI should hide classroom entry points. */
  supported: boolean;
  status: ClassroomStatus;
  error: string | null;
  role: ClassroomRole | null;
  session: ClassroomSessionRow | null;
  participants: ClassroomParticipant[];
  lastBroadcast: ClassroomBroadcast | null;
  /**
   * Presence key of THIS client. Stable for the lifetime of the hook
   * instance. Used to detect "am I the driver?" without a round-trip.
   */
  selfKey: string;
  /**
   * Set of presence keys that currently hold driving privileges. The
   * instructor starts as the only driver; they can broaden to a group
   * (multiple students co-driving), pick a single student, or open the
   * floor (everyone). Empty means "paused, nobody can act".
   */
  driverKeys: string[];
  /**
   * @deprecated Prefer `driverKeys.includes(...)`. Kept for back-compat
   * while callers migrate; returns the first key in the set or null.
   */
  currentDriverKey: string | null;
  /** Convenience: true when this client is currently a driver. */
  isDriver: boolean;

  /** Instructor: open a new lobby and return the PIN students should type. */
  createSession: (instructorName: string) => Promise<ClassroomSessionRow | null>;
  /** Student: join an existing lobby by PIN. */
  joinSession: (pin: string, displayName: string) => Promise<ClassroomSessionRow | null>;
  /** Instructor: broadcast `case_started` and flip the DB row status to 'running'. */
  startCase: (caseId: string, caseSnapshot?: unknown) => Promise<void>;
  /** Instructor: broadcast `case_ended`. Keeps the session row open for a second case. */
  endCase: () => Promise<void>;
  /** Either side: leave the channel. Instructor additionally marks the session 'ended'. */
  leaveSession: () => Promise<void>;
  /** Send an arbitrary broadcast event through the session's channel. */
  sendBroadcast: (payload: ClassroomBroadcast) => Promise<void>;
  /** Clear a stale error banner — call from input `onChange` so users retrying don't stare at the old message. */
  clearError: () => void;

  /**
   * Currently-live case ID (set by `case_started`, cleared by `case_ended`
   * / `session_ended`). Exposed as a durable field on the hook rather
   * than requiring subscribers to parse `lastBroadcast`, because
   * back-to-back Supabase broadcast frames can clobber `lastBroadcast`
   * within a single React batch and the listener never sees the
   * lifecycle event at all. This is what ClassroomJoin should gate its
   * case-panel rendering on.
   */
  liveCaseId: string | null;
  /** Timestamp the current case went live, so late-joiners can anchor timers. */
  liveCaseStartedAt: string | null;
  /** Running aggregate of the shared case state, rebuilt from every state_patch. */
  sharedState: SharedCaseState;
  /** Driver-only: push a partial state update to all participants. No-op for non-drivers. */
  broadcastStatePatch: (patch: SharedCaseState) => Promise<void>;
  /** Driver-only: push a full snapshot (in response to `state_request`). */
  broadcastStateSnapshot: (state: SharedCaseState) => Promise<void>;
  /** Late-joiner: ask the current driver for a fresh snapshot. */
  requestStateSnapshot: () => Promise<void>;

  /** Instructor: set the driver set explicitly. Pass [] to pause (nobody drives). */
  setDrivers: (toKeys: string[]) => Promise<void>;
  /** Instructor: hand driving privileges to a single student (replaces current set). */
  giveControl: (toKey: string) => Promise<void>;
  /** Instructor: add another participant to the current driver set (for groups). */
  addDriver: (toKey: string) => Promise<void>;
  /** Instructor: reclaim driving privileges (makes instructor the sole driver). */
  takeControl: () => Promise<void>;

  /**
   * Rolling list of chat messages sent in this session. Kept capped at the
   * last 200 so a long session doesn't balloon memory. Newest last.
   */
  chatMessages: Array<{
    id: string;
    fromKey: string;
    fromName: string;
    fromRole: ClassroomRole;
    text: string;
    sentAt: string;
  }>;
  /** Send a chat message to everyone in the session. */
  sendChat: (text: string) => Promise<void>;

  /** ISO timestamp the case is scheduled to auto-end, or null for no timer. */
  timerEndsAt: string | null;
  /** Instructor: set / clear the auto-end timer. Pass 0 / null to disable. */
  setTimer: (durationMinutes: number | null) => Promise<void>;
}

export function useClassroomSession(): UseClassroomSessionResult {
  const supported = isSupabaseConfigured();

  const [status, setStatus] = useState<ClassroomStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<ClassroomRole | null>(null);
  const [session, setSession] = useState<ClassroomSessionRow | null>(null);
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);
  const [lastBroadcast, setLastBroadcast] = useState<ClassroomBroadcast | null>(null);
  // Aggregated shared case state rebuilt from every state_patch we see.
  // Starts empty; fills as the driver broadcasts updates or a late-joiner
  // requests a snapshot.
  const [sharedState, setSharedState] = useState<SharedCaseState>({});
  const [liveCaseId, setLiveCaseId] = useState<string | null>(null);
  const [liveCaseStartedAt, setLiveCaseStartedAt] = useState<string | null>(null);
  // Set of presence keys with driving privileges. The instructor claims
  // the sole driver slot when a case starts; they can then broaden the
  // set via setDrivers/addDriver/giveControl.
  const [driverKeys, setDriverKeysState] = useState<string[]>([]);
  // Rolling chat log for the session. Capped at 200 most-recent messages.
  const [chatMessages, setChatMessages] = useState<UseClassroomSessionResult['chatMessages']>([]);
  // ISO timestamp the case auto-ends, or null when no timer is set.
  const [timerEndsAt, setTimerEndsAtState] = useState<string | null>(null);

  // Mutable refs so callbacks don't capture stale state.
  const channelRef = useRef<RealtimeChannel | null>(null);
  const selfKeyRef = useRef<string>(crypto.randomUUID());
  const sessionRef = useRef<ClassroomSessionRow | null>(null);
  const roleRef = useRef<ClassroomRole | null>(null);
  const sharedStateRef = useRef<SharedCaseState>({});
  const driverKeysRef = useRef<string[]>([]);

  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { roleRef.current = role; }, [role]);
  useEffect(() => { sharedStateRef.current = sharedState; }, [sharedState]);
  useEffect(() => { driverKeysRef.current = driverKeys; }, [driverKeys]);

  // --------------------------------------------------------------------------
  // Channel subscription
  // --------------------------------------------------------------------------

  // Single attempt at subscribing to a Supabase realtime channel. Wrapped by
  // `attachChannel` which retries once on transient timeouts (common on the
  // first connection from a cold client).
  const attachChannelOnce = useCallback(
    (pin: string, displayName: string, asRole: ClassroomRole): Promise<void> =>
      new Promise((resolve, reject) => {
        const supa = getSupabaseClient();
        if (!supa) {
          reject(new Error('classroom.errors.notConfigured'));
          return;
        }

        // Clean up any previous channel before subscribing to a new one.
        if (channelRef.current) {
          supa.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        const channel = supa.channel(channelName(pin), {
          config: {
            presence: { key: selfKeyRef.current },
            broadcast: { self: false, ack: false },
          },
        });

        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<ClassroomParticipant>();
          // Supabase presence groups by the presence key; flatten to an
          // array and de-dup by key (last write wins).
          const flat: ClassroomParticipant[] = [];
          for (const [key, entries] of Object.entries(state)) {
            if (entries.length === 0) continue;
            const latest = entries[entries.length - 1] as ClassroomParticipant;
            flat.push({ ...latest, key });
          }
          setParticipants(flat);
        });

        channel.on('broadcast', { event: 'classroom' }, (msg) => {
          const payload = msg.payload as ClassroomBroadcast;
          setLastBroadcast(payload);

          // Intercept shared-state + control events up front so every
          // participant's UI reflects them without each caller having to
          // re-handle them. Components can still react via `lastBroadcast`.
          if (payload.kind === 'state_patch') {
            setSharedState(prev => mergePatch(prev, payload.patch));
          } else if (payload.kind === 'state_snapshot') {
            setSharedState(payload.state);
          } else if (payload.kind === 'state_request') {
            // Only a driver responds. Use the ref so this callback stays
            // stable across re-renders. In a multi-driver setup we pick
            // the first driver; they all have the same sharedState anyway.
            if (driverKeysRef.current.includes(selfKeyRef.current)) {
              queueMicrotask(() => {
                void channel.send({
                  type: 'broadcast',
                  event: 'classroom',
                  payload: {
                    kind: 'state_snapshot',
                    state: sharedStateRef.current,
                    fromKey: selfKeyRef.current,
                  } satisfies ClassroomBroadcast,
                });
              });
            }
          } else if (payload.kind === 'driver_set') {
            setDriverKeysState(payload.toKeys);
          } else if (payload.kind === 'chat_message') {
            setChatMessages(prev => [
              ...prev.slice(-199),
              {
                id: `${payload.fromKey}-${payload.sentAt}`,
                fromKey: payload.fromKey,
                fromName: payload.fromName,
                fromRole: payload.fromRole,
                text: payload.text,
                sentAt: payload.sentAt,
              },
            ]);
          } else if (payload.kind === 'timer_set') {
            setTimerEndsAtState(payload.endsAt);
          } else if (payload.kind === 'case_started') {
            // Durable lifecycle state — ClassroomJoin can gate its case
            // panel on `liveCaseId` without risking the broadcast being
            // clobbered by a later state_patch in the same React batch.
            // (That's the bug that kept students stuck on "Waiting for
            //  instructor to start a case…" even though the instructor
            //  HAD started — case_started and a flood of state_patches
            //  arrived in the same tick, and lastBroadcast only surfaced
            //  the state_patch to the useEffect.)
            setLiveCaseId(payload.caseId);
            setLiveCaseStartedAt(payload.startedAt);
          } else if (payload.kind === 'case_ended') {
            // Case boundary — clear shared + timer state so the next case
            // starts with a clean slate on every client.
            setSharedState({});
            setTimerEndsAtState(null);
            setDriverKeysState([]);
            setLiveCaseId(null);
            setLiveCaseStartedAt(null);
          } else if (payload.kind === 'session_ended') {
            setLiveCaseId(null);
            setLiveCaseStartedAt(null);
          }
        });

        channel.subscribe(async (subscribeStatus) => {
          if (subscribeStatus === 'SUBSCRIBED') {
            const me: ClassroomParticipant = {
              key: selfKeyRef.current,
              displayName,
              role: asRole,
              joinedAt: new Date().toISOString(),
            };
            await channel.track(me);
            channelRef.current = channel;
            resolve();
          } else if (subscribeStatus === 'CHANNEL_ERROR' || subscribeStatus === 'TIMED_OUT') {
            // Throw the i18n key, not the raw status code. The UI layer
            // resolves it via t(). A string-valued error.message is the path
            // of least resistance: React components `catch(e)` and call t(e.message).
            supa.removeChannel(channel);
            reject(new Error(subscribeStatus === 'TIMED_OUT'
              ? 'classroom.errors.realtimeTimeout'
              : 'classroom.errors.realtimeFailed'));
          }
        });
      }),
    [],
  );

  // Public: subscribe with up to 4 attempts and exponential backoff.
  //
  // Supabase realtime has two transient failure modes we care about:
  //   - TIMED_OUT: the WebSocket upgrade raced with page setup, or the mobile
  //     network is slow on classroom day.
  //   - CHANNEL_ERROR: the realtime server briefly rejects subscribes, usually
  //     during a free-tier project spin-up after idle. Also transient.
  //
  // Both resolve within a few seconds of warm-up. We escalate the backoff
  // aggressively (0 / 2s / 5s / 10s) so the 4th attempt lands after the
  // realtime container has had 17s to warm up — past the observed cold-start.
  const attachChannel = useCallback(
    async (pin: string, displayName: string, asRole: ClassroomRole): Promise<void> => {
      const backoffs = [0, 2000, 5000, 10000];
      const transient = new Set([
        'classroom.errors.realtimeTimeout',
        'classroom.errors.realtimeFailed',
      ]);
      let lastError: unknown = null;
      for (const delay of backoffs) {
        if (delay > 0) await new Promise(r => setTimeout(r, delay));
        try {
          await attachChannelOnce(pin, displayName, asRole);
          return;
        } catch (e) {
          lastError = e;
          const msg = e instanceof Error ? e.message : '';
          // Non-transient (e.g. notConfigured) → bail immediately.
          if (!transient.has(msg)) throw e;
        }
      }
      throw lastError;
    },
    [attachChannelOnce],
  );

  // --------------------------------------------------------------------------
  // Instructor: create session
  // --------------------------------------------------------------------------

  const createSession = useCallback(
    async (instructorName: string): Promise<ClassroomSessionRow | null> => {
      if (!supported) return null;
      const supa = getSupabaseClient();
      if (!supa) return null;

      setStatus('connecting');
      setError(null);
      setRole('instructor');
      roleRef.current = 'instructor';

      // Retry-on-collision: PINs are short so collisions are possible, but
      // 5 attempts against 900k possibilities is effectively guaranteed.
      let created: ClassroomSessionRow | null = null;
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const pin = generatePin();
        const { data, error: insertError } = await supa
          .from('classroom_sessions')
          .insert({ pin, instructor_name: instructorName, status: 'lobby' })
          .select()
          .single();

        if (insertError) {
          lastErr = insertError;
          // Unique-violation on PIN → retry. Anything else → give up.
          if (insertError.code !== '23505') break;
          continue;
        }
        created = data as ClassroomSessionRow;
        break;
      }

      if (!created) {
        const msg = lastErr instanceof Error ? lastErr.message : 'classroom.errors.createFailed';
        setError(msg);
        setStatus('error');
        return null;
      }

      setSession(created);
      try {
        await attachChannel(created.pin, instructorName, 'instructor');
        setStatus('lobby');
        return created;
      } catch (e) {
        // Channel subscribe failed even after retry. Tear down the row so we
        // don't leave a dangling 'lobby' session that students could join but
        // never see progress on. Best-effort — if this PATCH fails the pg_cron
        // janitor will clean it up within 24h.
        try {
          await supa
            .from('classroom_sessions')
            .update({ status: 'ended', ended_at: new Date().toISOString() })
            .eq('id', created.id);
        } catch { /* swallow */ }
        setSession(null);
        setError(e instanceof Error ? e.message : 'classroom.errors.realtimeFailed');
        setStatus('error');
        // Return null so callers don't fire a "lobby opened!" toast for a
        // session that never actually came online.
        return null;
      }
    },
    [supported, attachChannel],
  );

  // --------------------------------------------------------------------------
  // Student: join by PIN
  // --------------------------------------------------------------------------

  const joinSession = useCallback(
    async (pin: string, displayName: string): Promise<ClassroomSessionRow | null> => {
      if (!supported) return null;
      const supa = getSupabaseClient();
      if (!supa) return null;

      const normalisedPin = pin.trim();
      if (!/^\d{6}$/.test(normalisedPin)) {
        setError('classroom.errors.pinInvalid');
        setStatus('error');
        return null;
      }

      setStatus('connecting');
      setError(null);
      setRole('student');
      roleRef.current = 'student';

      const { data, error: selectError } = await supa
        .from('classroom_sessions')
        .select('*')
        .eq('pin', normalisedPin)
        .neq('status', 'ended')
        .maybeSingle();

      if (selectError || !data) {
        setError(selectError?.message || 'classroom.errors.notFound');
        setStatus('error');
        return null;
      }

      const row = data as ClassroomSessionRow;
      setSession(row);

      try {
        await attachChannel(row.pin, displayName, 'student');
        setStatus(row.status === 'running' ? 'running' : 'lobby');
      } catch (e) {
        setSession(null);
        setError(e instanceof Error ? e.message : 'classroom.errors.realtimeFailed');
        setStatus('error');
      }
      return row;
    },
    [supported, attachChannel],
  );

  // --------------------------------------------------------------------------
  // Broadcast helpers
  // --------------------------------------------------------------------------

  const clearError = useCallback(() => {
    // Drop any stale banner + reset status away from 'error' so the join
    // button (and similar gated UI) becomes usable again without a reload.
    setError(null);
    setStatus(prev => (prev === 'error' ? 'idle' : prev));
  }, []);

  const sendBroadcast = useCallback(async (payload: ClassroomBroadcast) => {
    const channel = channelRef.current;
    if (!channel) return;
    await channel.send({ type: 'broadcast', event: 'classroom', payload });
  }, []);

  const startCase = useCallback(
    async (caseId: string, caseSnapshot?: unknown) => {
      const supa = getSupabaseClient();
      const current = sessionRef.current;
      if (!supa || !current) return;

      const startedAt = new Date().toISOString();
      const { data, error: upErr } = await supa
        .from('classroom_sessions')
        .update({
          case_id: caseId,
          case_snapshot: (caseSnapshot ?? null) as never,
          status: 'running',
          started_at: startedAt,
        })
        .eq('id', current.id)
        .select()
        .single();

      if (!upErr && data) {
        setSession(data as ClassroomSessionRow);
      }
      setStatus('running');
      // Instructor claims the sole driver slot by default when a case
      // starts. Control can be broadened via setDrivers / giveControl.
      const soloInstructorKeys = [selfKeyRef.current];
      setDriverKeysState(soloInstructorKeys);
      // Broadcast the driver set so every participant knows who's driving.
      await sendBroadcast({
        kind: 'driver_set',
        toKeys: soloInstructorKeys,
        fromKey: selfKeyRef.current,
      });
      // Reset shared state so the new case starts clean.
      setSharedState({ caseStartedAt: startedAt });
      // Mirror the lifecycle state locally on the instructor too so both
      // sides read from the same source of truth.
      setLiveCaseId(caseId);
      setLiveCaseStartedAt(startedAt);
      await sendBroadcast({ kind: 'case_started', caseId, startedAt });
    },
    [sendBroadcast],
  );

  // ------ Shared-state + control helpers ----------------------------------
  // All four of these are thin wrappers around sendBroadcast. They exist as
  // named methods so callers (spectator view, broadcast bar) don't need to
  // know the protocol vocabulary — the hook owns the shape.

  // Coalesce high-frequency patches (vitals tweening up to 20×/sec) into at
  // most one broadcast every 200 ms. The local sharedState is still updated
  // optimistically on every call so the driver's own UI stays responsive.
  // Supabase realtime is configured for eventsPerSecond: 20, and above ~5
  // broadcasts/sec we start to see events queue or drop — students saw
  // stale vitals as a result. The pending merge buffer accumulates updates
  // across the throttle window so nothing is lost, just batched.
  const pendingPatchRef = useRef<SharedCaseState | null>(null);
  const patchFlushTimerRef = useRef<number | null>(null);
  const flushPatch = useCallback(async () => {
    const next = pendingPatchRef.current;
    pendingPatchRef.current = null;
    patchFlushTimerRef.current = null;
    if (!next) return;
    await sendBroadcast({
      kind: 'state_patch',
      patch: next,
      fromKey: selfKeyRef.current,
    });
  }, [sendBroadcast]);

  const broadcastStatePatch = useCallback(async (patch: SharedCaseState) => {
    // Optimistic local merge — driver sees their own action immediately.
    setSharedState(prev => mergePatch(prev, patch));
    // Buffer the patch and schedule a single flush within the throttle window.
    pendingPatchRef.current = pendingPatchRef.current
      ? mergePatch(pendingPatchRef.current, patch)
      : { ...patch };
    if (patchFlushTimerRef.current == null) {
      patchFlushTimerRef.current = window.setTimeout(() => { void flushPatch(); }, 200);
    }
  }, [flushPatch]);

  const broadcastStateSnapshot = useCallback(async (state: SharedCaseState) => {
    setSharedState(state);
    await sendBroadcast({
      kind: 'state_snapshot',
      state,
      fromKey: selfKeyRef.current,
    });
  }, [sendBroadcast]);

  const requestStateSnapshot = useCallback(async () => {
    await sendBroadcast({
      kind: 'state_request',
      askerKey: selfKeyRef.current,
    });
  }, [sendBroadcast]);

  const setDrivers = useCallback(async (toKeys: string[]) => {
    // Local state updates immediately so the instructor's own UI flips
    // at once; everyone else hears about it via the broadcast.
    setDriverKeysState(toKeys);
    await sendBroadcast({
      kind: 'driver_set',
      toKeys,
      fromKey: selfKeyRef.current,
    });
  }, [sendBroadcast]);

  const giveControl = useCallback(async (toKey: string) => {
    // Single-student handoff — replaces the driver set with just that key.
    await setDrivers([toKey]);
  }, [setDrivers]);

  const addDriver = useCallback(async (toKey: string) => {
    const existing = driverKeysRef.current;
    if (existing.includes(toKey)) return;
    await setDrivers([...existing, toKey]);
  }, [setDrivers]);

  const takeControl = useCallback(async () => {
    await setDrivers([selfKeyRef.current]);
  }, [setDrivers]);

  const sendChat = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Identify self via the participant list — presence track will have
    // set the display name. Fall back to a stable label if missing.
    const me = participants.find(p => p.key === selfKeyRef.current);
    const fromName = me?.displayName || (roleRef.current === 'instructor' ? 'Instructor' : 'Student');
    const fromRole: ClassroomRole = roleRef.current ?? 'student';
    const sentAt = new Date().toISOString();
    // Append locally first so the sender sees their message instantly
    // (broadcasts use { self: false } so we don't get our own back).
    setChatMessages(prev => [
      ...prev.slice(-199),
      { id: `${selfKeyRef.current}-${sentAt}`, fromKey: selfKeyRef.current, fromName, fromRole, text: trimmed, sentAt },
    ]);
    await sendBroadcast({
      kind: 'chat_message',
      fromKey: selfKeyRef.current,
      fromName,
      fromRole,
      text: trimmed,
      sentAt,
    });
  }, [participants, sendBroadcast]);

  const setTimer = useCallback(async (durationMinutes: number | null) => {
    if (!durationMinutes || durationMinutes <= 0) {
      setTimerEndsAtState(null);
      // There's no dedicated "clear timer" broadcast kind — sending a
      // timer_set with an already-past endsAt has the same effect.
      await sendBroadcast({
        kind: 'timer_set',
        endsAt: new Date(0).toISOString(),
        fromKey: selfKeyRef.current,
      });
      return;
    }
    const endsAt = new Date(Date.now() + durationMinutes * 60_000).toISOString();
    setTimerEndsAtState(endsAt);
    await sendBroadcast({
      kind: 'timer_set',
      endsAt,
      fromKey: selfKeyRef.current,
    });
  }, [sendBroadcast]);

  const endCase = useCallback(async () => {
    const endedAt = new Date().toISOString();
    const supa = getSupabaseClient();
    const current = sessionRef.current;

    // Clear our local aggregate first so the instructor's own UI wipes
    // between cases even before the broadcast round-trips.
    setSharedState({});

    // Broadcast first so every student sees the case wind down in real time.
    await sendBroadcast({ kind: 'case_ended', endedAt });

    // Flip the DB row back to 'lobby' so late-joiners don't get re-hydrated
    // with a running case that already ended, and so the instructor view
    // re-renders out of the teaching layout back into the case-picker.
    if (supa && current) {
      const { data } = await supa
        .from('classroom_sessions')
        .update({ status: 'lobby', case_id: null, case_snapshot: null })
        .eq('id', current.id)
        .select()
        .single();
      if (data) setSession(data as ClassroomSessionRow);
    }
    setStatus('lobby'); // back to lobby — instructor can run another case
  }, [sendBroadcast]);

  const leaveSession = useCallback(async () => {
    const supa = getSupabaseClient();
    const channel = channelRef.current;
    const current = sessionRef.current;
    const currentRole = roleRef.current;

    if (channel) {
      try { await channel.untrack(); } catch { /* noop */ }
      if (supa) supa.removeChannel(channel);
      channelRef.current = null;
    }

    // Instructor ends the whole session for everyone. Students just quietly leave.
    if (currentRole === 'instructor' && current && supa) {
      await sendBroadcast({ kind: 'session_ended' });
      await supa
        .from('classroom_sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', current.id);
    }

    setSession(null);
    setParticipants([]);
    setRole(null);
    setStatus('idle');
    setError(null);
    setLastBroadcast(null);
  }, [sendBroadcast]);

  // Cleanup on unmount — prevents dangling channels.
  useEffect(() => {
    return () => {
      const supa = getSupabaseClient();
      if (channelRef.current && supa) {
        supa.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // Graceful tab-close / page-hide handler.
  //
  // Without this, an instructor who closes their tab leaves the session in
  // 'lobby'/'running' state in the DB and students stuck on the "Waiting…"
  // screen until the 24h pg_cron cleanup fires. We can't run an async DB
  // update reliably from `beforeunload` — but `navigator.sendBeacon` is
  // designed for exactly this: a tiny fire-and-forget POST that the browser
  // flushes after the document is gone.
  //
  // We target Supabase's PATCH endpoint directly via sendBeacon's blob form
  // (with the right headers encoded via a Blob MIME type). For students we
  // also opportunistically untrack presence so the instructor's list drops
  // them immediately.
  useEffect(() => {
    const onBeforeUnload = () => {
      const channel = channelRef.current;
      const current = sessionRef.current;
      const currentRole = roleRef.current;

      // Students: best-effort untrack so the instructor sees them leave.
      if (channel) {
        try { channel.untrack(); } catch { /* noop */ }
      }

      // Instructors: flip the row to 'ended' via sendBeacon.
      if (currentRole === 'instructor' && current) {
        const url = getSupabaseUrl();
        const key = getSupabaseAnonKey();
        if (!url || !key) return;
        const endpoint = `${url}/rest/v1/classroom_sessions?id=eq.${current.id}`;
        const body = JSON.stringify({
          status: 'ended',
          ended_at: new Date().toISOString(),
        });
        // sendBeacon won't let us set custom headers directly, so we smuggle
        // the apikey + auth via the URL + a crafted Blob. On modern browsers
        // we can use `fetch(..., { keepalive: true })` instead, which *does*
        // support headers and runs after unload.
        try {
          fetch(endpoint, {
            method: 'PATCH',
            keepalive: true,
            headers: {
              'Content-Type': 'application/json',
              apikey: key,
              Authorization: `Bearer ${key}`,
              Prefer: 'return=minimal',
            },
            body,
          });
        } catch { /* best-effort */ }
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    // Safari fires pagehide reliably on tab-close where beforeunload doesn't.
    window.addEventListener('pagehide', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', onBeforeUnload);
    };
  }, []);

  const isDriver = driverKeys.includes(selfKeyRef.current);
  const currentDriverKey = driverKeys[0] ?? null; // back-compat

  return useMemo(
    () => ({
      supported,
      status,
      error,
      role,
      session,
      participants,
      lastBroadcast,
      selfKey: selfKeyRef.current,
      driverKeys,
      currentDriverKey,
      isDriver,
      liveCaseId,
      liveCaseStartedAt,
      sharedState,
      createSession,
      joinSession,
      startCase,
      endCase,
      leaveSession,
      sendBroadcast,
      clearError,
      broadcastStatePatch,
      broadcastStateSnapshot,
      requestStateSnapshot,
      setDrivers,
      giveControl,
      addDriver,
      takeControl,
      chatMessages,
      sendChat,
      timerEndsAt,
      setTimer,
    }),
    [supported, status, error, role, session, participants, lastBroadcast,
      driverKeys, currentDriverKey, isDriver, liveCaseId, liveCaseStartedAt, sharedState,
      createSession, joinSession, startCase, endCase, leaveSession, sendBroadcast, clearError,
      broadcastStatePatch, broadcastStateSnapshot, requestStateSnapshot,
      setDrivers, giveControl, addDriver, takeControl,
      chatMessages, sendChat, timerEndsAt, setTimer],
  );
}
