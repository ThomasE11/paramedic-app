/**
 * ClassroomLobby — instructor-side classroom UI (Phase 4)
 *
 * Flow:
 *   1. Instructor types their name and hits "Open lobby" → calls
 *      `createSession()` which mints a 6-digit PIN on the server.
 *   2. PIN is shown huge and prominent so students can read it from across
 *      a room and type it on their phones. Instructor also sees a live
 *      participant list (Supabase presence).
 *   3. Instructor picks a case from a compact dropdown and hits
 *      "Start case" → broadcasts `case_started` to every student.
 *   4. "End session" tears down the channel, marks the row `ended`, and
 *      closes the lobby.
 *
 * The component is deliberately self-contained: once started, it calls
 * `onExit` to hand control back to whatever screen launched it. It does
 * NOT render the case itself — for the MVP, the instructor continues
 * running the case in their own Educator Panel and students follow along
 * on their own devices. Richer instructor-side case rendering can be
 * layered on top later without changing this contract.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Play,
  LogOut,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useClassroomSession } from '@/hooks/useClassroomSession';
import type { UseClassroomSessionResult } from '@/hooks/useClassroomSession';
import { allCases } from '@/data/cases';
import type { StudentYear } from '@/types';

// Year levels the case library is tagged against. 'all' is a UI-only
// sentinel meaning "don't filter". Keep this in sync with the
// `StudentYear` union in src/types.
type YearFilter = StudentYear | 'all';

// Cohort order — Diploma first (primary UAE paramedic cohort), then the
// degree pathway in ascending order. Matches CaseGenerator.
const YEAR_OPTIONS: { value: YearFilter; label: string }[] = [
  { value: 'all', label: 'All year levels' },
  { value: 'diploma', label: 'Diploma' },
  { value: '1st-year', label: '1st year' },
  { value: '2nd-year', label: '2nd year' },
  { value: '3rd-year', label: '3rd year' },
  { value: '4th-year', label: '4th year' },
];

interface ClassroomLobbyProps {
  onExit: () => void;
  /**
   * Optional externally-provided session hook values. When this lobby is
   * mounted inside `ClassroomHost` (the full-case route), the host owns
   * the hook instance and passes it down here so both paths share a
   * single Supabase channel / participant list. When `undefined`, the
   * lobby calls `useClassroomSession` itself for standalone use.
   */
  sessionHook?: UseClassroomSessionResult;
}

