/**
 * ABCDE Step Navigation
 *
 * Replaces current ABCDE buttons with:
 * - Step indicators with letters
 * - Active/completed states
 * - Connecting chevrons
 * - Progress tracking
 * - Glassmorphism design
 */

import { useState, useCallback } from 'react';
import { CheckCircle2, Wind, Heart, Brain, Eye, Activity } from 'lucide-react';

interface ABCDEStep {
  id: string;
  letter: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const STEPS: ABCDEStep[] = [
  {
    id: 'airway',
    letter: 'A',
    label: 'Airway',
    description: 'Patency, obstruction, foreign body',
    icon: <Wind className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'breathing',
    letter: 'B',
    label: 'Breathing',
    description: 'Rate, effort, sounds, SpO₂',
    icon: <Activity className="w-4 h-4" />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
  {
    id: 'circulation',
    letter: 'C',
    label: 'Circulation',
    description: 'Pulse, BP, CRT, bleeding',
    icon: <Heart className="w-4 h-4" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  {
    id: 'disability',
    letter: 'D',
    label: 'Disability',
    description: 'GCS, pupils, blood glucose',
    icon: <Brain className="w-4 h-4" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'exposure',
    letter: 'E',
    label: 'Exposure',
    description: 'Temperature, skin, head-to-toe',
    icon: <Eye className="w-4 h-4" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
];

interface ABCDENavigationProps {
  activeStep?: string;
  completedSteps?: string[];
  onStepClick?: (stepId: string) => void;
}

export function ABCDENavigation({ activeStep, completedSteps = [], onStepClick }: ABCDENavigationProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const handleStepClick = useCallback((stepId: string) => {
    onStepClick?.(stepId);
  }, [onStepClick]);

  return (
    <div className="glass-strong rounded-xl p-4 border border-white/60 dark:border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Survey</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">
            {completedSteps.length}/{STEPS.length} completed
          </span>
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
              style={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const isActive = activeStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isHovered = hoveredStep === step.id;

          return (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              {/* Step button */}
              <button
                onClick={() => handleStepClick(step.id)}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? `${step.bgColor} ${step.borderColor} shadow-lg shadow-${step.color.split('-')[1]}-500/10`
                    : isCompleted
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white/40 dark:bg-white/5 border-transparent hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                {/* Letter circle */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isActive
                      ? `${step.bgColor} ${step.color} ring-2 ring-offset-1 ring-offset-background ${step.borderColor}`
                      : isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.letter
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive ? step.color : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>

                {/* Hover description */}
                {isHovered && (
                  <span className="text-[9px] text-muted-foreground/70 text-center leading-tight hidden sm:block">
                    {step.description}
                  </span>
                )}
              </button>

              {/* Chevron connector */}
              {index < STEPS.length - 1 && (
                <div className="flex-shrink-0">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`transition-colors ${
                      isCompleted && completedSteps.includes(STEPS[index + 1].id)
                        ? 'text-emerald-400'
                        : 'text-muted-foreground/30'
                    }`}
                  >
                    <path
                      d="M4 2L8 6L4 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ABCDENavigation;
