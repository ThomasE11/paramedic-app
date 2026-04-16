/**
 * VoiceCommandButton — mic overlay that drives hands-free assessment.
 *
 * Pairs with `useVoiceInput`. The caller supplies the command registry and a
 * handler; this component renders:
 *   - A tap-to-toggle mic button with a listening-state animation
 *   - A live transcript pill that shows what the recogniser heard
 *   - A brief "matched: <command>" flash when a command fires
 *
 * Intentionally self-contained so any screen can drop it in. The Student
 * Panel places it as a floating action on assessment phases; other screens
 * can embed it inline.
 */

import { useEffect, useState } from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';
import { useVoiceInput, type VoiceCommand, type VoiceMatch } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

interface VoiceCommandButtonProps {
  commands: VoiceCommand[];
  onCommand: (match: VoiceMatch) => void;
  /** Fixed-position floating button. Set false to render inline. Default true. */
  floating?: boolean;
  /** Optional wake word e.g. "medic" — if set, commands only fire after it. */
  wakeWord?: string;
  /** BCP-47 lang, defaults to browser locale. Pass 'ar-AE' for Arabic dictation. */
  lang?: string;
  /** Additional class names for the button. */
  className?: string;
  /** Label shown above the button when listening. Default: "Listening". */
  listeningLabel?: string;
  /** Label shown when idle. Default: "Voice". */
  idleLabel?: string;
}

export function VoiceCommandButton({
  commands,
  onCommand,
  floating = true,
  wakeWord,
  lang,
  className,
  listeningLabel = 'Listening',
  idleLabel = 'Voice',
}: VoiceCommandButtonProps) {
  const { isSupported, isListening, interimTranscript, lastMatch, error, toggle } = useVoiceInput({
    commands,
    onCommand,
    wakeWord,
    lang,
  });

  // Flash a confirmation chip for 1.8s after each match, then fade.
  const [confirmation, setConfirmation] = useState<string | null>(null);
  useEffect(() => {
    if (!lastMatch) return;
    setConfirmation(lastMatch.command.label);
    const t = window.setTimeout(() => setConfirmation(null), 1800);
    return () => window.clearTimeout(t);
  }, [lastMatch]);

  if (!isSupported) return null;

  const wrapperClass = floating
    ? 'fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 rtl:right-auto rtl:left-6'
    : 'inline-flex flex-col items-end gap-2';

  return (
    <div className={wrapperClass}>
      {/* Interim transcript pill — floats above the mic while listening. */}
      {isListening && interimTranscript && (
        <div className="max-w-xs rounded-full bg-foreground text-background px-4 py-1.5 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="opacity-70 mr-1">…</span>
          {interimTranscript}
        </div>
      )}
      {/* Just-matched confirmation chip */}
      {confirmation && !interimTranscript && (
        <div className="rounded-full bg-emerald-500 text-white px-4 py-1.5 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          ✓ {confirmation}
        </div>
      )}
      {/* Permission-denied tooltip */}
      {error === 'mic-denied' && (
        <div className="max-w-xs rounded-lg bg-destructive text-destructive-foreground px-3 py-2 text-xs shadow-lg">
          Microphone access blocked. Enable it in browser settings to use voice commands.
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
        aria-pressed={isListening}
        className={cn(
          'group relative flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isListening
            ? 'bg-destructive text-destructive-foreground border-destructive'
            : 'bg-primary text-primary-foreground border-primary hover:scale-105',
          className,
        )}
      >
        {/* Pulsing ring while listening — visual "we hear you" signal. */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse" />
          </>
        )}
        {isListening ? (
          <Radio className="relative h-6 w-6" />
        ) : (
          <Mic className="relative h-6 w-6" />
        )}
      </button>
      {/* Static text label under the mic for clarity */}
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {isListening ? listeningLabel : idleLabel}
      </span>
    </div>
  );
}

/**
 * Tiny helper component for the mic icon in a toggle/action slot (non-floating).
 * Useful when you just want a pill-shaped toggle somewhere inline.
 */
export function VoiceCommandToggle({
  commands,
  onCommand,
  className,
}: Pick<VoiceCommandButtonProps, 'commands' | 'onCommand' | 'className'>) {
  const { isSupported, isListening, toggle } = useVoiceInput({ commands, onCommand });
  if (!isSupported) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
      aria-pressed={isListening}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        isListening
          ? 'bg-destructive text-destructive-foreground border-destructive'
          : 'bg-background hover:bg-muted',
        className,
      )}
    >
      {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
      {isListening ? 'Listening' : 'Voice'}
    </button>
  );
}
