import { useMemo, useState } from 'react';
import type { CaseScenario, StudentYear, ComplexityLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Phone, MapPin, Clock, User, Users, AlertTriangle,
  Activity, Eye, Stethoscope,
  Pill, History, Utensils, FileText, Thermometer,
  Droplets, Wind, Heart, Brain, Zap,
  Image, Video, FileText as FileTextIcon, ExternalLink, Play, X
} from 'lucide-react';
import { getECGForCase } from '@/data/litflECGs';
import { ECGDisplayComponent, EmergencyECGQuickRef } from './ECGDisplay';

interface CaseDisplayProps {
  caseData: CaseScenario;
  studentYear?: StudentYear;
}

// Detail visibility levels mapping - avoid recreating on every render
const YEAR_LEVEL_MAP: Record<StudentYear, number> = {
  '2nd-year': 1,
  '3rd-year': 2,
  '4th-year': 3,
  'diploma': 2
} as const;

const COMPLEXITY_MAP: Record<ComplexityLevel, number> = {
  'basic': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4
} as const;

// Helper function to determine if specific detail should be shown
function shouldShowDetail(
  complexity: ComplexityLevel,
  year: StudentYear,
  type: 'findings' | 'interventions' | 'rationale'
): boolean {
  const yearLevel = YEAR_LEVEL_MAP[year];
  const complexityLevel = COMPLEXITY_MAP[complexity];

  switch (type) {
    case 'findings':
      return yearLevel >= 2 || yearLevel >= complexityLevel - 1;
    case 'interventions':
      return yearLevel >= 2 && complexityLevel >= 2;
    case 'rationale':
      return yearLevel >= 3 || complexityLevel >= 4;
    default:
      return false;
  }
}

