import { 
  Stethoscope, Heart, Monitor, Activity, ClipboardList, BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CaseScenario } from '@/types';

interface ManagementViewProps {
  caseData: CaseScenario;
}

export function ManagementView({ caseData }: ManagementViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {caseData.managementPathway && (
        <>
          {/* Prehospital Management */}
          {caseData.managementPathway.immediate && caseData.managementPathway.immediate.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5" />
                Prehospital Management
              </h3>
              <ul className="space-y-3">
                {caseData.managementPathway.immediate.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-blue-800 dark:text-blue-200 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Definitive Treatment */}
          {caseData.managementPathway.definitive && caseData.managementPathway.definitive.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5" />
                Definitive Treatment
              </h3>
              <ul className="space-y-3">
                {caseData.managementPathway.definitive.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-green-800 dark:text-green-200 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Monitoring */}
          {caseData.managementPathway.monitoring && caseData.managementPathway.monitoring.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-5">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5" />
                Monitoring Requirements
              </h3>
              <ul className="space-y-3">
                {caseData.managementPathway.monitoring.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-purple-800 dark:text-purple-200 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transport Considerations */}
          {caseData.managementPathway.transportConsiderations && caseData.managementPathway.transportConsiderations.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-5">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                Transport Considerations
              </h3>
              <ul className="space-y-3">
                {caseData.managementPathway.transportConsiderations.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-orange-800 dark:text-orange-200 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Expected Findings */}
      {caseData.expectedFindings && (
        <div className="bg-muted/50 rounded-lg p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Expected Clinical Findings
          </h3>
          
          {caseData.expectedFindings.keyObservations && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Key Observations:</p>
              <div className="flex flex-wrap gap-2">
                {caseData.expectedFindings.keyObservations.map((obs, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs py-1 px-2">{obs}</Badge>
                ))}
              </div>
            </div>
          )}

          {caseData.expectedFindings.redFlags && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Red Flags:</p>
              <div className="flex flex-wrap gap-2">
                {caseData.expectedFindings.redFlags.map((flag, idx) => (
                  <Badge key={idx} variant="destructive" className="text-xs py-1 px-2">{flag}</Badge>
                ))}
              </div>
            </div>
          )}

          {caseData.expectedFindings.mostLikelyDiagnosis && (
            <div className="mt-5 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium mb-1">Most Likely Diagnosis:</p>
              <p className="text-xl font-semibold text-primary">{caseData.expectedFindings.mostLikelyDiagnosis}</p>
            </div>
          )}
        </div>
      )}

      {/* Teaching Points */}
      {caseData.teachingPoints && caseData.teachingPoints.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5" />
            Teaching Points
          </h3>
          <ul className="space-y-3">
            {caseData.teachingPoints.slice(0, 6).map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5 font-bold">•</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ManagementView;