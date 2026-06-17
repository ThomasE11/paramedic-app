/**
 * Treatment Application Panel
 * 
 * Interactive panel allowing students to browse and apply treatments
 * organized by category (Airway, Breathing, Circulation, etc.)
 * with realistic onset times and gradual vital sign changes.
 */

import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Wind, Droplets, Heart, Pill, Brain, Move, ThermometerSun,
  Syringe, ChevronDown, ChevronUp, Clock, AlertTriangle,
  CheckCircle2, Loader2, Activity, Search, ShieldCheck,
  TimerReset, ClipboardCheck
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
const categoryIcons: Record<TreatmentCategory, ReactNode> = {
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
  procedure: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  comfort: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  positioning: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800',
  psychological: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
};

// Onset color
const onsetColors: Record<string, string> = {
  immediate: 'text-green-600 dark:text-green-400',
  fast: 'text-blue-600 dark:text-blue-400',
  moderate: 'text-amber-600 dark:text-amber-400',
  gradual: 'text-orange-600 dark:text-orange-400',
  delayed: 'text-red-600 dark:text-red-400',
};

const compactOnsetLabels: Record<string, string> = {
  immediate: 'Immediate',
  fast: 'Fast onset',
  moderate: 'Moderate onset',
  gradual: 'Gradual onset',
  delayed: 'Delayed onset',
};

const vitalLabels: Record<string, string> = {
  bp: 'BP',
  pulse: 'HR',
  respiration: 'RR',
  spo2: 'SpO2',
  gcs: 'GCS',
  bloodGlucose: 'BGL',
  temperature: 'Temp',
};

const categoryTone: Record<TreatmentCategory, string> = {
  airway: 'from-blue-500/15 via-blue-500/5 to-transparent border-blue-200/70 dark:border-blue-800/60',
  breathing: 'from-cyan-500/15 via-cyan-500/5 to-transparent border-cyan-200/70 dark:border-cyan-800/60',
  circulation: 'from-rose-500/15 via-rose-500/5 to-transparent border-rose-200/70 dark:border-rose-800/60',
  medication: 'from-amber-500/15 via-amber-500/5 to-transparent border-amber-200/70 dark:border-amber-800/60',
  procedure: 'from-blue-500/15 via-blue-500/5 to-transparent border-blue-200/70 dark:border-blue-800/60',
  comfort: 'from-orange-500/15 via-orange-500/5 to-transparent border-orange-200/70 dark:border-orange-800/60',
  positioning: 'from-slate-500/15 via-slate-500/5 to-transparent border-slate-200/70 dark:border-slate-800/60',
  psychological: 'from-teal-500/15 via-teal-500/5 to-transparent border-teal-200/70 dark:border-teal-800/60',
};

const categoryAccent: Record<TreatmentCategory, string> = {
  airway: 'bg-blue-500',
  breathing: 'bg-cyan-500',
  circulation: 'bg-rose-500',
  medication: 'bg-amber-500',
  procedure: 'bg-blue-500',
  comfort: 'bg-orange-500',
  positioning: 'bg-slate-500',
  psychological: 'bg-teal-500',
};

