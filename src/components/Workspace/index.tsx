/**
 * Workspace Layout — Premium Glassmorphism
 * 
 * Unified layout shared between instructor and student views.
 * Left: VitalSignsMonitor (full TLC Monitor) + Quick Actions
 * Center: Scenario Context + Clinical Timeline (populates on actions)
 * Right: Body3DModel (interactive 3D exam) + Patient Info + Performance
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { ClinicalTimeline } from './ClinicalTimeline';
import { ScenarioContext } from './ScenarioContext';
import { QuickActions } from './QuickActions';
import { ComplicationPanel } from '@/components/ComplicationManager';
import { LayoutGrid, Loader2 } from 'lucide-react';
import type { VitalSigns, CaseScenario } from '@/types';
import type { ActiveComplication } from '@/components/ComplicationManager';

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

  return (
    <div className="relative border-y border-border/60 bg-surface-50/80 dark:bg-background">
      {/* Case Header */}
      <div className="border-b border-border/70 bg-background/95 relative z-10">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
              <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Live Case</span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block"></div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-surface-900 sm:text-lg">{caseData.title}</h1>
                <p className="text-xs text-surface-500">
                  {caseData.patientInfo.age}-year-old {caseData.patientInfo.gender} · Category: {caseData.category} · Difficulty: {caseData.complexity}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {deteriorationStatus && (
                <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-wider ${
                  deteriorationStatus.urgency === 'extreme' ? 'border-red-200 bg-red-50 text-red-700' :
                  deteriorationStatus.urgency === 'high' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                  deteriorationStatus.urgency === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                  'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}>
                  {deteriorationStatus.status}
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 text-xs font-mono text-surface-700 border border-surface-200">
                <LayoutGrid className="w-3 h-3" />
                <span>{formatTime(caseTimer)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 py-4 relative z-10">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)_320px] items-start">
          
          {/* LEFT: Quick Actions + VitalSignsMonitor */}
          <div className="space-y-4 min-w-0">
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

          {/* CENTER: Scenario + Timeline */}
          <div className="space-y-4 min-w-0">
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
              items={timelineEvents}
              onDecision={onDecision}
            />
          </div>

          {/* RIGHT: Body3DModel + Info + Performance */}
          <div className="space-y-4 min-w-0">
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
