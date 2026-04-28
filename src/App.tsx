import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { CaseScenario, StudentYear, CaseSession, VitalSigns, AppliedTreatment, SimulationObjective } from '@/types';
import { useGradualVitalChanges } from '@/hooks/useGradualVitalChanges';
import { yearLevels, caseCategories, priorities } from '@/data/caseFilters';
// Heavy case bundle — lazy-imported on mount so it's not in the initial
// chunk. App.tsx only needs lookups (savedCaseId restore, random case
// generation), so the slight async delay is invisible to the user.
// Everything else (StudentPanel, ClassroomLobby, CommandPalette) is
// already behind React.lazy and continues to import from '@/data/cases'
// directly, landing in its own on-demand chunk.
type CasesModule = typeof import('@/data/cases');
let _casesPromise: Promise<CasesModule> | null = null;
const loadCases = (): Promise<CasesModule> => {
  if (!_casesPromise) _casesPromise = import('@/data/cases');
  return _casesPromise;
};
import { matchObjectiveToCase } from '@/data/simulationObjectives';
import { applyTreatmentEffectEnhanced, ensureCompleteVitals, buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { applyTreatmentEffectGradual, type Treatment } from '@/data/enhancedTreatmentEffects';
import { applyDeterioration, getDeteriorationStatus, determineSeverity, type CaseSeverity } from '@/data/deteriorationSystem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import {
  Stethoscope, GraduationCap, ClipboardCheck, RotateCcw,
  FileText, Sparkles, CheckCircle2, Home, ChevronRight, ArrowLeft,
  History, BarChart3, Loader2, Activity, Clock, Target, BookOpen, Users
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Lazy load the student panel
const StudentPanel = lazy(() => import('@/components/StudentPanel'));

// Lazy load classroom multiplayer UIs (Phase 4) — only loaded when the user
// clicks into one of the classroom entry points, so single-player bundles
// aren't penalised.
const ClassroomHost = lazy(() => import('@/components/classroom/ClassroomHost'));
const ClassroomJoin = lazy(() => import('@/components/classroom/ClassroomJoin'));

import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { CommandPalette } from '@/components/CommandPalette';
import { CaseSkeleton } from '@/components/CaseSkeleton';

// Lazy load heavy components for better performance
const CaseDisplay = lazy(() => import('@/components/CaseDisplay').then(m => ({ default: m.CaseDisplay })));
const AssessmentPanel = lazy(() => import('@/components/AssessmentPanel').then(m => ({ default: m.AssessmentPanel })));
const ManagementView = lazy(() => import('@/components/ManagementView').then(m => ({ default: m.ManagementView })));
const SessionSummary = lazy(() => import('@/components/SessionSummary').then(m => ({ default: m.SessionSummary })));
const SessionTimer = lazy(() => import('@/components/SessionTimer').then(m => ({ default: m.SessionTimer })));
const ClinicalReferenceDialog = lazy(() => import('@/components/ClinicalReferenceDialog').then(m => ({ default: m.ClinicalReferenceDialog })));
const ObjectiveSetupPanel = lazy(() => import('@/components/ObjectiveSetupPanel').then(m => ({ default: m.ObjectiveSetupPanel })));
const WorkspaceLayout = lazy(() => import('@/components/Workspace').then(m => ({ default: m.WorkspaceLayout })));
import { ComplicationPanel, useComplicationManager } from '@/components/ComplicationManager';
import { LandingPage } from '@/components/LandingPage';

// Enhanced loading card component with skeleton UI
function LoadingCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-12 flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <div className="absolute inset-0 animate-ping opacity-20">
            <Loader2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading case data...</p>
        <div className="mt-4 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to create session from case - avoids duplication
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

// Empty state component
function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Activity className="w-12 h-12 text-primary/60" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Case Generated Yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Generate your first case to start training. Select your year level and preferred category, then click Generate.
      </p>
      <Button onClick={onGenerate} size="lg" className="gap-2">
        <Sparkles className="h-4 w-4" />
        Generate First Case
      </Button>
    </div>
  );
}

type UserRole = 'none' | 'educator' | 'student' | 'classroom-host' | 'classroom-join';

