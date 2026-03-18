/**
 * Student Panel
 *
 * Streamlined student-facing interface with guided case flow:
 * 1. Pre-Briefing: Select/generate a case, review pre-briefing info
 * 2. Case Presentation: Dispatch info, scene, patient presentation
 * 3. Vitals & Treatment: Monitor, treatments, interventions
 * 4. Transport / End Care: Decision point
 * 5. Post-Case Report: Performance feedback, resources, learning points
 */

import { useState, useCallback, useMemo, lazy, Suspense, useEffect, useRef } from 'react';
import type { CaseScenario, StudentYear, CaseSession, VitalSigns, AppliedTreatment } from '@/types';
import { allCases, getRandomCase, yearLevels, caseCategories } from '@/data/cases';
import { ensureCompleteVitals } from '@/data/treatmentEffects';
import { type Treatment } from '@/data/enhancedTreatmentEffects';
import {
  type PatientState,
  type DefibrillationParams,
  createInitialPatientState,
  applyDynamicTreatment,
  applyDeterioration,
} from '@/data/dynamicTreatmentEngine';
import { useGradualVitalChanges } from '@/hooks/useGradualVitalChanges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Stethoscope, GraduationCap, Activity, Clock, ArrowLeft, ArrowRight,
  Sparkles, CheckCircle2, AlertTriangle, FileText, Loader2, BookOpen,
  Ambulance, XCircle, Heart, Shield, ChevronRight, BarChart3,
  ClipboardCheck, Star, TrendingUp, TrendingDown, Minus, ExternalLink,
  RotateCcw, Zap, Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import { AuscultationPanel } from '@/components/AuscultationPanel';
import { DefibrillationDialog } from '@/components/DefibrillationDialog';
import { ClinicalAssessmentPanel } from '@/components/ClinicalAssessmentPanel';
import {
  type AssessmentStepId,
  type AssessmentFinding,
  type AssessmentTracker,
  createAssessmentTracker,
  performAssessment as performAssessmentStep,
  generateAssessmentDebrief,
} from '@/data/assessmentFramework';
import {
  evaluateTreatmentQuality,
  getResourcesForCase,
  generateYearAwareGuidance,
  assessTreatmentTiming,
  type TreatmentQualityResult,
  type FeedbackResource,
} from '@/data/clinicalRealism';

// Lazy load heavy components
const CaseDisplay = lazy(() => import('@/components/CaseDisplay').then(m => ({ default: m.CaseDisplay })));
const VitalSignsMonitor = lazy(() => import('@/components/VitalSignsMonitor').then(m => ({ default: m.VitalSignsMonitor })));
const TreatmentApplicationPanel = lazy(() => import('@/components/TreatmentApplicationPanel').then(m => ({ default: m.TreatmentApplicationPanel })));

function LoadingCard() {
  return (
    <Card>
      <CardContent className="p-8 flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </CardContent>
    </Card>
  );
}

type StudentPhase = 'select' | 'prebriefing' | 'case' | 'vitals' | 'postcase';

interface StudentPanelProps {
  onExit: () => void;
}

