import { useState, useEffect, useCallback } from 'react';
import type { VitalSigns, AppliedTreatment } from '@/types';
import { applyDeterioration, determineSeverity, type CaseSeverity } from '@/data/deteriorationSystem';
import type { CaseCategory } from '@/types';

interface SimulationTimerResult {
  deteriorationSeverity: CaseSeverity;
  deteriorationMinutes: number;
  setDeteriorationSeverity: React.Dispatch<React.SetStateAction<CaseSeverity>>;
  setDeteriorationMinutes: React.Dispatch<React.SetStateAction<number>>;
  resetDeterioration: (category: CaseCategory, initialVitals: VitalSigns) => void;
}

/**
 * Manages the deterioration simulation timer that applies vital decay
 * every 30 seconds based on case severity.
 */
export function useSimulationTimer(
  currentCase: { category: CaseCategory } | null,
  currentVitals: VitalSigns | null,
  appliedTreatments: AppliedTreatment[],
  onVitalsChange: (newVitals: VitalSigns) => void,
  onCritical: (changes: string[]) => void,
): SimulationTimerResult {
  const [deteriorationSeverity, setDeteriorationSeverity] = useState<CaseSeverity>('stable');
  const [deteriorationMinutes, setDeteriorationMinutes] = useState(0);

  useEffect(() => {
    if (!currentCase || !currentVitals) return;

    const interval = setInterval(() => {
      setDeteriorationMinutes(prev => {
        const newMinutes = prev + 0.5; // 30 seconds = 0.5 minutes
        const treatmentNames = appliedTreatments.map(t => t.description);
        const result = applyDeterioration(currentVitals, deteriorationSeverity, 0.5, treatmentNames);

        if (result.changes.length > 0) {
          onVitalsChange(result.newVitals);

          if (result.isCritical) {
            onCritical(result.changes);
          }
        }

        return newMinutes;
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [currentCase, currentVitals, deteriorationSeverity, appliedTreatments, onVitalsChange, onCritical]);

  const resetDeterioration = useCallback((category: CaseCategory, initialVitals: VitalSigns) => {
    const severity = determineSeverity(category, initialVitals);
    setDeteriorationSeverity(severity);
    setDeteriorationMinutes(0);
  }, []);

  return {
    deteriorationSeverity,
    deteriorationMinutes,
    setDeteriorationSeverity,
    setDeteriorationMinutes,
    resetDeterioration,
  };
}

export { getDeteriorationStatus, determineSeverity } from '@/data/deteriorationSystem';
