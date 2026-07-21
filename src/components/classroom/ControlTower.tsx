/**
 * ControlTower — the instructor's unified live-case dashboard.
 *
 * One view, everything at a glance. The instructor no longer flips between a
 * floating live-controls chip, the broadcast bar, and the case surface — the
 * whole case is here in three columns:
 *
 *   Left   — Patient Bay: read-only vitals / rhythm / arrest / vent summary,
 *            pulled from the shared case state (populated by whoever is
 *            driving inside the Patient Bay overlay). A toggle opens the full
 *            3D case surface (StudentPanel) as an overlay for actual driving.
 *   Center — Activity Timeline: one chronological feed merging treatments,
 *            assessments, injects and arrest events.
 *   Right  — Instructor Controls: tabbed Vitals / Rhythm / Injects / Roles,
 *            reusing the panels split out of InstructorLiveControls, plus
 *            rubric progress.
 *   Bottom — Case controls: end case, hand-off, timer.
 *
 * The three columns stack vertically on narrow screens. The Patient Bay
 * overlay is where driving actually happens — ControlTower itself is a
 * read-only observatory + a set of override levers, so it never duplicates
 * (or forks) the battle-tested treatment engine that lives in StudentPanel.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity, HeartPulse, Wind, Stethoscope, Syringe, Siren,
  ArrowDownToLine, Maximize2, ListChecks,
  Droplet, Brain, ThermometerSun, Gauge, ClipboardCheck, Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  VitalsOverridePanel, RhythmOverridePanel, InjectPanel,
  type InstructorOverride, type CurrentVitals,
} from './InstructorLiveControls';
import type { SharedCaseState, ClassroomParticipant } from '@/hooks/useClassroomSession';
import type { ClassroomInject, InjectSeverity } from '@/lib/classroomInjects';
import {
  CLINICAL_ROLES, CLINICAL_ROLE_IDS, getRoleBadgeStyle, type ClinicalRole,
} from '@/lib/classroomRoles';
import type { CaseScenario } from '@/types';

interface Props {
  caseData: CaseScenario;
  sharedState: SharedCaseState;
  participants: ClassroomParticipant[];
  /** Instructor override lever (shared with the Patient Bay overlay). */
  override: InstructorOverride | null;
  setOverride: (next: InstructorOverride) => void;
  /** Fire an inject to every participant. */
  onInject: (inject: ClassroomInject) => void;
  /** Assign / clear a clinical role for a participant. */
  onAssignRole: (participantKey: string, role: ClinicalRole | null) => void | Promise<void>;
  /** Open the full 3D case surface (StudentPanel) as an overlay. */
  onOpenPatientBay: () => void;
  /** The sticky broadcast bar, rendered above the tower by the host. */
  topBar?: React.ReactNode;
  /** Case controls, rendered in the bottom bar (end case, hand-off, timer). */
  bottomBar?: React.ReactNode;
}

// --- Activity timeline model ------------------------------------------------

type TimelineKind = 'treatment' | 'assessment' | 'inject' | 'arrest';

interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  /** Epoch ms if known, else undefined (kept, sorted to the top of the feed). */
  at?: number;
  label: string;
  detail?: string;
  /** Injects only — drives icon colour. */
  severity?: InjectSeverity;
}