export function ClassroomLobby({ onExit, sessionHook }: ClassroomLobbyProps) {
  const { t } = useTranslation();
  // Always call the hook unconditionally to keep hook order stable across
  // renders — but use the injected values when a parent is driving the
  // session. The local hook stays idle if it's never touched.
  const localHook = useClassroomSession();
  const {
    supported,
    status,
    error,
    session,
    participants,
    createSession,
    startCase,
    leaveSession,
    clearError,
    // `endCase` and `sendBroadcast` live on the hook but only the live-case
    // view (ClassroomHost + broadcast bar) needs them — the lobby just
    // picks a case and hands over.
  } = sessionHook ?? localHook;
  const { setTimer } = sessionHook ?? localHook;

  const [instructorName, setInstructorName] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<YearFilter>('all');
  const [copied, setCopied] = useState(false);
  // Duration in minutes. 0 / null = unlimited. Default 20 minutes —
  // feels right for a paramedic scenario teaching slot.
  const [durationMinutes, setDurationMinutes] = useState<number>(20);

  // Cases filtered by the selected year. Grouped by `category` so the
  // dropdown surfaces related scenarios together (cardiac, trauma,
  // respiratory, …) instead of a flat alphabetical list.
  const filteredCases = useMemo(() => {
    if (yearFilter === 'all') return allCases;
    return allCases.filter(c => c.yearLevels?.includes(yearFilter));
  }, [yearFilter]);

  const groupedCases = useMemo(() => {
    const groups = new Map<string, typeof allCases>();
    for (const c of filteredCases) {
      const key = c.category || 'other';
      const existing = groups.get(key);
      if (existing) existing.push(c);
      else groups.set(key, [c]);
    }
    // Alphabetise each group's contents + the category order itself so
    // the dropdown is deterministic.
    const ordered = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
    for (const [, list] of ordered) list.sort((a, b) => a.title.localeCompare(b.title));
    return ordered;
  }, [filteredCases]);

  // Clear the selection if the current pick no longer belongs to the
  // filtered list — otherwise the trigger shows a stale case title.
  const selectedStillValid = useMemo(
    () => filteredCases.some(c => c.id === selectedCaseId),
    [filteredCases, selectedCaseId],
  );

  // Only count students in the "joined" badge — we don't want the instructor
  // counted as one of their own participants.
  const students = useMemo(
    () => participants.filter(p => p.role === 'student'),
    [participants],
  );

  const selectedCase = useMemo(
    () => allCases.find(c => c.id === selectedCaseId) || null,
    [selectedCaseId],
  );

  // ------------------------------------------------------------
  // Graceful degradation when Supabase isn't configured
  // ------------------------------------------------------------
  if (!supported) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              {t('classroom.unsupportedTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('classroom.unsupportedBody')}
            </p>
            <Button variant="outline" onClick={onExit} className="gap-2">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('header.back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Pre-lobby: instructor enters their name and opens a session
  // ------------------------------------------------------------
  const handleOpenLobby = async () => {
    const name = instructorName.trim();
    if (!name) {
      toast.error(t('classroom.nameRequired'));
      return;
    }
    const created = await createSession(name);
    if (created) {
      toast.success(t('classroom.lobbyOpened', { pin: created.pin }));
    }
  };

  const handleCopyPin = async () => {
    if (!session?.pin) return;
    try {
      await navigator.clipboard.writeText(session.pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  const handleStartCase = async () => {
    if (!selectedCase) {
      toast.error(t('classroom.pickCaseFirst'));
      return;
    }
    // Pass a snapshot of the case so students who join late still see it.
    await startCase(selectedCase.id, selectedCase);
    // If the instructor set a duration, broadcast the endsAt timestamp so
    // every student's banner starts counting down immediately.
    if (durationMinutes > 0) {
      await setTimer(durationMinutes);
    }
    toast.success(t('classroom.caseBroadcast', { title: selectedCase.title }));
  };

  const handleLeave = async () => {
    await leaveSession();
    onExit();
  };

  // ------------------------------------------------------------
  // Layout
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" onClick={handleLeave} className="gap-2">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('header.back')}
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold">{t('classroom.instructorTitle')}</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Error banner — routes i18n-key errors through t(), falls back to the
            raw message for anything that looks like an already-translated string. */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                {error.startsWith('classroom.') ? t(error) : error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ----------- Pre-lobby form ----------- */}
        {!session && (
          <Card>
            <CardHeader>
              <CardTitle>{t('classroom.openLobbyTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <p className="text-sm text-muted-foreground">
                {t('classroom.openLobbyBody')}
              </p>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('classroom.instructorName')}
                </label>
                <Input
                  value={instructorName}
                  onChange={e => {
                    setInstructorName(e.target.value);
                    if (error) clearError();
                  }}
                  placeholder={t('classroom.instructorNamePlaceholder')}
                  disabled={status === 'connecting'}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleOpenLobby()}
                />
              </div>
              <Button
                onClick={handleOpenLobby}
                disabled={status === 'connecting' || !instructorName.trim()}
                className="gap-2"
              >
                {status === 'connecting' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {t('classroom.openLobbyButton')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ----------- Active lobby (pre-case-start) -----------
            When a case goes live, the parent `ClassroomHost` swaps this
            lobby out for the full `StudentPanel` + broadcast bar combo.
            So the lobby only ever renders the pre-case branch. */}
        {session && session.status !== 'running' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            {/* PIN display — huge and centered so it's readable from across a room */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  {t('classroom.sharePinLabel')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 py-8">
                {/* PIN rendered in mono font with a subtle mid-gap so a student
                    reading from across a room parses the six digits as two
                    groups of three, not one long number. Matches the
                    design-system classroom PIN card spec. */}
                <div className="font-mono text-[3.5rem] font-medium leading-none tracking-[0.14em] tabular-nums text-primary">
                  {session.pin.slice(0, 3)} {session.pin.slice(3)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPin}
                  className="gap-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? t('classroom.copied') : t('classroom.copyPin')}
                </Button>
                {/* LIVE badge + live participant count — pulses once a student joins */}
                <div className="flex items-center gap-2 pt-1">
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider uppercase">Live</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {students.length === 0
                      ? 'Waiting for students…'
                      : `${students.length} joined`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-xs mt-1">
                  {t('classroom.sharePinHint')}
                </p>
              </CardContent>
            </Card>

            {/* Participants + case controls */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">
                    {t('classroom.joined')}
                  </CardTitle>
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {students.length}
                  </Badge>
                </CardHeader>
                <CardContent className="p-2">
                  {students.length === 0 ? (
                    <div className="flex items-center gap-2 py-6 px-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('classroom.waitingForStudents')}
                    </div>
                  ) : (
                    <ul className="space-y-0.5">
                      {students.map(p => {
                        // Initials from the display name — up to two letters.
                        const initials = p.displayName
                          .trim()
                          .split(/\s+/)
                          .map(w => w[0]?.toUpperCase())
                          .filter(Boolean)
                          .slice(0, 2)
                          .join('');
                        return (
                          <li
                            key={p.key}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
                          >
                            {/* Avatar — accent-tinted circle with initials.
                                Matches the design-system roster spec. */}
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground text-[13px] font-semibold shrink-0">
                              {initials || '·'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate leading-tight">
                                {p.displayName}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                joined {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {/* Status dot — green pulse = connected. */}
                            <span className="relative flex h-2 w-2 shrink-0" aria-label="connected">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t('classroom.startCaseTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Year-level filter. Keeps the case list bite-sized — a 4th-year
                      instructor shouldn't have to scroll past 1st-year basics. */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Year level
                    </label>
                    <Select
                      value={yearFilter}
                      onValueChange={v => {
                        setYearFilter(v as YearFilter);
                        // If the currently-picked case doesn't match the new
                        // year, clear the selection so the dropdown prompts again.
                        setSelectedCaseId(prev => {
                          if (v === 'all') return prev;
                          const stillValid = allCases.some(
                            c => c.id === prev && c.yearLevels?.includes(v as StudentYear),
                          );
                          return stillValid ? prev : '';
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEAR_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                      <span>{t('classroom.selectCase')}</span>
                      <span className="text-[10px] text-muted-foreground normal-case tracking-normal">
                        {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}
                      </span>
                    </label>
                    <Select
                      value={selectedStillValid ? selectedCaseId : ''}
                      onValueChange={setSelectedCaseId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          filteredCases.length === 0
                            ? 'No cases for this year level'
                            : t('classroom.selectCase')
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-[60vh]">
                        {groupedCases.map(([category, cases]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 sticky top-0">
                              {category.replace(/-/g, ' ')}
                            </div>
                            {cases.map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                <span className="flex items-center gap-2">
                                  <span>{c.title}</span>
                                  {c.complexity && (
                                    <span className="text-[10px] text-muted-foreground uppercase">
                                      · {c.complexity}
                                    </span>
                                  )}
                                </span>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Duration — sets a shared countdown on every participant's
                      screen and auto-ends the case when it expires. */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t('classroom.duration', { defaultValue: 'Session duration' })}
                    </label>
                    <Select
                      value={String(durationMinutes)}
                      onValueChange={v => setDurationMinutes(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No limit</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Every student will see a live countdown. The case auto-ends when time is up.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleStartCase}
                      disabled={!selectedCase || status === 'running'}
                      className="gap-2 flex-1"
                    >
                      <Play className="h-4 w-4" />
                      {status === 'running'
                        ? t('classroom.caseRunning')
                        : t('classroom.startCase')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLeave}
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('classroom.endSession')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassroomLobby;
