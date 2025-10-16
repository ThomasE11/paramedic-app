'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { aiMemoryManager } from '@/lib/ai-memory';
import { useSession } from 'next-auth/react';
import {
  Bot,
  Send,
  Loader2,
  User,
  GraduationCap,
  MessageSquare,
  Plus,
  Download,
  Copy,
  Settings,
  Brain,
  Stethoscope,
  BookOpen,
  Lightbulb,
  ClipboardList,
  RefreshCw,
  Trash2,
  Clock,
  Zap,
  ToggleLeft,
  ToggleRight,
  Paperclip,
  X,
  FileText,
  Mail
} from 'lucide-react';

interface EnhancedEducationalAIProps {
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
    attendanceRate?: number;
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  response?: any;
  isError?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
  mode: string;
  context?: any;
}

const CONTENT_MODES = [
  { value: 'case_study', label: 'Medical Case Study', icon: Stethoscope, description: 'Create realistic patient scenarios' },
  { value: 'brainstorm', label: 'Brainstorming Session', icon: Lightbulb, description: 'Interactive case refinement' },
  { value: 'educational_content', label: 'Educational Material', icon: BookOpen, description: 'Lesson plans and assignments' },
  { value: 'assessment', label: 'Assessment Tools', icon: ClipboardList, description: 'Tests and evaluation rubrics' }
];

const ACTION_EXAMPLES = [
  "Student H00123456 is falling behind - add note and set attendance to 75%",
  "Create a new assignment for AEM230 module due next Friday",
  "Send email to all HEM2903 students about upcoming exam",
  "Create a rubric from the uploaded PDF file for HEM3923",
  "Grade this student submission using the uploaded rubric",
  "Create an assignment from the uploaded rubric file with due date next week",
  "Generate attendance report for this month",
  "Add new student: John Smith, j.smith@hct.ac.ae, AEM230",
  "Schedule practical class for HEM3903 tomorrow at 10 AM",
  "Mark all students present for today's HEM2903 class",
  "Update Ahmed's phone number to +971501234567"
];

const SPECIALTIES = [
  'Respiratory Emergencies',
  'Cardiac Emergencies', 
  'Trauma Assessment',
  'Neurological Emergencies',
  'Pediatric Emergencies',
  'Pharmacology',
  'Medical Emergencies',
  'Psychiatric Emergencies'
];

