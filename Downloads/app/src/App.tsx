import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CaseScenario, StudentYear, CaseSession } from '@/types';
import { caseDatabase, getRandomCase, yearLevels, caseCategories, priorities } from '@/data/cases';
import { CaseDisplay } from '@/components/CaseDisplay';
import { AssessmentPanel } from '@/components/AssessmentPanel';
import { SessionSummary } from '@/components/SessionSummary';
import { SessionTimer } from '@/components/SessionTimer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Stethoscope, BookOpen, GraduationCap, ClipboardCheck, RotateCcw,
  FileText, Sparkles, CheckCircle2, Home, ChevronRight, ArrowLeft,
  History, BarChart3
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

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

function App() {
  const [currentCase, setCurrentCase] = useState<CaseScenario | null>(null);
  const [selectedYear, setSelectedYear] = useState<StudentYear>('3rd-year');
  const [session, setSession] = useState<CaseSession | null>(null);
  const [activeTab, setActiveTab] = useState('case');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [caseHistory, setCaseHistory] = useState<CaseScenario[]>([]);

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

  // Memoize goHome to avoid recreation
  const goHome = useCallback(() => {
    setCurrentCase(null);
    setSession(null);
    setActiveTab('case');
    toast.info('Returned to home');
  }, []);

  // Generate a new case - memoized
  const generateCase = useCallback(() => {
    const newCase = getRandomCase({
      yearLevel: selectedYear,
      category: selectedCategory !== 'all' ? selectedCategory : undefined
    });
    setCurrentCase(newCase);

    // Add to history
    setCaseHistory(prev => [newCase, ...prev].slice(0, 10));

    // Create new session using helper
    const newSession = createSessionFromCase(newCase, selectedYear);
    setSession(newSession);
    setActiveTab('case');
    toast.success('New case generated!', { description: newCase.title });
  }, [selectedYear, selectedCategory]);

  // Toggle checklist item - optimized
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
  }, [session, currentCase]);

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
    setActiveTab('case');
  }, [selectedYear]);

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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Clickable to go home */}
            <button
              onClick={goHome}
              className="flex items-center gap-3 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">UAE Paramedic Case Generator</h1>
                <p className="text-xs text-muted-foreground">Realistic scenarios for student training</p>
              </div>
            </button>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2">
              {currentCase && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goHome}
                    className="hidden sm:flex gap-1"
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateCase}
                    className="gap-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">New Case</span>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {currentCase && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground border-t pt-2">
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
              <Badge variant="outline" className="text-[10px] ml-2">
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
            {/* Hero Card */}
            <div className="mx-auto max-w-3xl">
              <Card className="border-2 border-dashed">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Generate a Training Case</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select your year level and generate a realistic paramedic case scenario
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Year Level Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Student Year Level</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {yearLevels.map((year) => (
                        <button
                          key={year.value}
                          onClick={() => setSelectedYear(year.value as StudentYear)}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${selectedYear === year.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted'
                            }`}
                        >
                          <GraduationCap className={`h-5 w-5 ${selectedYear === year.value ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${selectedYear === year.value ? 'text-primary' : 'text-muted-foreground'}`}>
                            {year.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Case Category (Optional)</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full">
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
                    size="lg"
                    className="w-full gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Generate Case
                  </Button>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{caseDatabase.length}+</div>
                      <div className="text-xs text-muted-foreground">Case Scenarios</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{caseCategories.length}</div>
                      <div className="text-xs text-muted-foreground">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">4</div>
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
                  {caseCategories.map((cat) => (
                    <Card
                      key={cat.value}
                      className="cursor-pointer card-hover"
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        toast.info(`${cat.label} selected`, { description: 'Click Generate Case to continue' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className={`mb-2 h-2 w-8 rounded-full ${cat.color}`} />
                        <p className="text-sm font-medium">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {caseDatabase.filter(c => c.category === cat.value).length} cases
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Cases History */}
              {caseHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    Recent Cases
                  </h3>
                  <div className="space-y-2">
                    {caseHistory.map((caseItem, index) => (
                      <Card
                        key={`${caseItem.id}-${index}`}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => loadCaseFromHistory(caseItem)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium line-clamp-1">{caseItem.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {categoryLookup[caseItem.category]?.label}
                              </p>
                            </div>
                            <Badge
                              variant={caseItem.priority === 'critical' ? 'destructive' : caseItem.priority === 'high' ? 'default' : 'secondary'}
                              className="text-[10px]"
                            >
                              {priorities.find(p => p.value === caseItem.priority)?.label}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">ESC</kbd> for home
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">N</kbd> for new case
                </span>
              </div>
            </div>

            {/* Main Case Layout */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Panel - Case Details (8 columns) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Case Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={currentCase.priority === 'critical' ? 'destructive' : currentCase.priority === 'high' ? 'default' : 'secondary'}>
                        {priorities.find(p => p.value === currentCase.priority)?.label}
                      </Badge>
                      <Badge variant="outline">
                        {categoryLookup[currentCase.category]?.label}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold">{currentCase.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {currentCase.dispatchInfo.location} • {currentCase.dispatchInfo.timeOfDay}
                    </p>
                  </div>
                </div>

                {/* Tabs - Case, Assessment, Summary */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="case">
                      <FileText className="h-4 w-4 mr-1" />
                      Case Details
                    </TabsTrigger>
                    <TabsTrigger value="assessment">
                      <Stethoscope className="h-4 w-4 mr-1" />
                      Assessment
                    </TabsTrigger>
                    <TabsTrigger value="summary">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Summary
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="case" className="mt-4">
                    <CaseDisplay caseData={currentCase} studentYear={selectedYear} />
                  </TabsContent>

                  <TabsContent value="assessment" className="mt-4">
                    <AssessmentPanel caseData={currentCase} studentYear={selectedYear} />
                  </TabsContent>

                  <TabsContent value="summary" className="mt-4">
                    {session && currentCase ? (
                      <SessionSummary
                        session={session}
                        caseData={currentCase}
                        elapsedTime={elapsedTime}
                        timeTakenSeconds={timeTakenSeconds}
                      />
                    ) : (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            Generate a case to see the session summary
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Panel - Checklist & Quick Info (4 columns) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Session Timer - Always visible when case is active */}
                {currentCase && (
                  <SessionTimer
                    duration={currentCase.estimatedDuration || 20}
                    onTimerComplete={() => {
                      goToSummary();
                      toast.info('Timer complete! Case finished.');
                    }}
                    onTimerStart={() => {
                      toast.success('Timer started - Case in progress');
                    }}
                    onElapsedTimeChange={(formattedTime, seconds) => {
                      setElapsedTime(formattedTime);
                      setTimeTakenSeconds(seconds);
                    }}
                  />
                )}

                {/* Checklist - Always Visible */}
                {session && (
                  <Card className="border-2 border-primary/20">
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
                      {filteredChecklist.map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer transition-all ${session.completedItems.includes(item.id)
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'hover:bg-muted hover:border-primary/30'
                              }`}
                          >
                            <div className="mt-0.5">
                              {session.completedItems.includes(item.id) ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <div className="h-4 w-4 rounded border-2 border-muted-foreground/30" />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={session.completedItems.includes(item.id)}
                              onChange={(e) => toggleChecklistItem(item.id, e.target.checked)}
                              className="sr-only"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-tight ${session.completedItems.includes(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                                {item.description}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                  {item.category}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {item.points} pts
                                </span>
                                {item.critical && (
                                  <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
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
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="text-xl font-bold">
                            {session.score} <span className="text-sm font-normal text-muted-foreground">/ {session.totalPossible}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Completed</p>
                          <p className="text-xl font-bold">
                            {session.completedItems.length} <span className="text-sm font-normal text-muted-foreground">/ {filteredChecklist.length}</span>
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{
                            width: `${session.totalPossible > 0 ? (session.score / session.totalPossible) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <Button
                        onClick={goToSummary}
                        className="w-full"
                        size="sm"
                        variant="default"
                      >
                        View Summary
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Patient Info */}
                <Card>
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

                {/* Vital Signs */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      Vital Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">BP:</span>
                        <span className="font-medium">{currentCase.vitalSignsProgression.initial.bp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pulse:</span>
                        <span className="font-medium">{currentCase.vitalSignsProgression.initial.pulse}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RR:</span>
                        <span className="font-medium">{currentCase.vitalSignsProgression.initial.respiration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SpO2:</span>
                        <span className="font-medium">{currentCase.vitalSignsProgression.initial.spo2}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GCS:</span>
                        <span className="font-medium">{currentCase.vitalSignsProgression.initial.gcs}</span>
                      </div>
                      {currentCase.vitalSignsProgression.initial.temperature && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Temp:</span>
                          <span className="font-medium">{currentCase.vitalSignsProgression.initial.temperature}°C</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Dispatch Info - Compact */}
                <Card>
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

                {/* Instructor Notes */}
                {session && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Instructor Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        value={session.notes}
                        onChange={(e) => updateNotes(e.target.value)}
                        placeholder="Add observations..."
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
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
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>UAE Paramedic Case Generator • For educational purposes</p>
            {currentCase && (
              <div className="flex items-center gap-3">
                <span>Shortcuts: </span>
                <span><kbd className="px-1 bg-muted rounded">ESC</kbd> Home</span>
                <span><kbd className="px-1 bg-muted rounded">N</kbd> New Case</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
