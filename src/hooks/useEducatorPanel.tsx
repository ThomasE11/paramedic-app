import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { CaseScenario, StudentYear, CaseSession, VitalSigns, SimulationObjective } from '@/types';
import { usePersistentState, removePersistedState } from '@/hooks/usePersistentState';
import { caseCategories } from '@/data/caseFilters';
import { matchObjectiveToCase } from '@/data/simulationObjectives';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { determineSeverity } from '@/data/deteriorationSystem';
import { toast } from 'sonner';
import { Home, Sparkles, Target } from 'lucide-react';

// ----- Types -----

type UserRole = 'none' | 'educator' | 'student' | 'classroom-host' | 'classroom-join';

type CasesModule = typeof import('@/data/cases');

interface TimelineEvent {
  id: string;
  type: 'assessment' | 'intervention' | 'decision' | 'finding' | 'milestone';
  title: string;
  time: string;
  description: string;
  tags?: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }[];
}

// ----- Helpers (hoisted from App.tsx) -----

const createSessionFromCase = (caseData: CaseScenario, yearLevel: StudentYear): CaseSession => ({
  id: Date.now().toString(),
  caseId: caseData.id,
  studentYear: yearLevel,
  generatedAt: new Date().toISOString(),
  completedItems: [],
  notes: '',
  score: 0,
  totalPossible: (caseData.studentChecklist || [])
    .filter(item => item.yearLevel?.includes(yearLevel))
    .reduce((sum, item) => sum + (item.points || 0), 0),
});

// Lazy case bundle loader
let _casesPromise: Promise<CasesModule> | null = null;
const loadCases = (): Promise<CasesModule> => {
  if (!_casesPromise) _casesPromise = import('@/data/cases');
  return _casesPromise;
};

// ----- Hook -----

