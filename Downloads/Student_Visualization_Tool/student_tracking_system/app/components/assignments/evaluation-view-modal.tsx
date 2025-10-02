'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  User,
  FileText,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { EvaluationDetailModal } from './evaluation-detail-modal';

interface EvaluationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
}

interface Submission {
  id: string;
  fileName: string;
  submittedAt: string;
  status: string;
  student: {
    id: string;
    studentId: string;
    fullName: string;
  };
  evaluations: Array<{
    id: string;
    totalScore: number;
    feedback?: string;
    strengths?: string;
    improvements?: string;
    suggestions?: string;
    confidence?: number;
    aiGenerated: boolean;
    createdAt: string;
    rubric: {
      title: string;
      version: number;
    };
  }>;
}

export function EvaluationViewModal({
  isOpen,
  onClose,
  assignment
}: EvaluationViewModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && assignment) {
      fetchSubmissions();
    }
  }, [isOpen, assignment]);

  const fetchSubmissions = async () => {
    if (!assignment) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/submissions?assignmentId=${assignment.id}`);
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load submissions',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evaluated':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Evaluations: {assignment.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Assignment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {submissions.filter(s => s.status === 'evaluated').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Evaluated</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {submissions.filter(s => s.status === 'pending').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {submissions.length > 0 ?
                      Math.round(submissions
                        .filter(s => s.evaluations.length > 0)
                        .reduce((acc, s) => acc + s.evaluations[0]?.totalScore || 0, 0) /
                        submissions.filter(s => s.evaluations.length > 0).length) || 0 : 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Submissions & Evaluations</h3>
              <Button
                onClick={fetchSubmissions}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-3 text-muted-foreground">Loading submissions...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">No Submissions Yet</h3>
                <p className="text-muted-foreground">Upload student submissions to see evaluations here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map(submission => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium">{submission.student.fullName}</p>
                              <p className="text-sm text-muted-foreground">ID: {submission.student.studentId}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{submission.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(submission.submittedAt), 'MMM d, yyyy at h:mm a')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.toUpperCase()}
                          </Badge>

                          {submission.evaluations.length > 0 && (
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getScoreColor(submission.evaluations[0].totalScore, assignment.maxScore)}`}>
                                {submission.evaluations[0].totalScore}/{assignment.maxScore}
                              </div>
                              <div className="flex items-center gap-1">
                                {submission.evaluations[0].aiGenerated && (
                                  <Brain className="w-3 h-3 text-purple-600" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {Math.round((submission.evaluations[0].totalScore / assignment.maxScore) * 100)}%
                                </span>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubmission(submission);
                              setIsDetailModalOpen(true);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Evaluation View */}
          {selectedSubmission && selectedSubmission.evaluations.length > 0 && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Detailed Evaluation: {selectedSubmission.student.fullName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSubmission.evaluations.map(evaluation => (
                  <div key={evaluation.id} className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{evaluation.rubric.title} (v{evaluation.rubric.version})</p>
                        <p className="text-sm text-muted-foreground">
                          Evaluated on {format(new Date(evaluation.createdAt), 'MMM d, yyyy at h:mm a')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(evaluation.totalScore, assignment.maxScore)}`}>
                          {evaluation.totalScore}/{assignment.maxScore}
                        </div>
                        {evaluation.confidence && (
                          <p className="text-sm text-muted-foreground">
                            Confidence: {Math.round(evaluation.confidence * 100)}%
                          </p>
                        )}
                      </div>
                    </div>

                    {evaluation.strengths && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <h4 className="font-medium text-green-700 dark:text-green-300">Strengths</h4>
                        </div>
                        <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-800">
                          {evaluation.strengths}
                        </p>
                      </div>
                    )}

                    {evaluation.improvements && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-yellow-600" />
                          <h4 className="font-medium text-yellow-700 dark:text-yellow-300">Areas for Improvement</h4>
                        </div>
                        <p className="text-sm bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                          {evaluation.improvements}
                        </p>
                      </div>
                    )}

                    {evaluation.suggestions && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-blue-600" />
                          <h4 className="font-medium text-blue-700 dark:text-blue-300">Suggestions</h4>
                        </div>
                        <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                          {evaluation.suggestions}
                        </p>
                      </div>
                    )}

                    {evaluation.feedback && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Overall Feedback</h4>
                        <p className="text-sm bg-muted/30 p-3 rounded border">
                          {evaluation.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Detailed Evaluation Modal */}
      <EvaluationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onReEvaluate={() => {
          fetchSubmissions();
          setIsDetailModalOpen(false);
          setSelectedSubmission(null);
        }}
      />
    </Dialog>
  );
}