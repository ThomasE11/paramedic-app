/**
 * Clinical Timeline with Decision Points
 * 
 * Non-linear case progression showing:
 * - Assessments
 * - Interventions
 * - Decision points with multiple choice options
 * - Critical findings highlighted
 */

import { useState } from 'react';
import { GitBranch, Clock, CheckCircle2, AlertTriangle, Stethoscope, Pill, Activity } from 'lucide-react';

interface TimelineItem {
  id: string;
  type: 'assessment' | 'intervention' | 'decision' | 'finding' | 'milestone';
  title: string;
  time: string;
  description: string;
  tags?: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }[];
  options?: {
    id: string;
    label: string;
    description: string;
    isCorrect?: boolean;
  }[];
  completed?: boolean;
}

interface ClinicalTimelineProps {
  items?: TimelineItem[];
  onDecision?: (itemId: string, optionId: string) => void;
}

const typeIcons = {
  assessment: Stethoscope,
  intervention: Pill,
  decision: GitBranch,
  finding: AlertTriangle,
  milestone: Activity,
};

const typeColors = {
  assessment: 'bg-brand-50 border-brand-200 text-brand-700',
  intervention: 'bg-sky-50 border-sky-200 text-sky-700',
  decision: 'bg-amber-50 border-amber-200 text-amber-700',
  finding: 'bg-red-50 border-red-200 text-red-700',
  milestone: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

const tagVariants = {
  success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  danger: 'bg-red-50 text-red-600 border-red-200',
  info: 'bg-sky-50 text-sky-600 border-sky-200',
};

export function ClinicalTimeline({ items, onDecision }: ClinicalTimelineProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'All' | 'Assessments' | 'Interventions' | 'Decisions'>('All');

  // Use provided items only — timeline starts empty and populates as actions happen
  const timelineItems: TimelineItem[] = items || [];

  const filteredItems = filter === 'All' 
    ? timelineItems 
    : timelineItems.filter(item => {
        const map = { 'Assessments': 'assessment', 'Interventions': 'intervention', 'Decisions': 'decision' };
        return item.type === map[filter];
      });

  const handleSelectOption = (itemId: string, optionId: string) => {
    setSelectedOptions(prev => ({ ...prev, [itemId]: optionId }));
    onDecision?.(itemId, optionId);
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <h3 className="text-sm font-semibold text-surface-900">Clinical Timeline</h3>
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['All', 'Assessments', 'Interventions', 'Decisions'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                filter === f 
                  ? 'bg-brand-50 text-brand-600 border border-brand-200' 
                  : 'text-surface-400 hover:text-surface-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative space-y-4 min-h-[120px]">
        {filteredItems.length > 0 && <div className="timeline-line"></div>}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="w-8 h-8 text-surface-300 mb-2" />
            <p className="text-sm text-surface-500 font-medium">No actions recorded yet</p>
            <p className="text-xs text-surface-400 mt-1 max-w-[260px]">
              Use quick actions or decision prompts to build a visible debrief trail.
            </p>
          </div>
        )}

        {filteredItems.map((item) => {
          const Icon = typeIcons[item.type];
          const isDecision = item.type === 'decision';
          const selectedOption = selectedOptions[item.id];

          return (
            <div key={item.id} className="timeline-item flex gap-4 relative pl-1">
              <div className="flex-shrink-0 mt-1">
                <div className={`timeline-dot ${
                  item.completed 
                    ? 'bg-brand-500' 
                    : isDecision 
                      ? 'bg-amber-500 animate-pulse' 
                      : 'bg-surface-300'
                }`} style={isDecision ? { boxShadow: '0 0 0 4px rgba(139,92,246,0.2)' } : undefined}></div>
              </div>

              <div className={`flex-1 glass rounded-lg p-3 border ${typeColors[item.type]}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-surface-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>

                <p className="text-xs text-surface-600 mb-2">{item.description}</p>

                {item.tags && (
                  <div className="flex gap-1.5 mb-2">
                    {item.tags.map((tag, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${tagVariants[tag.variant]}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}

                {isDecision && item.options && (
                  <div className="space-y-2 mt-3">
                    {item.options.map((option) => {
                      const isSelected = selectedOption === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => handleSelectOption(item.id, option.id)}
                          className={`intervention-card flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-brand-300 bg-brand-50/50 shadow-[0_0_0_3px_rgba(139,92,246,0.1)]' 
                              : 'border-surface-200/80 bg-white/60 hover:bg-brand-50/30'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'border-brand-500 bg-brand-500' : 'border-surface-300'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-surface-800">{option.label}</div>
                            <div className="text-[10px] text-surface-400">{option.description}</div>
                          </div>
                        </div>
                      );
                    })}

                    {selectedOption && (
                      <button className="mt-3 w-full py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Submit Decision
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ClinicalTimeline;
