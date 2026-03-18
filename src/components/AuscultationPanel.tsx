/**
 * Auscultation Panel
 *
 * Interactive panel where students can "listen" to the patient's lungs and heart.
 * Displays auscultation findings that change dynamically based on patient condition
 * and treatment responses. Includes Web Audio API sound generation.
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope, Volume2, VolumeX, AlertTriangle, Info,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import type { ClinicalSoundState, BreathSoundType } from '@/data/clinicalSounds';
import {
  BREATH_SOUND_DESCRIPTIONS,
  playBreathSound,
  playHeartSound,
  stopAllSounds,
  isAudioAvailable,
} from '@/data/clinicalSounds';

interface AuscultationPanelProps {
  sounds: ClinicalSoundState;
  isExpanded?: boolean;
}

// Color coding for sound severity
const soundSeverityColor: Record<BreathSoundType, string> = {
  'clear': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  'wheeze': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  'crackles-fine': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  'crackles-coarse': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  'stridor': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  'diminished': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  'absent': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  'rhonchi': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  'pleural-rub': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  'snoring': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
};

const criticalSounds: BreathSoundType[] = ['absent', 'stridor', 'snoring'];

export function AuscultationPanel({ sounds, isExpanded: initialExpanded = false }: AuscultationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const hasAudio = isAudioAvailable();

  const handlePlaySound = useCallback((side: 'left' | 'right', soundType: BreathSoundType) => {
    if (isPlaying) {
      stopAllSounds();
      setIsPlaying(null);
      return;
    }

    setIsPlaying(side);
    playBreathSound(soundType, 4000);

    // Auto-stop after duration
    setTimeout(() => {
      setIsPlaying(null);
    }, 4000);
  }, [isPlaying]);

  const handleStopSound = useCallback(() => {
    stopAllSounds();
    setIsPlaying(null);
  }, []);

  const isCritical = criticalSounds.includes(sounds.leftLung) || criticalSounds.includes(sounds.rightLung);

  const leftDesc = BREATH_SOUND_DESCRIPTIONS[sounds.leftLung];
  const rightDesc = BREATH_SOUND_DESCRIPTIONS[sounds.rightLung];

  return (
    <Card className={`border-2 ${isCritical ? 'border-red-300 dark:border-red-800' : 'border-blue-200 dark:border-blue-800'} shadow-lg overflow-hidden`}>
      {/* Header */}
      <CardHeader
        className={`pb-2 sm:pb-3 px-3 sm:px-6 cursor-pointer ${isCritical ? 'bg-gradient-to-r from-red-500/10 to-transparent' : 'bg-gradient-to-r from-blue-500/10 to-transparent'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <div className={`p-1 sm:p-1.5 rounded-lg ${isCritical ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
            <Stethoscope className={`h-4 w-4 sm:h-5 sm:w-5 ${isCritical ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <span>Auscultation</span>
          {isCritical && (
            <Badge variant="destructive" className="ml-1 sm:ml-2 text-[9px] sm:text-[10px]">
              <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" />
              ABNORMAL
            </Badge>
          )}
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto" />}
        </CardTitle>

        {/* Quick summary always visible */}
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
          {sounds.description}
        </p>
      </CardHeader>

      {/* Expanded content */}
      {isExpanded && (
        <CardContent className="pt-0 px-3 sm:px-6 space-y-3 sm:space-y-4">
          {/* Lung diagram layout */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Left Lung */}
            <div className={`rounded-xl border p-2 sm:p-3 ${soundSeverityColor[sounds.leftLung]}`}>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="font-semibold text-xs sm:text-sm">Left Lung</span>
                {hasAudio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlaying === 'left') handleStopSound();
                      else handlePlaySound('left', sounds.leftLung);
                    }}
                  >
                    {isPlaying === 'left' ? (
                      <VolumeX className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <Badge variant="outline" className="text-[9px] sm:text-[11px] mb-1 sm:mb-1.5">
                {leftDesc.name}
              </Badge>
              <p className="text-[10px] sm:text-[11px] opacity-80 leading-relaxed line-clamp-3 sm:line-clamp-none">
                {leftDesc.audioDescription}
              </p>
            </div>

            {/* Right Lung */}
            <div className={`rounded-xl border p-2 sm:p-3 ${soundSeverityColor[sounds.rightLung]}`}>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="font-semibold text-xs sm:text-sm">Right Lung</span>
                {hasAudio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlaying === 'right') handleStopSound();
                      else handlePlaySound('right', sounds.rightLung);
                    }}
                  >
                    {isPlaying === 'right' ? (
                      <VolumeX className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <Badge variant="outline" className="text-[9px] sm:text-[11px] mb-1 sm:mb-1.5">
                {rightDesc.name}
              </Badge>
              <p className="text-[10px] sm:text-[11px] opacity-80 leading-relaxed line-clamp-3 sm:line-clamp-none">
                {rightDesc.audioDescription}
              </p>
            </div>
          </div>

          {/* Heart Sounds */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-2 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <span className="font-semibold text-xs sm:text-sm">Heart Sounds</span>
              <Badge variant="outline" className="text-[9px] sm:text-[10px]">
                {sounds.heartSound === 'normal' ? 'Normal S1S2' :
                 sounds.heartSound === 'tachycardic' ? 'Tachycardic S1S2' :
                 sounds.heartSound === 'bradycardic' ? 'Bradycardic S1S2' :
                 sounds.heartSound === 'irregular' ? 'Irregularly Irregular' :
                 sounds.heartSound === 'muffled' ? 'Muffled/Distant' :
                 sounds.heartSound === 'gallop' ? 'S3 Gallop' :
                 sounds.heartSound === 'murmur-systolic' ? 'Systolic Murmur' :
                 sounds.heartSound === 'absent' ? 'NO HEART SOUNDS' :
                 sounds.heartSound}
              </Badge>
              {hasAudio && sounds.heartSound !== 'absent' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPlaying === 'heart') {
                      handleStopSound();
                    } else {
                      setIsPlaying('heart');
                      playHeartSound(sounds.heartSound, 5000);
                      setTimeout(() => setIsPlaying(null), 5000);
                    }
                  }}
                >
                  {isPlaying === 'heart' ? (
                    <VolumeX className="h-4 w-4 animate-pulse text-red-500" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Additional sounds */}
          {sounds.additionalSounds.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Additional Findings</span>
              <div className="flex flex-wrap gap-1.5">
                {sounds.additionalSounds.map((sound, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {sound}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Clinical significance toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Info className="h-3 w-3 mr-1" />
            {showDetails ? 'Hide' : 'Show'} Clinical Significance
          </Button>

          {showDetails && (
            <div className="space-y-2 text-xs">
              {sounds.leftLung !== 'clear' && (
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="font-medium mb-0.5">Left Lung: {leftDesc.name}</p>
                  <p className="text-muted-foreground">{leftDesc.clinicalSignificance}</p>
                </div>
              )}
              {sounds.rightLung !== 'clear' && sounds.rightLung !== sounds.leftLung && (
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="font-medium mb-0.5">Right Lung: {rightDesc.name}</p>
                  <p className="text-muted-foreground">{rightDesc.clinicalSignificance}</p>
                </div>
              )}
              {sounds.leftLung === 'clear' && sounds.rightLung === 'clear' && (
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2.5">
                  <p className="font-medium text-green-800 dark:text-green-300">
                    Lungs clear bilaterally — normal finding
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default AuscultationPanel;
