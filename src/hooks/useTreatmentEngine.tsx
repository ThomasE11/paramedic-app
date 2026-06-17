import { useState, useCallback, useMemo } from 'react';
import type { VitalSigns, CaseScenario, CaseSession, AppliedTreatment } from '@/types';
import { applyTreatmentEffectEnhanced } from '@/data/treatmentEffects';
import { applyTreatmentEffectGradual, type Treatment } from '@/data/enhancedTreatmentEffects';
import { useGradualVitalChanges } from '@/hooks/useGradualVitalChanges';
import { toast } from 'sonner';
import { CheckCircle2, Activity } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'assessment' | 'intervention' | 'decision' | 'finding' | 'milestone';
  title: string;
  time?: string;
  description: string;
  tags?: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }[];
}

interface TreatmentEngineResult {
  applyingTreatmentId: string | undefined;
  appliedTreatmentIds: string[];
  appliedTreatments: AppliedTreatment[];
  setAppliedTreatments: React.Dispatch<React.SetStateAction<AppliedTreatment[]>>;
  setApplyingTreatmentId: React.Dispatch<React.SetStateAction<string | undefined>>;
  toggleChecklistItem: (itemId: string, checked: boolean) => void;
  applyEnhancedTreatment: (treatment: Treatment) => void;
  clearTreatments: () => void;
  animatedVitals: VitalSigns | null;
  isVitalsAnimating: boolean;
  vitalChangeProgress: number;
}

/**
 * Extracted treatment logic from App.tsx.
 * Manages checklist toggling, treatment application, and vital sign animations.
 */
