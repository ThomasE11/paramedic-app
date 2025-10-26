'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Bot,
  Send,
  Loader2,
  GraduationCap,
  Mail,
  StickyNote,
  Users,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  FileText,
  Clock,
  Target,
  Shield,
  Activity
} from 'lucide-react';

interface UnifiedClaudiaProps {
  isOpen: boolean;
  onClose: () => void;
  moduleContext?: {
    code: string;
    name: string;
    id: string;
  };
  studentContext?: {
    id: string;
    name: string;
    module?: {
      code: string;
      name: string;
    };
  };
}

interface ClaudiaResponse {
  success: boolean;
  understood: boolean;
  mode: string;
  action: string;
  summary: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  pendingAction?: any;
  actionsPerformed?: {
    emailsSent?: number;
    notesCreated?: number;
    activitiesLogged?: number;
    studentsAffected?: number;
  };
  educationalContent?: any;
  warnings?: string[];
  details?: any;
  error?: string;
}

const QUICK_COMMANDS = {
  instructor: [
    'Send reminder to H00601771 about clinical logs',
    'Follow up with students who missed class yesterday',
    'Email all HEM3923 students about tomorrow\'s practical',
    'Add note to H00541639 about excellent progress',
    'Check which students need practicals reminder'
  ],
  educational: [
    'Create a cardiac emergency case study for intermediate students',
    'Generate respiratory distress scenario with vital signs',
    'Brainstorm trauma assessment exercise ideas',
    'Create assessment questions about EMS protocols',
    'Design a patient evaluation checklist'
  ]
};

