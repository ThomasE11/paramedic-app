import { useMemo, useState, useEffect } from 'react';
import type { CaseScenario, CaseSession, ChecklistItem, AppliedTreatment, VitalSigns, SimulationObjective, DebriefingResource, InstructorAssessmentNote } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, XCircle, FileText, Award, AlertTriangle,
  Clock, BookOpen, Lightbulb, Download, Loader2, TrendingUp,
  Target, Star, RotateCcw, Sparkles, Activity
} from 'lucide-react';
import { exportSessionToPDF } from '@/lib/pdf-export';
import { toast } from 'sonner';
import { DebriefingResourcesPanel } from '@/components/DebriefingResourcesPanel';
import {
  evaluateTreatmentQuality,
  getResourcesForCase,
  generateYearAwareGuidance,
  assessTreatmentTiming,
  type TreatmentQualityResult,
  type FeedbackResource,
} from '@/data/clinicalRealism';

interface SessionSummaryProps {
  session: CaseSession;
  caseData: CaseScenario;
  elapsedTime?: string;
  timeTakenSeconds?: number;
  appliedTreatments?: AppliedTreatment[];
  vitalsHistory?: VitalSigns[];
  instructorNotes?: string;
  instructorAssessmentNotes?: InstructorAssessmentNote[];
  simulationObjective?: SimulationObjective;
  debriefingResources?: DebriefingResource[];
}

// Enhanced grade thresholds with more granular feedback
const GRADE_THRESHOLDS = [
  { min: 95, label: 'Outstanding', color: 'from-emerald-500 to-green-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', icon: Star },
  { min: 85, label: 'Excellent', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50 dark:bg-green-950/30', icon: Award },
  { min: 75, label: 'Very Good', color: 'from-blue-500 to-cyan-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30', icon: TrendingUp },
  { min: 65, label: 'Good', color: 'from-yellow-500 to-amber-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', icon: Target },
  { min: 50, label: 'Satisfactory', color: 'from-orange-500 to-amber-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30', icon: CheckCircle },
] as const;

const getGrade = (pct: number) => {
  for (const threshold of GRADE_THRESHOLDS) {
    if (pct >= threshold.min) return threshold;
  }
  return { 
    label: 'Needs Improvement', 
    color: 'from-red-500 to-rose-600', 
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: AlertTriangle 
  };
};

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);
  
  return count;
}

// Consequence descriptions for missed critical items
const getConsequenceForItem = (item: ChecklistItem): string | undefined => {
  if (item.critical) {
    const consequences: Record<string, string> = {
      'abcde': 'Missed ABCDE assessment can lead to failure to identify life-threatening conditions. Early systematic assessment is critical for patient survival.',
      'airway': 'Unmanaged airway leads to hypoxia within minutes and is a leading cause of preventable death.',
      'breathing': 'Unmanaged breathing problems rapidly deteriorate into respiratory failure and cardiac arrest.',
      'circulation': 'Uncontrolled hemorrhage is the most common cause of preventable trauma death. Every minute counts.',
      'disability': 'Neurological deterioration can be irreversible if not recognized and managed early.',
      'intervention': 'Delayed intervention in critical cases significantly increases mortality and morbidity.',
      'medication': 'Time-critical medications have narrow therapeutic windows. Delays reduce effectiveness and patient outcomes.',
      'safety': 'Scene safety violations put providers, patients, and bystanders at risk of injury or death.',
      'communication': 'Poor communication leads to errors, delays, and inappropriate patient care.',
    };

    const itemLower = item.description.toLowerCase();
    for (const [key, consequence] of Object.entries(consequences)) {
      if (itemLower.includes(key) || item.category === key) {
        return consequence;
      }
    }

    return 'This is a critical action that should have been performed. Missing this item could have serious consequences for patient care.';
  }
  return undefined;
};