export function useTreatmentEngine(
  currentCase: CaseScenario | null,
  currentVitals: VitalSigns | null,
  session: CaseSession | null,
  setSession: React.Dispatch<React.SetStateAction<CaseSession | null>>,
  onVitalsChange: (vitals: VitalSigns) => void,
  onVitalsHistory: (vitals: VitalSigns) => void,
  onPreviousVitals: (vitals: VitalSigns) => void,
  appliedTreatments: AppliedTreatment[],
  setAppliedTreatments: React.Dispatch<React.SetStateAction<AppliedTreatment[]>>,
  onAddTimelineEvent?: (event: TimelineEvent) => void,
): TreatmentEngineResult {
  const [applyingTreatmentId, setApplyingTreatmentId] = useState<string | undefined>();
  const appliedTreatmentIds = useMemo(
    () => appliedTreatments.map(treatment => treatment.id),
    [appliedTreatments],
  );

  // Gradual vital animation
  const {
    currentVitals: animatedVitals,
    isAnimating: isVitalsAnimating,
    progress: vitalChangeProgress,
    startGradualChange,
  } = useGradualVitalChanges();

  // Toggle checklist item with treatment effects
  const toggleChecklistItem = useCallback((itemId: string, checked: boolean) => {
    if (!session || !currentCase) return;

    const newCompletedItems = checked
      ? [...session.completedItems, itemId]
      : session.completedItems.filter(id => id !== itemId);

    const caseChecklist = currentCase.studentChecklist;
    const newScore = newCompletedItems.reduce((sum, id) => {
      const item = caseChecklist?.find(i => i.id === id);
      return sum + (item?.points || 0);
    }, 0);

    setSession(prev => prev ? {
      ...prev,
      completedItems: newCompletedItems,
      score: newScore,
    } : null);

    if (checked) {
      const item = caseChecklist?.find(i => i.id === itemId);
      if (item?.critical) {
        toast.success('Critical action completed!', {
          description: item.description,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
      }

      // Apply specific treatment effects to vitals with gradual animation
      if (currentVitals && item) {
        const { vitals: targetVitals, improvements, hasImprovement } = applyTreatmentEffectEnhanced(
          item.description,
          currentVitals,
          currentCase.category
        );

        if (hasImprovement && improvements.length > 0) {
          const newTreatment: AppliedTreatment = {
            id: item.id,
            description: item.description,
            appliedAt: new Date().toISOString(),
            effects: improvements.map(imp => {
              const match = imp.match(/(.+?)\s+(.+?)\s*→\s*(.+)/);
              if (match) {
                return { vitalSign: match[1].trim(), oldValue: match[2].trim(), newValue: match[3].trim(), unit: '' };
              }
              return { vitalSign: imp, oldValue: '', newValue: '', unit: '' };
            }),
            category: item.category,
            isActive: true,
          };

          setAppliedTreatments(prev => [...prev, newTreatment]);
          onAddTimelineEvent?.({
            id: `treatment-${item.id}-${Date.now()}`,
            type: 'intervention',
            title: item.description,
            description: improvements.join(', '),
            tags: [{ label: 'Treatment', variant: 'success' }],
          });
          onPreviousVitals(currentVitals);

          const animationDuration = improvements.length > 2 ? 5000 : 3000;
          startGradualChange(
            currentVitals,
            targetVitals,
            animationDuration,
            (updatedVitals) => onVitalsChange(updatedVitals),
            () => {
              onVitalsHistory(targetVitals);
              toast.success('Treatment complete!', {
                description: `${item.description} - Vitals stabilized`,
                icon: <Activity className="h-4 w-4 text-green-500" />,
              });
            },
          );
        }
      }
    }
  }, [session, currentCase, currentVitals, setSession, setAppliedTreatments, onAddTimelineEvent, onVitalsChange, onVitalsHistory, onPreviousVitals, startGradualChange]);

  // Apply enhanced treatment from the Treatment Application Panel
  const applyEnhancedTreatment = useCallback((treatment: Treatment) => {
    if (!currentVitals || !currentCase) return;

    setApplyingTreatmentId(treatment.id);

    const { vitals: targetVitals, hasChanges, changes } = applyTreatmentEffectGradual(
      treatment,
      currentVitals,
      1.0,
    );

    if (hasChanges) {
      const newTreatment: AppliedTreatment = {
        id: treatment.id,
        name: treatment.name,
        description: treatment.name,
        appliedAt: new Date().toISOString(),
        effects: changes.map(change => ({
          vitalSign: change,
          oldValue: '',
          newValue: change,
          unit: '',
        })),
        category: treatment.category,
        isActive: true,
      };

      setAppliedTreatments(prev => [...prev, newTreatment]);
      onAddTimelineEvent?.({
        id: `treatment-${treatment.id}-${Date.now()}`,
        type: 'intervention',
        title: treatment.name,
        description: changes.join(', '),
        tags: [{ label: 'Treatment', variant: 'success' }],
      });
      onPreviousVitals(currentVitals);

      const durations: Record<string, number> = {
        immediate: 1000,
        fast: 2000,
        moderate: 4000,
        gradual: 6000,
        delayed: 8000,
      };
      const animDuration = durations[treatment.onset] || 3000;

      startGradualChange(
        currentVitals,
        targetVitals,
        animDuration,
        (updatedVitals) => onVitalsChange(updatedVitals),
        () => {
          onVitalsHistory(targetVitals);
          setApplyingTreatmentId(undefined);
          toast.success(`${treatment.name} applied`, {
            description: changes.join(', '),
            icon: <Activity className="h-4 w-4 text-green-500" />,
          });
        },
      );
    } else {
      const newTreatment: AppliedTreatment = {
        id: treatment.id,
        name: treatment.name,
        description: treatment.name,
        appliedAt: new Date().toISOString(),
        effects: [],
        category: treatment.category,
        isActive: true,
      };
      setAppliedTreatments(prev => [...prev, newTreatment]);
      onAddTimelineEvent?.({
        id: `treatment-${treatment.id}-${Date.now()}`,
        type: 'intervention',
        title: treatment.name,
        description: 'No immediate vital sign changes',
        tags: [{ label: 'Treatment', variant: 'info' }],
      });
      setApplyingTreatmentId(undefined);
      toast.info(`${treatment.name} applied`, {
        description: 'No immediate vital sign changes',
      });
    }
  }, [currentVitals, currentCase, setAppliedTreatments, onAddTimelineEvent, onVitalsChange, onVitalsHistory, onPreviousVitals, startGradualChange]);

  const clearTreatments = useCallback(() => {
    setAppliedTreatments([]);
    setApplyingTreatmentId(undefined);
  }, [setAppliedTreatments]);

  return {
    applyingTreatmentId,
    appliedTreatmentIds,
    appliedTreatments,
    setAppliedTreatments,
    setApplyingTreatmentId,
    toggleChecklistItem,
    applyEnhancedTreatment,
    clearTreatments,
    animatedVitals,
    isVitalsAnimating,
    vitalChangeProgress,
  };
}
