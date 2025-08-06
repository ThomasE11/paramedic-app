
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { CheckCircle, XCircle, HelpCircle, Clock, Brain, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
}

interface KnowledgeCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuizQuestion | null;
  skillName: string;
  stepNumber: number;
  questionCount?: number;
  totalQuestions?: number;
  onAnswerSubmit: (questionId: number, selectedAnswer: number) => Promise<{
    correct: boolean;
    correctAnswer: number;
    explanation: string;
  }>;
  onCorrectAnswer: () => void;
  onExit?: () => void; // New prop for exit functionality
}

export function KnowledgeCheckModal({
  isOpen,
  onClose,
  question,
  skillName,
  stepNumber,
  questionCount = 1,
  totalQuestions = 2,
  onAnswerSubmit,
  onCorrectAnswer,
  onExit
}: KnowledgeCheckModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    correct: boolean;
    correctAnswer: number;
    explanation: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !question) return;
    
    setIsSubmitting(true);
    try {
      const result = await onAnswerSubmit(question.id, selectedAnswer);
      setAnswerResult(result);
      setShowResult(true);
      
      // Track response time
      const responseTime = Date.now() - startTime;
      console.log(`Question answered in ${responseTime}ms`);
      
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (answerResult?.correct) {
      // Call the correct answer handler first
      onCorrectAnswer();
      // Don't reset here, let the parent handle it by closing the modal
      // The modal will reset when isOpen becomes false
    }
  };

  const handleExitQuiz = () => {
    // Reset the modal state
    handleReset();
    // Close the modal
    onClose();
    // Call the exit handler to return to previous step
    if (onExit) {
      onExit();
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswerResult(null);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswerResult(null);
  };

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure state changes are processed
      setTimeout(() => {
        handleReset();
      }, 200);
    }
  }, [isOpen]);

  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !showResult) {
        // Only allow closing if we're not showing results
        onClose();
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => {
        // Prevent closing when showing results or submitting
        if (showResult || isSubmitting) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Brain className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Knowledge Check
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Question {questionCount} of {totalQuestions} - <span className="font-medium">{skillName}</span>
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitQuiz}
              className="p-2 h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Exit quiz and return to previous step"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-600 dark:text-orange-300">
              {totalQuestions === 1 ? "Final Quiz" : `Quiz - Question ${questionCount}/${totalQuestions}`}
            </Badge>
            <div className="flex items-center space-x-1 text-muted-foreground text-sm">
              <Clock className="h-3 w-3" />
              <span>{totalQuestions === 1 ? "Final Assessment" : `Question ${questionCount}/${totalQuestions}`}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-1">
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium leading-relaxed text-lg">
                    {question.question}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answer Options */}
          <div className="space-y-3">
            <p className="text-base font-medium text-foreground">Select your answer:</p>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = showResult && index === answerResult?.correctAnswer;
              const isWrong = showResult && isSelected && !answerResult?.correct;
              
              return (
                <Card
                  key={index}
                  className={cn(
                    'cursor-pointer transition-all duration-200 border-2',
                    showResult
                      ? isCorrect
                        ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                        : isWrong
                        ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                        : 'border-border bg-card'
                      : isSelected
                      ? 'border-orange-300 bg-orange-50 dark:border-orange-500 dark:bg-orange-900/20 shadow-sm'
                      : 'border-border hover:border-orange-200 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
                  )}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium',
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-500 text-white'
                            : isWrong
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-muted bg-background text-muted-foreground'
                          : isSelected
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-muted bg-background text-muted-foreground'
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className={cn(
                        'flex-1 text-base',
                        showResult
                          ? isCorrect
                            ? 'text-green-800 dark:text-green-200 font-medium'
                            : isWrong
                            ? 'text-red-800 dark:text-red-200'
                            : 'text-foreground'
                          : 'text-foreground'
                      )}>
                        {option}
                      </span>
                      {showResult && isCorrect && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {showResult && isWrong && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Result and Explanation */}
          {showResult && answerResult && (
            <Card className={cn(
              'border-2',
              answerResult.correct 
                ? 'border-green-200 bg-green-50 dark:border-green-600 dark:bg-green-900/20' 
                : 'border-red-200 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
            )}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    'p-1.5 rounded-full mt-1',
                    answerResult.correct 
                      ? 'bg-green-100 dark:bg-green-800/30' 
                      : 'bg-red-100 dark:bg-red-800/30'
                  )}>
                    {answerResult.correct ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'font-medium mb-2',
                      answerResult.correct 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    )}>
                      {answerResult.correct ? 'Correct!' : 'Incorrect'}
                    </p>
                    {answerResult.explanation && (
                      <p className={cn(
                        'text-base leading-relaxed',
                        answerResult.correct 
                          ? 'text-green-700 dark:text-green-300' 
                          : 'text-red-700 dark:text-red-300'
                      )}>
                        {answerResult.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              You must answer correctly to {totalQuestions === 1 ? 'complete the skill' : questionCount >= totalQuestions ? 'complete the skill' : 'continue to next question'}
            </div>
            <div className="flex space-x-3">
              {!showResult ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null || isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </Button>
              ) : answerResult?.correct ? (
                <Button
                  onClick={handleContinue}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {totalQuestions === 1 ? 'Complete Skill' : questionCount >= totalQuestions ? 'Complete Quiz' : 'Next Question'}
                </Button>
              ) : (
                <Button
                  onClick={handleTryAgain}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
