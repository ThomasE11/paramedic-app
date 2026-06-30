-- ============================================================================
-- ParaMedic Studio — Accounts & Saved Results (Phase 5)
-- ============================================================================
-- Adds optional magic-link accounts on top of the PIN-based classroom.
--
--   - `profiles`        : one row per auth user (display name + role). Auto-
--                         created on signup via a trigger. Readable by any
--                         signed-in user so rosters can show real names.
--   - `student_results` : a saved graded result per completed case, owned by
--                         the student. Lets progress/grades persist across
--                         sessions and devices.
--
-- The classroom still works WITHOUT auth (anon + PIN) — these tables are
-- additive. Apply once in the Supabase SQL editor (Project → SQL → New query).
--
-- Before this works end-to-end, in the Supabase dashboard:
--   1. Authentication → Providers → Email: enable, turn ON "Email OTP /
--      Magic Link".
--   2. Authentication → URL Configuration: add your app origin(s) to
--      "Redirect URLs" (e.g. http://localhost:5173, https://<your-app>).
-- ============================================================================

BEGIN;

-- 1. Profiles ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  role         text NOT NULL DEFAULT 'student'
                 CHECK (role IN ('student', 'instructor')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Any signed-in user can read profiles (roster names). No anon access.
DROP POLICY IF EXISTS "authenticated can read profiles" ON public.profiles;
CREATE POLICY "authenticated can read profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

-- A user may create / update only their own profile row.
DROP POLICY IF EXISTS "user upserts own profile" ON public.profiles;
CREATE POLICY "user upserts own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user updates own profile" ON public.profiles;
CREATE POLICY "user updates own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-provision a profile when a new auth user is created. The display
-- name is pulled from the magic-link metadata the client passes at sign-in.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Student results ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.student_results (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  student_name   text,
  session_id     uuid REFERENCES public.classroom_sessions (id) ON DELETE SET NULL,
  case_id        text,
  case_title     text,
  category       text,
  student_year   text,
  score          int,
  band           text,
  dimensions     jsonb,
  adverse_events jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_results_student_idx
  ON public.student_results (student_id, created_at DESC);

ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;

-- A student may insert and read ONLY their own results.
DROP POLICY IF EXISTS "student inserts own results" ON public.student_results;
CREATE POLICY "student inserts own results"
  ON public.student_results FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "student reads own results" ON public.student_results;
CREATE POLICY "student reads own results"
  ON public.student_results FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

COMMIT;
