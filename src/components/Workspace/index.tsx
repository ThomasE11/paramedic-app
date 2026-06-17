/**
 * Workspace Layout — Premium Glassmorphism
 * 
 * Unified layout shared between instructor and student views.
 * Left: VitalSignsMonitor (full TLC Monitor) + Quick Actions
 * Center: Scenario Context + Clinical Timeline (populates on actions)
 * Right: Body3DModel (interactive 3D exam) + Patient Info + Performance
 */

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { ClinicalTimeline } from './ClinicalTimeline';
import { ScenarioContext } from './ScenarioContext';
import { QuickActions } from './QuickActions';
import { ComplicationPanel } from '@/components/ComplicationManager';
import { AmbientBackground } from '@/components/AmbientBackground';
import { LayoutGrid, Loader2 } from 'lucide-react';
import type { VitalSigns, CaseScenario } from '@/types';
import type { ActiveComplication } from '@/components/ComplicationManager';

/**
 * Kimi spec: the timeline opens with a "Primary Survey" entry whose tags
 * are inline (Airway ✓ / Breathing ⚠ / Circulation ✗) — NOT a rigid ABCDE
 * step gate. This helper folds `caseData.abcde` into that single entry so
 * the timeline reads like a paramedic's narrative on arrival.
 *
 * Status thresholds are intentionally generous; the goal is a quick read
 * for the educator, not a clinical scoring system (which lives elsewhere
 * in the runtime contraindications + dynamic treatment engine).
 */
function buildPrimarySurveyEntry(caseData: CaseScenario) {
  const abc = caseData.abcde;
  if (!abc) return null;

  type TagVariant = 'success' | 'warning' | 'danger' | 'info';
  const tag = (label: string, variant: TagVariant) => ({ label, variant });

  // Airway: patent vs. compromised
  const airwayTag = abc.airway?.patent
    ? tag('Airway ✓', 'success')
    : tag('Airway ✗', 'danger');

  // Breathing: combine rate + SpO2 into a single severity tag
  const rr = abc.breathing?.rate;
  const spo2 = abc.breathing?.spo2;
  const breathingBad = (rr !== undefined && (rr < 10 || rr > 28)) || (spo2 !== undefined && spo2 < 90);
  const breathingMild = (rr !== undefined && (rr < 12 || rr > 22)) || (spo2 !== undefined && spo2 < 94);
  const breathingTag = breathingBad
    ? tag('Breathing ✗', 'danger')
    : breathingMild
      ? tag('Breathing ⚠', 'warning')
      : tag('Breathing ✓', 'success');

  // Circulation: BP, pulse, cap refill
  const sys = abc.circulation?.bp?.systolic;
  const crt = abc.circulation?.capillaryRefill;
  const pulseBad = (sys !== undefined && sys < 90) || (crt !== undefined && crt > 3);
  const pulseMild = (sys !== undefined && sys < 100) || (crt !== undefined && crt > 2);
  const circulationTag = pulseBad
    ? tag('Circulation ✗', 'danger')
    : pulseMild
      ? tag('Circulation ⚠', 'warning')
      : tag('Circulation ✓', 'success');

  // Disability: AVPU / GCS
  const gcs = abc.disability?.gcs?.total;
  const avpu = abc.disability?.avpu;
  const disabilityBad = (gcs !== undefined && gcs < 9) || avpu === 'U' || avpu === 'P';
  const disabilityMild = (gcs !== undefined && gcs < 14) || avpu === 'V';
  const disabilityTag = disabilityBad
    ? tag('Disability ✗', 'danger')
    : disabilityMild
      ? tag('Disability ⚠', 'warning')
      : tag('Disability ✓', 'success');

  // Description: a one-sentence narrative built from whichever fields the
  // case author filled in. Falls back gracefully if any are missing.
  const parts: string[] = [];
  if (abc.airway?.patent) parts.push('Airway patent.');
  else if (abc.airway?.findings?.length) parts.push(`Airway: ${abc.airway.findings[0]}.`);
  if (rr !== undefined) parts.push(`Breathing ${rr}/min, SpO₂ ${spo2 ?? '—'}%.`);
  if (sys !== undefined) parts.push(`BP ${sys}/${abc.circulation?.bp?.diastolic ?? '—'}, pulse ${abc.circulation?.pulseQuality ?? 'normal'}.`);
  if (gcs !== undefined) parts.push(`GCS ${gcs}.`);

  return {
    id: 'primary-survey-initial',
    type: 'assessment' as const,
    title: 'Primary Survey',
    time: 'T+0:00',
    description: parts.join(' ') || 'Initial primary survey on patient contact.',
    tags: [airwayTag, breathingTag, circulationTag, disabilityTag],
    completed: true,
  };
}

