/**
 * Supabase client — lazy singleton.
 *
 * Only imported by the classroom feature (useClassroomSession + classroom
 * components). The role-selection screen uses `supabaseConfig.ts` for the
 * bare env-var check so single-player users never pay the @supabase/supabase-js
 * bundle cost.
 *
 * Usage:
 *   import { getSupabaseClient } from '@/lib/supabase';
 *   const supa = getSupabaseClient();
 *   if (!supa) return; // Supabase env vars missing
 *   const { data } = await supa.from('classroom_sessions').select();
 *
 * Security: only the anon key ever lives here. RLS policies on the Supabase
 * project enforce actual per-row access. Never put service-role keys or DB
 * passwords in a VITE_* variable — anything prefixed VITE_ ships in the
 * client bundle.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseUrl,
  getSupabaseAnonKey,
  isSupabaseConfigured,
} from './supabaseConfig';

// Re-export the config check so existing callers keep working.
export { isSupabaseConfigured };

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!_client) {
    _client = createClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
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
