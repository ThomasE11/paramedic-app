
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  Target,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Video,
  List,
  Sparkles,
  Clock,
  Users,
  Brain
} from 'lucide-react';
import { SkillPracticeHeader } from '@/components/ui/skill-practice-header';
import { SkillStepCard } from '@/components/ui/skill-step-card';
import { KnowledgeCheckModal } from '@/components/ui/knowledge-check-modal';
import { VideoPracticePage } from '@/components/ui/video-practice-page';
import { Skill, SkillStep, QuizQuestion, StudentProgress } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface QuizState {
  question: QuizQuestion | null;
  selectedAnswer: number | null;
  showResult: boolean;
  result: any;
}

interface ReflectionData {
  content: string;
  rating: number;
  whatWentWell: string;
  whatToimprove: string;
  futureGoals: string;
  isPrivate: boolean;
}

type PracticeMode = 'selection' | 'step-by-step' | 'video-analysis';

export default function SkillPractice() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.id as string;
  
  const [skill, setSkill] = useState<Skill | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('selection');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [quiz, setQuiz] = useState<QuizState>({
    question: null,
    selectedAnswer: null,
    showResult: false,
    result: null,
  });
  const [quizCount, setQuizCount] = useState(0);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [wasTimerRunningBeforeQuiz, setWasTimerRunningBeforeQuiz] = useState(false);
  const [reflection, setReflection] = useState<ReflectionData>({
    content: '',
    rating: 5,
    whatWentWell: '',
    whatToimprove: '',
    futureGoals: '',
    isPrivate: false,
  });

  useEffect(() => {
    fetchSkill();
  }, [skillId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const fetchSkill = async () => {
    try {
      const response = await fetch(`/api/skills/${skillId}`);
      const data = await response.json();
      setSkill(data);
      
      // Initialize with existing progress if available
      if (data.progress?.[0]) {
        const progress = data.progress[0];
        setCompletedSteps(progress.completedSteps || []);
        setTimeSpent(progress.timeSpentMinutes * 60);
        
        // If skill is already completed, show reflection option
        if (progress.status === 'COMPLETED' || progress.status === 'MASTERED') {
          setShowReflection(true);
        }
      }
    } catch (error) {
      console.error('Error fetching skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to load skill data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => {
    setIsTimerRunning(true);
    toast({
      title: 'Practice Started',
      description: 'Timer is now running. Good luck!',
    });
  };

  const pausePractice = () => {
    setIsTimerRunning(false);
    saveProgress();
    toast({
      title: 'Practice Paused',
      description: 'Your progress has been saved.',
    });
  };

  const resetPractice = () => {
    setCompletedSteps([]);
    setTimeSpent(0);
    setIsTimerRunning(false);
    setShowReflection(false);
    toast({
      title: 'Practice Reset',
      description: 'You can start fresh now.',
    });
  };

  const toggleStepCompletion = (stepNumber: number) => {
    // CRITICAL: Prevent step completion if timer is not running
    if (!isTimerRunning) {
      toast({
        title: 'Timer Not Running',
        description: 'Please start the practice timer before completing steps.',
        variant: 'destructive',
      });
      return;
    }

    const newCompletedSteps = completedSteps.includes(stepNumber)
      ? completedSteps.filter(s => s !== stepNumber)
      : [...completedSteps, stepNumber];
    
    setCompletedSteps(newCompletedSteps);
    
    // Auto-save progress
    if (newCompletedSteps.length > completedSteps.length) {
      saveProgress('IN_PROGRESS');
    }
  };

  const saveProgress = async (status = 'IN_PROGRESS') => {
    if (!skill) return;
    
    setSaving(true);
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: skill.id,
          status,
          completedSteps,
          timeSpent: Math.floor(timeSpent / 60),
        }),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const completeSkill = async () => {
    if (!skill) return;
    
    const minimumSteps = Math.ceil((skill.steps?.length || 0) * 0.8) || 1;
    if (completedSteps.length < minimumSteps) {
      toast({
        title: 'Incomplete Practice',
        description: `Please complete at least ${minimumSteps} steps before finishing.`,
        variant: 'destructive',
      });
      return;
    }

    // Check if quiz needs to be taken (and not currently in quiz)
    if (!hasCompletedQuiz && !showQuiz) {
      setIsTimerRunning(false);
      triggerFinalQuiz();
      return;
    }

    // Quiz completed or already showing quiz, proceed to reflection
    if (hasCompletedQuiz) {
      setIsTimerRunning(false);
      await saveProgress('COMPLETED');
      setShowReflection(true);
      
      toast({
        title: 'Skill Completed!',
        description: 'Please add a reflection note to complete your practice.',
      });
    }
  };

  const submitReflection = async () => {
    if (!reflection.content.trim()) {
      toast({
        title: 'Reflection Required',
        description: 'Please provide your reflection content.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: skill?.id,
          ...reflection,
        }),
      });
      
      toast({
        title: 'Reflection Submitted',
        description: 'Your reflection has been saved successfully.',
      });
      
      router.push('/student/dashboard');
    } catch (error) {
      console.error('Error submitting reflection:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit reflection',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Quiz Functions
  const triggerFinalQuiz = async () => {
    if (!skill) return;
    
    try {
      // Reset quiz state completely
      setQuizCount(0);
      setHasCompletedQuiz(false);
      setShowQuiz(false);
      
      // Small delay to ensure state is reset
      setTimeout(async () => {
        await triggerKnowledgeCheck(Math.max(...completedSteps));
        
        toast({
          title: 'Knowledge Check Required',
          description: 'Please answer 2 questions to complete this skill.',
        });
      }, 100);
      
    } catch (error) {
      console.error('Error starting final quiz:', error);
      // If quiz fails, proceed to reflection
      setHasCompletedQuiz(true);
      setTimeout(() => {
        setIsTimerRunning(false);
        saveProgress('COMPLETED');
        setShowReflection(true);
        toast({
          title: 'Skill Completed!',
          description: 'Please add a reflection note to complete your practice.',
        });
      }, 500);
    }
  };

  const triggerKnowledgeCheck = async (stepNumber: number) => {
    if (!skill) return;
    
    try {
      // Store timer state and pause timer during quiz
      const wasTimerRunning = isTimerRunning;
      setWasTimerRunningBeforeQuiz(wasTimerRunning);
      
      if (wasTimerRunning) {
        setIsTimerRunning(false);
      }
      
      // Fetch random question for this skill
      const response = await fetch(`/api/skills/${skill.id}/quiz?stepNumber=${stepNumber}`);
      
      if (!response.ok) {
        console.log('No questions available for this skill, continuing practice...');
        if (wasTimerRunning) {
          setIsTimerRunning(true);
        }
        return;
      }
      
      const question = await response.json();
      
      setQuiz({
        question,
        selectedAnswer: null,
        showResult: false,
        result: null,
      });
      
      setShowQuiz(true);
      
      toast({
        title: 'Knowledge Check!',
        description: 'Answer this question to continue your practice.',
      });
      
    } catch (error) {
      console.error('Error fetching quiz question:', error);
      toast({
        title: 'Quiz Error',
        description: 'Unable to load quiz question. Continuing practice...',
        variant: 'destructive',
      });
      
      // Resume timer if it was running
      if (wasTimerRunningBeforeQuiz) {
        setIsTimerRunning(true);
      }
    }
  };

  const handleQuizSubmit = async (questionId: number, selectedAnswer: number) => {
    if (!skill) throw new Error('Skill not found');
    
    try {
      const response = await fetch(`/api/skills/${skill.id}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedAnswer,
          stepNumber: Math.max(...completedSteps),
          responseTimeMs: Date.now() - (quiz.question ? 0 : Date.now()),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      throw error;
    }
  };

  const handleQuizComplete = () => {
    const newQuizCount = quizCount + 1;
    console.log(`Quiz complete: Question ${newQuizCount}/2 answered correctly`);
    
    setQuizCount(newQuizCount);
    setShowQuiz(false);
    
    if (newQuizCount >= 2) {
      // Completed both questions, proceed to reflection
      console.log('Quiz fully completed, proceeding to reflection');
      setHasCompletedQuiz(true);
      
      toast({
        title: 'Quiz Completed!',
        description: 'You can now complete the skill.',
      });
      
      // Directly proceed to reflection (skip completeSkill to avoid loop)
      setTimeout(() => {
        console.log('Opening reflection modal');
        setIsTimerRunning(false);
        saveProgress('COMPLETED');
        setShowReflection(true);
        toast({
          title: 'Skill Completed!',
          description: 'Please add a reflection note to complete your practice.',
        });
      }, 1000);
    } else {
      // Show next question
      console.log(`Proceeding to question ${newQuizCount + 1}/2`);
      toast({
        title: `Question ${newQuizCount}/2 completed!`,
        description: 'Please answer the next question.',
      });
      setTimeout(() => triggerKnowledgeCheck(Math.max(...completedSteps)), 1000);
    }
  };

  const handleQuizClose = () => {
    // This should not close the modal until answered correctly
    // The modal handles this internally
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Skill not found</h2>
        <p className="text-muted-foreground">The skill you're looking for doesn't exist.</p>
      </div>
    );
  }

  const progressPercentage = skill.steps?.length ? (completedSteps.length / skill.steps.length) * 100 : 0;
  const isSkillComplete = completedSteps.length >= Math.ceil((skill.steps?.length || 0) * 0.8);

  // Mode Selection Interface
  const renderModeSelection = () => (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Header */}
      <Card className="border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/student/skills')}
                className="flex items-center hover:bg-accent/50"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Back to Skills
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{skill?.name}</h1>
                <p className="text-muted-foreground">Choose your practice mode</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Est. Time</div>
              <div className="text-lg font-semibold text-orange-600">
                {skill?.estimatedTimeMinutes}m
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step-by-Step Practice */}
        <Card className="border-2 border-transparent hover:border-orange-200 transition-colors cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="h-6 w-6 mr-3 text-blue-500" />
              Step-by-Step Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Practice each step individually with guided instructions and periodic knowledge checks.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Interactive step-by-step guidance
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Knowledge check quizzes
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Progress tracking
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Self-paced learning
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {skill?.estimatedTimeMinutes}m
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-1" />
                    {skill?.steps?.length || 0} steps
                  </div>
                </div>
                <Button 
                  onClick={() => setPracticeMode('step-by-step')}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Start Practice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Analysis Practice */}
        <Card className="border-2 border-transparent hover:border-orange-200 transition-colors cursor-pointer group relative">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-6 w-6 mr-3 text-purple-500" />
              Video Analysis Practice
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Record yourself performing the skill and get detailed AI-powered feedback on your technique.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Video recording with audio
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  AI technique analysis
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Performance scoring
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Personalized feedback
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {(skill?.estimatedTimeMinutes || 0) * 2}m max
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Brain className="h-4 w-4 mr-1" />
                    AI Analysis
                  </div>
                </div>
                <Button 
                  onClick={() => setPracticeMode('video-analysis')}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Start Recording
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Information */}
      <Card>
        <CardHeader>
          <CardTitle>About This Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-700 mb-4">{skill?.description}</p>
              
              <h4 className="font-medium text-gray-900 mb-2">Objectives</h4>
              <ul className="space-y-1">
                {skill?.objectives?.map((objective, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Skill Details</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Difficulty</span>
                  <Badge variant="outline">{skill?.difficultyLevel}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="text-gray-900">{skill?.category?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Steps</span>
                  <span className="text-gray-900">{skill?.steps?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Est. Time</span>
                  <span className="text-gray-900">{skill?.estimatedTimeMinutes}m</span>
                </div>
                {skill?.isCritical && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type</span>
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Handle different practice modes
  if (practiceMode === 'selection') {
    return renderModeSelection();
  }

  if (practiceMode === 'video-analysis') {
    return (
      <VideoPracticePage
        skill={skill!}
        onBack={() => setPracticeMode('selection')}
      />
    );
  }

  // Step-by-step practice mode (existing functionality)
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      {/* Header */}
      <SkillPracticeHeader
        skill={skill}
        completedSteps={completedSteps}
        timeSpent={timeSpent}
        isTimerRunning={isTimerRunning}
        onBack={() => setPracticeMode('selection')}
        onStartPractice={startPractice}
        onPausePractice={pausePractice}
        onResetPractice={resetPractice}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Practice Steps - Main Content */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
                  Practice Steps
                </h2>
                <Badge variant="outline" className="border-orange-200 text-orange-700">
                  {completedSteps.length} / {skill.steps?.length || 0} completed
                </Badge>
              </div>
            </div>
            
            <div className="p-6">
              {/* Timer Not Running Notice */}
              {!isTimerRunning && (
                <Alert className="mb-6 border-orange-200 bg-orange-50">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <div className="text-orange-800">
                      <p className="font-medium">Practice Timer Not Running</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Please start the practice timer above to begin completing steps. This ensures accurate time tracking of your practice session.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                {skill.steps?.map((step) => (
                  <SkillStepCard
                    key={step.id}
                    step={step}
                    isCompleted={completedSteps.includes(step.stepNumber)}
                    onToggleComplete={toggleStepCompletion}
                    isTimerRunning={isTimerRunning}
                  />
                ))}
              </div>
              
              {/* Completion Alert */}
              {isSkillComplete && (
                <Alert className="mt-6 border-green-200 bg-green-50">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Excellent work!</div>
                        <div className="text-sm text-green-700">
                          {hasCompletedQuiz 
                            ? "You've completed everything. Ready to finish this skill?"
                            : "You've completed the steps. Click to take the final quiz."}
                        </div>
                      </div>
                      <Button 
                        onClick={completeSkill} 
                        className="bg-green-600 hover:bg-green-700 ml-4"
                      >
                        {hasCompletedQuiz ? "Complete Skill" : "Take Final Quiz"}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Progress Summary */}
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-orange-700">
                <Target className="h-5 w-5 mr-2" />
                Progress Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Steps completed</span>
                    <span className="font-medium">{completedSteps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Steps remaining</span>
                    <span className="font-medium">{(skill.steps?.length || 0) - completedSteps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time practiced</span>
                    <span className="font-medium">{Math.floor(timeSpent / 60)}m</span>
                  </div>
                </div>
                
                {completedSteps.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Last completed: Step {Math.max(...completedSteps)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skill Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skill Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="objectives" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 h-auto text-xs">
                  <TabsTrigger value="objectives" className="text-xs px-2 py-1.5 whitespace-nowrap">Objectives</TabsTrigger>
                  <TabsTrigger value="indications" className="text-xs px-2 py-1.5 whitespace-nowrap">Indications</TabsTrigger>
                  <TabsTrigger value="equipment" className="text-xs px-2 py-1.5 whitespace-nowrap">Equipment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="objectives" className="mt-4">
                  <div className="space-y-2">
                    {skill.objectives?.map((objective, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{objective}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="indications" className="mt-4">
                  <div className="space-y-2">
                    {skill.indications?.map((indication, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{indication}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="equipment" className="mt-4">
                  <div className="space-y-2">
                    {skill.equipment?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.item}</span>
                        <Badge variant={item.required ? "default" : "outline"} className="text-xs">
                          {item.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Knowledge Check Modal */}
      <KnowledgeCheckModal
        isOpen={showQuiz}
        onClose={handleQuizClose}
        question={quiz.question}
        skillName={skill?.name || ''}
        stepNumber={Math.max(...completedSteps, 0)}
        questionCount={quizCount + 1}
        totalQuestions={2}
        onAnswerSubmit={handleQuizSubmit}
        onCorrectAnswer={handleQuizComplete}
      />

      {/* Reflection Modal */}
      {showReflection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
                Reflection & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reflection-content">Overall Reflection</Label>
                  <Textarea
                    id="reflection-content"
                    placeholder="How did this practice session go? What did you learn?"
                    value={reflection.content}
                    onChange={(e) => setReflection(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="self-rating">Self-Assessment Rating: {reflection.rating}/10</Label>
                  <Slider
                    id="self-rating"
                    min={1}
                    max={10}
                    step={1}
                    value={[reflection.rating]}
                    onValueChange={(value) => setReflection(prev => ({ ...prev, rating: value[0] }))}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="went-well">What went well?</Label>
                  <Textarea
                    id="went-well"
                    placeholder="What aspects of the skill did you perform well?"
                    value={reflection.whatWentWell}
                    onChange={(e) => setReflection(prev => ({ ...prev, whatWentWell: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="to-improve">What needs improvement?</Label>
                  <Textarea
                    id="to-improve"
                    placeholder="What areas would you like to focus on improving?"
                    value={reflection.whatToimprove}
                    onChange={(e) => setReflection(prev => ({ ...prev, whatToimprove: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="future-goals">Future Goals</Label>
                  <Textarea
                    id="future-goals"
                    placeholder="What are your goals for next practice session?"
                    value={reflection.futureGoals}
                    onChange={(e) => setReflection(prev => ({ ...prev, futureGoals: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private-reflection"
                    checked={reflection.isPrivate}
                    onChange={(e) => setReflection(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  />
                  <Label htmlFor="private-reflection">Keep this reflection private</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReflection(false)}
                  >
                    Skip for Now
                  </Button>
                  <Button 
                    onClick={submitReflection}
                    disabled={saving}
                  >
                    {saving ? 'Submitting...' : 'Submit Reflection'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
