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
  const [copied, setCopied] = useState(false);
  // Duration in minutes. 0 / null = unlimited. Default 20 minutes —
  // feels right for a paramedic scenario teaching slot.
  const [durationMinutes, setDurationMinutes] = useState<number>(20);

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
                <div className="text-6xl font-bold tracking-[0.3em] tabular-nums text-primary">
                  {session.pin}
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
                <p className="text-xs text-muted-foreground text-center max-w-xs">
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
                <CardContent>
                  {students.length === 0 ? (
                    <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('classroom.waitingForStudents')}
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {students.map(p => (
                        <li
                          key={p.key}
                          className="flex items-center justify-between py-2 text-sm"
                        >
                          <span className="font-medium">{p.displayName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(p.joinedAt).toLocaleTimeString()}
                          </span>
                        </li>
                      ))}
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
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t('classroom.selectCase')}
                    </label>
                    <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('classroom.selectCase')} />
                      </SelectTrigger>
                      <SelectContent>
                        {allCases.slice(0, 60).map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
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
