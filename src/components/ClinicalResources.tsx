/**
 * Enhanced Clinical Resources Component
 *
 * Features:
 * - Condition-specific resource matching (not just category)
 * - Audible clinical sounds (wheeze, stridor, crackles)
 * - Local image hosting with fallback to external URLs
 * - Video embedding with fallback links
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Image,
  Eye,
  ChevronRight,
  ExternalLink,
  Play,
  Volume2,
  VolumeX,
  Square,
} from 'lucide-react';
import {
  videoResources,
  referenceArticles,
  getImagesByCategory,
  getImagesByFindings,
  getVideosByCategory,
  getVideosByFindings,
  getYouTubeWatchUrl,
  clinicalAudioResources,
  type LocalImageResource,
  type LocalVideoResource,
  type LocalAudioResource,
} from '@/data/localClinicalResources';

interface ClinicalResourcesProps {
  caseCategory: string;
  caseFindings: string[];
}

// ============================================================================
// CLINICAL SOUND SYNTHESIZER
// ============================================================================

class ClinicalSoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private isPlaying = false;

  private getCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  play(type: LocalAudioResource['synthesisType'], duration: number = 5) {
    this.stop();
    this.isPlaying = true;

    const ctx = this.getCtx();
    const sampleRate = ctx.sampleRate;
    const bufferLength = sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferLength, sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
      case 'wheeze':
        this.generateWheeze(data, sampleRate, duration);
        break;
      case 'stridor':
        this.generateStridor(data, sampleRate, duration);
        break;
      case 'crackles':
        this.generateCrackles(data, sampleRate, duration);
        break;
      case 'rhonchi':
        this.generateRhonchi(data, sampleRate, duration);
        break;
      case 'pleural-rub':
        this.generatePleuralRub(data, sampleRate, duration);
        break;
      case 'normal-breath':
        this.generateNormalBreath(data, sampleRate, duration);
        break;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = 0.4;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.5;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.onended = () => { this.isPlaying = false; };
    source.start();
    this.activeSource = source;
  }

  stop() {
    if (this.activeSource) {
      try { this.activeSource.stop(); } catch { /* may already be stopped */ }
      this.activeSource = null;
    }
    this.isPlaying = false;
  }

  get playing() { return this.isPlaying; }

  // Wheeze: high-pitched musical tone modulated by breathing pattern
  private generateWheeze(data: Float32Array, sr: number, dur: number) {
    const breathCycle = 4; // seconds per breath
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const breathPhase = (t % breathCycle) / breathCycle;
      // Expiratory wheeze (louder during expiration phase 0.4-0.8)
      const isExpiring = breathPhase > 0.4 && breathPhase < 0.85;
      const envelope = isExpiring ? Math.sin((breathPhase - 0.4) / 0.45 * Math.PI) : 0.05;
      // Multiple harmonics for musical quality
      const freq1 = 400 + Math.sin(t * 0.5) * 30;
      const freq2 = 520 + Math.sin(t * 0.7) * 20;
      data[i] = (
        Math.sin(2 * Math.PI * freq1 * t) * 0.5 +
        Math.sin(2 * Math.PI * freq2 * t) * 0.3 +
        (Math.random() - 0.5) * 0.1
      ) * envelope * 0.3;
    }
  }

  // Stridor: harsh high-pitched inspiratory sound
  private generateStridor(data: Float32Array, sr: number, dur: number) {
    const breathCycle = 3.5;
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const breathPhase = (t % breathCycle) / breathCycle;
      const isInspiring = breathPhase < 0.4;
      const envelope = isInspiring ? Math.sin(breathPhase / 0.4 * Math.PI) : 0.02;
      const freq = 600 + Math.sin(t * 2) * 80;
      data[i] = (
        Math.sin(2 * Math.PI * freq * t) * 0.4 +
        Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.2 +
        (Math.random() - 0.5) * 0.25
      ) * envelope * 0.35;
    }
  }

  // Crackles: short popping sounds during inspiration
  private generateCrackles(data: Float32Array, sr: number, dur: number) {
    const breathCycle = 4;
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const breathPhase = (t % breathCycle) / breathCycle;
      const isInspiring = breathPhase > 0.05 && breathPhase < 0.45;
      const breathEnv = isInspiring ? Math.sin((breathPhase - 0.05) / 0.4 * Math.PI) * 0.15 : 0;

      // Random crackles during inspiration
      let crackle = 0;
      if (isInspiring && Math.random() < 0.015) {
        const crackleLen = Math.floor(sr * 0.003);
        for (let j = 0; j < crackleLen && (i + j) < data.length; j++) {
          data[i + j] += (Math.random() - 0.5) * 0.6 * Math.exp(-j / (crackleLen * 0.3));
        }
      }
      data[i] += (Math.random() - 0.5) * breathEnv;
    }
  }

  // Rhonchi: low-pitched rumbling
  private generateRhonchi(data: Float32Array, sr: number, dur: number) {
    const breathCycle = 4;
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const breathPhase = (t % breathCycle) / breathCycle;
      const envelope = Math.sin(breathPhase * Math.PI) * 0.3;
      const freq = 120 + Math.sin(t * 0.3) * 30;
      data[i] = (
        Math.sin(2 * Math.PI * freq * t) * 0.4 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.2 +
        (Math.random() - 0.5) * 0.2
      ) * envelope * 0.35;
    }
  }

  // Pleural rub: creaking/grating sound
  private generatePleuralRub(data: Float32Array, sr: number, dur: number) {
    const breathCycle = 3.5;
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const breathPhase = (t % breathCycle) / breathCycle;
      const isBreathing = (breathPhase < 0.4) || (breathPhase > 0.5 && breathPhase < 0.85);
      const envelope = isBreathing ? 0.3 : 0.01;
      // Rough grating texture
      const freq = 300 + Math.sin(t * 15) * 100;
      data[i] = (
        Math.sin(2 * Math.PI * freq * t) * 0.3 +
        (Math.random() - 0.5) * 0.4
      ) * envelope * 0.3;
    }
  }

  // Normal breath sounds: soft vesicular
  private generateNormalBreath(data: Float32Array, sr: number, dur: number) {
    const breathCycle = 4;
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const breathPhase = (t % breathCycle) / breathCycle;
      const envelope = Math.sin(breathPhase * Math.PI) * 0.15;
      data[i] = (Math.random() - 0.5) * envelope;
    }
  }

  dispose() {
    this.stop();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// ============================================================================
// OPTIMIZED IMAGE COMPONENT
// ============================================================================

function OptimizedImage({
  src,
  fallbackSrc,
  alt,
  className
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Timeout — if image hasn't loaded in 8 seconds, show error state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isLoading, currentSrc]);

  const handleError = () => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted/50 rounded-xl border border-dashed border-border/60 ${className}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted mb-2">
          <Image className="h-5 w-5 text-muted-foreground/60" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">Image unavailable</span>
        <a href={src || fallbackSrc || currentSrc} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-primary hover:underline mt-1 flex items-center gap-1">
          Open externally <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    );
  }

  return (
    <>
      {isLoading && <Skeleton className={`${className}`} />}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onError={handleError}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          if (img.naturalWidth === 0) {
            handleError();
          } else {
            setIsLoading(false);
            setHasError(false);
          }
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </>
  );
}

