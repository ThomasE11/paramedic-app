import { useCallback } from 'react';
import { FileText, Activity, BookOpen, GraduationCap } from 'lucide-react';

export type GlassLayer = 'prebriefing' | 'case' | 'vitals' | 'summary';

interface GlassNavigationProps {
  activeLayer: GlassLayer;
  onLayerChange: (layer: GlassLayer) => void;
  showPreBriefing?: boolean;
  children: {
    prebriefing?: React.ReactNode;
    case: React.ReactNode;
    vitals: React.ReactNode;
    summary: React.ReactNode;
  };
}

export function GlassNavigation({ activeLayer, onLayerChange, showPreBriefing = false, children }: GlassNavigationProps) {
  const handleLayerChange = useCallback((newLayer: GlassLayer) => {
    if (newLayer === activeLayer) return;
    onLayerChange(newLayer);
    // Scroll to top when switching layers
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeLayer, onLayerChange]);

  // Build layers dynamically based on whether pre-briefing is active
  const layers: { id: GlassLayer; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    ...(showPreBriefing ? [{
      id: 'prebriefing' as GlassLayer,
      label: 'Pre-Briefing',
      shortLabel: 'Brief',
      icon: <GraduationCap className="h-4 w-4" />,
    }] : []),
    { id: 'case', label: 'Case Details', shortLabel: 'Case', icon: <FileText className="h-4 w-4" /> },
    { id: 'vitals', label: 'Vitals & Treatment', shortLabel: 'Vitals', icon: <Activity className="h-4 w-4" /> },
    { id: 'summary', label: 'Debriefing', shortLabel: 'Debrief', icon: <BookOpen className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Navigation Tabs */}
      <div className="sticky top-[56px] sm:top-[73px] z-40 -mx-4 px-4 py-1.5 sm:py-2 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => handleLayerChange(layer.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeLayer === layer.id
                  ? 'bg-background text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              {layer.icon}
              <span className="hidden sm:inline">{layer.label}</span>
              <span className="sm:hidden">{layer.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Layer Content */}
      <div className="min-h-[50vh]">
        {activeLayer === 'prebriefing' && children.prebriefing}
        {activeLayer === 'case' && children.case}
        {activeLayer === 'vitals' && children.vitals}
        {activeLayer === 'summary' && children.summary}
      </div>
    </div>
  );
}

export default GlassNavigation;
