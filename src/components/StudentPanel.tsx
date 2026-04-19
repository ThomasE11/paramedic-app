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

/**
 * Build a radio-call style dispatch narration for voice playback.
 * Mimics the cadence of a real paramedic radio dispatch:
 *   "Control to responding unit. Priority one job for you. Caller reports…
 *    Patient is a… On arrival you'll find…"
 * The pauses and phrasing give the humanised voice engine natural beats.
 */
function buildDispatchNarration(caseData: CaseScenario): string {
  const dispatch = caseData.dispatchInfo;
  const patient = caseData.patientInfo;
  const scene = caseData.sceneInfo;
  const priorityWord = dispatch?.priority
    ? (String(dispatch.priority).includes('1') ? 'priority one' : String(dispatch.priority).includes('2') ? 'priority two' : 'priority three')
    : 'priority one';

  const parts: string[] = [];
  parts.push(`Control to responding unit.`);
  parts.push(`We've got a ${priorityWord} job for you.`);
  if (dispatch?.callReason) {
    parts.push(`Caller reports ${dispatch.callReason.replace(/\.$/, '')}.`);
  }
  if (dispatch?.location) {
    parts.push(`Location, ${dispatch.location.replace(/\.$/, '')}.`);
  }
  if (patient?.age && patient?.gender) {
    parts.push(`Patient is a ${patient.age}-year-old ${patient.gender}.`);
  } else if (patient?.age) {
    parts.push(`Patient is ${patient.age} years old.`);
  }
  if (scene?.description) {
    parts.push(`On arrival, ${scene.description.replace(/^On arrival[:,]?\s*/i, '').replace(/\.$/, '')}.`);
  }
  parts.push(`Acknowledge when you're on scene.`);
  return parts.join(' ');
}

function seededShuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = Math.abs(hash) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
import { allCases, getRandomCase, yearLevels, caseCategories, allConditionNames, getCasesByCondition } from '@/data/cases';
import { ensureCompleteVitals } from '@/data/treatmentEffects';
import { type Treatment, type TreatmentCategory, TREATMENTS } from '@/data/enhancedTreatmentEffects';
import {
  type PatientState,
  type DefibrillationParams,
  createInitialPatientState,
  applyDynamicTreatment,
  applyDeterioration,
} from '@/data/dynamicTreatmentEngine';
import {
  findProtocol,
  determineSeverityFromVitals,
} from '@/data/treatmentProtocols';
import { checkRuntimeContraindications } from '@/lib/runtimeContraindications';
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
  Wind, Droplets, Brain, Pill, Syringe, Search, Shuffle, Target,
  Flame, Baby, FlaskConical, ListChecks, HeartPulse, Gauge,
} from 'lucide-react';
import { toast } from 'sonner';
// AuscultationPanel removed — sounds now play inline from 3D Physical Examination
import { DebriefingResourcesPanel } from '@/components/DebriefingResourcesPanel';
import { OnboardingTour, useOnboardingTour } from '@/components/OnboardingTour';
import { NarrationButton, VoiceToggleButton } from '@/components/NarrationButton';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { VoiceCommandButton } from '@/components/VoiceCommandButton';
import type { VoiceCommand } from '@/hooks/useVoiceInput';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { MedicalControlDialog } from '@/components/MedicalControlDialog';
import { generateNarrativeReport } from '@/lib/narrativeReport';
import { generateEDOutcome } from '@/lib/edOutcome';
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
    // Strip redundant age/gender from callReason to avoid duplication with patient description
    let cleanReason = reason;
    if (age) {
      // Pattern 1: "32-year-old female difficulty breathing" or "45-year-old diabetic feeling..."
      // Strips "N-year-old" + optional gender/descriptor word
      cleanReason = cleanReason.replace(
        /^\d{1,3}[- ]?(?:year[- ]?old|yo|y\.?o\.?)\s+(?:male|female|man|woman|patient|child|boy|girl)\b[,\s-]*/i,
        ''
      );
      // Pattern 1b: "N-year-old" followed by non-gender word (e.g., "45-year-old diabetic")
      // Only strip the age part, keep the descriptor
      cleanReason = cleanReason.replace(
        /^\d{1,3}[- ]?(?:year[- ]?old|yo|y\.?o\.?)\s+/i,
        ''
      );
      // Pattern 2: "Male, 64, difficulty breathing" or "Female, 32, ..."
      cleanReason = cleanReason.replace(
        /^(?:male|female|man|woman|patient|child|boy|girl)[,\s]+\d{1,3}[,\s]+/i,
        ''
      );
      // Pattern 3: "64 male ..." or "32 female ..."
      cleanReason = cleanReason.replace(
        /^\d{1,3}[,\s]+(?:male|female|man|woman|patient|child|boy|girl)[,\s-]*/i,
        ''
      );
    }
    cleanReason = cleanReason.charAt(0).toUpperCase() + cleanReason.slice(1);
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
import { VentilatorSetupDialog, type VentilatorSettings } from '@/components/VentilatorSetupDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// ClinicalAssessmentPanel removed — replaced by inline ABCDE Primary Survey + 3D Physical Exam
import {
  type AssessmentStepId,
  type AssessmentFinding,
  type AssessmentTracker,
  createAssessmentTracker,
  performAssessment as performAssessmentStep,
  generateAssessmentDebrief,
  SPECIAL_STEPS,
  ALL_STEPS,
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
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted/50 animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-muted/40 animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-muted/30 animate-pulse" />
        </div>
        <div className="flex items-center justify-center pt-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
        </div>
      </CardContent>
    </Card>
  );
}

type StudentPhase = 'select' | 'prebriefing' | 'case' | 'vitals' | 'postcase';

interface StudentPanelProps {
  onExit: () => void;
  /**
   * If set, the panel skips the case-selection phase and runs this case
   * directly. Used by the classroom-host route so an instructor can drive
   * the exact same full case experience (LIFEPAK, 3D body, ABCDE,
   * treatments, etc.) that students see in single-player mode.
   */
  preloadedCase?: CaseScenario;
  /**
   * Optional banner rendered above the case header — typically the
   * classroom broadcast toolbar. Kept as a ReactNode slot so the panel
   * doesn't need to know anything about classroom state or Supabase.
   */
  topBanner?: React.ReactNode;
  /**
   * When set, the panel broadcasts its observable state (vitals,
   * applied treatments, completed checklist items, performed assessment
   * steps, revealed monitor vitals) whenever they change. Used by the
   * classroom host so every watching student sees the instructor's
   * actions in real time. No-op for single-player mode.
   */
  onClassroomStateChange?: (patch: {
    vitals?: Partial<Record<string, number | string>>;
    appliedTreatments?: Array<{ id: string; name: string; detail?: string; appliedAt: string }>;
    completedItems?: string[];
    assessmentPerformed?: string[];
    caseStartedAt?: string;
    monitorRevealedVitals?: string[];
    currentRhythm?: string;
    isInArrest?: boolean;
    arrestState?: {
      cprRunning?: boolean;
      shockCount?: number;
      adrenalineDoses?: number;
      amiodaroneDoses?: number;
      cycleNumber?: number;
    };
    ventilatorSettings?: {
      mode: string;
      tidalVolumeMl: number;
      respiratoryRate: number;
      fio2Percent: number;
      peepCmH2O: number;
      ieRatio: string;
    } | undefined;
    bvmVentilationRate?: number | undefined;
    arrestTimeline?: Array<{ time: number; event: string; type: string }>;
    transportDecision?: {
      priority?: string;
      position?: string;
      preAlert?: boolean;
      destination?: string;
      provisionalDiagnosis?: string;
    };
  }) => void;
  /**
   * Spectator mode — disable every interactive control. Students who are
   * watching (but not currently driving) a classroom case use this so
   * they see the full clinical interface but can't mutate it.
   */
  readOnly?: boolean;
  /**
   * When provided, the panel mirrors this state into its local state on
   * every update. Used by the classroom spectator flow so incoming
   * state_patch broadcasts flow through into the LIFEPAK monitor,
   * treatment list, assessment ticks, etc. — without the spectator ever
   * clicking anything.
   */
  externalState?: {
    vitals?: Record<string, number | string | undefined>;
    appliedTreatments?: Array<{ id: string; name: string; detail?: string; appliedAt: string }>;
    completedItems?: string[];
    assessmentPerformed?: string[];
    caseStartedAt?: string;
    monitorRevealedVitals?: string[];
    currentRhythm?: string;
    isInArrest?: boolean;
    arrestState?: {
      cprRunning?: boolean;
      shockCount?: number;
      adrenalineDoses?: number;
      amiodaroneDoses?: number;
      cycleNumber?: number;
    };
    ventilatorSettings?: {
      mode: string;
      tidalVolumeMl: number;
      respiratoryRate: number;
      fio2Percent: number;
      peepCmH2O: number;
      ieRatio: string;
    };
    bvmVentilationRate?: number;
    arrestTimeline?: Array<{ time: number; event: string; type: string }>;
    transportDecision?: {
      priority?: string;
      position?: string;
      preAlert?: boolean;
      destination?: string;
      provisionalDiagnosis?: string;
    };
  };
  /**
   * Instructor-side live override. Every commit bumps `nonce`; whenever
   * the nonce changes, the panel merges the payload into its local
   * patientState and vitals, then the existing broadcast effects carry
   * the change to every student. See InstructorLiveControls.
   */
  instructorOverride?: {
    nonce: number;
    vitals?: Partial<{
      bp: string; pulse: number; respiration: number;
      spo2: number; temperature: number; gcs: number; bloodGlucose: number;
    }>;
    currentRhythm?: string;
    isInArrest?: boolean;
    reason?: string;
  };
}

