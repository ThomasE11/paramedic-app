import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import type { AppliedTreatment } from '@/types';

interface TreatmentsPanelProps {
  treatments: AppliedTreatment[];
  isAnimating?: boolean;
  animationProgress?: number;
}

export function TreatmentsPanel({ 
  treatments, 
  isAnimating = false,
  animationProgress = 0 
}: TreatmentsPanelProps) {
  if (treatments.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground py-4">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No treatments applied yet</p>
            <p className="text-xs mt-1 opacity-70">Complete checklist items to see treatment effects</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Applied Treatments
          <Badge variant="secondary" className="ml-auto">
            {treatments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-3">
            {treatments.map((treatment, index) => (
              <div
                key={`${treatment.id}-${index}`}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{treatment.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(treatment.appliedAt).toLocaleTimeString()}
                      </span>
                      {isAnimating && index === treatments.length - 1 && (
                        <Badge variant="outline" className="text-xs animate-pulse">
                          In Progress ({Math.round(animationProgress * 100)}%)
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={treatment.category === 'intervention' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {treatment.category}
                  </Badge>
                </div>
                
                {treatment.effects.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dashed">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Effects:</span>
                    </div>
                    <div className="space-y-1">
                      {treatment.effects.map((effect, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="font-medium">{effect.vitalSign}:</span>
                          <span className="text-red-500">{effect.oldValue}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-green-600 font-medium">{effect.newValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default TreatmentsPanel;
