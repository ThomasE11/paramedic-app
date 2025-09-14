
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Send, 
  Users, 
  Mail,
  CheckCircle,
  AlertCircle,
  Loader,
  MessageCircle,
  Globe
} from 'lucide-react';

interface AiAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  result?: any;
}

export function AiAssistantDialog({ open, onOpenChange }: AiAssistantDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Hello! I\'m your comprehensive DeepSeek AI assistant for the HCT Al Ain EMS Student Tracking System.\n\n🎯 **What I Can Help You With:**\n• Send emails to students (individual/bulk, English/Arabic)\n• Group students for activities and assignments\n• Update student information and track progress\n• Generate detailed tasks and assignments\n• Create reports and analyze student data\n• Manage class schedules and attendance\n\n💡 **Sample Commands:**\n• "Email all AEM230 students about tomorrow\'s practical"\n• "Create a group assignment for HEM3903 students"\n• "Send Arabic reminder about exam to low-attendance students"\n• "Generate a progress report for Mohammed Al Shamsi"\n• "تذكير طلاب الوحدة بالامتحان النهائي"\n\n⚡ I understand your entire system context and will always confirm important actions before executing them!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const { toast } = useToast();

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: 'confirm',
          confirmed: true,
          pendingAction: pendingAction
        })
      });

      const result = await response.json();

      // Add confirmation result to messages
      const confirmationMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: result.success
          ? `✅ **Action Confirmed & Executed**\n\n${result.message || 'Action completed successfully!'}`
          : `❌ **Action Failed**\n\n${result.error || 'Failed to execute confirmed action'}`,
        timestamp: new Date(),
        result: result
      };

      setMessages(prev => [...prev, confirmationMessage]);
      setPendingAction(null);

      if (result.success && result.emailResults) {
        const { sent, failed } = result.emailResults;
        toast({
          title: 'Emails Sent Successfully! 📧',
          description: `Sent ${sent} emails${failed > 0 ? ` with ${failed} failures` : ''}`
        });
      }

    } catch (error) {
      console.error('Confirmation error:', error);
      toast({
        title: 'Confirmation Failed',
        description: 'Failed to execute confirmed action',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Add a processing message
    const processingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'system',
      content: '🤖 AI is thinking...',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, processingMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      console.log('Sending command to AI assistant:', userMessage.content);
      
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command: userMessage.content })
      });

      console.log('AI Assistant response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If we can't parse the error response, create a generic one
          errorData = {
            error: `Server error: ${response.status}`,
            details: 'Unable to parse error response from server'
          };
        }
        
        console.error('AI Assistant API error:', errorData);
        
        // Handle specific service unavailable errors
        if (response.status === 502 || response.status === 503) {
          throw new Error(`AI Service temporarily unavailable: ${errorData.details || errorData.error}`);
        }
        
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('AI Assistant result:', result);

      // Check if action requires confirmation
      if (result.awaitingConfirmation) {
        setPendingAction(result);
      }

      // Remove processing message and add final result
      setMessages(prev => {
        const withoutProcessing = prev.filter(m => m.id !== processingMessage.id);

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: formatAiResponse(result),
          timestamp: new Date(),
          result: result
        };

        return [...withoutProcessing, assistantMessage];
      });

      // Show toast notification for successful email sending
      if (result?.success && result?.emailResults) {
        const { sent, failed } = result.emailResults;
        toast({
          title: 'Emails Sent Successfully! 📧',
          description: `Sent ${sent} emails${failed > 0 ? ` with ${failed} failures` : ''}`
        });
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      
      // Remove processing message and add error
      setMessages(prev => {
        const withoutProcessing = prev.filter(m => m.id !== processingMessage.id);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 3).toString(),
          type: 'assistant',
          content: `❌ **Error Processing Request**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease check the console for details and try again.`,
          timestamp: new Date()
        };
        
        return [...withoutProcessing, errorMessage];
      });
      
      toast({
        title: 'AI Assistant Error',
        description: error instanceof Error ? error.message : 'Failed to process your command',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAiResponse = (result: any): string => {
    // Handle confirmation requests
    if (result.awaitingConfirmation) {
      let confirmationText = `🤖 **Action Ready for Confirmation**\n\n`;
      confirmationText += `📋 **I understand:** ${result.summary}\n\n`;

      if (result.recipients?.length > 0) {
        const recipientNames = result.recipients.slice(0, 3).map((r: any) => r.name || r.fullName).join(', ');
        confirmationText += `👥 **Recipients:** ${result.recipients.length} students\n`;
        confirmationText += `📚 **Module:** ${result.recipients[0]?.module}\n`;
        confirmationText += `📝 **Students:** ${recipientNames}${result.recipients.length > 3 ? ` and ${result.recipients.length - 3} more` : ''}\n`;
      }

      if (result.subject) {
        confirmationText += `📧 **Subject:** ${result.subject}\n`;
      }

      confirmationText += `\n${result.confirmationMessage || result.message || 'Should I proceed with this action?'}\n\n`;
      confirmationText += `⚠️ **Please confirm before I execute this action.**`;

      return confirmationText;
    }

    // Handle fallback responses from service issues
    if (result.fallback) {
      if (result.understood && result.action === 'fallback_info') {
        return `⚠️ **DeepSeek AI Service Temporarily Unavailable**\n\n${result.summary}\n\n**Alternative Action:**\n${result.instructions}\n\n**Students Found:** ${result.recipients?.length || 0} HEM3923 students\n\n*The DeepSeek AI service will be back online shortly. You can use the manual features in the meantime.*`;
      } else {
        return `⚠️ **DeepSeek AI Service Temporarily Unavailable**\n\n${result.details}\n\n**You can still:**\n• Use the Students section to send bulk emails\n• Access individual student profiles\n• Use the manual email features\n• Try the AI assistant again in a few minutes\n\n*This is a temporary service issue and will be resolved soon.*`;
      }
    }

    if (!result.understood) {
      return `❌ **Command Not Understood**\n\nI didn't understand that command. ${result.summary || result.message || 'Please rephrase your request.'}\n\n**I can help you with:**\n• 📧 **Email Communications:** Send individual/bulk emails, reminders, announcements\n• 📊 **Data Analysis:** Student reports, performance analytics, progress tracking\n• 📝 **Assignment Management:** Create tasks, deadlines, group projects\n• 👥 **Student Management:** Group students, update information, track attendance\n• 📅 **Scheduling:** Class scheduling, practical sessions, field training\n• 🌐 **Multilingual Support:** English and Arabic communications\n\n**Smart Recognition Examples:**\n• "Send reminder to responder students" → HEM3923 students\n• "How many clinical students do we have?" → HEM2903 analytics\n• "Create assignment for ambulance 3 students" → HEM3903 task creation\n• "Group diploma students by performance" → AEM230 smart grouping\n\n**Try natural language like:**\n• "Email all students about tomorrow's exam"\n• "Show me attendance report for this week"\n• "Create study groups for struggling students"\n• "تذكير طلاب الوحدة بالامتحان" (Arabic)\n\nPlease try rephrasing your request!`;
    }

    if (result.action === 'error') {
      return `⚠️ **Error Processing Command**\n\n${result.summary || "I couldn't process that command. Please try again."}\n\n${result.details ? `**Details:** ${result.details}` : ''}`;
    }

    // Enhanced action-specific formatting
    const actionEmojis: { [key: string]: string } = {
      'send_email': '📧',
      'send_external_email': '📤',
      'send_reminder': '⏰',
      'get_info': '📊',
      'analyze_data': '📈',
      'generate_report': '📋',
      'create_assignment': '📝',
      'schedule_class': '📅',
      'manage_students': '👥',
      'create_group': '🔗',
      'track_progress': '📊'
    };

    const actionIcon = actionEmojis[result.action] || '🎯';
    const actionName = result.action.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

    let response = `✅ **${actionIcon} ${actionName} - Command Processed**\n\n`;
    response += `📋 **Summary:** ${result.summary}\n`;

    if (result.language) {
      response += `🌐 **Language:** ${result.language === 'en' ? 'English' : result.language === 'ar' ? 'Arabic' : 'Mixed'}\n`;
    }

    if (result.filters_applied?.length > 0) {
      response += `🔍 **Filters Applied:** ${result.filters_applied.join(', ')}\n`;
    }

    if (result.affectedCount !== undefined) {
      response += `👥 **Affected Students:** ${result.affectedCount}\n`;
    }

    // Handle contextual data for information requests
    if (result.contextData) {
      response += `\n📊 **System Overview:**\n`;
      response += `• Total Students: ${result.contextData.totalStudents}\n`;
      if (result.contextData.moduleBreakdown) {
        response += `• Module Distribution:\n`;
        Object.entries(result.contextData.moduleBreakdown).forEach(([module, count]) => {
          response += `  - ${module}: ${count} students\n`;
        });
      }
    }

    if (result.recipients?.length > 0) {
      const recipientNames = result.recipients.slice(0, 5).map((r: any) => r.name || r.fullName).join(', ');

      // Determine if these are students or external recipients
      const isExternal = result.action === 'send_external_email' ||
                        result.recipient_type === 'external' ||
                        result.recipients.some((r: any) => r.module === 'external');

      if (isExternal) {
        response += `📤 **External Recipients:** ${recipientNames}${result.recipients.length > 5 ? ` and ${result.recipients.length - 5} more` : ''}\n`;

        // Show email addresses for external recipients
        const emails = result.recipients.slice(0, 3).map((r: any) => r.email).filter(Boolean);
        if (emails.length > 0) {
          response += `📧 **Email Addresses:** ${emails.join(', ')}${result.recipients.length > 3 ? '...' : ''}\n`;
        }
      } else {
        response += `👥 **Students Involved:** ${recipientNames}${result.recipients.length > 5 ? ` and ${result.recipients.length - 5} more` : ''}\n`;

        // Show module breakdown for student recipients
        if (result.recipients.length > 1) {
          const moduleCount: { [key: string]: number } = {};
          result.recipients.forEach((r: any) => {
            const module = r.module || 'Unknown';
            moduleCount[module] = (moduleCount[module] || 0) + 1;
          });
          response += `📚 **Module Breakdown:** ${Object.entries(moduleCount).map(([mod, count]) => `${mod}(${count})`).join(', ')}\n`;
        }
      }
    }

    // Action-specific content
    if (result.action === 'get_info' || result.action === 'analyze_data') {
      response += `\n📈 **Analysis Results:**\n${result.message || result.details || 'Data analysis completed.'}\n`;
    }

    if (result.action === 'create_assignment') {
      response += `\n📝 **Assignment Details:**\n`;
      response += `${result.message || result.details || 'Assignment framework created.'}\n`;
      if (result.taskDetails) {
        response += `\n**Task Specifications:**\n${result.taskDetails}\n`;
      }
    }

    if (result.action === 'schedule_class') {
      response += `\n📅 **Scheduling Information:**\n`;
      response += `${result.message || result.details || 'Class scheduling parameters prepared.'}\n`;
    }

    if (result.action === 'create_group') {
      response += `\n🔗 **Group Formation:**\n`;
      response += `${result.message || result.details || 'Student grouping criteria established.'}\n`;
    }

    if (result.action === 'track_progress') {
      response += `\n📊 **Progress Tracking:**\n`;
      response += `${result.message || result.details || 'Progress monitoring setup completed.'}\n`;
    }

    if (result.taskDetails) {
      response += `\n📋 **Additional Details:**\n${result.taskDetails}\n`;
    }

    if (result.executionSteps?.length > 0) {
      response += `\n⚡ **Next Steps:**\n`;
      result.executionSteps.forEach((step: string, index: number) => {
        response += `${index + 1}. ${step}\n`;
      });
    }

    if (result.subject && result.message) {
      response += `\n📬 **Email Preview:**\n`;
      response += `**Subject:** ${result.subject}\n`;
      response += `**Message:** ${result.message.substring(0, 150)}${result.message.length > 150 ? '...' : ''}\n`;
    }

    if (result.confirmationRequired || result.requiresConfirmation) {
      const affectedCount = result.affectedCount || result.recipients?.length || 0;
      response += `\n⚠️ **Confirmation Required:** This ${result.action.replace('_', ' ')} action will affect ${affectedCount} student(s). Please confirm to proceed.\n`;
    }

    if (result.actionType === 'management') {
      response += `\n🔧 **Management Action:** This request requires manual execution through the appropriate system section.\n`;
      response += `**Recommended Steps:**\n`;
      switch (result.action) {
        case 'create_assignment':
          response += `• Navigate to the Classes section\n• Create new assignment with the specified details\n• Assign to the identified students\n`;
          break;
        case 'schedule_class':
          response += `• Go to the Timetables section\n• Add new class session\n• Configure timing and location\n`;
          break;
        case 'manage_students':
          response += `• Access the Students section\n• Use bulk edit features\n• Apply the requested changes\n`;
          break;
        case 'create_group':
          response += `• Use the Students section\n• Apply filters as suggested\n• Create custom groups\n`;
          break;
        default:
          response += `• Use the relevant system section to implement these changes\n`;
      }
    }

    if ((result.action === 'send_email' || result.action === 'send_external_email' || result.action === 'send_reminder') && result.emailResults) {
      const { sent, failed, errors } = result.emailResults;
      const isExternal = result.action === 'send_external_email' || result.recipient_type === 'external';

      response += `\n🎉 **Email Delivery Results:**\n`;
      response += `✅ Successfully sent: ${sent} ${isExternal ? 'external ' : ''}emails\n`;
      if (failed > 0) {
        response += `❌ Failed: ${failed} emails\n`;
        if (errors?.length > 0) {
          response += `**Errors:** ${errors.map((e: any) => e.error).join(', ')}\n`;
        }
      }
      response += `📈 **Success Rate:** ${Math.round((sent / (sent + failed)) * 100)}%\n`;

      if (isExternal && sent > 0) {
        response += `📤 **Note:** External email sent successfully to staff/faculty member.\n`;
      }
    }

    return response;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const exampleCommands = [
    "Email all AEM230 students about tomorrow's practical at 10AM",
    "Send Arabic reminder to clinical students about exam",
    "Generate a progress report for students in HEM2903",
    "تذكير طلاب الوحدة بالامتحان النهائي يوم الخميس"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl h-[70vh] sm:h-[65vh] max-h-[500px] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-border/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">DeepSeek AI Assistant</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Bilingual Email Helper</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <Badge variant="outline" className="text-xs bg-white/50 dark:bg-black/20">
                <Globe className="w-3 h-3 mr-1" />
                EN/AR
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-background min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 sm:gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : message.type === 'system'
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300'
                }`}>
                  {message.type === 'user' ? (
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : message.type === 'system' ? (
                    <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </div>

                <div className={`flex-1 max-w-[85%] sm:max-w-md ${
                  message.type === 'user' ? 'text-right' : ''
                }`}>
                  <Card className={`shadow-sm border-0 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-border/50'
                  }`}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {message.result?.recipients?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Users className="w-3 h-3" />
                            {message.result.recipients.length} recipients
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.result.recipients.slice(0, 3).map((recipient: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {recipient.name}
                              </Badge>
                            ))}
                            {message.result.recipients.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{message.result.recipients.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {message.result?.emailResults && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">
                              {message.result.emailResults.sent} emails sent
                            </span>
                            {message.result.emailResults.failed > 0 && (
                              <>
                                <AlertCircle className="w-3 h-3 text-orange-600" />
                                <span className="text-orange-600">
                                  {message.result.emailResults.failed} failed
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Confirmation Buttons */}
                  {message.result?.awaitingConfirmation && pendingAction && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={handleConfirmAction}
                        disabled={isProcessing}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isProcessing ? (
                          <Loader className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Yes, Proceed
                      </Button>
                      <Button
                        onClick={() => setPendingAction(null)}
                        disabled={isProcessing}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Examples */}
          {messages.length <= 1 && (
            <div className="mx-3 sm:mx-4 mb-2 sm:mb-3 p-2 sm:p-3 bg-white dark:bg-gray-800 border border-border/50 rounded-lg shadow-sm">
              <h4 className="font-semibold text-xs text-foreground mb-2 flex items-center gap-2">
                <span className="text-blue-500">💡</span>
                Try these examples:
              </h4>
              <div className="grid gap-1">
                {exampleCommands.map((cmd, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-left h-auto p-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors"
                    onClick={() => setInput(cmd)}
                  >
                    <span className="text-muted-foreground mr-2">→</span>
                    {cmd}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border/50 bg-white dark:bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex gap-2 sm:gap-3 p-4 sm:p-5">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your command in English or Arabic... (Ctrl+Enter to send) | اكتب أمرك باللغة العربية أو الإنجليزية... (Ctrl+Enter للإرسال)"
                disabled={isProcessing}
                rows={3}
                className="flex-1 min-h-[80px] max-h-[120px] text-sm sm:text-base bg-background border border-border/50 focus:border-blue-500 focus:ring-blue-500/20 resize-none rounded-md px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-h-[44px] min-w-[44px] px-3 sm:px-4"
              >
                {isProcessing ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