// Generate contextual feedback for missed items
const generateFeedbackForItem = (item: ChecklistItem, caseData: CaseScenario): string => {
  // Prefer item's own rationale first
  if (item.rationale) return item.rationale;

  const desc = item.description.toLowerCase();

  // Specific medication/treatment matches (most specific first)
  if (desc.includes('glucagon')) {
    return 'Glucagon is the IM alternative when IV access is unavailable. It stimulates hepatic glycogenolysis to raise blood glucose within 10-15 minutes.';
  }
  if (desc.includes('dextrose') || desc.includes('d50') || desc.includes('d10')) {
    return 'IV dextrose is the fastest way to correct hypoglycemia in patients with impaired consciousness. D10% is preferred for controlled correction.';
  }
  if (desc.includes('oral glucose') || desc.includes('glucose tablet')) {
    return 'Oral glucose (15-20g) is first-line for conscious, cooperative hypoglycemic patients. Always reassess in 10-15 minutes.';
  }
  if (desc.includes('adrenaline') || desc.includes('epinephrine')) {
    return 'Adrenaline is the cornerstone of anaphylaxis treatment. It reverses bronchoconstriction, vasodilation, and angioedema. Give IM 0.5mg (1:1000).';
  }
  if (desc.includes('salbutamol') || desc.includes('albuterol')) {
    return 'Salbutamol is a short-acting beta-agonist that provides rapid bronchodilation. In acute asthma, administer early via nebulizer.';
  }
  if (desc.includes('aspirin')) {
    return 'Aspirin irreversibly inhibits cyclooxygenase-1, reducing platelet aggregation. Give 300mg chewed in suspected ACS.';
  }
  if (desc.includes('naloxone') || desc.includes('narcan')) {
    return 'Naloxone is a competitive opioid antagonist. Titrate to respiratory effort (not consciousness) to avoid acute withdrawal.';
  }
  if (desc.includes('midazolam') || desc.includes('diazepam') || desc.includes('seizure')) {
    return 'Benzodiazepines are first-line for prolonged seizures. Early treatment improves outcomes — do not wait for spontaneous termination beyond 5 minutes.';
  }

  // Assessment/procedure matches
  if (desc.includes('glucose') && (desc.includes('check') || desc.includes('blood') || desc.includes('reassess'))) {
    return 'Blood glucose measurement is a critical early assessment. In altered consciousness, always check glucose — it is a rapidly reversible cause.';
  }
  if (desc.includes('oxygen')) {
    return 'Oxygen should be administered to any patient with SpO2 < 94% or signs of respiratory distress. Titrate to target SpO2 94-98%.';
  }
  if (desc.includes('scene') || desc.includes('safety') || desc.includes('hazards')) {
    return 'Scene safety is Rule #1. A dead or injured provider cannot help anyone. Always assess: hazards, environment, resources, and mechanism.';
  }
  if (desc.includes('airway') || desc.includes('breathing') || desc.includes('c-spine')) {
    return 'Airway and breathing are assessed before circulation. A patient without a patent airway will die within minutes.';
  }
  if (desc.includes('precipitating') || desc.includes('cause') || desc.includes('history')) {
    return 'Identifying the precipitating cause is essential for preventing recurrence and guiding definitive management.';
  }
  if (desc.includes('iv access') || desc.includes('cannul') || desc.includes('establish iv')) {
    return 'IV access allows fluid resuscitation and medication administration. In trauma or shock, establish 2 large-bore (14-16G) IVs.';
  }
  if (desc.includes('monitor') || desc.includes('reassess') || desc.includes('vital')) {
    return 'Continuous monitoring detects deterioration early. Reassess vitals after every intervention to evaluate treatment response.';
  }

  // Category-specific fallbacks
  if (item.critical) return `This is a critical action for ${caseData.category} cases. Missing this step indicates a gap in clinical knowledge.`;
  return 'This action is part of comprehensive patient care and contributes to better clinical outcomes.';
};