// Lazy-load the heavy full-featured components
const VitalSignsMonitor = lazy(() => import('@/components/VitalSignsMonitor').then(m => ({ default: m.VitalSignsMonitor })));
const Body3DModel = lazy(() => import('@/components/Body3DModel').then(m => ({ default: m.Body3DModel })));

interface DeteriorationStatus {
  status: 'stable' | 'worsening' | 'critical' | 'periarrest';
  timeRemaining: number;
  percentDeteriorated: number;
  urgency: 'low' | 'medium' | 'high' | 'extreme';
}

interface TimelineEvent {
  id: string;
  type: 'assessment' | 'intervention' | 'decision' | 'finding' | 'milestone';
  title: string;
  time: string;
  description: string;
  tags?: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }[];
}

interface WorkspaceLayoutProps {
  caseData: CaseScenario;
  vitals: VitalSigns | null;
  previousVitals?: VitalSigns | null;
  activeComplications?: ActiveComplication[];
  onResolveComplication?: (id: string) => void;
  onIgnoreComplication?: (id: string) => void;
  deteriorationStatus?: DeteriorationStatus;
  session?: { completedItems: string[] } | null;
  onAction?: (actionId: string) => void;
  onDecision?: (itemId: string, optionId: string) => void;
  // Props for full VitalSignsMonitor
  onVitalChange?: (vitals: VitalSigns) => void;
  onAssessmentPerformed?: (stepId: string) => void;
  onPacerStateChange?: (state: { active: boolean; rate: number; output: number }) => void;
  overridePacerState?: { active: boolean; rate: number; output: number };
  autoPowerOn?: boolean;
  appliedTreatments?: string[];
  overrideRhythm?: string;
  revealedVitals?: Set<string>;
  cprState?: {
    active: boolean;
    running: boolean;
    timerSeconds: number;
    cycleNumber: number;
    shockCount: number;
    adrenalineDoses: number;
    amiodaroneDoses: number;
    lastAdrenalineTime: number | null;
    onStartCPR: () => void;
    onPauseCPR: () => void;
    onDefibrillate: () => void;
  };
  // Props for Body3DModel
  onRegionClick?: (regionId: string) => void;
  assessedRegions?: Set<string>;
  patientSounds?: unknown;
  isInArrest?: boolean;
  isStudentView?: boolean;
  // Timeline events (populated by parent as actions happen)
  timelineEvents?: TimelineEvent[];
}

function LoadingCard() {
  return (
    <div className="glass rounded-xl p-8 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
    </div>
  );
}

