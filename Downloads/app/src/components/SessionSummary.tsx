import { useMemo } from 'react';
import type { CaseScenario, CaseSession, ChecklistItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, FileText, Award, AlertCircle, AlertTriangle, Clock, BookOpen, Lightbulb, Download, Loader2 } from 'lucide-react';
import { exportSessionToPDF } from '@/lib/pdf-export';
import { useState } from 'react';

interface SessionSummaryProps {
  session: CaseSession;
  caseData: CaseScenario;
  elapsedTime?: string; // Formatted elapsed time from timer
  timeTakenSeconds?: number; // Actual time taken in seconds
}

// Grade thresholds as constant to avoid recreation
const GRADE_THRESHOLDS = [
  { min: 90, label: 'Excellent', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { min: 75, label: 'Good', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { min: 60, label: 'Satisfactory', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
] as const;

const getGrade = (pct: number) => {
  for (const threshold of GRADE_THRESHOLDS) {
    if (pct >= threshold.min) return threshold;
  }
  return { label: 'Needs Improvement', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' };
};

// Consequence descriptions for missed critical items
const getConsequenceForItem = (item: ChecklistItem): string | undefined => {
  if (item.critical) {
    const consequences: Record<string, string> = {
      'abcde': 'Missed ABCDE assessment can lead to failure to identify life-threatening conditions. Early systematic assessment is critical for patient survival.',
      'airway': 'Unmanaged airway leads to hypoxia within minutes and is a leading cause of preventable death.',
      'breathing': 'Unmanaged breathing problems rapidly deteriorate into respiratory failure and cardiac arrest.',
      'circulation': 'Uncontrolled hemorrhage is the most common cause of preventable trauma death. Every minute counts.',
      'disability': 'Neurological deterioration can be irreversible if not recognized and managed early.',
      'intervention': 'Delayed intervention in critical cases significantly increases mortality and morbidity.',
      'medication': 'Time-critical medications have narrow therapeutic windows. Delays reduce effectiveness and patient outcomes.',
      'safety': 'Scene safety violations put providers, patients, and bystanders at risk of injury or death.',
      'communication': 'Poor communication leads to errors, delays, and inappropriate patient care.',
    };

    const itemLower = item.description.toLowerCase();
    for (const [key, consequence] of Object.entries(consequences)) {
      if (itemLower.includes(key) || item.category === key) {
        return consequence;
      }
    }

    return 'This is a critical action that should have been performed. Missing this item could have serious consequences for patient care.';
  }
  return undefined;
};

// Medication-specific consequences with UAE guideline references
const getMedicationConsequence = (item: ChecklistItem): { consequence: string; timeframe?: string; guideline: string } | undefined => {
  const desc = item.description.toLowerCase();

  const medicationMap: Record<string, { consequence: string; timeframe: string; guideline: string }> = {
    'adrenaline': {
      consequence: 'Adrenaline is the FIRST-LINE treatment for anaphylaxis. Delay >5 minutes significantly increases risk of cardiac arrest and respiratory failure.',
      timeframe: 'Within 5 minutes of recognition',
      guideline: 'UAE DCAS Anaphylaxis Protocol: IM Adrenaline 1:1,000 (0.3-0.5mg) immediately'
    },
    'epinephrine': {
      consequence: 'Epinephrine is the FIRST-LINE treatment for anaphylaxis. Delay >5 minutes significantly increases risk of cardiac arrest and respiratory failure.',
      timeframe: 'Within 5 minutes of recognition',
      guideline: 'UAE DCAS Anaphylaxis Protocol: IM Epinephrine 1:1,000 (0.3-0.5mg) immediately'
    },
    'salbutamol': {
      consequence: 'Bronchodilators should be given early in acute asthma exacerbation. Delays lead to increased work of breathing, fatigue, and potential respiratory failure.',
      timeframe: 'Within 10 minutes of assessment',
      guideline: 'UAE DCAS Asthma Protocol: Salbutamol 2.5-5mg via nebulizer, repeat every 20 min'
    },
    'albuterol': {
      consequence: 'Bronchodilators should be given early in acute asthma exacerbation. Delays lead to increased work of breathing, fatigue, and potential respiratory failure.',
      timeframe: 'Within 10 minutes of assessment',
      guideline: 'UAE DCAS Asthma Protocol: Salbutamol 2.5-5mg via nebulizer, repeat every 20 min'
    },
    'aspirin': {
      consequence: 'Aspirin reduces mortality in ACS by inhibiting platelet aggregation. Early administration improves outcomes.',
      timeframe: 'As soon as ACS suspected',
      guideline: 'UAE DCAS Cardiac Chest Pain Protocol: Aspirin 300mg chewed immediately'
    },
    'morphine': {
      consequence: 'Adequate analgesia is important for pain relief and reducing sympathetic stress. However, morphine requires hemodynamic stability.',
      timeframe: 'After ruling out contraindications',
      guideline: 'UAE DCAS Analgesia Protocol: Morphine 5mg IV/IM, titrate to effect'
    },
    'fentanyl': {
      consequence: 'Adequate analgesia is important for pain relief and reducing sympathetic stress. Fentanyl has fewer hemodynamic side effects.',
      timeframe: 'As needed for moderate-severe pain',
      guideline: 'UAE DCAS Analgesia Protocol: Fentanyl 50mcg IN/IV, repeat 25-50mcg q10min'
    },
    'oxygen': {
      consequence: 'Hypoxia causes cellular damage within minutes. Untreated hypoxia leads to organ dysfunction and cardiac arrest.',
      timeframe: 'Immediately upon recognition',
      guideline: 'UAE DCAS Oxygen Therapy: Target SpO2 94-98% (88-92% for COPD)'
    },
    'nitroglycerin': {
      consequence: 'GTN reduces myocardial oxygen demand and ischemic pain. Delayed administration prolongs patient suffering and myocardial damage.',
      timeframe: 'After ensuring SBP > 90',
      guideline: 'UAE DCAS Cardiac Chest Pain Protocol: GTN spray 0.4mg SL, repeat q5min x3'
    },
    'gtn': {
      consequence: 'GTN reduces myocardial oxygen demand and ischemic pain. Delayed administration prolongs patient suffering and myocardial damage.',
      timeframe: 'After ensuring SBP > 90',
      guideline: 'UAE DCAS Cardiac Chest Pain Protocol: GTN spray 0.4mg SL, repeat q5min x3'
    },
    'glucose': {
      consequence: 'Hypoglycemia causes brain damage rapidly. Every minute of untreated hypoglycemia increases neurological injury risk.',
      timeframe: 'Immediately',
      guideline: 'UAE DCAS Hypoglycemia Protocol: Oral glucose if able to swallow, IV dextrose if unconscious'
    },
    'iv': {
      consequence: 'IV access is essential for fluid resuscitation and medication administration. Delays in critical patients can be fatal.',
      timeframe: 'Within 5 minutes for critical patients',
      guideline: 'UAE DCAS Protocol: Establish 2 large-bore IVs for trauma/critical patients'
    },
  };

  for (const [med, info] of Object.entries(medicationMap)) {
    if (desc.includes(med)) {
      return info;
    }
  }

  return undefined;
};

// Generate contextual feedback for missed items
const generateFeedbackForItem = (item: ChecklistItem, caseData: CaseScenario): string => {
  const desc = item.description.toLowerCase();

  // Medication-related feedback
  if (desc.includes('adrenaline') || desc.includes('epinephrine')) {
    return 'Adrenaline is the cornerstone of anaphylaxis treatment. It works by reversing bronchoconstriction, vasodilation, and angioedema. Antihistamines are NOT first-line and do NOT treat airway obstruction or shock.';
  }
  if (desc.includes('salbutamol') || desc.includes('albuterol')) {
    return 'Salbutamol is a short-acting beta-agonist that provides rapid bronchodilation. In acute asthma, it should be administered early via nebulizer. Consider adding ipratropium for severe cases.';
  }
  if (desc.includes('aspirin')) {
    return 'Aspirin irreversibly inhibits cyclooxygenase-1, reducing thromboxane A2 production and platelet aggregation. It MUST be chewed for rapid absorption in ACS.';
  }
  if (desc.includes('oxygen')) {
    return 'Hypoxia is a killer. Oxygen should be administered to any patient with SpO2 < 94% or signs of respiratory distress. Use non-rebreather at 12-15 L/min for critical patients.';
  }

  // Scene safety feedback
  if (desc.includes('scene') || desc.includes('safety') || desc.includes('hazards')) {
    return 'Scene safety is Rule #1. A dead or injured provider cannot help anyone. Always assess: hazards, environment, resources, and mechanism before patient contact.';
  }

  // ABCDE feedback
  if (desc.includes('airway') || desc.includes('breathing') || desc.includes('c-spine')) {
    return 'Airway and breathing are assessed before circulation. A patient without a patent airway will die within minutes. C-spine stabilization is crucial for trauma mechanisms.';
  }
  if (desc.includes('iv') || desc.includes('fluid') || desc.includes('access')) {
    return 'IV access allows fluid resuscitation and medication administration. In trauma or shock, establish 2 large-bore (14-16G) IVs. Use IO if IV access cannot be obtained within 90 seconds.';
  }

  // Default feedback based on item properties
  if (item.rationale) {
    return item.rationale;
  }
  if (item.critical) {
    return `This is a critical action for ${caseData.category} cases. Missing this step indicates a gap in clinical knowledge that should be reviewed.`;
  }

  return `While not immediately life-threatening, this action is part of comprehensive patient care and should be performed when time permits.`;
};

export function SessionSummary({ session, caseData, elapsedTime, timeTakenSeconds }: SessionSummaryProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportSessionToPDF({
        session,
        caseData,
        elapsedTime,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Memoize computed values
  const completedItems = useMemo(() =>
    caseData.studentChecklist.filter(item => session.completedItems.includes(item.id)),
    [caseData.studentChecklist, session.completedItems]
  );

  const missedItems = useMemo(() =>
    caseData.studentChecklist.filter(item =>
      !session.completedItems.includes(item.id) && item.yearLevel.includes(session.studentYear)
    ),
    [caseData.studentChecklist, session.completedItems, session.studentYear]
  );

  const criticalMissedItems = useMemo(() =>
    missedItems.filter(item => item.critical),
    [missedItems]
  );

  const percentage = useMemo(() =>
    session.totalPossible > 0 ? Math.round((session.score / session.totalPossible) * 100) : 0,
    [session.score, session.totalPossible]
  );

  const grade = useMemo(() => getGrade(percentage), [percentage]);

  // Calculate time efficiency
  const estimatedDuration = caseData.estimatedDuration || 30;
  const timeEfficiency = timeTakenSeconds
    ? Math.round((estimatedDuration * 60 / timeTakenSeconds) * 100)
    : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Overall Score */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${grade.color}`}>
              <Award className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-bold">{percentage}%</h3>
            <p className="text-lg font-medium">{grade.label}</p>
            <p className="text-sm text-muted-foreground">
              {session.score} / {session.totalPossible} points
            </p>
            {elapsedTime && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Time: {elapsedTime}</span>
                {timeEfficiency && (
                  <span className={`ml-2 ${timeEfficiency > 100 ? 'text-green-600' : timeEfficiency > 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    ({timeEfficiency > 100 ? 'Under' : timeEfficiency > 80 ? 'Within' : 'Over'} estimated time)
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alert - if any critical items were missed */}
      {criticalMissedItems.length > 0 && (
        <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
              Critical Actions Missed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300 mb-3">
              The following <strong>critical</strong> actions were not performed. Missing these in a real clinical situation could lead to serious patient harm:
            </p>
            <div className="space-y-3">
              {criticalMissedItems.map(item => {
                const consequence = getConsequenceForItem(item);
                const medInfo = getMedicationConsequence(item);
                const feedback = generateFeedbackForItem(item, caseData);

                return (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{item.description}</p>

                        {medInfo?.timeframe && (
                          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Expected: {medInfo.timeframe}
                          </p>
                        )}

                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded text-sm">
                          <p className="font-medium text-red-700 dark:text-red-300">Consequence:</p>
                          <p className="text-red-600 dark:text-red-400">{consequence || medInfo?.consequence}</p>
                        </div>

                        {medInfo?.guideline && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-sm">
                            <p className="font-medium text-blue-700 dark:text-blue-300">Guideline:</p>
                            <p className="text-blue-600 dark:text-blue-400">{medInfo.guideline}</p>
                          </div>
                        )}

                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded text-sm">
                          <p className="font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            Why This Matters:
                          </p>
                          <p className="text-amber-600 dark:text-amber-400">{feedback}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completedItems.length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{missedItems.length}</p>
            <p className="text-sm text-muted-foreground">Missed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round((completedItems.length / (completedItems.length + missedItems.length)) * 100)}%
            </p>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Completed Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <div>
                      <span className="text-sm">{item.description}</span>
                      {item.critical && (
                        <Badge className="ml-2 bg-red-600 text-white">Critical</Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">+{item.points}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Non-Critical Missed Items */}
      {missedItems.filter(item => !item.critical).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-orange-700 dark:text-orange-400">
              <XCircle className="h-5 w-5" />
              Non-Critical Items to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missedItems.filter(item => !item.critical).map((item) => {
                const feedback = generateFeedbackForItem(item, caseData);
                return (
                  <div key={item.id} className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <XCircle className="mt-0.5 h-4 w-4 text-orange-500 flex-shrink-0" />
                        <div>
                          <span className="text-sm">{item.description}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{item.category}</Badge>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{item.points} pts</span>
                    </div>
                    {item.rationale && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-6 italic">
                        "{item.rationale}"
                      </p>
                    )}
                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded text-xs">
                      <p className="text-amber-700 dark:text-amber-300">
                        <BookOpen className="w-3 h-3 inline mr-1" />
                        {feedback}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teaching Points - Always visible */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-primary" />
            Key Learning Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {caseData.teachingPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {i + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Common Pitfalls - if available */}
      {caseData.commonPitfalls && caseData.commonPitfalls.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Common Pitfalls to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {caseData.commonPitfalls.map((pitfall, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-amber-500">⚠</span>
                  <span>{pitfall}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Instructor Notes */}
      {session.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Instructor Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{session.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.print()}
        >
          <FileText className="mr-2 h-4 w-4" />
          Print Summary
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex-1"
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting ? 'Generating PDF...' : 'Export PDF'}
        </Button>
      </div>
    </div>
  );
}
