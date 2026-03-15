import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import type { CaseScenario, StudentYear, CaseSession, VitalSigns, AppliedTreatment, SimulationObjective, DebriefingResource } from '@/types';
import { useGradualVitalChanges } from '@/hooks/useGradualVitalChanges';
import { allCases, getRandomCase, yearLevels, caseCategories, priorities } from '@/data/cases';
import { matchObjectiveToCase } from '@/data/simulationObjectives';
import { getResourcesForDebriefing } from '@/data/diversifiedResources';
import { applyTreatmentEffectEnhanced, ensureCompleteVitals } from '@/data/treatmentEffects';
import { applyTreatmentEffectGradual, type Treatment } from '@/data/enhancedTreatmentEffects';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Stethoscope, GraduationCap, ClipboardCheck, RotateCcw,
  FileText, Sparkles, CheckCircle2, Home, ChevronRight, ArrowLeft,
  History, BarChart3, Loader2, Activity, Clock, Target
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Lazy load heavy components for better performance
const CaseDisplay = lazy(() => import('@/components/CaseDisplay').then(m => ({ default: m.CaseDisplay })));
const AssessmentPanel = lazy(() => import('@/components/AssessmentPanel').then(m => ({ default: m.AssessmentPanel })));
const ManagementView = lazy(() => import('@/components/ManagementView').then(m => ({ default: m.ManagementView })));
const SessionSummary = lazy(() => import('@/components/SessionSummary').then(m => ({ default: m.SessionSummary })));
const SessionTimer = lazy(() => import('@/components/SessionTimer').then(m => ({ default: m.SessionTimer })));
const ClinicalReferenceDialog = lazy(() => import('@/components/ClinicalReferenceDialog').then(m => ({ default: m.ClinicalReferenceDialog })));
const TreatmentsPanel = lazy(() => import('@/components/TreatmentsPanel').then(m => ({ default: m.TreatmentsPanel })));
const TreatmentApplicationPanel = lazy(() => import('@/components/TreatmentApplicationPanel').then(m => ({ default: m.TreatmentApplicationPanel })));
const VitalSignsMonitor = lazy(() => import('@/components/VitalSignsMonitor').then(m => ({ default: m.VitalSignsMonitor })));
const GlassNavigation = lazy(() => import('@/components/GlassNavigation').then(m => ({ default: m.GlassNavigation })));
const ObjectiveSetupPanel = lazy(() => import('@/components/ObjectiveSetupPanel').then(m => ({ default: m.ObjectiveSetupPanel })));
const PreBriefingPanel = lazy(() => import('@/components/PreBriefingPanel').then(m => ({ default: m.PreBriefingPanel })));
import { ComplicationPanel, useComplicationManager } from '@/components/ComplicationManager';
import type { GlassLayer } from '@/components/GlassNavigation';

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
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-float">
        <Activity className="w-12 h-12 text-primary/60" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Case Generated Yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Generate your first case to start training. Select your year level and preferred category, then click Generate.
      </p>
      <Button onClick={onGenerate} size="lg" className="gap-2 btn-glow">
        <Sparkles className="h-4 w-4" />
        Generate First Case
      </Button>
    </div>
  );
}

