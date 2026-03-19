/**
 * Clinical Assessment Panel (Student-facing)
 *
 * Interactive clinical assessment interface for the student.
 * Organized into collapsible phases:
 *  - Primary Survey (ABCDE)
 *  - Secondary Survey (case-dependent)
 *  - History Taking (SAMPLE)
 *  - Special Assessments (case-specific)
 *
 * Students click each step to "perform" it and reveal findings.
 * All actions are timestamped for the debrief.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield, Wind, Stethoscope, Heart, Brain, Thermometer,
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
  CircleDot, Clock, Eye, Search, MessageCircle,
  Activity, Pill, FileText, Coffee, Scan, User,
  ArrowUpDown, RotateCcw, Hand, AlertCircle,
  Info,
} from 'lucide-react';
import type { CaseCategory } from '@/types';
import {
  type AssessmentStepId,
  type AssessmentStepDefinition,
  type AssessmentFinding,
  type AssessmentTracker,
  type AssessmentPhase,
  PRIMARY_STEPS,
  SECONDARY_STEPS,
  HISTORY_STEPS,
  SPECIAL_STEPS,
  ALL_STEPS,
  getAssessmentProfile,
} from '@/data/assessmentFramework';

// ============================================================================
// Icon mapping
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield, Wind, Stethoscope, Heart, Brain, Thermometer,
  Scan, User, ArrowUpDown, RotateCcw, Hand,
  MessageCircle, AlertCircle, Pill, FileText, Coffee, Clock,
  Activity, Search, Eye, CircleDot, Info,
  // Fallbacks for icons not in lucide-react
  Bone: CircleDot,
  Circle: CircleDot,
  Baby: Heart,
  Calculator: Activity,
  Flame: AlertTriangle,
  Flask: Search,
  Gauge: Activity,
  Droplet: CircleDot,
};

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || CircleDot;
}

// ============================================================================
// Types
// ============================================================================

interface ClinicalAssessmentPanelProps {
  caseCategory: CaseCategory;
  tracker: AssessmentTracker;
  onPerformAssessment: (stepId: AssessmentStepId) => void;
  /** Currently revealed findings (from the most recent assessment) */
  activeFindings: { stepId: AssessmentStepId; findings: AssessmentFinding[] } | null;
}

// ============================================================================
// Sub-components
// ============================================================================

