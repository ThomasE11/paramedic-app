/**
 * Clinical Resources - Visual and Audio Resources for Case Findings
 * 
 * Displays relevant images, diagrams, and audio resources based on case findings.
 * Helps students recognize clinical signs and sounds.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Image,
  Volume2,
  Eye,
  ChevronRight
} from 'lucide-react';
import { neurologicalFindings, respiratoryFindings, cardiacFindings, traumaFindings } from '@/data/clinicalResources';

interface ClinicalResourcesProps {
  caseFindings: string[];
}

interface MatchedResource {
  resource: typeof neurologicalFindings[0];
  relevance: number;
  matchedTerms: string[];
}

export function ClinicalResources({ caseFindings }: ClinicalResourcesProps) {

  const [showAll, setShowAll] = useState(false);

  // Combine all resources
  const allResources = useMemo(() => [
    ...neurologicalFindings,
    ...respiratoryFindings,
    ...cardiacFindings,
    ...traumaFindings
  ], []);

  // Find relevant resources based on case findings
  const matchedResources = useMemo(() => {
    const matches: MatchedResource[] = [];
    
    allResources.forEach(resource => {
      let relevance = 0;
      const matchedTerms: string[] = [];
      
      // Check against case findings
      caseFindings.forEach(finding => {
        const findingLower = finding.toLowerCase();
        
        // Check resource name
        if (resource.name.toLowerCase().includes(findingLower) || 
            findingLower.includes(resource.name.toLowerCase())) {
          relevance += 10;
          matchedTerms.push(resource.name);
        }
        
        // Check related conditions
        resource.relatedConditions.forEach(condition => {
          if (condition.toLowerCase().includes(findingLower) ||
              findingLower.includes(condition.toLowerCase())) {
            relevance += 5;
            matchedTerms.push(condition);
          }
        });
        
        // Check clinical signs
        resource.clinicalSigns.forEach(sign => {
          if (sign.toLowerCase().includes(findingLower) ||
              findingLower.includes(sign.toLowerCase())) {
            relevance += 3;
            matchedTerms.push(sign);
          }
        });
        
        // Check description
        if (resource.description.toLowerCase().includes(findingLower)) {
          relevance += 2;
        }
      });
      
      if (relevance > 0) {
        matches.push({ resource, relevance, matchedTerms: [...new Set(matchedTerms)] });
      }
    });
    
    // Sort by relevance
    return matches.sort((a, b) => b.relevance - a.relevance);
  }, [caseFindings, allResources]);

  // Show top 3 or all
  const displayResources = showAll ? matchedResources : matchedResources.slice(0, 3);

  if (matchedResources.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          Visual Resources
          <Badge variant="outline" className="text-[10px]">
            {matchedResources.length} found
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayResources.map(({ resource, matchedTerms }) => (
          <Dialog key={resource.id}>
            <DialogTrigger asChild>
              <div 
                className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="shrink-0">
                  {resource.type === 'image' && (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {resource.thumbnailUrl ? (
                        <img 
                          src={resource.thumbnailUrl} 
                          alt={resource.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
                          }}
                        />
                      ) : (
                        <Image className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  {resource.type === 'audio' && (
                    <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Volume2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-1">{resource.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {resource.description}
                  </p>
                  {matchedTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {matchedTerms.slice(0, 2).map((term, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0">
                          {term.slice(0, 20)}{term.length > 20 ? '...' : ''}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {resource.type === 'image' ? <Image className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  {resource.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Resource Display */}
                <div className="rounded-lg overflow-hidden bg-muted">
                  {resource.type === 'image' && resource.url && (
                    <img 
                      src={resource.url} 
                      alt={resource.name}
                      className="w-full h-auto max-h-[400px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  {resource.type === 'audio' && resource.audioUrl && (
                    <div className="p-8 flex flex-col items-center justify-center">
                      <Volume2 className="h-16 w-16 text-blue-500 mb-4" />
                      <audio controls className="w-full max-w-md">
                        <source src={resource.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
                
                {/* Resource Details */}
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Description:</p>
                    <p className="text-muted-foreground">{resource.description}</p>
                  </div>
                  
                  {resource.clinicalSigns.length > 0 && (
                    <div>
                      <p className="font-medium">Clinical Signs:</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {resource.clinicalSigns.map((sign, i) => (
                          <li key={i}>{sign}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {resource.relatedConditions.length > 0 && (
                    <div>
                      <p className="font-medium">Related Conditions:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resource.relatedConditions.map((condition, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Source: {resource.source}
                    </p>
                    <Badge 
                      variant={resource.relevance === 'essential' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {resource.relevance}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
        
        {matchedResources.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${matchedResources.length})`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default ClinicalResources;