export function CaseDisplay({ caseData, studentYear = '3rd-year' }: CaseDisplayProps) {
  // ECG Display state
  const [showECGModal, setShowECGModal] = useState(false);

  // Visual Resources state
  const [showVisualResources, setShowVisualResources] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{type: string; url: string; title: string} | null>(null);

  // Memoize detail visibility checks
  const showDetailedFindings = useMemo(() =>
    shouldShowDetail(caseData.complexity, studentYear, 'findings'),
    [caseData.complexity, studentYear]
  );

  const showInterventions = useMemo(() =>
    shouldShowDetail(caseData.complexity, studentYear, 'interventions'),
    [caseData.complexity, studentYear]
  );

  // Check if this case has an associated ECG
  const associatedECG = useMemo(() => {
    const cardiacCategories = ['cardiac', 'cardiac-ecg', 'thoracic', 'respiratory'];
    const isCardiacCase = cardiacCategories.includes(caseData.category.toLowerCase());
    if (isCardiacCase) {
      return getECGForCase(caseData.category, caseData.title);
    }
    return undefined;
  }, [caseData.category, caseData.title]);

  // Memoize timeOfDay replacement to avoid creating new strings
  const formattedTimeOfDay = useMemo(() =>
    caseData.dispatchInfo.timeOfDay.replace('-', ' '),
    [caseData.dispatchInfo.timeOfDay]
  );

  // Memoize access issues join
  const accessIssues = useMemo(() =>
    caseData.sceneInfo.accessIssues?.join(', ') ?? null,
    [caseData.sceneInfo.accessIssues]
  );

  // Memoize odor join
  const odors = useMemo(() =>
    caseData.initialPresentation.odor?.join(', ') ?? null,
    [caseData.initialPresentation.odor]
  );

  // Memoize sounds join
  const sounds = useMemo(() =>
    caseData.initialPresentation.sounds?.join(', ') ?? null,
    [caseData.initialPresentation.sounds]
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Dispatch Information */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-blue-500" />
            Dispatch Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Call Reason</p>
                <p className="text-sm text-muted-foreground">{caseData.dispatchInfo.callReason}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time of Day</p>
                <p className="text-sm text-muted-foreground capitalize">{formattedTimeOfDay}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{caseData.dispatchInfo.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Caller</p>
                <p className="text-sm text-muted-foreground">{caseData.dispatchInfo.callerInfo}</p>
              </div>
            </div>
          </div>
          {caseData.dispatchInfo.dispatchCode && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                Code: {caseData.dispatchInfo.dispatchCode}
              </Badge>
            </div>
          )}
          {showDetailedFindings && caseData.dispatchInfo.additionalInfo && (
            <div className="mt-2 p-2 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">Additional Information</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {caseData.dispatchInfo.additionalInfo.map((info, i) => (
                  <li key={i}>• {info}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scene Information */}
      <Card className="border-l-4 border-l-cyan-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-cyan-500" />
            Scene Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Scene Description</p>
              <p className="text-sm text-muted-foreground">{caseData.sceneInfo.description}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Bystanders</p>
              <p className="text-sm text-muted-foreground">{caseData.sceneInfo.bystanders}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Environment</p>
              <p className="text-sm text-muted-foreground">{caseData.sceneInfo.environment}</p>
            </div>
          </div>
          {showDetailedFindings && accessIssues && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-600">Access Issues</p>
                <p className="text-sm text-muted-foreground">{accessIssues}</p>
              </div>
            </div>
          )}
          {caseData.sceneInfo.hazards.length > 0 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-600">Hazards</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {caseData.sceneInfo.hazards.map((hazard, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {hazard}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Initial Presentation */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-red-500" />
            Initial Presentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">General Impression</p>
              <p className="text-sm text-muted-foreground">{caseData.initialPresentation.generalImpression}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Position</p>
              <p className="text-sm text-muted-foreground">{caseData.initialPresentation.position}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Appearance</p>
              <p className="text-sm text-muted-foreground">{caseData.initialPresentation.appearance}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Consciousness</p>
              <p className="text-sm text-muted-foreground">{caseData.initialPresentation.consciousness}</p>
            </div>
          </div>
          {showDetailedFindings && odors && (
            <div className="mt-3 p-2 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground">Odor</p>
              <p className="text-sm text-muted-foreground">{odors}</p>
            </div>
          )}
          {showDetailedFindings && sounds && (
            <div className="mt-3 p-2 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground">Sounds</p>
              <p className="text-sm text-muted-foreground">{sounds}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ABCDE Assessment */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-purple-500" />
            ABCDE Assessment Findings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Airway */}
          <div className="rounded-lg border-l-4 border-l-blue-500 bg-muted/50 p-3">
            <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Wind className="h-4 w-4" />
              A - Airway
            </h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Patent:</span> {caseData.abcde.airway.patent ? 'Yes' : 'No'}</p>
              <div>
                <span className="text-muted-foreground">Findings:</span>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                  {caseData.abcde.airway.findings.map((finding: string, idx: number) => <li key={idx}>{finding}</li>)}
                </ul>
              </div>
              {showInterventions && caseData.abcde.airway.interventions.length > 0 && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Interventions:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.airway.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                  </ul>
                </div>
              )}
              {showDetailedFindings && caseData.abcde.airway.adjunctsNeeded && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Adjuncts:</span> {caseData.abcde.airway.adjunctsNeeded.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Breathing */}
          <div className="rounded-lg border-l-4 border-l-cyan-500 bg-muted/50 p-3">
            <h4 className="mb-2 font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              B - Breathing
            </h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">Rate:</span> {caseData.abcde.breathing.rate} /min</p>
              <p><span className="text-muted-foreground">SpO2:</span> {caseData.abcde.breathing.spo2}%</p>
              <p><span className="text-muted-foreground">Rhythm:</span> {caseData.abcde.breathing.rhythm}</p>
              <p><span className="text-muted-foreground">Depth:</span> {caseData.abcde.breathing.depth}</p>
              <div className="col-span-2">
                <span className="text-muted-foreground">Findings:</span>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                  {caseData.abcde.breathing.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              {showDetailedFindings && caseData.abcde.breathing.auscultation && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">Auscultation:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.breathing.auscultation.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {showInterventions && caseData.abcde.breathing.interventions.length > 0 && (
                <div className="col-span-2 mt-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded">
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Interventions:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.breathing.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Circulation */}
          <div className="rounded-lg border-l-4 border-l-red-500 bg-muted/50 p-3">
            <h4 className="mb-2 font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              C - Circulation
            </h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">Pulse:</span> {caseData.abcde.circulation.pulseRate} bpm ({caseData.abcde.circulation.pulseQuality})</p>
              <p><span className="text-muted-foreground">BP:</span> {caseData.abcde.circulation.bp.systolic}/{caseData.abcde.circulation.bp.diastolic} mmHg</p>
              <p><span className="text-muted-foreground">Cap Refill:</span> {caseData.abcde.circulation.capillaryRefill} sec</p>
              <p><span className="text-muted-foreground">Skin:</span> {caseData.abcde.circulation.skin}</p>
              {showDetailedFindings && caseData.abcde.circulation.ecgFindings && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">ECG Findings:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.circulation.ecgFindings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {showInterventions && caseData.abcde.circulation.interventions.length > 0 && (
                <div className="col-span-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">Interventions:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.circulation.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Disability */}
          <div className="rounded-lg border-l-4 border-l-purple-500 bg-muted/50 p-3">
            <h4 className="mb-2 font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              D - Disability
            </h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">AVPU:</span> <Badge variant="outline">{caseData.abcde.disability.avpu}</Badge></p>
              <p><span className="text-muted-foreground">GCS:</span> {caseData.abcde.disability.gcs.total}/15 (E{caseData.abcde.disability.gcs.eye}V{caseData.abcde.disability.gcs.verbal}M{caseData.abcde.disability.gcs.motor})</p>
              <p><span className="text-muted-foreground">Pupils:</span> {caseData.abcde.disability.pupils}</p>
              {caseData.abcde.disability.bloodGlucose && (
                <p><span className="text-muted-foreground">Glucose:</span> {caseData.abcde.disability.bloodGlucose} mmol/L</p>
              )}
              {showDetailedFindings && caseData.abcde.disability.focalDeficits && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">Focal Deficits:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.disability.focalDeficits.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {showInterventions && caseData.abcde.disability.interventions.length > 0 && (
                <div className="col-span-2 mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Interventions:</span>
                  <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                    {caseData.abcde.disability.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Exposure */}
          <div className="rounded-lg border-l-4 border-l-amber-500 bg-muted/50 p-3">
            <h4 className="mb-2 font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              E - Exposure
            </h4>
            {caseData.abcde.exposure.temperature && (
              <p className="text-sm"><span className="text-muted-foreground">Temperature:</span> {caseData.abcde.exposure.temperature}°C</p>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">Findings:</span>
              <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                {caseData.abcde.exposure.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            {showDetailedFindings && caseData.abcde.exposure.wounds && (
              <div className="mt-2">
                <span className="text-muted-foreground text-xs">Wounds:</span>
                <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                  {caseData.abcde.exposure.wounds.map((f: string, i: number) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
            {showInterventions && caseData.abcde.exposure.interventions.length > 0 && (
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Interventions:</span>
                <ul className="ml-4 mt-1 list-disc text-xs text-muted-foreground">
                  {caseData.abcde.exposure.interventions.map((intervention: string, idx: number) => <li key={idx}>{intervention}</li>)}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Survey */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-amber-500" />
            Secondary Survey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(caseData.secondarySurvey).map(([region, findings]) => (
              <div key={region} className="rounded-lg border p-3">
                <p className="mb-1 text-sm font-medium capitalize">{region}</p>
                <ul className="ml-3 list-disc text-sm text-muted-foreground">
                  {findings.map((finding: string, idx: number) => <li key={idx}>{finding}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-green-500" />
            Patient History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Medications */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Pill className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Medications</p>
            </div>
            <div className="space-y-2">
              {caseData.history.medications.map((med, i) => (
                <div key={i} className="rounded-lg border p-2 text-sm">
                  <p className="font-medium">{med.name} {med.dose}</p>
                  <p className="text-xs text-muted-foreground">{med.frequency} - {med.indication}</p>
                  {showDetailedFindings && med.route && (
                    <p className="text-xs text-muted-foreground">Route: {med.route}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Allergies & Conditions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium">Allergies</p>
              <div className="flex flex-wrap gap-1">
                {caseData.history.allergies.map((allergy, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">{allergy}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">Medical Conditions</p>
              <ul className="ml-3 list-disc text-sm text-muted-foreground">
                {caseData.history.medicalConditions.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          <Separator />

          {/* Events & Last Meal */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <Utensils className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Meal</p>
                <p className="text-sm text-muted-foreground">{caseData.history.lastMeal}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Events Leading</p>
                <p className="text-sm text-muted-foreground">{caseData.history.eventsLeading}</p>
              </div>
            </div>
          </div>

          {showDetailedFindings && caseData.history.socialHistory && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-sm font-medium">Social History</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  {caseData.history.socialHistory.smoking && <p>Smoking: {caseData.history.socialHistory.smoking}</p>}
                  {caseData.history.socialHistory.alcohol && <p>Alcohol: {caseData.history.socialHistory.alcohol}</p>}
                  {caseData.history.socialHistory.occupation && <p>Occupation: {caseData.history.socialHistory.occupation}</p>}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Management Pathway - Only for advanced/expert cases or higher year levels */}
      {showInterventions && caseData.managementPathway && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-green-500" />
              Management Pathway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {caseData.managementPathway.immediate && (
              <div>
                <p className="text-sm font-medium text-green-600">Immediate Actions</p>
                <ul className="ml-4 mt-1 list-disc text-sm text-muted-foreground">
                  {caseData.managementPathway.immediate.map((action, i) => <li key={i}>{action}</li>)}
                </ul>
              </div>
            )}
            {caseData.managementPathway.definitive && (
              <div>
                <p className="text-sm font-medium text-blue-600">Definitive Treatment</p>
                <ul className="ml-4 mt-1 list-disc text-sm text-muted-foreground">
                  {caseData.managementPathway.definitive.map((action, i) => <li key={i}>{action}</li>)}
                </ul>
              </div>
            )}
            {caseData.managementPathway.monitoring && (
              <div>
                <p className="text-sm font-medium text-purple-600">Monitoring</p>
                <ul className="ml-4 mt-1 list-disc text-sm text-muted-foreground">
                  {caseData.managementPathway.monitoring.map((action, i) => <li key={i}>{action}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ECG Display - For cardiac emergencies */}
      {associatedECG && (
        <Card className="border-l-4 border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-rose-600 dark:text-rose-400">
                <Activity className="h-5 w-5" />
                Associated ECG - {associatedECG.title}
              </CardTitle>
              <Badge className={associatedECG.urgency === 'critical' ? 'bg-red-600' : 'bg-orange-500'}>
                {associatedECG.urgency.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <EmergencyECGQuickRef ecg={associatedECG} />
            <Button
              onClick={() => setShowECGModal(true)}
              className="mt-3 w-full sm:w-auto bg-rose-600 hover:bg-rose-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full ECG Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ECG Modal */}
      {showECGModal && associatedECG && (
        <ECGDisplayComponent
          ecg={associatedECG}
          show={showECGModal}
          onClose={() => setShowECGModal(false)}
        />
      )}

      {/* Visual Resources - For trauma cases */}
      {caseData.visualResources && (
        <Card className="border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-purple-600 dark:text-purple-400">
                <Image className="h-5 w-5" />
                Visual Resources & Learning Materials
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVisualResources(!showVisualResources)}
              >
                {showVisualResources ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
          {showVisualResources && (
            <CardContent className="space-y-4">
              {/* Images */}
              {caseData.visualResources.images && caseData.visualResources.images.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Image className="h-4 w-4 text-purple-600" />
                    <p className="text-sm font-medium">Clinical Images & X-Rays</p>
                    <Badge variant="outline" className="text-xs">{caseData.visualResources.images.length}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {caseData.visualResources.images.map((img) => (
                      <a
                        key={img.id}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-lg border bg-background p-2 text-sm transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/30"
                      >
                        <Image className="h-8 w-8 flex-shrink-0 text-purple-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{img.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{img.source}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {caseData.visualResources.videos && caseData.visualResources.videos.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium">Procedure Videos</p>
                    <Badge variant="outline" className="text-xs">{caseData.visualResources.videos.length}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {caseData.visualResources.videos.map((vid) => (
                      <a
                        key={vid.id}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-lg border bg-background p-2 text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Play className="h-8 w-8 flex-shrink-0 text-red-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{vid.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{vid.source} {vid.duration && `• ${vid.duration}`}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles */}
              {caseData.visualResources.articles && caseData.visualResources.articles.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium">Reference Articles</p>
                    <Badge variant="outline" className="text-xs">{caseData.visualResources.articles.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {caseData.visualResources.articles.slice(0, 5).map((article) => (
                      <a
                        key={article.id}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 rounded-lg border bg-background p-2 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      >
                        <FileTextIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{article.title}</p>
                          <p className="text-xs text-muted-foreground">{article.source}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                    {caseData.visualResources.articles.length > 5 && (
                      <p className="text-center text-xs text-muted-foreground">
                        +{caseData.visualResources.articles.length - 5} more articles available
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Assessment Resources */}
              {caseData.visualResources.assessment && caseData.visualResources.assessment.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">Assessment Tools & Algorithms</p>
                    <Badge variant="outline" className="text-xs">{caseData.visualResources.assessment.length}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {caseData.visualResources.assessment.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-lg border bg-background p-2 text-sm transition-colors hover:bg-green-50 dark:hover:bg-green-900/30"
                      >
                        <Stethoscope className="h-8 w-8 flex-shrink-0 text-green-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{res.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{res.source}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedures */}
              {caseData.visualResources.procedures && caseData.visualResources.procedures.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-medium">Procedure Guides</p>
                    <Badge variant="outline" className="text-xs">{caseData.visualResources.procedures.length}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {caseData.visualResources.procedures.map((proc) => (
                      <a
                        key={proc.id}
                        href={proc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-lg border bg-background p-2 text-sm transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/30"
                      >
                        <Play className="h-8 w-8 flex-shrink-0 text-amber-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{proc.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{proc.source}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Management */}
              {caseData.visualResources.management && caseData.visualResources.management.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-cyan-600" />
                    <p className="text-sm font-medium">Management Algorithms</p>
                    <Badge variant="outline" className="text-xs">{caseData.visualResources.management.length}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {caseData.visualResources.management.map((mgmt) => (
                      <a
                        key={mgmt.id}
                        href={mgmt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-lg border bg-background p-2 text-sm transition-colors hover:bg-cyan-50 dark:hover:bg-cyan-900/30"
                      >
                        <FileTextIcon className="h-8 w-8 flex-shrink-0 text-cyan-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{mgmt.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{mgmt.source}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
