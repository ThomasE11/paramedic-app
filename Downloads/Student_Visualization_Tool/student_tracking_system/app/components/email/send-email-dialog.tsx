
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  Users, 
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  studentId: string;
}

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  defaultSubject?: string;
  defaultMessage?: string;
  type?: 'general' | 'class_reminder';
  classId?: string;
}

export function SendEmailDialog({
  open,
  onOpenChange,
  students,
  defaultSubject = '',
  defaultMessage = '',
  type = 'general',
  classId
}: SendEmailDialogProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both subject and message',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const payload = {
        type,
        recipients: students.map(s => s.id),
        subject: subject.trim(),
        message: message.trim(),
        ...(classId && { classId })
      };

      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.needsSetup) {
        toast({
          title: 'Gmail Not Configured',
          description: 'Please set up Gmail integration first',
          variant: 'destructive'
        });
        return;
      }

      if (data.success) {
        setResult(data);
        toast({
          title: 'Emails Sent Successfully! 📧',
          description: `Sent ${data.emailsSent} emails to students`
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send emails',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Email sending error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send emails. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setSubject(defaultSubject);
      setMessage(defaultMessage);
      setResult(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Send Email to {students.length === 1 ? 'Student' : 'Students'}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          // Success Result
          <div className="space-y-6">
            <div className="text-center p-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Emails Sent Successfully!
              </h3>
              <p className="text-green-700">
                Successfully sent <strong>{result.emailsSent}</strong> emails
                {result.errors && result.errors.length > 0 && (
                  <span className="text-orange-600">
                    {' '}with {result.errors.length} errors
                  </span>
                )}
              </p>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <strong>Some emails failed to send:</strong>
                </div>
                <ul className="text-orange-700 text-sm space-y-1">
                  {result.errors.map((error: any, index: number) => (
                    <li key={index}>
                      Student ID: {error.studentId} - {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          // Email Composition
          <div className="space-y-6">
            {/* Recipients */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                {students.length === 1 ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
                Recipients ({students.length})
              </Label>
              
              <div className="max-h-32 overflow-y-auto space-y-2 p-3 border rounded-lg bg-gray-50">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 text-sm">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="font-medium">{student.fullName}</span>
                      <span className="text-gray-500 ml-2">({student.studentId})</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {student.email}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="mt-1"
                disabled={sending}
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={8}
                className="mt-1"
                disabled={sending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your message will be formatted nicely with HCT branding when sent.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send {students.length === 1 ? 'Email' : `${students.length} Emails`}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
