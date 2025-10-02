'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Brain, CheckCircle, AlertCircle, RefreshCw, FileText, User } from 'lucide-react';

interface EvaluationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  onReEvaluate?: () => void;
}

export function EvaluationDetailModal({
  isOpen,
  onClose,
  submission,
  onReEvaluate
}: EvaluationDetailModalProps) {
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const { toast } = useToast();

  const evaluation = submission?.evaluations?.[0];
  const hasValidEvaluation = evaluation && evaluation.totalScore > 0;

  const handleReEvaluate = async () => {
    if (!submission?.assignment?.rubrics?.[0]) {
      toast({
        title: 'No Rubric',
        description: 'This assignment does not have a rubric for evaluation.',
        variant: 'destructive'
      });
      return;
    }

    setIsReEvaluating(true);

    try {
      const response = await fetch('/api/evaluate/re-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          rubricId: submission.assignment.rubrics[0].id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Re-Evaluation Complete',
          description: `New score: ${data.evaluation.totalScore}/${data.evaluation.maxScore} (${data.evaluation.percentage.toFixed(1)}%)`
        });

        if (onReEvaluate) {
          onReEvaluate();
        }
        onClose();
      } else {
        throw new Error(data.details || data.error || 'Re-evaluation failed');
      }
    } catch (error: any) {
      toast({
        title: 'Re-Evaluation Failed',
        description: error.message || 'Failed to re-evaluate submission',
        variant: 'destructive'
      });
    } finally {
      setIsReEvaluating(false);
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Evaluation Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student & Assignment Info */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Student</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.student?.fullName} ({submission.student?.studentId})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Assignment</p>
                  <p className="text-sm text-muted-foreground">{submission.assignment?.title}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Status */}
          {!hasValidEvaluation ? (
            <div className="p-6 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
                    Evaluation Failed or Incomplete
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                    The AI evaluation did not complete successfully. This could be because:
                  </p>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 list-disc list-inside space-y-1 mb-4">
                    <li>Text extraction from the submission file failed</li>
                    <li>The AI service encountered an error</li>
                    <li>The rubric was not properly configured</li>
                  </ul>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReEvaluate}
                      disabled={isReEvaluating}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isReEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Re-Evaluating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-Evaluate Submission
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Score Summary */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Overall Score</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReEvaluate}
                    disabled={isReEvaluating}
                  >
                    {isReEvaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Re-Evaluating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Re-Evaluate
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                    {evaluation.totalScore}
                  </span>
                  <span className="text-2xl text-muted-foreground">/ {evaluation.maxScore}</span>
                  <span className="ml-4 text-xl font-semibold text-blue-600">
                    {evaluation.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Criteria Scores */}
              {evaluation.criteriaScores && Object.keys(evaluation.criteriaScores).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Detailed Scores by Criterion</h3>
                  {Object.entries(evaluation.criteriaScores).map(([criterion, data]: [string, any]) => (
                    <div key={criterion} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{criterion}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                            {data.level}
                          </span>
                          <span className="font-semibold text-lg">{data.points} pts</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{data.justification}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Overall Feedback */}
              {evaluation.feedback && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-200">Overall Feedback</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{evaluation.feedback}</p>
                </div>
              )}

              {/* Strengths */}
              {evaluation.strengths && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold mb-2 text-green-900 dark:text-green-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strengths Identified
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-300">{evaluation.strengths}</p>
                </div>
              )}

              {/* Areas for Improvement */}
              {evaluation.improvements && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="font-semibold mb-2 text-orange-900 dark:text-orange-200">
                    Areas for Improvement
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-300">{evaluation.improvements}</p>
                </div>
              )}
            </>
          )}

          {/* Submission Preview */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Submission Preview</h3>
            <p className="text-sm text-muted-foreground">
              {submission.extractedText?.substring(0, 500) || 'No text extracted'}
              {submission.extractedText?.length > 500 && '...'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Total characters: {submission.extractedText?.length || 0}
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
