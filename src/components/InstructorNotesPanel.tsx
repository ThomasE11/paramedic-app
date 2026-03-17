/**
 * Enhanced Instructor Notes Panel
 *
 * Allows clinical instructors to:
 * - Add quick assessment notes during simulation
 * - Tag specific omissions and areas for improvement
 * - Document what was missed and why it matters
 * - Create actionable feedback for students
 */

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, X, AlertTriangle, CheckCircle2,
  Tag, Download, Target, GraduationCap,
  BookOpen, MessageSquare
} from 'lucide-react';
import type {
  InstructorAssessmentNote,
  QuickAssessmentTag,
  StudentYear,
  InstructorFeedbackSession
} from '@/types';
import {
  quickAssessmentTags,
  yearSpecificExpectations
} from '@/data/yearSpecificRubrics';

interface InstructorNotesPanelProps {
  caseId: string;
  studentYear: StudentYear;
  sessionNotes: string;
  completedItems: string[];
  totalItems: number;
  /** Lifted state: external assessment notes */
  assessmentNotes?: InstructorAssessmentNote[];
  /** Callback when notes change (for lifting state to parent) */
  onAssessmentNotesChange?: (notes: InstructorAssessmentNote[]) => void;
}

const ASSESSMENT_PHASES = [
  { value: 'dispatch', label: 'Dispatch', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'scene-safety', label: 'Scene Safety', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'primary-survey', label: 'Primary Survey', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'history-taking', label: 'History Taking', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'secondary-survey', label: 'Secondary Survey', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'intervention', label: 'Intervention', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { value: 'packaging', label: 'Packaging', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { value: 'handover', label: 'Handover', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' }
] as const;

const SEVERITY_COLORS = {
  critical: 'bg-red-500 text-white',
  important: 'bg-orange-500 text-white',
  'learning-point': 'bg-blue-500 text-white'
};

export function InstructorNotesPanel({
  caseId,
  studentYear,
  sessionNotes,
  completedItems,
  totalItems,
  assessmentNotes: externalNotes,
  onAssessmentNotesChange
}: InstructorNotesPanelProps) {
  const [internalNotes, setInternalNotes] = useState<InstructorAssessmentNote[]>([]);

  // Use external state if provided, otherwise use internal state
  const assessmentNotes = externalNotes ?? internalNotes;
  const setAssessmentNotes = (updater: InstructorAssessmentNote[] | ((prev: InstructorAssessmentNote[]) => InstructorAssessmentNote[])) => {
    if (onAssessmentNotesChange) {
      const newNotes = typeof updater === 'function' ? updater(assessmentNotes) : updater;
      onAssessmentNotesChange(newNotes);
    } else {
      setInternalNotes(updater as any);
    }
  };
  const [selectedPhase, setSelectedPhase] = useState<InstructorAssessmentNote['phase']>('primary-survey');
  const [customNote, setCustomNote] = useState('');
  const [whatWasMissed, setWhatWasMissed] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [showSavedNotes, setShowSavedNotes] = useState(true);

  // Get year-specific expectations and quick tags
  const yearExpectations = useMemo(() => yearSpecificExpectations[studentYear], [studentYear]);
  const availableTags = useMemo(
    () => quickAssessmentTags.filter(tag => tag.yearLevels.includes(studentYear)),
    [studentYear]
  );

  // Ref for generating unique IDs without Date.now() in render
  const noteIdCounter = useRef(0);

  // Add a quick tag note
  const addQuickTag = (tag: QuickAssessmentTag, severity: InstructorAssessmentNote['severity']) => {
    noteIdCounter.current += 1;
    const newNote: InstructorAssessmentNote = {
      id: `note-${noteIdCounter.current}-${tag.id}`,
      timestamp: new Date().toISOString(),
      category: tag.category === 'critical' ? 'critical-miss' : tag.category === 'positive' ? 'excellent' : 'omitted',
      phase: selectedPhase,
      finding: tag.label,
      whatWasMissed: tag.description,
      whyItMatters: getWhyItMatters(tag.label),
      improvementAction: getImprovementAction(tag.label),
      severity
    };
    setAssessmentNotes(prev => [...prev, newNote]);
  };

  // Add custom note
  const addCustomNote = () => {
    if (!customNote.trim()) return;

    const newNote: InstructorAssessmentNote = {
      id: `custom-${noteIdCounter.current}`,
      timestamp: new Date().toISOString(),
      category: 'omitted',
      phase: selectedPhase,
      finding: customNote,
      whatWasMissed: whatWasMissed || 'Not specified',
      whyItMatters: whyItMatters || 'Requires attention',
      improvementAction: 'Discuss with student',
      severity: whatWasMissed.toLowerCase().includes('critical') ? 'critical' : 'important'
    };

    setAssessmentNotes(prev => [...prev, newNote]);
    setCustomNote('');
    setWhatWasMissed('');
    setWhyItMatters('');
  };

  // Remove a note
  const removeNote = (noteId: string) => {
    setAssessmentNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // Generate why it matters based on the finding
  const getWhyItMatters = (finding: string): string => {
    const lower = finding.toLowerCase();
    if (lower.includes('safety') || lower.includes('bsi') || lower.includes('ppe')) {
      return 'Provider safety is foundational - unsafe providers cannot help patients';
    }
    if (lower.includes('gcs') || lower.includes('vitals')) {
      return 'Complete assessment data is essential for clinical decision making';
    }
    if (lower.includes('history') || lower.includes('sample')) {
      return 'History provides 70-80% of diagnosis - missing history leads to wrong conclusions';
    }
    if (lower.includes('consent') || lower.includes('introduction')) {
      return 'Building rapport and trust is essential for patient cooperation and assessment';
    }
    return 'This affects patient care and outcomes';
  };

  // Generate improvement action based on the finding
  const getImprovementAction = (finding: string): string => {
    const lower = finding.toLowerCase();
    if (lower.includes('introduction')) return 'Practice standard opening script';
    if (lower.includes('consent')) return 'Remember to explain and ask permission before each action';
    if (lower.includes('sample')) return 'Use SAMPLE mnemonic systematically';
    if (lower.includes('opqrs')) return 'Ask OPQRS for any pain complaint';
    if (lower.includes('systematic')) return 'Use ABCDE mnemonic and don\'t skip sections';
    if (lower.includes('gcs')) return 'Practice GCS calculation using the chart';
    return 'Review this skill in lab practice';
  };

  // Export notes
  const exportNotes = () => {
    const feedbackSession: InstructorFeedbackSession = {
      sessionId: Date.now().toString(),
      caseId,
      studentYear,
      date: new Date().toISOString(),
      overallScore: completedItems.length,
      totalScore: totalItems,
      assessmentNotes,
      strengths: assessmentNotes.filter(n => n.category === 'excellent').map(n => n.finding),
      areasForImprovement: assessmentNotes.filter(n => n.category === 'omitted' || n.category === 'incomplete').map(n => n.finding),
      actionPlan: assessmentNotes.map(n => n.improvementAction),
      instructorNotes: sessionNotes,
      followUpNeeded: assessmentNotes.some(n => n.severity === 'critical')
    };

    const blob = new Blob([JSON.stringify(feedbackSession, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${caseId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const completionRate = totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Year-Specific Expectations Quick Reference */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            {studentYear} Expectations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Focus Areas:</p>
            <div className="flex flex-wrap gap-1">
              {yearExpectations.focusAreas.slice(0, 4).map((area, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {area}
                </Badge>
              ))}
              {yearExpectations.focusAreas.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{yearExpectations.focusAreas.length - 4} more
                </Badge>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Common Omissions:</p>
            <div className="flex flex-wrap gap-1">
              {yearExpectations.commonOmissions.slice(0, 3).map((omission, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">
                  {omission}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Assessment Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Quick Assessment Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Phase selector */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Assessment Phase:</p>
            <div className="flex flex-wrap gap-1">
              {ASSESSMENT_PHASES.map(phase => (
                <button
                  key={phase.value}
                  onClick={() => setSelectedPhase(phase.value)}
                  className={`px-2 py-1 rounded text-[10px] transition-colors ${
                    selectedPhase === phase.value
                      ? `${phase.color} ring-1 ring-current`
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {phase.label}
                </button>
              ))}
            </div>
          </div>

          {/* Critical tags */}
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Critical Issues
            </p>
            <div className="flex flex-wrap gap-1">
              {availableTags.filter(t => t.category === 'critical').map(tag => (
                <Button
                  key={tag.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addQuickTag(tag, 'critical')}
                  className="h-7 px-2 text-[10px] border-red-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {tag.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Negative/Instruction tags */}
          <div>
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">Areas for Improvement:</p>
            <div className="flex flex-wrap gap-1">
              {availableTags.filter(t => t.category === 'negative' || t.category === 'instruction').map(tag => (
                <Button
                  key={tag.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addQuickTag(tag, 'important')}
                  className="h-7 px-2 text-[10px]"
                >
                  {tag.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Positive tags */}
          <div>
            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Strengths
            </p>
            <div className="flex flex-wrap gap-1">
              {availableTags.filter(t => t.category === 'positive').map(tag => (
                <Button
                  key={tag.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addQuickTag(tag, 'learning-point')}
                  className="h-7 px-2 text-[10px] border-green-200 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  {tag.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom note */}
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium">Custom Note:</p>
            <Textarea
              placeholder="Describe what was observed..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <Textarea
              placeholder="What was missed or done incorrectly?"
              value={whatWasMissed}
              onChange={(e) => setWhatWasMissed(e.target.value)}
              className="min-h-[50px] text-sm"
            />
            <Textarea
              placeholder="Why does this matter?"
              value={whyItMatters}
              onChange={(e) => setWhyItMatters(e.target.value)}
              className="min-h-[50px] text-sm"
            />
            <Button onClick={addCustomNote} size="sm" className="w-full gap-1">
              <Plus className="h-3 w-3" />
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Notes Log */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Assessment Notes ({assessmentNotes.length})
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={exportNotes} className="h-7 px-2 text-[10px] gap-1">
                <Download className="h-3 w-3" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavedNotes(!showSavedNotes)}
                className="h-7 px-2"
              >
                {showSavedNotes ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showSavedNotes && (
          <CardContent>
            {assessmentNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notes added yet. Click quick tags or add custom notes above.
              </p>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {assessmentNotes.map(note => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        note.category === 'excellent'
                          ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
                          : note.category === 'critical-miss'
                          ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
                          : 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[note.severity]}`}>
                              {note.severity}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {ASSESSMENT_PHASES.find(p => p.value === note.phase)?.label}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{note.finding}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNote(note.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {note.whatWasMissed && (
                        <div className="mb-1">
                          <p className="text-[10px] text-muted-foreground">Missed:</p>
                          <p className="text-xs">{note.whatWasMissed}</p>
                        </div>
                      )}
                      {note.whyItMatters && (
                        <div className="mb-1">
                          <p className="text-[10px] text-muted-foreground">Why it matters:</p>
                          <p className="text-xs">{note.whyItMatters}</p>
                        </div>
                      )}
                      {note.improvementAction && (
                        <div>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Action:
                          </p>
                          <p className="text-xs">{note.improvementAction}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        )}
      </Card>

      {/* Session Summary */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completion:</span>
            <span className="font-medium">{completedItems.length}/{totalItems} ({completionRate}%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Critical notes:</span>
            <span className="font-medium text-red-600">
              {assessmentNotes.filter(n => n.severity === 'critical').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Strengths:</span>
            <span className="font-medium text-green-600">
              {assessmentNotes.filter(n => n.category === 'excellent').length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InstructorNotesPanel;
