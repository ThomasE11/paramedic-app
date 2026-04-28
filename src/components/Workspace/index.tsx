/**
 * Workspace Layout - Main 3-Column Non-Linear Design
 * 
 * Left: Patient Monitor + Quick Actions
 * Center: Scenario Context + Clinical Timeline
 * Right: 3D Anatomy + Patient Info + Performance
 * 
 * Mobile: Stacks vertically with collapsible sections
 */

import { useState } from 'react';
import { PatientMonitor } from './PatientMonitor';
import { AnatomyExplorer } from './AnatomyExplorer';
import { ClinicalTimeline } from './ClinicalTimeline';
import { ScenarioContext } from './ScenarioContext';
import { QuickActions } from './QuickActions';
import { PhysicalExaminationPanel } from './PhysicalExaminationPanel';
import { ABCDENavigation } from './ABCDENavigation';
import { ComplicationPanel } from '@/components/ComplicationManager';
import { ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';
import type { VitalSigns, CaseScenario } from '@/types';
import type { ActiveComplication } from '@/components/ComplicationManager';

interface DeteriorationStatus {
  status: 'stable' | 'worsening' | 'critical' | 'periarrest';
  timeRemaining: number;
  percentDeteriorated: number;
  urgency: 'low' | 'medium' | 'high' | 'extreme';
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
}

// Sample timeline data - in production this would come from the case
const sampleTimeline = [
  {
    id: '1',
    type: 'assessment' as const,
    title: 'Primary Survey',
    time: 'T+0:00',
    description: 'Patient conscious, airway patent. Breathing rapid and shallow. Circulation compromised — weak radial pulse, delayed capillary refill.',
    tags: [
      { label: 'Airway ✓', variant: 'success' as const },
      { label: 'Breathing ⚠', variant: 'warning' as const },
      { label: 'Circulation ✗', variant: 'danger' as const },
    ],
    completed: true,
  },
  {
    id: '2',
    type: 'finding' as const,
    title: '12-Lead ECG Acquired',
    time: 'T+0:04',
    description: 'ST elevation in leads II, III, aVF. ST depression in V1-V3. Inferior STEMI with reciprocal changes.',
    completed: true,
  },
  {
    id: '3',
    type: 'intervention' as const,
    title: 'IV Access Established',
    time: 'T+0:08',
    description: '18G IV cannula inserted in left antecubital vein. Bloods drawn for troponin, FBC, U&E, coagulation screen.',
    completed: true,
  },
  {
    id: '4',
    type: 'decision' as const,
    title: 'Decision Point',
    time: 'T+0:12',
    description: 'Patient BP continues to drop (82/48). Heart rate increasing (88 bpm). What is your next priority intervention?',
    options: [
      { id: 'fluids', label: 'Administer Fluid Bolus', description: '250ml crystalloid, reassess' },
      { id: 'vasopressor', label: 'Start Vasopressor', description: 'Noradrenaline infusion via IO/IV' },
      { id: 'transport', label: 'Rapid Transport', description: 'Load and go — cath lab activation' },
    ],
  },
];

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
}: WorkspaceLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [activeABCDEStep, setActiveABCDEStep] = useState<string>('airway');
  const [completedABCDESteps, setCompletedABCDESteps] = useState<string[]>([]);

  // Get critical findings from case data
  const criticalFindings = caseData.expectedFindings?.redFlags || [];
  
  // Get tags from case
  const tags = [
    ...(caseData.dispatchInfo?.additionalInfo || []),
    ...(caseData.sceneInfo?.hazards || []),
  ].slice(0, 5);

  const handleABCDEStepClick = (stepId: string) => {
    setActiveABCDEStep(stepId);
    if (!completedABCDESteps.includes(stepId)) {
      setCompletedABCDESteps(prev => [...prev, stepId]);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT: Patient Monitor + Quick Actions (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Mobile toggle */}
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-2 glass rounded-lg text-sm font-medium text-surface-700"
          >
            <span className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Monitor & Actions
            </span>
            {leftCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <div className={`space-y-4 ${leftCollapsed ? 'hidden lg:block' : ''}`}>
            <PatientMonitor
              vitals={vitals}
              previousVitals={previousVitals}
              deteriorationStatus={deteriorationStatus}
            />
            <QuickActions onAction={onAction} />
            {activeComplications.length > 0 && onResolveComplication && onIgnoreComplication && (
              <ComplicationPanel
                activeComplications={activeComplications}
                onResolve={onResolveComplication}
                onIgnore={onIgnoreComplication}
              />
            )}
          </div>
        </div>

        {/* CENTER: Scenario + ABCDE + Timeline (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
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
          
          {/* ABCDE Step Navigation */}
          <ABCDENavigation
            activeStep={activeABCDEStep}
            completedSteps={completedABCDESteps}
            onStepClick={handleABCDEStepClick}
          />
          
          <ClinicalTimeline
            items={sampleTimeline}
            onDecision={onDecision}
          />
        </div>

        {/* RIGHT: Anatomy + Info + Performance (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Mobile toggle */}
          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-2 glass rounded-lg text-sm font-medium text-surface-700"
          >
            <span className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Anatomy & Info
            </span>
            {rightCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <div className={`space-y-4 ${rightCollapsed ? 'hidden lg:block' : ''}`}>
            {/* 3D Physical Examination - replaces simple SVG AnatomyExplorer */}
            <PhysicalExaminationPanel
              caseData={caseData}
              isStudentView={false}
            />
            
            {/* Patient Demographics Card */}
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

            {/* Performance Score — Dynamic */}
            <PerformanceScore caseData={caseData} session={session} />

            {/* Guidelines */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Clinical Guidelines</h4>
              <div className="space-y-2">
                {caseData.references?.slice(0, 4).map((ref, i) => (
                  <a
                    key={i}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-50/50 transition-colors text-left group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    <span className="text-xs text-surface-700 group-hover:text-brand-700 transition-colors truncate">
                      {ref.replace(/^https?:\/\//, '').substring(0, 40)}...
                    </span>
                  </a>
                )) || (
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
  
  // Calculate category progress
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
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
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
              className="transition-all duration-1000"
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
                  className="h-full rounded-full bg-brand-400 transition-all duration-500" 
                  style={{ width: `${metric.percent}%` }} 
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