export function StudentPanel({
  onExit,
  preloadedCase,
  topBanner,
  onClassroomStateChange,
  readOnly = false,
  externalState,
  instructorOverride,
}: StudentPanelProps) {
  const { t, i18n } = useTranslation();
  // Onboarding tour for first-time users
  const { showTour, dismissTour } = useOnboardingTour();

  // Voice narration for dispatch/scene/patient info
  const { speak: speakNarration } = useVoiceNarration();

  // Medical control dialog
  const [showMedicalControl, setShowMedicalControl] = useState(false);

  // Core state
  const [phase, _setPhase] = useState<StudentPhase>('select');
  const [phaseHistory, setPhaseHistory] = useState<StudentPhase[]>([]);

  // Wrap setPhase to track history for back navigation
  const setPhase = useCallback((newPhase: StudentPhase) => {
    _setPhase(prev => {
      if (prev !== newPhase) {
        setPhaseHistory(h => [...h, prev]);
      }
      return newPhase;
    });
  }, []);

  const canGoBack = phaseHistory.length > 0 && phase !== 'select' && phase !== 'postcase';
  const goBack = useCallback(() => {
    if (phaseHistory.length === 0) return;
    const prev = phaseHistory[phaseHistory.length - 1];
    setPhaseHistory(h => h.slice(0, -1));
    _setPhase(prev);
  }, [phaseHistory]);
  const [currentCase, setCurrentCase] = useState<CaseScenario | null>(null);
  const [selectedYear, setSelectedYear] = useState<StudentYear>('3rd-year');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectionMode, setSelectionMode] = useState<'standard' | 'random-category' | 'condition'>('standard');
  const [conditionSearch, setConditionSearch] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
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
  const [showVentilatorDialog, setShowVentilatorDialog] = useState(false);
  const [ventilatorSettings, setVentilatorSettings] = useState<VentilatorSettings | null>(null);
  // BVM bag-valve-mask ventilation rate the student picked (breaths / min).
  // Separate from full mechanical ventilation because BVM is the common
  // prehospital airway intervention and deserves a lighter-weight picker.
  const [bvmVentilationRate, setBvmVentilationRate] = useState<number | null>(null);
  const [showBvmRateDialog, setShowBvmRateDialog] = useState(false);
  const [pendingBvmTreatment, setPendingBvmTreatment] = useState<Treatment | null>(null);
  // LUCAS prompt — offered ONCE when CPR has been running for ≥4 min and
  // no LUCAS has been applied yet. Tracked here so it can't re-nag.
  const [lucasPromptShown, setLucasPromptShown] = useState(false);
  // Medication safety confirmation (replaces window.confirm which auto-dismisses on re-render)
  const [pendingMedConfirm, setPendingMedConfirm] = useState<{ treatment: Treatment; allergyText: string; contraText: string } | null>(null);
  const [pendingIVTreatment, setPendingIVTreatment] = useState<Treatment | null>(null);
  const deteriorationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const medicationConfirmedRef = useRef<Set<string>>(new Set());

  // Assessment tracking
  const [assessmentTracker, setAssessmentTracker] = useState<AssessmentTracker | null>(null);
  const [activeFindings, setActiveFindings] = useState<{ stepId: AssessmentStepId; findings: AssessmentFinding[] } | null>(null);
  const [monitorRevealedVitals, setMonitorRevealedVitals] = useState<Set<string>>(new Set());

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
  // arrestConfirmed: student has explicitly confirmed the arrest (via pulse check + button)
  // arrestActive: the full arrest workflow (CPR timer, drug tracking) is running
  const [arrestConfirmed, setArrestConfirmed] = useState(false);
  const [arrestActive, setArrestActive] = useState(false);
  // Pulse check state
  const [pulseCheckInProgress, setPulseCheckInProgress] = useState(false);
  const [pulseCheckResult, setPulseCheckResult] = useState<string | null>(null);
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
  // Ref always holds latest tracker — prevents stale closure when handlePerformAssessment is called rapidly
  const assessmentTrackerRef = useRef(assessmentTracker);

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
    if (animatedVitals) {
      setCurrentVitals(animatedVitals);
    }
  }, [animatedVitals]);

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

  // Cardiac arrest activation — only when student confirms (not automatic)
  // The arrest workflow activates when arrestConfirmed is set to true (via the Confirm button)
  useEffect(() => {
    if (!patientState) return;
    if (arrestConfirmed && !arrestActive) {
      setArrestActive(true);
      setArrestStartTime(Date.now());
      setCprCycleNumber(0);
      setCprCycleTimer(120);
      setShockCount(0);
      setAdrenalineDoses(0);
      setAmiodaroneDoses(0);
      setLastAdrenalineTime(null);
      setArrestTimeline([{ time: Date.now(), event: 'Cardiac arrest confirmed by student', type: 'arrest-start' }]);
      toast.error('CARDIAC ARREST CONFIRMED', {
        description: 'Start high-quality CPR immediately. Apply defibrillator. Follow ALS algorithm.',
        duration: 10000,
      });
    } else if (!patientState.isInArrest && arrestActive) {
      // ROSC achieved
      setArrestActive(false);
      setArrestConfirmed(false);
      setCprRunning(false);
      setPulseCheckResult(null);
      if (cprTimerRef.current) clearInterval(cprTimerRef.current);
      setArrestTimeline(prev => [...prev, { time: Date.now(), event: 'ROSC achieved', type: 'rosc' }]);
      toast.success('ROSC ACHIEVED', {
        description: 'Return of spontaneous circulation. Begin post-ROSC care: maintain SpO2 94-98%, avoid hyperventilation, 12-lead ECG, temperature management.',
        duration: 15000,
      });
    }
  }, [arrestConfirmed, patientState, arrestActive]);

  // CPR 2-minute cycle countdown
  useEffect(() => {
    if (!cprRunning) {
      if (cprTimerRef.current) clearInterval(cprTimerRef.current);
      return;
    }
    cprTimerRef.current = setInterval(() => {
      setCprCycleTimer(prev => {
        if (prev <= 1) {
          // Cycle complete — prompt rhythm check; CPR continues automatically
          setCprCycleNumber(n => n + 1);
          toast.warning('2 minutes — RHYTHM CHECK', {
            description: 'Pause CPR briefly (<10 sec) to check rhythm. Rotate compressor. Shock if indicated, then resume CPR immediately.',
            duration: 8000,
          });
          setArrestTimeline(prev => [...prev, { time: Date.now(), event: `CPR Cycle complete — rhythm check`, type: 'rhythm-check' }]);
          return 120; // Reset for next cycle; CPR timer keeps running
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

  // ------------------------------------------------------------------------
  // Classroom-host: broadcast state mutations so every spectator sees live
  // what the driver is doing. These effects are gated by
  // `onClassroomStateChange` — in single-player mode they're no-ops.
  // ------------------------------------------------------------------------

  // Vitals — the most important live signal for spectators (they watch
  // the LIFEPAK change as the driver treats the patient).
  useEffect(() => {
    if (!onClassroomStateChange || !currentVitals) return;
    onClassroomStateChange({
      vitals: {
        bp: currentVitals.bp as string | undefined,
        pulse: currentVitals.pulse as number | undefined,
        respiration: currentVitals.respiration as number | undefined,
        spo2: currentVitals.spo2 as number | undefined,
        temperature: currentVitals.temperature as number | undefined,
        gcs: (currentVitals.gcs && typeof currentVitals.gcs === 'object' ? currentVitals.gcs.total : currentVitals.gcs) as number | undefined,
        bloodGlucose: currentVitals.bloodGlucose as number | undefined,
      },
    });
  }, [currentVitals, onClassroomStateChange]);

  // Applied treatments — ordered action log. Spectators see every
  // medication / intervention the driver applies.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    onClassroomStateChange({
      appliedTreatments: appliedTreatments.map(t => ({
        id: t.id,
        name: (t.description || t.name || t.id) as string,
        detail: typeof t.description === 'string' && t.description !== t.name ? t.description : undefined,
        appliedAt: typeof t.appliedAt === 'string' ? t.appliedAt : new Date(t.appliedAt).toISOString(),
      })),
    });
  }, [appliedTreatments, onClassroomStateChange]);

  // Checklist completion — spectators see critical-action ticks in real time.
  useEffect(() => {
    if (!onClassroomStateChange || !session) return;
    onClassroomStateChange({ completedItems: session.completedItems });
  }, [session?.completedItems, onClassroomStateChange, session]);

  // Primary / secondary survey steps — spectators see the assessment pattern.
  useEffect(() => {
    if (!onClassroomStateChange || !assessmentTracker) return;
    onClassroomStateChange({
      assessmentPerformed: assessmentTracker.performed.map(p => p.stepId),
    });
  }, [assessmentTracker, onClassroomStateChange]);

  // Case start time + revealed monitor vitals.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    const iso = caseStartTime ? new Date(caseStartTime).toISOString() : undefined;
    onClassroomStateChange({
      caseStartedAt: iso,
      monitorRevealedVitals: Array.from(monitorRevealedVitals),
    });
  }, [caseStartTime, monitorRevealedVitals, onClassroomStateChange]);

  // Rhythm + arrest flags — this is what makes the spectator LIFEPAK draw
  // the same waveform the instructor sees. Without it, the student's
  // monitor falls back to static case-inferred rhythm and won't update
  // through shock → ROSC / deterioration transitions.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    onClassroomStateChange({
      currentRhythm: patientState?.currentRhythm,
      isInArrest: patientState?.isInArrest,
    });
  }, [patientState?.currentRhythm, patientState?.isInArrest, onClassroomStateChange]);

  // Arrest-run state — lets students see the CPR clock, shock count,
  // adrenaline doses their instructor is tracking.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    onClassroomStateChange({
      arrestState: {
        cprRunning,
        shockCount,
        adrenalineDoses,
        amiodaroneDoses,
        cycleNumber: cprCycleNumber,
      },
    });
  }, [cprRunning, shockCount, adrenalineDoses, amiodaroneDoses, cprCycleNumber, onClassroomStateChange]);

  // Ventilator settings + BVM rate — pipe into the shared state so the
  // spectator's SpO2 tick uses the same FiO2/PEEP trajectory as the
  // driver. Previously these were driver-only, and student monitors
  // silently diverged from what the instructor was actually doing.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    onClassroomStateChange({
      ventilatorSettings: ventilatorSettings ?? undefined,
      bvmVentilationRate: bvmVentilationRate ?? undefined,
    });
  }, [ventilatorSettings, bvmVentilationRate, onClassroomStateChange]);

  // Arrest timeline — broadcast the full ordered event log so spectators
  // see the CPR / shock / drug events in the same sequence the driver
  // logged them. Append-only on the driver side; the mirror just replaces.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    if (arrestTimeline.length === 0) return;
    onClassroomStateChange({ arrestTimeline });
  }, [arrestTimeline, onClassroomStateChange]);

  // Transport decision — the priority / position / pre-alert /
  // destination / provisional-dx the driver picked. Spectators need this
  // so the transport-wizard UI shows the right state, and so the debrief
  // receipts (pre-alert given? destination chosen?) converge.
  useEffect(() => {
    if (!onClassroomStateChange) return;
    if (!transportDecisions) return;
    onClassroomStateChange({
      transportDecision: {
        priority: transportDecisions.priority,
        position: transportDecisions.position,
        preAlert: transportDecisions.preAlert,
        destination: transportDecisions.destination,
        provisionalDiagnosis: transportDecisions.provisionalDiagnosis,
      },
    });
  }, [transportDecisions, onClassroomStateChange]);

  // ------------------------------------------------------------------------
  // Classroom-spectator: mirror incoming state from the driver into local
  // state so the full UI renders the driver's live actions. This makes the
  // student's screen a live reflection of whatever the instructor's doing.
  // ------------------------------------------------------------------------
  useEffect(() => {
    if (!externalState) return;

    // Vitals — merge into current vitals so we preserve fields the driver
    // hasn't touched yet.
    if (externalState.vitals) {
      setCurrentVitals(prev => {
        const base = (prev || {}) as VitalSigns;
        const incoming = externalState.vitals as Record<string, unknown>;
        const merged: VitalSigns = { ...base };
        if (incoming.bp !== undefined) merged.bp = incoming.bp as string;
        if (incoming.pulse !== undefined) merged.pulse = incoming.pulse as number;
        if (incoming.respiration !== undefined) merged.respiration = incoming.respiration as number;
        if (incoming.spo2 !== undefined) merged.spo2 = incoming.spo2 as number;
        if (incoming.temperature !== undefined) merged.temperature = incoming.temperature as number;
        if (incoming.bloodGlucose !== undefined) merged.bloodGlucose = incoming.bloodGlucose as number;
        if (incoming.gcs !== undefined && typeof incoming.gcs === 'number') {
          merged.gcs = { total: incoming.gcs as number } as VitalSigns['gcs'];
        }
        return merged;
      });
    }

    // Applied treatments — full replace so the spectator's list stays in
    // lock-step with the driver's. Map the compact broadcast shape back
    // into the full AppliedTreatment shape the UI expects.
    if (externalState.appliedTreatments) {
      setAppliedTreatments(
        externalState.appliedTreatments.map(t => ({
          id: t.id,
          name: t.name,
          description: t.detail ?? t.name,
          appliedAt: t.appliedAt,
          effects: [],
        }) as unknown as AppliedTreatment),
      );
      setAppliedTreatmentIds(externalState.appliedTreatments.map(t => t.id));
    }

    // Revealed monitor vitals — as the driver reveals them via ABCDE
    // assessment, spectators' monitors light up too.
    if (externalState.monitorRevealedVitals) {
      setMonitorRevealedVitals(new Set(externalState.monitorRevealedVitals));
    }

    // Case start time — keeps the ticking timer in sync.
    if (externalState.caseStartedAt && !caseStartTime) {
      setCaseStartTime(new Date(externalState.caseStartedAt).getTime());
    }

    // Session.completedItems — for the student-checklist ticks.
    if (externalState.completedItems && session) {
      setSession(prev => prev ? { ...prev, completedItems: externalState.completedItems ?? prev.completedItems } : prev);
    }

    // Rhythm + arrest flags — feed them into patientState so the LIFEPAK
    // monitor's `overrideRhythm` prop picks them up, the arrest UI reflects
    // the instructor's state, and heart-sound selection can follow rhythm.
    if (externalState.currentRhythm !== undefined || externalState.isInArrest !== undefined) {
      setPatientState(prev => {
        const base = prev ?? (currentCase ? createInitialPatientState(currentCase) : null);
        if (!base) return prev;
        const next = { ...base, vitals: { ...base.vitals } };
        if (externalState.currentRhythm && next.currentRhythm !== externalState.currentRhythm) {
          next.currentRhythm = externalState.currentRhythm;
        }
        if (externalState.isInArrest !== undefined && next.isInArrest !== externalState.isInArrest) {
          next.isInArrest = externalState.isInArrest;
        }
        return next;
      });
    }

    // Arrest-run UI state (CPR clock, shock count, drug counts).
    if (externalState.arrestState) {
      const a = externalState.arrestState;
      if (a.cprRunning !== undefined) setCprRunning(a.cprRunning);
      if (a.shockCount !== undefined) setShockCount(a.shockCount);
      if (a.adrenalineDoses !== undefined) setAdrenalineDoses(a.adrenalineDoses);
      if (a.amiodaroneDoses !== undefined) setAmiodaroneDoses(a.amiodaroneDoses);
      if (a.cycleNumber !== undefined) setCprCycleNumber(a.cycleNumber);
    }

    // Ventilator settings mirrored so the spectator's SpO2 tick uses the
    // same FiO2/PEEP trajectory the instructor set. Without this, the
    // spectator's SpO2 climbs slower than the instructor's.
    if (externalState.ventilatorSettings !== undefined) {
      const v = externalState.ventilatorSettings;
      // Narrow to our local VentilatorSettings shape (mode is a union).
      setVentilatorSettings(v ? {
        mode: v.mode as VentilatorSettings['mode'],
        tidalVolumeMl: v.tidalVolumeMl,
        respiratoryRate: v.respiratoryRate,
        fio2Percent: v.fio2Percent,
        peepCmH2O: v.peepCmH2O,
        ieRatio: v.ieRatio,
      } : null);
    }
    if (externalState.bvmVentilationRate !== undefined) {
      setBvmVentilationRate(externalState.bvmVentilationRate);
    }

    // Arrest timeline mirror — wholesale replace so driver's authoritative
    // sequence wins. Skip if the incoming list is shorter than ours (a
    // stale patch arriving out of order shouldn't erase newer events).
    if (externalState.arrestTimeline) {
      setArrestTimeline(prev => (
        externalState.arrestTimeline!.length >= prev.length
          ? externalState.arrestTimeline!
          : prev
      ));
    }

    // Transport decision mirror — the wizard shape on the driver side
    // uses required strings; the broadcast shape uses optional strings.
    // Fill missing fields with '' so the shape matches and the wizard
    // renders consistently on spectators.
    if (externalState.transportDecision) {
      const td = externalState.transportDecision;
      setTransportDecisions({
        priority: td.priority ?? '',
        position: td.position ?? '',
        preAlert: td.preAlert ?? false,
        destination: td.destination ?? '',
        provisionalDiagnosis: td.provisionalDiagnosis ?? '',
      });
    }

    // assessmentPerformed mirror — students see ABCDE ticks as the
    // instructor assesses. Previously broadcast but never mirrored.
    // We use the same pure performAssessmentStep the driver uses and
    // replay any missing steps so the tracker state converges.
    if (externalState.assessmentPerformed && assessmentTracker && currentCase) {
      const incoming = externalState.assessmentPerformed;
      const already = new Set(assessmentTracker.performed.map(p => p.stepId));
      const missing = incoming.filter(id => !already.has(id));
      if (missing.length > 0) {
        let tracker = assessmentTracker;
        for (const stepId of missing) {
          const { tracker: next } = performAssessmentStep(tracker, currentCase, stepId as AssessmentStepId);
          tracker = next;
        }
        setAssessmentTracker(tracker);
      }
    }
  }, [externalState, caseStartTime, session, currentCase, assessmentTracker]);

  // ---------------- Instructor live override ------------------------------
  // When the instructor pushes a change via InstructorLiveControls, the
  // parent bumps `instructorOverride.nonce`. Merge the payload into local
  // patientState + currentVitals. The existing broadcast effects on
  // patientState.currentRhythm / isInArrest / currentVitals will then
  // propagate the change to every watching student.
  const lastOverrideNonceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!instructorOverride) return;
    if (lastOverrideNonceRef.current === instructorOverride.nonce) return;
    lastOverrideNonceRef.current = instructorOverride.nonce;

    // Apply vital overrides directly to the animated display state and the
    // underlying patientState so the engine agrees with the monitor.
    if (instructorOverride.vitals) {
      setCurrentVitals(prev => {
        const base = (prev || {}) as VitalSigns;
        const v = instructorOverride.vitals ?? {};
        const merged: VitalSigns = { ...base };
        if (v.bp !== undefined) merged.bp = v.bp;
        if (v.pulse !== undefined) merged.pulse = v.pulse;
        if (v.respiration !== undefined) merged.respiration = v.respiration;
        if (v.spo2 !== undefined) merged.spo2 = v.spo2;
        if (v.temperature !== undefined) merged.temperature = v.temperature;
        if (v.bloodGlucose !== undefined) merged.bloodGlucose = v.bloodGlucose;
        if (v.gcs !== undefined) merged.gcs = { total: v.gcs } as VitalSigns['gcs'];
        return merged;
      });
    }

    if (instructorOverride.vitals || instructorOverride.currentRhythm !== undefined || instructorOverride.isInArrest !== undefined) {
      setPatientState(prev => {
        const base = prev ?? (currentCase ? createInitialPatientState(currentCase) : null);
        if (!base) return prev;
        const next = { ...base, vitals: { ...base.vitals } };
        if (instructorOverride.vitals) {
          Object.assign(next.vitals, instructorOverride.vitals);
        }
        if (instructorOverride.currentRhythm) next.currentRhythm = instructorOverride.currentRhythm;
        if (instructorOverride.isInArrest !== undefined) next.isInArrest = instructorOverride.isInArrest;
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorOverride?.nonce]);

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

  // Filtered conditions list for search dropdown
  // Prioritise conditions that actually have cases for the selected year —
  // otherwise 1st-year students see a mostly-disabled alphabetical list.
  const filteredConditions = useMemo(() => {
    const q = conditionSearch.trim().toLowerCase();
    const pool = q
      ? allConditionNames.filter(c => c.toLowerCase().includes(q))
      : allConditionNames;
    const withCases = pool.filter(c => getCasesByCondition(c, selectedYear).length > 0);
    const withoutCases = pool.filter(c => getCasesByCondition(c, selectedYear).length === 0);
    return [...withCases, ...withoutCases].slice(0, 30);
  }, [conditionSearch, selectedYear]);

  // Shared case initialization helper
  const initializeCase = useCallback((newCase: CaseScenario, conditionMode: boolean, condition?: string) => {
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
    // Reset all cardiac arrest state for fresh case
    setArrestConfirmed(false);
    setArrestActive(false);
    setPulseCheckInProgress(false);
    setPulseCheckResult(null);
    setCprCycleTimer(120);
    setCprCycleNumber(0);
    setCprRunning(false);
    setShockCount(0);
    setLastAdrenalineTime(null);
    setAdrenalineDoses(0);
    setAmiodaroneDoses(0);
    setArrestStartTime(null);
    setArrestTimeline([]);

    const initialPatientState = createInitialPatientState(newCase);
    setPatientState(initialPatientState);

    const initialTracker = createAssessmentTracker(newCase, selectedYear);
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
      isConditionSelected: conditionMode,
      selectedCondition: condition,
    };
    setSession(newSession);
    setPhase('prebriefing');
  }, [selectedYear]);

  // Classroom-host: when a preloaded case is passed in (e.g. the instructor
  // just picked a case in the classroom lobby), bootstrap it directly and
  // skip the select/prebriefing phases so the instructor lands in the live
  // case view with LIFEPAK, 3D body, and all management functions.
  const preloadInitializedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!preloadedCase) return;
    if (preloadInitializedRef.current === preloadedCase.id) return;
    preloadInitializedRef.current = preloadedCase.id;
    initializeCase(preloadedCase, false);
  }, [preloadedCase, initializeCase]);

  // Once the case is bootstrapped (phase landed on 'prebriefing' from
  // initializeCase), advance automatically into the live case phase so
  // the instructor's view is the full running-case UI with LIFEPAK,
  // 3D body, ABCDE, and treatments. The live phase is named 'vitals'
  // in the student flow (phase 'case' is a separate case-details
  // reference tab accessible during the live case). Also start the
  // case timer so the case clock begins immediately. Separate effect
  // from the initialize call above so the React cleanup/re-run dance
  // doesn't cancel this state transition.
  useEffect(() => {
    if (!preloadedCase) return;
    if (!currentCase || currentCase.id !== preloadedCase.id) return;
    if (phase === 'prebriefing') {
      if (caseStartTime == null) setCaseStartTime(Date.now());
      setPhase('vitals');
    }
  }, [preloadedCase, currentCase, phase, setPhase, caseStartTime]);

  // Generate case — standard mode
  const generateCase = useCallback(async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
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

    initializeCase(newCase, false);
    setIsGenerating(false);
    toast.success(`Case generated: ${getStudentCaseTitle(newCase)}`);
    } catch (err) {
      console.error('Case generation error:', err);
      setIsGenerating(false);
      toast.error('Failed to generate case', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred. Try a different category.',
      });
    }
  }, [selectedYear, selectedCategory, initializeCase]);

  // Generate case — random by category mode
  const generateCaseByCategory = useCallback(async (category: string) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const newCase = getRandomCase({ yearLevel: selectedYear, category });
      if (!newCase) {
        setIsGenerating(false);
        toast.error('No cases available', {
          description: `No ${category} cases are available for ${selectedYear} level.`,
        });
        return;
      }

      initializeCase(newCase, false);
      setIsGenerating(false);
      toast.success(`Random ${category} case: ${getStudentCaseTitle(newCase)}`);
    } catch (err) {
      console.error('Case generation error:', err);
      setIsGenerating(false);
      toast.error('Failed to generate case');
    }
  }, [selectedYear, initializeCase]);

  // Generate case — practice specific condition mode
  const generateCaseByCondition = useCallback(async (condition: string) => {
    setIsGenerating(true);
    setSelectedCondition(condition);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const matchingCases = getCasesByCondition(condition, selectedYear);
      if (matchingCases.length === 0) {
        setIsGenerating(false);
        toast.error('No cases available', {
          description: `No cases featuring "${condition}" are available for ${selectedYear} level.`,
        });
        return;
      }

      const newCase = matchingCases[Math.floor(Math.random() * matchingCases.length)];
      initializeCase(newCase, true, condition);
      setIsGenerating(false);
      toast.success(`Condition practice: ${getStudentCaseTitle(newCase)}`);
    } catch (err) {
      console.error('Case generation error:', err);
      setIsGenerating(false);
      toast.error('Failed to generate case');
    }
  }, [selectedYear, initializeCase]);

  // Start case (from pre-briefing)
  const startCase = useCallback(() => {
    if (readOnly) return;
    setCaseStartTime(Date.now());
    lastActivityRef.current = Date.now();
    setPhase('vitals');
    toast.success('Case started — begin your assessment', { duration: 3000 });

    // Auto-narrate the dispatch info and scene in a dispatcher voice
    if (currentCase) {
      const fullText = buildDispatchNarration(currentCase);
      // Small delay so the UI settles first
      setTimeout(() => speakNarration(fullText, { role: 'dispatcher' }), 500);
    }

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

  // LUCAS device nudge — if CPR has been running for ≥4 minutes and no
  // mechanical CPR device has been applied yet, offer one via a single,
  // dismissible toast. Deliberately low-friction: no blocking dialog,
  // no repeat nagging — the student can ignore it and keep compressing.
  useEffect(() => {
    if (!cprRunning || lucasPromptShown) return;
    if (appliedTreatmentIds.includes('lucas_device')) return;
    const id = window.setTimeout(() => {
      setLucasPromptShown(true);
      toast('Consider LUCAS mechanical CPR?', {
        description: 'CPR has been running for 4 minutes. A LUCAS device can maintain high-quality compressions and free a team member.',
        duration: 10000,
        action: {
          label: 'Apply LUCAS',
          onClick: () => {
            const lucas = TREATMENTS.find(t => t.id === 'lucas_device');
            if (lucas) applyTreatment(lucas);
          },
        },
      });
    }, 4 * 60 * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cprRunning, lucasPromptShown, appliedTreatmentIds]);

  // Continuous-effect tick — simulates ongoing physiology from active
  // treatments so vitals keep responding between one-shot `applyTreatment`
  // calls. Previously the engine applied a single vital bump on treatment
  // apply and then nothing: if the student hit BVM once on an apnoeic
  // patient, SpO2 never climbed over time, and after ROSC the RR / SpO2
  // would sit frozen. This closes that loop every 5 s.
  //
  // Rules (minimal and explainable):
  //  - If oxygen (NRB / nasal / BVM / ventilator) was applied AND SpO2 < 96
  //    → SpO2 climbs toward 96-98 by 2/tick (slower over 92).
  //  - If CPR is running AND patient is in arrest → maintain pseudo-pulse
  //    between 50-65 (compression-generated perfusion). Engine's ROSC path
  //    remains the ONLY way to clear `isInArrest`.
  //  - If RR is 0 (apnoeic) AND BVM/vent is active AND ventilationRate is
  //    set → show that assisted rate on the monitor so the student can see
  //    they're ventilating at X/min rather than a flat 0.
  //  - Otherwise no-op. Deterioration timer (30 s) continues to run and
  //    wins if both fire — so a student walking away still sees decline.
  useEffect(() => {
    if (phase !== 'vitals' || readOnly) return;
    const id = window.setInterval(() => {
      setPatientState(prev => {
        if (!prev) return prev;
        const v = { ...prev.vitals };
        let changed = false;
        let roscTriggered = false;

        // Match the ACTUAL oxygen/ventilation treatment IDs defined in
        // enhancedTreatmentEffects.ts — earlier revisions of this block
        // checked `oxygen_nrb` / `oxygen_15l` which don't exist, so the
        // SpO2 tick never fired when a student applied NRB or CPAP. That
        // was the "patient at 89% stays 89% no matter what I do" bug.
        const hasO2 =
          appliedTreatmentIds.includes('oxygen_nonrebreather') ||
          appliedTreatmentIds.includes('oxygen_mask') ||
          appliedTreatmentIds.includes('oxygen_nasal') ||
          appliedTreatmentIds.includes('cpap_niv') ||
          appliedTreatmentIds.includes('bvm_ventilation') ||
          appliedTreatmentIds.includes('mechanical_ventilation') ||
          (appliedTreatmentIds.includes('ventilator_setup') && !!ventilatorSettings);
        // CPAP/NIV physiologically reverses hypoxia faster than passive
        // O2 because it recruits alveoli — bump the per-tick step.
        const hasCpap = appliedTreatmentIds.includes('cpap_niv');

        // SpO2 recovery toward target while O2 therapy is active. CPAP
        // climbs faster than simple O2 because it recruits collapsed
        // alveoli (cardiogenic pulm oedema, severe asthma, etc.).
        // Mechanical ventilation scales further with FiO2 + PEEP: 100%
        // FiO2 + 10 PEEP is a very different patient from 40% + 5.
        if (hasO2 && (v.spo2 ?? 0) < 96) {
          let step = (v.spo2 ?? 70) < 92 ? 3 : 2;
          if (hasCpap) step += 2;
          // Mechanical ventilator bonus — scales with FiO2 and PEEP.
          if (ventilatorSettings) {
            const fio2Bonus = Math.max(0, (ventilatorSettings.fio2Percent - 40) / 30); // 0 at 40%, 2 at 100%
            const peepBonus = Math.max(0, (ventilatorSettings.peepCmH2O - 5) / 5);     // 0 at 5, 3 at 20
            step += Math.round(fio2Bonus + peepBonus);
          }
          v.spo2 = Math.min(98, (v.spo2 ?? 70) + step);
          changed = true;
        }

        // Ventilator side-effects — high PEEP + high tidal volume can
        // drop BP via increased intrathoracic pressure (preload
        // reduction). Start to manifest > 10 min of vent if settings
        // are aggressive.
        if (ventilatorSettings && ventilatorSettings.peepCmH2O >= 12) {
          const bpStr = String(v.bp ?? '120/80');
          const [sys, dia] = bpStr.split('/').map(x => parseInt(x, 10));
          if (!isNaN(sys) && sys > 90) {
            const newSys = Math.max(85, sys - 2);
            v.bp = `${newSys}/${Math.max(55, (dia || 80) - 1)}`;
            changed = true;
          }
        }

        // CPR compression-generated pulse while CPR is running in arrest.
        if (cprRunning && prev.isInArrest) {
          if ((v.pulse ?? 0) < 50) { v.pulse = 55; changed = true; }
          // BP during good CPR typically peaks ~60-70 systolic.
          if (!v.bp || v.bp === '0/0' || v.bp === '--/--') {
            v.bp = '60/40';
            changed = true;
          }
        }

        // Assisted ventilation rate — surface the student-set rate on the
        // monitor when the patient is apnoeic and being ventilated.
        const ventRate =
          ventilatorSettings?.respiratoryRate ??
          bvmVentilationRate;
        if ((v.respiration ?? 0) === 0 && hasO2 && ventRate && ventRate > 0) {
          v.respiration = ventRate;
          changed = true;
        }

        // ---- CONTINUOUS ROSC EVALUATOR (non-shockable rhythms) ----
        // Real ACLS doesn't require the student to press "apply adrenaline"
        // for ROSC to happen — if they're running high-quality CPR,
        // ventilating properly, AND the pharmacologic picture the
        // guidelines actually call for, the rhythm can convert at any
        // time. Previously ROSC was locked to the moment the engine saw
        // applyTreatment('adrenaline_1mg'), which felt unresponsive.
        //
        // Two parallel pathways based on core temperature, matching
        // ERC 2021 / JRCALC / AHA hypothermic-arrest guidance:
        //
        //  • Normothermic (temp ≥ 30°C) — requires at least one
        //    adrenaline dose. Standard ACLS.
        //
        //  • Severe hypothermia (temp < 30°C) — adrenaline is
        //    CONTRAINDICATED (impaired metabolism, toxic accumulation
        //    on rewarming). Requires active rewarming intervention
        //    instead. Drugs would never be given here, so we must
        //    recognise the hypothermic resuscitation as complete when
        //    rewarming + CPR + ventilation are in flight.
        //
        // Per-tick probability is modest (~6% every 5s = ~50% by 1 min,
        // ~90% by 3 min in normothermic; slower in hypothermic because
        // rewarming takes longer to physiologically reverse the arrest).
        const isNonShockable =
          prev.currentRhythm === 'Asystole' || prev.currentRhythm === 'PEA';
        const arrestDurationMs = caseStartTime ? Date.now() - caseStartTime : 0;
        const coreTemp = prev.vitals.temperature ?? 37;
        const isSevereHypothermia = coreTemp < 30;
        const hasRewarming = appliedTreatmentIds.some(id =>
          /warm|blanket|hypotherm/i.test(id),
        );

        // Normothermic ACLS — needs adrenaline.
        const canRoscNormothermic =
          !isSevereHypothermia &&
          adrenalineDoses >= 1;

        // Hypothermic ACLS — needs active rewarming, NOT adrenaline.
        // Guideline basis: ERC 2021 §5.3 (Hypothermic cardiac arrest) —
        // withhold IV drugs <30°C, focus on CPR + active rewarming.
        const canRoscHypothermic =
          isSevereHypothermia &&
          hasRewarming;

        const canRoscTick =
          prev.isInArrest &&
          isNonShockable &&
          cprRunning &&
          hasO2 &&
          arrestDurationMs > 90_000 &&
          (canRoscNormothermic || canRoscHypothermic);

        if (canRoscTick) {
          // Normothermic: base 6% + 4% per extra adrenaline dose (cap 25%).
          // Hypothermic: base 3% — slower because rewarming needs time to
          // physiologically reverse drug-refractory cold myocardium.
          const perTickChance = canRoscHypothermic
            ? 0.03
            : Math.min(0.25, 0.06 + Math.max(0, adrenalineDoses - 1) * 0.04);

          if (Math.random() < perTickChance) {
            // ROSC — restore a modest post-arrest rhythm. Hypothermic
            // patients typically come back with a lower HR initially
            // (cold sinus rather than sinus tachy).
            if (canRoscHypothermic) {
              v.pulse = 60 + Math.floor(Math.random() * 15); // 60-75
              v.bp = '95/60';
              v.spo2 = Math.max(v.spo2 ?? 85, 88);
              v.respiration = ventRate || 8;
              // Small rewarming bump on conversion so the patient is above
              // the drug-withholding threshold for post-ROSC care.
              v.temperature = Math.max(v.temperature ?? 28, 30.5);
            } else {
              v.pulse = 95 + Math.floor(Math.random() * 15); // 95-110
              v.bp = '95/60';
              v.spo2 = Math.max(v.spo2 ?? 85, 90);
              v.respiration = ventRate || 10;
            }
            roscTriggered = true;
            changed = true;
          }
        }

        if (!changed) return prev;
        setCurrentVitals(ensureCompleteVitals(v));
        const next = { ...prev, vitals: v };
        if (roscTriggered) {
          next.isInArrest = false;
          // Hypothermic comes back with cold sinus (lower rate); normo
          // comes back with sinus tachy. Matches the physiology of the
          // respective conversions.
          next.currentRhythm = isSevereHypothermia ? 'Normal Sinus Rhythm' : 'Sinus Tachycardia';
          next.deteriorationLevel = 2;
          toast.success('ROSC — Return of Spontaneous Circulation', {
            description: isSevereHypothermia
              ? 'Sinus rhythm restored with rewarming. Continue active rewarming to 32–36 °C, titrate O2 94–98%, 12-lead ECG, handle gently (arrhythmia risk).'
              : 'Sinus tachycardia restored. Begin post-ROSC care: 12-lead ECG, titrate O2 to 94–98%, targeted temperature management.',
            duration: 12000,
          });
        }
        return next;
      });
    }, 5000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, readOnly, appliedTreatmentIds, cprRunning, ventilatorSettings, bvmVentilationRate, adrenalineDoses, caseStartTime]);

  // Apply treatment — uses dynamic treatment engine
  const applyTreatment = useCallback((treatment: Treatment, defibParams?: DefibrillationParams) => {
    if (readOnly) {
      toast.info('You are watching — the driver is treating this case.', { duration: 1800 });
      return;
    }
    if (!currentVitals || !currentCase || !patientState) return;
    lastActivityRef.current = Date.now();
    setHintVisible(false);

    // Defibrillation requires energy/mode selection
    if (treatment.id === 'defibrillation' && !defibParams) {
      setPendingDefibTreatment(treatment);
      setShowDefibDialog(true);
      return;
    }

    // Mechanical ventilation requires an RSI / secured airway first.
    // You can't put a conscious, un-paralysed patient on a ventilator —
    // they'll fight it, desaturate, and aspirate. Gate the dialog on
    // proof of RSI (rsi_intubation treatment) or at minimum a secured
    // airway. GCS <= 3 (unresponsive) is an alternative clinical path
    // (e.g. in-arrest already intubated) — allow that too.
    if (treatment.id === 'mechanical_ventilation' && !ventilatorSettings) {
      const hasRsi = appliedTreatmentIds.includes('rsi_intubation');
      const hasIntubation = appliedTreatmentIds.includes('intubation') || appliedTreatmentIds.includes('endotracheal_intubation');
      const gcsTotal = (patientState?.vitals?.gcs as number | undefined)
        ?? (currentCase?.vitalSignsProgression?.initial?.gcs as number | undefined)
        ?? 15;
      const profoundlyUnresponsive = gcsTotal <= 3;
      if (!hasRsi && !hasIntubation && !profoundlyUnresponsive) {
        toast.error('RSI required first', {
          description: 'A mechanical ventilator can only be started once the airway is secured. Perform RSI (rapid sequence intubation) or confirm ETT placement first.',
          duration: 6000,
        });
        return;
      }
      setShowVentilatorDialog(true);
      return;
    }

    // BVM needs a ventilation rate — light-weight prompt (10/12/20) so the
    // student picks an age-appropriate cadence. Once set, the monitor
    // surfaces the assisted RR to make the intervention visible.
    if (treatment.id === 'bvm_ventilation' && bvmVentilationRate === null) {
      setPendingBvmTreatment(treatment);
      setShowBvmRateDialog(true);
      return;
    }

    // IV prerequisite check — student must establish IV access before giving IV drugs/fluids
    if (treatment.requiresIVAccess && !appliedTreatmentIds.includes('iv_access')) {
      setPendingIVTreatment(treatment);
      return;
    }

    // Runtime contraindication checker — evaluates the drug against the
    // CURRENT vitals/rhythm/findings, not just the static list. Blocks
    // hard contras (GTN in SBP<90, beta-blocker in CHB, aspirin in ICH)
    // and folds soft warnings into the med-confirm dialog so the
    // student sees the concrete reason, not a generic string.
    const runtimeContras = checkRuntimeContraindications(treatment, {
      bp: String(currentVitals?.bp ?? ''),
      pulse: typeof currentVitals?.pulse === 'number' ? currentVitals.pulse : undefined,
      spo2: typeof currentVitals?.spo2 === 'number' ? currentVitals.spo2 : undefined,
      respiration: typeof currentVitals?.respiration === 'number' ? currentVitals.respiration : undefined,
      temperature: typeof currentVitals?.temperature === 'number' ? currentVitals.temperature : undefined,
      gcs: typeof currentVitals?.gcs === 'number' ? currentVitals.gcs : undefined,
      currentRhythm: patientState?.currentRhythm,
      isInArrest: patientState?.isInArrest,
      findings: [
        ...(currentCase.abcde?.circulation?.findings ?? []),
        ...(currentCase.expectedFindings?.keyObservations ?? []),
        ...(currentCase.expectedFindings?.differentialDiagnoses ?? []),
        currentCase.expectedFindings?.mostLikelyDiagnosis ?? '',
        currentCase.title ?? '',
      ],
      caseSubcategory: currentCase.subcategory,
    });
    // Hard blocks: refuse + surface the reason. No override here — the
    // blocked list is deliberately short (only the most dangerous combos).
    const hardBlocks = runtimeContras.filter(c => c.severity === 'block');
    if (hardBlocks.length > 0 && !medicationConfirmedRef.current.has(treatment.id)) {
      const primary = hardBlocks[0];
      toast.error(`Blocked: ${treatment.name}`, {
        description: primary.alternative
          ? `${primary.reason}\n\nAlternative: ${primary.alternative}`
          : primary.reason,
        duration: 10000,
      });
      return;
    }

    // Medication safety check — show React dialog (window.confirm auto-dismisses on re-render)
    if (treatment.category === 'medication' && !medicationConfirmedRef.current.has(treatment.id)) {
      const allergies = currentCase.history?.allergies || [];
      const allergyText = allergies.length > 0 && allergies[0] !== 'NKDA' && !allergies[0]?.toLowerCase().includes('no known')
        ? `Patient allergies: ${allergies.map(a => typeof a === 'string' ? a : a.name || a).join(', ')}`
        : 'No known drug allergies (NKDA)';
      // Concrete contraindication lines (smart) take priority over the
      // static list on the treatment.
      const smartContraLines = runtimeContras.map(c =>
        c.alternative ? `${c.reason} — ${c.alternative}` : c.reason,
      );
      const contraText = smartContraLines.length > 0
        ? `Contraindications flagged: ${smartContraLines.slice(0, 3).join(' | ')}`
        : treatment.contraindications?.length
          ? `Contraindications: ${treatment.contraindications.slice(0, 3).join('; ')}`
          : '';
      setPendingMedConfirm({ treatment, allergyText, contraText });
      return; // Wait for dialog confirmation
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

    // Show appropriate toast — strip vital change numbers from student view
    // Student should monitor the patient to observe effects, not be told the numbers
    const studentDesc = (response.description || '')
      .replace(/\s*[—–-]+\s*(?:[A-Za-z][A-Za-z\d /]*:\s*[\d./%]+\s*(?:→|->)\s*[\d./%]+(?:\s*,\s*)?)+\.?/g, '.')
      .replace(/\s*(?:HR|SpO2|BP|RR|GCS|Temp|EtCO2|BGL):\s*[\d./%]+\s*(?:→|->)\s*[\d./%]+\.?/gi, '')
      .replace(/\d+\s*vitals?\s*improving\.?\s*(?:Consider\s*repeat\s*dose\.?)?/g, '')
      .replace(/\.{2,}/g, '.').replace(/\.\s*$/, '').trim();

    if (response.criticalEvent) {
      toast.error(response.criticalEvent.description, {
        description: response.warningMessage,
        duration: 8000,
      });
    } else if (response.warningMessage) {
      toast.warning(`${treatment.name} applied`, {
        description: 'Monitor the patient to assess response.',
        duration: 5000,
      });
    } else if (response.isPartialResponse) {
      toast.info(`${treatment.name} applied`, {
        description: 'Monitor the patient — reassess vitals to evaluate response.',
        duration: 4000,
      });
    } else {
      toast.success(`Applied: ${treatment.name}`, {
        description: studentDesc.includes('applied') ? 'Treatment applied. Monitor the patient.' : studentDesc || 'Treatment applied. Monitor the patient.',
        duration: 3000,
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

  // Keep ref in sync with state so rapid calls always read the latest tracker
  useEffect(() => { assessmentTrackerRef.current = assessmentTracker; }, [assessmentTracker]);

  // Handle assessment step
  const handlePerformAssessment = useCallback((stepId: AssessmentStepId) => {
    if (readOnly) {
      toast.info('You are watching — the driver is running this case.', { duration: 1800 });
      return;
    }
    if (!assessmentTrackerRef.current || !currentCase || !caseStartTime) return;
    lastActivityRef.current = Date.now();
    setHintVisible(false);

    const { tracker: updatedTracker, findings } = performAssessmentStep(
      assessmentTrackerRef.current,
      stepId,
      currentCase,
      caseStartTime,
    );

    // Update ref immediately so back-to-back calls read the right state
    assessmentTrackerRef.current = updatedTracker;
    setAssessmentTracker(updatedTracker);
    setActiveFindings({ stepId, findings });

    // Reveal vitals on the LIFEPAK monitor when ABCDE assessment exposes them
    if (currentCase) {
      const toReveal = new Set<string>();
      // Extra assessment step credit: ABCDE D/E expose BGL and TEMP, which blocks the
      // LIFEPAK assess buttons — award the scoring step credit automatically here instead.
      const extraSteps: AssessmentStepId[] = [];
      if (stepId === 'disability') {
        if (currentCase.abcde?.disability?.gcs) toReveal.add('gcs');
        if (currentCase.abcde?.disability?.bloodGlucose != null) {
          toReveal.add('bloodGlucose');
          extraSteps.push('blood-glucose');
        }
      }
      if (stepId === 'exposure') {
        if (currentCase.abcde?.exposure?.temperature != null) {
          toReveal.add('temperature');
          extraSteps.push('temperature');
        }
      }
      if (stepId === 'pain-assessment' && !monitorRevealedVitals.has('painScore')) {
        toReveal.add('painScore');
      }
      // Award credit for co-assessed steps (BGL, TEMP) found via ABCDE
      for (const extra of extraSteps) {
        if (!assessmentTrackerRef.current?.performed.some(p => p.stepId === extra)) {
          const { tracker: extraTracker } = performAssessmentStep(
            assessmentTrackerRef.current!,
            extra,
            currentCase,
            caseStartTime,
          );
          assessmentTrackerRef.current = extraTracker;
          setAssessmentTracker(extraTracker);
        }
      }
      if (toReveal.size > 0) {
        setMonitorRevealedVitals(prev => {
          const next = new Set(prev);
          toReveal.forEach(v => next.add(v));
          return next;
        });
      }
    }

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
  }, [currentCase, caseStartTime]); // assessmentTracker read via ref — always current

  // --------------------------------------------------------------------------
  // Hands-free voice commands
  // --------------------------------------------------------------------------
  // Maps spoken phrases to assessment step IDs so a student can run through
  // ABCDE + secondary survey without touching the screen. Aliases cover the
  // common rephrasings paramedic students actually use in-scenario, plus the
  // misrecognitions browsers produce for clinical words.
  const voiceCommands: VoiceCommand[] = useMemo(() => [
    { id: 'scene-safety', label: 'scene safety', aliases: ['check the scene', 'scene safe', 'assess scene', 'bsi', 'ppe'] },
    { id: 'airway', label: 'check airway', aliases: ['assess airway', 'open airway', 'airway', 'a'] },
    { id: 'breathing', label: 'check breathing', aliases: ['assess breathing', 'breathing', 'listen to chest', 'auscultate chest', 'b'] },
    { id: 'circulation', label: 'check circulation', aliases: ['assess circulation', 'pulse', 'capillary refill', 'circulation', 'c'] },
    { id: 'disability', label: 'check disability', aliases: ['neuro assessment', 'gcs', 'assess neuro', 'pupils', 'avpu', 'd'] },
    { id: 'exposure', label: 'expose patient', aliases: ['exposure', 'head to toe', 'e'] },
    { id: 'head', label: 'examine head', aliases: ['check head', 'head assessment', 'head', 'face', 'scalp'] },
    { id: 'neck-cspine', label: 'examine neck', aliases: ['check neck', 'cspine', 'c spine', 'cervical spine'] },
    { id: 'chest', label: 'examine chest', aliases: ['check chest', 'palpate chest', 'chest'] },
    { id: 'abdomen', label: 'examine abdomen', aliases: ['check abdomen', 'palpate abdomen', 'belly', 'tummy'] },
    { id: 'pelvis', label: 'examine pelvis', aliases: ['check pelvis', 'pelvis'] },
    { id: 'extremities', label: 'examine extremities', aliases: ['check limbs', 'limbs', 'arms and legs'] },
    { id: 'posterior-logroll', label: 'log roll', aliases: ['log-roll', 'check back', 'examine posterior'] },
    { id: 'blood-glucose', label: 'check glucose', aliases: ['blood sugar', 'bm', 'bgl', 'sugar'] },
    { id: 'temperature', label: 'check temperature', aliases: ['temp', 'take temperature'] },
    { id: 'pain-assessment', label: 'pain assessment', aliases: ['assess pain', 'pain score', 'ask about pain', 'pqrst', 'ocqrsta'] },
    { id: 'sample-history', label: 'sample history', aliases: ['take history', 'history', 'sample'] },
    { id: 'allergies', label: 'ask allergies', aliases: ['allergy', 'any allergies'] },
    { id: 'medications', label: 'ask medications', aliases: ['current medications', 'medication list', 'meds'] },
  ], []);

  const handleVoiceCommand = useCallback((match: { command: VoiceCommand; score: number; rawTranscript: string }) => {
    // The command id is a canonical assessment step id — cast once.
    const stepId = match.command.id as AssessmentStepId;
    // Light feedback so the user sees the recognised intent.
    toast.success(`🎙 ${match.command.label}`, {
      description: match.rawTranscript,
      duration: 2400,
    });
    // Run the same code path as tapping the button.
    if (currentCase && caseStartTime && assessmentTrackerRef.current) {
      handlePerformAssessment(stepId);
    }
  }, [currentCase, caseStartTime, handlePerformAssessment]);

  // Sync assessmentTracker.performed step IDs into session.completedItems
  // so that checklist-based scoring (12-lead ECG, pain assessment, etc.) works
  // during gameplay — not only on PDF export.
  useEffect(() => {
    if (!assessmentTracker || !session) return;
    const performedStepIds = assessmentTracker.performed.map(p => p.stepId);
    // Only update if there are new items not yet in completedItems
    const newItems = performedStepIds.filter(id => !session.completedItems.includes(id));
    if (newItems.length > 0) {
      setSession(prev => prev ? {
        ...prev,
        completedItems: [...new Set([...prev.completedItems, ...performedStepIds])],
      } : prev);
    }
  }, [assessmentTracker, session]);

  // Bridge: keyword-match student actions to loose-text checklist items.
  //
  // The `studentChecklist` is free-text (e.g. "Pre-alert stroke center",
  // "Establish exact time last known well") whereas the assessment tracker
  // only knows discrete step IDs (`airway`, `circulation`, `sample-history`).
  // Without a bridge, several checklist items can NEVER be credited:
  //   - "Pre-alert …" → captured by transportDecisions.preAlert=true
  //   - "Last known well / time of onset" → captured by sample-history / events-leading
  //   - "Do NOT give food or drink" → there's no discrete step; infer from
  //     the fact that the student reached transport without performing it
  //     (pragmatic — credit if case is transported).
  // This effect walks the checklist whenever one of those signals changes
  // and adds matching item IDs to completedItems. Also auto-credits items
  // whose description is satisfied by assessment steps already performed.
  useEffect(() => {
    if (!currentCase || !session) return;
    const checklist = currentCase.studentChecklist || [];
    if (checklist.length === 0) return;
    const already = new Set(session.completedItems);
    const performed = new Set(assessmentTracker?.performed?.map(p => p.stepId) || []);
    const toCredit: string[] = [];

    // Pre-alert — any checklist item mentioning "pre-alert" / "pre alert" /
    // "alert hospital" / "alert receiving" credits if the student chose to
    // pre-alert during transport decisions.
    if (transportDecisions?.preAlert === true) {
      for (const item of checklist) {
        if (already.has(item.id)) continue;
        if (/pre[- ]?alert|alert (the )?(hospital|receiving|stroke|cardiac|trauma)/i.test(item.description)) {
          toCredit.push(item.id);
        }
      }
    }

    // Last known well / time of onset — credited by doing sample-history or
    // events-leading assessment. Those steps already pull the "events" field
    // which in every stroke / seizure / ACS case contains the time reference.
    if (performed.has('sample-history') || performed.has('events-leading') || performed.has('opqrst')) {
      for (const item of checklist) {
        if (already.has(item.id)) continue;
        if (/last known well|time of onset|onset time|time last seen|exact time/i.test(item.description)) {
          toCredit.push(item.id);
        }
      }
    }

    // Destination choice — any checklist item about choosing a stroke /
    // cardiac / trauma centre.
    if (transportDecisions?.destination) {
      for (const item of checklist) {
        if (already.has(item.id)) continue;
        if (/transport to.*(centre|center|unit|hospital)|bypass.*hospital|destination|specialist centre/i.test(item.description)) {
          toCredit.push(item.id);
        }
      }
    }

    // Provisional diagnosis — credit documentation items that reference a
    // working dx / ATMIST.
    if (transportDecisions?.provisionalDiagnosis) {
      for (const item of checklist) {
        if (already.has(item.id)) continue;
        if (/provisional|working diagnosis|atmist|handover/i.test(item.description)) {
          toCredit.push(item.id);
        }
      }
    }

    // Assessment-step-backed credits: e.g. "Perform FAST assessment" is
    // satisfied by doing disability/face steps. "Check blood glucose" is
    // satisfied by the blood-glucose step.
    const stepCreditMap: Array<{ pattern: RegExp; steps: string[] }> = [
      { pattern: /fast assessment|fast positive/i, steps: ['disability', 'face', 'head'] },
      { pattern: /blood glucose|bgl|bm\b/i, steps: ['blood-glucose', 'disability'] },
      { pattern: /iv access|establish iv/i, steps: ['iv-access'] },
      { pattern: /gcs|glasgow/i, steps: ['disability'] },
      { pattern: /pupils?/i, steps: ['disability'] },
      { pattern: /temperature|temp check/i, steps: ['temperature', 'exposure'] },
      { pattern: /pain (score|assessment)|ocqrsta|pqrst/i, steps: ['pain-assessment', 'opqrst'] },
      { pattern: /allerg/i, steps: ['allergies', 'sample-history'] },
      { pattern: /medicat/i, steps: ['medications', 'sample-history'] },
      { pattern: /sample history/i, steps: ['sample-history'] },
      { pattern: /document.*gcs|document.*neuro/i, steps: ['disability', 'neurological'] },
    ];
    for (const item of checklist) {
      if (already.has(item.id)) continue;
      for (const { pattern, steps } of stepCreditMap) {
        if (pattern.test(item.description) && steps.some(s => performed.has(s))) {
          toCredit.push(item.id);
          break;
        }
      }
    }

    if (toCredit.length > 0) {
      setSession(prev => prev ? {
        ...prev,
        completedItems: [...new Set([...prev.completedItems, ...toCredit])],
      } : prev);
    }
    // Dependency list intentionally includes the action signals; session
    // is read via a functional setter so the effect doesn't re-run on every
    // checklist credit it just performed.
  }, [currentCase, assessmentTracker, transportDecisions, session]);

  // End case — show transport decision wizard from step 1
  const endCase = useCallback((action: 'transport' | 'end') => {
    if (readOnly) return;
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
      // Deduplicate by treatment ID so repeat applications don't inflate score
      const uniqueTreatmentCount = new Set(appliedTreatments.map(t => t.id)).size;
      treatmentBonus = Math.min(uniqueTreatmentCount * 5, treatmentBonusCap);
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
    const basePercentage = totalPossible > 0 ? Math.round((scoreEarned / totalPossible) * 100) : 0;

    // Penalty system: deduct for critical omissions and unresolved dangerous vitals
    // Use assessment debrief critical missed (primary) OR checklist critical missed (fallback)
    const checklistCriticalMissed = criticalItems.filter(item => !session.completedItems.includes(item.id));
    const debriefCriticalCount = debrief?.criticalMissed?.length || 0;
    const criticalMissedCount = Math.max(debriefCriticalCount, checklistCriticalMissed.length);
    const penaltyReasons: { label: string; amount: number }[] = [];
    let penaltyTotal = 0;

    if (criticalMissedCount > 0) {
      const amt = Math.min(criticalMissedCount * 5, 25);
      penaltyReasons.push({ label: `${criticalMissedCount} critical action${criticalMissedCount > 1 ? 's' : ''} missed`, amount: amt });
      penaltyTotal += amt;
    }

    const finalVitals = vitalsHistory[vitalsHistory.length - 1];
    if (finalVitals) {
      const fSpO2 = parseInt(String(finalVitals.spo2)) || 0;
      const fRR = parseInt(String(finalVitals.respiration)) || 0;
      const fHR = parseInt(String(finalVitals.pulse)) || 0;
      if (fSpO2 > 0 && fSpO2 < 90) {
        penaltyReasons.push({ label: `SpO2 critically low at ${fSpO2}%`, amount: 10 });
        penaltyTotal += 10;
      } else if (fSpO2 > 0 && fSpO2 < 94) {
        penaltyReasons.push({ label: `SpO2 still below target at ${fSpO2}%`, amount: 5 });
        penaltyTotal += 5;
      }
      if (fRR > 0 && (fRR > 30 || fRR < 8)) {
        penaltyReasons.push({ label: `Respiratory rate dangerous at ${fRR}/min`, amount: 5 });
        penaltyTotal += 5;
      }
      if (fHR > 0 && (fHR > 150 || fHR < 40)) {
        penaltyReasons.push({ label: `Heart rate dangerous at ${fHR} bpm`, amount: 5 });
        penaltyTotal += 5;
      }
    }

    // Cardiac arrest & hypothermia-specific penalties
    const sub = (currentCase.subcategory || '').toLowerCase();
    const isArrestCase = sub.includes('cardiac-arrest') || sub.includes('arrest') || sub.includes('vfib') || sub.includes('asystole')
      || patientState?.isInArrest || appliedTreatmentIds.includes('cpr');
    const isSevereHypothermiaCase = (currentCase.vitalSignsProgression?.initial?.temperature ?? 37) < 30;

    if (isArrestCase) {
      // CPR is started via the CPR button (cprRunning + timeline entry) —
      // not via applyTreatment — so checking `appliedTreatmentIds` alone
      // falsely flagged "no CPR". Treat any of these as proof CPR happened:
      // an 'cpr-start' arrest-timeline entry, cprRunning being true now,
      // or a manually-applied cpr treatment (belt-and-braces).
      const hasCPR =
        appliedTreatmentIds.includes('cpr') ||
        appliedTreatmentIds.includes('cpr_compressions') ||
        cprRunning ||
        arrestTimeline.some(e => e.type === 'cpr-start' || /cpr/i.test(e.event));
      const hasAdrenaline = appliedTreatmentIds.includes('adrenaline_1mg');
      const hasDefib =
        appliedTreatmentIds.includes('defibrillation') ||
        arrestTimeline.some(e => e.type === 'shock');
      const hasBVM =
        appliedTreatmentIds.includes('bvm_ventilation') ||
        appliedTreatmentIds.includes('mechanical_ventilation') ||
        appliedTreatmentIds.includes('oxygen_nonrebreather') ||
        appliedTreatmentIds.includes('oxygen_mask') ||
        appliedTreatmentIds.includes('cpap_niv');
      const isShockableCase = currentCase.abcde?.circulation?.ecgFindings?.some(
        (f: string) => f.toLowerCase().includes('vf') || f.toLowerCase().includes('ventricular fibrillation')
      );

      if (!hasCPR) {
        penaltyReasons.push({ label: 'CPR not started — critical in cardiac arrest', amount: 15 });
        penaltyTotal += 15;
      }
      if (!hasBVM) {
        penaltyReasons.push({ label: 'No ventilation provided during arrest', amount: 10 });
        penaltyTotal += 10;
      }
      if (!hasAdrenaline && !isSevereHypothermiaCase) {
        penaltyReasons.push({ label: 'Adrenaline not given in cardiac arrest', amount: 10 });
        penaltyTotal += 10;
      }
      if (isShockableCase && !hasDefib) {
        penaltyReasons.push({ label: 'Shockable rhythm not defibrillated', amount: 15 });
        penaltyTotal += 15;
      }
    }
    if (isSevereHypothermiaCase) {
      const hasRewarming = appliedTreatmentIds.some(id => id.includes('warm') || id.includes('blanket') || id.includes('space_blanket'));
      const checkedTemp = assessmentTracker?.performed.some(p => p.stepId === 'temperature');
      if (!checkedTemp) {
        penaltyReasons.push({ label: 'Core temperature not assessed in hypothermia case', amount: 10 });
        penaltyTotal += 10;
      }
    }

    // ---- CONTRAINDICATED MEDICATION PENALTIES ----
    // Until now, giving the wrong drug had no score consequence. This wires
    // the existing `contraindicatedTreatments` table (per-severity) into the
    // grade: each contraindicated treatment the student applied burns 12
    // points and surfaces a named penalty in the session summary. The
    // engine's `applyCrossSystemPhysiology` separately handles the physio-
    // logical consequence (e.g. GTN in inferior STEMI → BP crash); this is
    // the accountability half of that feedback loop.
    try {
      const protocol = findProtocol(currentCase.subcategory || '', currentCase.category || '');
      if (protocol && currentCase.vitalSignsProgression?.initial) {
        const initialVitals = {
          pulse: currentCase.vitalSignsProgression.initial.pulse ?? 80,
          respiration: currentCase.vitalSignsProgression.initial.respiration ?? 16,
          spo2: currentCase.vitalSignsProgression.initial.spo2 ?? 98,
          gcs: currentCase.vitalSignsProgression.initial.gcs ?? 15,
          bp: currentCase.vitalSignsProgression.initial.bp ?? '120/80',
          temperature: currentCase.vitalSignsProgression.initial.temperature ?? 37,
        } as const;
        const severity = determineSeverityFromVitals(protocol, initialVitals as unknown as Parameters<typeof determineSeverityFromVitals>[1]);
        const contraindicatedGiven = (severity.contraindicatedTreatments ?? []).filter(
          t => appliedTreatmentIds.includes(t),
        );
        if (contraindicatedGiven.length > 0) {
          // Resolve friendlier names where available so the summary reads
          // "GTN given in inferior STEMI" rather than "gtn_spray given".
          const nameFor = (id: string) =>
            TREATMENTS.find(tr => tr.id === id)?.name ?? id.replace(/_/g, ' ');
          for (const id of contraindicatedGiven) {
            penaltyReasons.push({
              label: `Contraindicated: ${nameFor(id)} — should NOT be given in this presentation`,
              amount: 12,
            });
            penaltyTotal += 12;
          }
        }
      }
    } catch (e) {
      // Non-fatal — don't let a scoring edge case break the summary.
      console.warn('[scoring] contraindication check failed', e);
    }

    const percentage = Math.max(0, basePercentage - penaltyTotal);

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
      basePercentage,
      percentage,
      penaltyTotal,
      penaltyReasons,
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
  }, [currentCase, session, selectedYear, appliedTreatments, vitalsHistory, elapsedSeconds, caseStartTime, assessmentTracker, cprRunning, arrestTimeline, patientState, appliedTreatmentIds]);

  // AI-style narrative report — only computed when the case is complete
  const narrativeReport = useMemo(() => {
    if (!currentCase || !performanceMetrics || phase !== 'postcase') return null;
    return generateNarrativeReport({
      caseData: currentCase,
      appliedTreatments,
      appliedTreatmentIds,
      vitalsHistory,
      caseStartTime,
      assessmentPerformedIds: assessmentTracker?.performed.map(p => p.stepId) ?? [],
      transportDecision: transportDecisions ? 'transport' : null,
      totalScore: performanceMetrics.percentage,
    });
  }, [currentCase, performanceMetrics, phase, appliedTreatments, appliedTreatmentIds, vitalsHistory, caseStartTime, assessmentTracker, transportDecisions]);

  // ED outcome / continuity of care — only when transported
  const edOutcome = useMemo(() => {
    if (!currentCase || !performanceMetrics || phase !== 'postcase') return null;
    if (!transportDecisions) return null; // Only generate if patient was transported
    const finalVitals = vitalsHistory[vitalsHistory.length - 1] || currentVitals;
    if (!finalVitals) return null;
    return generateEDOutcome({
      caseData: currentCase,
      finalVitals,
      appliedTreatmentIds,
      totalScore: performanceMetrics.percentage,
      transportPreAlert: transportDecisions.preAlert,
      transportDestination: transportDecisions.destination,
      suspectedDiagnosis: transportDecisions.provisionalDiagnosis,
    });
  }, [currentCase, performanceMetrics, phase, appliedTreatmentIds, vitalsHistory, currentVitals, transportDecisions]);

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
    setMonitorRevealedVitals(new Set());
    setPhase('select');
    medicationConfirmedRef.current = new Set();
    // Reset transport / patient state
    setShowTransportDecision(false);
    setPatientState(null);
    setSceneTimeWarnings(new Set());
    // Clear deterioration timer
    if (deteriorationIntervalRef.current) {
      clearInterval(deteriorationIntervalRef.current);
      deteriorationIntervalRef.current = null;
    }
    // Reset all cardiac arrest state
    setArrestConfirmed(false);
    setArrestActive(false);
    setPulseCheckInProgress(false);
    setPulseCheckResult(null);
    setCprCycleTimer(120);
    setCprCycleNumber(0);
    setCprRunning(false);
    setShockCount(0);
    setLastAdrenalineTime(null);
    setAdrenalineDoses(0);
    setAmiodaroneDoses(0);
    setArrestStartTime(null);
    setArrestTimeline([]);
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
    <div className="min-h-screen bg-background">
      {/* Onboarding Tour */}
      {showTour && phase === 'select' && <OnboardingTour onDismiss={dismissTour} />}

      {/* Student Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border/30 safe-top">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md shrink-0">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-sm font-bold tracking-tight heading-premium truncate">{t('role.student')}</h1>
                  <Badge variant="outline" className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 border-blue-500/30 text-blue-600 dark:text-blue-400 font-medium shrink-0 hidden xs:inline-flex">{t('role.studentBadge')}</Badge>
                </div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:block">{t('app.name')}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Language switcher */}
              <LanguageSwitcher />
              {/* Voice toggle */}
              <VoiceToggleButton />
              {/* Back button */}
              {canGoBack && (
                <button
                  onClick={goBack}
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 active:bg-muted transition-colors touch-manipulation"
                  title={t('header.back')}
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </button>
              )}
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
        {/* Optional top banner slot — used by classroom-host for the
            broadcast toolbar. Rendered above every phase so it stays
            visible whether the instructor is pre-briefing, running the
            case, or on the post-case summary. */}
        {topBanner}

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
              <div className="mx-auto mb-5 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-blue-600 shadow-sm ring-4 ring-blue-500/10">
                <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-sm" />
              </div>
              <h2 className="heading-clean text-2xl sm:text-[2.25rem] leading-tight text-foreground">Paramedic Case Generator</h2>
              <p className="text-muted-foreground mt-2 sm:mt-3 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Select your training level and generate realistic emergency scenarios to sharpen your clinical skills
              </p>
            </div>

            {/* Year Level */}
            <Card className="bg-card border border-border rounded-2xl dark:bg-slate-900/60">
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

            {/* Selection Mode Tabs */}
            <Card className="bg-card border border-border rounded-2xl dark:bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 heading-premium">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  How would you like to select a case?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode selector */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: 'standard' as const, label: 'Generate Random', icon: Sparkles, desc: 'Filter & randomize' },
                    { mode: 'random-category' as const, label: 'Random by Category', icon: Shuffle, desc: 'Pick a category' },
                    { mode: 'condition' as const, label: 'Practice Condition', icon: Target, desc: 'Search conditions' },
                  ].map(({ mode, label, icon: ModeIcon, desc }) => (
                    <button
                      key={mode}
                      onClick={() => setSelectionMode(mode)}
                      className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-xs transition-all duration-300 ${
                        selectionMode === mode
                          ? 'border-blue-500 bg-gradient-to-b from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-blue-500/20'
                          : 'border-border/50 hover:border-blue-400/50 text-muted-foreground hover:bg-accent/40 dark:border-slate-700/60'
                      }`}
                    >
                      <ModeIcon className={`h-4 w-4 ${selectionMode === mode ? 'text-blue-500' : 'text-muted-foreground/50'}`} />
                      <span className="font-medium text-[11px] sm:text-xs">{label}</span>
                      <span className="text-[9px] text-muted-foreground hidden sm:block">{desc}</span>
                    </button>
                  ))}
                </div>

                {/* MODE: Standard — category filter + generate */}
                {selectionMode === 'standard' && (
                  <div className="space-y-4 animate-fade-in">
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
                  </div>
                )}

                {/* MODE: Random by Category — click a category to instantly get a random case */}
                {selectionMode === 'random-category' && (
                  <div className="space-y-2 animate-fade-in">
                    <p className="text-xs text-muted-foreground">Click a category to get a random case from it:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {caseCategories
                        .filter(cat => allCases.some(c => c.category === cat.value && c.yearLevels?.includes(selectedYear as any)))
                        .map(cat => {
                        const catColors: Record<string, string> = {
                          cardiac: 'from-red-500/15 to-red-500/5 border-red-400 text-red-600 dark:text-red-400',
                          respiratory: 'from-cyan-500/15 to-cyan-500/5 border-cyan-400 text-cyan-600 dark:text-cyan-400',
                          trauma: 'from-orange-500/15 to-orange-500/5 border-orange-400 text-orange-600 dark:text-orange-400',
                          neurological: 'from-purple-500/15 to-purple-500/5 border-purple-400 text-purple-600 dark:text-purple-400',
                          medical: 'from-emerald-500/15 to-emerald-500/5 border-emerald-400 text-emerald-600 dark:text-emerald-400',
                          paediatric: 'from-pink-500/15 to-pink-500/5 border-pink-400 text-pink-600 dark:text-pink-400',
                          obstetric: 'from-rose-500/15 to-rose-500/5 border-rose-400 text-rose-600 dark:text-rose-400',
                          environmental: 'from-amber-500/15 to-amber-500/5 border-amber-400 text-amber-600 dark:text-amber-400',
                          psychiatric: 'from-violet-500/15 to-violet-500/5 border-violet-400 text-violet-600 dark:text-violet-400',
                        };
                        const colors = catColors[cat.value.toLowerCase()] || 'from-blue-500/15 to-blue-500/5 border-blue-400 text-blue-600 dark:text-blue-400';
                        const count = allCases.filter(c => c.category === cat.value && c.yearLevels?.includes(selectedYear as any)).length;
                        return (
                        <button
                          key={cat.value}
                          onClick={() => generateCaseByCategory(cat.value)}
                          disabled={isGenerating}
                          className={`flex flex-col items-center gap-1 px-3 py-3.5 rounded-xl border-2 bg-gradient-to-b ${colors} text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Shuffle className="h-4 w-4 mb-0.5" />
                          <span className="text-xs font-semibold">{cat.label}</span>
                          <span className="text-[10px] opacity-60">{count} case{count !== 1 ? 's' : ''}</span>
                        </button>
                      );})}
                    </div>
                  </div>
                )}

                {/* MODE: Practice Specific Condition — searchable dropdown */}
                {selectionMode === 'condition' && (
                  <div className="space-y-3 animate-fade-in">
                    <p className="text-xs text-muted-foreground">Search for a specific condition to practice:</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={conditionSearch}
                        onChange={(e) => { setConditionSearch(e.target.value); setSelectedCondition(null); }}
                        placeholder="Search conditions... (e.g. STEMI, Asthma, Pneumothorax)"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto rounded-xl border border-border/30 divide-y divide-border/20">
                      {filteredConditions.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No conditions match your search</p>
                      ) : (
                        filteredConditions.map(condition => {
                          const matchCount = getCasesByCondition(condition, selectedYear).length;
                          return (
                            <button
                              key={condition}
                              onClick={() => generateCaseByCondition(condition)}
                              disabled={isGenerating || matchCount === 0}
                              className="flex items-center justify-between w-full px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <span className="flex items-center gap-2">
                                <Target className="h-3 w-3 text-blue-500 shrink-0" />
                                <span>{condition}</span>
                              </span>
                              <Badge variant="secondary" className="text-[10px] py-0 h-4 shrink-0">
                                {matchCount} case{matchCount !== 1 ? 's' : ''}
                              </Badge>
                            </button>
                          );
                        })
                      )}
                    </div>
                    {conditionSearch.trim() === '' && (
                      <p className="text-[10px] text-muted-foreground/50 text-center">
                        Showing first 30 conditions. Type to search all {allConditionNames.length} conditions.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate button — only for standard mode */}
            {selectionMode === 'standard' && (
              <Button
                onClick={generateCase}
                disabled={isGenerating}
                size="lg"
                className="w-full gap-2.5 sm:gap-3 text-sm sm:text-lg py-6 sm:py-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-300 hover:-translate-y-1 font-semibold tracking-tight"
              >
                {isGenerating ? (
                  <><Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> Generating Case...</>
                ) : (
                  <><Sparkles className="h-5 w-5 sm:h-6 sm:w-6" /> Generate Case</>
                )}
              </Button>
            )}

            {/* Loading indicator for category/condition modes */}
            {selectionMode !== 'standard' && isGenerating && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">Generating case...</span>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground/50 pb-4">
              {selectionMode === 'standard' && 'Cases are randomized within your selected category and year level'}
              {selectionMode === 'random-category' && 'Click any category above to instantly get a random case from it'}
              {selectionMode === 'condition' && 'Select a condition to get a case where it appears as diagnosis or differential'}
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
            <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
            <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
            <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <Button onClick={startCase} size="lg" className="flex-1 gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all hover:-translate-y-0.5 text-sm sm:text-base h-10 sm:h-12">
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
            <div className="p-3 sm:p-5 rounded-2xl bg-card border border-border dark:bg-slate-900/60 space-y-3 overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/10 shrink-0">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">{getStudentCaseTitle(currentCase)}</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {currentCase.dispatchInfo.location}
                  </p>
                </div>
                <NarrationButton
                  role="dispatcher"
                  size="md"
                  label="Replay dispatch briefing"
                  text={buildDispatchNarration(currentCase)}
                />
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary/10 dark:bg-primary/15 border border-primary/20 shrink-0">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                  <span className="font-mono text-[11px] sm:text-sm font-semibold text-primary">{formatTime(elapsedSeconds)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPhase('case')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg flex-1 sm:flex-none h-8 dark:border-slate-700"
                >
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Case </span>Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMedicalControl(true)}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg flex-1 sm:flex-none h-8 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                >
                  <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Call </span>Med Control
                </Button>
                <div className="relative flex-1 sm:flex-none">
                  <Button
                    size="sm"
                    onClick={() => endCase('transport')}
                    className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm w-full h-8 ring-2 ring-amber-400/30"
                  >
                    <Ambulance className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Transport
                  </Button>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-amber-600 dark:text-amber-400 whitespace-nowrap font-medium pointer-events-none">
                    Ready to transport?
                  </span>
                </div>
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
              {showScene ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
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
                  <CardTitle className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
                      <Ambulance className="h-5 w-5 text-amber-600" />
                      Transport & Handover
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      {[
                        { step: 1, label: 'Priority' },
                        { step: 2, label: 'Position' },
                        { step: 3, label: 'Pre-Alert' },
                        { step: 4, label: 'Diagnosis' },
                        { step: 5, label: 'Confirm' },
                      ].map(({ step: s, label }, idx) => (
                        <div key={s} className="flex items-center gap-1 sm:gap-1.5">
                          <div className="flex flex-col items-center gap-0.5">
                            <div className={`h-2 w-7 sm:w-8 rounded-full transition-all ${
                              s < transportStep ? 'bg-green-500'
                              : s === transportStep ? 'bg-amber-500'
                              : 'bg-border/40'
                            }`} />
                            <span className={`text-xs sm:text-sm leading-tight transition-colors ${
                              s === transportStep ? 'text-amber-600 dark:text-amber-400 font-bold' : s < transportStep ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground/60'
                            }`}>{label}</span>
                          </div>
                          {idx < 4 && (
                            <span className={`text-xs sm:text-sm mt-[-0.5rem] ${
                              s < transportStep ? 'text-green-500' : 'text-muted-foreground/40'
                            }`}>›</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">

                  {/* Mini-summary bar — shows completed decisions at a glance */}
                  {transportStep > 1 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 px-2.5 py-1.5 rounded-lg bg-white/60 dark:bg-black/20 border border-border/30 text-[10px] text-muted-foreground animate-fade-in">
                      {transportDecisions?.priority && (
                        <span>
                          <span className="font-semibold text-foreground/80">Priority:</span>{' '}
                          {transportDecisions.priority === 'lights' ? 'Lights & Sirens' : transportDecisions.priority === 'urgent' ? 'Urgent' : 'Routine'}
                        </span>
                      )}
                      {transportDecisions?.position && (
                        <span>
                          <span className="font-semibold text-foreground/80">Position:</span>{' '}
                          {transportDecisions.position}
                        </span>
                      )}
                      {transportStep > 3 && transportDecisions?.preAlert !== undefined && transportDecisions?.priority && (
                        <span>
                          <span className="font-semibold text-foreground/80">Pre-Alert:</span>{' '}
                          {transportDecisions.preAlert ? 'Yes' : 'No'}
                        </span>
                      )}
                      {transportDecisions?.destination && (
                        <span>
                          <span className="font-semibold text-foreground/80">Dest:</span>{' '}
                          {transportDecisions.destination}
                        </span>
                      )}
                      {transportDecisions?.provisionalDiagnosis && (
                        <span>
                          <span className="font-semibold text-foreground/80">Dx:</span>{' '}
                          {transportDecisions.provisionalDiagnosis}
                        </span>
                      )}
                    </div>
                  )}

                  {/* STEP 1: Transport Priority */}
                  {transportStep === 1 && (
                    <div className="animate-fade-in">
                      <p className="text-base sm:text-xl font-bold mb-1">How do you want to transport this patient?</p>
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
                      <p className="text-sm font-bold mb-1">
                        {session?.isConditionSelected && session?.selectedCondition
                          ? `What is the underlying cause of this ${session.selectedCondition}?`
                          : 'What is your provisional diagnosis?'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {session?.isConditionSelected
                          ? 'You know the general condition — now identify the specific underlying cause.'
                          : 'Based on your assessment, what do you think is wrong with this patient?'}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {currentCase.expectedFindings?.differentialDiagnoses
                          ? [...seededShuffle(currentCase.expectedFindings.differentialDiagnoses.slice(0, 5), currentCase.id),
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

            {/* ===== SPLIT LAYOUT =====
                Mobile order: Monitor → Primary Survey → Secondary (3D) → History → Management.
                Desktop: 2-col grid — Monitor + PulseCheck sticky top-right, Management bottom-right,
                Assessment (Primary / 3D / History) spans both rows on the left.
            */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-4 lg:grid-rows-[auto_auto]">

              {/* ===== ASSESSMENT COLUMN (Primary / 3D / History) ===== */}
              <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-2 space-y-4">

                {/* --- PRIMARY SURVEY (ABCDE) --- */}
                <Card className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden">
                  <CardHeader className="pb-2 px-3 sm:px-4 border-b border-border/30">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-blue-500/15">
                        <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                      </div>
                      Primary Survey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3">
                    {/* ABCDE channel colours per tile — matches the design-system
                        primary-survey pattern. Scene-safety is neutral; airway /
                        breathing / circulation / disability / exposure each pick
                        up their channel's colour when idle, reinforcing the
                        clinical hierarchy at a glance. Assessed state keeps the
                        green check; active state ramps up ring intensity. */}
                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                      {([
                        { key: 'scene-safety' as const, letter: 'S', label: 'Scene',      stepId: 'scene-safety' as AssessmentStepId, idle: 'border-slate-400/40 bg-slate-400/5 text-slate-500', hover: 'hover:border-slate-500/60 hover:bg-slate-500/10', active: 'border-slate-500 bg-slate-500/10 ring-2 ring-slate-500/30 text-slate-600' },
                        { key: 'airway' as const,       letter: 'A', label: 'Airway',     stepId: 'airway' as AssessmentStepId,       idle: 'border-blue-400/40 bg-blue-400/5 text-blue-600',   hover: 'hover:border-blue-500/60 hover:bg-blue-500/10',   active: 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30 text-blue-600' },
                        { key: 'breathing' as const,    letter: 'B', label: 'Breathing',  stepId: 'breathing' as AssessmentStepId,    idle: 'border-cyan-400/40 bg-cyan-400/5 text-cyan-600',   hover: 'hover:border-cyan-500/60 hover:bg-cyan-500/10',   active: 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30 text-cyan-600' },
                        { key: 'circulation' as const,  letter: 'C', label: 'Circulation',stepId: 'circulation' as AssessmentStepId,  idle: 'border-red-400/40 bg-red-400/5 text-red-600',      hover: 'hover:border-red-500/60 hover:bg-red-500/10',     active: 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 text-red-600' },
                        { key: 'disability' as const,   letter: 'D', label: 'Disability', stepId: 'disability' as AssessmentStepId,   idle: 'border-purple-400/40 bg-purple-400/5 text-purple-600', hover: 'hover:border-purple-500/60 hover:bg-purple-500/10', active: 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30 text-purple-600' },
                        { key: 'exposure' as const,     letter: 'E', label: 'Exposure',   stepId: 'exposure' as AssessmentStepId,     idle: 'border-amber-400/40 bg-amber-400/5 text-amber-600', hover: 'hover:border-amber-500/60 hover:bg-amber-500/10',  active: 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 text-amber-600' },
                      ]).map(item => {
                        const isAssessed = assessmentTracker?.performed.some(p => p.stepId === item.stepId);
                        const isActive = activePrimarySurvey === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              handlePerformAssessment(item.stepId);
                              setActivePrimarySurvey(isActive ? null : item.key);
                            }}
                            className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] sm:min-h-[56px] p-2 sm:p-3 rounded-xl border transition-all text-center touch-manipulation ${
                              isActive
                                ? item.active
                                : isAssessed
                                  ? 'border-green-500/40 bg-green-500/5 text-green-600'
                                  : `${item.idle} ${item.hover}`
                            }`}
                          >
                            <span className={`text-lg sm:text-xl font-bold ${isAssessed ? 'text-green-600 dark:text-green-400' : ''}`}>
                              {item.letter}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">{item.label}</span>
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
                            <div key={i} className="text-xs p-1.5 rounded-lg border bg-muted/20 border-border/30 text-foreground">
                              <span className="font-medium">{f.label}:</span> {f.value}
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
                      caseCategory={currentCase.category}
                      isInArrest={patientState?.isInArrest ?? false}
                    />
                  </Suspense>
                )}

                {/* --- HISTORY (SAMPLE) --- */}
                <Card className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden">
                  <CardHeader className="pb-2 px-3 sm:px-4 border-b border-border/30">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-purple-500/15">
                        <ClipboardCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-500" />
                      </div>
                      History (SAMPLE)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3">
                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
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
                              // Always call to refresh activeFindings for display
                              handlePerformAssessment(item.stepId);
                              setActiveHistoryStep(isActive ? null : item.key);
                            }}
                            className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] sm:min-h-[52px] p-1.5 sm:p-2 rounded-lg border-2 transition-all text-center touch-manipulation ${
                              isActive
                                ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
                                : isAssessed
                                  ? 'border-green-500/40 bg-green-500/5'
                                  : 'border-border/40 hover:border-purple-500/40 hover:bg-accent/30 active:bg-accent/50'
                            }`}
                          >
                            <span className={`text-base sm:text-lg font-bold ${isAssessed ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                              {item.letter}
                            </span>
                            <span className="text-[8px] sm:text-[9px] text-muted-foreground leading-tight">{item.label}</span>
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
                            <div key={i} className="text-xs p-1.5 rounded-lg border bg-muted/20 border-border/30 text-foreground">
                              <span className="font-medium">{f.label}:</span> {f.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ===== SPECIAL ASSESSMENTS (contextual, driven by assessment framework) ===== */}
                {assessmentTracker && (() => {
                  // Build list of special assessment steps that are in required or recommended but not yet performed
                  const performedIds = new Set(assessmentTracker.performed.map(p => p.stepId));
                  const specialStepIds = new Set([
                    ...assessmentTracker.required.filter(id => SPECIAL_STEPS.some(s => s.id === id)),
                    ...assessmentTracker.recommended.filter(id => SPECIAL_STEPS.some(s => s.id === id)),
                  ]);
                  // Filter to only the 6 special steps that have no other UI path
                  const specialOnlyIds = new Set<AssessmentStepId>([
                    'reversible-causes', 'pediatric-assessment', 'stroke-screen',
                    'burns-assessment', 'psychiatric-assessment', 'toxicology-screen',
                  ]);
                  const visibleSteps = SPECIAL_STEPS.filter(
                    s => specialOnlyIds.has(s.id) && specialStepIds.has(s.id),
                  );
                  if (visibleSteps.length === 0) return null;

                  const iconMap: Record<string, React.ReactNode> = {
                    'Search': <ListChecks className="h-3.5 w-3.5" />,
                    'Brain': <Brain className="h-3.5 w-3.5" />,
                    'Flame': <Flame className="h-3.5 w-3.5" />,
                    'Baby': <Baby className="h-3.5 w-3.5" />,
                    'Flask': <FlaskConical className="h-3.5 w-3.5" />,
                    'HeartPulse': <HeartPulse className="h-3.5 w-3.5" />,
                    'Gauge': <Gauge className="h-3.5 w-3.5" />,
                  };

                  return (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardHeader className="pb-1 pt-2 px-3">
                        <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                          <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-amber-500/15">
                            <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />
                          </div>
                          Special Assessments
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 sm:p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {visibleSteps.map(step => {
                            const isPerformed = performedIds.has(step.id);
                            const isRequired = assessmentTracker.required.includes(step.id);
                            return (
                              <button
                                key={step.id}
                                onClick={() => {
                                  handlePerformAssessment(step.id);
                                  setActiveHistoryStep(null);
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                                  isPerformed
                                    ? 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400'
                                    : 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/15 text-foreground'
                                }`}
                              >
                                <span className={isPerformed ? 'text-green-500' : 'text-amber-500'}>
                                  {iconMap[step.icon] || <Target className="h-3.5 w-3.5" />}
                                </span>
                                <span className="font-medium">{step.shortLabel}</span>
                                {isRequired && !isPerformed && (
                                  <Badge variant="outline" className="text-[8px] px-1 py-0 border-amber-500/50 text-amber-600 dark:text-amber-400">
                                    Required
                                  </Badge>
                                )}
                                {isPerformed && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                              </button>
                            );
                          })}
                        </div>
                        {/* Show findings for last clicked special assessment */}
                        {activeFindings && SPECIAL_STEPS.some(s => s.id === activeFindings.stepId && specialOnlyIds.has(s.id) && specialStepIds.has(s.id)) && (
                          <div className="mt-2 p-2.5 rounded-xl bg-muted/30 border border-border/30 animate-fade-in">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                              {ALL_STEPS[activeFindings.stepId]?.label || activeFindings.stepId} Findings
                            </p>
                            <div className="space-y-1">
                              {activeFindings.findings.map((f, i) => (
                                <div key={i} className={`text-xs p-1.5 rounded-lg border bg-muted/20 text-foreground ${
                                  f.severity === 'critical' ? 'border-red-500/40 bg-red-500/5' :
                                  f.severity === 'abnormal' ? 'border-amber-500/40 bg-amber-500/5' :
                                  'border-border/30'
                                }`}>
                                  <span className="font-medium">{f.label}:</span> {f.value}
                                  {f.significance && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5 italic">{f.significance}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Clinical Assessment Panel removed — replaced by inline ABCDE Primary Survey + 3D Physical Exam above */}
              </div>

              {/* ===== MONITOR + PULSE CHECK (sticky top-right on desktop, first on mobile) ===== */}
              <div className="order-1 lg:order-none lg:col-start-2 lg:row-start-1 mb-4 lg:mb-0 lg:sticky lg:top-16 lg:self-start space-y-4">

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
                    onAssessmentPerformed={handlePerformAssessment}
                    caseCategory={currentCase.category}
                    caseSubcategory={currentCase.subcategory}
                    caseTitle={currentCase.title}
                    ecgFindings={currentCase.abcde?.circulation?.ecgFindings}
                    appliedTreatments={appliedTreatmentIds}
                    overrideRhythm={patientState?.currentRhythm}
                    revealedVitals={monitorRevealedVitals}
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
                        // Create a defibrillation treatment object for the dialog
                        setPendingDefibTreatment({
                          id: 'defibrillation',
                          name: 'Defibrillation',
                          category: 'procedure',
                          description: 'Deliver electrical shock to restore normal rhythm',
                          effects: [],
                        } as any);
                        setShowDefibDialog(true);
                        lastActivityRef.current = Date.now();
                      },
                    } : undefined}
                  />
                </Suspense>

                {/* --- PULSE CHECK + CONFIRM ARREST BUTTONS --- */}
                <div className="flex flex-col gap-2">
                  {/* Quick Pulse Check button — always visible during active case */}
                  <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 text-xs ${pulseCheckInProgress ? 'animate-pulse border-amber-500 text-amber-600' : pulseCheckResult ? (pulseCheckResult === 'absent' ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600') : ''}`}
                    disabled={pulseCheckInProgress}
                    onClick={() => {
                      setPulseCheckInProgress(true);
                      setPulseCheckResult(null);
                      lastActivityRef.current = Date.now();
                      // 5-second assessment delay
                      setTimeout(() => {
                        const hasPulse = currentVitals && currentVitals.pulse > 0 && !(patientState?.isInArrest);
                        const result = hasPulse ? 'present' : 'absent';
                        setPulseCheckResult(result);
                        setPulseCheckInProgress(false);
                        if (result === 'absent') {
                          toast.error('No pulse detected', {
                            description: 'Patient is pulseless. Consider cardiac arrest protocol.',
                            duration: 8000,
                          });
                        } else {
                          toast.success('Pulse present', {
                            description: `Pulse detected — rate approximately ${currentVitals?.pulse || '?'} bpm.`,
                            duration: 5000,
                          });
                        }
                      }, 5000);
                    }}
                  >
                    <Heart className="h-3.5 w-3.5" />
                    {pulseCheckInProgress
                      ? 'Checking pulse...'
                      : pulseCheckResult === 'absent'
                        ? 'No pulse detected'
                        : pulseCheckResult === 'present'
                          ? 'Pulse present'
                          : 'Check Pulse'}
                  </Button>

                  {/* Confirm Cardiac Arrest — only appears when pulse check shows absent AND arrest not yet confirmed */}
                  {pulseCheckResult === 'absent' && !arrestConfirmed && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2 text-xs font-bold animate-pulse"
                      onClick={() => {
                        setArrestConfirmed(true);
                        lastActivityRef.current = Date.now();
                      }}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Confirm Cardiac Arrest — Start Protocol
                    </Button>
                  )}
                </div>
              </div>

              {/* ===== MANAGEMENT COLUMN (bottom-right on desktop, last on mobile) ===== */}
              <div className="order-3 lg:order-none lg:col-start-2 lg:row-start-2 space-y-4">
                {/* --- MANAGEMENT (ABCDE) --- */}
                <Card className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden">
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
                            // Determine if treatment is gated and why
                            const coreTemp = currentVitals?.temperature ?? 37;
                            const isSevereHypothermia = coreTemp < 30;
                            const needsIV = treatment.requiresIVAccess && !appliedTreatmentIds.includes('iv_access');
                            const hypothermiaBlock = isSevereHypothermia && treatment.category === 'medication';
                            let gateReason: string | null = null;
                            if (needsIV) gateReason = 'Requires IV access first. Establish IV before giving this medication.';
                            else if (hypothermiaBlock) gateReason = `Withheld — core temperature ${coreTemp}°C is below 30°C. All medications are withheld in severe hypothermia. Rewarm first.`;
                            const isGated = gateReason !== null;
                            return (
                              <div key={treatment.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                                isApplied ? 'bg-green-500/5 border-green-500/20' :
                                isGated ? 'bg-amber-500/5 border-amber-500/20' :
                                'border-border/30 hover:bg-accent/20'
                              }`}>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">{treatment.name}</span>
                                    {isGated && (
                                      <span
                                        title={gateReason!}
                                        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500/15 border border-amber-500/40 shrink-0 cursor-help"
                                      >
                                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">i</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {isGated ? gateReason : treatment.description}
                                  </p>
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
                  <Card className="bg-card border border-border rounded-xl sm:rounded-2xl">
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
                isInArrest={patientState.isInArrest}
              />
            )}

            {/* BVM rate picker — compact, three-button. Paeds / adult / arrest. */}
            {showBvmRateDialog && (
              <Dialog open={showBvmRateDialog} onOpenChange={(o) => { if (!o) { setShowBvmRateDialog(false); setPendingBvmTreatment(null); } }}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-primary" /> BVM ventilation rate
                    </DialogTitle>
                    <DialogDescription>
                      Choose the breaths/min you'll deliver. You can change this any time.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-2 py-2">
                    {[
                      { rate: 10, label: '10 / min — arrest (asynchronous with CPR)', sub: 'Adult in cardiac arrest; 1 breath every 6 s.' },
                      { rate: 12, label: '12 / min — adult respiratory failure', sub: 'Apnoeic adult with pulse; 1 breath every 5 s.' },
                      { rate: 20, label: '20 / min — paediatric', sub: 'Infant / child in respiratory distress or arrest.' },
                      { rate: 25, label: '25 / min — neonate / newborn', sub: '40-60 / min for true neonates; start 25 for infants.' },
                    ].map(opt => (
                      <button
                        key={opt.rate}
                        onClick={() => {
                          setBvmVentilationRate(opt.rate);
                          setShowBvmRateDialog(false);
                          const t = pendingBvmTreatment;
                          setPendingBvmTreatment(null);
                          if (t) setTimeout(() => applyTreatment(t), 0);
                          toast.success(`Ventilating at ${opt.rate}/min`, { duration: 2500 });
                        }}
                        className="text-left px-3 py-2 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Mechanical Ventilator Setup Dialog */}
            {showVentilatorDialog && currentCase && (
              <VentilatorSetupDialog
                open={showVentilatorDialog}
                onClose={() => setShowVentilatorDialog(false)}
                onConfirm={(settings) => {
                  setVentilatorSettings(settings);
                  setShowVentilatorDialog(false);
                  // Apply the treatment now that settings exist; the second call
                  // skips the dialog gate above because ventilatorSettings is set.
                  const ventTreatment = TREATMENTS.find(t => t.id === 'mechanical_ventilation');
                  if (ventTreatment) {
                    setTimeout(() => applyTreatment(ventTreatment), 0);
                  }
                  toast.success('Ventilator initiated', {
                    description: `${settings.mode} • Vt ${settings.tidalVolumeMl} mL • RR ${settings.respiratoryRate} • FiO2 ${settings.fio2Percent}% • PEEP ${settings.peepCmH2O}`,
                  });
                }}
                patientWeightKg={currentCase.patientInfo?.weight}
                context={
                  currentCase.subcategory?.includes('arrest') ? 'arrest' :
                  currentCase.subcategory?.includes('copd') ? 'copd' :
                  currentCase.subcategory?.includes('ards') || currentCase.title?.toLowerCase().includes('ards') ? 'ards' :
                  currentCase.category === 'pediatric' ? 'pediatric' : 'default'
                }
              />
            )}

            {/* Medical Control Dialog */}
            {currentCase && currentVitals && (
              <MedicalControlDialog
                open={showMedicalControl}
                onClose={() => setShowMedicalControl(false)}
                caseData={currentCase}
                currentVitals={currentVitals}
                appliedTreatmentIds={appliedTreatmentIds}
                isInArrest={patientState?.isInArrest ?? false}
              />
            )}

            {/* Medication Safety Confirmation Dialog */}
            {pendingMedConfirm && (
              <Dialog open={!!pendingMedConfirm} onOpenChange={(open) => { if (!open) setPendingMedConfirm(null); }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      Medication Safety Check
                    </DialogTitle>
                    <DialogDescription>
                      Confirm allergies and appropriateness before administering.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-sm font-semibold">{pendingMedConfirm.treatment.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{pendingMedConfirm.allergyText}</p>
                      {pendingMedConfirm.contraText && (
                        <p className="text-xs text-amber-600 mt-1">{pendingMedConfirm.contraText}</p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Have you checked allergies and confirmed this medication is appropriate?
                    </p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setPendingMedConfirm(null)}>Cancel</Button>
                    <Button onClick={() => {
                      const t = pendingMedConfirm.treatment;
                      medicationConfirmedRef.current.add(t.id);
                      setPendingMedConfirm(null);
                      applyTreatment(t);
                    }}>
                      Confirm &amp; Administer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* IV Access Prerequisite Dialog */}
            {pendingIVTreatment && (
              <Dialog open={!!pendingIVTreatment} onOpenChange={(open) => { if (!open) setPendingIVTreatment(null); }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-blue-600">
                      <AlertTriangle className="h-5 w-5" />
                      IV Access Required
                    </DialogTitle>
                    <DialogDescription>
                      IV access must be established before administering IV medications or fluids.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-sm font-semibold">{pendingIVTreatment.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This treatment requires intravenous access. You have not yet established an IV line.
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Do you want to set up an IV first?
                    </p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setPendingIVTreatment(null)}>Cancel</Button>
                    <Button onClick={() => {
                      const pendingTreatment = pendingIVTreatment;
                      setPendingIVTreatment(null);
                      // Find the iv_access treatment and apply it first
                      const ivAccessTreatment = TREATMENTS.find(t => t.id === 'iv_access');
                      if (ivAccessTreatment) {
                        applyTreatment(ivAccessTreatment);
                        // Then apply the originally intended treatment after a short delay
                        setTimeout(() => applyTreatment(pendingTreatment), 500);
                      }
                    }}>
                      Yes, Set Up IV
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                <div className={`mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl shadow-sm ring-4 ${
                  performanceMetrics.percentage >= 80
                    ? 'bg-green-600 ring-green-500/10'
                    : performanceMetrics.percentage >= 50
                    ? 'bg-amber-600 ring-amber-500/10'
                    : 'bg-red-600 ring-red-500/10'
                }`}>
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="heading-clean text-xl sm:text-2xl">Case Complete</h2>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate px-2">{getStudentCaseTitle(currentCase)}</p>
              </div>
            </div>

            {/* Overall Score */}
            <Card className="bg-card border border-border rounded-2xl border-primary/15 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none" />
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

            {/* AI-Style Narrative Debrief */}
            {narrativeReport && (
              <Card className={`bg-card border-2 rounded-2xl overflow-hidden ${
                narrativeReport.clinicalVerdict === 'excellent' ? 'border-green-500/40' :
                narrativeReport.clinicalVerdict === 'good' ? 'border-blue-500/40' :
                narrativeReport.clinicalVerdict === 'acceptable' ? 'border-amber-500/40' :
                'border-red-500/40'
              }`}>
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                      narrativeReport.clinicalVerdict === 'excellent' ? 'bg-green-500/15' :
                      narrativeReport.clinicalVerdict === 'good' ? 'bg-blue-500/15' :
                      narrativeReport.clinicalVerdict === 'acceptable' ? 'bg-amber-500/15' :
                      'bg-red-500/15'
                    }`}>
                      <Sparkles className={`h-3.5 w-3.5 ${
                        narrativeReport.clinicalVerdict === 'excellent' ? 'text-green-500' :
                        narrativeReport.clinicalVerdict === 'good' ? 'text-blue-500' :
                        narrativeReport.clinicalVerdict === 'acceptable' ? 'text-amber-500' :
                        'text-red-500'
                      }`} />
                    </div>
                    Clinical Debrief
                    <NarrationButton
                      size="sm"
                      label="Read debrief aloud"
                      role="narrator"
                      text={`${narrativeReport.summary} What went well: ${narrativeReport.whatWentWell.join('. ')}. Timing observations: ${narrativeReport.timingObservations.join('. ')}. Patterns to develop: ${narrativeReport.patternsToImprove.join('. ')}`}
                      className="ml-auto"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-sm">
                  {/* Summary paragraph */}
                  <p className="leading-relaxed text-foreground/90 italic">
                    {narrativeReport.summary}
                  </p>

                  {/* What went well */}
                  {narrativeReport.whatWentWell.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> What Went Well
                      </h4>
                      <ul className="space-y-1.5">
                        {narrativeReport.whatWentWell.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-xs sm:text-sm leading-relaxed">
                            <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                            <span className="text-foreground/85">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timing observations */}
                  {narrativeReport.timingObservations.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Timing Observations
                      </h4>
                      <ul className="space-y-1.5">
                        {narrativeReport.timingObservations.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-xs sm:text-sm leading-relaxed">
                            <span className="text-blue-500 shrink-0 mt-0.5">◆</span>
                            <span className="text-foreground/85">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Patterns to improve */}
                  {narrativeReport.patternsToImprove.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Patterns to Develop
                      </h4>
                      <ul className="space-y-1.5">
                        {narrativeReport.patternsToImprove.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-xs sm:text-sm leading-relaxed">
                            <span className="text-amber-500 shrink-0 mt-0.5">→</span>
                            <span className="text-foreground/85">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ED Outcome / Continuity of Care */}
            {edOutcome && (
              <Card className="bg-card border-2 border-indigo-500/30 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30 bg-indigo-500/5">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15">
                      <HeartPulse className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                    What Happened Next — ED Continuity
                    <NarrationButton
                      size="sm"
                      label="Read ED outcome aloud"
                      role="narrator"
                      text={`${edOutcome.edAssessment} ${edOutcome.confirmedDiagnosis}. Disposition: ${edOutcome.dispositionLabel}. 24-hour outcome: ${edOutcome.twentyFourHourOutcome}`}
                      className="ml-auto"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-sm">
                  {/* ED assessment */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">ED Physician's Note</h4>
                    <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed bg-muted/30 rounded-xl p-3 border border-border/30">
                      {edOutcome.edAssessment}
                    </p>
                  </div>

                  {/* Confirmed diagnosis */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Confirmed Diagnosis</h4>
                    <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                      <p className="text-xs sm:text-sm font-medium">{edOutcome.confirmedDiagnosis}</p>
                    </div>
                  </div>

                  {/* Your suspicion accuracy */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Your Working Diagnosis</h4>
                    <div className={`rounded-xl p-3 border ${
                      edOutcome.suspicionAccuracy === 'correct' ? 'bg-green-500/5 border-green-500/30' :
                      edOutcome.suspicionAccuracy === 'partial' ? 'bg-amber-500/5 border-amber-500/30' :
                      'bg-red-500/5 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[9px] ${
                          edOutcome.suspicionAccuracy === 'correct' ? 'bg-green-500' :
                          edOutcome.suspicionAccuracy === 'partial' ? 'bg-amber-500' :
                          'bg-red-500'
                        } text-white`}>
                          {edOutcome.suspicionAccuracy === 'correct' ? 'CORRECT' :
                           edOutcome.suspicionAccuracy === 'partial' ? 'PARTIAL' :
                           'INCORRECT'}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/85 leading-relaxed">{edOutcome.suspicionComment}</p>
                    </div>
                  </div>

                  {/* Pre-alert impact */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Pre-Alert Impact</h4>
                    <div className={`rounded-xl p-3 border ${
                      edOutcome.preAlertImpact === 'helpful' ? 'bg-green-500/5 border-green-500/30' :
                      edOutcome.preAlertImpact === 'neutral' ? 'bg-muted/30 border-border/30' :
                      'bg-amber-500/5 border-amber-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[9px] ${
                          edOutcome.preAlertImpact === 'helpful' ? 'bg-green-500' :
                          edOutcome.preAlertImpact === 'neutral' ? 'bg-gray-500' :
                          'bg-amber-500'
                        } text-white`}>
                          {edOutcome.preAlertImpact === 'helpful' ? 'HELPFUL' :
                           edOutcome.preAlertImpact === 'neutral' ? 'NEUTRAL' :
                           'MISSED OPPORTUNITY'}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/85 leading-relaxed">{edOutcome.preAlertComment}</p>
                    </div>
                  </div>

                  {/* ED treatment */}
                  {edOutcome.treatmentInED.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Treatment in ED</h4>
                      <ul className="space-y-1">
                        {edOutcome.treatmentInED.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-xs text-foreground/85">
                            <span className="text-indigo-500 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disposition */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Disposition</h4>
                    <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/30">
                      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{edOutcome.dispositionLabel}</p>
                    </div>
                  </div>

                  {/* 24-hour outcome */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">24-Hour Outcome</h4>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic bg-muted/30 rounded-xl p-3 border border-border/30">
                      {edOutcome.twentyFourHourOutcome}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Penalty Breakdown */}
            {performanceMetrics.penaltyTotal > 0 && (
              <Card className="bg-card border-2 border-orange-400 dark:border-orange-500/50 rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-sm text-orange-700 dark:text-orange-300">Score Penalties Applied</span>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base score</span>
                      <span className="font-medium">{performanceMetrics.basePercentage}%</span>
                    </div>
                    {performanceMetrics.penaltyReasons.map((reason: { label: string; amount: number }, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-orange-700 dark:text-orange-400">{reason.label}</span>
                        <span className="font-medium text-red-500">-{reason.amount}%</span>
                      </div>
                    ))}
                    <div className="border-t border-orange-300 dark:border-orange-700 pt-1.5 mt-1.5 flex justify-between font-bold">
                      <span>Adjusted score</span>
                      <span>{performanceMetrics.percentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transport & Clinical Decisions */}
            {transportDecisions && (
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
            <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <Card className="bg-card border border-border rounded-2xl overflow-hidden border-red-200 dark:border-red-800">
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
                <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
                <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
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
        {/* Hands-free voice command — visible only when running a live case.
            Student can tap the mic and say "check airway" / "blood glucose" /
            "examine chest" to trigger the same action as the on-screen button.
            Hidden on phases where assessment actions aren't meaningful. */}
        {(phase === 'case' || phase === 'vitals') && currentCase && (
          <VoiceCommandButton
            commands={voiceCommands}
            onCommand={handleVoiceCommand}
            lang={i18n.language === 'ar' ? 'ar-AE' : 'en-GB'}
            listeningLabel={t('voice.listening', { defaultValue: 'Listening' })}
            idleLabel={t('voice.talk', { defaultValue: 'Voice' })}
          />
        )}
      </main>
    </div>
  );
}

// Re-export for lazy loading
export default StudentPanel;
