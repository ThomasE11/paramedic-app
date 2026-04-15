/**
 * Onboarding Tour — First-time user walkthrough
 *
 * Shows a step-by-step modal overlay explaining the ABCDE assessment flow
 * and key simulator features. Persists dismissal to localStorage.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Shield, Stethoscope, Activity, Pill, Ambulance,
  GraduationCap, ChevronRight, ChevronLeft, X, Sparkles, Compass,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TOUR_STORAGE_KEY = 'paramedic-studio-tour-completed';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  /** Optional i18n key for the title — falls back to `title` when absent. */
  i18nKeyTitle?: string;
  /** Optional i18n key for the body — falls back to `description` when absent. */
  i18nKeyBody?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to ParaMedic Studio',
    description: 'This simulator trains you in systematic patient assessment using real clinical scenarios. Work through cases like a real paramedic — assess, treat, and transport.',
    icon: <GraduationCap className="h-8 w-8" />,
    color: 'text-blue-500',
  },
  {
    title: 'ABCDE Primary Survey',
    description: 'Start every case with a systematic ABCDE approach: Scene safety, Airway, Breathing, Circulation, Disability, Exposure. Tap each letter to perform that assessment and reveal findings.',
    icon: <Shield className="h-8 w-8" />,
    color: 'text-blue-500',
  },
  {
    title: 'TLC Monitor',
    description: 'Your defibrillator/monitor simulator. Tap vital signs to connect sensors and reveal readings. Use the parameter bar to check HR, SpO2, BP, temperature, and more — just like real equipment.',
    icon: <Activity className="h-8 w-8" />,
    color: 'text-green-500',
  },
  {
    title: 'Physical Exam & History',
    description: 'Use the 3D body model for secondary survey — tap body regions to examine. Take a SAMPLE history (Signs, Allergies, Medications, Past medical, Last meal, Events).',
    icon: <Stethoscope className="h-8 w-8" />,
    color: 'text-purple-500',
  },
  {
    // Localised at render time via i18nKeyTitle / i18nKeyBody below.
    title: 'Guided Exam Mode',
    description: 'Turn on Guided mode to assess the patient in clinically correct head-to-toe order. Out-of-sequence regions are locked until you complete the previous step.',
    i18nKeyTitle: 'guidedExam.tourTitle',
    i18nKeyBody: 'guidedExam.tourBody',
    icon: <Compass className="h-8 w-8" />,
    color: 'text-indigo-500',
  } as TourStep,
  {
    title: 'Treatments & Interventions',
    description: 'Apply treatments based on your assessment findings. Medications require IV access first. The patient responds dynamically — vitals change based on what you do (or don\'t do).',
    icon: <Pill className="h-8 w-8" />,
    color: 'text-orange-500',
  },
  {
    title: 'Transport & Debrief',
    description: 'When ready, transport your patient. You\'ll receive a detailed performance report with scoring, timing analysis, and learning resources. Good luck!',
    icon: <Ambulance className="h-8 w-8" />,
    color: 'text-amber-500',
  },
];

export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(() => {
    try {
      return !localStorage.getItem(TOUR_STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const dismissTour = useCallback(() => {
    setShowTour(false);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch { /* ignore */ }
  }, []);

  const resetTour = useCallback(() => {
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    } catch { /* ignore */ }
    setShowTour(true);
  }, []);

  return { showTour, dismissTour, resetTour };
}

interface OnboardingTourProps {
  onDismiss: () => void;
}

export function OnboardingTour({ onDismiss }: OnboardingTourProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  // Phase 2 — honour per-step i18n keys when provided; otherwise use the
  // hard-coded English copy so existing steps keep rendering verbatim.
  const localisedTitle = current.i18nKeyTitle ? t(current.i18nKeyTitle) : current.title;
  const localisedBody = current.i18nKeyBody ? t(current.i18nKeyBody) : current.description;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors z-10 touch-manipulation"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4 ${current.color}`}>
            {current.icon}
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-foreground">
            {localisedTitle}
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {localisedBody}
          </p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
                  i === step ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(s => s - 1)}
                className="gap-1 flex-1 h-10 touch-manipulation"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="flex-1 h-10 text-muted-foreground touch-manipulation"
              >
                Skip Tour
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                if (isLast) onDismiss();
                else setStep(s => s + 1);
              }}
              className="gap-1 flex-1 h-10 touch-manipulation"
            >
              {isLast ? (
                <><Sparkles className="h-4 w-4" /> Start Simulating</>
              ) : (
                <>Next <ChevronRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Step counter */}
        <div className="px-6 pb-3 text-center">
          <span className="text-[10px] text-muted-foreground">
            {step + 1} of {TOUR_STEPS.length}
          </span>
        </div>
      </div>
    </div>
  );
}
