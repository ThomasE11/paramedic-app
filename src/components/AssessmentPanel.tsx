import { useMemo } from 'react';
import type { CaseScenario, StudentYear } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Lightbulb, Stethoscope, Activity, TrendingUp, BookOpen } from 'lucide-react';

interface AssessmentPanelProps {
  caseData: CaseScenario;
  studentYear?: StudentYear;
}

export function AssessmentPanel({ caseData, studentYear = '3rd-year' }: AssessmentPanelProps) {
  // Memoize visibility flags
  const showAdvancedDetails = useMemo(() =>
    ['3rd-year', '4th-year'].includes(studentYear),
    [studentYear]
  );

  const showExpertDetails = useMemo(() =>
    studentYear === '4th-year',
    [studentYear]
  );

  return (
    <div className="space-y-4">
      {/* Expected Findings */}
      <Card className="card-interactive animate-fade-in-up stagger-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            Expected Findings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Observations */}
          <div>
            <p className="mb-2 text-sm font-medium">Key Observations</p>
            <div className="space-y-2">
              {caseData.expectedFindings.keyObservations.map((obs, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-muted p-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <span className="text-sm">{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags */}
          <div>
            <p className="mb-2 text-sm font-medium text-red-600">Red Flags</p>
            <div className="space-y-2">
              {caseData.expectedFindings.redFlags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500" />
                  <span className="text-sm">{flag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Differential Diagnoses */}
          <div>
            <p className="mb-2 text-sm font-medium">Differential Diagnoses</p>
            <div className="flex flex-wrap gap-2">
              {caseData.expectedFindings.differentialDiagnoses.map((dx, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {dx}
                </Badge>
              ))}
            </div>
          </div>

          {/* Most Likely Diagnosis - Only for 3rd year+ */}
          {showAdvancedDetails && caseData.expectedFindings.mostLikelyDiagnosis && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary">Most Likely Diagnosis</p>
              <p className="text-sm">{caseData.expectedFindings.mostLikelyDiagnosis}</p>
            </div>
          )}

          {/* Supporting Evidence - Only for 4th year */}
          {showExpertDetails && caseData.expectedFindings.supportingEvidence && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground">Supporting Evidence</p>
              <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                {caseData.expectedFindings.supportingEvidence.map((evidence, i) => (
                  <li key={i}>{evidence}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teaching Points */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 card-interactive animate-fade-in-up stagger-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            Teaching Points
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

      {/* Common Pitfalls - Only for 3rd year+ */}
      {showAdvancedDetails && caseData.commonPitfalls && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 card-interactive animate-fade-in-up stagger-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-400">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Common Pitfalls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {caseData.commonPitfalls.map((pitfall, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-medium text-white">
                    {i + 1}
                  </span>
                  <span>{pitfall}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Vital Signs Progression */}
      <Card className="card-interactive animate-fade-in-up stagger-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            Vital Signs Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Initial */}
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">Initial</p>
              <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-5">
                <div>
                  <span className="text-muted-foreground">BP:</span>
                  <p className="font-medium">{caseData.vitalSignsProgression.initial.bp}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Pulse:</span>
                  <p className="font-medium">{caseData.vitalSignsProgression.initial.pulse}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">RR:</span>
                  <p className="font-medium">{caseData.vitalSignsProgression.initial.respiration}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">SpO2:</span>
                  <p className="font-medium">{caseData.vitalSignsProgression.initial.spo2}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">GCS:</span>
                  <p className="font-medium">{caseData.vitalSignsProgression.initial.gcs}</p>
                </div>
                {caseData.vitalSignsProgression.initial.temperature && (
                  <div>
                    <span className="text-muted-foreground">Temp:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.initial.temperature}°C</p>
                  </div>
                )}
                {caseData.vitalSignsProgression.initial.bloodGlucose && (
                  <div>
                    <span className="text-muted-foreground">Glucose:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.initial.bloodGlucose}</p>
                  </div>
                )}
              </div>
            </div>

            {/* After Intervention */}
            {caseData.vitalSignsProgression.afterIntervention && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">After Intervention</p>
                <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-5">
                  <div>
                    <span className="text-muted-foreground">BP:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.afterIntervention.bp}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pulse:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.afterIntervention.pulse}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RR:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.afterIntervention.respiration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SpO2:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.afterIntervention.spo2}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GCS:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.afterIntervention.gcs}</p>
                  </div>
                </div>
              </div>
            )}

            {/* En Route */}
            {caseData.vitalSignsProgression.enRoute && (
              <div className="rounded-lg border p-3">
                <p className="mb-2 text-sm font-medium">En Route</p>
                <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-5">
                  <div>
                    <span className="text-muted-foreground">BP:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.enRoute.bp}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pulse:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.enRoute.pulse}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RR:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.enRoute.respiration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SpO2:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.enRoute.spo2}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GCS:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.enRoute.gcs}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Deterioration - Only for advanced/expert */}
            {showExpertDetails && caseData.vitalSignsProgression.deterioration && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">If Deterioration Occurs</p>
                <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-5">
                  <div>
                    <span className="text-muted-foreground">BP:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.deterioration.bp}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pulse:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.deterioration.pulse}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RR:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.deterioration.respiration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SpO2:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.deterioration.spo2}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GCS:</span>
                    <p className="font-medium">{caseData.vitalSignsProgression.deterioration.gcs}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investigations - Only for 3rd year+ */}
      {showAdvancedDetails && caseData.investigations && caseData.investigations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Investigations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {caseData.investigations.map((inv, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{inv.name}</p>
                    <Badge
                      variant={inv.urgency === 'immediate' ? 'destructive' : inv.urgency === 'urgent' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {inv.urgency}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{inv.indication}</p>
                  {inv.findings && (
                    <p className="text-xs text-primary mt-1">Findings: {inv.findings}</p>
                  )}
                  {inv.interpretation && showExpertDetails && (
                    <p className="text-xs text-muted-foreground mt-1">Interpretation: {inv.interpretation}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* References - Only for 4th year */}
      {showExpertDetails && caseData.references && caseData.references.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {caseData.references.map((ref, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {ref}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
