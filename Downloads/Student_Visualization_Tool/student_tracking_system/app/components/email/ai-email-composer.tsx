'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Send, RefreshCw, AlertCircle } from 'lucide-react';

interface AIEmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  studentEmail: string;
  initialContext?: {
    assignmentName?: string;
    grade?: number;
    feedback?: string;
  };
}

type EmailType = 'feedback' | 'encouragement' | 'reminder' | 'custom';

export function AIEmailComposer({
  open,
  onOpenChange,
  studentId,
  studentName,
  studentEmail,
  initialContext
}: AIEmailComposerProps) {
  const [emailType, setEmailType] = useState<EmailType>('feedback');
  const [customPrompt, setCustomPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setGenerating(true);
    setShowPreview(false);

    try {
      const response = await fetch('/api/ai-email/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          emailType,
          context: {
            studentName,
            studentEmail,
            ...initialContext,
            customPrompt: emailType === 'custom' || emailType === 'reminder' ? customPrompt : undefined
          }
        })
      });

      const data = await response.json();

      if (data.rateLimited) {
        toast({
          title: 'Rate Limited',
          description: 'Please wait 5 seconds between generations',
          variant: 'destructive'
        });
        return;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setSubject(data.subject);
      setBody(data.body);
      setShowPreview(true);

      toast({
        title: 'Email Generated! ✨',
        description: 'Review the content before sending'
      });

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate email',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: 'Missing Content',
        description: 'Please generate email content first',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/ai-email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          emailType,
          context: {
            studentName,
            studentEmail,
            ...initialContext,
            customPrompt: emailType === 'custom' || emailType === 'reminder' ? customPrompt : undefined
          },
          subject: subject.trim(),
          body: body.trim(),
          confirmed: true // Explicit confirmation
        })
      });

      const data = await response.json();

      if (data.rateLimited) {
        toast({
          title: 'Rate Limited',
          description: 'Please wait 5 seconds between emails',
          variant: 'destructive'
        });
        return;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast({
        title: 'Email Sent Successfully! 📧',
        description: `Sent to ${studentEmail}`
      });

      handleClose();

    } catch (error) {
      console.error('Send error:', error);
      toast({
        title: 'Send Failed',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!generating && !sending) {
      setEmailType('feedback');
      setCustomPrompt('');
      setSubject('');
      setBody('');
      setShowPreview(false);
      onOpenChange(false);
    }
  };

  const emailTypeDescriptions: Record<EmailType, string> = {
    feedback: 'AI will generate personalized feedback based on assignment performance',
    encouragement: 'AI will create a supportive, motivating message',
    reminder: 'AI will compose a professional reminder',
    custom: 'AI will generate content based on your custom instructions'
  };

  const requiresCustomPrompt = emailType === 'custom' || emailType === 'reminder';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Email Assistant
          </DialogTitle>
          <DialogDescription>
            Generate personalized emails for {studentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Type Selection */}
          <div>
            <Label htmlFor="emailType">Email Type</Label>
            <Select value={emailType} onValueChange={(value) => setEmailType(value as EmailType)}>
              <SelectTrigger id="emailType" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feedback">Assignment Feedback</SelectItem>
                <SelectItem value="encouragement">Encouragement</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {emailTypeDescriptions[emailType]}
            </p>
          </div>

          {/* Custom Prompt (for custom/reminder types) */}
          {requiresCustomPrompt && (
            <div>
              <Label htmlFor="customPrompt">
                {emailType === 'reminder' ? 'What should I remind them about?' : 'Custom Instructions'}
              </Label>
              <Textarea
                id="customPrompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={
                  emailType === 'reminder'
                    ? 'e.g., Complete Module 5 assignment by Friday'
                    : 'Describe what you want the email to say...'
                }
                rows={3}
                className="mt-1"
                disabled={generating || sending}
              />
            </div>
          )}

          {/* Generate Button */}
          {!showPreview && (
            <Button
              onClick={handleGenerate}
              disabled={generating || (requiresCustomPrompt && !customPrompt.trim())}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Email with AI
                </>
              )}
            </Button>
          )}

          {/* Preview */}
          {showPreview && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Preview Mode:</strong> Review and edit the AI-generated content before sending.
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Textarea
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  rows={1}
                  className="mt-1"
                  disabled={sending}
                />
              </div>

              <div>
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="mt-1"
                  disabled={sending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can edit the AI-generated content before sending.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={generating || sending}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={generating || sending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={sending || !subject.trim() || !body.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
