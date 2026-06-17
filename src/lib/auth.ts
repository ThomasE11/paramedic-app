/**
 * useAuth — optional magic-link accounts for the classroom.
 *
 * Passwordless: the user enters their email, receives a magic link, and is
 * signed in when they click it (Supabase `signInWithOtp`). Sessions persist
 * across reloads (see supabase.ts auth config), so a returning student stays
 * logged in and their saved results follow them.
 *
 * Degrades gracefully: when Supabase isn't configured, `supported` is false
 * and the classroom continues to work anonymously via PINs.
 */

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface UseAuthResult {
  /** False when Supabase isn't configured — callers should skip the gate. */
  supported: boolean;
  /** The signed-in user, or null. */
  user: User | null;
  /** Best-effort display name (metadata → email local part). */
  displayName: string;
  /** True until the initial session check resolves. */
  loading: boolean;
  /** Send a magic link. Optionally seed the display name for new accounts. */
  signInWithMagicLink: (email: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

function nameFor(user: User | null): string {
  if (!user) return '';
  const meta = (user.user_metadata ?? {}) as { display_name?: string };
  if (meta.display_name) return meta.display_name;
  return user.email ? user.email.split('@')[0] : 'User';
}

export function useAuth(): UseAuthResult {
  const supported = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(supported);

  useEffect(() => {
    const supa = getSupabaseClient();
    if (!supa) {
      setLoading(false);
      return;
    }
    let active = true;

    supa.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supa.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = useCallback(
    async (email: string, displayName?: string): Promise<{ error: string | null }> => {
      const supa = getSupabaseClient();
      if (!supa) return { error: 'classroom.errors.notConfigured' };
      const trimmed = email.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return { error: 'Enter a valid email address.' };
      const { error } = await supa.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: window.location.origin,
          data: displayName?.trim() ? { display_name: displayName.trim() } : undefined,
        },
      });
      return { error: error ? error.message : null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    const supa = getSupabaseClient();
    if (supa) await supa.auth.signOut();
    setUser(null);
  }, []);

  return { supported, user, displayName: nameFor(user), loading, signInWithMagicLink, signOut };
}
