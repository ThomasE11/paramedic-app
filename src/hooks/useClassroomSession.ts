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

  const attachChannel = useCallback(
    (pin: string, displayName: string, asRole: ClassroomRole): Promise<void> =>
      new Promise((resolve, reject) => {
        const supa = getSupabaseClient();
        if (!supa) {
          reject(new Error('Supabase not configured'));
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
            reject(new Error(`Realtime subscribe failed: ${subscribeStatus}`));
          }
        });
      }),
    [],
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
        const msg = lastErr instanceof Error ? lastErr.message : 'Could not create classroom session';
        setError(msg);
        setStatus('error');
        return null;
      }

      setSession(created);
      try {
        await attachChannel(created.pin, instructorName, 'instructor');
        setStatus('lobby');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Realtime subscribe failed');
        setStatus('error');
      }
      return created;
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
        setError('PIN must be 6 digits');
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
        setError(selectError?.message || 'No live session with that PIN');
        setStatus('error');
        return null;
      }

      const row = data as ClassroomSessionRow;
      setSession(row);

      try {
        await attachChannel(row.pin, displayName, 'student');
        setStatus(row.status === 'running' ? 'running' : 'lobby');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Realtime subscribe failed');
        setStatus('error');
      }
      return row;
    },
    [supported, attachChannel],
  );

  // --------------------------------------------------------------------------
  // Broadcast helpers
  // --------------------------------------------------------------------------

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
    setStatus('lobby'); // back to lobby — instructor can run another case
    await sendBroadcast({ kind: 'case_ended', endedAt });
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
    }),
    [supported, status, error, role, session, participants, lastBroadcast, createSession, joinSession, startCase, endCase, leaveSession, sendBroadcast],
  );
}
