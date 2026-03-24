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
import { type Treatment, type TreatmentCategory, TREATMENTS } from '@/data/enhancedTreatmentEffects';
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
  RotateCcw, Zap, Volume2, Phone, Eye, Thermometer, ChevronDown, ChevronUp,
  Wind, Droplets, Brain, Pill, Syringe
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
// AuscultationPanel removed — sounds now play inline from 3D Physical Examination
import { DebriefingResourcesPanel } from '@/components/DebriefingResourcesPanel';
import { exportSessionToPDF } from '@/lib/pdf-export';
import { getResourcesForDebriefing } from '@/data/diversifiedResources';

/**
 * Generate a student-friendly case title that doesn't reveal the diagnosis.
 * Uses dispatch reason and patient demographics instead.
 */
function getStudentCaseTitle(caseData: CaseScenario): string {
  const age = caseData.patientInfo?.age;
  const gender = caseData.patientInfo?.gender;
  const reason = caseData.dispatchInfo?.callReason;

  // Build patient description
  let patient = '';
  if (age && gender) {
    patient = `${age}yo ${gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Patient'}`;
  } else {
    patient = 'Patient';
  }

  // Use dispatch reason as the case title
  if (reason) {
    // Clean up the reason to be a good title
    const cleanReason = reason.charAt(0).toUpperCase() + reason.slice(1);
    return `${patient} — ${cleanReason}`;
  }

  // Fallback to category-based generic title
  const cat = caseData.category?.toLowerCase() || '';
  if (cat.includes('cardiac')) return `${patient} — Chest Pain / Cardiac Complaint`;
  if (cat.includes('respiratory')) return `${patient} — Breathing Difficulty`;
  if (cat.includes('trauma')) return `${patient} — Trauma / Injury`;
  if (cat.includes('neurological')) return `${patient} — Neurological Complaint`;
  if (cat.includes('medical')) return `${patient} — Medical Emergency`;

  return `${patient} — Emergency Call`;
}
import { DefibrillationDialog } from '@/components/DefibrillationDialog';
// ClinicalAssessmentPanel removed — replaced by inline ABCDE Primary Survey + 3D Physical Exam
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
const Body3DModel = lazy(() => import('@/components/Body3DModel').then(m => ({ default: m.Body3DModel })));

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

  // Scene time warnings & coaching
  const [sceneTimeWarnings, setSceneTimeWarnings] = useState<Set<string>>(new Set());
  const lastActivityRef = useRef<number>(Date.now());
  const [hintVisible, setHintVisible] = useState(false);
  const [currentHint, setCurrentHint] = useState<string>('');

  // Scene toggle & ABCDE row states
  const [showScene, setShowScene] = useState(false);
  const [activePrimarySurvey, setActivePrimarySurvey] = useState<'scene-safety' | 'airway' | 'breathing' | 'circulation' | 'disability' | 'exposure' | null>(null);
  const [activeHistoryStep, setActiveHistoryStep] = useState<'signs-symptoms' | 'allergies' | 'medications' | 'past-medical' | 'last-meal' | 'events-leading' | null>(null);
  const [activeManagementTab, setActiveManagementTab] = useState<'airway' | 'breathing' | 'circulation' | 'disability' | 'exposure' | 'medications' | null>(null);
  const [medSearch, setMedSearch] = useState('');

  // Transport decision wizard — step-by-step flow
  const [showTransportDecision, setShowTransportDecision] = useState(false);
  const [transportStep, setTransportStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1=priority, 2=position, 3=preAlert+destination, 4=diagnosis, 5=confirm
  const [transportDecisions, setTransportDecisions] = useState<{
    priority: string;
    position: string;
    preAlert: boolean;
    destination: string;
    provisionalDiagnosis: string;
  } | null>(null);

  // Cardiac arrest management — integrated into existing flow
  const [arrestActive, setArrestActive] = useState(false);
  const [cprCycleTimer, setCprCycleTimer] = useState(120); // 2 min countdown
  const [cprCycleNumber, setCprCycleNumber] = useState(0);
  const [cprRunning, setCprRunning] = useState(false);
  const [shockCount, setShockCount] = useState(0);
  const [lastAdrenalineTime, setLastAdrenalineTime] = useState<number | null>(null);
  const [adrenalineDoses, setAdrenalineDoses] = useState(0);
  const [amiodaroneDoses, setAmiodaroneDoses] = useState(0);
  const [arrestStartTime, setArrestStartTime] = useState<number | null>(null);
  const [arrestTimeline, setArrestTimeline] = useState<Array<{time: number; event: string; type: string}>>([]);
  const cprTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Scene time warnings — paramedic standard is 15 minutes on scene
  useEffect(() => {
    if (!caseStartTime || caseEndTime || phase !== 'vitals') return;
    const minutes = elapsedSeconds / 60;

    if (minutes >= 10 && !sceneTimeWarnings.has('10min')) {
      toast.warning('Scene time: 10 minutes', {
        description: 'Consider your transport decision. Most patients should be en route to hospital by now.',
        duration: 8000,
      });
      setSceneTimeWarnings(prev => new Set(prev).add('10min'));
    }
    if (minutes >= 13 && !sceneTimeWarnings.has('13min')) {
      toast.error('Scene time extended: 13 minutes', {
        description: 'You have exceeded standard scene time. Justify any delay — is there a clinical reason to stay on scene?',
        duration: 10000,
      });
      setSceneTimeWarnings(prev => new Set(prev).add('13min'));
    }
    if (minutes >= 15 && !sceneTimeWarnings.has('15min')) {
      toast.error('⚠️ 15 minutes on scene — patient may be deteriorating', {
        description: 'Prolonged scene time is associated with worse patient outcomes. Consider immediate transport.',
        duration: 12000,
      });
      setSceneTimeWarnings(prev => new Set(prev).add('15min'));
    }
  }, [elapsedSeconds, caseStartTime, caseEndTime, phase, sceneTimeWarnings]);

  // Cardiac arrest detection — activate arrest mode when patient enters arrest
  useEffect(() => {
    if (!patientState) return;
    if (patientState.isInArrest && !arrestActive) {
      setArrestActive(true);
      setArrestStartTime(Date.now());
      setCprCycleNumber(0);
      setCprCycleTimer(120);
      setShockCount(0);
      setAdrenalineDoses(0);
      setAmiodaroneDoses(0);
      setLastAdrenalineTime(null);
      setArrestTimeline([{ time: Date.now(), event: 'Cardiac arrest detected', type: 'arrest-start' }]);
      toast.error('CARDIAC ARREST', {
        description: 'Patient is in cardiac arrest. Start CPR immediately. Apply defibrillator.',
        duration: 10000,
      });
    } else if (!patientState.isInArrest && arrestActive) {
      // ROSC achieved
      setArrestActive(false);
      setCprRunning(false);
      if (cprTimerRef.current) clearInterval(cprTimerRef.current);
      setArrestTimeline(prev => [...prev, { time: Date.now(), event: 'ROSC achieved', type: 'rosc' }]);
      toast.success('ROSC ACHIEVED', {
        description: 'Return of spontaneous circulation. Begin post-ROSC care: maintain SpO2 94-98%, avoid hyperventilation, 12-lead ECG, temperature management.',
        duration: 15000,
      });
    }
  }, [patientState?.isInArrest, arrestActive]);

  // CPR 2-minute cycle countdown
  useEffect(() => {
    if (!cprRunning) {
      if (cprTimerRef.current) clearInterval(cprTimerRef.current);
      return;
    }
    cprTimerRef.current = setInterval(() => {
      setCprCycleTimer(prev => {
        if (prev <= 1) {
          // Cycle complete — prompt rhythm check
          setCprRunning(false);
          setCprCycleNumber(n => n + 1);
          toast.warning('2 minutes — RHYTHM CHECK', {
            description: 'Pause CPR briefly (<10 sec). Check rhythm. Rotate compressor. Shock if indicated. Resume CPR.',
            duration: 8000,
          });
          setArrestTimeline(prev => [...prev, { time: Date.now(), event: `CPR Cycle complete — rhythm check`, type: 'rhythm-check' }]);
          return 120; // Reset for next cycle
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (cprTimerRef.current) clearInterval(cprTimerRef.current); };
  }, [cprRunning]);

  // Adrenaline timing check — warn when overdue
  useEffect(() => {
    if (!arrestActive || !cprRunning) return;
    const checkInterval = setInterval(() => {
      if (lastAdrenalineTime) {
        const secsSinceAdr = (Date.now() - lastAdrenalineTime) / 1000;
        if (secsSinceAdr >= 300 && secsSinceAdr < 305) {
          toast.error('ADRENALINE OVERDUE', {
            description: 'Adrenaline is due every 3-5 minutes. Consider giving 1mg IV/IO now.',
            duration: 8000,
          });
        }
      } else if (adrenalineDoses === 0 && shockCount >= 2) {
        // After 2nd shock in shockable rhythm, adrenaline is due
        toast.warning('Consider Adrenaline', {
          description: 'AHA 2025: Adrenaline 1mg IV after 2nd shock (shockable rhythm) or immediately (non-shockable).',
          duration: 6000,
        });
      }
    }, 5000);
    return () => clearInterval(checkInterval);
  }, [arrestActive, cprRunning, lastAdrenalineTime, adrenalineDoses, shockCount]);

  // Cleanup deterioration interval on unmount
  useEffect(() => {
    return () => {
      if (deteriorationIntervalRef.current) {
        clearInterval(deteriorationIntervalRef.current);
        deteriorationIntervalRef.current = null;
      }
      if (cprTimerRef.current) {
        clearInterval(cprTimerRef.current);
        cprTimerRef.current = null;
      }
    };
  }, []);

  // Inactivity coaching — nudge students who are stuck
  useEffect(() => {
    if (!caseStartTime || caseEndTime || phase !== 'vitals') return;
    const checkInactivity = setInterval(() => {
      const inactiveSecs = (Date.now() - lastActivityRef.current) / 1000;
      const abcdePerformed = assessmentTracker?.performed?.length || 0;

      if (inactiveSecs >= 120 && abcdePerformed === 0) {
        setCurrentHint('Have you assessed the patient? Start with Scene Safety, then work through Airway, Breathing, Circulation, Disability, Exposure.');
        setHintVisible(true);
      } else if (inactiveSecs >= 120 && abcdePerformed < 4) {
        const missing = ['Scene', 'Airway', 'Breathing', 'Circulation', 'Disability', 'Exposure']
          .filter(s => !assessmentTracker?.performed?.some(p => p.stepId.toLowerCase().includes(s.toLowerCase().slice(0, 4))));
        if (missing.length > 0) {
          setCurrentHint(`Consider completing your primary survey. You haven't assessed: ${missing.join(', ')}.`);
          setHintVisible(true);
        }
      } else if (inactiveSecs >= 180 && appliedTreatments.length === 0 && abcdePerformed >= 4) {
        setCurrentHint('You\'ve completed your assessment. Based on your findings, does the patient need any treatment? Check the treatment panel.');
        setHintVisible(true);
      }
    }, 15000); // Check every 15 seconds
    return () => clearInterval(checkInactivity);
  }, [caseStartTime, caseEndTime, phase, assessmentTracker, appliedTreatments.length]);

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

    if (!newCase) {
      setIsGenerating(false);
      toast.error('No cases available', {
        description: `No ${selectedCategory !== 'all' ? selectedCategory : ''} cases are available for ${selectedYear} level. Try a different category.`,
      });
      return;
    }

    setCurrentCase(newCase);
    const initialVitals = ensureCompleteVitals(newCase.vitalSignsProgression.initial);
    setCurrentVitals(initialVitals);
    setVitalsHistory([initialVitals]);
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    setCaseStartTime(null);
    setCaseEndTime(null);
    setElapsedSeconds(0);
    setSceneTimeWarnings(new Set());
    setHintVisible(false);
    setCurrentHint('');
    lastActivityRef.current = Date.now();

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
    toast.success(`Case generated: ${getStudentCaseTitle(newCase)}`);
  }, [selectedYear, selectedCategory]);

  // Start case (from pre-briefing)
  const startCase = useCallback(() => {
    setCaseStartTime(Date.now());
    lastActivityRef.current = Date.now();
    setPhase('vitals');
    toast.success('Case started — begin your assessment', { duration: 3000 });

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
    lastActivityRef.current = Date.now();
    setHintVisible(false);

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

    // Track arrest-specific drug timing
    if (arrestActive) {
      if (treatment.id === 'adrenaline_1mg') {
        setLastAdrenalineTime(Date.now());
        setAdrenalineDoses(prev => prev + 1);
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: `Adrenaline 1mg IV (dose #${adrenalineDoses + 1})`, type: 'drug' }]);
      }
      if (treatment.id === 'amiodarone_300mg' || treatment.id === 'amiodarone_150mg') {
        setAmiodaroneDoses(prev => prev + 1);
        const dose = treatment.id === 'amiodarone_300mg' ? '300mg' : '150mg';
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: `Amiodarone ${dose} IV`, type: 'drug' }]);
      }
      if (treatment.id === 'defibrillation') {
        setShockCount(prev => prev + 1);
        setArrestTimeline(prev => [...prev, {
          time: Date.now(),
          event: `Shock #${shockCount + 1} delivered (${defibParams?.energy || '?'}J)`,
          type: 'shock',
        }]);
      }
      if (treatment.id === 'lucas_device') {
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: 'LUCAS mechanical CPR device applied', type: 'lucas' }]);
      }
      // Track any other treatment
      if (!['adrenaline_1mg', 'amiodarone_300mg', 'amiodarone_150mg', 'defibrillation', 'lucas_device'].includes(treatment.id)) {
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: `${treatment.name} applied`, type: 'treatment' }]);
      }
    }
  }, [currentVitals, currentCase, patientState, startGradualChange, arrestActive, adrenalineDoses, shockCount]);

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
    lastActivityRef.current = Date.now();
    setHintVisible(false);

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
      toast.error(`Critical finding!`, {
        description: findings.filter(f => f.severity === 'critical').map(f => f.value).join('; '),
        duration: 6000,
      });
    } else if (hasAbnormal) {
      toast.warning(`Abnormal finding`, {
        description: findings.filter(f => f.severity === 'abnormal').map(f => f.value).join('; '),
        duration: 4000,
      });
    } else {
      // Normal findings — no toast needed, findings panel shows them
    }
  }, [assessmentTracker, currentCase, caseStartTime]);

  // End case — show transport decision wizard from step 1
  const endCase = useCallback((action: 'transport' | 'end') => {
    setTransportStep(1);
    setShowTransportDecision(true);
  }, []);

  // Finalize case after transport decisions are made
  const finalizeCase = useCallback(() => {
    setCaseEndTime(Date.now());
    setShowTransportDecision(false);
    setPhase('postcase');
    if (deteriorationIntervalRef.current) {
      clearInterval(deteriorationIntervalRef.current);
      deteriorationIntervalRef.current = null;
    }
    toast.info('Care ended — generating report...');
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

    // Use assessment tracker score if available (primary scoring system), fall back to checklist
    const debrief = assessmentTracker ? generateAssessmentDebrief(assessmentTracker) : null;
    const assessmentScore = debrief ? debrief.score : completed.reduce((sum, item) => sum + (item.points || 0), 0);
    const assessmentTotal = debrief ? debrief.totalPossible : checklist.reduce((sum, item) => sum + (item.points || 0), 0);

    // Treatment bonus: appropriate treatments earn points (up to 30% of total possible)
    const treatmentBonusCap = Math.round(assessmentTotal * 0.3);
    let treatmentBonus = 0;
    if (appliedTreatments.length > 0 && currentCase) {
      // Each treatment earns 5 points, capped at treatmentBonusCap
      treatmentBonus = Math.min(appliedTreatments.length * 5, treatmentBonusCap);
      // Extra bonus if vitals improved (patient got better)
      const initialSpO2Check = parseInt(String(vitalsHistory[0]?.spo2)) || 0;
      const finalSpO2Check = parseInt(String(vitalsHistory[vitalsHistory.length - 1]?.spo2)) || 0;
      if (finalSpO2Check > initialSpO2Check + 5) treatmentBonus = Math.min(treatmentBonus + 10, treatmentBonusCap);
      // Bonus for early treatment (within 2 minutes)
      const firstTx = caseStartTime && appliedTreatments[0]?.appliedAt
        ? Math.round((new Date(appliedTreatments[0].appliedAt).getTime() - caseStartTime) / 1000)
        : null;
      if (firstTx !== null && firstTx <= 120) treatmentBonus = Math.min(treatmentBonus + 5, treatmentBonusCap);
    }

    const scoreEarned = assessmentScore + treatmentBonus;
    const totalPossible = assessmentTotal + treatmentBonusCap;
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
      // Assessment debrief (reuse already-computed debrief)
      assessmentDebrief: debrief,
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

              <ThemeToggle />
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
          <div className="max-w-2xl mx-auto animate-fade-in space-y-6 sm:space-y-10">
            {/* Hero Section */}
            <div className="text-center mb-2 sm:mb-4 relative">
              <div className="absolute inset-0 -top-8 -z-10 overflow-hidden">
                <div className="mx-auto w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/8 via-indigo-500/5 to-cyan-500/8 blur-3xl" />
              </div>
              <div className="mx-auto mb-5 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/10">
                <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-sm" />
              </div>
              <h2 className="heading-display text-2xl sm:text-[2.25rem] leading-tight text-foreground">Paramedic Case Generator</h2>
              <p className="text-muted-foreground mt-2 sm:mt-3 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Select your training level and generate realistic emergency scenarios to sharpen your clinical skills
              </p>
            </div>

            {/* Year Level */}
            <Card className="card-glass rounded-2xl dark:bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 heading-premium">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  Select Your Year Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
                  {yearLevels.map(year => (
                    <button
                      key={year.value}
                      onClick={() => setSelectedYear(year.value as StudentYear)}
                      className={`group flex flex-col items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                        selectedYear === year.value
                          ? 'border-blue-500 bg-gradient-to-b from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/20 scale-[1.02]'
                          : 'border-border/50 hover:border-blue-400/60 text-muted-foreground hover:text-foreground hover:bg-accent/40 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-700/60'
                      }`}
                    >
                      <GraduationCap className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${selectedYear === year.value ? 'text-blue-500 scale-110' : 'text-muted-foreground/40 group-hover:text-blue-400/70'}`} />
                      {year.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card className="card-glass rounded-2xl dark:bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 heading-premium">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Choose Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2.5 rounded-xl border text-sm transition-all duration-300 ${
                      selectedCategory === 'all'
                        ? 'border-blue-500 bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500/25 shadow-md shadow-blue-500/10'
                        : 'border-border/50 hover:border-blue-400/50 text-muted-foreground hover:bg-accent/40 hover:shadow-sm dark:border-slate-700/60'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${selectedCategory === 'all' ? 'bg-blue-500' : 'bg-muted-foreground/30'}`} />
                      All Categories
                    </span>
                  </button>
                  {caseCategories
                    .filter(cat => allCases.some(c => c.category === cat.value && c.yearLevels?.includes(selectedYear as any)))
                    .map(cat => {
                    const catColors: Record<string, string> = {
                      cardiac: 'bg-red-500', respiratory: 'bg-cyan-500', trauma: 'bg-orange-500',
                      neurological: 'bg-purple-500', medical: 'bg-emerald-500', paediatric: 'bg-pink-500',
                      obstetric: 'bg-rose-400', environmental: 'bg-amber-500', psychiatric: 'bg-violet-500',
                    };
                    const dotColor = catColors[cat.value.toLowerCase()] || 'bg-blue-500';
                    return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-4 py-2.5 rounded-xl border text-sm transition-all duration-300 ${
                        selectedCategory === cat.value
                          ? 'border-blue-500 bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500/25 shadow-md shadow-blue-500/10'
                          : 'border-border/50 hover:border-blue-400/50 text-muted-foreground hover:bg-accent/40 hover:shadow-sm dark:border-slate-700/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${selectedCategory === cat.value ? 'bg-blue-500' : dotColor}`} />
                        {cat.label}
                      </span>
                    </button>
                  );})}
                </div>
              </CardContent>
            </Card>

            {/* Generate */}
            <Button
              onClick={generateCase}
              disabled={isGenerating}
              size="lg"
              className="w-full gap-2.5 sm:gap-3 text-sm sm:text-lg py-6 sm:py-8 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/35 hover:-translate-y-1 font-semibold tracking-tight generate-btn-shimmer"
            >
              {isGenerating ? (
                <><Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> Generating Case...</>
              ) : (
                <><Sparkles className="h-5 w-5 sm:h-6 sm:w-6" /> Generate Case</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground/50 pb-4">
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
              <h2 className="heading-premium text-lg sm:text-2xl">{getStudentCaseTitle(currentCase)}</h2>
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
            {/* ===== TOP: Patient Banner (full width) ===== */}
            <div className="p-3 sm:p-5 rounded-2xl card-glass dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/10 shrink-0">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">{getStudentCaseTitle(currentCase)}</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {currentCase.dispatchInfo.location}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 dark:bg-primary/15 border border-primary/20 shrink-0">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                  <span className="font-mono text-xs sm:text-sm font-semibold text-primary">{formatTime(elapsedSeconds)}</span>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPhase('case')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg flex-1 sm:flex-none h-8 dark:border-slate-700"
                >
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Case </span>Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => endCase('transport')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm shadow-amber-500/15 flex-1 sm:flex-none h-8"
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

            {/* ===== Scene Toggle ===== */}
            <button
              onClick={() => setShowScene(!showScene)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-300 font-semibold ${
                showScene
                  ? 'border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 text-amber-700 dark:text-amber-300 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/15 hover:-translate-y-0.5'
              }`}
            >
              <Shield className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left text-sm sm:text-base">
                {showScene ? 'Scene Details' : 'Assess Scene — Click to View Details'}
              </span>
              {showScene ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5 animate-bounce-subtle" />}
            </button>
            {showScene && (
              <div className="p-3 rounded-xl bg-muted/20 border border-border/30 text-xs space-y-2 animate-fade-in">
                <p className="leading-relaxed">{currentCase.sceneInfo.description}</p>
                {currentCase.sceneInfo.hazards && currentCase.sceneInfo.hazards.length > 0 && (
                  <div className="bg-red-500/8 border border-red-500/15 rounded-lg p-2.5">
                    <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wider">Hazards</p>
                    <ul className="space-y-0.5">
                      {currentCase.sceneInfo.hazards.map((h, i) => (
                        <li key={i} className="text-red-700 dark:text-red-400 flex items-start gap-1.5">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />{h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentCase.sceneInfo.bystanders && (
                  <p className="text-muted-foreground">Bystanders: {currentCase.sceneInfo.bystanders}</p>
                )}
              </div>
            )}

            {/* Transport Decision Dialog */}
            {/* Transport Decision Wizard — Step-by-step */}
            {showTransportDecision && (
              <Card className="border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl overflow-hidden animate-fade-in">
                <CardHeader className="pb-2 border-b border-amber-200 dark:border-amber-800">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ambulance className="h-4 w-4 text-amber-600" />
                      Transport & Handover
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <div key={s} className={`h-1.5 w-6 rounded-full transition-all ${
                          s < transportStep ? 'bg-green-500'
                          : s === transportStep ? 'bg-amber-500'
                          : 'bg-border/40'
                        }`} />
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">

                  {/* STEP 1: Transport Priority */}
                  {transportStep === 1 && (
                    <div className="animate-fade-in">
                      <p className="text-sm font-bold mb-1">How do you want to transport this patient?</p>
                      <p className="text-xs text-muted-foreground mb-3">Select the transport priority based on the patient's condition.</p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { value: 'lights', label: '🚨 Lights & Sirens', desc: 'Time-critical — life-threatening condition requiring immediate hospital intervention', color: 'border-red-400 bg-red-50 dark:bg-red-950/20' },
                          { value: 'urgent', label: '⚡ Urgent (No L&S)', desc: 'Serious condition requiring prompt transport but stable enough for normal driving', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' },
                          { value: 'routine', label: '🟢 Routine', desc: 'Stable patient — standard safe transport, no time pressure', color: 'border-green-400 bg-green-50 dark:bg-green-950/20' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, priority: opt.value }));
                              setTransportStep(2);
                            }}
                            className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${opt.color}`}
                          >
                            <p className="text-sm font-semibold">{opt.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Patient Position */}
                  {transportStep === 2 && (
                    <div className="animate-fade-in">
                      <p className="text-sm font-bold mb-1">What position should the patient be transported in?</p>
                      <p className="text-xs text-muted-foreground mb-3">Choose the most appropriate position for this patient's condition.</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { pos: 'Supine', desc: 'Flat on back — trauma, spinal precautions' },
                          { pos: 'Semi-Fowlers (30-45°)', desc: 'Head elevated — cardiac, respiratory' },
                          { pos: 'Left Lateral', desc: 'On left side — pregnancy, unconscious' },
                          { pos: 'Sitting Upright', desc: 'Fully upright — severe dyspnoea, CHF' },
                          { pos: 'Recovery Position', desc: 'Unconscious, breathing, no spinal risk' },
                          { pos: 'Trendelenburg', desc: 'Legs elevated — shock, hypotension' },
                        ].map(({ pos, desc }) => (
                          <button
                            key={pos}
                            onClick={() => {
                              setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, position: pos }));
                              setTransportStep(3);
                            }}
                            className="p-2.5 rounded-xl border-2 border-border/30 text-left transition-all hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:shadow-md"
                          >
                            <p className="text-xs font-semibold">{pos}</p>
                            <p className="text-[9px] text-muted-foreground">{desc}</p>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setTransportStep(1)} className="text-[10px] text-muted-foreground mt-2 hover:underline">← Back</button>
                    </div>
                  )}

                  {/* STEP 3: Pre-Alert & Destination */}
                  {transportStep === 3 && (
                    <div className="animate-fade-in space-y-4">
                      <div>
                        <p className="text-sm font-bold mb-1">Will you pre-alert the hospital?</p>
                        <p className="text-xs text-muted-foreground mb-3">Pre-alerting gives the receiving team time to prepare.</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, preAlert: true }))}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              transportDecisions?.preAlert === true ? 'border-red-400 bg-red-50 dark:bg-red-950/20 ring-2 ring-red-400/30' : 'border-border/30 hover:border-red-400'
                            }`}
                          >
                            <p className="text-xs font-semibold">📞 Yes — Pre-Alert</p>
                            <p className="text-[9px] text-muted-foreground">Notify hospital of incoming patient</p>
                          </button>
                          <button
                            onClick={() => setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, preAlert: false }))}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              transportDecisions?.preAlert === false && transportDecisions?.priority ? 'border-green-400 bg-green-50 dark:bg-green-950/20 ring-2 ring-green-400/30' : 'border-border/30 hover:border-green-400'
                            }`}
                          >
                            <p className="text-xs font-semibold">No Pre-Alert</p>
                            <p className="text-[9px] text-muted-foreground">Standard arrival, no advance notice</p>
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold mb-1">Where are you transporting to?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Nearest ED', 'Trauma Centre', 'Cardiac Centre (PCI)', 'Stroke Centre', 'Burns Unit', 'Paediatric ED'].map(dest => (
                            <button
                              key={dest}
                              onClick={() => setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, destination: dest }))}
                              className={`p-2 rounded-lg border text-xs text-left transition-all ${
                                transportDecisions?.destination === dest ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20 font-semibold ring-1 ring-amber-400/30' : 'border-border/30 hover:border-amber-400'
                              }`}
                            >
                              {dest}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button onClick={() => setTransportStep(2)} className="text-[10px] text-muted-foreground hover:underline">← Back</button>
                        <Button
                          size="sm"
                          onClick={() => setTransportStep(4)}
                          disabled={!transportDecisions?.destination}
                          className="rounded-lg gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs"
                        >
                          Next <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Provisional Diagnosis */}
                  {transportStep === 4 && (
                    <div className="animate-fade-in">
                      <p className="text-sm font-bold mb-1">What is your provisional diagnosis?</p>
                      <p className="text-xs text-muted-foreground mb-3">Based on your assessment, what do you think is wrong with this patient?</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {currentCase.expectedFindings?.differentialDiagnoses
                          ? [...currentCase.expectedFindings.differentialDiagnoses.slice(0, 5),
                             'Other / Undifferentiated'
                          ].map(dx => (
                            <button
                              key={dx}
                              onClick={() => {
                                setTransportDecisions(prev => ({ ...prev || { priority: '', position: '', preAlert: false, destination: '', provisionalDiagnosis: '' }, provisionalDiagnosis: dx }));
                                setTransportStep(5);
                              }}
                              className="p-2.5 rounded-lg border text-xs text-left transition-all border-border/30 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            >
                              {dx}
                            </button>
                          ))
                          : <p className="text-xs text-muted-foreground">No options available</p>
                        }
                      </div>
                      <button onClick={() => setTransportStep(3)} className="text-[10px] text-muted-foreground mt-2 hover:underline">← Back</button>
                    </div>
                  )}

                  {/* STEP 5: Confirm Summary */}
                  {transportStep === 5 && (
                    <div className="animate-fade-in space-y-3">
                      <p className="text-sm font-bold mb-2">Confirm your decisions</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-xs">
                          <span className="text-muted-foreground">Priority:</span>
                          <span className="font-semibold">{transportDecisions?.priority === 'lights' ? '🚨 Lights & Sirens' : transportDecisions?.priority === 'urgent' ? '⚡ Urgent' : '🟢 Routine'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-xs">
                          <span className="text-muted-foreground">Position:</span>
                          <span className="font-semibold">{transportDecisions?.position}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-xs">
                          <span className="text-muted-foreground">Pre-Alert:</span>
                          <span className="font-semibold">{transportDecisions?.preAlert ? '📞 Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-xs">
                          <span className="text-muted-foreground">Destination:</span>
                          <span className="font-semibold">{transportDecisions?.destination}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs">
                          <span className="text-muted-foreground">Diagnosis:</span>
                          <span className="font-semibold text-blue-700 dark:text-blue-300">{transportDecisions?.provisionalDiagnosis}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <button onClick={() => setTransportStep(4)} className="text-[10px] text-muted-foreground hover:underline">← Back</button>
                        <Button
                          onClick={finalizeCase}
                          className="rounded-xl gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Confirm & End Case
                        </Button>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}

            {/* Coaching hint — shown when student is inactive */}
            {hintVisible && currentHint && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 animate-fade-in">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Coaching Hint</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{currentHint}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={() => setHintVisible(false)}>
                    <XCircle className="h-3.5 w-3.5 text-blue-400" />
                  </Button>
                </div>
              </div>
            )}

            {/* ===== SPLIT LAYOUT: Left (Assessment) + Right (Monitor/Treatment) ===== */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-4">

              {/* ===== LEFT COLUMN ===== */}
              <div className="order-2 lg:order-1 space-y-4">

                {/* --- PRIMARY SURVEY (ABCDE) --- */}
                <Card className="card-glass rounded-xl sm:rounded-2xl overflow-hidden">
                  <CardHeader className="pb-2 px-3 sm:px-4 border-b border-border/30">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-blue-500/15">
                        <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                      </div>
                      Primary Survey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3">
                    <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                      {([
                        { key: 'scene-safety' as const, letter: 'S', label: 'Scene', stepId: 'scene-safety' as AssessmentStepId },
                        { key: 'airway' as const, letter: 'A', label: 'Airway', stepId: 'airway' as AssessmentStepId },
                        { key: 'breathing' as const, letter: 'B', label: 'Breathing', stepId: 'breathing' as AssessmentStepId },
                        { key: 'circulation' as const, letter: 'C', label: 'Circulation', stepId: 'circulation' as AssessmentStepId },
                        { key: 'disability' as const, letter: 'D', label: 'Disability', stepId: 'disability' as AssessmentStepId },
                        { key: 'exposure' as const, letter: 'E', label: 'Exposure', stepId: 'exposure' as AssessmentStepId },
                      ]).map(item => {
                        const isAssessed = assessmentTracker?.performed.some(p => p.stepId === item.stepId);
                        const isActive = activePrimarySurvey === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              // Always call to refresh activeFindings for display
                              handlePerformAssessment(item.stepId);
                              setActivePrimarySurvey(isActive ? null : item.key);
                            }}
                            className={`flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-xl border-2 transition-all text-center ${
                              isActive
                                ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                                : isAssessed
                                  ? 'border-green-500/40 bg-green-500/5'
                                  : 'border-border/40 hover:border-blue-500/40 hover:bg-accent/30'
                            }`}
                          >
                            <span className={`text-base sm:text-xl font-bold ${isAssessed ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                              {item.letter}
                            </span>
                            <span className="text-[8px] sm:text-[10px] text-muted-foreground leading-tight">{item.label}</span>
                            {isAssessed && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                          </button>
                        );
                      })}
                    </div>
                    {/* Findings dropdown for active primary survey step */}
                    {activePrimarySurvey && activeFindings && activeFindings.stepId === activePrimarySurvey && (
                      <div className="mt-2 p-2.5 rounded-xl bg-muted/30 border border-border/30 animate-fade-in">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {activePrimarySurvey.charAt(0).toUpperCase() + activePrimarySurvey.slice(1)} Findings
                        </p>
                        <div className="space-y-1">
                          {activeFindings.findings.map((f, i) => (
                            <div key={i} className={`text-xs p-1.5 rounded-lg border ${
                              f.severity === 'critical' ? 'bg-red-500/8 border-red-500/20 text-red-700 dark:text-red-300' :
                              f.severity === 'abnormal' ? 'bg-amber-500/8 border-amber-500/20 text-amber-700 dark:text-amber-300' :
                              'bg-green-500/5 border-green-500/15 text-foreground'
                            }`}>
                              <span className="font-medium">{f.label}:</span> {f.value}
                              {f.significance && <p className="text-[10px] text-muted-foreground mt-0.5 italic">{f.significance}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* --- 3D PHYSICAL EXAMINATION --- */}
                {assessmentTracker && (
                  <Suspense fallback={<LoadingCard />}>
                    <Body3DModel
                      onRegionClick={handlePerformAssessment}
                      assessedRegions={new Set(
                        assessmentTracker.performed
                          .filter(p => p.phase === 'secondary')
                          .map(p => p.stepId)
                      )}
                      caseData={currentCase}
                      patientSounds={patientState?.sounds}
                      isStudentView={true}
                    />
                  </Suspense>
                )}

                {/* --- HISTORY (SAMPLE) --- */}
                <Card className="card-glass rounded-xl sm:rounded-2xl overflow-hidden">
                  <CardHeader className="pb-2 px-3 sm:px-4 border-b border-border/30">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-purple-500/15">
                        <ClipboardCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-500" />
                      </div>
                      History (SAMPLE)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3">
                    <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                      {([
                        { key: 'signs-symptoms' as const, letter: 'S', label: 'Signs', stepId: 'signs-symptoms' as AssessmentStepId },
                        { key: 'allergies' as const, letter: 'A', label: 'Allergies', stepId: 'allergies' as AssessmentStepId },
                        { key: 'medications' as const, letter: 'M', label: 'Meds', stepId: 'medications' as AssessmentStepId },
                        { key: 'past-medical' as const, letter: 'P', label: 'PMHx', stepId: 'past-medical' as AssessmentStepId },
                        { key: 'last-meal' as const, letter: 'L', label: 'Last Meal', stepId: 'last-meal' as AssessmentStepId },
                        { key: 'events-leading' as const, letter: 'E', label: 'Events', stepId: 'events-leading' as AssessmentStepId },
                      ]).map(item => {
                        const isAssessed = assessmentTracker?.performed.some(p => p.stepId === item.stepId);
                        const isActive = activeHistoryStep === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              if (!isAssessed) {
                                handlePerformAssessment(item.stepId);
                              }
                              setActiveHistoryStep(isActive ? null : item.key);
                            }}
                            className={`flex flex-col items-center gap-0.5 p-1.5 sm:p-2 rounded-lg border-2 transition-all text-center ${
                              isActive
                                ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
                                : isAssessed
                                  ? 'border-green-500/40 bg-green-500/5'
                                  : 'border-border/40 hover:border-purple-500/40 hover:bg-accent/30'
                            }`}
                          >
                            <span className={`text-sm sm:text-lg font-bold ${isAssessed ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                              {item.letter}
                            </span>
                            <span className="text-[7px] sm:text-[9px] text-muted-foreground leading-tight">{item.label}</span>
                            {isAssessed && <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />}
                          </button>
                        );
                      })}
                    </div>
                    {/* Findings dropdown for active history step */}
                    {activeHistoryStep && activeFindings && activeFindings.stepId === activeHistoryStep && (
                      <div className="mt-2 p-2.5 rounded-xl bg-muted/30 border border-border/30 animate-fade-in">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {activeHistoryStep.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Findings
                        </p>
                        <div className="space-y-1">
                          {activeFindings.findings.map((f, i) => (
                            <div key={i} className={`text-xs p-1.5 rounded-lg border ${
                              f.severity === 'critical' ? 'bg-red-500/8 border-red-500/20 text-red-700 dark:text-red-300' :
                              f.severity === 'abnormal' ? 'bg-amber-500/8 border-amber-500/20 text-amber-700 dark:text-amber-300' :
                              'bg-green-500/5 border-green-500/15 text-foreground'
                            }`}>
                              <span className="font-medium">{f.label}:</span> {f.value}
                              {f.significance && <p className="text-[10px] text-muted-foreground mt-0.5 italic">{f.significance}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Clinical Assessment Panel removed — replaced by inline ABCDE Primary Survey + 3D Physical Exam above */}
              </div>

              {/* ===== RIGHT COLUMN (sticky on desktop) ===== */}
              <div className="order-1 lg:order-2 mb-4 lg:mb-0 lg:sticky lg:top-16 lg:self-start space-y-4">

                {/* --- LIFEPAK MONITOR --- */}
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
                    ecgFindings={currentCase.abcde?.circulation?.ecgFindings}
                    appliedTreatments={appliedTreatmentIds}
                    overrideRhythm={patientState?.currentRhythm}
                    cprState={arrestActive ? {
                      active: arrestActive,
                      running: cprRunning,
                      timerSeconds: cprCycleTimer,
                      cycleNumber: cprCycleNumber,
                      shockCount,
                      adrenalineDoses,
                      amiodaroneDoses,
                      lastAdrenalineTime,
                      onStartCPR: () => {
                        setCprRunning(true);
                        if (cprCycleTimer <= 0) setCprCycleTimer(120);
                        setArrestTimeline(prev => [...prev, { time: Date.now(), event: 'CPR started', type: 'cpr-start' }]);
                        lastActivityRef.current = Date.now();
                      },
                      onPauseCPR: () => {
                        setCprRunning(false);
                        setArrestTimeline(prev => [...prev, { time: Date.now(), event: 'CPR paused', type: 'cpr-pause' }]);
                      },
                      onDefibrillate: () => {
                        setShowDefibDialog(true);
                        lastActivityRef.current = Date.now();
                      },
                    } : undefined}
                  />
                </Suspense>

                {/* --- MANAGEMENT (ABCDE) --- */}
                <Card className="card-glass rounded-xl sm:rounded-2xl overflow-hidden">
                  <CardHeader className="pb-2 px-3 sm:px-4 border-b border-border/30">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-green-500/15">
                        <Syringe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                      </div>
                      Management (ABCDE)
                      <Badge variant="secondary" className="ml-auto text-[9px] sm:text-[10px]">{appliedTreatments.length} applied</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3">
                    <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                      {([
                        { key: 'airway' as const, letter: 'A', label: 'Airway', categories: ['airway'] as TreatmentCategory[] },
                        { key: 'breathing' as const, letter: 'B', label: 'Breathing', categories: ['breathing'] as TreatmentCategory[] },
                        { key: 'circulation' as const, letter: 'C', label: 'Circulation', categories: ['circulation'] as TreatmentCategory[] },
                        { key: 'disability' as const, letter: 'D', label: 'Disability', categories: [] as TreatmentCategory[] },
                        { key: 'exposure' as const, letter: 'E', label: 'Exposure', categories: ['comfort', 'positioning'] as TreatmentCategory[] },
                        { key: 'medications' as const, letter: 'Rx', label: 'Meds', categories: ['medication'] as TreatmentCategory[] },
                      ]).map(item => {
                        const isActive = activeManagementTab === item.key;
                        // Count treatments applied in this category
                        const appliedInCat = appliedTreatments.filter(t => {
                          if (item.key === 'disability') {
                            return ['glucose_oral', 'glucose_iv', 'midazolam', 'diazepam', 'mannitol', 'naloxone', 'flumazenil'].includes(t.id);
                          }
                          return item.categories.includes(t.category as TreatmentCategory);
                        }).length;
                        return (
                          <button
                            key={item.key}
                            onClick={() => setActiveManagementTab(isActive ? null : item.key)}
                            className={`flex flex-col items-center gap-0.5 p-1.5 sm:p-2 rounded-lg border-2 transition-all text-center relative ${
                              isActive
                                ? 'border-green-500 bg-green-500/10 ring-1 ring-green-500/30'
                                : 'border-border/40 hover:border-green-500/40 hover:bg-accent/30'
                            }`}
                          >
                            <span className="text-sm sm:text-lg font-bold">{item.letter}</span>
                            <span className="text-[7px] sm:text-[9px] text-muted-foreground leading-tight">{item.label}</span>
                            {appliedInCat > 0 && (
                              <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[8px] bg-green-500">{appliedInCat}</Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* Treatment options for active management tab */}
                    {activeManagementTab && currentVitals && (
                      <div className="mt-2 p-2 rounded-xl bg-muted/20 border border-border/30 animate-fade-in max-h-72 overflow-y-auto">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {activeManagementTab === 'medications' ? 'Medications' : activeManagementTab.charAt(0).toUpperCase() + activeManagementTab.slice(1)} Treatments
                          </p>
                        </div>
                        {/* Search input for medications */}
                        {activeManagementTab === 'medications' && (
                          <input
                            type="text"
                            value={medSearch}
                            onChange={e => setMedSearch(e.target.value)}
                            placeholder="Search medications..."
                            className="w-full mb-2 px-2.5 py-1.5 rounded-lg border border-border/40 bg-white dark:bg-black/20 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        )}
                        <div className="space-y-1">
                          {TREATMENTS.filter(t => {
                            if (activeManagementTab === 'disability') {
                              return [
                                'glucose_10g', 'dextrose_10', 'dextrose_10_250ml', 'midazolam_5mg', 'midazolam_buccal',
                                'diazepam_rectal', 'mannitol_20', 'naloxone_04mg', 'ketamine_iv',
                                'ondansetron_4mg', 'metoclopramide_10mg', 'hypertonic_saline',
                                'lorazepam_4mg', 'flumazenil_02mg',
                              ].includes(t.id) || t.description?.toLowerCase().includes('seizure') || t.description?.toLowerCase().includes('glucose');
                            }
                            if (activeManagementTab === 'exposure') {
                              return t.category === 'comfort' || t.category === 'positioning';
                            }
                            if (activeManagementTab === 'medications') {
                              const matchesSearch = !medSearch || t.name.toLowerCase().includes(medSearch.toLowerCase()) || t.description.toLowerCase().includes(medSearch.toLowerCase());
                              return t.category === 'medication' && matchesSearch;
                            }
                            const catMap: Record<string, TreatmentCategory> = { airway: 'airway', breathing: 'breathing', circulation: 'circulation' };
                            return t.category === catMap[activeManagementTab];
                          })
                          .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical
                          .map(treatment => {
                            const isApplied = appliedTreatmentIds.includes(treatment.id);
                            const isCurrentlyApplying = applyingTreatmentId === treatment.id;
                            return (
                              <div key={treatment.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                                isApplied ? 'bg-green-500/5 border-green-500/20' : 'border-border/30 hover:bg-accent/20'
                              }`}>
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium">{treatment.name}</span>
                                  <p className="text-[10px] text-muted-foreground truncate">{treatment.description}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant={isApplied ? 'outline' : 'default'}
                                  className="h-6 px-2 text-[10px] rounded-md shrink-0"
                                  onClick={() => applyTreatment(treatment)}
                                  disabled={isCurrentlyApplying}
                                >
                                  {isCurrentlyApplying ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : isApplied ? (
                                    <>
                                      <RotateCcw className="h-2.5 w-2.5 mr-0.5" /> Repeat
                                    </>
                                  ) : (
                                    'Apply'
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Auscultation integrated into 3D Physical Exam — click lung/heart regions to listen */}

                {/* --- Cardiac Arrest Status Bar --- */}
                {arrestActive && (
                  <div className="p-3 rounded-xl bg-red-500/10 border-2 border-red-500/30 animate-pulse-slow">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <Zap className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Cardiac Arrest Active</span>
                      <Badge variant="destructive" className="ml-auto text-[10px]">
                        {cprRunning ? `CPR ${formatTime(cprCycleTimer)}` : 'CPR Paused'}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* --- Applied Treatments Log --- */}
                {appliedTreatments.length > 0 && (
                  <Card className="card-glass rounded-xl sm:rounded-2xl">
                    <CardHeader className="pb-2 border-b border-border/30 px-3 sm:px-4">
                      <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                        <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-green-500/15">
                          <ClipboardCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                        </div>
                        Treatments Applied
                        <Badge variant="secondary" className="ml-auto text-[9px] sm:text-[10px]">{appliedTreatments.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 sm:pt-3 px-3 sm:px-4">
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {appliedTreatments.map((t, i) => {
                          const hasWarning = t.description?.includes('CRITICAL') || t.description?.includes('ADVERSE') || t.description?.includes('CONTRAINDICATED');
                          const isPartial = t.description?.includes('Partial') || t.description?.includes('Consider repeat');
                          return (
                            <div key={i} className={`flex items-start gap-2 text-[10px] sm:text-xs p-2 rounded-lg border ${
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
                                {patientState && patientState.treatmentCounts[t.id] > 1 && (
                                  <Badge variant="outline" className="ml-1.5 text-[9px] py-0 h-4">
                                    x{patientState.treatmentCounts[t.id]}
                                  </Badge>
                                )}
                                <p className="text-muted-foreground mt-0.5 leading-relaxed">
                                  {(() => {
                                    const desc = t.description || '';
                                    const cleaned = desc
                                      .replace(/\s*—\s*(?:[A-Z][A-Za-z\d]+:\s*[\d./]+[%°]?[A-Za-z]?\s*→\s*[\d./]+[%°]?[A-Za-z]?(?:,\s*)?)+\.?/g, '.')
                                      .replace(/\s*—\s*\d+\s*vitals?\s*improving\.?\s*(?:Consider\s*repeat\s*dose\.?)?/g, '.')
                                      .replace(/\.{2,}/g, '.')
                                      .trim();
                                    return cleaned;
                                  })()}
                                </p>
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
            </div>

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

            {/* TreatmentApplicationPanel removed — replaced by inline Management ABCDE tabs above */}
            {false && currentVitals && (
              <Suspense fallback={<LoadingCard />}>
                <TreatmentApplicationPanel
                  currentVitals={currentVitals}
                  onApplyTreatment={applyTreatment}
                  appliedTreatmentIds={appliedTreatmentIds}
                  isApplying={!!applyingTreatmentId}
                  applyingTreatmentId={applyingTreatmentId}
                  studentYear={selectedYear}
                  isStudentView={true}
                />
              </Suspense>
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
              <CaseDisplay caseData={currentCase} studentYear={selectedYear} isStudentView={true} />
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
                <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate px-2">{getStudentCaseTitle(currentCase)}</p>
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

            {/* Transport & Clinical Decisions */}
            {transportDecisions && (
              <Card className="card-glass rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15">
                      <Ambulance className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    Transport & Clinical Decisions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Transport Priority</span>
                      <p className="font-semibold mt-1">{transportDecisions.priority === 'lights' ? '🚨 Lights & Sirens' : transportDecisions.priority === 'urgent' ? '⚡ Urgent' : '🟢 Routine'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Patient Position</span>
                      <p className="font-semibold mt-1">{transportDecisions.position || 'Not selected'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pre-Alert</span>
                      <p className="font-semibold mt-1">{transportDecisions.preAlert ? '✓ Yes — hospital notified' : '✗ No pre-alert'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Destination</span>
                      <p className="font-semibold mt-1">{transportDecisions.destination || 'Not specified'}</p>
                    </div>
                  </div>
                  {transportDecisions.provisionalDiagnosis && (
                    <div className={`mt-3 p-3 rounded-xl border ${
                      transportDecisions.provisionalDiagnosis === currentCase.expectedFindings?.mostLikelyDiagnosis
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-300'
                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300'
                    }`}>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Your Provisional Diagnosis</span>
                      <p className="font-semibold text-sm mt-1">{transportDecisions.provisionalDiagnosis}</p>
                      {transportDecisions.provisionalDiagnosis === currentCase.expectedFindings?.mostLikelyDiagnosis ? (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Correct — matches the most likely diagnosis</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-1">The most likely diagnosis for this case was: <strong>{currentCase.expectedFindings?.mostLikelyDiagnosis}</strong></p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                            <span className="text-muted-foreground ml-2">
                              {(() => {
                                const desc = t.description || '';
                                return desc
                                  .replace(/\s*—\s*(?:[A-Z][A-Za-z\d]+:\s*[\d./]+[%°]?[A-Za-z]?\s*→\s*[\d./]+[%°]?[A-Za-z]?(?:,\s*)?)+\.?/g, '.')
                                  .replace(/\s*—\s*\d+\s*vitals?\s*improving\.?\s*(?:Consider\s*repeat\s*dose\.?)?/g, '.')
                                  .replace(/\.{2,}/g, '.')
                                  .trim();
                              })()}
                            </span>
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

            {/* Cardiac Arrest Timeline */}
            {arrestTimeline.length > 0 && (
              <Card className="card-glass rounded-2xl overflow-hidden border-red-200 dark:border-red-800">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/15">
                      <Heart className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    Cardiac Arrest Timeline
                    <Badge variant="destructive" className="ml-auto text-[10px]">
                      {cprCycleNumber} cycles | {shockCount} shocks | {adrenalineDoses} adrenaline
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-1.5">
                    {arrestTimeline.map((event, i) => {
                      const elapsed = arrestStartTime ? Math.floor((event.time - arrestStartTime) / 1000) : 0;
                      const mins = Math.floor(elapsed / 60);
                      const secs = elapsed % 60;
                      const typeColors: Record<string, string> = {
                        'arrest-start': 'text-red-600 bg-red-50',
                        'cpr-start': 'text-green-600 bg-green-50',
                        'cpr-pause': 'text-amber-600 bg-amber-50',
                        'rhythm-check': 'text-blue-600 bg-blue-50',
                        'shock': 'text-yellow-600 bg-yellow-50',
                        'drug': 'text-purple-600 bg-purple-50',
                        'rosc': 'text-emerald-600 bg-emerald-50',
                        'lucas': 'text-slate-600 bg-slate-50',
                        'treatment': 'text-cyan-600 bg-cyan-50',
                      };
                      return (
                        <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${typeColors[event.type] || 'bg-muted/30'}`}>
                          <span className="font-mono text-[10px] w-10 shrink-0">{mins}:{String(secs).padStart(2, '0')}</span>
                          <span className="flex-1">{event.event}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* AHA Compliance Summary */}
                  <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">AHA 2025 Compliance</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {shockCount > 0 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        Defibrillation attempted
                      </div>
                      <div className="flex items-center gap-1.5">
                        {adrenalineDoses > 0 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        Adrenaline administered
                      </div>
                      <div className="flex items-center gap-1.5">
                        {amiodaroneDoses > 0 && shockCount >= 3 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : shockCount < 3 ? <Minus className="h-3 w-3 text-muted-foreground" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        Amiodarone protocol
                      </div>
                      <div className="flex items-center gap-1.5">
                        {cprCycleNumber >= 1 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        CPR cycles completed
                      </div>
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
                const desc = cat === 'assessment' ? 'clinical assessment gaps' : `${cat} assessment gaps`;
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

            {/* Further Study Resources — same as instructor debrief */}
            <DebriefingResourcesPanel caseData={currentCase} />

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
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 rounded-xl text-sm sm:text-base h-11 sm:h-12"
                onClick={async () => {
                  if (!currentCase || !session) return;
                  try {
                    toast.loading('Generating PDF report...');
                    await exportSessionToPDF({
                      session: {
                        ...session,
                        score: performanceMetrics.scoreEarned || session.score,
                        totalPossible: performanceMetrics.totalPossible || session.totalPossible,
                        completedItems: assessmentTracker?.performed?.map(p => p.stepId) || session.completedItems,
                      },
                      caseData: currentCase,
                      elapsedTime: formatTime(performanceMetrics.totalTime),
                      appliedTreatments,
                      vitalsHistory,
                      debriefingResources: getResourcesForDebriefing(currentCase),
                    });
                    toast.dismiss();
                    toast.success('PDF report downloaded');
                  } catch (err) {
                    console.error('PDF generation error:', err);
                    toast.dismiss();
                    toast.error('Failed to generate PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
                  }
                }}
              >
                <FileText className="h-4 w-4" /> Download Report
              </Button>
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