function App() {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('paramedic-role') as UserRole) || 'none';
  });

  // Lazy-loaded case bundle. Starts empty; populates on mount so the
  // initial paint doesn't block on 400+ KB of case data. Consumers that
  // look up or iterate `allCases` gracefully degrade to an empty list
  // until this resolves (visible stat numbers default to a "100+"
  // marketing placeholder; lookups re-run when the state populates).
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

  // Persist role selection
  useEffect(() => {
    if (userRole !== 'none') {
      localStorage.setItem('paramedic-role', userRole);
    }
  }, [userRole]);

  const handleRoleExit = useCallback(() => {
    setUserRole('none');
    localStorage.removeItem('paramedic-role');
  }, []);

  // Classroom entry points are ephemeral — never persisted, so if the user
  // reloads they land back at role selection. We strip them on mount.
  useEffect(() => {
    if (userRole === 'classroom-host' || userRole === 'classroom-join') {
      localStorage.removeItem('paramedic-role');
    }
  }, [userRole]);

  // Landing page
  if (userRole === 'none') {
    return (
      <>
        <LandingPage 
          onRoleSelect={(role) => setUserRole(role)} 
          caseCount={allCases.length}
        />
        {/* ⌘K works on the landing screen too — jump straight into a case. */}
        <CommandPalette
          onCaseSelect={() => setUserRole('educator')}
        />
      </>
    );
  }

  // Suspense fallback is a structured skeleton rather than a lonely spinner —
  // perceived-performance win: users see layout immediately instead of blank.
  const suspenseFallback = <CaseSkeleton />;

  // Classroom instructor host — lobby + live case view
  if (userRole === 'classroom-host') {
    return (
      <Suspense fallback={suspenseFallback}>
        <ClassroomHost onExit={handleRoleExit} />
        <Toaster position="top-right" richColors closeButton />
      </Suspense>
    );
  }

  // Classroom student join
  if (userRole === 'classroom-join') {
    return (
      <Suspense fallback={suspenseFallback}>
        <ClassroomJoin onExit={handleRoleExit} />
        <Toaster position="top-right" richColors closeButton />
      </Suspense>
    );
  }

  // Student panel
  if (userRole === 'student') {
    return (
      <Suspense fallback={suspenseFallback}>
        <StudentPanel onExit={handleRoleExit} />
        <CommandPalette onSwitchRole={handleRoleExit} />
        <Toaster position="top-right" richColors closeButton />
      </Suspense>
    );
  }

  // Educator panel (existing App component below)
  return <EducatorPanel onExit={handleRoleExit} allCases={allCases} />;
}