export function UnifiedClaudiaAssistant({ isOpen, onClose, moduleContext, studentContext }: UnifiedClaudiaProps) {
  const [command, setCommand] = useState('');
  const [mode, setMode] = useState<'auto' | 'educational' | 'instructor'>('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<ClaudiaResponse | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<ClaudiaResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'claudia';
    content: string;
    response?: ClaudiaResponse;
    timestamp: Date;
  }>>([]);
  const { toast } = useToast();

  const sendToClaudia = async (message: string, confirmed: boolean = false) => {
    if (!message.trim() && !confirmed) return;

    setIsProcessing(true);

    if (!confirmed) {
      setConversationHistory(prev => [...prev, {
        type: 'user',
        content: message,
        timestamp: new Date()
      }]);
    }

    try {
      const requestBody: any = {
        command: message,
        mode,
        confirmed,
        context: {
          moduleCode: moduleContext?.code,
          moduleName: moduleContext?.name,
          moduleId: moduleContext?.id,
          studentId: studentContext?.id,
          studentName: studentContext?.name
        }
      };

      if (confirmed && pendingConfirmation?.pendingAction) {
        requestBody.pendingAction = pendingConfirmation.pendingAction;
      }

      const response = await fetch('/api/ai-assistant/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const claudiaResponse: ClaudiaResponse = await response.json();

      if (!claudiaResponse.understood) {
        toast({
          title: 'Could not understand',
          description: claudiaResponse.error || 'Please try rephrasing your request',
          variant: 'destructive'
        });
        return;
      }

      if (claudiaResponse.requiresConfirmation && !confirmed) {
        // Show confirmation dialog
        setPendingConfirmation(claudiaResponse);
        toast({
          title: 'Confirmation Required',
          description: 'Please review and confirm the action',
        });
      } else if (claudiaResponse.success) {
        // Action completed
        setCurrentResponse(claudiaResponse);
        setConversationHistory(prev => [...prev, {
          type: 'claudia',
          content: claudiaResponse.summary,
          response: claudiaResponse,
          timestamp: new Date()
        }]);
        setPendingConfirmation(null);

        toast({
          title: 'Success',
          description: claudiaResponse.summary,
        });
      } else {
        toast({
          title: 'Error',
          description: claudiaResponse.error || 'Action failed',
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Claudia error:', error);
      toast({
        title: 'Error',
        description: 'Failed to communicate with Claudia AI',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      sendToClaudia(command);
      setCommand('');
    }
  };

  const confirmAction = () => {
    if (pendingConfirmation) {
      sendToClaudia(pendingConfirmation.summary, true);
    }
  };

  const cancelAction = () => {
    setPendingConfirmation(null);
    toast({
      title: 'Cancelled',
      description: 'Action cancelled'
    });
  };

  const useQuickCommand = (cmd: string) => {
    setCommand(cmd);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-600" />
            Claudia - Your Unified AI Assistant
            {moduleContext && (
              <Badge variant="outline" className="ml-2">
                {moduleContext.code} - {moduleContext.name}
              </Badge>
            )}
            {studentContext && (
              <Badge variant="outline" className="ml-2 bg-blue-50">
                Student: {studentContext.name}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              Educational Content
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Student Communication
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Verified & Safe
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
          {/* Quick Commands Sidebar */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={mode === 'auto' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setMode('auto')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Detect
                </Button>
                <Button
                  variant={mode === 'instructor' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setMode('instructor')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Instructor Commands
                </Button>
                <Button
                  variant={mode === 'educational' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setMode('educational')}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Educational Content
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Quick Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-purple-600 mb-2">Instructor Tasks</h4>
                  {QUICK_COMMANDS.instructor.slice(0, 3).map((cmd, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      onClick={() => useQuickCommand(cmd)}
                      className="w-full text-left justify-start text-xs h-auto p-2 mb-1 hover:bg-purple-50"
                    >
                      <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                      {cmd}
                    </Button>
                  ))}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-blue-600 mb-2">Educational</h4>
                  {QUICK_COMMANDS.educational.slice(0, 3).map((cmd, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      onClick={() => useQuickCommand(cmd)}
                      className="w-full text-left justify-start text-xs h-auto p-2 mb-1 hover:bg-blue-50"
                    >
                      <GraduationCap className="w-3 h-3 mr-2 flex-shrink-0" />
                      {cmd}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Features */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                  <Shield className="w-4 h-4" />
                  Safety Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-green-700">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Confirmation required for emails</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Duplicate prevention (1-hour window)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Automatic note creation</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Complete activity logging</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Verified student data only</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            {/* Confirmation Dialog */}
            {pendingConfirmation && (
              <Alert className="mb-4 border-yellow-400 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-900">Confirmation Required</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="text-yellow-800 mb-3">{pendingConfirmation.confirmationMessage}</p>

                  {pendingConfirmation.details && (
                    <div className="bg-white rounded p-3 mb-3 text-sm space-y-1">
                      <div className="font-semibold text-gray-900">Action Details:</div>
                      {pendingConfirmation.details.studentsAffected !== undefined && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span>Students affected: {pendingConfirmation.details.studentsAffected}</span>
                        </div>
                      )}
                      {pendingConfirmation.pendingAction?.emailDetails && (
                        <>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-600" />
                            <span>Subject: {pendingConfirmation.pendingAction.emailDetails.subject}</span>
                          </div>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            {pendingConfirmation.pendingAction.emailDetails.body.substring(0, 200)}...
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {pendingConfirmation.warnings && pendingConfirmation.warnings.length > 0 && (
                    <div className="bg-yellow-100 rounded p-3 mb-3 text-sm">
                      <div className="font-semibold text-yellow-900 mb-1">⚠️ Warnings:</div>
                      {pendingConfirmation.warnings.map((warning, idx) => (
                        <div key={idx} className="text-yellow-800">{warning}</div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={confirmAction}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm & Execute
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={cancelAction}
                      variant="outline"
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Results Display */}
            <div className="flex-1 overflow-y-auto mb-4">
              {currentResponse && (
                <Card className="mb-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {currentResponse.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                        {currentResponse.summary}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={currentResponse.mode === 'educational' ? 'default' : 'secondary'}>
                          {currentResponse.mode}
                        </Badge>
                        <Badge variant="outline">{currentResponse.action}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Actions Performed Summary */}
                    {currentResponse.actionsPerformed && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {currentResponse.actionsPerformed.emailsSent !== undefined && (
                          <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <Mail className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-blue-900">
                              {currentResponse.actionsPerformed.emailsSent}
                            </div>
                            <div className="text-xs text-blue-700">Emails Sent</div>
                          </div>
                        )}
                        {currentResponse.actionsPerformed.notesCreated !== undefined && (
                          <div className="bg-purple-50 p-3 rounded-lg text-center">
                            <StickyNote className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-purple-900">
                              {currentResponse.actionsPerformed.notesCreated}
                            </div>
                            <div className="text-xs text-purple-700">Notes Created</div>
                          </div>
                        )}
                        {currentResponse.actionsPerformed.studentsAffected !== undefined && (
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                            <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-green-900">
                              {currentResponse.actionsPerformed.studentsAffected}
                            </div>
                            <div className="text-xs text-green-700">Students</div>
                          </div>
                        )}
                        {currentResponse.actionsPerformed.activitiesLogged !== undefined && (
                          <div className="bg-orange-50 p-3 rounded-lg text-center">
                            <Activity className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-orange-900">
                              {currentResponse.actionsPerformed.activitiesLogged}
                            </div>
                            <div className="text-xs text-orange-700">Activities Logged</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Educational Content */}
                    {currentResponse.educationalContent && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Educational Content Generated</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">
                            {currentResponse.educationalContent.title}
                          </h5>
                          <p className="text-sm text-blue-800 mb-3">
                            {currentResponse.educationalContent.description}
                          </p>
                          {currentResponse.educationalContent.learningObjectives && (
                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-blue-900">Learning Objectives:</div>
                              {currentResponse.educationalContent.learningObjectives.map((obj: string, idx: number) => (
                                <div key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {obj}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Processing Details */}
                    {currentResponse.details && (
                      <div className="text-xs text-gray-600 space-y-1 border-t pt-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>Processing time: {currentResponse.details.processingTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          <span>Processed by: {currentResponse.details.processedBy}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Conversation History */}
              {conversationHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Conversation History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversationHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.type === 'user'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-sm">{msg.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {!currentResponse && conversationHistory.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Bot className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Claudia is Ready</h3>
                  <p className="text-sm">
                    Your unified AI assistant for educational content and instructor tasks.
                  </p>
                  <p className="text-xs mt-2 text-gray-400">
                    Try the quick commands on the left or type your own instruction below.
                  </p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={`Tell Claudia what you need...

Examples:
• "Send reminder to H00601771 about clinical logs"
• "Create a cardiac emergency case study for AEM230"
• "Email all HEM3923 students about tomorrow's practical"
• "Generate assessment questions about EMS protocols"
• "Add note to student about excellent participation"`}
                className="min-h-[100px] resize-none"
                disabled={isProcessing}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    Mode: <Badge variant="outline" className="text-xs">{mode}</Badge>
                  </span>
                  {moduleContext && (
                    <span>| Module: {moduleContext.code}</span>
                  )}
                  {studentContext && (
                    <span>| Student: {studentContext.name}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing || !command.trim()}
                  className="min-w-[120px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send to Claudia
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