// ============================================================================
// AUDIO PLAYER COMPONENT
// ============================================================================

function AudioPlayer({ sounds }: { sounds: LocalAudioResource[] }) {
  const synthRef = useRef<ClinicalSoundSynthesizer | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    synthRef.current = new ClinicalSoundSynthesizer();
    return () => { synthRef.current?.dispose(); };
  }, []);

  const toggleSound = useCallback((sound: LocalAudioResource) => {
    if (!synthRef.current) return;

    if (playingId === sound.id) {
      synthRef.current.stop();
      setPlayingId(null);
    } else {
      synthRef.current.play(sound.synthesisType, sound.duration);
      setPlayingId(sound.id);
      // Auto-stop after duration
      setTimeout(() => setPlayingId(null), sound.duration * 1000);
    }
  }, [playingId]);

  if (sounds.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          Audible Clinical Sounds
          <Badge variant="secondary" className="text-xs">
            {sounds.length}
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Play synthesized clinical sounds for educational comparison
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => toggleSound(sound)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                playingId === sound.id
                  ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 shadow-md'
                  : 'border-border hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
              }`}
            >
              <div className={`p-2 rounded-full ${
                playingId === sound.id ? 'bg-indigo-500 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
              }`}>
                {playingId === sound.id ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{sound.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{sound.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ClinicalResources({ caseCategory, caseFindings }: ClinicalResourcesProps) {
  const [expandedSections, setExpandedSections] = useState({
    images: true,
    videos: true,
    articles: true,
    sounds: true,
  });

  // Get condition-matched resources using both category AND findings
  const categoryImages = useMemo(() => {
    const byCategory = getImagesByCategory(caseCategory.toLowerCase());
    const byFindings = getImagesByFindings(caseFindings);
    // Merge and deduplicate
    const seen = new Set<string>();
    const merged: LocalImageResource[] = [];
    for (const img of [...byCategory, ...byFindings]) {
      if (!seen.has(img.id)) {
        seen.add(img.id);
        merged.push(img);
      }
    }
    return merged;
  }, [caseCategory, caseFindings]);

  const categoryVideos = useMemo(() => {
    const byCategory = getVideosByCategory(caseCategory.toLowerCase());
    const byFindings = getVideosByFindings(caseFindings);
    const seen = new Set<string>();
    const merged: LocalVideoResource[] = [];
    for (const vid of [...byCategory, ...byFindings]) {
      if (!seen.has(vid.id)) {
        seen.add(vid.id);
        merged.push(vid);
      }
    }
    return merged;
  }, [caseCategory, caseFindings]);

  const categoryArticles = useMemo(() => {
    const lowerCat = caseCategory.toLowerCase();
    const lowerFindings = caseFindings.map(f => f.toLowerCase());
    return referenceArticles.filter(a => {
      if (a.category === lowerCat) return true;
      // Also match articles by findings keywords
      const titleLower = a.title.toLowerCase();
      return lowerFindings.some(f => titleLower.includes(f));
    });
  }, [caseCategory, caseFindings]);

  // Get condition-relevant audio sounds
  const conditionSounds = useMemo(() => {
    const lowerCat = caseCategory.toLowerCase();
    const lowerFindings = caseFindings.map(f => f.toLowerCase()).join(' ');

    // Show respiratory sounds for respiratory cases or if findings mention relevant terms
    if (lowerCat === 'respiratory' || lowerFindings.includes('wheez') || lowerFindings.includes('stridor') ||
        lowerFindings.includes('crackl') || lowerFindings.includes('breath') || lowerFindings.includes('asthma') ||
        lowerFindings.includes('copd') || lowerFindings.includes('pneumon')) {
      return clinicalAudioResources;
    }
    // For cardiac cases with pulmonary edema signs
    if (lowerCat === 'cardiac' && (lowerFindings.includes('crackl') || lowerFindings.includes('edema'))) {
      return clinicalAudioResources.filter(a => a.synthesisType === 'crackles' || a.synthesisType === 'normal-breath');
    }
    return [];
  }, [caseCategory, caseFindings]);

  const hasAnyResources = categoryImages.length > 0 || categoryVideos.length > 0 || categoryArticles.length > 0 || conditionSounds.length > 0;

  if (!hasAnyResources) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Visual Resources & Learning Materials
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedSections(prev => ({ ...prev, images: !prev.images }))}
        >
          {expandedSections.images ? 'Hide' : 'Show'}
        </Button>
      </div>

      {expandedSections.images && (
        <>
          {/* Audible Clinical Sounds */}
          {conditionSounds.length > 0 && <AudioPlayer sounds={conditionSounds} />}

          {/* Clinical Images */}
          {categoryImages.length > 0 && (
            <Card className="border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Clinical Images & X-Rays
                  <Badge variant="secondary" className="text-xs">
                    {categoryImages.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryImages.map((image: LocalImageResource) => (
                    <Dialog key={image.id}>
                      <DialogTrigger asChild>
                        <div className="group cursor-pointer">
                          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border hover:border-primary transition-colors">
                            <OptimizedImage
                              src={image.externalUrl || image.localPath}
                              fallbackSrc={image.localPath}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                          <div className="mt-2">
                            <h4 className="text-sm font-medium">{image.name}</h4>
                            <p className="text-xs text-muted-foreground">{image.attribution}</p>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{image.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="rounded-lg overflow-hidden bg-muted">
                            <OptimizedImage
                              src={image.externalUrl || image.localPath}
                              fallbackSrc={image.localPath}
                              alt={image.name}
                              className="w-full h-auto max-h-[500px] object-contain mx-auto"
                            />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium">Description:</p>
                              <p className="text-sm text-muted-foreground">{image.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {image.clinicalSigns.map((sign, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{sign}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                              <span>Source: {image.attribution}</span>
                              {image.externalUrl && (
                                <a href={image.externalUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-primary hover:underline">
                                  <ExternalLink className="h-3 w-3" />
                                  Open full size
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Procedure Videos */}
          {categoryVideos.length > 0 && (
            <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Educational Videos
                  <Badge variant="secondary" className="text-xs">
                    {categoryVideos.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryVideos.map((video: LocalVideoResource) => (
                    <div key={video.id} className="space-y-2">
                      <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-12 w-12 text-white/80 group-hover:text-white transition-colors" />
                        </div>
                        <iframe
                          src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
                          title={video.name}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLIFrameElement).style.display = 'none'; }}
                        />
                        <a
                          href={getYouTubeWatchUrl(video.youtubeId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors flex items-end justify-end p-2"
                        >
                          <Button size="sm" variant="secondary" className="gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Open on original site
                          </Button>
                        </a>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium line-clamp-2">{video.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {video.source} {video.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reference Articles */}
          {categoryArticles.length > 0 && (
            <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Reference Articles & Guidelines
                  <Badge variant="secondary" className="text-xs">
                    {categoryArticles.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryArticles.map((article) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{article.title}</h4>
                        <p className="text-xs text-muted-foreground">{article.source}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default ClinicalResources;
