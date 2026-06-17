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
  Radio,
  Monitor,
  Clock,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  ListChecks,
  Search,
  X,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
import { AmbientBackground } from '@/components/AmbientBackground';
import { allCases } from '@/data/cases';
import type { CaseScenario, StudentYear } from '@/types';

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

const CLASSROOM_FLOW: { label: string; detail: string; icon: LucideIcon }[] = [
  { label: 'Lobby', detail: 'secure PIN', icon: Radio },
  { label: 'Learners', detail: 'roster live', icon: UserCheck },
  { label: 'Case', detail: 'scenario ready', icon: Stethoscope },
  { label: 'Broadcast', detail: 'shared state', icon: Monitor },
];

const CLASSROOM_SIGNALS: { label: string; value: string; icon: LucideIcon }[] = [
  { label: 'Live case sync', value: 'Patient state mirrors to every device', icon: Monitor },
  { label: 'Instructor control', value: 'Handoff, voice, camera and vitals override', icon: ShieldCheck },
  { label: 'Teaching rhythm', value: 'Brief, run, pause, debrief', icon: ListChecks },
];

function formatCategoryLabel(category: string): string {
  return category
    .split('-')
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('');
}

function formatDurationLabel(minutes: number): string {
  if (minutes <= 0) return 'No limit';
  if (minutes === 60) return '1 hour';
  return `${minutes} min`;
}