export function EnhancedEducationalAI({ isOpen, onClose, moduleContext, studentContext }: EnhancedEducationalAIProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMode, setSelectedMode] = useState('case_study');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [actionMode, setActionMode] = useState(false);
  const [isLoadingMemory, setIsLoadingMemory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  useEffect(() => {
    // Load conversations from localStorage
    const saved = localStorage.getItem('educational-ai-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          lastUpdated: new Date(c.lastUpdated),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        })));
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    }

    // Load user memory and preferences
    loadUserMemory();
  }, []);

  const loadUserMemory = async () => {
    if (!session?.user?.email) return;

    setIsLoadingMemory(true);
    try {
      const memory = await aiMemoryManager.loadUserMemory(session.user.email);

      // Apply user preferences
      setSelectedMode(memory.preferences.preferredMode);
      setDifficulty(memory.preferences.preferredDifficulty);
      if (memory.preferences.favoriteSpecialties.length > 0) {
        setSelectedSpecialty(memory.preferences.favoriteSpecialties[0]);
      }

      // Get personalized suggestions
      const personalizedSuggestions = await aiMemoryManager.getPersonalizedSuggestions(
        session.user.email,
        moduleContext
      );
      setSuggestions(personalizedSuggestions);

    } catch (error) {
      console.error('Failed to load user memory:', error);
    } finally {
      setIsLoadingMemory(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF or Word documents only.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (60MB)
      if (file.size > 60 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 60MB.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', actionMode ? 'submission' : 'rubric');
      formData.append('assignmentId', 'temp-assignment-' + Date.now());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadedFileInfo(result.file);

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been processed and is ready for analysis.`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFileUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Save conversations to localStorage
    if (conversations.length > 0) {
      localStorage.setItem('educational-ai-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `New ${CONTENT_MODES.find(m => m.value === selectedMode)?.label || 'Conversation'}`,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      mode: selectedMode,
      context: { moduleContext, studentContext, specialty: selectedSpecialty, difficulty }
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    let conversation = currentConversation;
    if (!conversation) {
      createNewConversation();
      conversation = conversations[0];
    }

    let messageContent = input.trim();
    if (uploadedFileInfo) {
      messageContent += `\n\n📎 **Attached File:** ${uploadedFileInfo.fileName}\n**Type:** ${uploadedFileInfo.type === 'rubric' ? 'Rubric Document' : 'Student Submission'}\n**Analysis:** ${uploadedFileInfo.analysis?.readyForAI ? 'Ready for processing' : 'Basic document'}`;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    // Add user message
    setConversations(prev => prev.map(c => 
      c.id === (currentConversationId || conversations[0]?.id) 
        ? { ...c, messages: [...c.messages, userMessage], lastUpdated: new Date() }
        : c
    ));

    const currentInput = input;
    setInput('');
    setIsProcessing(true);

    // Track request in memory
    if (session?.user?.email) {
      await aiMemoryManager.trackRequest(
        session.user.email,
        currentInput,
        selectedMode,
        selectedSpecialty
      );
    }

    try {
      const response = await fetch('/api/ai-assistant/educational', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: currentInput,
          mode: selectedMode,
          moduleContext,
          studentContext,
          specialty: selectedSpecialty,
          difficulty,
          conversationHistory: currentConversation?.messages || [],
          userId: session?.user?.email,
          conversationId: currentConversationId,
          actionMode,
          fileInfo: uploadedFileInfo,
          preferences: {
            includeVitalSigns: true,
            includeProgression: true,
            includeAssessment: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const aiResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: formatAIResponse(aiResponse),
        timestamp: new Date(),
        response: aiResponse
      };

      // Add AI response
      setConversations(prev => prev.map(c => 
        c.id === (currentConversationId || conversations[0]?.id)
          ? { 
              ...c, 
              messages: [...c.messages, assistantMessage], 
              lastUpdated: new Date(),
              title: c.messages.length === 0 ? generateConversationTitle(currentInput) : c.title
            }
          : c
      ));

      toast({
        title: 'Success',
        description: 'AI response generated successfully',
      });

    } catch (error) {
      console.error('AI Assistant error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `❌ **Error Processing Request**\n\n${error instanceof Error ? error.message : 'AI Service temporarily unavailable'}\n\nPlease try again in a few minutes.`,
        timestamp: new Date(),
        isError: true
      };

      setConversations(prev => prev.map(c => 
        c.id === (currentConversationId || conversations[0]?.id)
          ? { ...c, messages: [...c.messages, errorMessage], lastUpdated: new Date() }
          : c
      ));

      toast({
        title: 'AI Assistant Error',
        description: error instanceof Error ? error.message : 'Failed to process your request',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      // Clear file after sending
      if (uploadedFileInfo) {
        removeFile();
      }
    }
  };

  const formatAIResponse = (response: any): string => {
    console.log('Formatting AI response:', response);

    // Handle error responses
    if (response.error) {
      return `❌ **Error**: ${response.error}`;
    }

    if (!response.understood) {
      return `❌ **Request Not Understood**: ${response.error || 'Please try rephrasing your request.'}`;
    }

    // Handle missing or malformed content (unless in Action Mode)
    if (!response.content && !response.actions) {
      console.error('No content or actions in response:', response);
      return `❌ **Response Error**: The AI response is missing content. Please try again.`;
    }

    // Handle action mode responses
    if (response.actions && response.executionResults) {
      let formatted = `## ✅ Actions Executed\n\n`;
      formatted += `${response.confirmation}\n\n`;

      response.executionResults.forEach((result: any, index: number) => {
        const action = response.actions[index];
        if (result.success) {
          formatted += `✅ **${action.description}**\n`;

          // Special handling for email actions
          if (action.type === 'SEND_EMAIL' && result.data?.emails) {
            const emails = result.data.emails;
            formatted += `\n📧 **${emails.length} Personalized Emails Generated**\n\n`;
            formatted += `**Preview** (${result.data.preview?.firstName}):\n`;
            formatted += `Subject: ${result.data.preview?.subject}\n`;
            formatted += `\`\`\`\n${result.data.preview?.body}\n\`\`\`\n\n`;
            formatted += `**Ready to Send**: Click individual mailto links below or use your email client.\n\n`;
          } else if (action.type === 'SEND_EMAIL_NOW' && result.data) {
            formatted += `\n📨 **Email Sending Complete**\n\n`;
            formatted += `✅ Successfully sent: ${result.data.sent}/${result.data.total}\n`;
            if (result.data.failed > 0) {
              formatted += `❌ Failed: ${result.data.failed}\n`;
              if (result.data.errors && result.data.errors.length > 0) {
                formatted += `\n**Errors**:\n`;
                result.data.errors.forEach((err: any) => {
                  formatted += `- ${err.email}: ${err.error}\n`;
                });
              }
            }
            formatted += `\n${result.data.message}\n\n`;
            formatted += `ℹ️ Emails were sent with 30-second delays to avoid spam filters.\n`;
          } else if (result.data) {
            formatted += `\nResult: ${JSON.stringify(result.data, null, 2)}\n`;
          }
          formatted += '\n';
        } else {
          formatted += `❌ **Failed**: ${action.description}\n`;
          formatted += `Error: ${result.error}\n\n`;
        }
      });

      if (response.warnings && response.warnings.length > 0) {
        formatted += `\n⚠️ **Warnings**:\n${response.warnings.map((w: string) => `• ${w}`).join('\n')}\n`;
      }

      if (response.follow_up) {
        formatted += `\n💡 **Next Steps**: ${response.follow_up}\n`;
      }

      return formatted;
    }

    const content = response.content;

    // Handle missing title
    if (!content.title) {
      console.error('No title in content:', content);
      return `❌ **Format Error**: The AI response is missing a title. Please try again.`;
    }

    let formatted = `# ${content.title}\n\n`;

    if (content.description) {
      formatted += `${content.description}\n\n`;
    }

    if (content.learningObjectives?.length > 0) {
      formatted += `## Learning Objectives\n${content.learningObjectives.map((obj: string) => `• ${obj}`).join('\n')}\n\n`;
    }

    if (content.scenario) {
      const scenario = content.scenario;
      formatted += `## Patient Information\n`;
      formatted += `**Name**: ${scenario.patientInfo.name}\n`;
      formatted += `**Age**: ${scenario.patientInfo.age}\n`;
      formatted += `**Gender**: ${scenario.patientInfo.gender}\n`;
      
      if (scenario.patientInfo.medicalHistory?.length > 0) {
        formatted += `**Medical History**: ${scenario.patientInfo.medicalHistory.join(', ')}\n\n`;
      }

      if (scenario.presentation) {
        formatted += `## Presentation\n`;
        formatted += `**Chief Complaint**: ${scenario.presentation.chiefComplaint}\n\n`;
        
        if (scenario.presentation.symptoms?.length > 0) {
          formatted += `**Symptoms**:\n${scenario.presentation.symptoms.map((s: string) => `• ${s}`).join('\n')}\n\n`;
        }

        if (scenario.presentation.vitalSigns) {
          const vitals = scenario.presentation.vitalSigns;
          formatted += `**Vital Signs**:\n`;
          formatted += `• Blood Pressure: ${vitals.bloodPressure}\n`;
          formatted += `• Heart Rate: ${vitals.heartRate}\n`;
          formatted += `• Respiratory Rate: ${vitals.respiratoryRate}\n`;
          formatted += `• Oxygen Saturation: ${vitals.oxygenSaturation}\n`;
          formatted += `• Temperature: ${vitals.temperature}\n`;
          if (vitals.bloodGlucose) formatted += `• Blood Glucose: ${vitals.bloodGlucose}\n`;
          formatted += '\n';
        }

        if (scenario.presentation.physicalFindings?.length > 0) {
          formatted += `**Physical Findings**:\n${scenario.presentation.physicalFindings.map((f: string) => `• ${f}`).join('\n')}\n\n`;
        }
      }

      if (scenario.expectedActions?.length > 0) {
        formatted += `## Expected Actions\n${scenario.expectedActions.map((a: string) => `• ${a}`).join('\n')}\n\n`;
      }

      if (scenario.learningPoints?.length > 0) {
        formatted += `## Key Learning Points\n${scenario.learningPoints.map((p: string) => `• ${p}`).join('\n')}\n\n`;
      }
    }

    // Handle brainstorming options
    if (response.brainstormingOptions) {
      const options = response.brainstormingOptions;
      if (options.refinements?.length > 0) {
        formatted += `## Refinement Options\n${options.refinements.map((r: string) => `• ${r}`).join('\n')}\n\n`;
      }
      if (options.variations?.length > 0) {
        formatted += `## Variations\n${options.variations.map((v: string) => `• ${v}`).join('\n')}\n\n`;
      }
    }

    // Handle multiple cases (for requests like "create six cases")
    if (response.multipleCases && Array.isArray(response.multipleCases)) {
      formatted += `## Multiple Cases Generated\n\n`;
      response.multipleCases.forEach((caseItem: any, index: number) => {
        formatted += `### Case ${index + 1}: ${caseItem.title || `Case ${index + 1}`}\n`;
        if (caseItem.description) {
          formatted += `${caseItem.description}\n\n`;
        }
        // Add basic case info if available
        if (caseItem.scenario?.patientInfo) {
          const patient = caseItem.scenario.patientInfo;
          formatted += `**Patient**: ${patient.name || 'Unknown'}, ${patient.age || 'Unknown age'}, ${patient.gender || 'Unknown gender'}\n`;
          if (caseItem.scenario.presentation?.chiefComplaint) {
            formatted += `**Chief Complaint**: ${caseItem.scenario.presentation.chiefComplaint}\n`;
          }
          // Add vital signs if available
          if (caseItem.scenario.presentation?.vitalSigns) {
            const vitals = caseItem.scenario.presentation.vitalSigns;
            formatted += `**Vital Signs**: BP: ${vitals.bloodPressure}, HR: ${vitals.heartRate}, RR: ${vitals.respiratoryRate}, SpO2: ${vitals.oxygenSaturation}\n`;
          }
        }
        formatted += '\n---\n\n';
      });
    }

    // Handle email content
    if (response.emailContent) {
      const email = response.emailContent;
      formatted += `## 📧 Email Draft\n\n`;
      formatted += `**Subject**: ${email.subject}\n\n`;
      formatted += `**Recipients**: ${email.recipients ? email.recipients.join(', ') : 'Module students'}\n\n`;
      formatted += `**Message**:\n\n${email.body}\n\n`;

      // Add send email button functionality here if needed
      formatted += `*Note: Review the email content above and use the email system to send to students.*\n\n`;
    }

    // Fallback for any other content
    if (formatted === `# ${content.title}\n\n` && content.description) {
      // If we only have title, add any additional content we can find
      if (typeof content === 'string') {
        formatted += content;
      } else if (content.text) {
        formatted += content.text;
      } else if (content.message) {
        formatted += content.message;
      } else {
        // Last resort: stringify the content
        formatted += '```json\n' + JSON.stringify(content, null, 2) + '\n```';
      }
    }

    return formatted || `# Response Received\n\nThe AI provided a response, but it couldn't be formatted properly. Please try rephrasing your request.`;
  };

  const generateConversationTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 6).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard',
    });
  };

  const exportConversation = () => {
    if (!currentConversation) return;
    
    const content = currentConversation.messages
      .filter(m => m.type !== 'system')
      .map(m => `**${m.type === 'user' ? 'You' : 'AI Assistant'}** (${m.timestamp.toLocaleString()})\n\n${m.content}\n\n---\n\n`)
      .join('');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConversation.title.replace(/\s+/g, '_')}.md`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Enhanced Educational AI</h2>
                <p className="text-sm text-muted-foreground">Advanced case study generator & educational assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {moduleContext && (
                <Badge variant="outline" className="bg-blue-50">
                  {moduleContext.code}
                </Badge>
              )}
              {studentContext && (
                <Badge variant="outline" className="bg-green-50">
                  {studentContext.name}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Conversations */}
          <div className="w-80 border-r bg-gray-50/50 dark:bg-gray-900/50 flex flex-col">
            {/* Controls */}
            <div className="p-4 border-b space-y-3">
              <Button
                onClick={createNewConversation}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                New Conversation
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_MODES.map(mode => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div className="flex items-center gap-2">
                          <mode.icon className="w-3 h-3" />
                          <span className="text-xs">{mode.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select specialty..." />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Action Mode</p>
                    <p className="text-xs text-muted-foreground">
                      {actionMode ? 'CLAUDIA can perform system actions' : 'Educational content generation only'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActionMode(!actionMode)}
                  variant="ghost"
                  size="sm"
                  className={`p-1 h-8 w-12 rounded-full transition-all ${
                    actionMode
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                  }`}
                >
                  {actionMode ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Action Mode Examples */}
              {actionMode && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Example Commands:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {ACTION_EXAMPLES.slice(0, 4).map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(example)}
                        className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                      >
                        {example.length > 50 ? example.substring(0, 50) + '...' : example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Start a new conversation to begin</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map(conversation => (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        currentConversationId === conversation.id
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/50'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setCurrentConversationId(conversation.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{conversation.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {CONTENT_MODES.find(m => m.value === conversation.mode)?.label}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {conversation.messages.length} messages
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {conversation.lastUpdated.toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conversation.id);
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-white dark:bg-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{currentConversation.title}</h3>
                    <p className="text-sm text-gray-500">
                      {currentConversation.messages.length} messages •
                      Last updated {currentConversation.lastUpdated.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={exportConversation}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteConversation(currentConversation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-900/30 dark:to-background">
                  {currentConversation.messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Start Your Educational Session</h3>
                      <p className="text-sm mb-4">Ask me to create case studies, brainstorm scenarios, or generate educational content.</p>
                      <div className="text-left max-w-md mx-auto space-y-2">
                        <p className="text-xs font-medium text-gray-600">Example requests:</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>• "Create 6 complex respiratory cases for HEM 3923 including ARDS, ALS complications, and Guillain-Barré syndrome"</p>
                          <p>• "Generate a cardiac emergency scenario with realistic vital signs"</p>
                          <p>• "Brainstorm trauma assessment practice stations"</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    currentConversation.messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.type === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          message.type === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            : message.isError
                            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                            : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>

                        <div className={`flex-1 max-w-[85%] ${
                          message.type === 'user' ? 'text-right' : ''
                        }`}>
                          <Card className={`shadow-sm ${
                            message.type === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0'
                              : message.isError
                              ? 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800'
                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                          }`}>
                            <CardContent className="p-4">
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {message.content}
                              </div>

                              {/* Email Action Buttons */}
                              {message.response?.executionResults?.find((r: any) => r.type === 'SEND_EMAIL' && r.data?.emails) && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200">
                                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Individual Email Links
                                  </h4>
                                  <div className="max-h-60 overflow-y-auto space-y-2">
                                    {message.response.executionResults
                                      .find((r: any) => r.type === 'SEND_EMAIL')
                                      ?.data?.emails?.map((email: any, idx: number) => (
                                        <a
                                          key={idx}
                                          href={`mailto:${email.email}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`}
                                          className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 hover:border-blue-400 transition-colors group"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate text-blue-900 dark:text-blue-100">
                                              {email.firstName} ({email.studentId})
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                              {email.email}
                                            </div>
                                          </div>
                                          <Mail className="w-4 h-4 text-blue-600 group-hover:text-blue-800 flex-shrink-0 ml-2" />
                                        </a>
                                      ))}
                                  </div>
                                  <div className="mt-3 text-xs text-blue-700 dark:text-blue-300">
                                    💡 Click any link to open in your default email client
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                                <div className="flex items-center gap-2 text-xs opacity-70">
                                  <Clock className="w-3 h-3" />
                                  {message.timestamp.toLocaleTimeString()}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyMessage(message.content)}
                                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-white dark:bg-gray-800">
                  {/* File Upload Area */}
                  {actionMode && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Attach Documents
                          </span>
                        </div>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          size="sm"
                          disabled={fileUploading}
                          className="text-blue-600 border-blue-300 hover:bg-blue-100"
                        >
                          {fileUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {uploadedFileInfo && (
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">{uploadedFileInfo.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {uploadedFileInfo.type === 'rubric' ? 'Rubric Document' : 'Student Submission'} •
                                {Math.round(uploadedFileInfo.fileSize / 1024)}KB
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={removeFile}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        Upload rubrics for automatic assignment creation or student submissions for grading. PDF and Word documents supported.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Ask me to create educational content for ${moduleContext?.code || 'EMS'} students...

Examples:
• "Create 6 complex respiratory cases for HEM 3923 including ARDS, ALS complications, and Guillain-Barré syndrome"
• "Generate a cardiac emergency scenario with realistic vital signs"
• "Brainstorm trauma assessment practice stations"`}
                      className="flex-1 min-h-[80px] resize-none"
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isProcessing || !input.trim()}
                      className="self-end"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Mode: {CONTENT_MODES.find(m => m.value === selectedMode)?.label}</span>
                      <span>Difficulty: {difficulty}</span>
                      {selectedSpecialty && <span>Specialty: {selectedSpecialty}</span>}
                    </div>
                    <span>Press Enter to send, Shift+Enter for new line</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose an existing conversation or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