const formatEffects = (treatment: Treatment) => {
  if (treatment.effects.length === 0) return 'Observe response';

  return treatment.effects.map(e => {
    const sign = e.changeType === 'increase' ? '+' : e.changeType === 'decrease' ? '-' : e.changeType === 'set' ? '→' : '';
    const vital = vitalLabels[e.vitalSign] ?? String(e.vitalSign);
    return `${vital} ${sign}${e.value}`;
  }).join(' · ');
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
  // Multiple categories can be expanded at once — previously one at a time,
  // which meant positioning (the category with Fowler's, recovery, left
  // lateral, leg elevation) was hidden behind a click. Feedback: students
  // couldn't find positioning options. Now Airway + Positioning open by
  // default so both clinical surfaces the student reaches for first are
  // visible without a click.
  const [expandedCategories, setExpandedCategories] = useState<Set<TreatmentCategory>>(
    () => new Set(['airway', 'positioning']),
  );
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

  const appliedCount = appliedTreatmentIds.length;

  const appliedByCategory = useMemo(() => {
    const counts: Partial<Record<TreatmentCategory, number>> = {};
    appliedTreatmentIds.forEach(id => {
      const treatment = TREATMENTS.find(t => t.id === id);
      if (!treatment) return;
      counts[treatment.category] = (counts[treatment.category] ?? 0) + 1;
    });
    return counts;
  }, [appliedTreatmentIds]);

  const toggleCategory = useCallback((cat: TreatmentCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
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
    <Card className="glass-panel overflow-hidden border border-primary/15 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-3 border-b border-border/70 bg-gradient-to-br from-primary/10 via-white/35 to-transparent px-3 pb-3 pt-3 dark:via-white/[0.04] sm:px-5 sm:pt-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 ring-1 ring-primary/15">
            <Syringe className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <span>Treatment Plan</span>
              {isApplying && (
                <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-[10px] text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Applying
                </Badge>
              )}
            </CardTitle>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
              {isStudentView
                ? 'Choose an intervention, then reassess the patient response.'
                : 'Interventions are grouped by clinical priority with onset, monitoring, and vital sign effects.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="glass-control rounded-lg border px-2 py-1.5">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <ClipboardCheck className="h-3 w-3" />
              Given
            </div>
            <div className="text-sm font-semibold">{appliedCount}</div>
          </div>
          <div className="glass-control rounded-lg border px-2 py-1.5">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Activity className="h-3 w-3" />
              Visible
            </div>
            <div className="text-sm font-semibold">{filteredTreatments.length}</div>
          </div>
          <div className="glass-control rounded-lg border px-2 py-1.5">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              Scope
            </div>
            <div className="truncate text-sm font-semibold">{studentYear ?? 'All'}</div>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search oxygen, aspirin, positioning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-control h-9 w-full rounded-xl border pl-8 pr-3 text-xs shadow-inner shadow-muted/20 outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/15 sm:text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[340px] sm:h-[440px]">
          <div className="space-y-2 p-2 sm:p-3">
            {categories.map(({ category, label }) => {
              const treatments = treatmentsByCategory[category];
              if (!treatments || treatments.length === 0) return null;
              const isExpanded = expandedCategories.has(category);
              const categoryAppliedCount = appliedByCategory[category] ?? 0;

              return (
                <section
                  key={category}
                  className={cn(
                    'overflow-hidden rounded-xl border bg-gradient-to-r transition-all',
                    isExpanded ? categoryTone[category] : 'border-border/70 from-muted/35 to-background',
                  )}
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs transition hover:bg-white/45 dark:hover:bg-white/[0.08] sm:text-sm"
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm', categoryAccent[category])}>
                      {categoryIcons[category]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{label}</span>
                      <span className="block text-[10px] text-muted-foreground sm:text-[11px]">
                        {treatments.length} option{treatments.length === 1 ? '' : 's'}
                        {categoryAppliedCount > 0 ? ` · ${categoryAppliedCount} given` : ''}
                      </span>
                    </span>
                    {!isStudentView && (
                      <Badge variant="outline" className={cn('hidden border bg-white/55 text-[10px] dark:bg-white/[0.05] sm:inline-flex', categoryColors[category])}>
                        {categoryAppliedCount > 0 ? `${categoryAppliedCount}/${treatments.length}` : treatments.length}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="grid gap-2 border-t border-border/60 bg-white/35 p-2 dark:bg-white/[0.04]">
                      {treatments.map((treatment) => {
                        const isApplied = appliedTreatmentIds.includes(treatment.id);
                        const isCurrentlyApplying = isApplying && applyingTreatmentId === treatment.id;
                        const contra = hasContraindication(treatment);

                        return (
                          <div
                            key={treatment.id}
                            className={cn(
                              'group relative overflow-hidden rounded-xl border bg-white/65 p-3 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.05]',
                              isApplied && 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20',
                              isCurrentlyApplying && 'border-blue-300 bg-blue-50/60 ring-2 ring-blue-200/60 dark:border-blue-800 dark:bg-blue-950/20 dark:ring-blue-900/50',
                              contra && !isApplied && 'border-red-200 bg-red-50/50 dark:border-red-900/70 dark:bg-red-950/20',
                            )}
                          >
                            <div className={cn('absolute inset-y-0 left-0 w-1', isApplied ? 'bg-emerald-500' : contra ? 'bg-red-500' : categoryAccent[category])} />
                            <div className="flex items-start gap-3 pl-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-semibold leading-snug text-xs sm:text-sm">{treatment.name}</span>
                                  {isCurrentlyApplying && (
                                    <Badge className="gap-1 bg-blue-600 text-[10px] text-white hover:bg-blue-600">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      In progress
                                    </Badge>
                                  )}
                                  {isApplied && (
                                    <Badge className="gap-1 bg-emerald-600 text-[10px] text-white hover:bg-emerald-600">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Given
                                    </Badge>
                                  )}
                                  {treatment.requiresMonitoring && (
                                    <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-[10px] text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                                      <AlertTriangle className="h-3 w-3" />
                                      Monitor
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                                  {treatment.description}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  <span className={cn('inline-flex items-center gap-1 rounded-full border bg-white/55 px-2 py-1 text-[10px] font-medium dark:bg-white/[0.05]', onsetColors[treatment.onset])}>
                                    <Clock className="h-3 w-3" />
                                    {compactOnsetLabels[treatment.onset] ?? getOnsetDescription(treatment.onset)}
                                  </span>
                                  {!isStudentView && (
                                    <>
                                      <span className="inline-flex items-center gap-1 rounded-full border bg-white/55 px-2 py-1 text-[10px] text-muted-foreground dark:bg-white/[0.05]">
                                        <TimerReset className="h-3 w-3" />
                                        Full effect {treatment.durationSeconds}s
                                      </span>
                                      <span className="inline-flex max-w-full items-center gap-1 rounded-full border bg-white/55 px-2 py-1 text-[10px] text-muted-foreground dark:bg-white/[0.05]">
                                        <Activity className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{formatEffects(treatment)}</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                                {contra && (
                                  <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-100/60 px-2 py-1.5 text-[11px] text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
                                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                                    <span><span className="font-semibold">Contraindication:</span> {contra}</span>
                                  </div>
                                )}
                              </div>

                              <Button
                                size="sm"
                                variant={isApplied ? 'secondary' : contra ? 'destructive' : 'default'}
                                disabled={isCurrentlyApplying}
                                onClick={() => handleApply(treatment)}
                                className={cn(
                                  'h-8 shrink-0 rounded-lg px-2.5 text-[10px] font-semibold sm:px-3 sm:text-xs',
                                  isApplied && 'border border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
                                )}
                              >
                                {isCurrentlyApplying ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    Applying
                                  </>
                                ) : isApplied ? (
                                  'Repeat'
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
                </section>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default TreatmentApplicationPanel;