function caseSearchText(c: CaseScenario): string {
  return [
    c.title,
    c.category,
    c.subcategory,
    c.priority,
    c.complexity,
    c.dispatchInfo?.callReason,
    c.dispatchInfo?.location,
    c.initialPresentation?.generalImpression,
    c.patientInfo?.age,
    c.patientInfo?.gender,
    ...(c.yearLevels ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function caseSubtitle(c: CaseScenario): string {
  const age = c.patientInfo?.age ? `${c.patientInfo.age}y` : '';
  const reason = c.dispatchInfo?.callReason;
  return [age, reason].filter(Boolean).join(' · ');
}

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
    isPreviewMode,
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
  const [caseSearch, setCaseSearch] = useState('');
  const [copied, setCopied] = useState(false);
  // Duration in minutes. 0 / null = unlimited. Default 20 minutes —
  // feels right for a paramedic scenario teaching slot.
  const [durationMinutes, setDurationMinutes] = useState<number>(20);

  // Cases filtered by the selected year. Search is applied in a second pass
  // so changing the text query doesn't invalidate an already-selected case.
  const yearFilteredCases = useMemo(() => {
    if (yearFilter === 'all') return allCases;
    return allCases.filter(c => c.yearLevels?.includes(yearFilter));
  }, [yearFilter]);

  const filteredCases = useMemo(() => {
    const q = caseSearch.trim().toLowerCase();
    if (!q) return yearFilteredCases;
    return yearFilteredCases.filter(c => caseSearchText(c).includes(q));
  }, [caseSearch, yearFilteredCases]);

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
  // selected cohort — search narrowing should not erase the instructor's pick.
  const selectedStillValid = useMemo(
    () => yearFilteredCases.some(c => c.id === selectedCaseId),
    [yearFilteredCases, selectedCaseId],
  );

  const fastStartCases = useMemo(() => {
    const source = caseSearch.trim() ? filteredCases : yearFilteredCases;
    const preferred = source.filter(c =>
      c.priority === 'critical'
      || c.complexity === 'intermediate'
      || c.complexity === 'advanced',
    );
    return (preferred.length > 0 ? preferred : source).slice(0, 3);
  }, [caseSearch, filteredCases, yearFilteredCases]);

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

  const activeFlowStep = !session
    ? 0
    : selectedCase
      ? 2
      : students.length > 0
        ? 1
        : 0;

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

  const handleOpenPreviewLobby = async () => {
    const name = instructorName.trim() || 'Dr Hassan';
    setInstructorName(name);
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
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Kimi-spec ambient orbs — extracted into <AmbientBackground/>. */}
      <AmbientBackground />
      <div className="relative z-10">
      {/* Top bar */}
      <div className="border-b border-black/5 nav-blur">
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

        {isPreviewMode && (
          <Card className="glass rounded-2xl border border-amber-400/30 bg-amber-500/8">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/12 text-amber-600 dark:text-amber-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Local classroom preview</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Supabase is not configured on this dev server, so this room uses demo learners and local-only state for UI review.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit border-amber-500/35 bg-background/50 text-amber-700 dark:text-amber-300">
                Preview mode
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* ----------- Pre-lobby form ----------- */}
        {!session && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
            <section className="glass-strong rounded-2xl border border-white/55 dark:border-white/10 p-6 sm:p-7 overflow-hidden">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5 border-emerald-500/35 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300">
                  <Radio className="h-3.5 w-3.5" />
                  Instructor console
                </Badge>
                <Badge variant="secondary" className="gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure classroom
                </Badge>
              </div>
              <div className="mt-7 max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Online simulation
                </p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Run a live paramedic case with the whole class in sync.
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground max-w-xl">
                  Open the lobby, let students join on their devices, then launch one shared patient scenario with live teaching controls.
                </p>
              </div>

              <div className="mt-7">
                <ClassroomFlowStrip activeIndex={activeFlowStep} />
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {CLASSROOM_SIGNALS.map(signal => {
                  const Icon = signal.icon;
                  return (
                    <div
                      key={signal.label}
                      className="rounded-xl border border-white/45 dark:border-white/10 bg-white/48 dark:bg-slate-950/35 p-3.5 shadow-sm"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <div className="mt-2 text-xs font-semibold text-foreground">
                        {signal.label}
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                        {signal.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <Card className="glass-strong rounded-2xl border border-white/55 dark:border-white/10 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{t('classroom.openLobbyTitle')}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('classroom.openLobbyBody')}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    className="h-11"
                  />
                </div>
                <Button
                  onClick={handleOpenLobby}
                  disabled={status === 'connecting' || !instructorName.trim()}
                  className="w-full h-11 gap-2"
                >
                  {status === 'connecting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {t('classroom.openLobbyButton')}
                </Button>
                {isPreviewMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenPreviewLobby}
                    disabled={status === 'connecting'}
                    className="w-full h-10 gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Open demo lobby
                  </Button>
                )}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {['PIN', 'Roster', 'Case'].map((label, index) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border/60 bg-background/45 px-2.5 py-2 text-center"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-foreground">
                        {index === 0 ? 'Auto' : index === 1 ? 'Live' : 'Ready'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ----------- Active lobby (pre-case-start) -----------
            When a case goes live, the parent `ClassroomHost` swaps this
            lobby out for the full `StudentPanel` + broadcast bar combo.
            So the lobby only ever renders the pre-case branch. */}
        {session && session.status !== 'running' && (
          <div className="space-y-6">
            <ClassroomFlowStrip activeIndex={activeFlowStep} />

            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] items-start">
              <Card className="glass-strong rounded-2xl border border-white/55 dark:border-white/10 overflow-hidden shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{t('classroom.sharePinLabel')}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('classroom.sharePinHint')}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="gap-1.5 border-emerald-500/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Live</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-2xl border border-primary/15 bg-primary/[0.045] px-3 py-7 text-center shadow-inner">
                    <div className="whitespace-nowrap font-mono text-[clamp(2.45rem,5.6vw,4.4rem)] font-semibold leading-none tracking-[0.08em] tabular-nums text-primary">
                      {session.pin.slice(0, 3)} {session.pin.slice(3)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPin}
                      className="mt-5 gap-2 bg-background/65"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? t('classroom.copied') : t('classroom.copyPin')}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <StatusTile icon={Users} label="Learners" value={String(students.length)} />
                    <StatusTile icon={Clock} label="Duration" value={formatDurationLabel(durationMinutes)} />
                    <StatusTile icon={Stethoscope} label="Case" value={selectedCase ? 'Selected' : 'Pending'} />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="glass rounded-2xl border border-white/45 dark:border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-base">{t('classroom.joined')}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {students.length === 0 ? t('classroom.waitingForStudents') : `${students.length} learner${students.length !== 1 ? 's' : ''} connected`}
                      </p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {students.length}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <LearnerRoster students={students} />
                  </CardContent>
                </Card>

                <Card className="glass-strong rounded-2xl border border-white/55 dark:border-white/10 shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">
                          {t('classroom.startCaseTitle')}
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Select the cohort, scenario, and session clock before broadcasting.
                        </p>
                      </div>
                      <Badge variant={selectedCase ? 'default' : 'secondary'} className="gap-1.5">
                        <ListChecks className="h-3.5 w-3.5" />
                        {selectedCase ? 'Ready' : 'Setup'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
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
                          <SelectTrigger className="h-10">
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
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('classroom.duration', { defaultValue: 'Session duration' })}
                        </label>
                        <Select
                          value={String(durationMinutes)}
                          onValueChange={v => setDurationMinutes(Number(v))}
                        >
                          <SelectTrigger className="h-10">
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
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Search scenarios
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={caseSearch}
                          onChange={e => setCaseSearch(e.target.value)}
                          placeholder="Chest pain, asthma, trauma, arrest..."
                          className="h-10 pl-9 pr-9"
                        />
                        {caseSearch.trim() && (
                          <button
                            type="button"
                            onClick={() => setCaseSearch('')}
                            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Clear case search"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <QuickCasePicker
                      cases={fastStartCases}
                      selectedCaseId={selectedCaseId}
                      title={caseSearch.trim() ? 'Best matches' : 'Fast start'}
                      emptyLabel={caseSearch.trim() ? 'No matching scenarios' : 'No scenarios for this cohort'}
                      onSelect={setSelectedCaseId}
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                        <span>{t('classroom.selectCase')}</span>
                        <span className="text-[10px] text-muted-foreground normal-case tracking-normal">
                          {filteredCases.length} shown · {yearFilteredCases.length} total
                        </span>
                      </label>
                      <Select
                        value={selectedStillValid ? selectedCaseId : ''}
                        onValueChange={setSelectedCaseId}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={
                            filteredCases.length === 0
                              ? 'No cases match these filters'
                              : t('classroom.selectCase')
                          } />
                        </SelectTrigger>
                        <SelectContent className="max-h-[60vh]">
                          {groupedCases.map(([category, cases]) => (
                            <div key={category}>
                              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 sticky top-0">
                                {formatCategoryLabel(category)}
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

                    <SelectedCasePreview selectedCase={selectedCase} yearFilter={yearFilter} durationMinutes={durationMinutes} />

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={handleStartCase}
                        disabled={!selectedCase || status === 'running'}
                        className="h-11 gap-2 flex-1"
                      >
                        <Play className="h-4 w-4" />
                        {status === 'running'
                          ? t('classroom.caseRunning')
                          : t('classroom.startCase')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleLeave}
                        className="h-11 gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('classroom.endSession')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>{/* /relative z-10 — ambient-bg wrapper */}
    </div>
  );
}

function ClassroomFlowStrip({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {CLASSROOM_FLOW.map((step, index) => {
        const Icon = step.icon;
        const active = index <= activeIndex;
        return (
          <div
            key={step.label}
            className={`relative overflow-hidden rounded-xl border px-3 py-3 transition-colors ${
              active
                ? 'border-primary/25 bg-primary/10 text-primary'
                : 'border-border/60 bg-background/45 text-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-foreground">
                  {step.label}
                </div>
                <div className="truncate text-[10px] uppercase tracking-wider opacity-75">
                  {step.detail}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/55 px-3 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function LearnerRoster({ students }: { students: UseClassroomSessionResult['participants'] }) {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-background/35 px-4 py-5">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Waiting for students to join
        </div>
      </div>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {students.map(p => (
        <li
          key={p.key}
          className="flex items-center gap-3 rounded-xl border border-border/55 bg-background/55 px-3 py-2.5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-[13px] font-semibold text-accent-foreground">
            {getInitials(p.displayName) || '•'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium leading-tight">
              {p.displayName}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              joined {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <span className="relative flex h-2 w-2 shrink-0" aria-label="connected">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function QuickCasePicker({
  cases,
  selectedCaseId,
  title,
  emptyLabel,
  onSelect,
}: {
  cases: CaseScenario[];
  selectedCaseId: string;
  title: string;
  emptyLabel: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Star className="h-3.5 w-3.5" />
          {title}
        </div>
        {cases.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            Tap to select
          </span>
        )}
      </div>
      {cases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-background/35 px-4 py-3 text-xs text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-2">
          {cases.map(c => {
            const selected = c.id === selectedCaseId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={`group rounded-xl border px-3 py-3 text-left transition-colors ${
                  selected
                    ? 'border-primary/35 bg-primary/10'
                    : 'border-border/60 bg-background/45 hover:border-primary/25 hover:bg-primary/[0.045]'
                }`}
                aria-pressed={selected}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {c.title}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {caseSubtitle(c)}
                    </p>
                  </div>
                  <Badge variant={selected ? 'default' : 'outline'} className="shrink-0 text-[10px] uppercase">
                    {c.complexity}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {formatCategoryLabel(c.category)}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {c.estimatedDuration ?? 20} min
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SelectedCasePreview({
  selectedCase,
  yearFilter,
  durationMinutes,
}: {
  selectedCase: (typeof allCases)[number] | null;
  yearFilter: YearFilter;
  durationMinutes: number;
}) {
  if (!selectedCase) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-background/35 px-4 py-4">
        <div className="flex items-start gap-3">
          <Stethoscope className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium text-foreground">No case selected</div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Pick a scenario to unlock the live broadcast button.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.055] px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">
            {selectedCase.title}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {selectedCase.category && (
              <Badge variant="outline" className="text-[10px]">
                {formatCategoryLabel(selectedCase.category)}
              </Badge>
            )}
            {selectedCase.complexity && (
              <Badge variant="secondary" className="text-[10px] uppercase">
                {selectedCase.complexity}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {yearFilter === 'all' ? 'Mixed cohort' : YEAR_OPTIONS.find(o => o.value === yearFilter)?.label}
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Clock className="h-3 w-3" />
              {formatDurationLabel(durationMinutes)}
            </Badge>
          </div>
        </div>
        <Badge className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700">
          <Check className="h-3 w-3" />
          Ready
        </Badge>
      </div>
    </div>
  );
}

export default ClassroomLobby;
