/**
 * ClassroomInstructorCaseView — teaching-mode view the instructor sees
 * once they've broadcast a case to the classroom.
 *
 * Designed for **tabletop-style discussion**: every section the case ships
 * with (dispatch, patient, scene, vitals, expected findings, critical
 * actions, management, teaching points) is collapsed into a single
 * scrollable column with a tab bar, so an instructor can walk a room of
 * students through the case in order while also pushing live updates to
 * every student's device.
 *
 * Broadcast controls:
 *   - Send free-text message ("Watch for deterioration at the 3-min mark")
 *   - Push a deterioration vitals snapshot (post-intervention / en-route /
 *     deterioration set — pulled from the case's own progression data)
 *   - Reveal diagnosis / redFlags (sends a structured instructor_message
 *     that the student-side ClassroomJoin displays)
 *
 * The component is given the live CaseScenario + the already-authenticated
 * sendBroadcast from useClassroomSession. It never reaches into Supabase
 * directly — keeps the contract tight.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  ClipboardList,
  Stethoscope,
  Activity,
  BookOpen,
  AlertTriangle,
  MessageSquare,
  Radio,
  TrendingDown,
  Eye,
  Target,
  FileText,
  Heart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { CaseScenario, VitalSigns } from '@/types';
import type { ClassroomBroadcast } from '@/hooks/useClassroomSession';

interface Props {
  caseData: CaseScenario;
  caseStartedAt: string | null;
  onBroadcast: (payload: ClassroomBroadcast) => Promise<void> | void;
  onEndCase: () => Promise<void> | void;
}

// ---- helpers ---------------------------------------------------------------

function formatElapsed(since: string | null): string {
  if (!since) return '00:00';
  const s = Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function vitalsLabel(v: VitalSigns): string {
  const parts: string[] = [];
  if (v.bp) parts.push(`BP ${v.bp}`);
  if (v.pulse !== undefined) parts.push(`HR ${v.pulse}`);
  if (v.respiration !== undefined) parts.push(`RR ${v.respiration}`);
  if (v.spo2 !== undefined) parts.push(`SpO2 ${v.spo2}%`);
  if (v.gcs !== undefined) parts.push(`GCS ${v.gcs}`);
  if (v.temperature !== undefined) parts.push(`Temp ${v.temperature}°C`);
  if (v.bloodGlucose !== undefined) parts.push(`BGL ${v.bloodGlucose}`);
  return parts.join(' · ');
}

function vitalsToSummary(v: VitalSigns): string {
  return vitalsLabel(v);
}

// ---- component -------------------------------------------------------------

export function ClassroomInstructorCaseView({ caseData, caseStartedAt, onBroadcast, onEndCase }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<string>('dispatch');
  const [message, setMessage] = useState('');
  const [revealedDx, setRevealedDx] = useState(false);
  const [revealedRedFlags, setRevealedRedFlags] = useState(false);
  const [discussed, setDiscussed] = useState<Set<string>>(new Set());

  // Re-render every second so the timer ticks (cheap, bounded to this view).
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick(n => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = formatElapsed(caseStartedAt);

  const patientLine = useMemo(() => {
    const p = caseData.patientInfo;
    if (!p) return '';
    const bits: string[] = [];
    if (p.age) bits.push(`${p.age}y`);
    if (p.gender) bits.push(String(p.gender));
    if (p.weight) bits.push(`${p.weight}kg`);
    return bits.join(' · ');
  }, [caseData.patientInfo]);

  // ----- broadcast actions ------------------------------------------------
  const sendMessage = async () => {
    const text = message.trim();
    if (!text) return;
    await onBroadcast({ kind: 'instructor_message', text });
    toast.success(t('classroom.instructor.messageSent', { defaultValue: 'Message sent to students' }));
    setMessage('');
  };

  const revealDiagnosis = async () => {
    const dx = caseData.expectedFindings?.mostLikelyDiagnosis;
    if (!dx) return;
    await onBroadcast({
      kind: 'instructor_message',
      text: `🎯 Working diagnosis: ${dx}`,
    });
    setRevealedDx(true);
    toast.success(t('classroom.instructor.dxRevealed', { defaultValue: 'Diagnosis revealed to students' }));
  };

  const revealRedFlags = async () => {
    const flags = caseData.expectedFindings?.redFlags ?? [];
    if (flags.length === 0) return;
    await onBroadcast({
      kind: 'instructor_message',
      text: `🚩 Red flags to recognise:\n${flags.map(f => `• ${f}`).join('\n')}`,
    });
    setRevealedRedFlags(true);
    toast.success(t('classroom.instructor.flagsRevealed', { defaultValue: 'Red flags shared with students' }));
  };

  const pushVitalsStage = async (
    stage: 'afterIntervention' | 'enRoute' | 'deterioration',
  ) => {
    const v = caseData.vitalSignsProgression?.[stage];
    if (!v) return;
    const labels = {
      afterIntervention: 'After intervention',
      enRoute: 'En route',
      deterioration: '⚠ Deterioration',
    } as const;
    await onBroadcast({
      kind: 'instructor_message',
      text: `📊 ${labels[stage]} vitals — ${vitalsToSummary(v)}`,
    });
    toast.success(t('classroom.instructor.vitalsPushed', { defaultValue: 'Vitals pushed to students' }));
  };

  // Local teaching-state toggle — lets the instructor tick off teaching
  // points as they walk through them so they don't lose their place in a
  // long case discussion.
  const toggleDiscussed = (id: string) => {
    setDiscussed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ----- render -----------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Case header ---------------------------------------------------- */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-4 px-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  {caseData.category}
                </Badge>
                {caseData.priority && (
                  <Badge
                    variant={caseData.priority === 'critical' ? 'destructive' : 'secondary'}
                    className="text-[10px] uppercase tracking-wide"
                  >
                    {caseData.priority}
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-bold leading-tight">{caseData.title}</h2>
              {patientLine && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {patientLine} · {caseData.dispatchInfo?.callReason || ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-mono font-medium tabular-nums">{elapsed}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => void onEndCase()}>
                End case
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick-action broadcast bar ------------------------------------- */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500" />
            {t('classroom.instructor.broadcastTitle', { defaultValue: 'Broadcast to students' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void pushVitalsStage('afterIntervention')}
              disabled={!caseData.vitalSignsProgression?.afterIntervention}
              className="gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              Post-intervention vitals
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void pushVitalsStage('enRoute')}
              disabled={!caseData.vitalSignsProgression?.enRoute}
              className="gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              En-route vitals
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void pushVitalsStage('deterioration')}
              disabled={!caseData.vitalSignsProgression?.deterioration}
              className="gap-1.5 text-amber-600 border-amber-300"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Deterioration
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void revealDiagnosis()}
              disabled={!caseData.expectedFindings?.mostLikelyDiagnosis || revealedDx}
              className="gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              {revealedDx ? 'Dx revealed' : 'Reveal diagnosis'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void revealRedFlags()}
              disabled={(caseData.expectedFindings?.redFlags?.length ?? 0) === 0 || revealedRedFlags}
              className="gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {revealedRedFlags ? 'Red flags sent' : 'Send red flags'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder={t('classroom.instructor.messagePlaceholder', {
                defaultValue: 'Type a teaching note to push to every student…',
              })}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={2}
              className="resize-none"
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => void sendMessage()}
              disabled={!message.trim()}
              className="self-stretch gap-1.5 shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed teaching content ---------------------------------------- */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-3">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1">
          <TabsTrigger value="dispatch" className="text-xs gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dispatch</span>
          </TabsTrigger>
          <TabsTrigger value="vitals" className="text-xs gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vitals</span>
          </TabsTrigger>
          <TabsTrigger value="findings" className="text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Findings</span>
          </TabsTrigger>
          <TabsTrigger value="critical" className="text-xs gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Critical</span>
          </TabsTrigger>
          <TabsTrigger value="management" className="text-xs gap-1.5">
            <Stethoscope className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Management</span>
          </TabsTrigger>
          <TabsTrigger value="teaching" className="text-xs gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Teaching</span>
          </TabsTrigger>
        </TabsList>

        {/* Dispatch + scene + presentation */}
        <TabsContent value="dispatch" className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Dispatch</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {caseData.dispatchInfo?.callReason && (
                <p><span className="font-semibold">Call reason:</span> {caseData.dispatchInfo.callReason}</p>
              )}
              {caseData.dispatchInfo?.location && (
                <p><span className="font-semibold">Location:</span> {caseData.dispatchInfo.location}</p>
              )}
              {caseData.dispatchInfo?.callerInfo && (
                <p><span className="font-semibold">Caller:</span> {caseData.dispatchInfo.callerInfo}</p>
              )}
              {caseData.dispatchInfo?.dispatchCode && (
                <p><span className="font-semibold">Code:</span> {caseData.dispatchInfo.dispatchCode}</p>
              )}
            </CardContent>
          </Card>
          {caseData.sceneInfo && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Scene</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {caseData.sceneInfo.description && <p>{caseData.sceneInfo.description}</p>}
                {(caseData.sceneInfo.hazards?.length ?? 0) > 0 && (
                  <p><span className="font-semibold">Hazards:</span> {caseData.sceneInfo.hazards.join(', ')}</p>
                )}
                {caseData.sceneInfo.bystanders && (
                  <p><span className="font-semibold">Bystanders:</span> {caseData.sceneInfo.bystanders}</p>
                )}
              </CardContent>
            </Card>
          )}
          {caseData.initialPresentation && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Initial presentation</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {caseData.initialPresentation.generalImpression && (
                  <p><span className="font-semibold">General impression:</span> {caseData.initialPresentation.generalImpression}</p>
                )}
                {caseData.initialPresentation.position && (
                  <p><span className="font-semibold">Position:</span> {caseData.initialPresentation.position}</p>
                )}
                {caseData.initialPresentation.consciousness && (
                  <p><span className="font-semibold">Consciousness:</span> {caseData.initialPresentation.consciousness}</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vitals progression */}
        <TabsContent value="vitals" className="space-y-3">
          {caseData.vitalSignsProgression && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" />Vital signs progression</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(['initial', 'afterIntervention', 'enRoute', 'deterioration'] as const).map(stage => {
                  const v = caseData.vitalSignsProgression?.[stage];
                  if (!v) return null;
                  const labels = {
                    initial: 'Initial',
                    afterIntervention: 'After intervention',
                    enRoute: 'En route',
                    deterioration: '⚠ Deterioration',
                  } as const;
                  return (
                    <div key={stage} className="flex items-start justify-between gap-3 py-1.5 border-b last:border-0">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{labels[stage]}</div>
                        <div className="text-sm font-mono tabular-nums">{vitalsLabel(v)}</div>
                      </div>
                      {stage !== 'initial' && (
                        <Button size="sm" variant="ghost" onClick={() => void pushVitalsStage(stage)} className="shrink-0 gap-1.5">
                          <Radio className="w-3 h-3" />
                          Push
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Expected findings */}
        <TabsContent value="findings" className="space-y-3">
          {caseData.expectedFindings && (
            <>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Most likely diagnosis</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  <p className="font-semibold text-primary">{caseData.expectedFindings.mostLikelyDiagnosis}</p>
                  {(caseData.expectedFindings.differentialDiagnoses?.length ?? 0) > 0 && (
                    <>
                      <p className="mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Differentials</p>
                      <ul className="mt-1 space-y-0.5">
                        {caseData.expectedFindings.differentialDiagnoses.map((d, i) => (
                          <li key={i} className="text-xs">• {d}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
              {(caseData.expectedFindings.keyObservations?.length ?? 0) > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Key observations</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {caseData.expectedFindings.keyObservations.map((k, i) => (
                        <li key={i}>• {k}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {(caseData.expectedFindings.redFlags?.length ?? 0) > 0 && (
                <Card className="border-amber-500/40 bg-amber-500/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400"><AlertTriangle className="w-4 h-4" />Red flags</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {caseData.expectedFindings.redFlags.map((f, i) => (
                        <li key={i}>🚩 {f}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Critical actions checklist — local "discussed" toggle */}
        <TabsContent value="critical" className="space-y-3">
          {(caseData.studentChecklist?.filter(i => i.critical).length ?? 0) > 0 ? (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">🎯 Critical actions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {caseData.studentChecklist!.filter(i => i.critical).map(item => (
                    <li
                      key={item.id}
                      className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        discussed.has(item.id)
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-background hover:bg-muted border-border'
                      }`}
                      onClick={() => toggleDiscussed(item.id)}
                    >
                      <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 ${
                        discussed.has(item.id) ? 'bg-emerald-500 border-emerald-500' : 'border-border'
                      }`}>
                        {discussed.has(item.id) && (
                          <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        )}
                      </div>
                      <span className="text-sm">{item.description}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted-foreground mt-3 italic">
                  Click to mark as discussed — helps you keep your place during a long debrief.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No critical actions defined for this case.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Management pathway */}
        <TabsContent value="management" className="space-y-3">
          {caseData.managementPathway && (
            <>
              {(['immediate', 'definitive', 'monitoring', 'transportConsiderations'] as const).map(key => {
                const list = (caseData.managementPathway as unknown as Record<string, string[]>)[key];
                if (!list || list.length === 0) return null;
                const titles = {
                  immediate: 'Immediate',
                  definitive: 'Definitive',
                  monitoring: 'Monitoring',
                  transportConsiderations: 'Transport considerations',
                } as const;
                return (
                  <Card key={key}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">{titles[key]}</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {list.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </TabsContent>

        {/* Teaching points + pitfalls */}
        <TabsContent value="teaching" className="space-y-3">
          {(caseData.teachingPoints?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Teaching points</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {caseData.teachingPoints!.map((p, i) => (
                    <li key={i}>💡 {p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {(caseData.commonPitfalls?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Common pitfalls</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {caseData.commonPitfalls!.map((p, i) => (
                    <li key={i}>⚠ {p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ClassroomInstructorCaseView;
