/**
 * DebriefingResourcesPanel
 *
 * Displays categorized study resources in the debriefing/summary view.
 * Resources are grouped by type (Articles, Videos, Guidelines, Imaging)
 * with source attribution and relevance indicators.
 *
 * Used in SessionSummary and exported to PDF.
 */

import { useMemo } from 'react';
import type { CaseScenario, SimulationObjective, DebriefingResource } from '@/types';
import { getResourcesForDebriefing } from '@/data/diversifiedResources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, ExternalLink, FileText, Video, BookMarked,
  Image as ImageIcon, Headphones, Star, Sparkles
} from 'lucide-react';

interface DebriefingResourcesPanelProps {
  caseData: CaseScenario;
  objective?: SimulationObjective;
  resources?: DebriefingResource[];
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  guideline: <BookMarked className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  'case-study': <BookOpen className="w-4 h-4" />,
  podcast: <Headphones className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  article: 'text-blue-600',
  video: 'text-red-600',
  guideline: 'text-green-600',
  image: 'text-cyan-600',
  'case-study': 'text-purple-600',
  podcast: 'text-orange-600',
};

const RELEVANCE_STYLES: Record<string, { label: string; color: string }> = {
  essential: { label: 'Essential', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  important: { label: 'Important', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  supplementary: { label: 'Further Reading', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const SOURCE_COLORS: Record<string, string> = {
  'NICE': 'bg-blue-50 text-blue-700 border-blue-200',
  'Resuscitation Council UK': 'bg-red-50 text-red-700 border-red-200',
  'EMDocs': 'bg-green-50 text-green-700 border-green-200',
  'REBEL EM': 'bg-purple-50 text-purple-700 border-purple-200',
  'EMCrit': 'bg-orange-50 text-orange-700 border-orange-200',
  'Radiopaedia': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'LITFL': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'ALiEM': 'bg-pink-50 text-pink-700 border-pink-200',
  'EM Cases': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'WHO': 'bg-sky-50 text-sky-700 border-sky-200',
  'DermNet NZ': 'bg-teal-50 text-teal-700 border-teal-200',
  'Medscape': 'bg-slate-50 text-slate-700 border-slate-200',
  'JRCALC': 'bg-amber-50 text-amber-700 border-amber-200',
};

export function DebriefingResourcesPanel({
  caseData,
  objective,
  resources: providedResources,
}: DebriefingResourcesPanelProps) {
  const resources = useMemo(() => {
    if (providedResources && providedResources.length > 0) return providedResources;
    return getResourcesForDebriefing(caseData, objective || undefined);
  }, [caseData, objective, providedResources]);

  // Group by type
  const grouped = useMemo(() => {
    const groups: Record<string, DebriefingResource[]> = {};
    for (const r of resources) {
      const key = r.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return groups;
  }, [resources]);

  const groupOrder = ['guideline', 'article', 'image', 'video', 'podcast', 'case-study'];
  const sortedGroups = groupOrder.filter(type => grouped[type]?.length > 0);

  if (resources.length === 0) return null;

  // Count unique sources
  const uniqueSources = new Set(resources.map(r => r.source));

  return (
    <Card className="card-interactive animate-fade-in-up border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          Further Study Resources
          <Badge variant="secondary" className="ml-auto text-xs">
            {resources.length} resources from {uniqueSources.size} sources
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Objective review if available */}
        {objective && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
              Simulation Objective
            </p>
            <p className="text-sm">{objective.primaryObjective}</p>
          </div>
        )}

        {/* Resource groups */}
        {sortedGroups.map(type => (
          <div key={type}>
            <div className="flex items-center gap-2 mb-2">
              <span className={TYPE_COLORS[type]}>{TYPE_ICONS[type]}</span>
              <h4 className="text-sm font-semibold capitalize">
                {type === 'case-study' ? 'Case Studies' : `${type}s`}
              </h4>
              <Badge variant="outline" className="text-[10px]">
                {grouped[type].length}
              </Badge>
            </div>
            <div className="space-y-1.5">
              {grouped[type].map(resource => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-background transition-all group"
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {resource.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {resource.relevance === 'essential' && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${SOURCE_COLORS[resource.source] || 'bg-gray-50 text-gray-700'}`}
                    >
                      {resource.source}
                    </Badge>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-muted-foreground pt-2 border-t">
          Resources sourced from reputable medical education providers including NICE, Resuscitation Council UK,
          Radiopaedia, EMDocs, REBEL EM, ALiEM, EM Cases, EMCrit, and more.
        </p>
      </CardContent>
    </Card>
  );
}

export default DebriefingResourcesPanel;
