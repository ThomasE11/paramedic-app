import { useCallback } from 'react';
import { FileText, Activity, BookOpen, GraduationCap } from 'lucide-react';

export type NavLayer = 'prebriefing' | 'case' | 'vitals' | 'summary';

/** @deprecated Use NavLayer instead */
export type GlassLayer = NavLayer;

interface TabNavigationProps {
  activeLayer: NavLayer;
  onLayerChange: (layer: NavLayer) => void;
  showPreBriefing?: boolean;
  children: {
    prebriefing?: React.ReactNode;
    case: React.ReactNode;
    vitals: React.ReactNode;
    summary: React.ReactNode;
  };
}

export function TabNavigation({ activeLayer, onLayerChange, showPreBriefing = false, children }: TabNavigationProps) {
  const handleLayerChange = useCallback((newLayer: NavLayer) => {
    if (newLayer === activeLayer) return;
    onLayerChange(newLayer);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeLayer, onLayerChange]);

  const layers: { id: NavLayer; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    ...(showPreBriefing ? [{
      id: 'prebriefing' as NavLayer,
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
      <div className="sticky top-[56px] sm:top-[73px] z-40 -mx-4 px-4 py-1.5 sm:py-2 bg-background border-b border-border">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => handleLayerChange(layer.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 ${
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

      {/* Layer Content */}
      <div className="min-h-[50vh]">
        {children.prebriefing && (
          <div style={{ display: activeLayer === 'prebriefing' ? 'block' : 'none' }}>
            {children.prebriefing}
          </div>
        )}
        <div style={{ display: activeLayer === 'case' ? 'block' : 'none' }}>
          {children.case}
        </div>
        <div style={{ display: activeLayer === 'vitals' ? 'block' : 'none' }}>
          {children.vitals}
        </div>
        <div style={{ display: activeLayer === 'summary' ? 'block' : 'none' }}>
          {children.summary}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use TabNavigation instead */
export const GlassNavigation = TabNavigation;

export default TabNavigation;