export function SessionSummary({
  session,
  caseData,
  elapsedTime,
  timeTakenSeconds,
  appliedTreatments,
  vitalsHistory,
  instructorNotes,
  instructorAssessmentNotes,
  simulationObjective,
  debriefingResources
}: SessionSummaryProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportSessionToPDF({
        session,
        caseData,
        elapsedTime,
        appliedTreatments,
        vitalsHistory,
        instructorNotes,
        instructorAssessmentNotes,
        simulationObjective,
        debriefingResources
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Memoize computed values
  const completedItems = useMemo(() =>
    (caseData.studentChecklist || []).filter(item => session.completedItems.includes(item.id)),
    [caseData.studentChecklist, session.completedItems]
  );

  const missedItems = useMemo(() =>
    (caseData.studentChecklist || []).filter(item =>
      !session.completedItems.includes(item.id) && item.yearLevel?.includes(session.studentYear)
    ),
    [caseData.studentChecklist, session.completedItems, session.studentYear]
  );

  const criticalMissedItems = useMemo(() =>
    missedItems.filter(item => item.critical),
    [missedItems]
  );

  const percentage = useMemo(() =>
    session.totalPossible > 0 ? Math.round((session.score / session.totalPossible) * 100) : 0,
    [session.score, session.totalPossible]
  );

  const grade = useMemo(() => getGrade(percentage), [percentage]);
  const animatedPercentage = useAnimatedCounter(percentage, 1500);
  const animatedScore = useAnimatedCounter(session.score, 1000);

  // Calculate time efficiency
  const estimatedDuration = caseData.estimatedDuration || 30;
  const timeEfficiency = timeTakenSeconds
    ? Math.round((estimatedDuration * 60 / timeTakenSeconds) * 100)
    : null;

  const GradeIcon = grade.icon;

  return (
    <div className="space-y-6">
      {/* Hero Score Card with Gradient Background */}
      <Card className="border-2 animate-fade-in-up">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            {/* Animated Grade Badge */}
            <div className={`relative mb-6 animate-fade-in`}>
              <div className={`w-28 h-28 rounded-full border-2 border-border p-1 shadow-sm`}>
                <div className={`w-full h-full rounded-full ${grade.bgColor} flex items-center justify-center`}>
                  <GradeIcon className={`w-12 h-12`} />
                </div>
              </div>
            </div>

            {/* Animated Score Display */}
            <div className="mb-2">
              <span className="text-6xl font-bold text-foreground">
                {animatedPercentage}
              </span>
              <span className="text-3xl text-muted-foreground">%</span>
            </div>
            
            <h3 className="text-2xl font-bold mb-1 animate-fade-in-up stagger-1">{grade.label}</h3>
            
            <p className="text-muted-foreground animate-fade-in-up stagger-2">
              <span className="font-semibold text-foreground">{animatedScore}</span>
              <span className="mx-1">/</span>
              <span>{session.totalPossible}</span> points
            </p>

            {/* Time Display */}
            {elapsedTime && (
              <div className="mt-4 flex items-center gap-3 animate-fade-in-up stagger-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{elapsedTime}</span>
                </div>
                
                {timeEfficiency && timeTakenSeconds && (
                  <Badge
                    variant="outline"
                    className={`${
                      timeTakenSeconds < 120 ? 'text-orange-600 border-orange-600'
                      : timeEfficiency > 100 ? 'text-emerald-600 border-emerald-600'
                      : timeEfficiency > 80 ? 'text-yellow-600 border-yellow-600'
                      : 'text-red-600 border-red-600'
                    }`}
                  >
                    {timeTakenSeconds < 120 ? 'Incomplete \u2014 case barely started'
                      : timeEfficiency > 100 ? 'Efficient'
                      : timeEfficiency > 80 ? 'Within time'
                      : 'Over time'}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row - always 3 columns */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="animate-fade-in-up stagger-2 border-l-4 border-l-emerald-500">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{completedItems.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="hidden sm:flex w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedItems.length / (completedItems.length + missedItems.length)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-3 border-l-4 border-l-red-500">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">{missedItems.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Missed</p>
              </div>
              <div className="hidden sm:flex w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            {criticalMissedItems.length > 0 && (
              <div className="mt-2 sm:mt-3 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] sm:text-xs text-red-600 font-medium">{criticalMissedItems.length} critical</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-4 border-l-4 border-l-blue-500">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {Math.round((completedItems.length / (completedItems.length + missedItems.length || 1)) * 100)}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Completion</p>
              </div>
              <div className="hidden sm:flex w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedItems.length / (completedItems.length + missedItems.length || 1)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert - if any critical items were missed */}
      {criticalMissedItems.length > 0 && (
        <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/30 animate-fade-in-up stagger-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 animate-pulse">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Critical Actions Missed
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <p className="text-red-700 dark:text-red-300">
              The following <strong>critical</strong> actions were not performed:
            </p>
            
            {criticalMissedItems.map((item, index) => {
              const consequence = getConsequenceForItem(item);
              const feedback = generateFeedbackForItem(item, caseData);

              return (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-red-500 shadow-sm animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 shrink-0">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{item.description}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] border-red-300 text-red-600">Critical</Badge>

                      {consequence && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Clinical Impact:</p>
                          <p className="text-sm text-red-600 dark:text-red-400">{consequence}</p>
                        </div>
                      )}

                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Learning Point:
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">{feedback}</p>
                      </div>
                      <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {session.studentYear} Guidance:
                        </p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                          {generateYearAwareGuidance(item.description, item.category, session.studentYear)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <Card className="animate-fade-in-up stagger-6 border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-emerald-700 dark:text-emerald-400">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5" />
              </div>
              Completed Actions ({completedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedItems.map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 p-3 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 shrink-0 mt-0.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-sm">{item.description}</span>
                    {item.critical && (
                      <Badge className="ml-2 bg-red-600 text-white text-[10px]">Critical</Badge>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-100/50 border-emerald-300 text-emerald-700">+{item.points}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Missed Non-Critical Items */}
      {missedItems.filter(item => !item.critical).length > 0 && (
        <Card className="animate-fade-in-up stagger-7 border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-orange-700 dark:text-orange-400">
              <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <RotateCcw className="h-5 w-5" />
              </div>
              Review Items ({missedItems.filter(i => !i.critical).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {missedItems.filter(item => !item.critical).map((item, index) => {
              const feedback = generateFeedbackForItem(item, caseData);
              return (
                <div 
                  key={item.id} 
                  className="rounded-lg bg-orange-50/50 dark:bg-orange-950/20 p-3 hover:bg-orange-100/50 dark:hover:bg-orange-900/30 transition-colors animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-orange-500/20 shrink-0 mt-0.5">
                        <XCircle className="h-3.5 w-3.5 text-orange-600" />
                      </div>
                      <div>
                        <span className="text-sm">{item.description}</span>
                        <Badge variant="outline" className="ml-2 text-[10px]">{item.category}</Badge>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{item.points} pts</span>
                  </div>
                  
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded text-xs ml-6">
                    <p className="text-amber-700 dark:text-amber-300 flex items-start gap-1">
                      <BookOpen className="w-3 h-3 shrink-0 mt-0.5" />
                      {feedback}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Treatment Log — Chronological */}
      {appliedTreatments && appliedTreatments.length > 0 && (
        <Card className="animate-fade-in-up stagger-6 border-l-4 border-l-teal-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-teal-700 dark:text-teal-400">
              <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Activity className="h-5 w-5" />
              </div>
              Treatments Applied
              <Badge variant="secondary" className="ml-auto text-xs">{appliedTreatments.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-teal-200 dark:bg-teal-800" />
              <div className="space-y-3">
                {appliedTreatments.map((tx, i) => {
                  const timeStr = tx.appliedAt
                    ? new Date(tx.appliedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    : `#${i + 1}`;
                  return (
                    <div key={i} className="flex items-start gap-3 pl-1">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 text-[10px] font-semibold text-teal-700 dark:text-teal-300 z-10">
                        {timeStr}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium">{tx.name || tx.description}</p>
                        {tx.description && tx.name && (
                          <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vitals Trend Summary */}
      {vitalsHistory && vitalsHistory.length >= 2 && (() => {
        const initial = vitalsHistory[0];
        const final = vitalsHistory[vitalsHistory.length - 1];

        const vitalItems: { label: string; initial: string; final: string; unit: string; improved: boolean; worsened: boolean }[] = [];
        if (initial.pulse !== undefined && final.pulse !== undefined) {
          const improved = (initial.pulse > 100 && final.pulse < initial.pulse) || (initial.pulse < 60 && final.pulse > initial.pulse);
          const worsened = (final.pulse > 120 && final.pulse > initial.pulse) || (final.pulse < 50 && final.pulse < initial.pulse);
          vitalItems.push({ label: 'Heart Rate', initial: String(initial.pulse), final: String(final.pulse), unit: 'bpm', improved, worsened });
        }
        if (initial.bp && final.bp) {
          const initialParts = initial.bp.split('/').map(p => parseInt(p.trim()));
          const finalParts = final.bp.split('/').map(p => parseInt(p.trim()));
          const initialSbp = initialParts[0];
          const initialDbp = initialParts[1];
          const finalSbp = finalParts[0];
          const finalDbp = finalParts[1];
          if (!isNaN(initialSbp) && !isNaN(finalSbp)) {
            // Systolic: improved if moving toward 100-140 range, worsened if moving away
            const sbpImproved = (initialSbp < 100 && finalSbp > initialSbp) || (initialSbp > 150 && finalSbp < initialSbp);
            const sbpWorsened = (finalSbp < 90 && finalSbp < initialSbp) || (finalSbp > 180 && finalSbp > initialSbp);
            vitalItems.push({ label: 'Systolic BP', initial: String(initialSbp), final: String(finalSbp), unit: 'mmHg', improved: sbpImproved, worsened: sbpWorsened });
          }
          if (!isNaN(initialDbp) && !isNaN(finalDbp)) {
            // Diastolic: improved if moving toward 60-90 range, worsened if moving away
            const dbpImproved = (initialDbp < 60 && finalDbp > initialDbp) || (initialDbp > 100 && finalDbp < initialDbp);
            const dbpWorsened = (finalDbp < 50 && finalDbp < initialDbp) || (finalDbp > 110 && finalDbp > initialDbp);
            vitalItems.push({ label: 'Diastolic BP', initial: String(initialDbp), final: String(finalDbp), unit: 'mmHg', improved: dbpImproved, worsened: dbpWorsened });
          }
        }
        if (initial.respiration !== undefined && final.respiration !== undefined) {
          const improved = (initial.respiration > 20 && final.respiration < initial.respiration) || (initial.respiration < 10 && final.respiration > initial.respiration);
          const worsened = (final.respiration > 30 && final.respiration > initial.respiration) || (final.respiration < 8 && final.respiration < initial.respiration);
          vitalItems.push({ label: 'Resp Rate', initial: String(initial.respiration), final: String(final.respiration), unit: '/min', improved, worsened });
        }
        if (initial.spo2 !== undefined && final.spo2 !== undefined) {
          const improved = initial.spo2 < 94 && final.spo2 > initial.spo2;
          const worsened = final.spo2 < 90 && final.spo2 < initial.spo2;
          vitalItems.push({ label: 'SpO2', initial: String(initial.spo2), final: String(final.spo2), unit: '%', improved, worsened });
        }

        if (vitalItems.length === 0) return null;

        return (
          <Card className="animate-fade-in-up stagger-6 border-l-4 border-l-cyan-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-cyan-700 dark:text-cyan-400">
                <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <TrendingUp className="h-5 w-5" />
                </div>
                Vitals Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {vitalItems.map((v, i) => (
                  <div key={i} className={`rounded-lg border p-3 text-center ${v.improved ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20' : v.worsened ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-muted bg-muted/30'}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{v.label}</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-sm text-muted-foreground">{v.initial}</span>
                      <span className="text-xs text-muted-foreground">&rarr;</span>
                      <span className={`text-sm font-semibold ${v.improved ? 'text-emerald-700 dark:text-emerald-400' : v.worsened ? 'text-red-700 dark:text-red-400' : ''}`}>{v.final}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{v.unit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Treatment Quality Analysis — Year-Aware */}
      {appliedTreatments && appliedTreatments.length > 0 && (() => {
        const qualityResults: { treatmentName: string; result: TreatmentQualityResult; timingNote?: string }[] = [];
        for (const tx of appliedTreatments) {
          const result = evaluateTreatmentQuality(tx.id, session.completedItems.length > 0 ? caseData.vitalSignsProgression.initial : caseData.vitalSignsProgression.initial, caseData, session.studentYear);
          if (result) {
            const timing = tx.appliedAt && timeTakenSeconds !== undefined
              ? assessTreatmentTiming(tx.id, Math.min(timeTakenSeconds, 1800), caseData)
              : null;
            qualityResults.push({ treatmentName: tx.name || tx.description, result, timingNote: timing?.feedback });
          }
        }
        if (qualityResults.length === 0) return null;

        const levelColors: Record<string, string> = {
          optimal: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
          acceptable: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
          suboptimal: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
          inappropriate: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
          harmful: 'border-red-500 bg-red-50 dark:bg-red-950/20',
        };
        const levelLabels: Record<string, string> = {
          optimal: 'Optimal',
          acceptable: 'Acceptable',
          suboptimal: 'Suboptimal',
          inappropriate: 'Inappropriate',
          harmful: 'Harmful',
        };

        return (
          <Card className="animate-fade-in-up stagger-7 border-l-4 border-l-violet-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-violet-700 dark:text-violet-400">
                <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <Activity className="h-5 w-5" />
                </div>
                Treatment Quality Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {qualityResults.map((qr, i) => (
                <div key={i} className={`rounded-lg border-l-4 p-3 ${levelColors[qr.result.level]}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{qr.treatmentName}</span>
                    <Badge variant="outline" className="text-[10px]">{levelLabels[qr.result.level]} ({qr.result.score}%)</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{qr.result.feedback}</p>
                  {qr.result.yearLevelNote && (
                    <p className="text-xs mt-2 p-2 bg-violet-50 dark:bg-violet-900/20 rounded text-violet-700 dark:text-violet-300 italic">
                      {qr.result.yearLevelNote}
                    </p>
                  )}
                  {qr.timingNote && (
                    <p className="text-xs mt-1 flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {qr.timingNote}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })()}

      {/* Targeted Resources for Missed Areas */}
      {missedItems.length > 0 && (() => {
        const missedCategories = [...new Set(missedItems.map(i => i.category))];
        const resources: FeedbackResource[] = getResourcesForCase(caseData, missedCategories, session.studentYear);

        if (resources.length === 0) return null;

        return (
          <Card className="animate-fade-in-up stagger-7 border-l-4 border-l-indigo-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-indigo-700 dark:text-indigo-400">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <BookOpen className="h-5 w-5" />
                </div>
                Recommended Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resources.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-white dark:bg-gray-800 border">
                    <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5">{r.type}</Badge>
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Teaching Points */}
      <Card className="animate-fade-in-up stagger-8 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            Key Learning Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {caseData.teachingPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Common Pitfalls */}
      {caseData.commonPitfalls && caseData.commonPitfalls.length > 0 && (
        <Card className="animate-fade-in-up stagger-8 border-amber-200 bg-amber-50 dark:bg-amber-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-400">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Common Pitfalls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {caseData.commonPitfalls.map((pitfall, i) => (
                <li key={i} className="flex items-start gap-2 text-sm animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-amber-500 shrink-0">⚠</span>
                  <span className="text-gray-700 dark:text-gray-300">{pitfall}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Instructor Notes */}
      {session.notes && (
        <Card className="animate-fade-in-up stagger-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-muted">
                <FileText className="h-5 w-5" />
              </div>
              Instructor Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{session.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructor Assessment Notes */}
      {instructorAssessmentNotes && instructorAssessmentNotes.length > 0 && (
        <Card className="animate-fade-in-up stagger-8 border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-indigo-700 dark:text-indigo-400">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <FileText className="h-5 w-5" />
              </div>
              Instructor Assessment Feedback ({instructorAssessmentNotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instructorAssessmentNotes.map((note, index) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg border-l-4 animate-slide-in ${
                  note.category === 'excellent'
                    ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
                    : note.category === 'critical-miss'
                    ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
                    : 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      note.severity === 'critical' ? 'bg-red-500 text-white border-red-500'
                      : note.severity === 'important' ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-blue-500 text-white border-blue-500'
                    }`}
                  >
                    {note.severity}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{note.phase}</Badge>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {new Date(note.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm font-medium">{note.finding}</p>
                {note.whatWasMissed && note.whatWasMissed !== 'Not specified' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Missed:</span> {note.whatWasMissed}
                  </p>
                )}
                {note.whyItMatters && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Why it matters:</span> {note.whyItMatters}
                  </p>
                )}
                {note.improvementAction && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    <span className="font-medium">Action:</span> {note.improvementAction}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Debriefing Resources */}
      <DebriefingResourcesPanel
        caseData={caseData}
        objective={simulationObjective}
        resources={debriefingResources}
      />

      {/* Action Buttons */}
      <div className="flex gap-3 animate-fade-in-up stagger-9">
        <Button
          variant="outline"
          className="flex-1 h-12"
          onClick={() => window.print()}
        >
          <FileText className="mr-2 h-4 w-4" />
          Print Summary
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex-1 h-12 bg-primary"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default SessionSummary;