function EducatorPanel({ onExit, allCases }: { onExit: () => void; allCases: CaseScenario[] }) {
  const { t } = useTranslation();
  const [currentCase, setCurrentCase] = useState<CaseScenario | null>(null);
  const [selectedYear, setSelectedYear] = useState<StudentYear>('3rd-year');
  const [session, setSession] = useState<CaseSession | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [caseHistory, setCaseHistory] = useState<CaseScenario[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVitals, setCurrentVitals] = useState<VitalSigns | null>(null);
  const [previousVitals, setPreviousVitals] = useState<VitalSigns | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalSigns[]>([]);
  const [appliedTreatments, setAppliedTreatments] = useState<AppliedTreatment[]>([]);

  // Deterioration state
  const [deteriorationSeverity, setDeteriorationSeverity] = useState<CaseSeverity>('stable');
  const [deteriorationMinutes, setDeteriorationMinutes] = useState(0);

  // Guided simulation flow state
  const [showObjectiveSetup, setShowObjectiveSetup] = useState(false);

  // Complication manager hook
  const {
    activeComplications,
    triggerComplication,
    resolveComplication,
    ignoreComplication,
    clearComplications,
  } = useComplicationManager();

  // Deterioration timer — applies vital decay every 30 seconds based on case severity
  useEffect(() => {
    if (!currentCase || !currentVitals) return;
    
    const interval = setInterval(() => {
      setDeteriorationMinutes(prev => {
        const newMinutes = prev + 0.5; // 30 seconds = 0.5 minutes
        
        // Apply deterioration
        const treatmentNames = appliedTreatments.map(t => t.description);
        const result = applyDeterioration(currentVitals, deteriorationSeverity, 0.5, treatmentNames);
        
        if (result.changes.length > 0) {
          setCurrentVitals(result.newVitals);
          setVitalsHistory(prevHistory => [...prevHistory, result.newVitals]);
          setPreviousVitals(currentVitals);
          
          // Show toast for critical changes
          if (result.isCritical) {
            toast.warning('Patient deteriorating!', {
              description: result.changes.slice(0, 2).join(', '),
              icon: <Activity className="h-4 w-4 text-red-500" />,
            });
          }
        }
        
        return newMinutes;
      });
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [currentCase, currentVitals, deteriorationSeverity, appliedTreatments]);

  // Load saved session from localStorage once the case bundle is ready.
  // Re-runs when `allCases` populates (async on mount) so the savedCaseId
  // lookup finds the right case instead of silently no-op'ing against
  // the initial empty array.
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (hasRestoredRef.current) return;
    if (allCases.length === 0) return;
    hasRestoredRef.current = true;
    const savedSession = localStorage.getItem('paramedic-session');
    const savedVitals = localStorage.getItem('paramedic-vitals');
    const savedVitalsHistory = localStorage.getItem('paramedic-vitals-history');
    const savedCaseId = localStorage.getItem('paramedic-current-case');
    
    if (savedCaseId) {
      const foundCase = allCases.find(c => c.id === savedCaseId);
      if (foundCase) {
        setCurrentCase(foundCase);
        
        if (savedSession) {
          try {
            const parsedSession = JSON.parse(savedSession);
            setSession(parsedSession);
          } catch (e) {
            console.error('Failed to parse saved session:', e);
          }
        }
        
        if (savedVitals) {
          try {
            const parsedVitals = JSON.parse(savedVitals);
            setCurrentVitals(parsedVitals);
          } catch (e) {
            console.error('Failed to parse saved vitals:', e);
          }
        }
        
        if (savedVitalsHistory) {
          try {
            const parsedHistory = JSON.parse(savedVitalsHistory);
            setVitalsHistory(parsedHistory);
          } catch (e) {
            console.error('Failed to parse saved vitals history:', e);
          }
        }
      }
    }
  }, [allCases]);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('paramedic-session', JSON.stringify(session));
    } else {
      localStorage.removeItem('paramedic-session');
    }
  }, [session]);

  // Save vitals to localStorage whenever they change
  useEffect(() => {
    if (currentVitals) {
      localStorage.setItem('paramedic-vitals', JSON.stringify(currentVitals));
    } else {
      localStorage.removeItem('paramedic-vitals');
    }
  }, [currentVitals]);

  // Save vitals history to localStorage whenever it changes
  useEffect(() => {
    if (vitalsHistory.length > 0) {
      localStorage.setItem('paramedic-vitals-history', JSON.stringify(vitalsHistory));
    } else {
      localStorage.removeItem('paramedic-vitals-history');
    }
  }, [vitalsHistory]);

  // Save current case ID to localStorage
  useEffect(() => {
    if (currentCase) {
      localStorage.setItem('paramedic-current-case', currentCase.id);
    } else {
      localStorage.removeItem('paramedic-current-case');
    }
  }, [currentCase]);

  // Save applied treatments to localStorage
  useEffect(() => {
    if (appliedTreatments.length > 0) {
      localStorage.setItem('paramedic-applied-treatments', JSON.stringify(appliedTreatments));
    } else {
      localStorage.removeItem('paramedic-applied-treatments');
    }
  }, [appliedTreatments]);

  // Load applied treatments from localStorage
  useEffect(() => {
    const savedTreatments = localStorage.getItem('paramedic-applied-treatments');
    if (savedTreatments) {
      try {
        const parsedTreatments = JSON.parse(savedTreatments);
        setAppliedTreatments(parsedTreatments);
      } catch (e) {
        console.error('Failed to parse saved treatments:', e);
      }
    }
  }, []);

  // Save case history to localStorage whenever it changes
  useEffect(() => {
    if (caseHistory.length > 0) {
      localStorage.setItem('paramedic-case-history', JSON.stringify(caseHistory));
    } else {
      localStorage.removeItem('paramedic-case-history');
    }
  }, [caseHistory]);

  // Load case history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('paramedic-case-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setCaseHistory(parsedHistory);
      } catch (e) {
        console.error('Failed to parse saved case history:', e);
      }
    }
  }, []);

  // URL state management for deep linking and browser history.
  // Re-runs when `allCases` populates so a deep-linked case-id in the
  // URL still resolves after the lazy case bundle finishes loading.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('case');
    const tab = params.get('tab');
    const year = params.get('year');
    // Skip the case-id lookup until the bundle is ready; this effect
    // will re-fire when allCases populates.
    if (caseId && allCases.length === 0) return;

    // Schedule state updates to avoid synchronous setState in render phase
    const scheduleUpdate = () => {
      if (year && (year === '1st-year' || year === '2nd-year' || year === '3rd-year' || year === '4th-year' || year === 'diploma')) {
        setSelectedYear(year as StudentYear);
      }

      if (caseId) {
        const foundCase = allCases.find(c => c.id === caseId);
        if (foundCase) {
          setCurrentCase(foundCase);
          const yearLevel = (year === '1st-year' || year === '2nd-year' || year === '3rd-year' || year === '4th-year' || year === 'diploma') 
            ? year as StudentYear 
            : selectedYear;
          const newSession = createSessionFromCase(foundCase, yearLevel);
          setSession(newSession);
        }
      }
    };

    // Use setTimeout to defer state updates to next tick
    const timeoutId = setTimeout(scheduleUpdate, 0);
    return () => clearTimeout(timeoutId);
  }, [allCases]);

  // Update URL when case changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (currentCase) {
      params.set('case', currentCase.id);
      window.history.replaceState({}, '', `?${params.toString()}`);
    } else {
      params.delete('case');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [currentCase]);

  // Timer state
  const [elapsedTime, setElapsedTime] = useState<string>('');
  const [timeTakenSeconds, setTimeTakenSeconds] = useState<number>(0);

  // Initialize gradual vital changes hook
  const {
    currentVitals: animatedVitals,
    isAnimating: isVitalsAnimating,
    progress: vitalChangeProgress,
    startGradualChange,
  } = useGradualVitalChanges();

  // Sync animated vitals with current vitals
  useEffect(() => {
    if (animatedVitals && !isVitalsAnimating) {
      setCurrentVitals(animatedVitals);
    }
  }, [animatedVitals, isVitalsAnimating]);

  // Memoize filtered checklist to avoid recalculation
  const filteredChecklist = useMemo(() => {
    if (!currentCase) return [];
    return (currentCase.studentChecklist || []).filter(item => item.yearLevel?.includes(selectedYear));
  }, [currentCase, selectedYear]);

  // Memoize category lookups
  const categoryLookup = useMemo(() =>
    Object.fromEntries(caseCategories.map(c => [c.value, c])),
    []
  );

  // Memoize case counts by category to avoid recalculation on every render
  const caseCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    caseCategories.forEach(cat => {
      counts[cat.value] = allCases.filter(c => c.category === cat.value).length;
    });
    return counts;
  }, [allCases]);

  // Memoize goHome to avoid recreation
  const goHome = useCallback(() => {
    setCurrentCase(null);
    setSession(null);
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    setShowObjectiveSetup(false);
    toast.info('Returned to home', {
      icon: <Home className="h-4 w-4" />,
    });
  }, []);

  // Generate a new case - memoized with loading state
  // Supports optional objective for guided simulation flow
  const generateCase = useCallback(async (objective?: SimulationObjective) => {
    setIsGenerating(true);

    // Ensure the case bundle is resolved before picking one — on a fresh
    // page load this await completes immediately because the initial
    // useEffect already kicked off loadCases(). Keeps the UX delay from
    // prior `await 300` but removes any chance of undefined references
    // if the user spam-clicks Generate before cases have resolved.
    const mod = await loadCases();
    await new Promise(resolve => setTimeout(resolve, 300));

    let newCase: CaseScenario;

    if (objective) {
      // Objective-driven: score all cases and pick the best match
      const scoredCases = matchObjectiveToCase(objective, mod.allCases);
      newCase = scoredCases.length > 0
        ? scoredCases[Math.floor(Math.random() * Math.min(3, scoredCases.length))] // Pick from top 3
        : mod.getRandomCase({
            yearLevel: selectedYear,
            category: objective.relatedCategories[0] || (selectedCategory !== 'all' ? selectedCategory : undefined)
          });

    } else {
      newCase = mod.getRandomCase({
        yearLevel: selectedYear,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
    }

    setCurrentCase(newCase);

    // Initialize vitals with complete fields
    const initialVitals = buildInitialVitalsFromCase(newCase);
    setCurrentVitals(initialVitals);
    setVitalsHistory([initialVitals]);

    // Determine deterioration severity based on case category and initial vitals
    const severity = determineSeverity(newCase.category, initialVitals);
    setDeteriorationSeverity(severity);
    setDeteriorationMinutes(0);

    // Add to history
    setCaseHistory(prev => [newCase, ...prev].slice(0, 10));

    // Create new session using helper
    const newSession = createSessionFromCase(newCase, selectedYear);
    setSession(newSession);
    setIsGenerating(false);

    // Clear any previous state
    clearComplications();
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    setApplyingTreatmentId(undefined);

    toast.success(objective ? 'Guided case generated!' : 'New case generated!', {
      description: newCase.title,
      icon: objective ? <Target className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />,
    });
  }, [selectedYear, selectedCategory]);

  // Toggle checklist item - optimized with treatment effects
  const toggleChecklistItem = useCallback((itemId: string, checked: boolean) => {
    if (!session || !currentCase) return;

    const newCompletedItems = checked
      ? [...session.completedItems, itemId]
      : session.completedItems.filter(id => id !== itemId);

    const caseChecklist = currentCase.studentChecklist;
    const newScore = newCompletedItems.reduce((sum, id) => {
      const item = caseChecklist.find(i => i.id === id);
      return sum + (item?.points || 0);
    }, 0);

    setSession(prev => prev ? {
      ...prev,
      completedItems: newCompletedItems,
      score: newScore,
    } : null);

    // Show toast for critical items and apply treatment effects
    if (checked) {
      const item = caseChecklist.find(i => i.id === itemId);
      if (item?.critical) {
        toast.success('Critical action completed!', {
          description: item.description,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
      }

      // Apply specific treatment effects to vitals with gradual animation
      if (currentVitals && item) {
        const { vitals: targetVitals, improvements, hasImprovement } = applyTreatmentEffectEnhanced(
          item.description,
          currentVitals,
          currentCase.category
        );

        if (hasImprovement && improvements.length > 0) {
          // Create treatment record
          const newTreatment: AppliedTreatment = {
            id: item.id,
            description: item.description,
            appliedAt: new Date().toISOString(),
            effects: improvements.map(imp => {
              // Parse improvement string (e.g., "SpO₂ 88% → 96%")
              const match = imp.match(/(.+?)\s+(.+?)\s*→\s*(.+)/);
              if (match) {
                return {
                  vitalSign: match[1].trim(),
                  oldValue: match[2].trim(),
                  newValue: match[3].trim(),
                  unit: ''
                };
              }
              return {
                vitalSign: imp,
                oldValue: '',
                newValue: '',
                unit: ''
              };
            }),
            category: item.category,
            isActive: true
          };

          setAppliedTreatments(prev => [...prev, newTreatment]);
          setPreviousVitals(currentVitals);

          // Start gradual vital change animation (3-5 seconds for realistic effect)
          const animationDuration = improvements.length > 2 ? 5000 : 3000;
          startGradualChange(
            currentVitals,
            targetVitals,
            animationDuration,
            (updatedVitals) => {
              // Called on each frame during animation
              setCurrentVitals(updatedVitals);
            },
            () => {
              // Called when animation completes
              setVitalsHistory(prev => [...prev, targetVitals]);
              toast.success('Treatment complete!', {
                description: `${item.description} - Vitals stabilized`,
                icon: <Activity className="h-4 w-4 text-green-500" />,
              });
            }
          );
        }
      }
    }
  }, [session, currentCase, currentVitals, startGradualChange]);

  // Apply enhanced treatment from the Treatment Application Panel
  const [applyingTreatmentId, setApplyingTreatmentId] = useState<string | undefined>();
  const [appliedTreatmentIds, setAppliedTreatmentIds] = useState<string[]>([]);

  const applyEnhancedTreatment = useCallback((treatment: Treatment) => {
    if (!currentVitals || !currentCase) return;

    setApplyingTreatmentId(treatment.id);

    // Calculate the full treatment effect at 100% progress
    const { vitals: targetVitals, hasChanges, changes } = applyTreatmentEffectGradual(
      treatment,
      currentVitals,
      1.0 // full effect
    );

    if (hasChanges) {
      // Create treatment record
      const newTreatment: AppliedTreatment = {
        id: treatment.id,
        description: treatment.name,
        appliedAt: new Date().toISOString(),
        effects: changes.map(change => ({
          vitalSign: change,
          oldValue: '',
          newValue: change,
          unit: ''
        })),
        category: treatment.category,
        isActive: true
      };

      setAppliedTreatments(prev => [...prev, newTreatment]);
      setAppliedTreatmentIds(prev => [...prev, treatment.id]);
      setPreviousVitals(currentVitals);

      // Animation duration based on treatment onset type
      const durations: Record<string, number> = {
        immediate: 1000,
        fast: 2000,
        moderate: 4000,
        gradual: 6000,
        delayed: 8000,
      };
      const animDuration = durations[treatment.onset] || 3000;

      startGradualChange(
        currentVitals,
        targetVitals,
        animDuration,
        (updatedVitals) => {
          setCurrentVitals(updatedVitals);
        },
        () => {
          setVitalsHistory(prev => [...prev, targetVitals]);
          setApplyingTreatmentId(undefined);
          toast.success(`${treatment.name} applied`, {
            description: changes.join(', '),
            icon: <Activity className="h-4 w-4 text-green-500" />,
          });
        }
      );
    } else {
      setApplyingTreatmentId(undefined);
      setAppliedTreatmentIds(prev => [...prev, treatment.id]);
      toast.info(`${treatment.name} applied`, {
        description: 'No immediate vital sign changes',
      });
    }
  }, [currentVitals, currentCase, startGradualChange]);

  // Handle objective setup completion - generates guided case
  const handleObjectiveSet = useCallback((objective: SimulationObjective) => {
    setShowObjectiveSetup(false);
    generateCase(objective);
  }, [generateCase]);

  // Handle skipping objective setup - generates random case
  const handleSkipObjective = useCallback(() => {
    setShowObjectiveSetup(false);
    generateCase();
  }, [generateCase]);

  // Load a case from history - memoized
  const loadCaseFromHistory = useCallback((caseItem: CaseScenario) => {
    setCurrentCase(caseItem);
    const newSession = createSessionFromCase(caseItem, selectedYear);
    setSession(newSession);
    
    // Initialize vitals with complete fields
    const initialVitals = buildInitialVitalsFromCase(caseItem);
    setCurrentVitals(initialVitals);
    setVitalsHistory([initialVitals]);
    
    toast.info(`Loaded: ${caseItem.title}`);
  }, [selectedYear]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const caseId = params.get('case');

      if (!caseId && currentCase) {
        goHome();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentCase, goHome]);

  // Keyboard shortcuts - defined after callbacks to avoid dependency issues
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to go back home
      if (e.key === 'Escape' && currentCase) {
        goHome();
      }
      // N for new case (only when not typing in input)
      if ((e.key === 'n' || e.key === 'N') && currentCase &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        generateCase();
      }
      // Workspace shortcuts could be added here later
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCase, goHome, generateCase]);

  return (
    <div className="min-h-screen bg-background">
      {/* ⌘K command palette — fast case search + actions, any screen. */}
      <CommandPalette onCaseSelect={loadCaseFromHistory} onSwitchRole={onExit} />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Clickable to go home */}
            <button
              onClick={goHome}
              className="flex items-center gap-3 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300">
                <Stethoscope className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="heading-premium text-base sm:text-lg group-hover:text-primary transition-colors leading-tight truncate">
                    {t('app.name')}
                  </h1>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 shrink-0">{t('role.educatorBadge')}</Badge>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('header.caseGeneration')}</p>
              </div>
            </button>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2">
              <Suspense fallback={null}>
                <ClinicalReferenceDialog />
              </Suspense>
              {currentCase && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goHome}
                    className="hidden sm:flex gap-1 hover:bg-muted/80 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    <span>{t('header.home')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateCase}
                    disabled={isGenerating}
                    className="gap-1"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{isGenerating ? t('header.generating') : t('header.newCase')}</span>
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={onExit} className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                <span className="hidden sm:inline">{t('header.switchRole')}</span>
              </Button>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Enhanced Breadcrumb Navigation - hidden on mobile */}
          {currentCase && (
            <div className="hidden sm:flex items-center gap-2 mt-3 text-sm text-muted-foreground border-t pt-3 animate-fade-in">
              <button
                onClick={goHome}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Home className="h-3 w-3" />
                Home
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium truncate max-w-[300px]">
                {currentCase.title}
              </span>
              <Badge variant="outline" className="text-[10px] ml-2 ">
                {categoryLookup[currentCase.category]?.label}
              </Badge>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {showObjectiveSetup && !currentCase ? (
          /* Guided Objective Setup Screen */
          <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowObjectiveSetup(false)}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            <Suspense fallback={<LoadingCard />}>
              <ObjectiveSetupPanel
                selectedYear={selectedYear}
                selectedCategory={selectedCategory}
                onObjectiveSet={handleObjectiveSet}
                onSkip={handleSkipObjective}
              />
            </Suspense>
          </div>
        ) : !currentCase ? (
          /* Home / Case Generator Screen - Redesigned */
          <div className="animate-fade-in space-y-8">
            {/* Professional Hero Section */}
            <div className="mx-auto max-w-3xl">
              <Card className="overflow-hidden relative border border-border shadow-sm">
                
                <CardHeader className="text-center relative pb-2">
                  {/* Animated Icon Badge */}
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-sm">
                    <Stethoscope className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <CardTitle className="heading-clean text-3xl">
                    {t('generator.title')}
                  </CardTitle>
                  <p className="text-base text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                    {t('generator.subtitle')}
                  </p>
                </CardHeader>

                <CardContent className="space-y-8 relative">
                  {/* Year Level Selection - Visual Cards */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      {t('generator.selectYear')}
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {yearLevels.map((year, index) => (
                        <button
                          key={year.value}
                          onClick={() => setSelectedYear(year.value as StudentYear)}
                          className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-300 ${selectedYear === year.value
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50'
                            }`}
                          style={{ animationDelay: `${index * 75}ms` }}
                        >
                          <div className={`p-2 rounded-lg transition-all duration-300 ${selectedYear === year.value ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'}`}>
                            <GraduationCap className={`h-5 w-5 transition-colors duration-300 ${selectedYear === year.value ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`} />
                          </div>
                          <span className={`text-sm font-semibold transition-colors duration-300 ${selectedYear === year.value ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                            {year.label}
                          </span>
                          {selectedYear === year.value && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Selection - Visual Grid */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      {t('generator.selectCategory')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm whitespace-nowrap ${selectedCategory === 'all'
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border/50 hover:border-primary/30 hover:bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        <Sparkles className="h-4 w-4 shrink-0" />
                        {t('generator.allCases')}
                      </button>
                      {caseCategories.slice(0, 7).map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm whitespace-nowrap ${selectedCategory === cat.value
                            ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm'
                            : 'border-border/50 hover:border-primary/30 hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${cat.color}`} />
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => generateCase()}
                      disabled={isGenerating}
                      size="lg"
                      className="w-full gap-3 text-lg py-7 font-semibold shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200 bg-primary"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t('generator.generatingCase')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          {t('generator.quickGenerate')}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowObjectiveSetup(true)}
                      disabled={isGenerating}
                      variant="outline"
                      size="lg"
                      className="w-full gap-3 text-base py-6 font-medium border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-200"
                    >
                      <Target className="h-5 w-5 text-primary" />
                      {t('generator.guidedSetup')}
                      <Badge variant="secondary" className="ml-2 text-[10px]">INACSL</Badge>
                    </Button>
                  </div>

                  {/* Professional Stats Bar */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
                    <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                        <div className="text-2xl font-bold text-foreground">{allCases.length > 0 ? allCases.length : 100}+</div>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">{t('generator.caseScenarios')}</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <BarChart3 className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                        <div className="text-2xl font-bold text-foreground">{caseCategories.length}</div>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">{t('generator.categoriesLabel')}</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <GraduationCap className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                        <div className="text-2xl font-bold text-foreground">4</div>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">{t('generator.yearLevels')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories and Getting Started Guide */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Category Cards - Enhanced */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground/90">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Browse by Category
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {caseCategories.map((cat, index) => (
                    <Card
                      key={cat.value}
                      className={`group cursor-pointer border transition-all duration-200 hover:shadow-sm ${
                        selectedCategory === cat.value 
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                          : 'border-border/50 bg-card hover:border-primary/40 hover:bg-muted/30'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        toast.success(`${cat.label} cases selected`, { 
                          description: 'Click Generate to start training',
                          duration: 2000
                        });
                      }}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className={`h-1.5 w-12 rounded-full ${cat.color} shadow-sm group-hover:w-16 transition-all duration-300`} />
                        <div>
                          <p className={`text-sm font-semibold transition-colors ${selectedCategory === cat.value ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                            {cat.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {caseCountsByCategory[cat.value]} {caseCountsByCategory[cat.value] === 1 ? 'case' : 'cases'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Getting Started Guide - New */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Quick Guide
                </h3>
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium">Select your year</p>
                        <p className="text-xs text-muted-foreground">Choose based on your training level</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pick a category</p>
                        <p className="text-xs text-muted-foreground">Focus on specific case types or mix it up</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium">Generate & train</p>
                        <p className="text-xs text-muted-foreground">Work through the case and track your progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Cases History - Enhanced */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground/80">
                    <History className="h-4 w-4 text-muted-foreground" />
                    Recent Cases
                  </h4>
                  {caseHistory.length > 0 ? (
                    <div className="space-y-2">
                      {caseHistory.slice(0, 5).map((caseItem, index) => (
                        <Card
                          key={`${caseItem.id}-${index}`}
                          className="cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
                          onClick={() => loadCaseFromHistory(caseItem)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                  {caseItem.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {categoryLookup[caseItem.category]?.label}
                                </p>
                              </div>
                              <Badge
                                variant={caseItem.priority === 'critical' ? 'destructive' : caseItem.priority === 'high' ? 'default' : 'secondary'}
                                className="text-[10px] shrink-0"
                              >
                                {priorities.find(p => p.value === caseItem.priority)?.label}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed border-border/50 bg-muted/20">
                      <CardContent className="p-4 text-center text-muted-foreground">
                        <History className="h-6 w-6 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No recent cases</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Case Display Screen with Glassmorphism Navigation */
          <div className="animate-fade-in">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goHome}
                className="gap-1 text-muted-foreground hover:text-foreground -ml-2 h-8 text-xs sm:text-sm sm:h-9"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 rtl:rotate-180" />
                <span className="hidden sm:inline">{t('header.backToHome')}</span>
                <span className="sm:hidden">{t('header.back')}</span>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {t('header.pressEscForHome')} <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">ESC</kbd>
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">N</kbd> {t('header.pressNForNewCase')}
                </span>
              </div>
            </div>

            {/* Case Header - Always visible */}
            <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant={currentCase.priority === 'critical' ? 'destructive' : currentCase.priority === 'high' ? 'default' : 'secondary'}
                    className={` ${currentCase.priority === 'critical' ? 'priority-critical' : ''}`}
                  >
                    {priorities.find(p => p.value === currentCase.priority)?.label}
                  </Badge>
                  <Badge variant="outline" className=" stagger-1">
                    {categoryLookup[currentCase.category]?.label}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold">{currentCase.title}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {currentCase.dispatchInfo.location} • {currentCase.dispatchInfo.timeOfDay}
                </p>
              </div>
            </div>

            {/* Non-Linear Workspace Layout */}
            <Suspense fallback={<LoadingCard />}>
              <WorkspaceLayout
                caseData={currentCase}
                vitals={currentVitals}
                previousVitals={previousVitals}
                activeComplications={activeComplications}
                onResolveComplication={resolveComplication}
                onIgnoreComplication={ignoreComplication}
                deteriorationStatus={getDeteriorationStatus(deteriorationSeverity, deteriorationMinutes)}
                session={session}
                onAction={(actionId) => {
                  const actionMessages: Record<string, { title: string; description: string }> = {
                    'defibrillate': { title: 'Defibrillation', description: '200J biphasic shock delivered' },
                    'drug': { title: 'Drug Administration', description: 'Medication administered per protocol' },
                    'airway': { title: 'Airway Management', description: 'Airway secured and managed' },
                    'iv': { title: 'IV Access', description: 'Intravenous access established' },
                    'cardiac': { title: 'Cardiac Monitoring', description: '12-lead ECG acquired and monitoring initiated' },
                    'transport': { title: 'Transport', description: 'Patient packaged for transport' },
                    'backup': { title: 'Backup Requested', description: 'Additional resources requested' },
                  };
                  const msg = actionMessages[actionId] || { title: 'Action', description: actionId };
                  toast.success(msg.title, { description: msg.description });
                }}
                onDecision={(itemId, optionId) => {
                  // Try to find a matching checklist item and toggle it
                  const checklistItem = currentCase.studentChecklist?.find(item => item.id === itemId || item.id === optionId);
                  if (checklistItem && session) {
                    const isCompleted = session.completedItems.includes(checklistItem.id);
                    toggleChecklistItem(checklistItem.id, !isCompleted);
                  } else {
                    toast.success('Decision recorded', { description: `Option ${optionId} selected` });
                  }
                }}
              />
            </Suspense>

            {/* Keep existing vitals monitor, complications, and checklist below workspace */}
            {currentCase && (
              <div className="mt-6 space-y-4">
                {/* Session Timer */}
                <Suspense fallback={<Card><CardContent className="p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></CardContent></Card>}>
                  <SessionTimer
                    duration={currentCase.estimatedDuration || 20}
                    onTimerComplete={() => {
                      toast.info('Timer complete! Case finished.', {
                        icon: <Clock className="h-4 w-4" />,
                      });
                    }}
                    onTimerStart={() => {
                      toast.success('Timer started - Case in progress', {
                        icon: <Activity className="h-4 w-4" />,
                      });
                    }}
                    onElapsedTimeChange={(formattedTime, seconds) => {
                      setElapsedTime(formattedTime);
                      setTimeTakenSeconds(seconds);
                      
                      // Trigger random complications (5% chance per 30 seconds)
                      if (seconds > 0 && seconds % 30 === 0 && Math.random() < 0.05) {
                        triggerComplication(currentCase?.category);
                      }
                    }}
                  />
                </Suspense>

                {/* Complication Panel */}
                {activeComplications.length > 0 && (
                  <ComplicationPanel
                    activeComplications={activeComplications}
                    onResolve={resolveComplication}
                    onIgnore={ignoreComplication}
                  />
                )}

                {/* Checklist */}
                {session && (
                  <Card className="border-2 border-primary/30 shadow-lg shadow-primary/5 animate-fade-in-up">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="p-1.5 rounded-lg bg-primary/10">
                            <ClipboardCheck className="h-5 w-5 text-primary" />
                          </div>
                          <span>Student Checklist</span>
                        </CardTitle>
                        <Badge 
                          variant={filteredChecklist.filter(i => !session.completedItems.includes(i.id)).length === 0 ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {session.completedItems.length}/{filteredChecklist.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-1 pt-4">
                      {filteredChecklist.map((item, index) => (
                        <label
                          key={item.id}
                          className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-200 hover-lift ${session.completedItems.includes(item.id)
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : item.critical 
                              ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 hover:bg-red-50 hover:border-red-300'
                              : 'hover:bg-muted/50 hover:border-primary/30'
                            }`}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {session.completedItems.includes(item.id) ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 " />
                            ) : (
                              <div className={`h-5 w-5 rounded border-2 transition-colors ${item.critical ? 'border-red-400 hover:border-red-500' : 'border-muted-foreground/30 hover:border-primary/50'}`} />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={session.completedItems.includes(item.id)}
                            onChange={(e) => toggleChecklistItem(item.id, e.target.checked)}
                            className="sr-only"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-tight transition-all duration-200 ${session.completedItems.includes(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                {item.category}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {item.points} pts
                              </span>
                              {item.critical && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 animate-pulse">
                                  Critical
                                </Badge>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Session Summary */}
                {session && (
                  <Suspense fallback={<LoadingCard />}>
                    <SessionSummary
                      session={session}
                      caseData={currentCase}
                      elapsedTime={elapsedTime}
                      timeTakenSeconds={timeTakenSeconds}
                      appliedTreatments={appliedTreatments}
                      vitalsHistory={vitalsHistory}
                      instructorNotes={session.notes}
                    />
                  </Suspense>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              UAE Paramedic Case Generator • For educational purposes
            </p>
            {currentCase && (
              <div className="hidden sm:flex items-center gap-3">
                <span>Shortcuts:</span>
                <span className="flex items-center gap-1"><kbd className="px-1 bg-background rounded border font-mono">ESC</kbd> Home</span>
                <span className="flex items-center gap-1"><kbd className="px-1 bg-background rounded border font-mono">N</kbd> New Case</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          className: 'font-sans',
        }}
      />
    </div>
  );
}

export default App;
