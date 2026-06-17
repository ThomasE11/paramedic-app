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
  const priorityWord = dispatch?.priority
    ? (String(dispatch.priority).includes('1') ? 'priority one' : String(dispatch.priority).includes('2') ? 'priority two' : 'priority three')
    : 'priority one';

  // PUNCHY by design. The whole narration is synthesised in ONE continuous TTS
  // request (no inter-sentence gaps), and this server is ~50ms/char, so a short
  // script = a short wait before the seamless read. We speak just the priority
  // + the CORE call reason (mechanism/secondary clauses and location are
  // dropped from the audio — they're all shown on the brief card).
  const core = (dispatch?.callReason || '')
    .split(/,|\bafter\b|\bwhile\b|\bwhilst\b/i)[0]
    .replace(/[.!?]+$/, '')
    .trim();
  const parts: string[] = [`Control to responding unit, ${priorityWord}.`];
  if (core) parts.push(`${core}.`);
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
import { ensureCompleteVitals, buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { type Treatment, TREATMENTS } from '@/data/enhancedTreatmentEffects';
import {
  type PatientState,
  type DefibrillationParams,
  createInitialPatientState,
  applyDynamicTreatment,
  applyDeterioration,
} from '@/data/dynamicTreatmentEngine';
import {
  assessProtocolCompliance,
  findProtocol,
  determineSeverityFromVitals,
} from '@/data/treatmentProtocols';
import { checkRuntimeContraindications } from '@/lib/runtimeContraindications';
import { evaluateTreatmentRealism } from '@/lib/patientRealism';
import {
  buildReactionForTreatment,
  projectReactionVitals,
  isDefinitiveRescue,
  type AdverseReaction,
} from '@/data/adverseReactions';
import { computeSmartGrade } from '@/data/smartGrader';
import { useAuth } from '@/lib/auth';
import { saveStudentResult } from '@/lib/studentResults';
import { useGradualVitalChanges } from '@/hooks/useGradualVitalChanges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AmbientBackground } from '@/components/AmbientBackground';
import {
  Stethoscope, GraduationCap, Activity, Clock, ArrowLeft, ArrowRight,
  Sparkles, CheckCircle2, AlertTriangle, FileText, Loader2, BookOpen,
  Ambulance, XCircle, Heart, Shield, ChevronRight, BarChart3,
  ClipboardCheck, Star, TrendingUp, TrendingDown, Minus, ExternalLink,
  RotateCcw, Zap, Volume2, Phone, Thermometer, ChevronDown, ChevronUp,
  Wind, Droplets, Brain, Pill, Syringe, Search, Shuffle, Target,
  Flame, Baby, FlaskConical, ListChecks, HeartPulse, Gauge,
} from 'lucide-react';
import { toast } from 'sonner';
// AuscultationPanel removed — sounds now play inline from 3D Physical Examination
import { DebriefingResourcesPanel } from '@/components/DebriefingResourcesPanel';
import { SceneSurveyPanel, type SceneSurveyResult } from '@/components/SceneSurveyPanel';
import { VoiceHistoryPanel } from '@/components/VoiceHistoryPanel';
import { TreatmentJumpBagPanel, type ManagementTab } from '@/components/TreatmentJumpBagPanel';
import type { HistoryCategory } from '@/lib/historyTaking';
// InjuryMap retained for a future debrief/instructor summary — not shown in
// the student exam view (findings must be discovered, not listed up front).
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

type StudentPhase = 'select' | 'prebriefing' | 'scene-survey' | 'case' | 'vitals' | 'postcase';
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
    pacerState?: { active: boolean; rate: number; output: number };
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
    pacerState?: { active: boolean; rate: number; output: number };
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

interface TreatmentPracticalityContext {
  treatment: Treatment;
  currentVitals: VitalSigns;
  currentCase: CaseScenario;
  patientState: PatientState;
}

interface TreatmentChallenge {
  level: 'block' | 'challenge';
  title: string;
  clinicalReason: string;
  patientQuote?: string;
  proceedLabel?: string;
}

interface PendingTreatmentChallenge {
  treatment: Treatment;
  challenge: TreatmentChallenge;
  defibParams?: DefibrillationParams;
}

function getVitalGcsTotal(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value && typeof value === 'object' && 'total' in value) {
    const total = Number((value as { total?: unknown }).total);
    return Number.isFinite(total) ? total : null;
  }
  return null;
}

function getPatientGcsTotal(currentVitals: VitalSigns, currentCase: CaseScenario, patientState: PatientState): number {
  return getVitalGcsTotal(currentVitals.gcs)
    ?? getVitalGcsTotal(patientState.vitals?.gcs)
    ?? getVitalGcsTotal(currentCase.abcde?.disability?.gcs)
    ?? getVitalGcsTotal(currentCase.vitalSignsProgression?.initial?.gcs)
    ?? 15;
}

function getCaseClinicalText(caseData: CaseScenario): string {
  return [
    caseData.title,
    caseData.dispatchInfo?.callReason,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.position,
    caseData.abcde?.airway?.patent === false ? 'airway not patent' : '',
    ...(caseData.abcde?.airway?.findings ?? []),
    ...(caseData.abcde?.breathing?.findings ?? []),
    ...(caseData.abcde?.disability?.findings ?? []),
    ...(caseData.expectedFindings?.keyObservations ?? []),
    ...(caseData.secondarySurvey?.face ?? []),
    ...(caseData.secondarySurvey?.chest ?? []),
  ].filter(Boolean).join(' ').toLowerCase();
}

function canPatientVocalize(currentVitals: VitalSigns, currentCase: CaseScenario, patientState: PatientState): boolean {
  if (patientState.isInArrest) return false;
  const gcs = getPatientGcsTotal(currentVitals, currentCase, patientState);
  const rr = currentVitals.respiration ?? patientState.vitals?.respiration ?? 0;
  const text = getCaseClinicalText(currentCase);
  if (gcs < 13 || rr <= 0) return false;
  if (/(unconscious|unresponsive|obtunded|seizing|actively seizing|agonal|apnoeic|apneic|cardiac arrest|unable to speak)/.test(text)) return false;
  return true;
}

function hasAirwayCompromise(currentVitals: VitalSigns, currentCase: CaseScenario, patientState: PatientState): boolean {
  const text = getCaseClinicalText(currentCase);
  const rr = currentVitals.respiration ?? patientState.vitals?.respiration ?? 0;
  const spo2 = currentVitals.spo2 ?? patientState.vitals?.spo2 ?? 100;
  return currentCase.abcde?.airway?.patent === false
    || rr <= 8
    || spo2 < 90
    || /(stridor|gurgling|snoring|obstruct|vomit|secretions|foreign body|airway compromise|unable to protect airway|silent chest|cyanosis|apnoeic|apneic|agonal)/.test(text);
}

