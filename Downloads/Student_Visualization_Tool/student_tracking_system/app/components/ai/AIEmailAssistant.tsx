'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Bot,
  Send,
  Loader2,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  Mail
} from 'lucide-react';

interface AIEmailAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  student?: {
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    module?: {
      code: string;
      name: string;
    };
  };
  context?: {
    attendanceRate?: number;
    recentAttendance?: string[];
    notes?: string[];
  };
}

interface AIResponse {
  understood: boolean;
  action: string;
  subject?: string;
  message?: string;
  summary?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  awaitingConfirmation?: boolean;
  recipients?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  success?: boolean;
  error?: string;
}

export function AIEmailAssistant({ isOpen, onClose, student, context }: AIEmailAssistantProps) {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    response?: AIResponse;
  }>>([]);
  const [pendingAction, setPendingAction] = useState<AIResponse | null>(null);
  const { toast } = useToast();

  const sendToAI = async (message: string, confirmed = false, actionToConfirm: AIResponse | null = null) => {
    if (!message.trim() && !confirmed) return;

    setIsProcessing(true);

    // Add user message to conversation
    if (message.trim()) {
      setConversation(prev => [...prev, {
        type: 'user',
        content: message,
        timestamp: new Date()
      }]);
    }

    try {
      const requestBody: any = {
        command: message || 'Confirmed action',
        confirmed,
        pendingAction: actionToConfirm,
        studentContext: student ? {
          id: student.id,
          studentId: student.studentId,
          name: student.fullName,
          email: student.email,
          module: student.module,
          attendanceRate: context?.attendanceRate,
          recentAttendance: context?.recentAttendance,
          notes: context?.notes
        } : null
      };

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const aiResponse: AIResponse = await response.json();

      // Add AI response to conversation
      setConversation(prev => [...prev, {
        type: 'ai',
        content: aiResponse.message || aiResponse.summary || 'Response received',
        timestamp: new Date(),
        response: aiResponse
      }]);

      if (aiResponse.awaitingConfirmation && aiResponse.requiresConfirmation) {
        setPendingAction(aiResponse);
        toast({
          title: 'Confirmation Required',
          description: aiResponse.confirmationMessage || 'Please confirm the action',
        });
      } else if (aiResponse.success) {
        setPendingAction(null);
        toast({
          title: 'Success',
          description: aiResponse.summary || 'Action completed successfully',
        });
      } else if (aiResponse.error) {
        toast({
          title: 'Error',
          description: aiResponse.error,
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      setConversation(prev => [...prev, {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
      toast({
        title: 'Error',
        description: 'Failed to communicate with AI assistant',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      sendToAI('', true, pendingAction);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setPendingAction(null);
    toast({
      title: 'Cancelled',
      description: 'Action has been cancelled',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      sendToAI(command);
      setCommand('');
    }
  };

  const getSuggestedCommands = () => {
    if (!student) return [];

    const suggestions = [
      `Email ${student.fullName} about missing assignments`,
      `Send reminder about upcoming class to ${student.fullName}`,
      `Email ${student.fullName} about their attendance (${context?.attendanceRate}%)`,
      `Create a case study about cardiac emergencies for ${student.module?.name}`,
      `Generate practice scenario for ${student.module?.code} students`,
    ];

    return suggestions;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI Email & Educational Assistant
            {student && (
              <Badge variant="outline" className="ml-2">
                {student.fullName} - {student.module?.code}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Context Card */}
          {student && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {student.fullName} ({student.studentId})
                  </h3>
                  <p className="text-sm text-blue-700">
                    {student.module?.code} - {student.module?.name}
                  </p>
                  {context?.attendanceRate && (
                    <p className="text-xs text-blue-600 mt-1">
                      Attendance Rate: {context.attendanceRate}%
                      {context.attendanceRate < 75 && (
                        <AlertTriangle className="w-3 h-3 inline ml-1 text-orange-500" />
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {conversation.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Assistant Ready</h3>
                <p className="text-sm">Ask me to help with emails, case studies, or student communication.</p>

                {getSuggestedCommands().length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-medium text-gray-600 mb-3">Try these suggestions:</p>
                    <div className="space-y-2">
                      {getSuggestedCommands().slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => setCommand(suggestion)}
                          className="text-xs text-left w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      msg.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.type === 'ai' && (
                      <Bot className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    )}

                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                        {msg.response?.success && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                      </div>

                      {/* Action buttons for AI responses */}
                      {msg.response?.awaitingConfirmation && pendingAction && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            {msg.response.confirmationMessage}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={confirmAction} disabled={isProcessing}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Confirm
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelAction}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Recipients info */}
                      {msg.response?.recipients && msg.response.recipients.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-600 mb-1">
                            Recipients ({msg.response.recipients.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {msg.response.recipients.slice(0, 3).map((recipient, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {recipient.name}
                              </Badge>
                            ))}
                            {msg.response.recipients.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{msg.response.recipients.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {msg.type === 'user' && (
                      <User className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={
                  student
                    ? `Ask me to email ${student.fullName}, create educational content, generate case studies, or anything else...`
                    : "How can I help you with emails, educational content, or student communication?"
                }
                className="flex-1 min-h-[80px] resize-none"
                disabled={isProcessing}
              />
              <Button
                type="submit"
                disabled={isProcessing || !command.trim()}
                className="h-20 px-4"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MessageSquare className="w-3 h-3" />
              <span>
                {student
                  ? `Context: Student ${student.fullName}, Module ${student.module?.code}, Attendance ${context?.attendanceRate}%`
                  : "General AI assistant mode"}
              </span>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}