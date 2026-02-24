import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Stethoscope, ClipboardList, ChevronLeft, ChevronRight,
  Monitor, BookOpen, Heart
} from 'lucide-react';
import type { CaseScenario, StudentYear, VitalSigns } from '@/types';
import { VitalSignsMonitor } from './VitalSignsMonitor';
import { ensureCompleteVitals } from '@/data/treatmentEffects';
import { CaseDisplay } from './CaseDisplay';

interface CaseViewContainerProps {
  caseData: CaseScenario;
  studentYear: StudentYear;
  currentVitals?: VitalSigns;
  onVitalChange?: (vitals: VitalSigns) => void;
}

type ViewTab = 'case' | 'vitals' | 'management';

export function CaseViewContainer({ 
  caseData, 
  studentYear,
  currentVitals,
  onVitalChange
}: CaseViewContainerProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('case');
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigatePrev();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const tabs: ViewTab[] = ['case', 'vitals', 'management'];

  const navigateNext = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const navigatePrev = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateNext();
    }
    if (isRightSwipe) {
      navigatePrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Management View Component
  const ManagementView = () => (
    <div className="space-y-4 animate-fade-in">
      {caseData.managementPathway && (
        <>
          {/* Prehospital Management */}
          {caseData.managementPathway.immediate && caseData.managementPathway.immediate.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Prehospital Management
              </h3>
              <ul className="space-y-2">
                {caseData.managementPathway.immediate.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-blue-800 dark:text-blue-200">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Definitive Treatment */}
          {caseData.managementPathway.definitive && caseData.managementPathway.definitive.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Definitive Treatment
              </h3>
              <ul className="space-y-2">
                {caseData.managementPathway.definitive.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-green-800 dark:text-green-200">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Monitoring */}
          {caseData.managementPathway.monitoring && caseData.managementPathway.monitoring.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Monitoring Requirements
              </h3>
              <ul className="space-y-2">
                {caseData.managementPathway.monitoring.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-purple-800 dark:text-purple-200">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transport Considerations */}
          {caseData.managementPathway.transportConsiderations && caseData.managementPathway.transportConsiderations.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Transport Considerations
              </h3>
              <ul className="space-y-2">
                {caseData.managementPathway.transportConsiderations.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-orange-800 dark:text-orange-200">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Expected Findings */}
      {caseData.expectedFindings && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Expected Clinical Findings
          </h3>
          
          {caseData.expectedFindings.keyObservations && (
            <div className="mb-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">Key Observations:</p>
              <div className="flex flex-wrap gap-1">
                {caseData.expectedFindings.keyObservations.map((obs, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{obs}</Badge>
                ))}
              </div>
            </div>
          )}

          {caseData.expectedFindings.redFlags && (
            <div className="mb-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">Red Flags:</p>
              <div className="flex flex-wrap gap-1">
                {caseData.expectedFindings.redFlags.map((flag, idx) => (
                  <Badge key={idx} variant="destructive" className="text-xs">{flag}</Badge>
                ))}
              </div>
            </div>
          )}

          {caseData.expectedFindings.mostLikelyDiagnosis && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">Most Likely Diagnosis:</p>
              <p className="text-lg font-semibold text-primary">{caseData.expectedFindings.mostLikelyDiagnosis}</p>
            </div>
          )}
        </div>
      )}

      {/* Teaching Points */}
      {caseData.teachingPoints && caseData.teachingPoints.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Teaching Points
          </h3>
          <ul className="space-y-2">
            {caseData.teachingPoints.slice(0, 5).map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-4">
        <div className="flex items-center justify-between px-2 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigatePrev}
            disabled={activeTab === 'case'}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ViewTab)} className="flex-1 mx-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="case" className="gap-1 text-xs sm:text-sm">
                <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Case</span>
                <span className="sm:hidden">Case</span>
              </TabsTrigger>
              <TabsTrigger value="vitals" className="gap-1 text-xs sm:text-sm">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Vitals</span>
                <span className="sm:hidden">Vitals</span>
              </TabsTrigger>
              <TabsTrigger value="management" className="gap-1 text-xs sm:text-sm">
                <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Mngmt</span>
                <span className="sm:hidden">Mngmt</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="sm"
            onClick={navigateNext}
            disabled={activeTab === 'management'}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 pb-2">
          <div className="flex gap-1">
            {tabs.map((tab, idx) => (
              <div
                key={tab}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= tabs.indexOf(activeTab) ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Swipeable Content Area */}
      <div
        className="touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'case' && (
              <div className="space-y-4">
                <CaseDisplay caseData={caseData} studentYear={studentYear} />
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="space-y-4">
                <VitalSignsMonitor
                  initialVitals={currentVitals || ensureCompleteVitals(caseData.vitalSignsProgression.initial)}
                  deteriorationVitals={caseData.vitalSignsProgression.deterioration ? 
                    ensureCompleteVitals(caseData.vitalSignsProgression.deterioration) : undefined}
                  onVitalChange={onVitalChange}
                />
              </div>
            )}

            {activeTab === 'management' && <ManagementView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard Navigation Hint */}
      <div className="mt-4 text-center text-xs text-muted-foreground hidden sm:block">
        Use ← → arrow keys or swipe to navigate
      </div>
    </div>
  );
}

export default CaseViewContainer;