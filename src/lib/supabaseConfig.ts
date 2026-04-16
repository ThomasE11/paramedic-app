/**
 * Supabase env-var check — zero-dependency, safe to import from the main bundle.
 *
 * This module exists *separately* from `supabase.ts` so that the role-selection
 * screen can gate classroom entry points without pulling in the whole
 * `@supabase/supabase-js` library (~100KB gzipped) for single-player users.
 *
 * The actual client lives in `supabase.ts` and is imported lazily by the
 * classroom hook / components only when the user enters a classroom flow.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when both env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** Internal accessors — used by the lazy client module. */
export function getSupabaseUrl(): string | undefined {
  return supabaseUrl;
}

export function getSupabaseAnonKey(): string | undefined {
  return supabaseAnonKey;
}
