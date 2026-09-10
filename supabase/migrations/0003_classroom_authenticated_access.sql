-- ============================================================================
-- ParaMedic Studio — Classroom access for signed-in users
-- ============================================================================
-- Phase 2 added optional magic-link accounts, but the original classroom
-- policies only granted access to the `anon` Postgres role. Once a host or
-- returning learner had an authenticated Supabase session, the same PIN flow
-- was denied by RLS. Keep the room code as the capability while allowing both
-- anonymous and authenticated clients to create, find, and update live rooms.

BEGIN;

DROP POLICY IF EXISTS "anon can create sessions" ON public.classroom_sessions;
CREATE POLICY "classroom clients can create sessions"
  ON public.classroom_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon can read sessions" ON public.classroom_sessions;
CREATE POLICY "classroom clients can read sessions"
  ON public.classroom_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anon can update sessions" ON public.classroom_sessions;
CREATE POLICY "classroom clients can update sessions"
  ON public.classroom_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;