export function useEducatorPanel() {
  // --- Role Management ---
  // Always boot to the landing page. The role is session-only and is NOT
  // restored from a previous visit, so reopening / refreshing the app always
  // lands on the "Master emergency clinical decisions" home screen rather than
  // jumping straight back into the student case-generator or educator panel.
  const [userRole, setUserRole] = useState<UserRole>('none');

  // Clear any role persisted by older builds so it can never short-circuit the
  // landing page on a future load.
  useEffect(() => {
    localStorage.removeItem('paramedic-role');
  }, []);

  const handleRoleExit = useCallback(() => {
    setUserRole('none');
    localStorage.removeItem('paramedic-role');
  }, []);

  // --- Case Bundle Loading ---
  const [allCases, setAllCases] = useState<CaseScenario[]>([]);
  const casesModuleRef = useMemo<{ current: CasesModule | null }>(() => ({ current: null }), []);

  useEffect(() => {
    let cancelled = false;
    void loadCases().then((mod) => {
      if (cancelled) return;
      casesModuleRef.current = mod;
      setAllCases(mod.allCases);
    });
    return () => { cancelled = true; };
  }, [casesModuleRef]);

  // --- Educator Panel State ---
  const [currentCase, setCurrentCase] = usePersistentState<CaseScenario | null>('paramedic-educ-current-case', null);
  const [selectedYear, setSelectedYear] = useState<StudentYear>('3rd-year');
  const [session, setSession] = usePersistentState<CaseSession | null>('paramedic-educ-session', null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [caseHistory, setCaseHistory] = usePersistentState<CaseScenario[]>('paramedic-educ-case-history', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVitals, setCurrentVitals] = usePersistentState<VitalSigns | null>('paramedic-educ-vitals', null);
  const [previousVitals, setPreviousVitals] = useState<VitalSigns | null>(null);
  const [vitalsHistory, setVitalsHistory] = usePersistentState<VitalSigns[]>('paramedic-educ-vitals-history', []);
  const [appliedTreatments, setAppliedTreatments] = usePersistentState<import('@/types').AppliedTreatment[]>('paramedic-educ-treatments', []);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [deteriorationSeverity, setDeteriorationSeverity] = useState<import('@/data/deteriorationSystem').CaseSeverity>('stable');
  const [deteriorationMinutes, setDeteriorationMinutes] = useState(0);
  const [showObjectiveSetup, setShowObjectiveSetup] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('');
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const pendingUrlCaseRef = useRef(false);

  // --- Timeline ---
  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, 'time'>) => {
    setTimelineEvents(prev => [...prev, {
      ...event,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    }]);
  }, []);

  // --- Session Restoration (from old format on first load) ---
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (hasRestoredRef.current) return;
    if (allCases.length === 0) return;
    hasRestoredRef.current = true;

    // Try old-style restore if new-style persistent state returned null
    if (!currentCase) {
      const savedCaseId = localStorage.getItem('paramedic-current-case');
      if (savedCaseId) {
        const foundCase = allCases.find(c => c.id === savedCaseId);
        if (foundCase) {
          setCurrentCase(foundCase);
          // Migrate old session data
          const savedSession = localStorage.getItem('paramedic-session');
          if (savedSession) {
            try { setSession(JSON.parse(savedSession)); } catch { /* ignore malformed legacy state */ }
          }
          const savedVitals = localStorage.getItem('paramedic-vitals');
          if (savedVitals) {
            try { setCurrentVitals(JSON.parse(savedVitals)); } catch { /* ignore malformed legacy state */ }
          }
          const savedVitalsHistory = localStorage.getItem('paramedic-vitals-history');
          if (savedVitalsHistory) {
            try { setVitalsHistory(JSON.parse(savedVitalsHistory)); } catch { /* ignore malformed legacy state */ }
          }
          // Clean up old keys
          removePersistedState('paramedic-session');
          removePersistedState('paramedic-vitals');
          removePersistedState('paramedic-vitals-history');
          removePersistedState('paramedic-current-case');
          removePersistedState('paramedic-applied-treatments');
          removePersistedState('paramedic-case-history');
        }
      }
    }
  }, [allCases]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- URL State Management ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('case');
    const year = params.get('year');

    if (caseId && allCases.length === 0) {
      pendingUrlCaseRef.current = true;
      return;
    }

    const timeoutId = setTimeout(() => {
      if (year && (year === '1st-year' || year === '2nd-year' || year === '3rd-year' || year === '4th-year' || year === 'diploma')) {
        setSelectedYear(year as StudentYear);
      }

      if (caseId) {
        const foundCase = allCases.find(c => c.id === caseId);
        if (foundCase) {
          pendingUrlCaseRef.current = true;
          setCurrentCase(foundCase);
          const yearLevel = (year === '1st-year' || year === '2nd-year' || year === '3rd-year' || year === '4th-year' || year === 'diploma')
            ? year as StudentYear
            : selectedYear;
          setSession(createSessionFromCase(foundCase, yearLevel));
        } else {
          pendingUrlCaseRef.current = false;
        }
      } else {
        pendingUrlCaseRef.current = false;
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [allCases]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL when case changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (currentCase) {
      pendingUrlCaseRef.current = false;
      params.set('case', currentCase.id);
      window.history.replaceState({}, '', `?${params.toString()}`);
    } else {
      if (params.has('case') && pendingUrlCaseRef.current) return;
      params.delete('case');
      pendingUrlCaseRef.current = false;
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [currentCase]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get('case') && currentCase) {
        goHome();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentCase]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Memoized Data ---
  const filteredChecklist = useMemo(() => {
    if (!currentCase) return [];
    return (currentCase.studentChecklist || []).filter(item => item.yearLevel?.includes(selectedYear));
  }, [currentCase, selectedYear]);

  const categoryLookup = useMemo(() =>
    Object.fromEntries(caseCategories.map(c => [c.value, c])),
    [],
  );

  const caseCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    caseCategories.forEach(cat => {
      counts[cat.value] = allCases.filter(c => c.category === cat.value).length;
    });
    return counts;
  }, [allCases]);

  // --- Navigation ---
  const goHome = useCallback(() => {
    pendingUrlCaseRef.current = false;
    setCurrentCase(null);
    setSession(null);
    setAppliedTreatments([]);
    setShowObjectiveSetup(false);
    toast.info('Returned to home', { icon: <Home className="h-4 w-4" /> });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Case Generation ---
  const generateCase = useCallback(async (objective?: SimulationObjective) => {
    setIsGenerating(true);

    const mod = await loadCases();
    await new Promise(resolve => setTimeout(resolve, 300));

    let newCase: CaseScenario;

    if (objective) {
      const scoredCases = matchObjectiveToCase(objective, mod.allCases);
      newCase = scoredCases.length > 0
        ? scoredCases[Math.floor(Math.random() * Math.min(3, scoredCases.length))]
        : mod.getRandomCase({
            yearLevel: selectedYear,
            category: objective.relatedCategories[0] || (selectedCategory !== 'all' ? selectedCategory : undefined),
          });
    } else {
      newCase = mod.getRandomCase({
        yearLevel: selectedYear,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
    }

    setCurrentCase(newCase);
    const initialVitals = buildInitialVitalsFromCase(newCase);
    setCurrentVitals(initialVitals);
    setPreviousVitals(null);
    setVitalsHistory([initialVitals]);
    setDeteriorationSeverity(determineSeverity(newCase.category, initialVitals));
    setDeteriorationMinutes(0);
    setCaseHistory(prev => [newCase, ...prev].slice(0, 10));
    setSession(createSessionFromCase(newCase, selectedYear));
    setAppliedTreatments([]);
    setIsGenerating(false);

    toast.success(objective ? 'Guided case generated!' : 'New case generated!', {
      description: newCase.title,
      icon: objective ? <Target className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />,
    });
  }, [selectedYear, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- History ---
  const loadCaseFromHistory = useCallback((caseItem: CaseScenario) => {
    setCurrentCase(caseItem);
    setSession(createSessionFromCase(caseItem, selectedYear));
    const initialVitals = buildInitialVitalsFromCase(caseItem);
    setCurrentVitals(initialVitals);
    setPreviousVitals(null);
    setVitalsHistory([initialVitals]);
    setDeteriorationSeverity(determineSeverity(caseItem.category, initialVitals));
    setDeteriorationMinutes(0);
    setAppliedTreatments([]);
    toast.info(`Loaded: ${caseItem.title}`);
  }, [selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Objective Setup ---
  const handleObjectiveSet = useCallback((objective: SimulationObjective) => {
    setShowObjectiveSetup(false);
    generateCase(objective);
  }, [generateCase]);

  const handleSkipObjective = useCallback(() => {
    setShowObjectiveSetup(false);
    generateCase();
  }, [generateCase]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentCase) {
        goHome();
      }
      if ((e.key === 'n' || e.key === 'N') && currentCase &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        generateCase();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCase, goHome, generateCase]);

  return {
    // Role
    userRole,
    setUserRole,
    handleRoleExit,
    // Cases
    allCases,
    caseHistory,
    currentCase,
    setCurrentCase,
    selectedYear,
    setSelectedYear,
    selectedCategory,
    setSelectedCategory,
    // Session
    session,
    setSession,
    // Vitals
    currentVitals,
    setCurrentVitals,
    previousVitals,
    setPreviousVitals,
    vitalsHistory,
    setVitalsHistory,
    // Treatments
    appliedTreatments,
    setAppliedTreatments,
    // Timeline
    timelineEvents,
    addTimelineEvent,
    // Deterioration
    deteriorationSeverity,
    setDeteriorationSeverity,
    deteriorationMinutes,
    setDeteriorationMinutes,
    // UI State
    showObjectiveSetup,
    setShowObjectiveSetup,
    isGenerating,
    setIsGenerating,
    elapsedTime,
    setElapsedTime,
    timeTakenSeconds,
    setTimeTakenSeconds,
    // Memos
    filteredChecklist,
    categoryLookup,
    caseCountsByCategory,
    // Actions
    goHome,
    generateCase,
    loadCaseFromHistory,
    handleObjectiveSet,
    handleSkipObjective,
  };
}
