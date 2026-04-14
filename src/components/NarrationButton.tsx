/**
 * Narration Button
 *
 * Small speaker button for triggering voice narration on any text block.
 * Shows animated pulse while speaking. Respects the global voice-enabled preference.
 */

import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { useState, useEffect } from 'react';

interface NarrationButtonProps {
  text: string;
  role?: 'dispatcher' | 'patient' | 'narrator';
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function NarrationButton({ text, role = 'narrator', label, className = '', size = 'sm' }: NarrationButtonProps) {
  const { speak, stop, isSpeaking, isSupported, enabled } = useVoiceNarration();
  const [isThisSpeaking, setIsThisSpeaking] = useState(false);

  useEffect(() => {
    if (!isSpeaking) setIsThisSpeaking(false);
  }, [isSpeaking]);

  if (!isSupported || !enabled) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisSpeaking) {
      stop();
      setIsThisSpeaking(false);
    } else {
      setIsThisSpeaking(true);
      speak(text, {
        role,
        onEnd: () => setIsThisSpeaking(false),
      });
    }
  };

  const sizeClasses = size === 'md'
    ? 'h-8 w-8 p-1.5'
    : 'h-6 w-6 p-1';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label || 'Read aloud'}
      title={isThisSpeaking ? 'Stop narration' : 'Read aloud'}
      className={`inline-flex items-center justify-center rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 active:bg-muted transition-colors touch-manipulation shrink-0 ${sizeClasses} ${className}`}
    >
      {isThisSpeaking ? (
        <Loader2 className="h-full w-full text-primary animate-spin" />
      ) : (
        <Volume2 className="h-full w-full text-muted-foreground" />
      )}
    </button>
  );
}

/**
 * Voice toggle button for the header — lets users enable/disable all narration.
 */
export function VoiceToggleButton({ className = '' }: { className?: string }) {
  const { enabled, toggleEnabled, isSupported } = useVoiceNarration();

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleEnabled}
      aria-label={enabled ? 'Disable voice narration' : 'Enable voice narration'}
      title={enabled ? 'Voice narration on' : 'Voice narration off'}
      className={`inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 active:bg-muted transition-colors touch-manipulation ${className}`}
    >
      {enabled ? (
        <Volume2 className="h-4 w-4 text-primary" />
      ) : (
        <VolumeX className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}