const KIND_META: Record<TimelineKind, { Icon: typeof Activity; dot: string; text: string }> = {
  treatment: { Icon: Syringe, dot: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  assessment: { Icon: Stethoscope, dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  inject: { Icon: Siren, dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  arrest: { Icon: HeartPulse, dot: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400' },
};

function injectSeverityColor(sev?: InjectSeverity): string {
  switch (sev) {
    case 'critical': return 'bg-red-500';
    case 'warn': return 'bg-amber-500';
    default: return 'bg-sky-500';
  }
}

/** Merge every observable case event into one chronological feed. */
function buildTimeline(s: SharedCaseState): TimelineEntry[] {
  const out: TimelineEntry[] = [];

  for (const t of s.appliedTreatments ?? []) {
    const at = Date.parse(t.appliedAt);
    out.push({
      id: `tx-${t.id}-${t.appliedAt}`,
      kind: 'treatment',
      at: Number.isNaN(at) ? undefined : at,
      label: t.name,
      detail: t.detail,
    });
  }

  // Assessments carry no timestamp in the shared state — keep them as
  // undated entries so they still show (sorted to the top of the feed).
  (s.assessmentPerformed ?? []).forEach((stepId, i) => {
    out.push({
      id: `assess-${stepId}-${i}`,
      kind: 'assessment',
      label: humanizeStepId(stepId),
    });
  });

  for (const inj of s.activeInjects ?? []) {
    out.push({
      id: `inject-${inj.id}`,
      kind: 'inject',
      at: inj.timestamp || undefined,
      label: inj.title || 'Inject',
      detail: inj.description,
      severity: inj.severity,
    });
  }

  (s.arrestTimeline ?? []).forEach((ev, i) => {
    out.push({
      id: `arrest-${ev.type}-${ev.time}-${i}`,
      kind: 'arrest',
      at: ev.time || undefined,
      label: ev.event,
    });
  });

  // Newest last (chronological, auto-scroll to bottom). Undated entries
  // (assessments) sort to the top since they anchor at 0.
  return out.sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
}

/** "primary_airway" → "Primary airway". Best-effort, human-typed IDs vary. */
function humanizeStepId(id: string): string {
  const s = id.replace(/[_-]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatClock(at?: number): string {
  if (!at) return '—';
  return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// --- Component --------------------------------------------------------------

export function ControlTower({
  caseData, sharedState, participants,
  override, setOverride, onInject, onAssignRole,
  onOpenPatientBay, topBar, bottomBar,
}: Props) {
  const { t } = useTranslation();
  const v = sharedState.vitals ?? {};
  const currentVitals: CurrentVitals = v;

  const timeline = useMemo(() => buildTimeline(sharedState), [sharedState]);

  const totalRubric = caseData.studentChecklist?.length ?? 0;
  const doneRubric = sharedState.completedItems?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1800px] px-3 sm:px-4 py-3">
        {topBar}

        {/* Three columns → stack on narrow screens. */}
        <div className="grid grid-cols-1 lg:grid-cols-[30%_40%_30%] gap-3">
          {/* --- Left: Patient Bay --------------------------------------- */}
          <PatientBayColumn
            vitals={v}
            currentRhythm={sharedState.currentRhythm}
            isInArrest={sharedState.isInArrest}
            arrestState={sharedState.arrestState}
            ventilatorSettings={sharedState.ventilatorSettings}
            onOpenPatientBay={onOpenPatientBay}
            openLabel={t('classroom.controlTower.viewPatientBay', 'View Patient Bay')}
            title={t('classroom.controlTower.patientBay', 'Patient Bay')}
          />

          {/* --- Center: Activity Timeline ------------------------------- */}
          <ActivityTimeline
            entries={timeline}
            title={t('classroom.controlTower.activity', 'Activity Timeline')}
            emptyLabel={t('classroom.controlTower.waiting', 'Waiting for case to start…')}
            jumpLabel={t('classroom.controlTower.jumpToLatest', 'Jump to latest')}
          />

          {/* --- Right: Instructor Controls ------------------------------ */}
          <ControlsColumn
            override={override}
            setOverride={setOverride}
            currentVitals={currentVitals}
            currentRhythm={sharedState.currentRhythm}
            onInject={onInject}
            activeInjects={sharedState.activeInjects}
            participants={participants}
            clinicalRoles={sharedState.clinicalRoles}
            onAssignRole={onAssignRole}
            doneRubric={doneRubric}
            totalRubric={totalRubric}
          />
        </div>

        {bottomBar && <div className="mt-3">{bottomBar}</div>}
      </div>
    </div>
  );
}

// --- Left column ------------------------------------------------------------

function PatientBayColumn({
  vitals, currentRhythm, isInArrest, arrestState, ventilatorSettings,
  onOpenPatientBay, openLabel, title,
}: {
  vitals: NonNullable<SharedCaseState['vitals']>;
  currentRhythm?: string;
  isInArrest?: boolean;
  arrestState?: SharedCaseState['arrestState'];
  ventilatorSettings?: SharedCaseState['ventilatorSettings'];
  onOpenPatientBay: () => void;
  openLabel: string;
  title: string;
}) {
  const vitalItems: Array<{ Icon: typeof Activity; label: string; value: string }> = [
    { Icon: Activity, label: 'BP', value: vitals.bp ?? '—' },
    { Icon: HeartPulse, label: 'HR', value: vitals.pulse != null ? String(vitals.pulse) : '—' },
    { Icon: Wind, label: 'RR', value: vitals.respiration != null ? String(vitals.respiration) : '—' },
    { Icon: Droplet, label: 'SpO₂', value: vitals.spo2 != null ? `${vitals.spo2}%` : '—' },
    { Icon: ThermometerSun, label: 'Temp', value: vitals.temperature != null ? `${vitals.temperature}°` : '—' },
    { Icon: Brain, label: 'GCS', value: vitals.gcs != null ? String(vitals.gcs) : '—' },
    { Icon: Gauge, label: 'BGL', value: vitals.bloodGlucose != null ? String(vitals.bloodGlucose) : '—' },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">{title}</h2>
          </div>
          {isInArrest && (
            <Badge variant="destructive" className="text-[10px] gap-1">
              <HeartPulse className="w-3 h-3" /> ARREST
            </Badge>
          )}
        </div>

        {/* Vitals grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {vitalItems.map(({ Icon, label, value }) => (
            <div key={label} className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-2">
              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Icon className="w-3 h-3" />{label}
              </div>
              <div className="mt-0.5 text-base font-bold tabular-nums leading-none">{value}</div>
            </div>
          ))}
        </div>

        {/* Rhythm */}
        <div className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-2">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <HeartPulse className="w-3 h-3" /> Rhythm
          </div>
          <div className="mt-0.5 text-sm font-semibold">{currentRhythm ?? '—'}</div>
        </div>

        {/* Arrest banner */}
        {isInArrest && arrestState && (
          <div className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-2.5 py-2 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
              <Siren className="w-3 h-3" /> Arrest run
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] tabular-nums">
              <span>CPR: <strong>{arrestState.cprRunning ? 'running' : 'paused'}</strong></span>
              <span>Cycle: <strong>{arrestState.cycleNumber ?? 0}</strong></span>
              <span>Shocks: <strong>{arrestState.shockCount ?? 0}</strong></span>
              <span>Adren: <strong>{arrestState.adrenalineDoses ?? 0}</strong></span>
              <span>Amiod: <strong>{arrestState.amiodaroneDoses ?? 0}</strong></span>
            </div>
          </div>
        )}

        {/* Ventilator */}
        {ventilatorSettings && (
          <div className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-2">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Wind className="w-3 h-3" /> Ventilator
            </div>
            <div className="mt-0.5 text-[11px] tabular-nums leading-snug">
              {ventilatorSettings.mode} · Vt {ventilatorSettings.tidalVolumeMl}mL · RR {ventilatorSettings.respiratoryRate} ·
              FiO₂ {ventilatorSettings.fio2Percent}% · PEEP {ventilatorSettings.peepCmH2O} · I:E {ventilatorSettings.ieRatio}
            </div>
          </div>
        )}

        <Button onClick={onOpenPatientBay} className="w-full h-9 gap-1.5 text-xs">
          <Maximize2 className="w-3.5 h-3.5" /> {openLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

// --- Center column ----------------------------------------------------------

function ActivityTimeline({
  entries, title, emptyLabel, jumpLabel,
}: {
  entries: TimelineEntry[];
  title: string;
  emptyLabel: string;
  jumpLabel: string;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);

  // Auto-scroll to newest when pinned. If the instructor scrolled up to read
  // history, we stop auto-scrolling and offer a "jump to latest" button.
  useEffect(() => {
    if (!pinnedToBottom) return;
    const vp = viewportRef.current;
    if (vp) vp.scrollTop = vp.scrollHeight;
  }, [entries, pinnedToBottom]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setPinnedToBottom(atBottom);
  };

  const jump = () => {
    const vp = viewportRef.current;
    if (vp) vp.scrollTop = vp.scrollHeight;
    setPinnedToBottom(true);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 h-full flex flex-col">
        <div className="flex items-center gap-1.5 mb-2">
          <ListChecks className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">{title}</h2>
          {entries.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-[10px] h-5">{entries.length}</Badge>
          )}
        </div>

        <div className="relative flex-1 min-h-[16rem]">
          {entries.length === 0 ? (
            <div className="flex h-full min-h-[16rem] items-center justify-center text-xs text-muted-foreground italic">
              {emptyLabel}
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div
                ref={viewportRef}
                onScroll={onScroll}
                className="h-[60vh] overflow-y-auto pr-2 space-y-1.5"
              >
                {entries.map((e) => {
                  const meta = KIND_META[e.kind];
                  const dot = e.kind === 'inject' ? injectSeverityColor(e.severity) : meta.dot;
                  return (
                    <div key={e.id} className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/20 px-2.5 py-1.5">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                      <meta.Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${meta.text}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium leading-snug">{e.label}</div>
                        {e.detail && (
                          <div className="text-[10px] text-muted-foreground leading-snug truncate">{e.detail}</div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground tabular-nums shrink-0">
                        {formatClock(e.at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {!pinnedToBottom && entries.length > 0 && (
            <Button
              size="sm"
              onClick={jump}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 h-7 gap-1.5 text-[11px] shadow-lg"
            >
              <ArrowDownToLine className="w-3 h-3" /> {jumpLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Right column -----------------------------------------------------------

function ControlsColumn({
  override, setOverride, currentVitals, currentRhythm,
  onInject, activeInjects,
  participants, clinicalRoles, onAssignRole,
  doneRubric, totalRubric,
}: {
  override: InstructorOverride | null;
  setOverride: (next: InstructorOverride) => void;
  currentVitals: CurrentVitals;
  currentRhythm?: string;
  onInject: (inject: ClassroomInject) => void;
  activeInjects?: ClassroomInject[];
  participants: ClassroomParticipant[];
  clinicalRoles?: Record<string, ClinicalRole>;
  onAssignRole: (participantKey: string, role: ClinicalRole | null) => void | Promise<void>;
  doneRubric: number;
  totalRubric: number;
}) {
  const { t } = useTranslation();
  const rubricPct = totalRubric > 0 ? Math.round((doneRubric / totalRubric) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 space-y-3">
        <Tabs defaultValue="vitals">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="vitals" className="text-[11px] gap-1"><Activity className="w-3 h-3" />{t('classroom.controlTower.tabs.vitals', 'Vitals')}</TabsTrigger>
            <TabsTrigger value="rhythm" className="text-[11px] gap-1"><HeartPulse className="w-3 h-3" />{t('classroom.controlTower.tabs.rhythm', 'Rhythm')}</TabsTrigger>
            <TabsTrigger value="injects" className="text-[11px] gap-1"><Siren className="w-3 h-3" />{t('classroom.controlTower.tabs.injects', 'Injects')}</TabsTrigger>
            <TabsTrigger value="roles" className="text-[11px] gap-1"><Users className="w-3 h-3" />{t('classroom.controlTower.tabs.roles', 'Roles')}</TabsTrigger>
          </TabsList>

          <div className="mt-3 max-h-[52vh] overflow-y-auto pr-1">
            <TabsContent value="vitals">
              <VitalsOverridePanel override={override} setOverride={setOverride} currentVitals={currentVitals} />
            </TabsContent>
            <TabsContent value="rhythm">
              <RhythmOverridePanel override={override} setOverride={setOverride} currentRhythm={currentRhythm} />
            </TabsContent>
            <TabsContent value="injects">
              <InjectPanel onInject={onInject} activeInjects={activeInjects} />
            </TabsContent>
            <TabsContent value="roles">
              <RolesTab
                participants={participants}
                clinicalRoles={clinicalRoles}
                onAssignRole={onAssignRole}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Rubric progress */}
        <div className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-2">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1"><ClipboardCheck className="w-3 h-3" /> {t('classroom.controlTower.rubric', 'Rubric progress')}</span>
            <span className="tabular-nums">{doneRubric}/{totalRubric}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${rubricPct}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RolesTab({
  participants, clinicalRoles, onAssignRole,
}: {
  participants: ClassroomParticipant[];
  clinicalRoles?: Record<string, ClinicalRole>;
  onAssignRole: (participantKey: string, role: ClinicalRole | null) => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const students = participants.filter(p => p.role === 'student');

  if (students.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic py-6 text-center">
        {t('classroom.controlTower.noStudents', 'No students connected yet')}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {students.map(p => {
        const role = clinicalRoles?.[p.key];
        const style = role ? getRoleBadgeStyle(role) : null;
        return (
          <li key={p.key} className="rounded-lg border border-border/55 bg-muted/20 px-2.5 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="truncate text-xs font-medium">{p.displayName}</span>
              {role && style && (
                <span className={`ml-auto inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${style.bg} ${style.text} ${style.border}`}>
                  {t(`classroom.roles.${role}.label`, CLINICAL_ROLES[role].label)}
                </span>
              )}
            </div>
            <select
              value={role ?? ''}
              onChange={e => {
                const val = e.target.value;
                void onAssignRole(p.key, val === '' ? null : (val as ClinicalRole));
              }}
              className="w-full rounded-md border border-border/60 bg-background/70 px-1.5 py-1 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label={t('classroom.roles.assignFor', { name: p.displayName })}
            >
              <option value="">{t('classroom.roles.none', 'No role')}</option>
              {CLINICAL_ROLE_IDS.map(id => (
                <option key={id} value={id}>
                  {t(`classroom.roles.${id}.label`, CLINICAL_ROLES[id].label)}
                </option>
              ))}
            </select>
          </li>
        );
      })}
    </ul>
  );
}

export default ControlTower;
