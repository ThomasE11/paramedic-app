/**
 * ECG Display Component
 *
 * Displays ECG information with images from LITFL for cardiac emergency cases
 * Shows interpretation, key features, and management guidance
 * Includes fullscreen mode for teaching purposes
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Eye,
  AlertCircle,
  Zap,
  Maximize,
  Minimize
} from 'lucide-react';
import type { ECGDisplay } from '@/data/litflECGs';

interface ECGDisplayProps {
  ecg?: ECGDisplay;
  show?: boolean;
  onClose?: () => void;
}

export function ECGDisplayComponent({ ecg, show = true, onClose }: ECGDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!show || !ecg) {
    return null;
  }

  const urgencyColors = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    urgent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    routine: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
  };

  const categoryColors = {
    'STEMI': 'bg-red-600',
    'STEMI-Equivalent': 'bg-red-700',
    'Arrhythmia': 'bg-purple-600',
    'Conduction': 'bg-indigo-600',
    'Metabolic': 'bg-green-600',
    'Pericardial': 'bg-blue-600',
    'Pulmonary': 'bg-cyan-600',
    'Vascular': 'bg-rose-600',
    'Inherited Channelopathy': 'bg-pink-600'
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm ${isFullscreen ? '' : 'p-2 md:p-4'}`}>
      <div className={`bg-background w-full flex flex-col shadow-2xl border ${isFullscreen ? 'h-screen w-screen max-w-none rounded-none border-0' : 'max-w-7xl max-h-[98vh] rounded-lg'}`}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold">{ecg.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={urgencyColors[ecg.urgency]}>
                  {ecg.urgency.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className={categoryColors[ecg.category as keyof typeof categoryColors]}>
                  {ecg.category}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ecg.litflUrl && (
              <a
                href={ecg.litflUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                LITFL
              </a>
            )}
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* ECG Image Display */}
          <Card className="overflow-hidden border-2">
            <CardContent className="p-0 bg-black">
              {ecg.imageUrl ? (
                <div className="relative">
                  <img
                    src={ecg.imageUrl}
                    alt={ecg.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="#f8f9fa" width="400" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6c757d" font-size="14">ECG Image Loading...</text></svg>');
                    }}
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-background/80 backdrop-blur"
                      onClick={() => window.open(ecg.imageUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Full
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>ECG image available on LITFL website</p>
                  {ecg.litflUrl && (
                    <a
                      href={ecg.litflUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 mt-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on LITFL
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-xl font-bold text-primary">{ecg.interpretation.rate}</div>
              <div className="text-xs text-muted-foreground">Rate (bpm)</div>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-base font-bold">{ecg.interpretation.qrsDuration}</div>
              <div className="text-xs text-muted-foreground">QRS</div>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-sm font-bold">{ecg.interpretation.rhythm}</div>
              <div className="text-xs text-muted-foreground">Rhythm</div>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-sm font-bold">{ecg.interpretation.stSegment}</div>
              <div className="text-xs text-muted-foreground">ST Segment</div>
            </div>
          </div>

          {/* Clinical Context */}
          {ecg.clinicalContext && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Clinical Context
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <p className="text-sm">{ecg.clinicalContext}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Features */}
          <Card>
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Key ECG Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {ecg.interpretation.keyFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Teaching Points */}
          <Card>
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Teaching Points & Pearls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {ecg.teachingPoints.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {i + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Management */}
          {ecg.management && ecg.management.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Management Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <ul className="space-y-1.5">
                  {ecg.management.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Zap className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className={action.includes('CRITICAL') || action.includes('DO NOT') || action.includes('AVOID') ? 'text-red-600 font-medium' : ''}>
                        {action.replace('CRITICAL:', '').replace('DO NOT', '').trim()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Differential Diagnosis */}
          {ecg.interpretation.differentialDiagnosis && (
            <Card>
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-sm">Differential Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <div className="flex flex-wrap gap-2">
                  {ecg.interpretation.differentialDiagnosis.map((dx, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {dx}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {ecg.description && (
            <Card>
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <p className="text-sm text-muted-foreground">{ecg.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 bg-muted/30 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            Source: Life in the Fast Lane ECG Library
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://litfl.com/ecg-library/', '_blank')}
            className="text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Browse All ECGs
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mini ECG Display for inline use (e.g., in case panel)
export function MiniECGDisplay({ ecg }: { ecg: ECGDisplay }) {
  const urgencyColors = {
    critical: 'bg-red-500',
    urgent: 'bg-orange-500',
    routine: 'bg-green-500'
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="flex items-center justify-between px-3 py-2 bg-muted">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{ecg.title}</span>
        </div>
        <Badge className={`text-xs ${urgencyColors[ecg.urgency]}`}>
          {ecg.urgency}
        </Badge>
      </div>

      {ecg.imageUrl && (
        <div className="p-2 bg-black">
          <img
            src={ecg.imageUrl}
            alt={ecg.title}
            className="w-full h-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.open(ecg.imageUrl, '_blank')}
          />
        </div>
      )}

      <div className="p-3 space-y-2">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Rhythm:</span>
            <span className="ml-1 font-medium">{ecg.interpretation.rhythm}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Rate:</span>
            <span className="ml-1 font-medium">{ecg.interpretation.rate} bpm</span>
          </div>
          <div>
            <span className="text-muted-foreground">QRS:</span>
            <span className="ml-1 font-medium">{ecg.interpretation.qrsDuration}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Key Feature:</span> {ecg.interpretation.keyFeatures[0]}
        </div>

        {ecg.management && ecg.management.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs font-medium text-red-600 mb-1">Critical Actions:</div>
            <ul className="space-y-0.5">
              {ecg.management.slice(0, 2).map((action, i) => (
                <li key={i} className="text-xs text-red-600">
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ECG Quick Reference for Emergency Display
export function EmergencyECGQuickRef({ ecg }: { ecg: ECGDisplay }) {
  const urgencyColors = {
    critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    urgent: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    routine: 'border-green-500 bg-green-50 dark:bg-green-900/20'
  };

  return (
    <div className={`border-l-4 ${urgencyColors[ecg.urgency]} pl-3 py-2`}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-4 w-4 text-red-500" />
        <span className="font-semibold text-sm">{ecg.title}</span>
        <Badge className={`text-xs ${urgencyColors[ecg.urgency]}`}>
          {ecg.urgency}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs mb-2">
        <div>
          <span className="text-muted-foreground">Rate:</span> {ecg.interpretation.rate}
        </div>
        <div>
          <span className="text-muted-foreground">Rhythm:</span> {ecg.interpretation.rhythm.split(' ').slice(0, 2).join(' ')}
        </div>
        <div>
          <span className="text-muted-foreground">ST:</span> {ecg.interpretation.stSegment}
        </div>
        <div>
          <span className="text-muted-foreground">QRS:</span> {ecg.interpretation.qrsDuration}
        </div>
      </div>

      <div className="text-xs mb-2">
        <span className="font-medium">Key Feature:</span> {ecg.interpretation.keyFeatures[0]}
      </div>

      {ecg.management && ecg.management.length > 0 && (
        <div className="text-xs">
          <span className="font-semibold text-red-600">Action:</span> {ecg.management[0]}
        </div>
      )}
    </div>
  );
}

export default ECGDisplayComponent;