function App() {
  const [currentCase, setCurrentCase] = useState<CaseScenario | null>(null);
  const [selectedYear, setSelectedYear] = useState<StudentYear>('3rd-year');
  const [session, setSession] = useState<CaseSession | null>(null);
  const [activeTab, setActiveTab] = useState('case');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [caseHistory, setCaseHistory] = useState<CaseScenario[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVitals, setCurrentVitals] = useState<VitalSigns | null>(null);
  const [previousVitals, setPreviousVitals] = useState<VitalSigns | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalSigns[]>([]);
  const [appliedTreatments, setAppliedTreatments] = useState<AppliedTreatment[]>([]);
  const [glassLayer, setGlassLayer] = useState<GlassLayer>('case');

  // Guided simulation flow state
  const [showObjectiveSetup, setShowObjectiveSetup] = useState(false);
  const [simulationObjective, setSimulationObjective] = useState<SimulationObjective | null>(null);
  const [preBriefingCompleted, setPreBriefingCompleted] = useState(false);
  const [debriefingResources, setDebriefingResources] = useState<DebriefingResource[]>([]);

  // Complication manager hook
  const {
    activeComplications,
    triggerComplication,
    resolveComplication,
    ignoreComplication,
    clearComplications,
  } = useComplicationManager();

  // Load saved session from localStorage on mount
  useEffect(() => {
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
  }, []);

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

  // URL state management for deep linking and browser history
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('case');
    const tab = params.get('tab');
    const year = params.get('year');

    // Schedule state updates to avoid synchronous setState in render phase
    const scheduleUpdate = () => {
      if (year && (year === '1st-year' || year === '2nd-year' || year === '3rd-year' || year === '4th-year' || year === 'diploma')) {
        setSelectedYear(year as StudentYear);
      }

      if (tab && ['case', 'assessment', 'management'].includes(tab)) {
        setActiveTab(tab);
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
  }, []);

  // Update URL when case changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (currentCase) {
      params.set('case', currentCase.id);
      params.set('tab', activeTab);
      window.history.replaceState({}, '', `?${params.toString()}`);
    } else {
      params.delete('case');
      params.delete('tab');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [currentCase, activeTab]);

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
  }, []);

  // Memoize goHome to avoid recreation
  const goHome = useCallback(() => {
    setCurrentCase(null);
    setSession(null);
    setActiveTab('case');
    setGlassLayer('case');
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    setShowObjectiveSetup(false);
    setSimulationObjective(null);
    setPreBriefingCompleted(false);
    setDebriefingResources([]);
    toast.info('Returned to home', {
      icon: <Home className="h-4 w-4" />,
    });
  }, []);

  // Generate a new case - memoized with loading state
  // Supports optional objective for guided simulation flow
  const generateCase = useCallback(async (objective?: SimulationObjective) => {
    setIsGenerating(true);

    // Simulate brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    let newCase: CaseScenario;

    if (objective) {
      // Objective-driven: score all cases and pick the best match
      const scoredCases = matchObjectiveToCase(objective, allCases);
      newCase = scoredCases.length > 0
        ? scoredCases[Math.floor(Math.random() * Math.min(3, scoredCases.length))] // Pick from top 3
        : getRandomCase({
            yearLevel: selectedYear,
            category: objective.relatedCategories[0] || (selectedCategory !== 'all' ? selectedCategory : undefined)
          });

      // Generate debriefing resources for this case + objective
      const resources = getResourcesForDebriefing(newCase, objective);
      setDebriefingResources(resources);
    } else {
      newCase = getRandomCase({
        yearLevel: selectedYear,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });

      // Generate debriefing resources without objective
      const resources = getResourcesForDebriefing(newCase);
      setDebriefingResources(resources);
    }

    setCurrentCase(newCase);

    // Initialize vitals with complete fields
    const initialVitals = ensureCompleteVitals(newCase.vitalSignsProgression.initial);
    setCurrentVitals(initialVitals);
    setVitalsHistory([initialVitals]);

    // Add to history
    setCaseHistory(prev => [newCase, ...prev].slice(0, 10));

    // Create new session using helper
    const newSession = createSessionFromCase(newCase, selectedYear);
    setSession(newSession);
    setActiveTab('case');
    setIsGenerating(false);

    // Clear any previous state
    clearComplications();
    setAppliedTreatments([]);
    setAppliedTreatmentIds([]);
    setApplyingTreatmentId(undefined);

    // Route to pre-briefing if guided flow, otherwise straight to case
    if (objective) {
      setGlassLayer('prebriefing');
      setPreBriefingCompleted(false);
      toast.success('Guided case generated!', {
        description: `${newCase.title} — Review pre-briefing before starting`,
        icon: <Target className="h-4 w-4" />,
      });
    } else {
      setGlassLayer('case');
      toast.success('New case generated!', {
        description: newCase.title,
        icon: <Sparkles className="h-4 w-4" />,
      });
    }
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
    setSimulationObjective(objective);
    setShowObjectiveSetup(false);
    generateCase(objective);
  }, [generateCase]);

  // Handle skipping objective setup - generates random case
  const handleSkipObjective = useCallback(() => {
    setShowObjectiveSetup(false);
    setSimulationObjective(null);
    generateCase();
  }, [generateCase]);

  // Load a case from history - memoized
  const loadCaseFromHistory = useCallback((caseItem: CaseScenario) => {
    setCurrentCase(caseItem);
    const newSession = createSessionFromCase(caseItem, selectedYear);
    setSession(newSession);
    
    // Initialize vitals with complete fields
    const initialVitals = ensureCompleteVitals(caseItem.vitalSignsProgression.initial);
    setCurrentVitals(initialVitals);
    setVitalsHistory([initialVitals]);
    
    setActiveTab('case');
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
      // Alt+number navigation for layers and tabs
      if (currentCase && e.altKey) {
        if (e.key === '1') { setGlassLayer('case'); setActiveTab('case'); }
        if (e.key === '2') { setGlassLayer('case'); setActiveTab('assessment'); }
        if (e.key === '3') { setGlassLayer('case'); setActiveTab('management'); }
        if (e.key === '4') setGlassLayer('vitals');
        if (e.key === '5') setGlassLayer('summary');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCase, goHome, generateCase]);

  return (
    <div className="min-h-screen bg-background paper-texture">
      {/* Enhanced Header with glassmorphism */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Clickable to go home */}
            <button
              onClick={goHome}
              className="flex items-center gap-3 group btn-press"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300 shadow-sm group-hover:shadow-md">
                <Stethoscope className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <h1 className="text-base sm:text-xl font-semibold tracking-tight group-hover:text-primary transition-colors leading-tight">
                  <span className="hidden sm:inline">UAE Paramedic Case Generator</span>
                  <span className="sm:hidden">UAE Paramedic<br />Case Generator</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Realistic scenarios for student training</p>
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
                    <span>Home</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateCase}
                    disabled={isGenerating}
                    className="gap-1 btn-glow"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'New Case'}</span>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* Enhanced Breadcrumb Navigation - hidden on mobile */}
          {currentCase && (
            <div className="hidden sm:flex items-center gap-2 mt-3 text-sm text-muted-foreground border-t pt-3 animate-fade-in">
              <button
                onClick={goHome}
                className="hover:text-primary transition-colors flex items-center gap-1 btn-press"
              >
                <Home className="h-3 w-3" />
                Home
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium truncate max-w-[300px]">
                {currentCase.title}
              </span>
              <Badge variant="outline" className="text-[10px] ml-2 animate-pop-in">
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
              <Card className="overflow-hidden relative border-0 shadow-2xl shadow-primary/10">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent pointer-events-none" />
                
                <CardHeader className="text-center relative pb-2">
                  {/* Animated Icon Badge */}
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/20 animate-float">
                    <Stethoscope className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    Paramedic Case Generator
                  </CardTitle>
                  <p className="text-base text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                    Select your training level and generate realistic emergency scenarios to sharpen your clinical skills
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-8 relative">
                  {/* Year Level Selection - Visual Cards */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Select Your Year Level
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {yearLevels.map((year, index) => (
                        <button
                          key={year.value}
                          onClick={() => setSelectedYear(year.value as StudentYear)}
                          className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-300 ${selectedYear === year.value
                            ? 'border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg shadow-primary/10 scale-[1.02]'
                            : 'border-border/50 bg-card hover:border-primary/40 hover:bg-muted/50 hover:shadow-md hover:-translate-y-0.5'
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
                      Choose Category (Optional)
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
                        All Cases
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
                      className="w-full gap-3 text-lg py-7 font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 bg-gradient-to-r from-primary to-primary/90"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Generating Case...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Quick Generate Case
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
                      Guided Simulation Setup
                      <Badge variant="secondary" className="ml-2 text-[10px]">INACSL</Badge>
                    </Button>
                  </div>

                  {/* Professional Stats Bar */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
                    <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                        <div className="text-2xl font-bold text-foreground">{allCases.length}+</div>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">Case Scenarios</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <BarChart3 className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                        <div className="text-2xl font-bold text-foreground">{caseCategories.length}</div>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">Categories</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200 group">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <GraduationCap className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                        <div className="text-2xl font-bold text-foreground">4</div>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">Year Levels</div>
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
                      className={`group cursor-pointer border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
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
                <Card className="border-border/50 bg-gradient-to-br from-card to-muted/30">
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
                className="gap-1 text-muted-foreground hover:text-foreground btn-press -ml-2 h-8 text-xs sm:text-sm sm:h-9"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">ESC</kbd> for home
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">N</kbd> for new case
                </span>
              </div>
            </div>

            {/* Case Header - Always visible */}
            <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant={currentCase.priority === 'critical' ? 'destructive' : currentCase.priority === 'high' ? 'default' : 'secondary'}
                    className={`animate-pop-in ${currentCase.priority === 'critical' ? 'priority-critical' : ''}`}
                  >
                    {priorities.find(p => p.value === currentCase.priority)?.label}
                  </Badge>
                  <Badge variant="outline" className="animate-pop-in stagger-1">
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

            {/* Glassmorphism Three-Layer Navigation */}
            <Suspense fallback={<LoadingCard />}>
              <GlassNavigation
                activeLayer={glassLayer}
                onLayerChange={setGlassLayer}
                showPreBriefing={!!simulationObjective}
                children={{
                  prebriefing: simulationObjective && currentCase ? (
                    <Suspense fallback={<LoadingCard />}>
                      <PreBriefingPanel
                        caseData={currentCase}
                        objective={simulationObjective}
                        onStartSimulation={() => {
                          setPreBriefingCompleted(true);
                          setGlassLayer('case');
                          toast.success('Pre-briefing complete — simulation started', {
                            icon: <Activity className="h-4 w-4" />,
                          });
                        }}
                        onSkip={() => {
                          setGlassLayer('case');
                          toast.info('Pre-briefing skipped');
                        }}
                      />
                    </Suspense>
                  ) : undefined,
                  case: (
                    <div className="space-y-6">
                      {/* Tabs within Case Layer */}
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="case" className="gap-1">
                            <FileText className="h-4 w-4" />
                            Case
                          </TabsTrigger>
                          <TabsTrigger value="assessment" className="gap-1">
                            <Stethoscope className="h-4 w-4" />
                            Assessment
                          </TabsTrigger>
                          <TabsTrigger value="management" className="gap-1">
                            <Activity className="h-4 w-4" />
                            Management
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="case" className="mt-4 animate-fade-in">
                          <Suspense fallback={<LoadingCard />}>
                            <CaseDisplay caseData={currentCase} studentYear={selectedYear} />
                          </Suspense>
                        </TabsContent>

                        <TabsContent value="assessment" className="mt-4 animate-fade-in">
                          <Suspense fallback={<LoadingCard />}>
                            <AssessmentPanel caseData={currentCase} studentYear={selectedYear} />
                          </Suspense>
                        </TabsContent>

                        <TabsContent value="management" className="mt-4 animate-fade-in">
                          <Suspense fallback={<LoadingCard />}>
                            <ManagementView caseData={currentCase} />
                          </Suspense>
                        </TabsContent>
                      </Tabs>
                    </div>
                  ),
                  vitals: (
                    <div className="space-y-4">
                      {/* Session Timer */}
                      {currentCase && (
                        <Suspense fallback={
                          <Card>
                            <CardContent className="p-4 flex items-center justify-center">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </CardContent>
                          </Card>
                        }>
                          <SessionTimer
                            duration={currentCase.estimatedDuration || 20}
                            onTimerComplete={() => {
                              setGlassLayer('summary');
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
                      )}

                      {/* Interactive Vital Signs Monitor */}
                      {currentCase && (
                        <Suspense fallback={<Card><CardContent className="p-4"><div className="animate-pulse h-32 bg-muted rounded" /></CardContent></Card>}>
                          <VitalSignsMonitor
                            initialVitals={currentVitals || ensureCompleteVitals(currentCase.vitalSignsProgression.initial)}
                            previousVitals={previousVitals}
                            deteriorationVitals={currentCase.vitalSignsProgression.deterioration ? ensureCompleteVitals(currentCase.vitalSignsProgression.deterioration) : undefined}
                            onVitalChange={(vitals) => {
                              const completeVitals = ensureCompleteVitals(vitals);
                              setCurrentVitals(completeVitals);
                              setVitalsHistory(prev => [...prev, completeVitals]);
                            }}
                            appliedTreatments={appliedTreatments.map(t => t.description)}
                          />
                        </Suspense>
                      )}

                      {/* Complication Panel */}
                      {activeComplications.length > 0 && (
                        <ComplicationPanel
                          activeComplications={activeComplications}
                          onResolve={resolveComplication}
                          onIgnore={ignoreComplication}
                        />
                      )}

                      {/* Two-Column: Treatment Panel + Checklist */}
                      <div className="grid gap-4 lg:grid-cols-2">
                        {/* Treatment Application Panel */}
                        {currentCase && currentVitals && (
                          <Suspense fallback={<Card><CardContent className="p-4"><div className="animate-pulse h-48 bg-muted rounded" /></CardContent></Card>}>
                            <TreatmentApplicationPanel
                              currentVitals={currentVitals}
                              onApplyTreatment={applyEnhancedTreatment}
                              appliedTreatmentIds={appliedTreatmentIds}
                              isApplying={!!applyingTreatmentId}
                              applyingTreatmentId={applyingTreatmentId}
                            />
                          </Suspense>
                        )}

                        {/* Checklist */}
                        {session && (
                          <Card className="border-2 border-primary/30 shadow-lg shadow-primary/5 card-interactive animate-fade-in-up">
                            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
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
                              <p className="text-xs text-muted-foreground mt-1">
                                {filteredChecklist.filter(i => !session.completedItems.includes(i.id)).length === 0 
                                  ? "All items completed!" 
                                  : `${filteredChecklist.filter(i => !session.completedItems.includes(i.id)).length} items remaining`}
                              </p>
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
                                      <CheckCircle2 className="h-5 w-5 text-green-600 animate-pop-in" />
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
                                    {item.rationale && !session.completedItems.includes(item.id) && (
                                      <p className="text-[11px] text-muted-foreground mt-2 italic bg-muted/30 p-1.5 rounded">
                                        {item.rationale}
                                      </p>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Applied Treatments History */}
                      {currentCase && appliedTreatments.length > 0 && (
                        <Suspense fallback={<Card><CardContent className="p-4"><div className="animate-pulse h-24 bg-muted rounded" /></CardContent></Card>}>
                          <TreatmentsPanel
                            treatments={appliedTreatments}
                            isAnimating={isVitalsAnimating}
                            animationProgress={vitalChangeProgress}
                          />
                        </Suspense>
                      )}

                      {/* Patient Info */}
                      <Card className="card-hover">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            Patient
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Age/Gender:</span>
                            <span className="font-medium">{currentCase.patientInfo.age}y / {currentCase.patientInfo.gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="font-medium">{currentCase.patientInfo.weight} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Language:</span>
                            <span className="font-medium">{currentCase.patientInfo.language}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ),
                  summary: (
                    <div className="space-y-6">
                      {session && currentCase ? (
                        <Suspense fallback={<LoadingCard />}>
                          <SessionSummary
                            session={session}
                            caseData={currentCase}
                            elapsedTime={elapsedTime}
                            timeTakenSeconds={timeTakenSeconds}
                            appliedTreatments={appliedTreatments}
                            vitalsHistory={vitalsHistory}
                            instructorNotes={session.notes}
                            simulationObjective={simulationObjective || undefined}
                            debriefingResources={debriefingResources.length > 0 ? debriefingResources : undefined}
                          />
                        </Suspense>
                      ) : (
                        <EmptyState onGenerate={generateCase} />
                      )}
                    </div>
                  )
                }}
              />
            </Suspense>
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