function FindingBadge({ finding }: { finding: AssessmentFinding }) {
  const colorMap = {
    normal: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    abnormal: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    critical: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  };

  return (
    <div className={`rounded-lg border p-2 sm:p-2.5 ${colorMap[finding.severity]}`}>
      <div className="flex items-start gap-1.5 sm:gap-2">
        {finding.severity === 'critical' && <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 mt-0.5" />}
        {finding.severity === 'abnormal' && <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 mt-0.5" />}
        {finding.severity === 'normal' && <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 mt-0.5" />}
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider opacity-70">{finding.label}</span>
          <p className="text-[11px] sm:text-xs font-medium leading-relaxed">{finding.value}</p>
          {finding.significance && (
            <p className="text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 opacity-70 italic">{finding.significance}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AssessmentStepButton({
  step,
  isPerformed,
  isRequired,
  isRecommended,
  performedOrder,
  onPerform,
}: {
  step: AssessmentStepDefinition;
  isPerformed: boolean;
  isRequired: boolean;
  isRecommended: boolean;
  performedOrder?: number;
  onPerform: () => void;
}) {
  const Icon = getIcon(step.icon);

  return (
    <Button
      variant={isPerformed ? 'outline' : 'default'}
      size="sm"
      onClick={onPerform}
      className={`
        justify-start gap-1.5 sm:gap-2 h-auto py-2 sm:py-2.5 px-2 sm:px-3 text-left w-full transition-all rounded-xl
        ${isPerformed
          ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30'
          : isRequired
            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
            : 'bg-muted/60 hover:bg-muted text-foreground border border-border/50'
        }
      `}
    >
      <div className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg shrink-0 ${
        isPerformed ? 'bg-green-500/15' : isRequired ? 'bg-white/20' : 'bg-muted'
      }`}>
        {isPerformed ? (
          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
        ) : (
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-[11px] sm:text-xs font-semibold truncate">{step.shortLabel}</span>
          {isPerformed && performedOrder && (
            <Badge variant="outline" className="text-[8px] sm:text-[9px] py-0 h-3.5 sm:h-4 bg-green-500/10 border-green-500/30">
              #{performedOrder}
            </Badge>
          )}
          {!isPerformed && isRequired && (
            <Badge variant="outline" className="text-[8px] sm:text-[9px] py-0 h-3.5 sm:h-4 bg-white/20 border-white/30 text-white hidden xs:inline-flex">
              Required
            </Badge>
          )}
          {!isPerformed && isRecommended && (
            <Badge variant="outline" className="text-[8px] sm:text-[9px] py-0 h-3.5 sm:h-4 hidden xs:inline-flex">
              Rec'd
            </Badge>
          )}
        </div>
        <span className="text-[9px] sm:text-[10px] opacity-70 line-clamp-1">{step.description}</span>
      </div>
      {!isPerformed && (
        <div className="text-[9px] sm:text-[10px] font-mono opacity-60 shrink-0">
          +{step.points}
        </div>
      )}
    </Button>
  );
}

// ============================================================================
// Phase sections
// ============================================================================

function PhaseSection({
  title,
  description,
  phase,
  steps,
  tracker,
  onPerform,
  defaultExpanded,
  activeFindings,
  phaseColor,
}: {
  title: string;
  description: string;
  phase: AssessmentPhase;
  steps: AssessmentStepDefinition[];
  tracker: AssessmentTracker;
  onPerform: (stepId: AssessmentStepId) => void;
  defaultExpanded: boolean;
  activeFindings: { stepId: AssessmentStepId; findings: AssessmentFinding[] } | null;
  phaseColor: string;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const performedInPhase = tracker.performed.filter(p => p.phase === phase);
  const totalInPhase = steps.length;
  const completionPct = totalInPhase > 0 ? Math.round((performedInPhase.length / totalInPhase) * 100) : 0;

  // Active findings for this phase
  const activeFindingsInPhase = activeFindings && steps.some(s => s.id === activeFindings.stepId)
    ? activeFindings
    : null;

  return (
    <Card className={`border overflow-hidden rounded-xl sm:rounded-2xl ${performedInPhase.length === totalInPhase && totalInPhase > 0 ? 'border-green-300 dark:border-green-800' : 'border-border/60'}`}>
      <CardHeader
        className={`pb-2 px-3 sm:px-6 pt-3 sm:pt-4 cursor-pointer hover:bg-muted/30 transition-colors ${phaseColor}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <span className="flex-1 truncate">{title}</span>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
            <Badge variant="secondary" className="text-[9px] sm:text-[10px]">
              {performedInPhase.length}/{totalInPhase}
            </Badge>
            {completionPct === 100 && (
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
            )}
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-50" /> : <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-50" />}
          </div>
        </CardTitle>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 sm:line-clamp-none">{description}</p>

        {/* Progress bar within header */}
        {!isExpanded && completionPct > 0 && completionPct < 100 && (
          <div className="h-1 rounded-full bg-muted mt-1 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2 pb-3 sm:pb-4 px-3 sm:px-6 space-y-2">
          {/* Step buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-1.5">
            {steps.map(step => {
              const performed = tracker.performed.find(p => p.stepId === step.id);
              return (
                <AssessmentStepButton
                  key={step.id}
                  step={step}
                  isPerformed={!!performed}
                  isRequired={tracker.required.includes(step.id)}
                  isRecommended={tracker.recommended.includes(step.id)}
                  performedOrder={performed?.order}
                  onPerform={() => onPerform(step.id)}
                />
              );
            })}
          </div>

          {/* Show findings from the last assessment in this phase */}
          {activeFindingsInPhase && (
            <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {ALL_STEPS[activeFindingsInPhase.stepId]?.label} — Findings
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {activeFindingsInPhase.findings.map((f, i) => (
                  <FindingBadge key={i} finding={f} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ClinicalAssessmentPanel({
  caseCategory,
  tracker,
  onPerformAssessment,
  activeFindings,
}: ClinicalAssessmentPanelProps) {
  const profile = useMemo(() => getAssessmentProfile(caseCategory), [caseCategory]);

  // Filter secondary steps to only show relevant ones for this case profile
  const relevantSecondarySteps = useMemo(() => {
    const relevant = new Set<string>([
      ...profile.requiredSecondary,
      ...profile.recommendedSecondary,
    ]);
    // If no secondary steps are specified, show all (fallback for general cases)
    if (relevant.size === 0) return SECONDARY_STEPS;
    return SECONDARY_STEPS.filter(s => relevant.has(s.id));
  }, [profile]);

  // Filter special steps to only show relevant ones for this case
  const relevantSpecialSteps = useMemo(() => {
    const relevant = new Set<string>([
      ...profile.requiredSpecial,
      ...profile.recommendedSpecial,
    ]);
    // Always include pain and BGL as they're universal
    relevant.add('pain-assessment');
    relevant.add('blood-glucose');
    return SPECIAL_STEPS.filter(s => relevant.has(s.id));
  }, [profile]);

  // Calculate overall progress
  const totalRequired = tracker.required.length;
  const completedRequired = tracker.performed.filter(p => tracker.required.includes(p.stepId)).length;
  const overallPct = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Assessment Header */}
      <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 shrink-0">
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold tracking-tight">Clinical Assessment</h3>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground hidden xs:block">
              Perform assessments to reveal findings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Badge variant={overallPct === 100 ? 'default' : 'secondary'} className={`text-[9px] sm:text-[10px] ${overallPct === 100 ? 'bg-green-500' : ''}`}>
            {completedRequired}/{totalRequired} req'd
          </Badge>
          <Badge variant="outline" className="text-[9px] sm:text-[10px]">
            {tracker.earnedPoints} pts
          </Badge>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-1 sm:h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${overallPct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${overallPct}%` }}
        />
      </div>

      {/* Phase Sections */}
      <PhaseSection
        title="Primary Survey (ABCDE)"
        description="Systematic life-threat assessment. Always performed first."
        phase="primary"
        steps={PRIMARY_STEPS}
        tracker={tracker}
        onPerform={onPerformAssessment}
        defaultExpanded={true}
        activeFindings={activeFindings}
        phaseColor="bg-gradient-to-r from-red-500/5 to-transparent"
      />

      <PhaseSection
        title={profile.secondarySurveyLabel}
        description={profile.secondarySurveyDescription}
        phase="secondary"
        steps={relevantSecondarySteps}
        tracker={tracker}
        onPerform={onPerformAssessment}
        defaultExpanded={false}
        activeFindings={activeFindings}
        phaseColor="bg-gradient-to-r from-amber-500/5 to-transparent"
      />

      <PhaseSection
        title="History Taking (SAMPLE)"
        description="Signs & Symptoms, Allergies, Medications, Past medical, Last meal, Events."
        phase="history"
        steps={HISTORY_STEPS}
        tracker={tracker}
        onPerform={onPerformAssessment}
        defaultExpanded={false}
        activeFindings={activeFindings}
        phaseColor="bg-gradient-to-r from-blue-500/5 to-transparent"
      />

      {relevantSpecialSteps.length > 0 && (
        <PhaseSection
          title="Special Assessments"
          description="Case-specific assessments and investigations."
          phase="special"
          steps={relevantSpecialSteps}
          tracker={tracker}
          onPerform={onPerformAssessment}
          defaultExpanded={false}
          activeFindings={activeFindings}
          phaseColor="bg-gradient-to-r from-purple-500/5 to-transparent"
        />
      )}
    </div>
  );
}

export default ClinicalAssessmentPanel;
