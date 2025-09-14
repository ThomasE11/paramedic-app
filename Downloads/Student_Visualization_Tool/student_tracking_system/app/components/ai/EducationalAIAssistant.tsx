'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Bot,
  Send,
  Loader2,
  User,
  GraduationCap,
  Stethoscope,
  BookOpen,
  Lightbulb,
  ClipboardList,
  Heart,
  Brain,
  Zap,
  MessageSquare,
  RefreshCw,
  Download,
  Copy,
  CheckCircle,
  Sparkles,
  Target
} from 'lucide-react';

interface EducationalAIAssistantProps {
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

interface AIResponse {
  understood: boolean;
  mode: string;
  content: {
    title: string;
    description: string;
    learningObjectives: string[];
    targetModule: string;
    difficulty: string;
    scenario?: {
      patientInfo: {
        age: number;
        gender: string;
        name: string;
        medicalHistory: string[];
      };
      presentation: {
        chiefComplaint: string;
        symptoms: string[];
        vitalSigns: {
          bloodPressure: string;
          heartRate: string;
          respiratoryRate: string;
          oxygenSaturation: string;
          temperature: string;
          bloodGlucose?: string;
        };
        physicalFindings: string[];
      };
      progression: string[];
      expectedActions: string[];
      learningPoints: string[];
    };
  };
  brainstormingOptions?: {
    refinements: string[];
    variations: string[];
    difficultyAdjustments: string[];
  };
  nextSteps: string[];
  educationalNotes: string;
  assessmentIdeas: string[];
}

const CONTENT_MODES = [
  { value: 'case_study', label: 'Medical Case Study', icon: Stethoscope, description: 'Create realistic patient scenarios' },
  { value: 'brainstorm', label: 'Brainstorming Session', icon: Lightbulb, description: 'Interactive case refinement' },
  { value: 'educational_content', label: 'Educational Material', icon: BookOpen, description: 'Lesson plans and assignments' },
  { value: 'assessment', label: 'Assessment Tools', icon: ClipboardList, description: 'Tests and evaluation rubrics' }
];

const MEDICAL_SPECIALTIES = [
  { value: 'cardiovascular', label: 'Cardiovascular', icon: Heart },
  { value: 'respiratory', label: 'Respiratory', icon: Zap },
  { value: 'neurological', label: 'Neurological', icon: Brain },
  { value: 'trauma', label: 'Trauma & Injury', icon: ClipboardList },
  { value: 'medical', label: 'General Medical', icon: Stethoscope },
  { value: 'psychiatric', label: 'Psychiatric', icon: User }
];

export function EducationalAIAssistant({ isOpen, onClose, moduleContext, studentContext }: EducationalAIAssistantProps) {
  const [command, setCommand] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('case_study');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('intermediate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    response?: AIResponse;
    timestamp: Date;
  }>>([]);
  const [brainstormingSession, setBrainstormingSession] = useState<any[]>([]);
  const { toast } = useToast();

  const sendToEducationalAI = async (message: string, mode: string = selectedMode) => {
    if (!message.trim()) return;

    setIsProcessing(true);
    setConversationHistory(prev => [...prev, {
      type: 'user',
      content: message,
      timestamp: new Date()
    }]);

    try {
      const requestBody = {
        command: message,
        mode,
        moduleContext,
        studentContext,
        brainstormingSession,
        specialty: selectedSpecialty,
        difficulty,
        preferences: {
          includeVitalSigns: true,
          includeProgression: true,
          includeAssessment: true
        }
      };

      const response = await fetch('/api/ai-assistant/educational', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const aiResponse: AIResponse = await response.json();

      if (aiResponse.understood) {
        setCurrentResponse(aiResponse);
        setConversationHistory(prev => [...prev, {
          type: 'ai',
          content: aiResponse.content.description || 'Content generated successfully',
          response: aiResponse,
          timestamp: new Date()
        }]);

        // Add to brainstorming session if in brainstorm mode
        if (mode === 'brainstorm') {
          setBrainstormingSession(prev => [...prev, aiResponse]);
        }

        toast({
          title: 'Success',
          description: `${aiResponse.content.title} generated successfully`,
        });
      } else {
        throw new Error(aiResponse.error || 'AI did not understand the request');
      }

    } catch (error) {
      console.error('Educational AI error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate educational content',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      sendToEducationalAI(command);
      setCommand('');
    }
  };

  const generateSuggestion = (suggestion: string) => {
    setCommand(suggestion);
  };

  const refineCaseStudy = (refinement: string) => {
    sendToEducationalAI(`Refine the previous case study: ${refinement}`, 'brainstorm');
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Content copied to clipboard',
    });
  };

  const exportCaseStudy = () => {
    if (!currentResponse) return;

    const content = generateExportContent(currentResponse);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentResponse.content.title.replace(/\s+/g, '_')}.md`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateExportContent = (response: AIResponse): string => {
    return `# ${response.content.title}

## Overview
${response.content.description}

## Learning Objectives
${response.content.learningObjectives.map(obj => `- ${obj}`).join('\n')}

## Target Module
${response.content.targetModule} (${response.content.difficulty} difficulty)

${response.content.scenario ? `
## Patient Scenario

### Patient Information
- **Age**: ${response.content.scenario.patientInfo.age} years old
- **Gender**: ${response.content.scenario.patientInfo.gender}
- **Name**: ${response.content.scenario.patientInfo.name}
- **Medical History**: ${response.content.scenario.patientInfo.medicalHistory.join(', ')}

### Presentation
- **Chief Complaint**: ${response.content.scenario.presentation.chiefComplaint}
- **Symptoms**: ${response.content.scenario.presentation.symptoms.join(', ')}

### Vital Signs
- **Blood Pressure**: ${response.content.scenario.presentation.vitalSigns.bloodPressure}
- **Heart Rate**: ${response.content.scenario.presentation.vitalSigns.heartRate}
- **Respiratory Rate**: ${response.content.scenario.presentation.vitalSigns.respiratoryRate}
- **Oxygen Saturation**: ${response.content.scenario.presentation.vitalSigns.oxygenSaturation}
- **Temperature**: ${response.content.scenario.presentation.vitalSigns.temperature}
${response.content.scenario.presentation.vitalSigns.bloodGlucose ? `- **Blood Glucose**: ${response.content.scenario.presentation.vitalSigns.bloodGlucose}` : ''}

### Physical Findings
${response.content.scenario.presentation.physicalFindings.map(finding => `- ${finding}`).join('\n')}

### Expected Progression
${response.content.scenario.progression.map((stage, idx) => `${idx + 1}. ${stage}`).join('\n')}

### Expected Student Actions
${response.content.scenario.expectedActions.map(action => `- ${action}`).join('\n')}

### Key Learning Points
${response.content.scenario.learningPoints.map(point => `- ${point}`).join('\n')}
` : ''}

## Educational Notes
${response.educationalNotes}

## Assessment Ideas
${response.assessmentIdeas.map(idea => `- ${idea}`).join('\n')}

---
*Generated by HCT Al Ain EMS Educational AI Assistant*
*Date: ${new Date().toLocaleString()}*
`;
  };

  const getSuggestions = () => {
    const baseModule = moduleContext?.code || studentContext?.module?.code || 'EMS';
    const suggestions = [
      `Create a cardiac emergency case study for ${baseModule} students`,
      `Generate a respiratory distress scenario with realistic vital signs`,
      `Design a trauma assessment exercise for advanced students`,
      `Create a neurological emergency case with progressive symptoms`,
      `Generate multiple choice questions about ${baseModule} protocols`,
      `Brainstorm ideas for hands-on skill stations`,
      `Create a patient assessment checklist for ${baseModule}`,
      `Generate a case study about diabetic emergencies`,
    ];

    return suggestions;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Educational AI Assistant
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
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Control Panel */}
          <div className="space-y-4 overflow-y-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Content Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {CONTENT_MODES.map(mode => {
                  const Icon = mode.icon;
                  return (
                    <Button
                      key={mode.value}
                      variant={selectedMode === mode.value ? 'default' : 'outline'}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setSelectedMode(mode.value)}
                    >
                      <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{mode.label}</div>
                        <div className="text-xs opacity-70">{mode.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Medical Specialty</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Specialties</SelectItem>
                    {MEDICAL_SPECIALTIES.map(specialty => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Difficulty Level</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Quick Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Quick Ideas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getSuggestions().slice(0, 4).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => generateSuggestion(suggestion)}
                    className="w-full text-left justify-start text-xs h-auto p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Target className="w-3 h-3 mr-2 flex-shrink-0" />
                    {suggestion}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 flex flex-col overflow-hidden">
            {/* Generated Content Display */}
            <div className="flex-1 overflow-y-auto mb-4">
              {currentResponse ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {currentResponse.content.title}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyContent(generateExportContent(currentResponse))}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={exportCaseStudy}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge>{currentResponse.content.targetModule}</Badge>
                      <Badge variant="outline">{currentResponse.content.difficulty}</Badge>
                      <Badge variant="secondary">{currentResponse.mode}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{currentResponse.content.description}</p>
                    </div>

                    {currentResponse.content.learningObjectives.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Learning Objectives</h4>
                        <ul className="text-sm space-y-1">
                          {currentResponse.content.learningObjectives.map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentResponse.content.scenario && (
                      <div className="space-y-4 border-t pt-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          Patient Scenario
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h5 className="font-medium text-sm mb-2">Patient Information</h5>
                              <div className="text-sm space-y-1">
                                <p><strong>Name:</strong> {currentResponse.content.scenario.patientInfo.name}</p>
                                <p><strong>Age:</strong> {currentResponse.content.scenario.patientInfo.age} years</p>
                                <p><strong>Gender:</strong> {currentResponse.content.scenario.patientInfo.gender}</p>
                                <p><strong>History:</strong> {currentResponse.content.scenario.patientInfo.medicalHistory.join(', ')}</p>
                              </div>
                            </div>

                            <div className="bg-red-50 p-3 rounded-lg">
                              <h5 className="font-medium text-sm mb-2">Chief Complaint</h5>
                              <p className="text-sm">{currentResponse.content.scenario.presentation.chiefComplaint}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="bg-green-50 p-3 rounded-lg">
                              <h5 className="font-medium text-sm mb-2">Vital Signs</h5>
                              <div className="text-sm space-y-1">
                                <p><strong>BP:</strong> {currentResponse.content.scenario.presentation.vitalSigns.bloodPressure}</p>
                                <p><strong>HR:</strong> {currentResponse.content.scenario.presentation.vitalSigns.heartRate}</p>
                                <p><strong>RR:</strong> {currentResponse.content.scenario.presentation.vitalSigns.respiratoryRate}</p>
                                <p><strong>SpO2:</strong> {currentResponse.content.scenario.presentation.vitalSigns.oxygenSaturation}</p>
                                <p><strong>Temp:</strong> {currentResponse.content.scenario.presentation.vitalSigns.temperature}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {currentResponse.content.scenario.presentation.symptoms.length > 0 && (
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <h5 className="font-medium text-sm mb-2">Presenting Symptoms</h5>
                            <div className="text-sm">
                              {currentResponse.content.scenario.presentation.symptoms.join(' • ')}
                            </div>
                          </div>
                        )}

                        {currentResponse.content.scenario.expectedActions.length > 0 && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <h5 className="font-medium text-sm mb-2">Expected Student Actions</h5>
                            <ul className="text-sm space-y-1">
                              {currentResponse.content.scenario.expectedActions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="w-4 h-4 rounded-full bg-purple-200 text-purple-800 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {currentResponse.brainstormingOptions && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Brainstorming Options
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-2">Refinements</h5>
                            {currentResponse.brainstormingOptions.refinements.map((ref, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => refineCaseStudy(ref)}
                                className="w-full mb-1 text-xs h-auto p-2"
                              >
                                {ref}
                              </Button>
                            ))}
                          </div>
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-2">Variations</h5>
                            {currentResponse.brainstormingOptions.variations.map((var1, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => refineCaseStudy(`Create variation: ${var1}`)}
                                className="w-full mb-1 text-xs h-auto p-2"
                              >
                                {var1}
                              </Button>
                            ))}
                          </div>
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-2">Difficulty</h5>
                            {currentResponse.brainstormingOptions.difficultyAdjustments.map((diff, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => refineCaseStudy(`Adjust difficulty: ${diff}`)}
                                className="w-full mb-1 text-xs h-auto p-2"
                              >
                                {diff}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentResponse.educationalNotes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Teaching Notes</h5>
                        <p className="text-sm text-gray-700">{currentResponse.educationalNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Educational AI Ready</h3>
                  <p className="text-sm">Create case studies, brainstorm scenarios, and generate educational content.</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={`Create educational content for ${moduleContext?.code || 'EMS'} students...

Examples:
• "Create a cardiac emergency case study for intermediate students"
• "Generate a respiratory distress scenario with realistic vital signs"
• "Brainstorm ideas for trauma assessment practice stations"
• "Create assessment questions about ${moduleContext?.code || 'EMS'} protocols"`}
                className="min-h-[100px] resize-none"
                disabled={isProcessing}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MessageSquare className="w-3 h-3" />
                  <span>
                    Mode: {CONTENT_MODES.find(m => m.value === selectedMode)?.label} |
                    Difficulty: {difficulty} |
                    {moduleContext ? ` Module: ${moduleContext.code}` : ''}
                    {studentContext ? ` | Student Context: ${studentContext.name}` : ''}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing || !command.trim()}
                  className="min-w-[100px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Generate
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