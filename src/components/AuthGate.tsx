/**
 * AuthGate — passwordless (magic-link) sign-in wall for the classroom.
 *
 * Wraps a classroom entry point. When Supabase auth is configured and the
 * user isn't signed in, it shows an email + name form that sends a magic
 * link. Once signed in (or when auth isn't configured), it renders children.
 *
 * The PIN-based classroom still functions without auth — this gate only
 * activates when Supabase is configured, so it never blocks single-player.
 */

import { useState } from 'react';
import { Mail, Loader2, CheckCircle2, ArrowLeft, LogOut, GraduationCap, Radio, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { AmbientBackground } from '@/components/AmbientBackground';

interface AuthGateProps {
  children: React.ReactNode;
  /** Shown under the title, e.g. "Sign in to host a classroom". */
  blurb?: string;
  onExit?: () => void;
}

export function AuthGate({ children, blurb, onExit }: AuthGateProps) {
  const { supported, user, loading, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth not configured → no gate, behave exactly as before (anonymous PIN).
  if (!supported) return <>{children}</>;

  // Resolving the initial session.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Signed in → render the protected content.
  if (user) return <>{children}</>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const { error } = await signInWithMagicLink(email, name);
    setSending(false);
    if (error) setError(error);
    else setSent(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4">
      <AmbientBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center py-8">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_0.76fr]">
          <section className="glass-strong hidden rounded-2xl border border-white/55 p-7 shadow-xl dark:border-white/10 lg:block">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                Classroom access
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Radio className="h-3.5 w-3.5" />
                Live session
              </span>
            </div>
            <div className="mt-8 max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Protected teaching space
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                Sign in once, then run or join the classroom from any device.
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The classroom keeps live rosters, broadcasts, chat, camera, and patient-state sync tied to the right instructor-led session.
              </p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ['Identity', 'Instructor and learner names stay clear'],
                ['Session', 'PIN rooms remain separated'],
                ['Record', 'Future debriefs can follow the same user'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border/60 bg-background/45 p-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <div className="mt-2 text-xs font-semibold text-foreground">{label}</div>
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="glass-strong w-full rounded-2xl border border-white/55 p-7 shadow-xl dark:border-white/10">
            {onExit && (
              <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}

            {sent ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold mb-1">Check your email</h2>
                <p className="text-sm text-muted-foreground">
                  We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>.
                  Open it on this device to continue.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="mt-5 text-xs text-primary hover:underline"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Sign in to continue</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {blurb ?? 'Enter your email and we’ll send a one-time sign-in link.'}
                  </p>
                </div>
                <form onSubmit={submit} className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (shown to the class)"
                    className="h-11 w-full rounded-lg border border-border bg-background/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-lg border border-border bg-background/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <Button type="submit" disabled={sending || !email} className="h-11 w-full gap-2">
                    {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <>Send sign-in link</>}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small sign-out chip for use inside authenticated classroom views. */
export function SignOutButton() {
  const { supported, user, signOut } = useAuth();
  if (!supported || !user) return null;
  return (
    <Button variant="ghost" size="sm" onClick={() => void signOut()} className="gap-1 text-xs text-muted-foreground">
      <LogOut className="h-3.5 w-3.5" /> Sign out
    </Button>
  );
}

export default AuthGate;
