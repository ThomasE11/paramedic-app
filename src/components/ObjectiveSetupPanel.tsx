/**
 * ObjectiveSetupPanel
 *
 * INACSL-aligned simulation objective setup.
 * Allows instructors to define learning objectives before case generation.
 *
 * Flow:
 * 1. "What is your simulation objective?" with suggestions
 * 2. "What skills are you trying to teach?" multi-select
 * 3. Generate case filtered by objective
 */

import { useState, useMemo, useCallback } from 'react';
import type { SimulationObjective, CaseCategory } from '@/types';
import { predefinedObjectives, searchObjectives, getObjectivesForCategory } from '@/data/simulationObjectives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Target, BookOpen, Lightbulb, ChevronRight, Search,
  Brain, Heart, Wind, Bone, Stethoscope, X, Sparkles
} from 'lucide-react';

interface ObjectiveSetupPanelProps {
  selectedYear: string;
  selectedCategory: string;
  onObjectiveSet: (objective: SimulationObjective) => void;
  onSkip: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  cardiac: <Heart className="w-4 h-4" />,
  respiratory: <Wind className="w-4 h-4" />,
  trauma: <Bone className="w-4 h-4" />,
  neurological: <Brain className="w-4 h-4" />,
  metabolic: <Stethoscope className="w-4 h-4" />,
};

const DOMAIN_LABELS: Record<string, { label: string; color: string }> = {
  cognitive: { label: 'Knowledge', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  psychomotor: { label: 'Skills', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  affective: { label: 'Attitude', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

export function ObjectiveSetupPanel({
  selectedCategory,
  onObjectiveSet,
  onSkip,
}: ObjectiveSetupPanelProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObjective, setSelectedObjective] = useState<SimulationObjective | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Get suggestions based on category and search
  const suggestions = useMemo(() => {
    if (searchQuery.length > 1) {
      return searchObjectives(searchQuery);
    }
    if (selectedCategory && selectedCategory !== 'all') {
      return getObjectivesForCategory(selectedCategory as CaseCategory);
    }
    return predefinedObjectives;
  }, [searchQuery, selectedCategory]);

  const handleSelectObjective = useCallback((objective: SimulationObjective) => {
    setSelectedObjective(objective);
    setSelectedSkills([...objective.skillsFocus]);
    setStep(2);
  }, []);

  const toggleSkill = useCallback((skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedObjective) return;
    const finalObjective: SimulationObjective = {
      ...selectedObjective,
      skillsFocus: selectedSkills,
    };
    onObjectiveSet(finalObjective);
  }, [selectedObjective, selectedSkills, onObjectiveSet]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Guided Simulation Setup</h2>
              <p className="text-sm text-muted-foreground">
                INACSL Standards-aligned objective-driven simulation design
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {step === 1 && (
        <>
          {/* Step 1: Select Objective */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Step 1: What is your simulation objective?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search objectives (e.g., hypoglycaemia, airway, TBI)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Objective list */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {suggestions.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => handleSelectObjective(obj)}
                    className="w-full text-left p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {CATEGORY_ICONS[obj.relatedCategories[0]] || <Stethoscope className="w-4 h-4" />}
                          <span className="font-medium text-sm">{obj.primaryObjective}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge className={DOMAIN_LABELS[obj.learningDomain]?.color || ''} variant="outline">
                            {DOMAIN_LABELS[obj.learningDomain]?.label}
                          </Badge>
                          {obj.relatedCategories.map(cat => (
                            <Badge key={cat} variant="secondary" className="text-[10px]">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {obj.skillsFocus.slice(0, 3).map(skill => (
                            <span key={skill} className="text-xs text-muted-foreground">
                              {skill}
                              {obj.skillsFocus.indexOf(skill) < 2 && obj.skillsFocus.length > 1 ? ' · ' : ''}
                            </span>
                          ))}
                          {obj.skillsFocus.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{obj.skillsFocus.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </button>
                ))}

                {suggestions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No matching objectives found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {step === 2 && selectedObjective && (
        <>
          {/* Step 2: Skills Focus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Step 2: What skills are you teaching?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected objective summary */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{selectedObjective.primaryObjective}</span>
                </div>
                <button
                  onClick={() => { setStep(1); setSelectedObjective(null); }}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  ← Change objective
                </button>
              </div>

              {/* Skills selection */}
              <p className="text-sm text-muted-foreground">
                Select the skills you want students to practise. These will guide case selection and debriefing focus.
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedObjective.skillsFocus.map(skill => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      {isSelected && <span className="mr-1">✓</span>}
                      {skill}
                    </button>
                  );
                })}
              </div>

              {selectedSkills.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Select at least one skill focus
                </p>
              )}
            </CardContent>
          </Card>

          {/* Confirm */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setStep(1); setSelectedObjective(null); }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedSkills.length === 0}
              className="flex-1 btn-glow bg-gradient-to-r from-primary to-primary/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Guided Case
            </Button>
          </div>
        </>
      )}

      {/* Skip option */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip guided setup → Generate random case
        </button>
      </div>
    </div>
  );
}

export default ObjectiveSetupPanel;
