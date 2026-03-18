/**
 * Treatment Application Panel
 * 
 * Interactive panel allowing students to browse and apply treatments
 * organized by category (Airway, Breathing, Circulation, etc.)
 * with realistic onset times and gradual vital sign changes.
 */

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Wind, Droplets, Heart, Pill, Brain, Move, ThermometerSun,
  Syringe, ChevronDown, ChevronUp, Clock, AlertTriangle,
  CheckCircle2, Loader2, Activity
} from 'lucide-react';
import {
  TREATMENTS,
  getTreatmentCategories,
  getOnsetDescription,
  type Treatment,
  type TreatmentCategory,
} from '@/data/enhancedTreatmentEffects';
import type { VitalSigns, StudentYear } from '@/types';
import { filterTreatmentsForYear } from '@/data/clinicalRealism';

// Map category to icon
const categoryIcons: Record<TreatmentCategory, React.ReactNode> = {
  airway: <Wind className="h-4 w-4" />,
  breathing: <Droplets className="h-4 w-4" />,
  circulation: <Heart className="h-4 w-4" />,
  medication: <Pill className="h-4 w-4" />,
  procedure: <Syringe className="h-4 w-4" />,
  comfort: <ThermometerSun className="h-4 w-4" />,
  positioning: <Move className="h-4 w-4" />,
  psychological: <Brain className="h-4 w-4" />,
};

// Map category to color
const categoryColors: Record<TreatmentCategory, string> = {
  airway: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  breathing: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  circulation: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  medication: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  procedure: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  comfort: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  positioning: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800',
  psychological: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
};

// Onset color
const onsetColors: Record<string, string> = {
  immediate: 'text-green-600 dark:text-green-400',
  fast: 'text-blue-600 dark:text-blue-400',
  moderate: 'text-amber-600 dark:text-amber-400',
  gradual: 'text-orange-600 dark:text-orange-400',
  delayed: 'text-red-600 dark:text-red-400',
};

interface TreatmentApplicationPanelProps {
  currentVitals: VitalSigns;
  onApplyTreatment: (treatment: Treatment) => void;
  appliedTreatmentIds: string[];
  isApplying?: boolean;
  applyingTreatmentId?: string;
  studentYear?: StudentYear;
  isStudentView?: boolean;
}

