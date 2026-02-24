import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import type { CaseScenario, StudentYear, CaseSession, VitalSigns } from '@/types';
import { allCases, getRandomCase, yearLevels, caseCategories, priorities } from '@/data/cases';
import { applyTreatmentEffectEnhanced, ensureCompleteVitals } from '@/data/treatmentEffects';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Stethoscope, BookOpen, GraduationCap, ClipboardCheck, RotateCcw,
  FileText, Sparkles, CheckCircle2, Home, ChevronRight, ArrowLeft,
  History, BarChart3, Loader2, MessageSquare, Activity, Clock, AlertCircle
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Lazy load heavy components for better performance
const CaseDisplay = lazy(() => import('@/components/CaseDisplay').then(m => ({ default: m.CaseDisplay })));
const AssessmentPanel = lazy(() => import('@/components/AssessmentPanel').then(m => ({ default: m.AssessmentPanel })));
const ManagementView = lazy(() => import('@/components/ManagementView').then(m => ({ default: m.ManagementView })));
const SessionSummary = lazy(() => import('@/components/SessionSummary').then(m => ({ default: m.SessionSummary })));
const SessionTimer = lazy(() => import('@/components/SessionTimer').then(m => ({ default: m.SessionTimer })));
const InstructorNotesPanel = lazy(() => import('@/components/InstructorNotesPanel').then(m => ({ default: m.InstructorNotesPanel })));
const ClinicalReferenceDialog = lazy(() => import('@/components/ClinicalReferenceDialog').then(m => ({ default: m.ClinicalReferenceDialog })));
const VitalSignsMonitor = lazy(() => import('@/components/VitalSignsMonitor').then(m => ({ default: m.VitalSignsMonitor })));

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
  totalPossible: caseData.studentChecklist
    .filter(item => item.yearLevel.includes(yearLevel))
    .reduce((sum, item) => sum + item.points, 0),
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
  const [showInstructorPanel, setShowInstructorPanel] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVitals, setCurrentVitals] = useState<VitalSigns | null>(null);
  const [, setVitalsHistory] = useState<VitalSigns[]>([]);

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

      if (tab && ['case', 'assessment', 'summary'].includes(tab)) {
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

  // Memoize filtered checklist to avoid recalculation
  const filteredChecklist = useMemo(() => {
    if (!currentCase) return [];
    return currentCase.studentChecklist.filter(item => item.yearLevel.includes(selectedYear));
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
    setShowInstructorPanel(false);
    toast.info('Returned to home', {
      icon: <Home className="h-4 w-4" />,
    });
  }, []);

  // Generate a new case - memoized with loading state
  const generateCase = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newCase = getRandomCase({
      yearLevel: selectedYear,
      category: selectedCategory !== 'all' ? selectedCategory : undefined
    });
    
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
    
    toast.success('New case generated!', { 
      description: newCase.title,
      icon: <Sparkles className="h-4 w-4" />,
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
      
      // Apply specific treatment effects to vitals
      if (currentVitals) {
        const { vitals: improvedVitals, improvements, hasImprovement } = applyTreatmentEffectEnhanced(
          item?.description || '', 
          currentVitals, 
          currentCase.category
        );
        
        if (hasImprovement) {
          setCurrentVitals(improvedVitals);
          setVitalsHistory(prev => [...prev, improvedVitals]);
          
          if (improvements.length > 0) {
            toast.success('Treatment effective!', {
              description: improvements.join(', '),
              icon: <Activity className="h-4 w-4 text-green-500" />,
            });
          }
        }
      }
    }
  }, [session, currentCase, currentVitals]);

  // Update notes - memoized
  const updateNotes = useCallback((notes: string) => {
    setSession(prev => prev ? { ...prev, notes } : null);
  }, []);

  // Navigate to summary tab - memoized
  const goToSummary = useCallback(() => {
    setActiveTab('summary');
  }, []);

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
      // Alt+Tab navigation
      if (currentCase && e.altKey) {
        if (e.key === '1') setActiveTab('case');
        if (e.key === '2') setActiveTab('assessment');
        if (e.key === '3') setActiveTab('summary');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCase, goHome, generateCase]);

  return (
    <div className="min-h-screen bg-background paper-texture">
      {/* Enhanced Header with glassmorphism */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
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
                <h1 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">UAE Paramedic Case Generator</h1>
                <p className="text-xs text-muted-foreground">Realistic scenarios for student training</p>
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

          {/* Enhanced Breadcrumb Navigation */}
          {currentCase && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground border-t pt-3 animate-fade-in">
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
        {!currentCase ? (
          /* Home / Case Generator Screen */
          <div className="animate-fade-in space-y-6">
            {/* Enhanced Hero Card with gradient border effect */}
            <div className="mx-auto max-w-3xl">
              <Card className="border-2 border-dashed card-glass overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
                <CardHeader className="text-center relative">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 animate-float shadow-lg">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Generate a Training Case</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select your year level and generate a realistic paramedic case scenario
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                  {/* Year Level Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      Student Year Level
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {yearLevels.map((year, index) => (
                        <button
                          key={year.value}
                          onClick={() => setSelectedYear(year.value as StudentYear)}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-300 btn-press animate-fade-in-up stagger-${index + 1} ${selectedYear === year.value
                            ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50 hover:bg-muted card-hover'
                            }`}
                        >
                          <GraduationCap className={`h-5 w-5 transition-colors duration-300 ${selectedYear === year.value ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium transition-colors duration-300 ${selectedYear === year.value ? 'text-primary' : 'text-muted-foreground'}`}>
                            {year.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      Case Category (Optional)
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {caseCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateCase}
                    disabled={isGenerating}
                    size="lg"
                    className="w-full gap-2 btn-glow text-lg py-6"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating Case...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Case
                      </>
                    )}
                  </Button>

                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center p-3 rounded-lg bg-muted/50 card-hover">
                      <div className="text-2xl font-bold text-gradient">{allCases.length}+</div>
                      <div className="text-xs text-muted-foreground">Case Scenarios</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50 card-hover">
                      <div className="text-2xl font-bold text-gradient">{caseCategories.length}</div>
                      <div className="text-xs text-muted-foreground">Categories</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50 card-hover">
                      <div className="text-2xl font-bold text-gradient">4</div>
                      <div className="text-xs text-muted-foreground">Year Levels</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Two Column Layout for Categories and History */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Category Cards */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  Browse by Category
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {caseCategories.map((cat, index) => (
                    <Card
                      key={cat.value}
                      className={`cursor-pointer card-interactive card-hover animate-fade-in-up stagger-${(index % 5) + 1} ${selectedCategory === cat.value ? 'border-primary/50 bg-primary/5' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        toast.info(`${cat.label} selected`, { description: 'Click Generate Case to continue' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className={`mb-2 h-2 w-8 rounded-full ${cat.color} shadow-sm`} />
                        <p className="text-sm font-medium">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {caseCountsByCategory[cat.value]} cases
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Cases History */}
              {caseHistory.length > 0 ? (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    Recent Cases
                  </h3>
                  <div className="space-y-2">
                    {caseHistory.map((caseItem, index) => (
                      <Card
                        key={`${caseItem.id}-${index}`}
                        className="cursor-pointer card-hover hover:border-primary/50 transition-all duration-200 animate-slide-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => loadCaseFromHistory(caseItem)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{caseItem.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {categoryLookup[caseItem.category]?.label}
                              </p>
                            </div>
                            <Badge
                              variant={caseItem.priority === 'critical' ? 'destructive' : caseItem.priority === 'high' ? 'default' : 'secondary'}
                              className="text-[10px] ml-2 shrink-0"
                            >
                              {priorities.find(p => p.value === caseItem.priority)?.label}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    Recent Cases
                  </h3>
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No cases viewed yet</p>
                      <p className="text-xs">Generate a case to see it here</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Case Display Screen */
          <div className="animate-fade-in space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goHome}
                className="gap-1 text-muted-foreground hover:text-foreground btn-press"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
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

            {/* Main Case Layout */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Panel - Case Details (8 columns) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Case Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
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

                {/* Tabs - Case, Assessment, Management, Summary */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
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
                    <TabsTrigger value="summary" className="gap-1">
                      <BookOpen className="h-4 w-4" />
                      Summary
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

                  <TabsContent value="summary" className="mt-4 animate-fade-in">
                    {session && currentCase ? (
                      <Suspense fallback={<LoadingCard />}>
                        <SessionSummary
                          session={session}
                          caseData={currentCase}
                          elapsedTime={elapsedTime}
                          timeTakenSeconds={timeTakenSeconds}
                        />
                      </Suspense>
                    ) : (
                      <EmptyState onGenerate={generateCase} />
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Panel - Checklist & Quick Info (4 columns) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Session Timer - Always visible when case is active */}
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
                        goToSummary();
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
                      }}
                    />
                  </Suspense>
                )}

                {/* Interactive Vital Signs Monitor */}
                {currentCase && (
                  <Suspense fallback={<Card><CardContent className="p-4"><div className="animate-pulse h-32 bg-muted rounded" /></CardContent></Card>}>
                    <VitalSignsMonitor
                      initialVitals={currentVitals || ensureCompleteVitals(currentCase.vitalSignsProgression.initial)}
                      deteriorationVitals={currentCase.vitalSignsProgression.deterioration ? ensureCompleteVitals(currentCase.vitalSignsProgression.deterioration) : undefined}
                      onVitalChange={(vitals) => {
                        const completeVitals = ensureCompleteVitals(vitals);
                        setCurrentVitals(completeVitals);
                        setVitalsHistory(prev => [...prev, completeVitals]);
                      }}
                    />
                  </Suspense>
                )}

                {/* Checklist - Always Visible */}
                {session && (
                  <Card className="border-2 border-primary/20 card-interactive">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ClipboardCheck className="h-5 w-5 text-primary" />
                        Student Checklist
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Tick items as the student completes them
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {filteredChecklist.map((item, index) => (
                          <label
                            key={item.id}
                            className={`flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer transition-all duration-200 hover-lift ${session.completedItems.includes(item.id)
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'hover:bg-muted/50 hover:border-primary/30'
                              }`}
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <div className="mt-0.5">
                              {session.completedItems.includes(item.id) ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 animate-pop-in" />
                              ) : (
                                <div className="h-4 w-4 rounded border-2 border-muted-foreground/30 transition-colors hover:border-primary/50" />
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
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                  {item.category}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {item.points} pts
                                </span>
                                {item.critical && (
                                  <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4 animate-pulse-soft">
                                    Critical
                                  </Badge>
                                )}
                              </div>
                              {item.rationale && (
                                <p className="text-[10px] text-muted-foreground mt-1 italic">
                                  {item.rationale}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                    </CardContent>
                  </Card>
                )}

                {/* Score Card */}
                {session && (
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 card-interactive">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="text-xl font-bold text-gradient">
                            {session.score} <span className="text-sm font-normal text-muted-foreground">/ {session.totalPossible}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Completed</p>
                          <p className="text-xl font-bold text-gradient">
                            {session.completedItems.length} <span className="text-sm font-normal text-muted-foreground">/ {filteredChecklist.length}</span>
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
                          style={{
                            width: `${session.totalPossible > 0 ? (session.score / session.totalPossible) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <Button
                        onClick={goToSummary}
                        className="w-full btn-glow"
                        size="sm"
                        variant="default"
                      >
                        View Summary
                      </Button>
                    </CardContent>
                  </Card>
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

                {/* Dispatch Info - Compact */}
                <Card className="card-hover">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Dispatch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Call:</span>
                      <p className="text-sm">{currentCase.dispatchInfo.callReason}</p>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{currentCase.dispatchInfo.location}</span>
                      {currentCase.dispatchInfo.dispatchCode && (
                        <Badge variant="outline" className="text-[10px]">{currentCase.dispatchInfo.dispatchCode}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Toggle Instructor Panel */}
                {session && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 card-hover"
                    onClick={() => setShowInstructorPanel(!showInstructorPanel)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {showInstructorPanel ? 'Hide Instructor Tools' : 'Show Instructor Tools'}
                  </Button>
                )}

                {/* Enhanced Instructor Notes Panel */}
                {session && showInstructorPanel && (
                  <Suspense fallback={
                    <Card>
                      <CardContent className="p-4 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </CardContent>
                    </Card>
                  }>
                    <InstructorNotesPanel
                      caseId={currentCase.id}
                      studentYear={selectedYear}
                      sessionNotes={session.notes}
                      completedItems={session.completedItems}
                      totalItems={filteredChecklist.length}
                    />
                  </Suspense>
                )}

                {/* Simple Instructor Notes */}
                {session && !showInstructorPanel && (
                  <Card className="card-hover">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        Quick Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        value={session.notes}
                        onChange={(e) => updateNotes(e.target.value)}
                        placeholder="Add observations..."
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
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
              <div className="flex items-center gap-3">
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
