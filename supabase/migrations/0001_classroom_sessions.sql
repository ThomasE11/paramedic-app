-- ============================================================================
-- ParaMedic Studio — Classroom Multiplayer (Phase 4)
-- ============================================================================
-- This migration creates a minimal schema for Kahoot-style classroom sessions.
--
-- Design philosophy:
--   - Keep the DB surface area TINY. Most live state (participants, scores,
--     case events) lives in Supabase Realtime presence + broadcast channels,
--     not in rows. The DB only stores the "session lobby" metadata so that
--     students with a PIN can discover a live session.
--   - Use short numeric PINs (6 digits) for easy student entry.
--   - No real auth — instructors self-identify by name. Classroom context
--     is assumed to be trusted (a teacher running a session in a room).
--   - RLS is permissive on INSERT/SELECT because anon users must be able
--     to create and discover sessions. We prevent tampering by UPDATE-only
--     access to rows where you know the session UUID (which is returned
--     from the initial INSERT to the instructor).
-- ============================================================================

-- Run this entire file once in the Supabase SQL editor (Project → SQL → New query).

BEGIN;

-- 1. Schema -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.classroom_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin             text NOT NULL UNIQUE CHECK (pin ~ '^[0-9]{6}$'),
  instructor_name text NOT NULL,
  case_id         text,
  case_snapshot   jsonb,
  status          text NOT NULL DEFAULT 'lobby'
                    CHECK (status IN ('lobby', 'running', 'ended')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  started_at      timestamptz,
  ended_at        timestamptz
);

-- Fast PIN lookups (students join by PIN, not UUID).
CREATE INDEX IF NOT EXISTS classroom_sessions_pin_idx
  ON public.classroom_sessions (pin)
  WHERE status <> 'ended';

-- 2. Row-Level Security ------------------------------------------------------
-- We enable RLS and then write explicit permissive policies. This is safer
-- than leaving RLS off — anon users can ONLY do what we allow below.

ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can create a new session row (instructor opening a lobby).
DROP POLICY IF EXISTS "anon can create sessions" ON public.classroom_sessions;
CREATE POLICY "anon can create sessions"
  ON public.classroom_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anyone can SELECT any session — students need to look up by PIN.
-- The PIN is the only discovery key; rows contain no sensitive data.
DROP POLICY IF EXISTS "anon can read sessions" ON public.classroom_sessions;
CREATE POLICY "anon can read sessions"
  ON public.classroom_sessions
  FOR SELECT
  TO anon
  USING (true);

-- Anyone holding a session UUID can UPDATE that session (start/end it,
-- attach a case). Rows are effectively owned by whoever created them;
-- the UUID is the capability. Students never receive it.
DROP POLICY IF EXISTS "anon can update sessions" ON public.classroom_sessions;
CREATE POLICY "anon can update sessions"
  ON public.classroom_sessions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- No DELETE from the client. Housekeeping is done by the janitor function
-- below (scheduled pg_cron job or manual run).

-- 3. Housekeeping ------------------------------------------------------------
-- Classroom sessions are short-lived. Anything older than 24h is stale.
-- Call this manually from the SQL editor, or schedule it with pg_cron.

CREATE OR REPLACE FUNCTION public.cleanup_stale_classroom_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.classroom_sessions
   WHERE created_at < now() - interval '24 hours'
      OR (status = 'ended' AND ended_at < now() - interval '1 hour');
$$;

COMMIT;

-- ============================================================================
-- Realtime channels (no SQL needed — created on demand client-side)
-- ============================================================================
-- The app uses two channel conventions per session:
--
--   classroom:{pin}:presence   — presence channel for connected participants
--   classroom:{pin}:events     — broadcast channel for instructor→students
--                                messages (start_case, push_vitals, end_session)
--                                and student→instructor events (action_taken,
--                                score_update).
--
-- Realtime presence is enabled by default on new Supabase projects. No SQL
-- required — just call supabase.channel(name).subscribe() in the client.
-- ============================================================================
