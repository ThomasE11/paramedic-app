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
 * Broadcast event vocabulary. Everything that moves through the session
 * goes through this union so both sides stay in lockstep.
 */
export type ClassroomBroadcast =
  | { kind: 'case_started'; caseId: string; startedAt: string }
  | { kind: 'case_ended'; endedAt: string }
  | { kind: 'session_ended'; reason?: string }
  | { kind: 'instructor_message'; text: string }
  | { kind: 'student_action'; participant: string; action: string; timestamp: string }
  | { kind: 'student_score'; participant: string; score: number };

// ============================================================================
// Helpers
// ============================================================================

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

interface UseClassroomSessionResult {
  /** `false` when Supabase isn't configured — UI should hide classroom entry points. */
  supported: boolean;
  status: ClassroomStatus;
  error: string | null;
  role: ClassroomRole | null;
  session: ClassroomSessionRow | null;
  participants: ClassroomParticipant[];
  lastBroadcast: ClassroomBroadcast | null;

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
}

export function useClassroomSession(): UseClassroomSessionResult {
  const supported = isSupabaseConfigured();

  const [status, setStatus] = useState<ClassroomStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<ClassroomRole | null>(null);
  const [session, setSession] = useState<ClassroomSessionRow | null>(null);
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);
  const [lastBroadcast, setLastBroadcast] = useState<ClassroomBroadcast | null>(null);

  // Mutable refs so callbacks don't capture stale state.
  const channelRef = useRef<RealtimeChannel | null>(null);
  const selfKeyRef = useRef<string>(crypto.randomUUID());
  const sessionRef = useRef<ClassroomSessionRow | null>(null);
  const roleRef = useRef<ClassroomRole | null>(null);

  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { roleRef.current = role; }, [role]);

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
      await sendBroadcast({ kind: 'case_started', caseId, startedAt });
    },
    [sendBroadcast],
  );

  const endCase = useCallback(async () => {
    const endedAt = new Date().toISOString();
    const supa = getSupabaseClient();
    const current = sessionRef.current;

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

  return useMemo(
    () => ({
      supported,
      status,
      error,
      role,
      session,
      participants,
      lastBroadcast,
      createSession,
      joinSession,
      startCase,
      endCase,
      leaveSession,
      sendBroadcast,
      clearError,
    }),
    [supported, status, error, role, session, participants, lastBroadcast, createSession, joinSession, startCase, endCase, leaveSession, sendBroadcast, clearError],
  );
}