export function StudentPanel({ onExit }: StudentPanelProps) {
  // Core state
  const [phase, setPhase] = useState<StudentPhase>('select');
  const [currentCase, setCurrentCase] = useState<CaseScenario | null>(null);
  const [selectedYear, setSelectedYear] = useState<StudentYear>('3rd-year');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Session tracking
  const [session, setSession] = useState<CaseSession | null>(null);
  const [currentVitals, setCurrentVitals] = useState<VitalSigns | null>(null);
  const [previousVitals, setPreviousVitals] = useState<VitalSigns | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalSigns[]>([]);
  const [appliedTreatments, setAppliedTreatments] = useState<AppliedTreatment[]>([]);
  const [appliedTreatmentIds, setAppliedTreatmentIds] = useState<string[]>([]);
  const [applyingTreatmentId, setApplyingTreatmentId] = useState<string | null>(null);

  // Dynamic treatment engine state
  const [patientState, setPatientState] = useState<PatientState | null>(null);
  const [showDefibDialog, setShowDefibDialog] = useState(false);
  const [pendingDefibTreatment, setPendingDefibTreatment] = useState<Treatment | null>(null);
  const deteriorationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Assessment tracking
  const [assessmentTracker, setAssessmentTracker] = useState<AssessmentTracker | null>(null);
  const [activeFindings, setActiveFindings] = useState<{ stepId: AssessmentStepId; findings: AssessmentFinding[] } | null>(null);

  // Timer
  const [caseStartTime, setCaseStartTime] = useState<number | null>(null);
  const [caseEndTime, setCaseEndTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Treatment effects
  const {
    currentVitals: animatedVitals,
    isAnimating: isVitalsAnimating,
    progress: vitalChangeProgress,
    startGradualChange,
  } = useGradualVitalChanges();

  useEffect(() => {
    if (animatedVitals && !isVitalsAnimating) {
      setCurrentVitals(animatedVitals);
    }
  }, [animatedVitals, isVitalsAnimating]);

  // Timer effect
  useEffect(() => {
    if (!caseStartTime || caseEndTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - caseStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [caseStartTime, caseEndTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Generate case
  const generateCase = useCallback(async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    const newCase = getRandomCase({
      yearLevel: selectedYear,
      category: selectedCategory !== 'all' ? selectedCategory : undefined
    });

    setCurrentCase(newCase);
    const initialVitals = ensureCompleteVitals(newCase.vitalSignsProgression.initial);
    setCurrentVitals(initialVitals);
    setVitalsHistory([initialVitals]);
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    setCaseStartTime(null);
    setCaseEndTime(null);
    setElapsedSeconds(0);

    // Initialize dynamic treatment engine patient state
    const initialPatientState = createInitialPatientState(newCase);
    setPatientState(initialPatientState);

    // Initialize assessment tracker
    const initialTracker = createAssessmentTracker(newCase);
    setAssessmentTracker(initialTracker);
    setActiveFindings(null);

    const newSession: CaseSession = {
      id: Date.now().toString(),
      caseId: newCase.id,
      studentYear: selectedYear,
      generatedAt: new Date().toISOString(),
      completedItems: [],
      notes: '',
      score: 0,
      totalPossible: (newCase.studentChecklist || [])
        .filter(item => item.yearLevel?.includes(selectedYear))
        .reduce((sum, item) => sum + (item.points || 0), 0),
    };
    setSession(newSession);

    setIsGenerating(false);
    setPhase('prebriefing');
    toast.success(`Case generated: ${newCase.title}`);
  }, [selectedYear, selectedCategory]);

  // Start case (from pre-briefing)
  const startCase = useCallback(() => {
    setCaseStartTime(Date.now());
    setPhase('vitals');
    toast.success('Case started — assess the patient and begin treatment');

    // Start deterioration timer — patient deteriorates if not treated
    if (deteriorationIntervalRef.current) clearInterval(deteriorationIntervalRef.current);
    deteriorationIntervalRef.current = setInterval(() => {
      setPatientState(prev => {
        if (!prev || !currentCase) return prev;
        const newState = applyDeterioration(prev, currentCase, 30);
        if (newState.vitals.spo2 !== prev.vitals.spo2 || newState.vitals.pulse !== prev.vitals.pulse) {
          setCurrentVitals(ensureCompleteVitals(newState.vitals));
        }
        return newState;
      });
    }, 30000); // Check every 30 seconds
  }, [currentCase]);

  // Apply treatment — uses dynamic treatment engine
  const applyTreatment = useCallback((treatment: Treatment, defibParams?: DefibrillationParams) => {
    if (!currentVitals || !currentCase || !patientState) return;

    // Defibrillation requires energy/mode selection
    if (treatment.id === 'defibrillation' && !defibParams) {
      setPendingDefibTreatment(treatment);
      setShowDefibDialog(true);
      return;
    }

    setApplyingTreatmentId(treatment.id);

    // Use dynamic treatment engine
    const { newState, response } = applyDynamicTreatment(
      treatment,
      patientState,
      currentCase,
      defibParams,
    );

    // Update patient state
    setPatientState(newState);

    // Build applied treatment record
    const newTreatment: AppliedTreatment = {
      id: treatment.id,
      name: treatment.name,
      description: response.description,
      appliedAt: new Date().toISOString(),
      effects: response.vitalChanges.map(vc => ({
        vitalSign: vc.vital,
        oldValue: vc.oldValue,
        newValue: vc.newValue,
        unit: '',
      })),
      category: treatment.category,
      isActive: true,
    };

    setAppliedTreatments(prev => [...prev, newTreatment]);
    setAppliedTreatmentIds(prev => [...prev, treatment.id]);

    // Animate vital sign changes
    const targetVitals = ensureCompleteVitals(newState.vitals);
    setPreviousVitals(currentVitals);
    if (startGradualChange) {
      startGradualChange(currentVitals, targetVitals, 8000);
    } else {
      setCurrentVitals(targetVitals);
    }
    setVitalsHistory(prev => [...prev, targetVitals]);

    setTimeout(() => setApplyingTreatmentId(null), 1500);

    // Show appropriate toast based on response
    if (response.criticalEvent) {
      toast.error(response.criticalEvent.description, {
        description: response.warningMessage,
        duration: 8000,
      });
    } else if (response.warningMessage) {
      toast.warning(`${treatment.name}: ${response.warningMessage}`, {
        description: response.description,
        duration: 6000,
      });
    } else if (response.isPartialResponse) {
      toast.info(`${treatment.name}: Partial response`, {
        description: response.description,
        duration: 5000,
      });
    } else {
      toast.success(`Applied: ${treatment.name}`, {
        description: response.description,
      });
    }
  }, [currentVitals, currentCase, patientState, startGradualChange]);

  // Handle defibrillation dialog confirmation
  const handleDefibConfirm = useCallback((params: DefibrillationParams) => {
    if (pendingDefibTreatment) {
      applyTreatment(pendingDefibTreatment, params);
      setPendingDefibTreatment(null);
    }
  }, [pendingDefibTreatment, applyTreatment]);

  // Handle assessment step
  const handlePerformAssessment = useCallback((stepId: AssessmentStepId) => {
    if (!assessmentTracker || !currentCase || !caseStartTime) return;

    const { tracker: updatedTracker, findings } = performAssessmentStep(
      assessmentTracker,
      stepId,
      currentCase,
      caseStartTime,
    );

    setAssessmentTracker(updatedTracker);
    setActiveFindings({ stepId, findings });

    // Show toast based on findings severity
    const hasCritical = findings.some(f => f.severity === 'critical');
    const hasAbnormal = findings.some(f => f.severity === 'abnormal');

    if (hasCritical) {
      toast.error(`Assessment: Critical finding!`, {
        description: findings.filter(f => f.severity === 'critical').map(f => f.value).join('; '),
        duration: 6000,
      });
    } else if (hasAbnormal) {
      toast.warning(`Assessment: Abnormal finding`, {
        description: findings.filter(f => f.severity === 'abnormal').map(f => f.value).join('; '),
        duration: 4000,
      });
    } else {
      toast.success(`Assessment: Normal findings`, { duration: 3000 });
    }
  }, [assessmentTracker, currentCase, caseStartTime]);

  // End case
  const endCase = useCallback((action: 'transport' | 'end') => {
    setCaseEndTime(Date.now());
    setPhase('postcase');
    if (deteriorationIntervalRef.current) {
      clearInterval(deteriorationIntervalRef.current);
      deteriorationIntervalRef.current = null;
    }
    toast.info(action === 'transport' ? 'Patient transported — generating report...' : 'Care ended — generating report...');
  }, []);

  // Calculate performance metrics for post-case
  const performanceMetrics = useMemo(() => {
    if (!currentCase || !session) return null;

    const checklist = (currentCase.studentChecklist || []).filter(
      item => item.yearLevel?.includes(selectedYear)
    );
    const completed = checklist.filter(item => session.completedItems.includes(item.id));
    const criticalItems = checklist.filter(item => item.critical);
    const criticalCompleted = criticalItems.filter(item => session.completedItems.includes(item.id));

    const scoreEarned = completed.reduce((sum, item) => sum + (item.points || 0), 0);
    const totalPossible = checklist.reduce((sum, item) => sum + (item.points || 0), 0);
    const percentage = totalPossible > 0 ? Math.round((scoreEarned / totalPossible) * 100) : 0;

    // Treatment analysis
    const treatmentCount = appliedTreatments.length;
    const timeToFirstTreatment = appliedTreatments.length > 0 && caseStartTime
      ? Math.round((new Date(appliedTreatments[0].appliedAt).getTime() - caseStartTime) / 1000)
      : null;

    // Vital sign trend
    const initialHR = parseInt(String(vitalsHistory[0]?.pulse)) || 0;
    const finalHR = parseInt(String(vitalsHistory[vitalsHistory.length - 1]?.pulse)) || 0;
    const initialSpO2 = parseInt(String(vitalsHistory[0]?.spo2)) || 0;
    const finalSpO2 = parseInt(String(vitalsHistory[vitalsHistory.length - 1]?.spo2)) || 0;

    return {
      checklist,
      completed,
      criticalItems,
      criticalCompleted,
      scoreEarned,
      totalPossible,
      percentage,
      treatmentCount,
      timeToFirstTreatment,
      totalTime: elapsedSeconds,
      vitalsTrend: {
        hrImproved: Math.abs(finalHR - 75) < Math.abs(initialHR - 75),
        spo2Improved: finalSpO2 > initialSpO2,
        initialHR, finalHR, initialSpO2, finalSpO2
      },
      // Assessment debrief
      assessmentDebrief: assessmentTracker ? generateAssessmentDebrief(assessmentTracker) : null,
    };
  }, [currentCase, session, selectedYear, appliedTreatments, vitalsHistory, elapsedSeconds, caseStartTime, assessmentTracker]);

  // Reset to start
  const resetToStart = useCallback(() => {
    setCurrentCase(null);
    setSession(null);
    setCurrentVitals(null);
    setVitalsHistory([]);
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    setCaseStartTime(null);
    setCaseEndTime(null);
    setElapsedSeconds(0);
    setAssessmentTracker(null);
    setActiveFindings(null);
    setPhase('select');
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  const phaseLabels: Record<StudentPhase, string> = {
    select: 'Select',
    prebriefing: 'Pre-Brief',
    vitals: 'Assess & Treat',
    case: 'Case Detail',
    postcase: 'Report',
  };
  const phaseOrder: StudentPhase[] = ['prebriefing', 'vitals', 'case', 'postcase'];

  return (
    <div className="min-h-screen bg-background bg-mesh">
      {/* Student Header */}
      <header className="sticky top-0 z-50 frosted border-b border-border/30 safe-top">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20 shrink-0">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-sm font-bold tracking-tight heading-premium truncate">Student Training</h1>
                  <Badge variant="outline" className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 border-blue-500/30 text-blue-600 dark:text-blue-400 font-medium shrink-0 hidden xs:inline-flex">Student</Badge>
                </div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:block">ParaMedic Studio</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Phase indicator - compact on mobile, full on desktop */}
              {phase !== 'select' && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {phaseOrder.map((p, i) => {
                    const currentIdx = phaseOrder.indexOf(phase);
                    const isActive = phase === p;
                    const isComplete = currentIdx > i;
                    return (
                      <div key={p} className="flex items-center gap-0.5 sm:gap-1">
                        <div className={`flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'w-auto px-1.5 sm:px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[9px] sm:text-[10px] font-semibold ring-1 ring-blue-500/30' :
                          isComplete ? 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500/15 ring-1 ring-green-500/30' :
                          'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-muted'
                        }`}>
                          {isActive ? (
                            <span className="hidden sm:inline">{phaseLabels[p]}</span>
                          ) : isComplete ? (
                            <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                          ) : (
                            <span className="text-[8px] sm:text-[9px] text-muted-foreground">{i + 1}</span>
                          )}
                          {isActive && <span className="sm:hidden text-[9px]">{i + 1}</span>}
                        </div>
                        {i < phaseOrder.length - 1 && (
                          <div className={`w-2 sm:w-4 h-px ${isComplete ? 'bg-green-500/50' : 'bg-border'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Timer */}
              {caseStartTime && !caseEndTime && (
                <Badge variant="outline" className="font-mono gap-1 sm:gap-1.5 text-[10px] sm:text-xs border-primary/30 bg-primary/5 px-1.5 sm:px-2">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                  {formatTime(elapsedSeconds)}
                </Badge>
              )}

              <Button variant="ghost" size="sm" onClick={onExit} className="text-[10px] sm:text-xs gap-1 text-muted-foreground hover:text-foreground h-7 sm:h-8 px-2 sm:px-3">
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 safe-bottom">
        {/* ================================================================ */}
        {/* PHASE 1: Case Selection */}
        {/* ================================================================ */}
        {phase === 'select' && (
          <div className="max-w-2xl mx-auto animate-fade-in space-y-5 sm:space-y-8">
            <div className="text-center mb-2 sm:mb-4">
              <div className="mx-auto mb-4 sm:mb-5 flex h-14 w-14 sm:h-18 sm:w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/25 ring-4 ring-blue-500/10">
                <Stethoscope className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
              </div>
              <h2 className="heading-display text-xl sm:text-[2rem] leading-tight">Paramedic Case Generator</h2>
              <p className="text-muted-foreground mt-1.5 sm:mt-2 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                Select your training level and generate realistic emergency scenarios to sharpen your clinical skills
              </p>
            </div>

            {/* Year Level */}
            <Card className="card-glass rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  Select Your Year Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                  {yearLevels.map(year => (
                    <button
                      key={year.value}
                      onClick={() => setSelectedYear(year.value as StudentYear)}
                      className={`flex flex-col items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                        selectedYear === year.value
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                          : 'border-border/60 hover:border-blue-500/40 text-muted-foreground hover:text-foreground hover:bg-accent/30'
                      }`}
                    >
                      <GraduationCap className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedYear === year.value ? 'text-blue-500' : 'text-muted-foreground/50'}`} />
                      {year.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card className="card-glass rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Choose Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3.5 py-2 rounded-xl border text-sm transition-all duration-300 ${
                      selectedCategory === 'all'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500/20 shadow-sm'
                        : 'border-border/60 hover:border-blue-500/40 text-muted-foreground hover:bg-accent/30'
                    }`}
                  >
                    All Categories
                  </button>
                  {caseCategories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3.5 py-2 rounded-xl border text-sm transition-all duration-300 ${
                        selectedCategory === cat.value
                          ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500/20 shadow-sm'
                          : 'border-border/60 hover:border-blue-500/40 text-muted-foreground hover:bg-accent/30'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate */}
            <Button
              onClick={generateCase}
              disabled={isGenerating}
              size="lg"
              className="w-full gap-2 sm:gap-3 text-sm sm:text-base py-5 sm:py-7 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl shadow-blue-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              {isGenerating ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Generating Case...</>
              ) : (
                <><Sparkles className="h-5 w-5" /> Generate Case</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground/60">
              Cases are randomized within your selected category and year level
            </p>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 2: Pre-Briefing */}
        {/* ================================================================ */}
        {phase === 'prebriefing' && currentCase && (
          <div className="max-w-3xl mx-auto animate-fade-in space-y-4 sm:space-y-6">
            {/* Phase header */}
            <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Badge className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/15">
                  <BookOpen className="h-3 w-3" /> Pre-Briefing
                </Badge>
                <Badge variant="secondary" className="capitalize text-[10px] sm:text-xs">{currentCase.category}</Badge>
              </div>
            </div>

            <div>
              <h2 className="heading-premium text-lg sm:text-2xl">{currentCase.title}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Review the dispatch and scene information before starting</p>
            </div>

            {/* Dispatch Information */}
            <Card className="card-glass rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/8 via-blue-500/3 to-transparent border-b border-border/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                    <Activity className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Dispatch Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3 sm:pt-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-sm">
                  {[
                    { label: 'Call Reason', value: currentCase.dispatchInfo.callReason },
                    { label: 'Location', value: currentCase.dispatchInfo.location },
                    { label: 'Time', value: currentCase.dispatchInfo.timeOfDay },
                    { label: 'Caller', value: currentCase.dispatchInfo.callerInfo },
                  ].map((item) => (
                    <div key={item.label} className="p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</span>
                      <p className="font-medium mt-0.5 text-xs sm:text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
                {currentCase.dispatchInfo.additionalInfo && (
                  <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3.5 mt-2">
                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1.5 uppercase tracking-wider">Additional Information</p>
                    <ul className="text-sm space-y-1.5">
                      {currentCase.dispatchInfo.additionalInfo.map((info, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="h-3 w-3 text-amber-500 mt-1 shrink-0" />
                          {info}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scene Information */}
            <Card className="card-glass rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                    <Shield className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Scene Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3 pt-4">
                <p className="leading-relaxed">{currentCase.sceneInfo.description}</p>
                {currentCase.sceneInfo.hazards && currentCase.sceneInfo.hazards.length > 0 && (
                  <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3.5">
                    <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 mb-1.5 uppercase tracking-wider">Hazards Identified</p>
                    <ul className="space-y-1">
                      {currentCase.sceneInfo.hazards.map((h, i) => (
                        <li key={i} className="text-red-700 dark:text-red-400 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />{h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentCase.sceneInfo.bystanders && (
                  <p className="text-muted-foreground">Bystanders: {currentCase.sceneInfo.bystanders}</p>
                )}
              </CardContent>
            </Card>

            {/* Patient Info */}
            <Card className="card-glass rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                    <Heart className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm pt-3 sm:pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { label: 'Age', value: `${currentCase.patientInfo.age} years` },
                    { label: 'Gender', value: currentCase.patientInfo.gender },
                    { label: 'Weight', value: `${currentCase.patientInfo.weight} kg` },
                    { label: 'Language', value: currentCase.patientInfo.language },
                  ].map((item) => (
                    <div key={item.label} className="p-2 sm:p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</span>
                      <p className="font-semibold mt-0.5 capitalize text-xs sm:text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
                {currentCase.patientInfo.culturalConsiderations && currentCase.patientInfo.culturalConsiderations.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground bg-accent/30 rounded-xl p-3 border border-border/20">
                    <strong>Cultural Note:</strong> {currentCase.patientInfo.culturalConsiderations.join('. ')}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Initial Presentation */}
            {currentCase.initialPresentation && (
              <Card className="card-glass rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                      <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    Initial Presentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2 pt-4">
                  <p><strong>General Impression:</strong> {currentCase.initialPresentation.generalImpression}</p>
                  {currentCase.initialPresentation.position && (
                    <p><strong>Position:</strong> {currentCase.initialPresentation.position}</p>
                  )}
                  {currentCase.initialPresentation.appearance && (
                    <p><strong>Appearance:</strong> {currentCase.initialPresentation.appearance}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ready to start callout */}
            <Card className="border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-primary/5 shadow-sm overflow-hidden">
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-500/15 shrink-0">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold">Ready to begin?</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                      Once you click <strong>Start Case</strong>, the timer begins. Assess the patient, apply treatments, and manage the case.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 sm:gap-3">
              <Button variant="outline" onClick={resetToStart} className="gap-1.5 sm:gap-2 rounded-xl text-xs sm:text-sm h-10 sm:h-11 px-3 sm:px-4">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">Different </span>Back
              </Button>
              <Button onClick={startCase} size="lg" className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-0.5 text-sm sm:text-base h-10 sm:h-12">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Start Case
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 3: Vitals & Treatment (Active Case) */}
        {/* ================================================================ */}
        {phase === 'vitals' && currentCase && (
          <div className="animate-fade-in space-y-3 sm:space-y-4">
            {/* Case banner */}
            <div className="p-3 sm:p-5 rounded-2xl card-glass space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 shrink-0">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">{currentCase.title}</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {currentCase.dispatchInfo.location} <span className="mx-1 text-border">|</span> <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline-block -mt-px" /> {formatTime(elapsedSeconds)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPhase('case')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg flex-1 sm:flex-none h-8"
                >
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Case </span>Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => endCase('transport')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex-1 sm:flex-none h-8"
                >
                  <Ambulance className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Transport
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => endCase('end')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg shadow-sm flex-1 sm:flex-none h-8"
                >
                  <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">End </span>Care
                </Button>
              </div>
            </div>

            {/* Clinical Assessment Panel */}
            {assessmentTracker && (
              <ClinicalAssessmentPanel
                caseCategory={currentCase.category}
                tracker={assessmentTracker}
                onPerformAssessment={handlePerformAssessment}
                activeFindings={activeFindings}
              />
            )}

            {/* Vital Signs Monitor */}
            <Suspense fallback={<LoadingCard />}>
              <VitalSignsMonitor
                initialVitals={currentVitals || ensureCompleteVitals(currentCase.vitalSignsProgression.initial)}
                previousVitals={previousVitals}
                deteriorationVitals={currentCase.vitalSignsProgression.deterioration ? ensureCompleteVitals(currentCase.vitalSignsProgression.deterioration) : undefined}
                onVitalChange={(vitals) => {
                  const completeVitals = ensureCompleteVitals(vitals);
                  setCurrentVitals(completeVitals);
                  setVitalsHistory(prev => [...prev, completeVitals]);
                }}
                caseCategory={currentCase.category}
                caseSubcategory={currentCase.subcategory}
                caseTitle={currentCase.title}
                appliedTreatments={appliedTreatments.map(t => t.description)}
              />
            </Suspense>

            {/* Auscultation Panel — listen to the patient */}
            {patientState && (
              <AuscultationPanel
                sounds={patientState.sounds}
                isExpanded={['respiratory', 'cardiac', 'cardiac-ecg', 'thoracic'].includes(currentCase.category)}
              />
            )}

            {/* Treatment Panel */}
            {currentVitals && (
              <Suspense fallback={<LoadingCard />}>
                <TreatmentApplicationPanel
                  currentVitals={currentVitals}
                  onApplyTreatment={applyTreatment}
                  appliedTreatmentIds={appliedTreatmentIds}
                  isApplying={!!applyingTreatmentId}
                  applyingTreatmentId={applyingTreatmentId}
                  studentYear={selectedYear}
                />
              </Suspense>
            )}

            {/* Defibrillation Dialog */}
            {showDefibDialog && patientState && (
              <DefibrillationDialog
                open={showDefibDialog}
                onClose={() => {
                  setShowDefibDialog(false);
                  setPendingDefibTreatment(null);
                }}
                onConfirm={handleDefibConfirm}
                currentRhythm={patientState.currentRhythm}
                currentPulse={currentVitals?.pulse || 0}
              />
            )}

            {/* Applied Treatments Log */}
            {appliedTreatments.length > 0 && (
              <Card className="card-glass rounded-xl sm:rounded-2xl">
                <CardHeader className="pb-2 border-b border-border/30 px-3 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                    <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-green-500/15">
                      <ClipboardCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                    </div>
                    Treatments Applied
                    <Badge variant="secondary" className="ml-auto text-[9px] sm:text-[10px]">{appliedTreatments.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 sm:pt-3 px-3 sm:px-6">
                  <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                    {appliedTreatments.map((t, i) => {
                      const hasWarning = t.description?.includes('CRITICAL') || t.description?.includes('ADVERSE') || t.description?.includes('CONTRAINDICATED');
                      const isPartial = t.description?.includes('Partial') || t.description?.includes('Consider repeat');
                      return (
                        <div key={i} className={`flex items-start gap-2 sm:gap-2.5 text-[10px] sm:text-xs p-2 sm:p-2.5 rounded-lg border ${
                          hasWarning
                            ? 'bg-red-500/5 border-red-500/15'
                            : isPartial
                              ? 'bg-amber-500/5 border-amber-500/15'
                              : 'bg-green-500/5 border-green-500/10'
                        }`}>
                          {hasWarning ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                          ) : isPartial ? (
                            <Activity className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold">{t.name}</span>
                            {/* Show dose count if repeated */}
                            {patientState && patientState.treatmentCounts[t.id] > 1 && (
                              <Badge variant="outline" className="ml-1.5 text-[9px] py-0 h-4">
                                x{patientState.treatmentCounts[t.id]}
                              </Badge>
                            )}
                            <p className="text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>
                          </div>
                          <span className="text-muted-foreground/60 text-[10px] shrink-0">
                            {new Date(t.appliedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 3b: Case Details (accessible during active case) */}
        {/* ================================================================ */}
        {phase === 'case' && currentCase && (
          <div className="animate-fade-in space-y-4">
            <Button variant="outline" size="sm" onClick={() => setPhase('vitals')} className="gap-1.5 rounded-lg shadow-sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Monitor
            </Button>
            <Suspense fallback={<LoadingCard />}>
              <CaseDisplay caseData={currentCase} studentYear={selectedYear} />
            </Suspense>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 4: Post-Case Report */}
        {/* ================================================================ */}
        {phase === 'postcase' && currentCase && performanceMetrics && (
          <div className="max-w-3xl mx-auto animate-fade-in space-y-4 sm:space-y-6">
            {/* Hero header */}
            <div className="text-center mb-1 sm:mb-2 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent rounded-3xl -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 h-32 sm:h-40" />
              <div className="relative">
                <div className={`mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl shadow-xl ring-4 ${
                  performanceMetrics.percentage >= 80
                    ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/20 ring-green-500/10'
                    : performanceMetrics.percentage >= 50
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20 ring-amber-500/10'
                    : 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/20 ring-red-500/10'
                }`}>
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="heading-display text-xl sm:text-2xl">Case Complete</h2>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate px-2">{currentCase.title}</p>
              </div>
            </div>

            {/* Overall Score */}
            <Card className="card-glass rounded-2xl border-primary/15 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent" />
              <CardContent className="p-4 sm:p-6 relative">
                <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className={`text-2xl sm:text-3xl font-bold ${
                      performanceMetrics.percentage >= 80 ? 'text-green-500' :
                      performanceMetrics.percentage >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>{performanceMetrics.percentage}%</div>
                    <p className="text-[9px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Score</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 border-x border-border/30">
                    <div className="text-2xl sm:text-3xl font-bold font-mono">{formatTime(performanceMetrics.totalTime)}</div>
                    <p className="text-[9px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Duration</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="text-2xl sm:text-3xl font-bold">{performanceMetrics.treatmentCount}</div>
                    <p className="text-[9px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Treatments</p>
                  </div>
                </div>
                <Progress value={performanceMetrics.percentage} className="mt-4 sm:mt-5 h-2" />
              </CardContent>
            </Card>

            {/* Performance Feedback */}
            <Card className="card-glass rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                    <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                {/* Timing */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response Timing</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Total Duration</span>
                      <p className="font-bold text-base sm:text-lg mt-0.5 sm:mt-1 font-mono">{formatTime(performanceMetrics.totalTime)}</p>
                    </div>
                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium">First Treatment</span>
                      <p className="font-bold text-base sm:text-lg mt-0.5 sm:mt-1 font-mono">
                        {performanceMetrics.timeToFirstTreatment
                          ? formatTime(performanceMetrics.timeToFirstTreatment)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {performanceMetrics.timeToFirstTreatment && performanceMetrics.timeToFirstTreatment > 120 && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/8 border border-amber-500/15 p-3 rounded-xl flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      Consider beginning treatment sooner — early intervention is key to patient outcomes.
                    </div>
                  )}
                  {performanceMetrics.timeToFirstTreatment && performanceMetrics.timeToFirstTreatment <= 60 && (
                    <div className="text-xs text-green-600 dark:text-green-400 bg-green-500/8 border border-green-500/15 p-3 rounded-xl flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      Excellent — you identified the need for treatment quickly and initiated care promptly.
                    </div>
                  )}
                </div>

                <Separator className="bg-border/30" />

                {/* Vital Signs Trend */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vital Signs Trend</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-muted/30 border border-border/30 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Heart Rate</span>
                        <p className="font-bold mt-0.5">{performanceMetrics.vitalsTrend.initialHR} <ArrowRight className="h-3 w-3 inline-block text-muted-foreground" /> {performanceMetrics.vitalsTrend.finalHR} <span className="text-xs font-normal text-muted-foreground">bpm</span></p>
                      </div>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        performanceMetrics.vitalsTrend.hrImproved ? 'bg-green-500/15' : 'bg-muted'
                      }`}>
                        {performanceMetrics.vitalsTrend.hrImproved ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : performanceMetrics.vitalsTrend.initialHR === performanceMetrics.vitalsTrend.finalHR ? (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">SpO2</span>
                        <p className="font-bold mt-0.5">{performanceMetrics.vitalsTrend.initialSpO2} <ArrowRight className="h-3 w-3 inline-block text-muted-foreground" /> {performanceMetrics.vitalsTrend.finalSpO2}<span className="text-xs font-normal text-muted-foreground">%</span></p>
                      </div>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        performanceMetrics.vitalsTrend.spo2Improved ? 'bg-green-500/15' : 'bg-muted'
                      }`}>
                        {performanceMetrics.vitalsTrend.spo2Improved ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : performanceMetrics.vitalsTrend.initialSpO2 === performanceMetrics.vitalsTrend.finalSpO2 ? (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/30" />

                {/* Treatments Applied */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Treatments Applied ({performanceMetrics.treatmentCount})
                  </h4>
                  {appliedTreatments.length > 0 ? (
                    <div className="space-y-2">
                      {appliedTreatments.map((t, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">{t.name}</span>
                            <span className="text-muted-foreground ml-2">{t.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/8 border border-amber-500/15 p-3 rounded-xl">
                      No treatments were applied during this case. Consider whether interventions were needed.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assessment Debrief */}
            {performanceMetrics.assessmentDebrief && (
              <Card className="card-glass rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                      <ClipboardCheck className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    Clinical Assessment Review
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {performanceMetrics.assessmentDebrief.score}/{performanceMetrics.assessmentDebrief.totalPossible} pts
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                  {/* Summary badges */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge variant={performanceMetrics.assessmentDebrief.abcdeCompleted ? 'default' : 'destructive'} className={`text-[9px] sm:text-[10px] ${performanceMetrics.assessmentDebrief.abcdeCompleted ? 'bg-green-500' : ''}`}>
                      {performanceMetrics.assessmentDebrief.abcdeCompleted ? 'ABCDE Complete' : 'ABCDE Incomplete'}
                    </Badge>
                    <Badge variant={performanceMetrics.assessmentDebrief.historyTaken ? 'default' : 'secondary'} className={`text-[9px] sm:text-[10px] ${performanceMetrics.assessmentDebrief.historyTaken ? 'bg-green-500' : ''}`}>
                      {performanceMetrics.assessmentDebrief.historyTaken ? 'History Taken' : 'History Incomplete'}
                    </Badge>
                    <Badge variant={performanceMetrics.assessmentDebrief.secondarySurveyCompleted ? 'default' : 'secondary'} className={`text-[9px] sm:text-[10px] ${performanceMetrics.assessmentDebrief.secondarySurveyCompleted ? 'bg-green-500' : ''}`}>
                      {performanceMetrics.assessmentDebrief.secondarySurveyCompleted ? '2nd Survey Done' : '2nd Survey Incomplete'}
                    </Badge>
                  </div>

                  {/* Assessment order */}
                  {performanceMetrics.assessmentDebrief.assessmentOrder.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your Assessment Order</h4>
                      <div className="flex flex-wrap gap-1">
                        {performanceMetrics.assessmentDebrief.assessmentOrder.map((label, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px]">
                              {i + 1}. {label}
                            </Badge>
                            {i < performanceMetrics.assessmentDebrief!.assessmentOrder.length - 1 && (
                              <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timing issues */}
                  {performanceMetrics.assessmentDebrief.timingIssues.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Timing Issues</h4>
                      {performanceMetrics.assessmentDebrief.timingIssues.map((issue, i) => (
                        <div key={i} className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/8 border border-amber-500/15 p-2.5 rounded-xl flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Critical missed */}
                  {performanceMetrics.assessmentDebrief.criticalMissed.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Critical Assessments Missed</h4>
                      {performanceMetrics.assessmentDebrief.criticalMissed.map((item, i) => (
                        <div key={i} className="text-xs text-red-700 dark:text-red-300 bg-red-500/8 border border-red-500/15 p-2.5 rounded-xl">
                          <div className="flex items-start gap-2">
                            <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">{item.label}</span>
                              <p className="opacity-80 mt-0.5">{item.rationale}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator className="bg-border/30" />

                  {/* Detailed breakdown */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detailed Breakdown</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {performanceMetrics.assessmentDebrief.items.map((item, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                          item.status === 'completed' ? 'bg-green-500/5' :
                          item.status === 'missed-required' ? 'bg-red-500/5' :
                          item.status === 'missed-recommended' ? 'bg-muted/30' :
                          'bg-blue-500/5'
                        }`}>
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          ) : item.status === 'missed-required' ? (
                            <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          ) : item.status === 'missed-recommended' ? (
                            <Minus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <Star className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          )}
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.order && (
                            <Badge variant="outline" className="text-[9px] py-0 h-4">#{item.order}</Badge>
                          )}
                          {item.performedAt !== undefined && (
                            <span className="text-muted-foreground/60 text-[10px]">{formatTime(item.performedAt)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Treatment Quality Analysis — Year-Aware */}
            {appliedTreatments.length > 0 && (() => {
              const qualityResults: { treatmentName: string; result: TreatmentQualityResult; timingNote?: string }[] = [];
              for (const tx of appliedTreatments) {
                const result = evaluateTreatmentQuality(tx.id, currentCase.vitalSignsProgression.initial, currentCase, selectedYear);
                if (result) {
                  const timing = tx.appliedAt
                    ? assessTreatmentTiming(tx.id, Math.round((new Date(tx.appliedAt).getTime() - (caseStartTime || Date.now())) / 1000), currentCase)
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
                optimal: 'Optimal', acceptable: 'Acceptable', suboptimal: 'Suboptimal',
                inappropriate: 'Inappropriate', harmful: 'Harmful',
              };

              return (
                <Card className="card-glass rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/30">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15">
                        <Activity className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      Treatment Quality Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {qualityResults.map((qr, i) => (
                      <div key={i} className={`rounded-xl border-l-4 p-3 ${levelColors[qr.result.level]}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{qr.treatmentName}</span>
                          <Badge variant="outline" className="text-[10px]">{levelLabels[qr.result.level]} ({qr.result.score}%)</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{qr.result.feedback}</p>
                        {qr.result.yearLevelNote && (
                          <p className="text-xs mt-2 p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-violet-700 dark:text-violet-300 italic">
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

            {/* Year-Level Guidance & Resources */}
            {performanceMetrics.assessmentDebrief && performanceMetrics.assessmentDebrief.criticalMissed.length > 0 && (() => {
              const missedCategories = [...new Set(performanceMetrics.assessmentDebrief!.criticalMissed.map(m => m.category || 'assessment'))];
              const resources: FeedbackResource[] = getResourcesForCase(currentCase, missedCategories, selectedYear);
              const guidanceItems = missedCategories.slice(0, 3).map(cat => {
                const desc = `${cat} assessment gaps`;
                return generateYearAwareGuidance(desc, cat, selectedYear);
              });

              if (guidanceItems.length === 0 && resources.length === 0) return null;

              return (
                <Card className="card-glass rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/30">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                      </div>
                      Year-Level Guidance ({selectedYear})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {guidanceItems.map((guidance, i) => (
                      <div key={i} className="text-xs p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 leading-relaxed">
                        {guidance}
                      </div>
                    ))}
                    {resources.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended Resources</h4>
                        {resources.slice(0, 5).map((res, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs p-2.5 rounded-xl bg-muted/30 border border-border/30">
                            <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5">{res.type}</Badge>
                            <div>
                              <span className="font-medium">{res.title}</span>
                              <p className="text-muted-foreground mt-0.5">{res.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Key Learning Points */}
            {currentCase.expectedFindings && (
              <Card className="card-glass rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                      <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    Key Learning Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-1">Most Likely Diagnosis</p>
                    <p className="text-base font-bold">{currentCase.expectedFindings.mostLikelyDiagnosis}</p>
                  </div>
                  {currentCase.expectedFindings.keyObservations && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Observations</p>
                      <ul className="space-y-1.5">
                        {currentCase.expectedFindings.keyObservations.map((obs, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                            {obs}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {currentCase.expectedFindings.redFlags && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Red Flags</p>
                      <ul className="space-y-1.5">
                        {currentCase.expectedFindings.redFlags.map((flag, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Resources */}
            {currentCase.educationalResources && currentCase.educationalResources.length > 0 && (
              <Card className="card-glass rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15">
                      <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    Further Reading
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="space-y-1">
                    {currentCase.educationalResources.slice(0, 6).map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-accent/40 transition-all duration-200 group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors shrink-0">
                          <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium group-hover:text-blue-500 transition-colors truncate">{res.title}</p>
                          {res.source && <p className="text-[11px] text-muted-foreground">{res.source}</p>}
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 border-border/50">{res.type}</Badge>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 pb-6 sm:pb-8">
              <Button variant="outline" onClick={resetToStart} size="lg" className="flex-1 gap-2 rounded-xl text-sm sm:text-base h-11 sm:h-12">
                <RotateCcw className="h-4 w-4" /> Start New Case
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Re-export for lazy loading
export default StudentPanel;