function assessTreatmentPracticality({
  treatment,
  currentVitals,
  currentCase,
  patientState,
}: TreatmentPracticalityContext): TreatmentChallenge | null {
  const id = treatment.id;
  const gcs = getPatientGcsTotal(currentVitals, currentCase, patientState);
  const rr = currentVitals.respiration ?? patientState.vitals?.respiration ?? 0;
  const spo2 = currentVitals.spo2 ?? patientState.vitals?.spo2 ?? 100;
  const text = getCaseClinicalText(currentCase);
  const vocal = canPatientVocalize(currentVitals, currentCase, patientState);
  const airwayCompromise = hasAirwayCompromise(currentVitals, currentCase, patientState);
  const respiratoryDistress = spo2 < 94 || rr >= 26 || /severe distress|accessory|tripod|wheeze|cyanosis|pulmonary oedema|pulmonary edema/.test(text);

  if (id === 'opa_insert' && !patientState.isInArrest && (gcs > 8 || vocal)) {
    return {
      level: 'block',
      title: 'Patient rejects OPA',
      clinicalReason: 'The patient appears conscious enough to have a gag reflex. An oropharyngeal airway is for an unconscious patient without a gag reflex.',
      patientQuote: vocal ? 'No, stop. That is making me gag.' : undefined,
    };
  }

  if ((id === 'intubation' || id === 'rsi_intubation') && !patientState.isInArrest && gcs > 8 && !airwayCompromise) {
    return {
      level: 'block',
      title: 'Airway escalation not justified',
      clinicalReason: 'This patient is not showing a current airway failure or GCS threshold for intubation. Escalate only if they cannot protect the airway, cannot oxygenate/ventilate, or deteriorate.',
      patientQuote: vocal ? 'Wait, I can breathe. What are you doing?' : undefined,
    };
  }

  if (id === 'bvm_ventilation' && vocal && rr >= 10 && spo2 >= 90 && !airwayCompromise) {
    return {
      level: 'block',
      title: 'Patient fights the BVM',
      clinicalReason: 'An awake, talking patient with spontaneous ventilation will not tolerate bag-mask ventilation. Coach breathing, apply appropriate oxygen, and reassess.',
      patientQuote: 'I am breathing. Please do not put that over my face.',
    };
  }

  if (id === 'cpap_niv' && !patientState.isInArrest && (gcs <= 8 || /vomit|facial trauma|unconscious|unresponsive/.test(text))) {
    return {
      level: 'block',
      title: 'CPAP unsafe',
      clinicalReason: 'Non-invasive ventilation requires a cooperative patient who can protect their airway. Reduced consciousness, vomiting, or facial trauma makes CPAP unsafe.',
      patientQuote: vocal ? 'I cannot tolerate that mask.' : undefined,
    };
  }

  if (id === 'cpap_niv' && vocal && !respiratoryDistress) {
    return {
      level: 'challenge',
      title: 'Question CPAP indication',
      clinicalReason: 'The patient is speaking and does not currently look like they need positive-pressure support. CPAP is usually reserved for significant respiratory distress, pulmonary oedema, COPD, or persistent hypoxia.',
      patientQuote: 'Do I really need that tight mask?',
      proceedLabel: 'Apply CPAP anyway',
    };
  }

  if (id === 'oxygen_nonrebreather' && vocal && spo2 >= 94 && !respiratoryDistress) {
    return {
      level: 'challenge',
      title: 'High-flow oxygen may be excessive',
      clinicalReason: 'SpO2 is already acceptable and the patient is able to speak. Consider titrated oxygen or no oxygen unless clinical context demands high-flow therapy.',
      patientQuote: 'Why do I need the big mask? I can talk to you.',
      proceedLabel: 'Use high-flow anyway',
    };
  }

  if (id === 'suction' && vocal && !/(secretions|vomit|blood in airway|gurgling|foreign body)/.test(text)) {
    return {
      level: 'challenge',
      title: 'No obvious suction target',
      clinicalReason: 'The patient is speaking and there is no documented blood, vomit, gurgling, or secretions. Suction may distress them without benefit.',
      patientQuote: 'No, please do not put that in my mouth.',
      proceedLabel: 'Suction anyway',
    };
  }

  return null;
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
  const { speak: speakNarration, isSpeaking: isDispatchSpeaking, stop: stopNarration } = useVoiceNarration();

  // Medical control dialog
  const [showMedicalControl, setShowMedicalControl] = useState(false);

  // Core state
  const [phase, _setPhase] = useState<StudentPhase>('select');
  const [phaseHistory, setPhaseHistory] = useState<StudentPhase[]>([]);
  // Scene survey result — captured pre-arrival, surfaced in the debrief so
  // students can see whether they verbalised safety, picked appropriate PPE,
  // and formed an early impression. Reset when a new case loads.
  const [sceneSurvey, setSceneSurvey] = useState<SceneSurveyResult | null>(null);

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
  // Live mirror of currentVitals for reading inside timer callbacks (which
  // would otherwise capture a stale value).
  const currentVitalsRef = useRef<VitalSigns | null>(null);
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
  const bvmVentilationRateRef = useRef<number | null>(null);
  const [showBvmRateDialog, setShowBvmRateDialog] = useState(false);
  const [pendingBvmTreatment, setPendingBvmTreatment] = useState<Treatment | null>(null);
  // LUCAS prompt — offered ONCE when CPR has been running for ≥4 min and
  // no LUCAS has been applied yet. Tracked here so it can't re-nag.
  const [lucasPromptShown, setLucasPromptShown] = useState(false);
  // Medication safety confirmation (replaces window.confirm which auto-dismisses on re-render)
  const [pendingMedConfirm, setPendingMedConfirm] = useState<{ treatment: Treatment; allergyText: string; contraText: string } | null>(null);
  const [pendingTreatmentChallenge, setPendingTreatmentChallenge] = useState<PendingTreatmentChallenge | null>(null);
  const [pendingIVTreatment, setPendingIVTreatment] = useState<Treatment | null>(null);
  const deteriorationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const medicationConfirmedRef = useRef<Set<string>>(new Set());
  const treatmentChallengeConfirmedRef = useRef<Set<string>>(new Set());

  // ── Adverse drug reaction (allergy) cascade ──────────────────────────────
  // Set when the student administers a drug the patient is allergic to.
  // `activeReaction` drives the on-screen banner; the refs let timer callbacks
  // and applyTreatment read the live state without stale closures.
  const [activeReaction, setActiveReaction] = useState<AdverseReaction | null>(null);
  const activeReactionRef = useRef<AdverseReaction | null>(null);
  const reactionTimersRef = useRef<number[]>([]);
  // One record per allergen administered — consumed by the grader (per-case).
  const adverseEventsRef = useRef<Array<{
    reactionId: string; treatmentId: string; treatmentName: string;
    kind: AdverseReaction['kind']; allergy: string;
    administeredAt: number; recognizedRescueAt: number | null; reachedArrest: boolean;
  }>>([]);

  // Optional signed-in account (magic link) — used to persist graded results.
  const auth = useAuth();
  const savedResultRef = useRef(false);

  // Assessment tracking
  const [assessmentTracker, setAssessmentTracker] = useState<AssessmentTracker | null>(null);
  const [activeFindings, setActiveFindings] = useState<{ stepId: AssessmentStepId; findings: AssessmentFinding[] } | null>(null);
  const [monitorRevealedVitals, setMonitorRevealedVitals] = useState<Set<string>>(new Set());

  // Scene time warnings & coaching
  const [sceneTimeWarnings, setSceneTimeWarnings] = useState<Set<string>>(new Set());
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    bvmVentilationRateRef.current = bvmVentilationRate;
  }, [bvmVentilationRate]);
  const [hintVisible, setHintVisible] = useState(false);
  const [currentHint, setCurrentHint] = useState<string>('');

  // Scene toggle & ABCDE row states
  const [showScene, setShowScene] = useState(false);
  const [activePrimarySurvey, setActivePrimarySurvey] = useState<'scene-safety' | 'airway' | 'breathing' | 'circulation' | 'disability' | 'exposure' | null>(null);
  const [activeHistoryStep, setActiveHistoryStep] = useState<'signs-symptoms' | 'allergies' | 'medications' | 'past-medical' | 'last-meal' | 'events-leading' | null>(null);
  const [activeManagementTab, setActiveManagementTab] = useState<ManagementTab>('airway');
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
  // Pulse check — now triggered by tapping the carotid (neck) / radial (wrist)
  // points on the mannequin. 5s palpation delay; present iff a perfusing pulse
  // exists and the patient isn't in arrest. Feeds the arrest-confirm prompt.
  const runPulseCheck = useCallback((site?: string) => {
    if (pulseCheckInProgress) return;
    setPulseCheckInProgress(true);
    setPulseCheckResult(null);
    lastActivityRef.current = Date.now();
    const where = site === 'pulse-carotid' ? 'carotid' : site === 'pulse-radial' ? 'radial' : 'central';
    setTimeout(() => {
      const hasPulse = !!currentVitals && currentVitals.pulse > 0 && !(patientState?.isInArrest);
      setPulseCheckResult(hasPulse ? 'present' : 'absent');
      setPulseCheckInProgress(false);
      if (!hasPulse) {
        toast.error('No pulse detected', {
          description: `No ${where} pulse palpable — patient is pulseless. Consider the cardiac arrest protocol.`,
          duration: 8000,
        });
      } else {
        toast.success('Pulse present', {
          description: `${where.charAt(0).toUpperCase()}${where.slice(1)} pulse palpable — rate approximately ${currentVitals?.pulse || '?'} bpm.`,
          duration: 5000,
        });
      }
    }, 5000);
  }, [pulseCheckInProgress, currentVitals, patientState]);
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

  // CPR Metronome — Web Audio API beep at 110 bpm (100-120 range)
  const metronomeRef = useRef<{
    audioCtx: AudioContext | null;
    intervalId: ReturnType<typeof setInterval> | null;
    isRunning: boolean;
  }>({ audioCtx: null, intervalId: null, isRunning: false });

  const startMetronome = useCallback(() => {
    if (metronomeRef.current.isRunning) return;
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    metronomeRef.current.audioCtx = audioCtx;
    metronomeRef.current.isRunning = true;

    const bpm = 110; // Target middle of 100-120 range
    const intervalMs = 60000 / bpm;

    const playBeep = () => {
      if (!metronomeRef.current.isRunning) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.value = 800; // Hz — audible tick
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.05);
    };

    playBeep(); // First beat immediately
    metronomeRef.current.intervalId = setInterval(playBeep, intervalMs);
  }, []);

  const stopMetronome = useCallback(() => {
    if (metronomeRef.current.intervalId) {
      clearInterval(metronomeRef.current.intervalId);
      metronomeRef.current.intervalId = null;
    }
    if (metronomeRef.current.audioCtx) {
      metronomeRef.current.audioCtx.close();
      metronomeRef.current.audioCtx = null;
    }
    metronomeRef.current.isRunning = false;
  }, []);

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

  // Keep refs in step with state so timer callbacks read live values.
  useEffect(() => { currentVitalsRef.current = currentVitals; }, [currentVitals]);
  useEffect(() => { activeReactionRef.current = activeReaction; }, [activeReaction]);

  // Timer effect
  useEffect(() => {
    if (!caseStartTime || caseEndTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - caseStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [caseStartTime, caseEndTime]);

  // CPR Metronome — start/stop with CPR state
  useEffect(() => {
    if (cprRunning && arrestActive) {
      startMetronome();
      toast.info('CPR Metronome started', {
        description: '110 bpm — Follow the beep for optimal compression rate',
        icon: <Activity className="h-4 w-4" />,
        duration: 3000,
      });
    } else {
      stopMetronome();
    }
    return () => stopMetronome();
  }, [cprRunning, arrestActive, startMetronome, stopMetronome]);

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
      reactionTimersRef.current.forEach(id => window.clearTimeout(id));
      reactionTimersRef.current = [];
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
    stopNarration();
    setCurrentCase(newCase);
    const initialVitals = buildInitialVitalsFromCase(newCase);
    setCurrentVitals(initialVitals);
    setVitalsHistory([initialVitals]);
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    medicationConfirmedRef.current = new Set();
    treatmentChallengeConfirmedRef.current = new Set();
    setPendingTreatmentChallenge(null);
    setCaseStartTime(null);
    setCaseEndTime(null);
    setElapsedSeconds(0);
    setSceneTimeWarnings(new Set());
    setSceneSurvey(null);
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

    // Clear any adverse reaction carried over from a previous case
    reactionTimersRef.current.forEach(id => window.clearTimeout(id));
    reactionTimersRef.current = [];
    activeReactionRef.current = null;
    setActiveReaction(null);
    adverseEventsRef.current = [];

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
  }, [selectedYear, setPhase, stopNarration]);

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

  // Auto-play the dispatch radio call when a new case lands in Pre-Brief.
  // This mirrors the real workflow: the radio crackles to life on the way
  // to scene, the crew listens, then decides their approach — they don't
  // hear dispatch info for the first time after stepping out of the truck.
  // Keyed on the case ID so each new case fires exactly once (re-entering
  // Pre-Brief for the same case won't re-trigger it).
  const dispatchPlayedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentCase) return;
    if (phase !== 'prebriefing') return;
    if (dispatchPlayedForRef.current === currentCase.id) return;
    dispatchPlayedForRef.current = currentCase.id;
    const t = setTimeout(() => {
      speakNarration(buildDispatchNarration(currentCase), { role: 'dispatcher' });
    }, 600);
    return () => clearTimeout(t);
    // speakNarration intentionally omitted — its identity is stable and
    // including it would re-fire when the hook re-rendered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCase, phase]);

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

  // Start case (from pre-briefing) — routes to Scene Survey first.
  // The timer doesn't start yet; scene survey is "pre-arrival" and
  // shouldn't eat into the student's case time.
  const startCase = useCallback(() => {
    if (readOnly) return;
    stopNarration();
    setPhase('scene-survey');
  }, [readOnly, setPhase, stopNarration]);

  // Enter the scene (from scene survey) — this is where the real case
  // clock starts and deterioration begins ticking. The dispatch radio
  // call no longer plays here — it's been moved upstream to fire once
  // when the case first lands in Pre-Brief (see the useEffect below)
  // so the workflow matches reality: dispatch arrives → review → scene
  // survey → on-scene. Called by SceneSurveyPanel.onComplete.
  const enterScene = useCallback(() => {
    if (readOnly) return;
    stopNarration();
    const startedAt = Date.now();
    setCaseStartTime(startedAt);
    lastActivityRef.current = startedAt;

    // The scene survey happens before the live-case clock starts, so routing
    // it through handlePerformAssessment would silently discard it while
    // caseStartTime is still null. Credit the completed survey at time zero.
    if (assessmentTrackerRef.current && currentCase) {
      const { tracker: updatedTracker } = performAssessmentStep(
        assessmentTrackerRef.current,
        'scene-safety',
        currentCase,
        startedAt,
      );
      assessmentTrackerRef.current = updatedTracker;
      setAssessmentTracker(updatedTracker);
    }

    setPhase('vitals');
    toast.success('Case started — begin your assessment', { duration: 3000 });

    // Start deterioration timer — patient deteriorates if not treated
    if (deteriorationIntervalRef.current) clearInterval(deteriorationIntervalRef.current);
    deteriorationIntervalRef.current = setInterval(() => {
      setPatientState(prev => {
        if (!prev || !currentCase) return prev;
        if (activeReactionRef.current) return prev; // reaction owns vitals — pause deterioration
        const newState = applyDeterioration(prev, currentCase, 30);
        if (newState.vitals.spo2 !== prev.vitals.spo2 || newState.vitals.pulse !== prev.vitals.pulse) {
          setCurrentVitals(ensureCompleteVitals(newState.vitals));
        }
        return newState;
      });
    }, 30000); // Check every 30 seconds
    // readOnly in deps so hand-off to a student rebuilds the callback
    // with readOnly=false; otherwise the student-as-driver can't actually
    // start the case (silent `if (readOnly) return;` hit from stale
    // closure).
  }, [currentCase, readOnly, setPhase, stopNarration]);

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
        if (activeReactionRef.current) return prev; // adverse reaction owns the monitor
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
          // Force override any existing BP to realistic CPR values.
          const bpStr = String(v.bp ?? '120/80');
          const [sys] = bpStr.split('/').map(x => parseInt(x, 10));
          if (!sys || sys > 75) {
            v.bp = '60/40';
            changed = true;
          }
        }

        // Assisted ventilation rate — surface the student-set rate on the
        // monitor while ventilation is active. A patient on a mechanical
        // ventilator (paralysed / heavily sedated) has an RR dictated by
        // the ventilator — the monitor should read that rate, not the
        // patient's own drive. For BVM, the ventilator-provided rate is
        // what the monitor sees since the provider is setting the cadence.
        // Previously this gate was `v.respiration === 0`, so once the
        // patient regained any spontaneous drive post-ROSC the monitor
        // showed the intrinsic rate and the student had no way to see
        // whether their set ventilator rate had been accepted.
        const onVentilator = appliedTreatmentIds.includes('mechanical_ventilation') && !!ventilatorSettings;
        const onBvm = appliedTreatmentIds.includes('bvm_ventilation') && !!bvmVentilationRate;
        const ventRate =
          (onVentilator ? ventilatorSettings!.respiratoryRate : null) ??
          (onBvm ? bvmVentilationRate : null);
        if (ventRate && ventRate > 0 && (onVentilator || onBvm)) {
          if (v.respiration !== ventRate) {
            v.respiration = ventRate;
            changed = true;
          }
        }

        // EtCO2 physiology driven by minute ventilation. Target EtCO2
        // range is 35–45 mmHg. Minute volume = TV × RR. Inadequate MV
        // → CO2 climbs (hypercapnia); over-ventilation → CO2 falls
        // (hypocapnia — reduces cerebral perfusion, bad post-arrest).
        // Previously EtCO2 was set once by the treatment's static
        // effect and never moved, so students saw it stuck low forever
        // despite normalised ventilation.
        const weightKg = currentCase?.patientInfo?.weight ?? 70;
        const targetMv = weightKg * 0.1; // ≈100 mL/kg/min
        let providedMv: number | null = null;
        if (onVentilator) {
          providedMv = (ventilatorSettings!.tidalVolumeMl / 1000) * ventilatorSettings!.respiratoryRate;
        } else if (onBvm) {
          // Adult BVM squeeze ≈500 mL; paediatric ≈250 mL if weight<30kg.
          const assumedTvLitres = weightKg < 30 ? 0.25 : 0.5;
          providedMv = assumedTvLitres * bvmVentilationRate!;
        }
        if (providedMv != null) {
          const currentEtco2 = v.etco2 ?? 35;
          // Ratio of delivered MV to target MV predicts EtCO2 steady state.
          // Over-ventilated patient drifts EtCO2 toward 25; under-ventilated
          // drifts toward 55. Tick moves EtCO2 one step per second toward
          // the predicted steady state.
          const ratio = providedMv / targetMv;
          const targetEtco2 = ratio >= 1.5 ? 25
            : ratio >= 1.1 ? 32
            : ratio >= 0.85 ? 40
            : ratio >= 0.6 ? 50
            : 60;
          if (Math.abs(currentEtco2 - targetEtco2) > 0.5) {
            const step = currentEtco2 < targetEtco2 ? 1 : -1;
            v.etco2 = Math.max(15, Math.min(80, currentEtco2 + step));
            changed = true;
          }
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
  // ── Adverse reaction cascade helpers ─────────────────────────────────────
  // Administering an allergen kicks off a time-evolving reaction. We reuse the
  // existing vitals animation (startGradualChange → animatedVitals → monitor),
  // pause deterioration/continuous-O2 while it runs (guards above), and — for
  // anaphylaxis left untreated — escalate into the normal arrest workflow.
  // In a classroom session the vitals + arrest mirrors broadcast it to
  // spectators automatically, so students watching see the same cascade.
  const clearReactionTimers = useCallback(() => {
    reactionTimersRef.current.forEach(id => window.clearTimeout(id));
    reactionTimersRef.current = [];
  }, []);

  const triggerAdverseReaction = useCallback((reaction: AdverseReaction) => {
    clearReactionTimers();
    activeReactionRef.current = reaction;
    setActiveReaction(reaction);
    adverseEventsRef.current.push({
      reactionId: reaction.id,
      treatmentId: reaction.treatmentId,
      treatmentName: reaction.treatmentName,
      kind: reaction.kind,
      allergy: reaction.match.allergy,
      administeredAt: Date.now(),
      recognizedRescueAt: null,
      reachedArrest: false,
    });

    toast.error(reaction.headline, {
      description: `${reaction.findings.onset[0]}. Recognise it and treat — IM adrenaline is the priority.`,
      duration: 10000,
    });

    const animateTo = (stage: 'onset' | 'peak' | 'arrest') => {
      const from = currentVitalsRef.current;
      if (!from) return;
      const target = ensureCompleteVitals(projectReactionVitals(from, reaction.kind, stage));
      setPreviousVitals(from);
      if (startGradualChange) startGradualChange(from, target, 3000);
      else setCurrentVitals(target);
    };

    // Onset → peak → (if untreated) peri-arrest.
    reactionTimersRef.current.push(window.setTimeout(() => animateTo('onset'), reaction.onsetMs));
    reactionTimersRef.current.push(window.setTimeout(() => {
      if (!activeReactionRef.current) return;
      animateTo('peak');
      toast.error('Reaction worsening', {
        description: reaction.findings.peak.slice(0, 2).join('. '),
        duration: 8000,
      });
    }, reaction.onsetMs + 8000));

    if (reaction.canProgressToArrest) {
      reactionTimersRef.current.push(window.setTimeout(() => {
        if (!activeReactionRef.current) return; // rescued in time
        animateTo('arrest');
        setPatientState(prev => prev ? { ...prev, isInArrest: true, currentRhythm: 'PEA' } : prev);
        setArrestConfirmed(true);
        const ev = adverseEventsRef.current.find(e => e.reactionId === reaction.id);
        if (ev) ev.reachedArrest = true;
        toast.error('CARDIAC ARREST — untreated anaphylaxis', {
          description: 'PEA arrest. Begin CPR, adrenaline 1mg IV, IV fluids, treat the cause.',
          duration: 12000,
        });
      }, reaction.escalateMs));
    }
  }, [clearReactionTimers, startGradualChange]);

  const resolveAdverseReaction = useCallback(() => {
    const reaction = activeReactionRef.current;
    if (!reaction) return;
    clearReactionTimers();
    activeReactionRef.current = null;
    setActiveReaction(null);
    const ev = adverseEventsRef.current.find(e => e.reactionId === reaction.id && e.recognizedRescueAt == null);
    if (ev) ev.recognizedRescueAt = Date.now();

    // Adrenaline reverses it — animate recovery and stand down any arrest.
    const from = currentVitalsRef.current;
    const recovered = from ? ensureCompleteVitals(projectReactionVitals(from, reaction.kind, 'recovery')) : null;
    if (from && recovered) {
      setPreviousVitals(from);
      if (startGradualChange) startGradualChange(from, recovered, 6000);
      else setCurrentVitals(recovered);
    }
    // Clear the arrest AND restore a perfusing rhythm + synced pulse. The
    // monitor forces HR 0 for any 'arrest'-category rhythm (PEA/asystole)
    // even after ROSC — so if we only flip isInArrest the monitor keeps
    // showing HR 0 while a pulse is present. Move the rhythm back to a
    // perfusing one and sync patientState.vitals to the recovered values.
    setPatientState(prev => {
      if (!prev) return prev;
      const wasArrestRhythm = prev.isInArrest
        || prev.currentRhythm === 'PEA'
        || prev.currentRhythm === 'Asystole';
      return {
        ...prev,
        isInArrest: false,
        currentRhythm: wasArrestRhythm ? 'Sinus Tachycardia' : prev.currentRhythm,
        vitals: recovered ? { ...prev.vitals, ...recovered } : prev.vitals,
      };
    });
    setArrestConfirmed(false);

    toast.success('Anaphylaxis treated — adrenaline working', {
      description: 'BP and SpO2 recovering. Continue high-flow O2 and IV fluids; add chlorphenamine + hydrocortisone. Reassess.',
      duration: 7000,
    });
  }, [clearReactionTimers, startGradualChange]);

  const applyTreatment = useCallback((treatment: Treatment, defibParams?: DefibrillationParams) => {
    if (readOnly) {
      toast.info('You are watching — the driver is treating this case.', { duration: 1800 });
      return;
    }
    if (!currentVitals || !currentCase || !patientState) return;
    lastActivityRef.current = Date.now();
    setHintVisible(false);

    // Active anaphylaxis + adrenaline = the rescue. Resolve the reaction
    // (animate recovery, stand down any arrest) instead of the normal effect.
    if (activeReactionRef.current && isDefinitiveRescue(treatment.id)) {
      setAppliedTreatments(prev => [...prev, {
        id: treatment.id, name: treatment.name,
        description: `${treatment.name} — anaphylaxis rescue`,
        appliedAt: new Date().toISOString(), effects: [],
        category: treatment.category, isActive: true,
      }]);
      setAppliedTreatmentIds(prev => prev.includes(treatment.id) ? prev : [...prev, treatment.id]);
      resolveAdverseReaction();
      return;
    }

    const practicalChallenge = assessTreatmentPracticality({
      treatment,
      currentVitals,
      currentCase,
      patientState,
    });
    if (practicalChallenge && !treatmentChallengeConfirmedRef.current.has(treatment.id)) {
      if (practicalChallenge.patientQuote) {
        speakNarration(practicalChallenge.patientQuote, { role: 'patient' });
      }
      if (practicalChallenge.level === 'block') {
        toast.error(practicalChallenge.title, {
          description: practicalChallenge.clinicalReason,
          duration: 8000,
        });
        return;
      }
      setPendingTreatmentChallenge({ treatment, challenge: practicalChallenge, defibParams });
      return;
    }

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
    //
    // The dialog is reusable: clicking mechanical_ventilation again
    // opens it with the current settings so the student can adjust
    // FiO2 / PEEP / RR / TV without tearing down and re-intubating.
    if (treatment.id === 'mechanical_ventilation') {
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
    // Re-clicking bvm_ventilation reopens the rate dialog so the student
    // can change the rate (e.g. switching from 10/min CPR-sync to 12/min
    // normoventilation post-ROSC).
    if (treatment.id === 'bvm_ventilation' && bvmVentilationRateRef.current == null) {
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

    // Allergy violation — giving a drug the patient is allergic to triggers a
    // real, time-evolving adverse reaction instead of the therapeutic effect.
    const reaction = buildReactionForTreatment(treatment, {
      vitals: currentVitals,
      allergies: currentCase.history?.allergies,
    });
    if (reaction) {
      setAppliedTreatments(prev => [...prev, {
        id: treatment.id, name: treatment.name,
        description: `${treatment.name} — administered despite documented allergy`,
        appliedAt: new Date().toISOString(), effects: [],
        category: treatment.category, isActive: true,
      }]);
      setAppliedTreatmentIds(prev => prev.includes(treatment.id) ? prev : [...prev, treatment.id]);
      triggerAdverseReaction(reaction);
      return; // an allergen provides no therapeutic benefit
    }

    setApplyingTreatmentId(treatment.id);

    // Use dynamic treatment engine
    const { newState, response } = applyDynamicTreatment(
      treatment,
      patientState,
      currentCase,
      defibParams,
    );
    const realismResponse = evaluateTreatmentRealism({
      treatment,
      caseData: currentCase,
      vitals: currentVitals,
      appliedTreatmentIds,
    });
    if (realismResponse.patientQuote) {
      speakNarration(realismResponse.patientQuote, { role: 'patient' });
    }

    // Update patient state
    setPatientState(newState);

    // Build applied treatment record
    const newTreatment: AppliedTreatment = {
      id: treatment.id,
      name: treatment.name,
      description: `${response.description}${realismResponse.debriefNote ? ` — ${realismResponse.debriefNote}` : ''}`,
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
    } else if (realismResponse.status === 'harmful') {
      toast.error(realismResponse.title, {
        description: realismResponse.clinicalFeedback,
        duration: 8500,
      });
    } else if (realismResponse.status === 'mismatch' || response.warningMessage) {
      toast.warning(realismResponse.status === 'mismatch' ? realismResponse.title : `${treatment.name} applied`, {
        description: realismResponse.status === 'mismatch'
          ? realismResponse.clinicalFeedback
          : 'Monitor the patient to assess response.',
        duration: 6500,
      });
    } else if (realismResponse.status === 'partial' || response.isPartialResponse) {
      toast.info(realismResponse.status === 'partial' ? realismResponse.title : `${treatment.name} applied`, {
        description: realismResponse.status === 'partial'
          ? realismResponse.clinicalFeedback
          : 'Monitor the patient — reassess vitals to evaluate response.',
        duration: 5200,
      });
    } else if (realismResponse.status === 'matched') {
      toast.success(realismResponse.title, {
        description: realismResponse.clinicalFeedback,
        duration: 4500,
      });
    } else {
      toast.success(`Applied: ${treatment.name}`, {
        description: studentDesc.includes('applied') ? 'Treatment applied. Monitor the patient.' : studentDesc || 'Treatment applied. Monitor the patient.',
        duration: 3000,
      });
    }

    // Track arrest-specific drug timing
    if (arrestActive) {
      const adrenalineIds = ['adrenaline_1mg', 'adrenaline_im', 'adrenaline_im_child', 'adrenaline_im_older', 'adrenaline_im_infant', 'adrenaline_infusion'];
      if (adrenalineIds.includes(treatment.id)) {
        setLastAdrenalineTime(Date.now());
        setAdrenalineDoses(prev => prev + 1);
        const doseLabel = treatment.id === 'adrenaline_im_child' ? '0.15mg IM' :
                         treatment.id === 'adrenaline_im_older' ? '0.3mg IM' :
                         treatment.id === 'adrenaline_im_infant' ? '0.1mg IM' :
                         treatment.id === 'adrenaline_im' ? '0.5mg IM' :
                         treatment.id === 'adrenaline_infusion' ? 'infusion' : '1mg IV';
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: `Adrenaline ${doseLabel} (dose #${adrenalineDoses + 1})`, type: 'drug' }]);
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
      if (!adrenalineIds.includes(treatment.id) && !['amiodarone_300mg', 'amiodarone_150mg', 'defibrillation', 'lucas_device'].includes(treatment.id)) {
        setArrestTimeline(prev => [...prev, { time: Date.now(), event: `${treatment.name} applied`, type: 'treatment' }]);
      }
    }
    // readOnly must be in deps — when control is handed to this student
    // the callback needs to be rebuilt so applyTreatment can actually run
    // instead of hitting the stale "you are watching" toast branch.
	  }, [currentVitals, currentCase, patientState, startGradualChange, arrestActive, adrenalineDoses, shockCount, readOnly, triggerAdverseReaction, resolveAdverseReaction, speakNarration, appliedTreatmentIds]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCase, caseStartTime, readOnly, monitorRevealedVitals]); // assessmentTracker read via ref — always current. readOnly MUST stay in deps so handing control to a student rebuilds this callback with readOnly=false; otherwise every click silently hits the "you are watching" toast from the stale closure.

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

  // End case — show transport decision wizard from step 1.
  // readOnly in deps so hand-off to a student rebuilds the callback.
  const endCase = useCallback((_action: 'transport' | 'end') => {
    if (readOnly) return;
    setTransportStep(1);
    setShowTransportDecision(true);
  }, [readOnly]);

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
  }, [setPhase]);

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

    const initialVitalsForRealism = buildInitialVitalsFromCase(currentCase);
    const uniqueAppliedTreatmentIds = [...new Set(appliedTreatments.map(t => t.id))];
    const treatmentRealism = uniqueAppliedTreatmentIds.flatMap(id => {
      const treatment = TREATMENTS.find(item => item.id === id);
      if (!treatment) return [];
      return [{
        treatment,
        result: evaluateTreatmentRealism({
          treatment,
          caseData: currentCase,
          vitals: initialVitalsForRealism,
          appliedTreatmentIds: uniqueAppliedTreatmentIds,
        }),
      }];
    });
    const mismatchTreatments = treatmentRealism.filter(item => item.result.status === 'mismatch');
    const harmfulTreatments = treatmentRealism.filter(item => item.result.status === 'harmful');
    const bonusEligibleTreatmentCount = treatmentRealism.filter(
      item => item.result.status !== 'mismatch' && item.result.status !== 'harmful',
    ).length;

    // Treatment bonus: protocol-covered cases reward completion of the
    // condition/severity pathway, not the raw number of things applied. This
    // prevents the scoring model from nudging students into unnecessary care
    // just to fill a treatment-count quota. Cases without a protocol retain the
    // conservative appropriate-treatment fallback.
    const treatmentBonusCap = Math.round(assessmentTotal * 0.3);
    let treatmentBonus = 0;
    const matchedProtocol = findProtocol(currentCase.subcategory || '', currentCase.category || '');
    const protocolSeverity = matchedProtocol
      ? determineSeverityFromVitals(matchedProtocol, initialVitalsForRealism)
      : null;
    if (protocolSeverity) {
      const protocolCompliance = assessProtocolCompliance(protocolSeverity, uniqueAppliedTreatmentIds);
      treatmentBonus = Math.round(treatmentBonusCap * (protocolCompliance.completionPercent / 100));
    } else if (bonusEligibleTreatmentCount > 0) {
      treatmentBonus = Math.min(bonusEligibleTreatmentCount * 5, treatmentBonusCap);
      // For cases without an authored executable protocol, retain quality
      // bonuses so appropriate early care and meaningful improvement count.
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
    const debriefCriticalItems = debrief?.items.filter(item => item.critical) || [];
    const debriefCriticalCompleted = debriefCriticalItems.filter(item => item.status === 'completed').length;
    // The assessment tracker is the authoritative scoring system whenever it
    // exists. The legacy free-text checklist remains a fallback for older
    // sessions, but its IDs are not a reliable proxy for live interactions.
    const criticalMissedCount = debrief
      ? debrief.criticalMissed.length
      : checklistCriticalMissed.length;
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
    let contraindicationCount = 0;
    const contraindicatedGivenIds = new Set<string>();
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
        contraindicationCount = contraindicatedGiven.length;
        contraindicatedGiven.forEach(id => contraindicatedGivenIds.add(id));
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

    // ---- CLINICAL-REALISM PENALTIES ----
    // The treatment engine already evaluates whether an intervention fits the
    // presentation. Previously that result was feedback-only, so a clearly
    // inappropriate intervention could still help produce a 100% score.
    // Deduplicate by treatment ID and avoid charging a second penalty when the
    // protocol has already classified the same action as contraindicated.
    const unaccountedMismatchTreatments = mismatchTreatments.filter(
      item => !contraindicatedGivenIds.has(item.treatment.id),
    );
    const unaccountedHarmfulTreatments = harmfulTreatments.filter(
      item => !contraindicatedGivenIds.has(item.treatment.id),
    );
    for (const item of unaccountedMismatchTreatments) {
      penaltyReasons.push({
        label: `Inappropriate: ${item.treatment.name} — ${item.result.debriefNote}`,
        amount: 5,
      });
      penaltyTotal += 5;
    }
    for (const item of unaccountedHarmfulTreatments) {
      penaltyReasons.push({
        label: `Harmful: ${item.treatment.name} — ${item.result.debriefNote}`,
        amount: 12,
      });
      penaltyTotal += 12;
    }

    // ---- ALLERGY / ADVERSE-REACTION PENALTIES ----
    // Administering a drug the patient is documented allergic to is a serious
    // safety error. Inducing anaphylaxis is heavily penalised; letting it
    // progress to arrest more so. Recognising it and giving adrenaline
    // mitigates the penalty — the student recovered the situation.
    const adverseEvents = adverseEventsRef.current;
    let anaphylaxisInduced = 0;
    let anaphylaxisRescued = 0;
    for (const ev of adverseEvents) {
      let amt = ev.kind === 'anaphylaxis' ? 25 : 12;
      let label = `${ev.kind === 'anaphylaxis' ? 'Anaphylaxis induced' : 'Allergic reaction caused'}: ${ev.treatmentName} given despite documented “${ev.allergy}” allergy`;
      if (ev.reachedArrest) { amt += 15; label += ' — progressed to cardiac arrest'; }
      if (ev.recognizedRescueAt) {
        amt = Math.round(amt * 0.4);
        label += ' (recognised & treated with IM adrenaline)';
        anaphylaxisRescued += 1;
      }
      anaphylaxisInduced += 1;
      penaltyReasons.push({ label, amount: amt });
      penaltyTotal += amt;
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

    const finalV = vitalsHistory[vitalsHistory.length - 1];
    const finalVitalsDangerous = !!finalV && (
      ((parseInt(String(finalV.spo2)) || 100) < 94) ||
      ((parseInt(String(finalV.respiration)) || 16) > 30) ||
      ((parseInt(String(finalV.respiration)) || 16) < 8) ||
      ((parseInt(String(finalV.pulse)) || 80) > 150) ||
      ((parseInt(String(finalV.pulse)) || 80) < 40)
    );
    const smartGrade = computeSmartGrade({
      overall: percentage,
      assessmentScore,
      assessmentTotal,
      criticalItems: debrief ? debriefCriticalItems.length : criticalItems.length,
      criticalCompleted: debrief ? debriefCriticalCompleted : criticalCompleted.length,
      treatmentCount,
      timeToFirstTreatmentSec: timeToFirstTreatment,
      totalTimeSec: elapsedSeconds,
      estimatedDurationMin: currentCase.estimatedDuration || 30,
      spo2Improved: finalSpO2 > initialSpO2,
      contraindicationCount,
      inappropriateTreatmentCount: unaccountedMismatchTreatments.length,
      harmfulTreatmentCount: unaccountedHarmfulTreatments.length,
      adverseInduced: anaphylaxisInduced,
      adverseRescued: anaphylaxisRescued,
      adverseArrests: adverseEventsRef.current.filter(e => e.reachedArrest).length,
      finalVitalsDangerous,
    });

    return {
      checklist,
      completed,
      criticalItems,
      criticalCompleted,
      smartGrade,
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

  // Persist the graded result for a signed-in student (best-effort, once per
  // completed case). Anonymous PIN play simply skips this — saveStudentResult
  // no-ops without a user or Supabase config.
  useEffect(() => {
    if (phase !== 'postcase') { savedResultRef.current = false; return; }
    if (savedResultRef.current || !auth.user || !currentCase || !session) return;
    const grade = performanceMetrics?.smartGrade;
    if (!grade) return;
    savedResultRef.current = true;
    void saveStudentResult({
      studentId: auth.user.id,
      studentName: auth.displayName,
      caseId: currentCase.id,
      caseTitle: currentCase.title,
      category: currentCase.category,
      studentYear: session.studentYear,
      score: performanceMetrics.percentage,
      grade,
      adverseEvents: adverseEventsRef.current,
    });
  }, [phase, auth.user, auth.displayName, performanceMetrics, currentCase, session]);

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
    stopNarration();
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
    treatmentChallengeConfirmedRef.current = new Set();
    setPendingTreatmentChallenge(null);
    // Reset transport / patient state
    setShowTransportDecision(false);
    setPatientState(null);
    // Clear any active adverse reaction + its timers
    reactionTimersRef.current.forEach(id => window.clearTimeout(id));
    reactionTimersRef.current = [];
    activeReactionRef.current = null;
    setActiveReaction(null);
    adverseEventsRef.current = [];
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
  }, [setPhase, stopNarration]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const phaseLabels: Record<StudentPhase, string> = {
    select: 'Select',
    prebriefing: 'Pre-Brief',
    'scene-survey': 'Scene Survey',
    vitals: 'Assess & Treat',
    case: 'Case Detail',
    postcase: 'Report',
  };
  const phaseOrder: StudentPhase[] = ['prebriefing', 'scene-survey', 'vitals', 'case', 'postcase'];

  return (
    <div className="clinical-shell min-h-screen relative overflow-x-hidden">
      {/* Shared clinical wash across the student, educator, and classroom shells. */}
      <AmbientBackground />

      {/* Onboarding Tour */}
      {showTour && phase === 'select' && <OnboardingTour onDismiss={dismissTour} />}

      {/* Student Header — promoted to nav-blur over the ambient bg */}
      <header className="sticky top-0 z-50 nav-blur border-b border-black/5 safe-top">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 shadow-md shadow-cyan-500/20 shrink-0">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-sm font-bold tracking-tight heading-premium truncate">{t('role.student')}</h1>
                  <Badge variant="outline" className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-medium shrink-0 hidden xs:inline-flex">{t('role.studentBadge')}</Badge>
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
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg glass-control active:bg-muted transition-colors touch-manipulation"
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
                          isActive ? 'w-auto px-1.5 sm:px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] sm:text-[10px] font-semibold ring-1 ring-primary/30' :
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

              <Button variant="ghost" size="sm" onClick={() => { stopNarration(); onExit(); }} className="text-[10px] sm:text-xs gap-1 text-muted-foreground hover:text-foreground h-7 sm:h-8 px-2 sm:px-3">
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 safe-bottom relative z-10">
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
            {/* Hero Section — Premium */}
            <div className="text-center mb-2 sm:mb-4 relative">
              <div className="mx-auto mb-5 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/20 ring-4 ring-brand-500/10">
                <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-sm" />
              </div>
              <h2 className="text-2xl sm:text-[2.5rem] leading-tight text-foreground font-bold tracking-tight">
                <span className="gradient-text">Paramedic</span> Case Generator
              </h2>
              <p className="text-muted-foreground mt-2 sm:mt-3 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Select your training level and generate realistic emergency scenarios to sharpen your clinical skills
              </p>
            </div>

            {/* Year Level — Premium */}
            <Card className="glass rounded-2xl border border-white/60 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                  <GraduationCap className="h-4 w-4 text-brand-500" />
                  Select Your Year Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
                  {yearLevels.map(year => (
                    <button
                      key={year.value}
                      onClick={() => setSelectedYear(year.value as StudentYear)}
                      className={`group flex flex-col items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-500 card-premium ${
                        selectedYear === year.value
                          ? 'border-brand-500 bg-gradient-to-b from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400 shadow-lg shadow-brand-500/15 ring-2 ring-brand-500/20 scale-[1.02]'
                          : 'border-border/50 hover:border-brand-400/60 text-muted-foreground hover:text-foreground hover:bg-accent/40 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-700/60'
                      }`}
                    >
                      <GraduationCap className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${selectedYear === year.value ? 'text-brand-500 scale-110' : 'text-muted-foreground/40 group-hover:text-brand-400/70'}`} />
                      {year.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selection Mode Tabs — Premium */}
            <Card className="glass rounded-2xl border border-white/60 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                  <BarChart3 className="h-4 w-4 text-brand-500" />
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
                      className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-xs transition-all duration-500 card-premium ${
                        selectionMode === mode
                          ? 'border-brand-500 bg-gradient-to-b from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400 shadow-md ring-1 ring-brand-500/20'
                          : 'border-border/50 hover:border-brand-400/50 text-muted-foreground hover:bg-accent/40 dark:border-slate-700/60'
                      }`}
                    >
                      <ModeIcon className={`h-4 w-4 ${selectionMode === mode ? 'text-brand-500' : 'text-muted-foreground/50'}`} />
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
                        className={`px-4 py-2.5 rounded-xl border text-sm transition-all duration-500 card-premium ${
                          selectedCategory === 'all'
                            ? 'border-brand-500 bg-gradient-to-r from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400 font-semibold ring-1 ring-brand-500/25 shadow-md shadow-brand-500/10'
                            : 'border-border/50 hover:border-brand-400/50 text-muted-foreground hover:bg-accent/40 hover:shadow-sm dark:border-slate-700/60'
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
                          neurological: 'bg-blue-500', medical: 'bg-emerald-500', paediatric: 'bg-teal-500',
                          obstetric: 'bg-rose-400', environmental: 'bg-amber-500', psychiatric: 'bg-cyan-500',
                        };
                        const dotColor = catColors[cat.value.toLowerCase()] || 'bg-blue-500';
                        return (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`px-4 py-2.5 rounded-xl border text-sm transition-all duration-500 card-premium ${
                            selectedCategory === cat.value
                              ? 'border-brand-500 bg-gradient-to-r from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400 font-semibold ring-1 ring-brand-500/25 shadow-md shadow-brand-500/10'
                              : 'border-border/50 hover:border-brand-400/50 text-muted-foreground hover:bg-accent/40 hover:shadow-sm dark:border-slate-700/60'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${selectedCategory === cat.value ? 'bg-brand-500' : dotColor}`} />
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
                          neurological: 'from-blue-500/15 to-blue-500/5 border-blue-400 text-blue-600 dark:text-blue-400',
                          medical: 'from-emerald-500/15 to-emerald-500/5 border-emerald-400 text-emerald-600 dark:text-emerald-400',
                          paediatric: 'from-teal-500/15 to-teal-500/5 border-teal-400 text-teal-600 dark:text-teal-400',
                          obstetric: 'from-rose-500/15 to-rose-500/5 border-rose-400 text-rose-600 dark:text-rose-400',
                          environmental: 'from-amber-500/15 to-amber-500/5 border-amber-400 text-amber-600 dark:text-amber-400',
                          psychiatric: 'from-cyan-500/15 to-cyan-500/5 border-cyan-400 text-cyan-600 dark:text-cyan-400',
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
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/50 bg-white/55 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all dark:bg-white/[0.05]"
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
                              className="flex items-center justify-between w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <span className="flex items-center gap-2">
                                <Target className="h-3 w-3 text-primary shrink-0" />
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
                className="w-full gap-2.5 sm:gap-3 text-sm sm:text-lg py-6 sm:py-8 rounded-2xl btn-primary text-white border-0 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-500 hover:-translate-y-1 font-semibold tracking-tight"
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
          <div className="max-w-4xl mx-auto animate-fade-in space-y-4">
            {/* ---- DISPATCH HERO ----
                Dark gradient panel that reads as a radio-room moment, not a
                form. Matches the Scene Survey's "Dispatch Arrival" vocab so
                the visual continuity from Pre-Brief → Scene Survey is
                seamless. The voice you hear playing is dispatched from this
                very card — the "Now reading…" pill ties the audio to the
                visual so the student understands the radio is in their ear. */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.65)]">
              {/* ambient radio-blue glow */}
              <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-sky-500/20 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-[100px]" />
              {/* scanline */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

              <div className="relative p-5 sm:p-7">
                {/* Channel header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${isDispatchSpeaking ? 'opacity-90 animate-ping' : 'opacity-0'}`} />
                      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isDispatchSpeaking ? 'bg-emerald-400 shadow-[0_0_10px_rgb(74_222_128/0.8)]' : 'bg-slate-500'}`} />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-white/70 font-medium">
                      {isDispatchSpeaking ? 'Dispatch · live' : 'Incoming case'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-medium">Channel 998</span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/70 capitalize">
                      {currentCase.category}
                    </span>
                    {currentCase.dispatchInfo.dispatchCode && (
                      <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-200">
                        {currentCase.dispatchInfo.dispatchCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Case title — read-aloud hero */}
                <h2 className="mt-4 text-xl sm:text-3xl font-semibold tracking-tight leading-tight text-white">
                  {getStudentCaseTitle(currentCase)}
                </h2>
                <p className="mt-1.5 text-sm text-white/70 leading-relaxed max-w-2xl">
                  {currentCase.dispatchInfo.callReason}
                </p>

                {/* Dispatch tiles — only what the radio actually tells you */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Location',  value: currentCase.dispatchInfo.location },
                    { label: 'Time',      value: String(currentCase.dispatchInfo.timeOfDay) },
                    { label: 'Caller',    value: currentCase.dispatchInfo.callerInfo },
                    { label: 'Priority',  value: currentCase.dispatchInfo.dispatchCode || currentCase.priority || '—' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md px-3 py-2.5">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/45 font-semibold">{item.label}</p>
                      <p className="mt-0.5 text-xs sm:text-sm font-medium text-white/90 capitalize line-clamp-2">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Additional dispatch info (en-route updates) */}
                {currentCase.dispatchInfo.additionalInfo && currentCase.dispatchInfo.additionalInfo.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-3.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/85 font-semibold mb-2">En-route updates</p>
                    <ul className="space-y-1.5">
                      {currentCase.dispatchInfo.additionalInfo.map((info, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-amber-50/85">
                          <ChevronRight className="h-3 w-3 text-amber-300/70 mt-0.5 shrink-0" />
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Replay narration */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isDispatchSpeaking) { stopNarration(); return; }
                      speakNarration(buildDispatchNarration(currentCase), { role: 'dispatcher' });
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors"
                  >
                    <Activity className="h-3 w-3" />
                    {isDispatchSpeaking ? 'Stop replay' : 'Replay dispatch'}
                  </button>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    Clock starts after Scene Survey
                  </p>
                </div>
              </div>
            </div>

            {/* ---- DEMOGRAPHICS + PRESENTATION ----
                Sober white card under the dark hero. Two columns: who the
                patient is (demographic block) and the dispatch-conveyed
                first impression. Scene Information removed entirely — it
                belongs in Scene Survey, which is literally the next click. */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3">
              {/* Patient demographics */}
              <Card className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">Patient</p>
                    <Heart className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-1">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-extralight tracking-tight tabular-nums">{currentCase.patientInfo.age}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{currentCase.patientInfo.gender}</span>
                    <span className="text-xs text-muted-foreground/60 ml-auto">{currentCase.patientInfo.weight} kg</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                    <div>
                      <dt className="text-muted-foreground/60 uppercase tracking-wider text-[9px]">Language</dt>
                      <dd className="font-medium mt-0.5">{currentCase.patientInfo.language}</dd>
                    </div>
                    {currentCase.patientInfo.occupation && (
                      <div>
                        <dt className="text-muted-foreground/60 uppercase tracking-wider text-[9px]">Occupation</dt>
                        <dd className="font-medium mt-0.5">{currentCase.patientInfo.occupation}</dd>
                      </div>
                    )}
                  </dl>
                  {currentCase.patientInfo.culturalConsiderations && currentCase.patientInfo.culturalConsiderations.length > 0 && (
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground border-t border-border/30 pt-2.5">
                      <span className="font-medium text-foreground/70">Cultural note —</span> {currentCase.patientInfo.culturalConsiderations.join('. ')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Initial impression — what dispatch can tell you about the
                  pre-arrival look. Frame it as "what to expect" so it's
                  clearly second-hand info, not direct observation. */}
              {currentCase.initialPresentation && (
                <Card className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">Expected presentation</p>
                      <Stethoscope className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-1 space-y-1.5 text-xs leading-relaxed">
                    <p className="text-foreground/85">
                      <span className="text-muted-foreground/70">What dispatch can tell you —</span> {currentCase.initialPresentation.generalImpression}
                    </p>
                    {currentCase.initialPresentation.position && (
                      <p className="text-muted-foreground"><span className="font-medium text-foreground/70">Position:</span> {currentCase.initialPresentation.position}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ---- ACTION BAR ----
                Single dominant CTA + subtle secondary back link. The Begin
                Scene Survey button is the only thing the student should be
                looking for after the dispatch tile reads. */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={resetToStart}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Different case
              </button>
              <Button
                onClick={startCase}
                size="lg"
                className="gap-2 rounded-full px-6 sm:px-8 h-11 sm:h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Begin Scene Survey
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 2.5: Scene Survey (between Pre-Brief and Active Case)
            Hard-gated walkthrough — hazard ID, scene safety declaration,
            PPE selection, general impression. Pre-arrival, so case clock
            doesn't start until "Enter Scene" is pressed. */}
        {/* ================================================================ */}
        {phase === 'scene-survey' && currentCase && (
          <SceneSurveyPanel
            caseData={currentCase}
            onBack={() => setPhase('prebriefing')}
            onEnterScene={(survey) => {
              setSceneSurvey(survey);
              enterScene();
            }}
          />
        )}

        {/* ================================================================ */}
        {/* PHASE 3: Vitals & Treatment (Active Case)
            Rendered whenever a case is live (vitals OR case-details phase)
            and hidden with CSS when the student jumps to Case Details —
            keeps the monitor mounted so its internal power/boot/visible-
            vitals state doesn't reset on tab switch. Returning to the
            monitor view then feels instant, not like a cold boot. */}
        {/* ================================================================ */}
        {(phase === 'vitals' || phase === 'case') && currentCase && (
          <div className={`animate-fade-in space-y-3 sm:space-y-4 ${phase !== 'vitals' ? 'hidden' : ''}`}>
            {/* ===== TOP: Patient Banner (full width) ===== */}
            <div className="glass-panel p-3 sm:p-4 rounded-xl space-y-3 overflow-hidden shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-emerald-500/10 shrink-0 border border-cyan-300/30">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">{getStudentCaseTitle(currentCase)}</h2>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {currentCase.dispatchInfo.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <NarrationButton
                    role="dispatcher"
                    size="md"
                    label="Replay dispatch briefing"
                    text={buildDispatchNarration(currentCase)}
                  />
                  {/* Persistent pain readout - once scored under SAMPLE,
                      carries through the case on the header for handover. */}
                  {currentVitals?.painScore !== undefined && (
                    <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border shrink-0 ${
                      currentVitals.painScore >= 7
                        ? 'bg-red-500/10 dark:bg-red-500/15 border-red-500/30'
                        : currentVitals.painScore >= 4
                          ? 'bg-orange-500/10 dark:bg-orange-500/15 border-orange-500/30'
                          : currentVitals.painScore > 0
                            ? 'bg-yellow-500/10 dark:bg-yellow-500/15 border-yellow-500/30'
                            : 'bg-green-500/10 dark:bg-green-500/15 border-green-500/30'
                    }`} title="Pain score - reassess periodically">
                      <span className="text-[9px] sm:text-[10px] font-mono font-semibold opacity-70">PAIN</span>
                      <span className={`font-mono text-[11px] sm:text-sm font-bold ${
                        currentVitals.painScore >= 7 ? 'text-red-600 dark:text-red-400'
                        : currentVitals.painScore >= 4 ? 'text-orange-600 dark:text-orange-400'
                        : currentVitals.painScore > 0 ? 'text-yellow-700 dark:text-yellow-400'
                        : 'text-green-700 dark:text-green-400'
                      }`}>{currentVitals.painScore}/10</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary/10 dark:bg-primary/15 border border-primary/20 shrink-0">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                    <span className="font-mono text-[11px] sm:text-sm font-semibold text-primary">{formatTime(elapsedSeconds)}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPhase('case')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg h-8 dark:border-slate-700"
                >
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Case </span>Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMedicalControl(true)}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg h-8 border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10"
                >
                  <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Call </span>Med Control
                </Button>
                <Button
                  size="sm"
                  onClick={() => endCase('transport')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm h-8"
                >
                  <Ambulance className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Transport
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => endCase('end')}
                  className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs rounded-lg shadow-sm h-8"
                >
                  <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">End </span>Care
                </Button>
              </div>
            </div>

            {/* ===== Scene Toggle ===== */}
            <button
              onClick={() => setShowScene(!showScene)}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl border transition-all font-semibold ${
                showScene
                  ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200'
                  : 'border-border/70 bg-white/50 text-foreground hover:border-amber-400/60 hover:bg-amber-50/60 dark:bg-white/[0.04] dark:hover:bg-amber-950/20'
              }`}
            >
              <Shield className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="flex-1 text-left">
                <span className="block text-xs sm:text-sm">{showScene ? 'Hide scene details' : 'Review scene details'}</span>
                <span className="block text-[10px] font-normal text-muted-foreground">
                  Scene survey complete. Timer is running.
                </span>
              </span>
              {showScene ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showScene && (
              <div className="glass-panel p-3 rounded-xl text-xs space-y-2 animate-fade-in">
                <p className="leading-relaxed">{currentCase.sceneInfo.description}</p>
                {sceneSurvey && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/40 bg-white/55 p-2 dark:bg-white/[0.05]">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">PPE</p>
                      <p className="mt-0.5 truncate text-[11px]">{sceneSurvey.ppeSelected.join(', ') || 'Not documented'}</p>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-white/55 p-2 dark:bg-white/[0.05]">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
                      <p className="mt-0.5 truncate text-[11px]">{sceneSurvey.additionalResourcesRequested.join(', ') || 'None requested'}</p>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-white/55 p-2 dark:bg-white/[0.05]">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Impression</p>
                      <p className="mt-0.5 truncate text-[11px]">{sceneSurvey.generalImpression.join(', ') || 'Not documented'}</p>
                    </div>
                  </div>
                )}
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

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                {
                  label: 'Primary survey',
                  value: `${['airway', 'breathing', 'circulation', 'disability', 'exposure'].filter(stepId => assessmentTracker?.performed.some(p => p.stepId === stepId)).length}/5`,
                  hint: 'ABCDE',
                  Icon: Shield,
                },
                {
                  label: 'Anatomy exam',
                  value: `${assessmentTracker?.performed.filter(p => p.phase === 'secondary').length || 0} regions`,
                  hint: '3D patient',
                  Icon: Stethoscope,
                },
                {
                  label: 'Monitor',
                  value: `${monitorRevealedVitals.size} revealed`,
                  hint: 'Reassess',
                  Icon: Activity,
                },
                {
                  label: 'Treatment',
                  value: `${appliedTreatments.length} applied`,
                  hint: 'Treat and check',
                  Icon: Syringe,
                },
              ]).map(item => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2 shadow-sm">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <item.Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold">{item.label}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{item.value} - {item.hint}</p>
                  </div>
                </div>
              ))}
            </div>

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
                Mobile order: Primary Survey -> Anatomy -> Monitor -> Treatment.
                Desktop: 2-col grid with Monitor + PulseCheck sticky top-right,
                Management bottom-right, and Assessment spanning the left.
            */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-4 lg:grid-rows-[auto_auto]">

              {/* ===== ASSESSMENT COLUMN (Primary / 3D / History) ===== */}
              <div className="order-1 lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-2 space-y-4">

                {/* --- PRIMARY SURVEY (ABCDE) ---
                    Premium redesign: each system is a glass "channel" with a
                    jewel-tone gradient rail per clinical hierarchy. The
                    assessed state is a minimal LED dot (emerald) rather than
                    a pill/check; the active state lights up the rail and
                    adds a subtle accent glow. Findings render as a chapter
                    panel beneath the tiles, not a utility dropdown. */}
                <Card className="relative overflow-hidden rounded-2xl border border-white/5 dark:border-white/[0.06] bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-950/70 dark:via-slate-900/40 dark:to-slate-950/70 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                  {/* Accent hairline across the top */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  <CardHeader className="pb-3 px-4 sm:px-5 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10">
                          <Shield className="h-3.5 w-3.5 text-primary/80" />
                        </div>
                        <div>
                          <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-muted-foreground/60">Phase&nbsp;1</p>
                          <h2 className="text-sm font-semibold tracking-tight leading-tight">Primary Survey</h2>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground/40">SABCDE</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {[
                        { label: 'First Look', value: currentCase.initialPresentation?.generalImpression || currentCase.dispatchInfo?.callReason || 'Form a general impression' },
                        { label: 'Position', value: currentCase.initialPresentation?.position || 'Observe patient position' },
                        { label: 'Visible Cues', value: currentCase.initialPresentation?.appearance || 'Scan skin, work of breathing, bleeding' },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl border border-slate-200/70 bg-white/65 px-3 py-2 dark:border-white/[0.06] dark:bg-slate-900/45">
                          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">{item.label}</p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-relaxed text-foreground/80">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {/* ABCDE grid — Scene Safety/BSI is intentionally
                        absent here because it's already performed and
                        scored in the Scene Survey phase before the case
                        clock starts. Duplicating it as an in-case action
                        would reward the same skill twice and contradict
                        real practice (you don't reassess scene safety
                        from inside the back of the truck). */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {([
                        { key: 'airway' as const,       letter: 'A', label: 'Airway',     stepId: 'airway' as AssessmentStepId,       rail: 'from-amber-400 to-orange-500',  glow: 'shadow-[0_0_20px_-4px_rgb(251_146_60/0.45)]', text: 'text-amber-700 dark:text-amber-300' },
                        { key: 'breathing' as const,    letter: 'B', label: 'Breathing',  stepId: 'breathing' as AssessmentStepId,    rail: 'from-sky-400 to-cyan-500',      glow: 'shadow-[0_0_20px_-4px_rgb(56_189_248/0.45)]', text: 'text-sky-700 dark:text-sky-300' },
                        { key: 'circulation' as const,  letter: 'C', label: 'Circulation',stepId: 'circulation' as AssessmentStepId,  rail: 'from-rose-400 to-red-500',      glow: 'shadow-[0_0_20px_-4px_rgb(251_113_133/0.45)]',text: 'text-rose-700 dark:text-rose-300' },
                        { key: 'disability' as const,   letter: 'D', label: 'Disability', stepId: 'disability' as AssessmentStepId,   rail: 'from-indigo-400 to-blue-500', glow: 'shadow-[0_0_20px_-4px_rgb(96_165_250/0.45)]',text: 'text-blue-700 dark:text-blue-300' },
                        { key: 'exposure' as const,     letter: 'E', label: 'Exposure',   stepId: 'exposure' as AssessmentStepId,     rail: 'from-emerald-400 to-teal-500',  glow: 'shadow-[0_0_20px_-4px_rgb(52_211_153/0.45)]', text: 'text-emerald-700 dark:text-emerald-300' },
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
                            className={`group relative flex flex-col items-center justify-center min-h-[54px] sm:min-h-[68px] pt-3 pb-2 px-1 rounded-xl bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/60 dark:border-white/[0.04] transition-all duration-300 touch-manipulation hover:-translate-y-0.5 hover:border-white/10 ${isActive ? `${item.glow} border-white/10` : ''}`}
                          >
                            {/* Jewel-tone rail: visible at low opacity at rest, bright when active */}
                            <span className={`absolute inset-x-3 top-0 h-[2px] rounded-full bg-gradient-to-r ${item.rail} transition-opacity duration-300 ${isActive ? 'opacity-100' : isAssessed ? 'opacity-60' : 'opacity-20 group-hover:opacity-50'}`} />
                            {/* Status LED */}
                            <span className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full transition-colors ${isAssessed ? 'bg-emerald-400 shadow-[0_0_6px_rgb(52_211_153/0.8)]' : 'bg-white/[0.08] dark:bg-white/[0.06]'}`} />
                             {/* Letter — thin, large, premium */}
                             <span className={`text-xl sm:text-2xl font-light tracking-tight leading-none ${isActive ? item.text : 'text-foreground/90'}`}>
                               {item.letter}
                             </span>
                             {/* Label — tiny spaced-out uppercase */}
                             <span className={`text-[8px] sm:text-[9px] font-semibold tracking-[0.12em] uppercase mt-1 ${isActive ? item.text : 'text-foreground/70'}`}>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Chapter-style findings reveal */}
                    {activePrimarySurvey && activeFindings && activeFindings.stepId === activePrimarySurvey && (
                      <div className="relative overflow-hidden rounded-xl border border-white/5 dark:border-white/[0.06] bg-gradient-to-br from-slate-50/80 via-white/40 to-transparent dark:from-slate-900/60 dark:via-slate-900/20 dark:to-transparent backdrop-blur-sm animate-in slide-in-from-top-2 fade-in-50 duration-500">
                        <div className="px-4 py-3 border-b border-slate-200/50 dark:border-white/5">
                          <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-muted-foreground/60">Findings</p>
                          <h3 className="text-base font-light tracking-tight text-foreground/90 mt-0.5 capitalize">
                            {activePrimarySurvey.replace(/-/g, ' ')}
                          </h3>
                        </div>
                        <div className="p-4 space-y-2">
                          {activeFindings.findings.map((f, i) => (
                            <div key={i} className="group relative pl-3">
                              <span className="absolute left-0 top-1.5 h-1 w-1 rounded-full bg-foreground/20" />
                              <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground/60">{f.label}</p>
                              <p className="font-mono text-[11px] sm:text-xs text-foreground/80 leading-relaxed mt-0.5">{f.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Injury Map (up-front findings list) intentionally REMOVED
                    from the student view — listing findings before assessment
                    spoils the discovery that IS the assessment skill. Findings
                    now reveal ON the 3D body only once the student examines the
                    region (see RevealedFindingMarkers in Body3DModel). The
                    InjuryMap component is retained for a future debrief/
                    instructor summary surface. */}

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
                      appliedTreatmentIds={appliedTreatmentIds}
                      isInArrest={patientState?.isInArrest ?? false}
                      liveRespiration={currentVitals?.respiration}
                      onPulse={runPulseCheck}
                    />
                  </Suspense>
                )}

                {/* --- HISTORY (voice-driven) ---
                    The old SAMPLE letter grid was replaced with a live
                    spoken conversation: student presses mic, asks any
                    history question, classifier maps it to SAMPLE/OPQRST,
                    patient (or bystander when unconscious) answers via
                    Supertonic. Coverage chips track which SAMPLE letters
                    have been obtained for debrief scoring. */}
                {currentCase && (
                  <VoiceHistoryPanel
                    caseData={currentCase}
                    onCategoryObtained={(cat: HistoryCategory) => {
                      // Map voice categories back to the legacy tracker step IDs
                      // so the existing scoring / progress logic keeps working.
                      const stepId: AssessmentStepId | null = (() => {
                        switch (cat) {
                          case 'signs-symptoms': return 'signs-symptoms';
                          case 'allergies': return 'allergies';
                          case 'medications': return 'medications';
                          case 'past-medical': return 'past-medical';
                          case 'last-meal': return 'last-meal';
                          case 'events': return 'events-leading';
                          // All OPQRST categories roll up under signs-symptoms
                          case 'opqrst-onset':
                          case 'opqrst-provocation':
                          case 'opqrst-quality':
                          case 'opqrst-radiation':
                          case 'opqrst-severity':
                          case 'opqrst-time':
                          case 'pain-current':
                            return 'signs-symptoms';
                          default:
                            return null;
                        }
                      })();
                      if (stepId) handlePerformAssessment(stepId);
                    }}
                    footer={(
                      // Pain severity (OPQRST "S") folded INTO history-taking —
                      // a compact row in the history card footer rather than a
                      // separate card. Voice history can also set it when the
                      // student asks the patient to rate their pain.
                      <div className="border-t border-border/40 px-4 py-3">
                        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">Pain · OPQRST severity</p>
                        {(() => {
                          // Pain is HISTORY, not a dial: ask the patient and they report
                          // it (revealing the case's authored severity). If they can't
                          // self-report (reduced GCS), prompt non-verbal assessment instead.
                          const gcs = currentVitals?.gcs ?? 15;
                          const canSelfReport = gcs >= 9;
                          const revealed = monitorRevealedVitals.has('painScore');
                          const p = currentVitals?.painScore;
                          if (revealed && p !== undefined) {
                            const sev = p === 0 ? 'no pain' : p <= 3 ? 'mild' : p <= 6 ? 'moderate' : 'severe';
                            return (
                              <p className="text-[11px] text-foreground/75">
                                Patient reports <span className="font-semibold tabular-nums">{p}/10</span> — {sev}.
                              </p>
                            );
                          }
                          if (!canSelfReport) {
                            return (
                              <p className="text-[11px] text-muted-foreground/70">
                                Patient cannot self-report pain (GCS {gcs}). Look for non-verbal cues — guarding, grimacing, restlessness.
                              </p>
                            );
                          }
                          return (
                            <button
                              onClick={() => {
                                if (readOnly) return;
                                const reported = currentVitals?.painScore
                                  ?? currentCase?.vitalSignsProgression?.initial?.painScore
                                  ?? 0;
                                setCurrentVitals(prev => prev ? { ...prev, painScore: reported } : prev);
                                handlePerformAssessment('pain-assessment');
                              }}
                              className="w-full rounded-md border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-slate-900/40 px-3 py-2 text-[11px] font-medium text-foreground/75 transition-colors hover:border-primary/40 hover:text-foreground touch-manipulation"
                            >
                              Ask the patient to rate their pain (0–10)
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  />
                )}

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
              <div className="order-2 mt-4 lg:order-none lg:col-start-2 lg:row-start-1 lg:mt-0 lg:sticky lg:top-16 lg:self-start space-y-4">

                {/* --- LIFEPAK MONITOR --- */}
                <Suspense fallback={<LoadingCard />}>
                  <VitalSignsMonitor
                    initialVitals={currentVitals || buildInitialVitalsFromCase(currentCase)}
                    previousVitals={previousVitals}
                    deteriorationVitals={currentCase.vitalSignsProgression.deterioration ? ensureCompleteVitals(currentCase.vitalSignsProgression.deterioration) : undefined}
                    onVitalChange={(vitals) => {
                      const completeVitals = ensureCompleteVitals(vitals);
                      setCurrentVitals(completeVitals);
                      setVitalsHistory(prev => [...prev, completeVitals]);
                    }}
                    onAssessmentPerformed={handlePerformAssessment}
                    onPacerStateChange={(state) => {
                      if (onClassroomStateChange) onClassroomStateChange({ pacerState: state });
                    }}
                    overridePacerState={externalState?.pacerState}
                    // Classroom spectators can't press the ON button (read-only),
                    // so boot the monitor powered-on so they actually see the
                    // vitals mirror instead of "MONITOR OFF".
                    autoPowerOn={readOnly}
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
                  {/* Pulse is now checked on the mannequin — tap the carotid
                      (neck) or radial (wrist) point. This shows the status; the
                      arrest-confirm prompt below still triggers on 'absent'. */}
                  <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] ${
                    pulseCheckInProgress ? 'border-amber-500/50 text-amber-600'
                    : pulseCheckResult === 'absent' ? 'border-red-500/50 text-red-600'
                    : pulseCheckResult === 'present' ? 'border-green-500/50 text-green-600'
                    : 'border-border/60 text-muted-foreground'
                  }`}>
                    <Heart className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {pulseCheckInProgress ? 'Checking pulse…'
                        : pulseCheckResult === 'absent' ? 'No pulse detected — tap a pulse point to recheck'
                        : pulseCheckResult === 'present' ? 'Pulse present'
                        : 'Tap the carotid (neck) or radial (wrist) point on the patient to check a pulse'}
                    </span>
                  </div>

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
                <TreatmentJumpBagPanel
                  currentVitals={currentVitals}
                  appliedTreatments={appliedTreatments}
                  appliedTreatmentIds={appliedTreatmentIds}
                  applyingTreatmentId={applyingTreatmentId}
                  patientState={patientState}
                  activeManagementTab={activeManagementTab}
                  setActiveManagementTab={setActiveManagementTab}
                  medSearch={medSearch}
                  setMedSearch={setMedSearch}
                  applyTreatment={applyTreatment}
                />

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
                          bvmVentilationRateRef.current = opt.rate;
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
                initialSettings={ventilatorSettings}
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

            {/* Practicality challenge — patient/context pushes back before the treatment is applied. */}
            {pendingTreatmentChallenge && (
              <Dialog open={!!pendingTreatmentChallenge} onOpenChange={(open) => { if (!open) setPendingTreatmentChallenge(null); }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      {pendingTreatmentChallenge.challenge.title}
                    </DialogTitle>
                    <DialogDescription>
                      The patient and clinical context are challenging this treatment choice.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    {pendingTreatmentChallenge.challenge.patientQuote && (
                      <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">Patient says</p>
                        <p className="mt-1 italic">"{pendingTreatmentChallenge.challenge.patientQuote}"</p>
                      </div>
                    )}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100">
                      {pendingTreatmentChallenge.challenge.clinicalReason}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Treatment selected: <span className="font-semibold text-foreground">{pendingTreatmentChallenge.treatment.name}</span>
                    </p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setPendingTreatmentChallenge(null)}>
                      Reconsider
                    </Button>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => {
                        const pending = pendingTreatmentChallenge;
                        if (!pending) return;
                        treatmentChallengeConfirmedRef.current.add(pending.treatment.id);
                        setPendingTreatmentChallenge(null);
                        applyTreatment(pending.treatment, pending.defibParams);
                      }}
                    >
                      {pendingTreatmentChallenge.challenge.proceedLabel || 'Proceed anyway'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Medication Safety Confirmation Dialog */}
            {/* Live adverse-reaction banner — appears when an allergen has been
                administered, until adrenaline rescues the patient. */}
            {activeReaction && (
              <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] w-[min(92vw,560px)] rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-3 shadow-2xl backdrop-blur animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-300 shrink-0 mt-0.5 animate-pulse" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-100">
                      {activeReaction.kind === 'anaphylaxis' ? 'ANAPHYLAXIS in progress' : 'Allergic reaction in progress'}
                    </p>
                    <p className="text-xs text-red-200/90 mt-0.5">
                      {activeReaction.treatmentName} given despite documented “{activeReaction.match.allergy}” allergy — give IM adrenaline now, plus high-flow O₂ and IV fluids.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                          edOutcome.preAlertImpact === 'neutral' ? 'bg-slate-500' :
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

            {/* Performance Assessment — deterministic dimension breakdown */}
            {performanceMetrics.smartGrade && (
              <Card className="bg-card border border-border rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                      Performance Assessment
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${
                      performanceMetrics.smartGrade.band.tone === 'excellent' ? 'border-emerald-400 text-emerald-600'
                      : performanceMetrics.smartGrade.band.tone === 'good' ? 'border-blue-400 text-blue-600'
                      : performanceMetrics.smartGrade.band.tone === 'fair' ? 'border-amber-400 text-amber-600'
                      : 'border-red-400 text-red-600'
                    }`}>{performanceMetrics.smartGrade.band.label}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{performanceMetrics.smartGrade.narrative}</p>

                  <div className="space-y-2.5">
                    {performanceMetrics.smartGrade.dimensions.map((d) => (
                      <div key={d.key}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium">{d.label}</span>
                          <span className="font-mono text-muted-foreground">{d.score}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${
                            d.score >= 80 ? 'bg-emerald-500' : d.score >= 60 ? 'bg-blue-500' : d.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          }`} style={{ width: `${d.score}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{d.summary}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    {performanceMetrics.smartGrade.strengths.length > 0 && (
                      <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-1.5">Strengths</p>
                        <ul className="space-y-1">
                          {performanceMetrics.smartGrade.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-xs flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">✓</span><span>{s}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1.5">Focus Next</p>
                      <ul className="space-y-1">
                        {performanceMetrics.smartGrade.improvements.map((s: string, i: number) => (
                          <li key={i} className="text-xs flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">→</span><span>{s}</span></li>
                        ))}
                      </ul>
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
                        'drug': 'text-cyan-700 bg-cyan-50',
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
                <Card className="border border-border rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/30">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/15">
                        <Activity className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
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
                          <p className="text-xs mt-2 p-2 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg text-cyan-800 dark:text-cyan-200 italic">
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
                      scoreSummary: {
                        basePercentage: performanceMetrics.basePercentage,
                        percentage: performanceMetrics.percentage,
                        penaltyReasons: performanceMetrics.penaltyReasons,
                      },
                      assessmentItems: performanceMetrics.assessmentDebrief?.items,
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
