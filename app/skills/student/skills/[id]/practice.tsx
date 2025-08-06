
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  BookOpen, 
  HelpCircle, 
  MessageSquare,
  CheckCircle,
  Target,
  RotateCcw
} from 'lucide-react';
import { SkillPracticeHeader } from '@/components/ui/skill-practice-header';
import { SkillStepCard } from '@/components/ui/skill-step-card';
import { KnowledgeCheckModal } from '@/components/ui/knowledge-check-modal';
import { Skill, SkillStep } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function SkillPracticeImproved() {
  const params = useParams();
  const router = useRouter();
  const skillId = parseInt(params.id as string);
  
  const [skill, setSkill] = useState<Skill | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Knowledge Check States
  const [showKnowledgeCheck, setShowKnowledgeCheck] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [pendingStepNumber, setPendingStepNumber] = useState<number | null>(null);
  const [stepsCompletedThisSession, setStepsCompletedThisSession] = useState(0);
  const [lastKnowledgeCheckStep, setLastKnowledgeCheckStep] = useState(0);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [engagementStartTime, setEngagementStartTime] = useState<number | null>(null);
  
  // Attempt tracking states
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [completedAttempts, setCompletedAttempts] = useState(0);

  useEffect(() => {
    fetchSkill();
    fetchAttemptStats();
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

  // Track incomplete attempts when user navigates away
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (currentAttemptId && isTimerRunning) {
        // Mark current attempt as abandoned
        try {
          await fetch('/api/attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              skillId: skill?.id || skillId,
              action: 'ABANDON',
              completedSteps: completedSteps.length,
              timeSpentMinutes: Math.floor(timeSpent / 60),
            }),
          });
        } catch (error) {
          console.error('Error abandoning attempt:', error);
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && currentAttemptId && isTimerRunning) {
        // Update attempt when tab becomes hidden
        await updateAttempt();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentAttemptId, isTimerRunning, completedSteps.length, timeSpent, skill?.id, skillId]);

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

  const fetchAttemptStats = async () => {
    try {
      const response = await fetch(`/api/attempts?skillId=${skillId}`);
      const data = await response.json();
      setTotalAttempts(data.totalAttempts);
      setCompletedAttempts(data.completedAttempts);
    } catch (error) {
      console.error('Error fetching attempt stats:', error);
    }
  };

  const startPractice = async () => {
    setIsTimerRunning(true);
    // Reset knowledge check session tracking
    setStepsCompletedThisSession(0);
    setLastKnowledgeCheckStep(0);
    
    // Start a new attempt
    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: skill?.id || skillId,
          skillName: skill?.name || 'Unknown Skill',
          action: 'START',
          totalSteps: skill?.steps?.length || 0,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentAttemptId(data.attempt.id);
        setTotalAttempts(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error starting attempt:', error);
    }
    
    toast({
      title: 'Practice Started',
      description: 'Timer is now running. Good luck!',
    });
  };

  const pausePractice = async () => {
    setIsTimerRunning(false);
    await saveProgress();
    await updateAttempt();
    toast({
      title: 'Practice Paused',
      description: 'Your progress has been saved.',
    });
  };

  const resetPractice = async () => {
    setCompletedSteps([]);
    setTimeSpent(0);
    setIsTimerRunning(false);
    
    // Mark current attempt as abandoned if one exists
    if (currentAttemptId) {
      try {
        await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skillId: skill?.id || skillId,
            action: 'ABANDON',
            completedSteps: completedSteps.length,
            timeSpentMinutes: Math.floor(timeSpent / 60),
          }),
        });
      } catch (error) {
        console.error('Error abandoning attempt:', error);
      }
      setCurrentAttemptId(null);
    }
    
    // Reset knowledge check states
    setShowKnowledgeCheck(false);
    setCurrentQuestion(null);
    setPendingStepNumber(null);
    setStepsCompletedThisSession(0);
    setLastKnowledgeCheckStep(0);
    setEngagementStartTime(null);
    
    toast({
      title: 'Practice Reset',
      description: 'You can start fresh now.',
    });
  };

  // Knowledge Check Functions
  const fetchKnowledgeCheckQuestion = async () => {
    setIsLoadingQuestion(true);
    try {
      const response = await fetch(`/api/skills/${skillId}/practice-question`);
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }
      const question = await response.json();
      setCurrentQuestion(question);
      return question;
    } catch (error) {
      console.error('Error fetching knowledge check question:', error);
      toast({
        title: 'Error',
        description: 'Could not load knowledge check question. Continuing without check.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleKnowledgeCheckAnswer = async (questionId: number, selectedAnswer: number) => {
    try {
      const response = await fetch(`/api/skills/${skillId}/practice-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedAnswer,
          stepNumber: pendingStepNumber,
          responseTimeMs: engagementStartTime ? Date.now() - engagementStartTime : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting knowledge check answer:', error);
      throw error;
    }
  };

  const handleKnowledgeCheckComplete = async () => {
    // Check if this is the final quiz (skill completion scenario)
    const isSkillComplete = completedSteps.length >= Math.ceil((skill?.steps?.length || 0) * 0.8);
    const isFinalQuiz = isSkillComplete && !isTimerRunning;
    
    if (isFinalQuiz) {
      // This is the final quiz completion - proceed to skill completion
      setShowKnowledgeCheck(false);
      
      // Complete the skill and redirect to reflection
      await saveProgress('COMPLETED');
      
      // Mark attempt as completed
      if (currentAttemptId) {
        try {
          await fetch('/api/attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              skillId: skill?.id || skillId,
              action: 'COMPLETE',
              completedSteps: completedSteps.length,
              timeSpentMinutes: Math.floor(timeSpent / 60),
              reflectionCompleted: false,
            }),
          });
          setCompletedAttempts(prev => prev + 1);
        } catch (error) {
          console.error('Error completing attempt:', error);
        }
      }
      
      toast({
        title: 'Quiz Completed!',
        description: 'Congratulations! You have successfully completed this skill.',
      });
      
      // Reset knowledge check state
      setPendingStepNumber(null);
      setCurrentQuestion(null);
      setEngagementStartTime(null);
      
      // Redirect to reflection
      router.push(`/skills/student/skills/${skillId}/reflection`);
      return;
    }
    
    // Regular knowledge check completion (during practice)
    if (pendingStepNumber !== null) {
      // Complete the pending step
      const newCompletedSteps = [...completedSteps, pendingStepNumber];
      setCompletedSteps(newCompletedSteps);
      setStepsCompletedThisSession(prev => prev + 1);
      setLastKnowledgeCheckStep(stepsCompletedThisSession + 1);
      
      toast({
        title: 'Step Completed!',
        description: `Step ${pendingStepNumber} has been marked as complete.`,
      });
      
      // Save progress with the new completed steps
      setTimeout(() => {
        saveProgress('IN_PROGRESS');
      }, 100);
    }
    
    // Resume timer
    setIsTimerRunning(true);
    
    // Reset knowledge check state
    setPendingStepNumber(null);
    setCurrentQuestion(null);
    setEngagementStartTime(null);
    setShowKnowledgeCheck(false);
  };

  const handleKnowledgeCheckExit = () => {
    // Don't complete the step, just resume practice
    setIsTimerRunning(true);
    
    // Reset knowledge check state
    setPendingStepNumber(null);
    setCurrentQuestion(null);
    setEngagementStartTime(null);
    setShowKnowledgeCheck(false);
    
    toast({
      title: 'Quiz Exited',
      description: 'Returned to practice. The step was not completed.',
    });
  };

  const shouldTriggerKnowledgeCheck = (newCompletedCount: number) => {
    // Trigger every 3rd step, but only if we haven't triggered recently
    const stepsSinceLastCheck = newCompletedCount - lastKnowledgeCheckStep;
    return stepsSinceLastCheck >= 3;
  };

  const toggleStepCompletion = async (stepNumber: number) => {
    // Prevent toggling if a knowledge check is active
    if (showKnowledgeCheck) return;
    
    const isCurrentlyCompleted = completedSteps.includes(stepNumber);
    
    if (isCurrentlyCompleted) {
      // Unchecking a step
      const newCompletedSteps = completedSteps.filter(s => s !== stepNumber);
      setCompletedSteps(newCompletedSteps);
      setStepsCompletedThisSession(Math.max(0, stepsCompletedThisSession - 1));
      return;
    }
    
    // Checking a step - check if we need a knowledge check
    const newCompletedCount = stepsCompletedThisSession + 1;
    
    if (shouldTriggerKnowledgeCheck(newCompletedCount)) {
      // Pause timer and trigger knowledge check
      setIsTimerRunning(false);
      setPendingStepNumber(stepNumber);
      setEngagementStartTime(Date.now());
      
      const question = await fetchKnowledgeCheckQuestion();
      if (question) {
        setShowKnowledgeCheck(true);
        toast({
          title: 'Knowledge Check Required',
          description: 'Please answer the question to continue practicing.',
        });
      } else {
        // If we can't get a question, complete the step normally
        const newCompletedSteps = [...completedSteps, stepNumber];
        setCompletedSteps(newCompletedSteps);
        setStepsCompletedThisSession(newCompletedCount);
        setIsTimerRunning(true);
        saveProgress('IN_PROGRESS');
      }
    } else {
      // Complete step normally
      const newCompletedSteps = [...completedSteps, stepNumber];
      setCompletedSteps(newCompletedSteps);
      setStepsCompletedThisSession(newCompletedCount);
      
      // Auto-save progress
      saveProgress('IN_PROGRESS');
    }
  };

  const updateAttempt = async () => {
    if (!currentAttemptId || !skill) return;
    
    try {
      await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: skill.id,
          action: 'UPDATE',
          completedSteps: completedSteps.length,
          timeSpentMinutes: Math.floor(timeSpent / 60),
        }),
      });
    } catch (error) {
      console.error('Error updating attempt:', error);
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
      
      // Also update the attempt
      await updateAttempt();
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

    // CRITICAL FIX: Trigger final quiz before completion
    setIsTimerRunning(false);
    
    // Check if quiz needs to be taken first
    try {
      // Fetch quiz question to trigger the final quiz popup
      const response = await fetch(`/api/skills/${skillId}/quiz`);
      
      if (response.ok) {
        const question = await response.json();
        
        // Set up quiz state and show the modal
        setCurrentQuestion(question);
        setPendingStepNumber(Math.max(...completedSteps));
        setEngagementStartTime(Date.now());
        setShowKnowledgeCheck(true);
        setStepsCompletedThisSession(prev => prev + 1);
        
        toast({
          title: 'Final Quiz Required',
          description: 'Please answer the quiz question to complete this skill.',
        });
        
        // Don't proceed to reflection yet - wait for quiz completion
        return;
      } else {
        // No quiz available, proceed with normal completion
        console.log('No quiz available for this skill, proceeding to completion');
      }
    } catch (error) {
      console.error('Error fetching final quiz:', error);
      // If quiz fails, proceed with normal completion
    }
    
    // Complete the skill normally (only reached if no quiz or quiz failed)
    await saveProgress('COMPLETED');
    
    // Mark attempt as completed
    if (currentAttemptId) {
      try {
        await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skillId: skill.id,
            action: 'COMPLETE',
            completedSteps: completedSteps.length,
            timeSpentMinutes: Math.floor(timeSpent / 60),
            reflectionCompleted: false,
          }),
        });
        setCompletedAttempts(prev => prev + 1);
      } catch (error) {
        console.error('Error completing attempt:', error);
      }
    }
    
    toast({
      title: 'Skill Completed!',
      description: 'Congratulations! You have successfully completed this skill.',
    });
    
    router.push(`/skills/student/skills/${skillId}/reflection`);
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
        <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Skill not found</h2>
        <p className="text-gray-600">The skill you're looking for doesn't exist.</p>
      </div>
    );
  }

  const completionPercentage = skill.steps?.length ? (completedSteps.length / skill.steps.length) * 100 : 0;
  const isSkillComplete = completedSteps.length >= Math.ceil((skill.steps?.length || 0) * 0.8);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      {/* Header */}
      <SkillPracticeHeader
        skill={skill}
        completedSteps={completedSteps}
        timeSpent={timeSpent}
        isTimerRunning={isTimerRunning}
        onBack={() => router.back()}
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
                  <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
                  Practice Steps
                </h2>
                <Badge variant="outline" className="border-orange-200 text-orange-700">
                  {completedSteps.length} / {skill.steps?.length || 0} completed
                </Badge>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {skill.steps?.map((step, index) => (
                  <SkillStepCard
                    key={step.id}
                    step={step}
                    isCompleted={completedSteps.includes(step.stepNumber)}
                    onToggleComplete={toggleStepCompletion}
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
                          You've completed the required steps. Ready to finish this skill?
                        </div>
                      </div>
                      <Button 
                        onClick={completeSkill} 
                        className="bg-green-600 hover:bg-green-700 ml-4"
                      >
                        Complete Skill
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
                    {Math.round(completionPercentage)}%
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
                  <div className="flex justify-between text-sm">
                    <span>Total attempts</span>
                    <span className="font-medium">{totalAttempts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed attempts</span>
                    <span className="font-medium text-green-600">{completedAttempts}</span>
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
        isOpen={showKnowledgeCheck}
        onClose={() => setShowKnowledgeCheck(false)}
        question={currentQuestion}
        skillName={skill?.name || ''}
        stepNumber={pendingStepNumber || 0}
        questionCount={1}
        totalQuestions={1}
        onAnswerSubmit={handleKnowledgeCheckAnswer}
        onCorrectAnswer={handleKnowledgeCheckComplete}
        onExit={handleKnowledgeCheckExit}
      />
    </div>
  );
}