export function WorkspaceLayout({
  caseData,
  vitals,
  previousVitals,
  activeComplications = [],
  onResolveComplication,
  onIgnoreComplication,
  deteriorationStatus,
  session,
  onAction,
  onDecision,
  // Full monitor props
  onVitalChange,
  onAssessmentPerformed,
  onPacerStateChange,
  overridePacerState,
  autoPowerOn = false,
  appliedTreatments = [],
  overrideRhythm,
  revealedVitals,
  cprState,
  // Body3D props
  onRegionClick,
  assessedRegions,
  patientSounds,
  isInArrest = false,
  isStudentView = false,
  // Timeline
  timelineEvents = [],
}: WorkspaceLayoutProps) {
  const [caseTimer, setCaseTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCaseTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const criticalFindings = caseData.expectedFindings?.redFlags || [];

  const tags = [
    ...(caseData.dispatchInfo?.additionalInfo || []),
    ...(caseData.sceneInfo?.hazards || []),
  ].slice(0, 5);

  /**
   * Kimi spec: derive a Primary Survey timeline entry from caseData.abcde
   * and prepend it to whatever the parent has seeded. If the parent has
   * already pushed its OWN primary-survey entry (id starts with the same
   * prefix), don't duplicate. Memoized on caseData so we don't rebuild
   * the tag bag on every vitals tick.
   */
  const derivedPrimarySurvey = useMemo(
    () => buildPrimarySurveyEntry(caseData),
    [caseData],
  );
  const timelineWithSurvey = useMemo(() => {
    if (!derivedPrimarySurvey) return timelineEvents;
    const alreadyPresent = timelineEvents.some(
      (e) => e.id === derivedPrimarySurvey.id || (e.type === 'assessment' && e.title.toLowerCase().startsWith('primary survey')),
    );
    if (alreadyPresent) return timelineEvents;
    return [derivedPrimarySurvey, ...timelineEvents];
  }, [derivedPrimarySurvey, timelineEvents]);

  return (
    <div className="workspace-shell relative border-y border-black/5 bg-[#f8f7fa] dark:bg-background overflow-hidden">
      {/* Ambient background orbs (Kimi spec) — scoped to this surface
          via the `absolute` variant so they don't double up with the
          App.tsx page-level <AmbientBackground/> when both are mounted. */}
      <AmbientBackground variant="absolute" />

      {/* Case Header — translucent strip over the ambient bg */}
      <div className="border-b border-black/5 bg-white/40 backdrop-blur-sm relative z-10">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
              <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Live Case</span>
              </div>
              <div className="hidden h-4 w-px bg-black/10 sm:block"></div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-surface-900 sm:text-lg">{caseData.title}</h1>
                <p className="text-xs text-surface-400">
                  {caseData.patientInfo.age}-year-old {caseData.patientInfo.gender} · Category: {caseData.category} · Difficulty: {caseData.complexity}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {deteriorationStatus && (
                <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-wider ${
                  deteriorationStatus.urgency === 'extreme' ? 'border-critical-200 bg-critical-50 text-critical-700' :
                  deteriorationStatus.urgency === 'high' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                  deteriorationStatus.urgency === 'medium' ? 'border-warning-200 bg-warning-50 text-warning-600' :
                  'border-success-200 bg-success-50 text-success-600'
                }`}>
                  {deteriorationStatus.status}
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 text-xs font-mono text-surface-600 border border-surface-200">
                <LayoutGrid className="w-3 h-3" />
                <span>{formatTime(caseTimer)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Grid — Kimi 3-6-3 of 12 columns at xl+. Below xl we
          collapse to one column so the mobile/tablet experience stays
          readable. */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-5 relative z-10">
        <div className="grid grid-cols-12 gap-5 items-start">
          
          {/* LEFT (3 of 12): Patient Monitor + Quick Actions. Kimi mockup
              order: monitor first, actions below — mirrors the way a
              paramedic glances at the screen on arrival. */}
          <div className="col-span-12 lg:col-span-3 space-y-4 min-w-0">
            <QuickActions onAction={onAction} />

            <Suspense fallback={<LoadingCard />}>
              <VitalSignsMonitor
                initialVitals={vitals || caseData.vitalSignsProgression.initial}
                previousVitals={previousVitals}
                deteriorationVitals={caseData.vitalSignsProgression.deterioration}
                onVitalChange={onVitalChange}
                onAssessmentPerformed={onAssessmentPerformed}
                onPacerStateChange={onPacerStateChange}
                overridePacerState={overridePacerState}
                autoPowerOn={autoPowerOn}
                caseCategory={caseData.category}
                caseSubcategory={caseData.subcategory}
                caseTitle={caseData.title}
                ecgFindings={caseData.abcde?.circulation?.ecgFindings}
                appliedTreatments={appliedTreatments}
                overrideRhythm={overrideRhythm}
                revealedVitals={revealedVitals}
                cprState={cprState}
              />
            </Suspense>

            {activeComplications.length > 0 && onResolveComplication && onIgnoreComplication && (
              <ComplicationPanel
                activeComplications={activeComplications}
                onResolve={onResolveComplication}
                onIgnore={onIgnoreComplication}
              />
            )}
          </div>

          {/* CENTER (6 of 12): Scenario context + Clinical Timeline.
              This IS the primary workspace surface — the timeline drives
              the case forward via Primary Survey -> findings -> decision
              points -> interventions, instead of the rigid ABCDE step
              gate the old layout used. */}
          <div className="col-span-12 lg:col-span-6 space-y-4 min-w-0">
            <ScenarioContext
              title={caseData.title}
              category={caseData.category}
              difficulty={caseData.complexity}
              patientAge={caseData.patientInfo.age}
              patientGender={caseData.patientInfo.gender}
              location={caseData.dispatchInfo.location}
              description={caseData.initialPresentation?.generalImpression || caseData.dispatchInfo.callReason}
              criticalFindings={criticalFindings}
              tags={tags}
            />
            
            <ClinicalTimeline
              items={timelineWithSurvey}
              onDecision={onDecision}
            />
          </div>

          {/* RIGHT (3 of 12): 3D anatomy explorer + Patient profile +
              Performance score ring + Clinical guidelines. */}
          <div className="col-span-12 lg:col-span-3 space-y-4 min-w-0">
            <Suspense fallback={<LoadingCard />}>
              <Body3DModel
                onRegionClick={onRegionClick}
                assessedRegions={assessedRegions || new Set()}
                caseData={caseData}
                patientSounds={patientSounds}
                caseCategory={caseData.category}
                isInArrest={isInArrest}
                isStudentView={isStudentView}
              />
            </Suspense>
            
            {/* Patient Demographics */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Patient Profile</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Age/Gender</span>
                  <span className="text-xs font-medium text-surface-800">
                    {caseData.patientInfo.age}y / {caseData.patientInfo.gender}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Weight</span>
                  <span className="text-xs font-medium text-surface-800">{caseData.patientInfo.weight} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Language</span>
                  <span className="text-xs font-medium text-surface-800">{caseData.patientInfo.language}</span>
                </div>
                {caseData.patientInfo.medicalConditions?.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-500">PMH</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {caseData.patientInfo.medicalConditions.slice(0, 3).map((condition) => (
                        <span
                          key={condition}
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-surface-100 text-surface-600 border border-surface-200"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Score */}
            <PerformanceScore caseData={caseData} session={session} />

            {/* Guidelines */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Clinical Guidelines</h4>
              <div className="space-y-2">
                {caseData.references?.slice(0, 4).map((ref, i) => {
                  const isUrl = /^https?:\/\//i.test(ref);
                  const content = (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                      <span className="text-xs text-surface-700 group-hover:text-brand-700 transition-colors truncate">
                        {ref.replace(/^https?:\/\//, '').substring(0, 48)}{ref.length > 48 ? '...' : ''}
                      </span>
                    </>
                  );

                  return isUrl ? (
                    <a
                      key={i}
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-50/50 transition-colors text-left group"
                    >
                      {content}
                    </a>
                  ) : (
                    <div
                      key={i}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left"
                    >
                      {content}
                    </div>
                  );
                }) || (
                  <>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-50/50 transition-colors text-left group">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                      <span className="text-xs text-surface-700 group-hover:text-brand-700 transition-colors">ACLS Protocol</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-50/50 transition-colors text-left group">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                      <span className="text-xs text-surface-700 group-hover:text-brand-700 transition-colors">{caseData.category} Guidelines</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Performance Score Component
function PerformanceScore({ caseData, session }: { caseData: CaseScenario; session?: { completedItems: string[] } | null }) {
  const completedCount = session?.completedItems.length ?? 0;
  const totalItems = caseData.studentChecklist?.length ?? 0;
  const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  
  const categories = ['abcde', 'intervention', 'transport'];
  const categoryProgress = categories.map(cat => {
    const catItems = caseData.studentChecklist?.filter(item => item.category === cat) ?? [];
    const catCompleted = catItems.filter(item => session?.completedItems.includes(item.id)).length;
    const catPercent = catItems.length > 0 ? Math.round((catCompleted / catItems.length) * 100) : 0;
    return { name: cat.charAt(0).toUpperCase() + cat.slice(1), percent: catPercent };
  });

  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass rounded-xl p-4">
      <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Performance</h4>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 score-ring" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="score-ring-circle"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#db2777"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-surface-800">{percentage}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {categoryProgress.map((metric) => (
            <div key={metric.name} className="flex items-center justify-between">
              <span className="text-[10px] text-surface-500">{metric.name}</span>
              <div className="w-20 h-1.5 rounded-full bg-surface-200 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${metric.percent}%`,
                    background: metric.percent > 70 ? '#4ade80' : metric.percent > 40 ? '#fbbf24' : '#a3a3a3'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkspaceLayout;
