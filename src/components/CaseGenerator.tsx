import { useState, useMemo } from 'react';
import type { StudentYear } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  Heart,
  Wind,
  Activity,
  Brain,
  Thermometer,
  AlertCircle,
  AlertTriangle,
  Clock,
  Baby,
  Users,
  Sparkles,
  ChevronRight,
  Github
} from 'lucide-react';

interface CaseGeneratorProps {
  onGenerate: (year: StudentYear, category?: string, subcategory?: string) => void;
}

// Main categories with subcategories
const categoryStructure = [
  {
    value: 'cardiac',
    label: 'Cardiac',
    icon: Heart,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    subcategories: [
      { value: 'stem-anterior', label: 'Anterior STEMI' },
      { value: 'stem-inferior', label: 'Inferior STEMI' },
      { value: 'stem-lateral', label: 'Lateral STEMI' },
      { value: 'cardiac-arrest', label: 'Cardiac Arrest' },
      { value: 'arrhythmia', label: 'Arrhythmias' }
    ]
  },
  {
    value: 'cardiac-ecg',
    label: 'Cardiac ECG',
    icon: Activity,
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/30',
    subcategories: [
      { value: 'wellens', label: 'Wellens Syndrome' },
      { value: 'brugada', label: 'Brugada Pattern' },
      { value: 'lbbb', label: 'LBBB' }
    ]
  },
  {
    value: 'thoracic',
    label: 'Thoracic/Critical',
    icon: Activity, // Using Activity instead of Lungs
    color: 'text-rose-600',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    subcategories: [
      { value: 'cardiac-tamponade', label: 'Cardiac Tamponade' },
      { value: 'tension-pneumothorax', label: 'Tension Pneumothorax' },
      { value: 'hemothorax', label: 'Massive Hemothorax' },
      { value: 'flail-chest', label: 'Flail Chest' }
    ]
  },
  {
    value: 'respiratory',
    label: 'Respiratory',
    icon: Wind,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    subcategories: [
      { value: 'asthma', label: 'Asthma' },
      { value: 'copd', label: 'COPD' },
      { value: 'pneumonia', label: 'Pneumonia' },
      { value: 'pe', label: 'Pulmonary Embolism' }
    ]
  },
  {
    value: 'trauma',
    label: 'Trauma',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    subcategories: [
      { value: 'head-injury', label: 'Head Injury' },
      { value: 'spinal', label: 'Spinal Injury' },
      { value: 'pelvic', label: 'Pelvic Fracture' },
      { value: 'multi-trauma', label: 'Polytrauma' }
    ]
  },
  {
    value: 'neurological',
    label: 'Neurological',
    icon: Brain,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    subcategories: [
      { value: 'stroke', label: 'Stroke' },
      { value: 'seizure', label: 'Seizure' },
      { value: 'tbi', label: 'TBI' },
      { value: 'syncope', label: 'Syncope' }
    ]
  },
  {
    value: 'metabolic',
    label: 'Metabolic',
    icon: Thermometer,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30',
    subcategories: [
      { value: 'dka', label: 'DKA' },
      { value: 'hypoglycemia', label: 'Hypoglycemia' },
      { value: 'hyperkalemia', label: 'Hyperkalemia' }
    ]
  },
  {
    value: 'toxicology',
    label: 'Toxicology',
    icon: Github, // Using Github as a placeholder for Flask
    color: 'text-violet-500',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    subcategories: [
      { value: 'overdose', label: 'Overdose' },
      { value: 'poisoning', label: 'Poisoning' },
      { value: 'withdrawal', label: 'Withdrawal' }
    ]
  },
  {
    value: 'pediatric',
    label: 'Pediatric',
    icon: Baby,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  {
    value: 'obstetrics-gynecology',
    label: 'OB/GYN',
    icon: Heart, // Using Heart instead of Baby
    color: 'text-pink-500',
    bg: 'bg-pink-100 dark:bg-pink-900/30'
  },
  {
    value: 'environmental',
    label: 'Environmental',
    icon: Thermometer,
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/30'
  },
  {
    value: 'psychiatric',
    label: 'Psychiatric',
    icon: AlertCircle,
    color: 'text-pink-500',
    bg: 'bg-pink-100 dark:bg-pink-900/30'
  },
  {
    value: 'multiple-patients',
    label: 'MCI/Multiple',
    icon: Users,
    color: 'text-slate-500',
    bg: 'bg-slate-100 dark:bg-slate-900/30'
  }
];

// Cohort order — Diploma first (most common UAE paramedic cohort),
// then the four-year degree pathway in ascending order.
const yearLevels: { value: StudentYear; label: string }[] = [
  { value: 'diploma', label: 'Diploma' },
  { value: '1st-year', label: '1st Year' },
  { value: '2nd-year', label: '2nd Year' },
  { value: '3rd-year', label: '3rd Year' },
  { value: '4th-year', label: '4th Year (Final)' },
];

export function CaseGenerator({ onGenerate }: CaseGeneratorProps) {
  const [selectedYear, setSelectedYear] = useState<StudentYear>('3rd-year');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Get current category structure
  const currentCategory = useMemo(() => {
    return categoryStructure.find(cat => cat.value === selectedCategory);
  }, [selectedCategory]);

  // Handle category selection with subcategory expansion
  const handleCategoryClick = (categoryValue: string) => {
    if (selectedCategory === categoryValue) {
      // Toggle subcategory expansion
      setExpandedCategory(expandedCategory === categoryValue ? null : categoryValue);
    } else {
      // Select new category
      setSelectedCategory(categoryValue);
      setSelectedSubcategory('');
      setExpandedCategory(categoryValue);
    }
  };

  const handleSubcategoryClick = (subcategoryValue: string) => {
    setSelectedSubcategory(subcategoryValue);
  };

  const handleGenerate = () => {
    onGenerate(selectedYear, selectedCategory || undefined, selectedSubcategory || undefined);
  };

  const clearSelections = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setExpandedCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Year Level</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Year-level tiles — aligned with design-system button style:
              rounded-2xl (18px), single-weight border, subtle shadow on
              hover, selected state uses a ring + bg wash rather than a
              thick border that jumps the layout. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {yearLevels.map((year) => {
              const active = selectedYear === year.value;
              return (
                <button
                  key={year.value}
                  onClick={() => setSelectedYear(year.value)}
                  className={`group relative rounded-2xl border p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    active
                      ? 'border-primary/60 bg-primary/5 ring-2 ring-primary/10 shadow-sm'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <Clock className={`mx-auto mb-2 h-5 w-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`} />
                  <span className={`text-sm font-medium tracking-tight ${active ? 'text-primary' : 'text-foreground/80'}`}>
                    {year.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Selection with Subcategories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Category (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* All Categories */}
            <button
              onClick={() => {
                clearSelections();
              }}
              className={`group rounded-2xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                selectedCategory === ''
                  ? 'border-primary/60 bg-primary/5 ring-2 ring-primary/10 shadow-sm'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <Stethoscope className={`mx-auto mb-1 h-5 w-5 transition-colors ${selectedCategory === '' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`} />
              <span className={`text-xs font-medium tracking-tight ${selectedCategory === '' ? 'text-primary' : 'text-foreground/80'}`}>
                All Categories
              </span>
            </button>

            {/* Main Categories */}
            {categoryStructure.map((cat) => {
              const Icon = cat.icon;
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
              const isSelected = selectedCategory === cat.value;
              const isExpanded = expandedCategory === cat.value;

              return (
                <div key={cat.value} className="relative">
                  <button
                    onClick={() => handleCategoryClick(cat.value)}
                    className={`group w-full rounded-2xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? 'border-primary/60 bg-primary/5 ring-2 ring-primary/10 shadow-sm'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Icon className={`h-4 w-4 transition-colors ${isSelected ? 'text-primary' : cat.color}`} />
                      <span className={`text-xs font-medium tracking-tight ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>
                        {cat.label}
                      </span>
                      {hasSubcategories && (
                        <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      )}
                    </div>
                  </button>

                  {/* Subcategory Dropdown */}
                  {hasSubcategories && isExpanded && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border bg-background shadow-lg">
                      <div className="max-h-48 overflow-y-auto p-1">
                        {cat.subcategories!.map((sub) => (
                          <button
                            key={sub.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubcategoryClick(sub.value);
                            }}
                            className={`w-full rounded px-3 py-2 text-left text-xs transition-colors hover:bg-muted ${
                              selectedSubcategory === sub.value ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Subcategory Display */}
          {selectedSubcategory && currentCategory && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <Badge variant="secondary" className="text-xs">
                {currentCategory.label}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="default" className="text-xs">
                {currentCategory.subcategories?.find(s => s.value === selectedSubcategory)?.label}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button onClick={handleGenerate} size="lg" className="w-full gap-2">
        <Stethoscope className="h-5 w-5" />
        Generate Case
      </Button>

      {/* Selected Options Summary */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="outline" className="text-sm">
          Year: {yearLevels.find(y => y.value === selectedYear)?.label}
        </Badge>
        {selectedCategory && !selectedSubcategory && (
          <Badge variant="outline" className="text-sm">
            Category: {categoryStructure.find(c => c.value === selectedCategory)?.label}
          </Badge>
        )}
        {selectedSubcategory && currentCategory && (
          <Badge variant="outline" className="text-sm">
            {currentCategory.label}: {currentCategory.subcategories?.find(s => s.value === selectedSubcategory)?.label}
          </Badge>
        )}
      </div>

      {/* Quick Topic Filters */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Quick Focus Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory('thoracic');
                setSelectedSubcategory('cardiac-tamponade');
                setExpandedCategory('thoracic');
              }}
              className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400"
            >
              Cardiac Tamponade
            </button>
            <button
              onClick={() => {
                setSelectedCategory('thoracic');
                setSelectedSubcategory('tension-pneumothorax');
                setExpandedCategory('thoracic');
              }}
              className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400"
            >
              Tension Pneumothorax
            </button>
            <button
              onClick={() => {
                setSelectedCategory('cardiac-ecg');
                setExpandedCategory('cardiac-ecg');
              }}
              className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
            >
              ECG Cases
            </button>
            <button
              onClick={() => {
                setSelectedCategory('thoracic');
                setSelectedSubcategory('hemothorax');
                setExpandedCategory('thoracic');
              }}
              className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400"
            >
              Hemothorax
            </button>
            <button
              onClick={() => {
                setSelectedCategory('cardiac-ecg');
                setSelectedSubcategory('wellens');
                setExpandedCategory('cardiac-ecg');
              }}
              className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
            >
              Wellens Syndrome
            </button>
            <button
              onClick={() => {
                setSelectedCategory('trauma');
                setExpandedCategory('trauma');
              }}
              className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
            >
              Multi-Trauma
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