export function TreatmentApplicationPanel({
  currentVitals,
  onApplyTreatment,
  appliedTreatmentIds,
  isApplying = false,
  applyingTreatmentId,
  studentYear,
  isStudentView = false,
}: TreatmentApplicationPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<TreatmentCategory | null>('airway');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => getTreatmentCategories(), []);

  const filteredTreatments = useMemo(() => {
    // First, filter by year level
    const yearFiltered = studentYear ? filterTreatmentsForYear(TREATMENTS, studentYear) : TREATMENTS;
    // Then filter by search query
    if (!searchQuery.trim()) return yearFiltered;
    const query = searchQuery.toLowerCase();
    return yearFiltered.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }, [searchQuery, studentYear]);

  const treatmentsByCategory = useMemo(() => {
    const grouped: Record<string, Treatment[]> = {};
    filteredTreatments.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push(t);
    });
    return grouped;
  }, [filteredTreatments]);

  const toggleCategory = useCallback((cat: TreatmentCategory) => {
    setExpandedCategory(prev => prev === cat ? null : cat);
  }, []);

  const handleApply = useCallback((treatment: Treatment) => {
    onApplyTreatment(treatment);
  }, [onApplyTreatment]);

  // Check if a treatment has a relevant contraindication based on current vitals
  const hasContraindication = useCallback((treatment: Treatment): string | null => {
    if (!treatment.contraindications) return null;
    for (const contra of treatment.contraindications) {
      if (contra.includes('BP < 90')) {
        const systolic = parseInt(currentVitals.bp.split('/')[0]);
        if (systolic < 90) return contra;
      }
    }
    return null;
  }, [currentVitals]);

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <div className="p-1 sm:p-1.5 rounded-lg bg-primary/10">
            <Syringe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <span>Apply Treatment</span>
          {!isStudentView && (
            <Badge variant="secondary" className="ml-auto text-[10px] sm:text-xs">
              {filteredTreatments.length} available
            </Badge>
          )}
        </CardTitle>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
          {isStudentView
            ? 'Select a treatment to apply. Monitor the patient to observe effects.'
            : 'Select a treatment to apply. Effects will change vitals gradually based on onset time.'}
        </p>

        {/* Search */}
        <div className="mt-1.5 sm:mt-2">
          <input
            type="text"
            placeholder="Search treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[300px] sm:h-[400px]">
          <div className="p-2 sm:p-3 space-y-1">
            {categories.map(({ category, label }) => {
              const treatments = treatmentsByCategory[category];
              if (!treatments || treatments.length === 0) return null;
              const isExpanded = expandedCategory === category;

              return (
                <div key={category} className="rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`w-full flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all rounded-lg ${
                      isExpanded
                        ? `${categoryColors[category]} border`
                        : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {categoryIcons[category]}
                    <span className="flex-1 text-left">{label}</span>
                    {!isStudentView && (
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] mr-0.5 sm:mr-1">
                        {treatments.length}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* Treatment Items */}
                  {isExpanded && (
                    <div className="space-y-1.5 py-2 px-1">
                      {treatments.map((treatment) => {
                        const isApplied = appliedTreatmentIds.includes(treatment.id);
                        const isCurrentlyApplying = isApplying && applyingTreatmentId === treatment.id;
                        const contra = hasContraindication(treatment);

                        return (
                          <div
                            key={treatment.id}
                            className={`rounded-lg border p-2 sm:p-3 transition-all duration-200 ${
                              isApplied
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : contra
                                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200/50'
                                  : 'bg-card hover:bg-accent/30 hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                  <span className="font-medium text-xs sm:text-sm">{treatment.name}</span>
                                  {isApplied && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                  )}
                                  {treatment.requiresMonitoring && (
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-none">
                                  {treatment.description}
                                </p>
                                {!isStudentView && (
                                <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 flex-wrap">
                                  <span className={`text-[11px] font-medium flex items-center gap-1 ${onsetColors[treatment.onset]}`}>
                                    <Clock className="h-3 w-3" />
                                    {getOnsetDescription(treatment.onset)}
                                  </span>
                                  {treatment.effects.length > 0 && (
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                      <Activity className="h-3 w-3" />
                                      {treatment.effects.map(e => {
                                        const sign = e.changeType === 'increase' ? '+' : e.changeType === 'decrease' ? '-' : '';
                                        const vital = e.vitalSign === 'bp' ? 'BP'
                                          : e.vitalSign === 'pulse' ? 'HR'
                                          : e.vitalSign === 'respiration' ? 'RR'
                                          : e.vitalSign === 'spo2' ? 'SpO2'
                                          : e.vitalSign === 'gcs' ? 'GCS'
                                          : e.vitalSign === 'bloodGlucose' ? 'BGL'
                                          : e.vitalSign === 'temperature' ? 'Temp'
                                          : e.vitalSign;
                                        return `${vital}${sign}${e.value}`;
                                      }).join(', ')}
                                    </span>
                                  )}
                                </div>
                                )}
                                {contra && (
                                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Contraindicated: {contra}
                                  </p>
                                )}
                              </div>

                              <Button
                                size="sm"
                                variant={isApplied ? 'secondary' : contra ? 'destructive' : 'default'}
                                disabled={isCurrentlyApplying}
                                onClick={() => handleApply(treatment)}
                                className="shrink-0 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                              >
                                {isCurrentlyApplying ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    Applying
                                  </>
                                ) : isApplied ? (
                                  'Re-apply'
                                ) : (
                                  'Apply'
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default TreatmentApplicationPanel;
