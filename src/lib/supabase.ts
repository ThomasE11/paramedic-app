/**
 * Supabase client singleton.
 *
 * Used by the classroom multiplayer feature (Phase 4). Only ever imports the
 * public anon key — RLS policies on the database enforce actual per-row
 * access. Never put service-role keys or database passwords here.
 *
 * Usage:
 *   import { supabase, isSupabaseConfigured } from '@/lib/supabase';
 *   if (!isSupabaseConfigured()) return null;
 *   const { data, error } = await supabase.from('classroom_sessions').select();
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when both env vars are present. Classroom features gracefully degrade
 * (hide entry points, show a helpful message) when this returns false.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Lazily-constructed client. We deliberately don't throw when env vars are
 * missing — the rest of the app (single-player mode) must keep working.
 */
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!_client) {
    _client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        // We don't use Supabase auth — students join with a PIN, not an account.
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        // Bump max events/sec to handle live vital-sign updates during a case.
        params: { eventsPerSecond: 20 },
      },
    });
  }
  return _client;
}

/** Convenience export — may be null when env vars are missing. */
export const supabase: SupabaseClient | null = getSupabaseClient();
