'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  Send,
  RefreshCw,
  Sparkles,
  Eye,
  Edit3,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FeedbackEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  onSent?: () => void;
}

export function FeedbackEmailModal({
  isOpen,
  onClose,
  evaluationId,
  studentName,
  studentEmail,
  assignmentTitle,
  onSent
}: FeedbackEmailModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailData, setEmailData] = useState<any>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !emailData) {
      generateEmail();
    }
  }, [isOpen]);

  const generateEmail = async () => {
    setIsGenerating(true);
    setEmailData(null);

    try {
      const response = await fetch('/api/evaluate/generate-feedback-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEmailData(data.emailDraft);
        setEditedSubject(data.emailDraft.subject);
        setEditedBody(data.emailDraft.body);

        if (data.metadata?.usingFallback) {
          toast({
            title: 'Email Generated (Template)',
            description: 'Using template email. AI generation temporarily unavailable.',
          });
        } else {
          toast({
            title: 'Email Generated',
            description: 'AI-powered feedback email ready for review'
          });
        }
      } else {
        throw new Error(data.error || 'Failed to generate email');
      }
    } catch (error: any) {
      console.error('Email generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate feedback email',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    setIsSending(true);

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to,
          subject: editedSubject,
          body: editedBody,
          type: 'feedback'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Email Sent',
          description: `Feedback email sent to ${studentName}`,
        });

        if (onSent) {
          onSent();
        }

        onClose();
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      toast({
        title: 'Send Failed',
        description: error.message || 'Failed to send email',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRegenerate = () => {
    setIsEditing(false);
    generateEmail();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Send Feedback Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Recipient</p>
                <p className="text-lg font-semibold">{studentName}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{studentEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Assignment</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{assignmentTitle}</p>
                {emailData && (
                  <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-300">
                    Score: {emailData.score} ({emailData.percentage}%)
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isGenerating && (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-sm text-muted-foreground">
                Generating personalized feedback email with AI...
              </p>
            </div>
          )}

          {/* Email Content */}
          {!isGenerating && emailData && (
            <>
              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">AI-Generated Feedback</span>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Email
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>

              {/* Edit Mode */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      placeholder="Email subject"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="body">Email Body</Label>
                    <Textarea
                      id="body"
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      placeholder="Email content"
                      rows={20}
                      className="mt-1 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {editedBody.length} characters • {editedBody.split(/\s+/).length} words
                    </p>
                  </div>
                </div>
              ) : (
                /* Preview Mode */
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Subject</p>
                    <p className="font-semibold">{editedSubject}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap font-sans leading-relaxed">
                        {editedBody}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Summary */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-purple-900 dark:text-purple-200 mb-1">
                      Email includes:
                    </p>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>✓ Personalized greeting and context</li>
                      <li>✓ Specific strengths identified in their work</li>
                      <li>✓ Constructive areas for improvement</li>
                      <li>✓ Actionable suggestions for growth</li>
                      <li>✓ Encouraging closing and offer of support</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-orange-800 dark:text-orange-300">
                      <strong>Please review carefully before sending.</strong> This email will be sent directly
                      to the student from your connected email account. Make sure all feedback is accurate and appropriate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendEmail}
                  disabled={isSending || !editedSubject.trim() || !editedBody.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback Email
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
