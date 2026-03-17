/**
 * Complication Manager Component
 * 
 * Handles random complication events during case simulation
 * Shows notifications and tracks student responses
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertOctagon, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { Complication } from '@/data/complicationSystem';
import { COMPLICATIONS } from '@/data/complicationSystem';

export interface ActiveComplication {
  id: string;
  complication: Complication;
  triggeredAt: Date;
  respondedAt?: Date;
  resolved: boolean;
  ignored: boolean;
}

export function useComplicationManager() {
  const [activeComplications, setActiveComplications] = useState<ActiveComplication[]>([]);
  const [lastComplicationTime, setLastComplicationTime] = useState<number>(0);

  const triggerComplication = useCallback((caseCategory?: string): Complication | null => {
    // Filter complications based on case category
    let availableComplications = COMPLICATIONS;
    
    if (caseCategory) {
      const category = caseCategory.toLowerCase();
      availableComplications = COMPLICATIONS.filter(c => {
        // Match complication to case type
        if (category.includes('trauma') && ['patient_agitated', 'seizure', 'vomiting', 'tension_pneumothorax', 'rebleed'].includes(c.id)) return true;
        if (category.includes('cardiac') && ['allergic_reaction', 'seizure'].includes(c.id)) return true;
        if (category.includes('respiratory') && ['difficult_airway', 'suction_failure', 'vomiting'].includes(c.id)) return true;
        // Equipment failures apply to all cases
        if (['pulse_ox_dislodged', 'bp_cuff_leak', 'iv_infiltrated', 'suction_failure'].includes(c.id)) return true;
        return false;
      });
    }

    if (availableComplications.length === 0) {
      availableComplications = COMPLICATIONS;
    }

    const complication = availableComplications[Math.floor(Math.random() * availableComplications.length)];
    
    const newActiveComplication: ActiveComplication = {
      id: `${complication.id}-${Date.now()}`,
      complication,
      triggeredAt: new Date(),
      resolved: false,
      ignored: false,
    };

    setActiveComplications(prev => [...prev, newActiveComplication]);
    setLastComplicationTime(Date.now());

    // Show toast notification
    const severityColors = {
      minor: 'bg-blue-500',
      moderate: 'bg-yellow-500',
      major: 'bg-orange-500',
      critical: 'bg-red-600',
    };

    toast.error(
      <div className="space-y-1">
        <div className="font-semibold flex items-center gap-2">
          <AlertOctagon className="h-4 w-4" />
          {complication.name}
        </div>
        <div className="text-sm">{complication.description}</div>
        <div className="text-xs opacity-80">
          Required: {complication.requiredAction}
        </div>
      </div>,
      {
        duration: 10000,
        icon: severityColors[complication.severity],
      }
    );

    return complication;
  }, []);

  const resolveComplication = useCallback((complicationId: string) => {
    setActiveComplications(prev => 
      prev.map(c => 
        c.id === complicationId 
          ? { ...c, resolved: true, respondedAt: new Date() }
          : c
      )
    );

    toast.success('Complication resolved', {
      description: 'Student responded appropriately',
    });
  }, []);

  const ignoreComplication = useCallback((complicationId: string) => {
    setActiveComplications(prev => 
      prev.map(c => 
        c.id === complicationId 
          ? { ...c, ignored: true }
          : c
      )
    );
  }, []);

  const clearComplications = useCallback(() => {
    setActiveComplications([]);
    setLastComplicationTime(0);
  }, []);

  return {
    activeComplications,
    lastComplicationTime,
    triggerComplication,
    resolveComplication,
    ignoreComplication,
    clearComplications,
  };
}

export function ComplicationPanel({
  activeComplications,
  onResolve,
  onIgnore,
}: {
  activeComplications: ActiveComplication[];
  onResolve: (id: string) => void;
  onIgnore: (id: string) => void;
}) {
  const unresolved = activeComplications.filter(c => !c.resolved && !c.ignored);
  const resolved = activeComplications.filter(c => c.resolved);

  if (activeComplications.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Complications
          {unresolved.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unresolved.length} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Active Complications */}
        {unresolved.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-orange-700">Active</h4>
            {unresolved.map((comp) => (
              <div 
                key={comp.id}
                className="p-3 rounded-lg border border-orange-200 bg-white dark:bg-slate-900 animate-pulse"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={comp.complication.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="text-[10px]"
                      >
                        {comp.complication.severity}
                      </Badge>
                      <span className="font-medium text-sm">{comp.complication.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {comp.complication.description}
                    </p>
                    <div className="text-xs bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                      <strong>Action Required:</strong> {comp.complication.requiredAction}
                    </div>
                    {comp.complication.consequencesIfIgnored.length > 0 && (
                      <div className="mt-2 text-xs text-red-600">
                        <strong>If ignored:</strong> {comp.complication.consequencesIfIgnored.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => onResolve(comp.id)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Resolved
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => onIgnore(comp.id)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Ignore
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resolved Complications */}
        {resolved.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700">Resolved</h4>
            {resolved.map((comp) => (
              <div 
                key={comp.id}
                className="p-2 rounded-lg border border-green-200 bg-green-50/50 opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{comp.complication.name}</span>
                  </div>
                  {comp.respondedAt && (
                    <span className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {Math.round((comp.respondedAt.getTime() - comp.triggeredAt.getTime()) / 1000)}s
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ComplicationPanel;
