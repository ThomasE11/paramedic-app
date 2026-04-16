/**
 * useVoiceInput — hands-free paramedic command recognition
 *
 * Uses the browser Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * to let a student talk through their assessment: "check airway", "take vitals",
 * "give adrenaline 1 milligram IV". Zero API cost, no server, works offline once
 * the page is loaded. Chrome-family browsers only (Chrome, Edge, Safari iOS 14.5+);
 * Firefox returns `isSupported: false` and the UI should hide the mic button.
 *
 * Design decisions
 * ----------------
 * 1. **Continuous + interim** — we keep the recogniser running and surface
 *    interim transcripts live, so the student sees "checking ai..." → "checking
 *    airway" as they talk. Finalisation triggers command matching.
 *
 * 2. **Auto-restart** — browsers silently end the session every 30-60s of
 *    silence. We listen for `onend` and restart unless the hook owner has
 *    called `stop()` explicitly.
 *
 * 3. **Command registry passed in, not hard-coded** — different screens
 *    (primary survey vs treatment panel vs classroom) care about different
 *    commands. The caller passes `commands: VoiceCommand[]` and we return
 *    the best match with a confidence score. Keeps the hook reusable.
 *
 * 4. **Phonetic-ish matching** — browsers sometimes return "check a way"
 *    for "check airway" or "atropine" as "a tropene". We normalise both
 *    sides (lowercase, strip punctuation, expand medical shorthand) and
 *    score by token overlap + longest common subsequence. Pragmatic and
 *    good enough for the core vocabulary without a model.
 *
 * 5. **Wake-word friendly** — `matchPrefix` lets callers gate commands
 *    behind "medic, ..." if they want push-to-talk to feel more natural.
 *    Default off.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface VoiceCommand {
  /** Stable identifier the caller uses to route the action. */
  id: string;
  /** Human-friendly label (also used as a matching target). */
  label: string;
  /** Extra phrases that should map to the same command (synonyms, shorthand). */
  aliases?: string[];
  /**
   * Optional slot name. If provided, the recogniser will try to pull a free-text
   * value that comes after the matched phrase (e.g. "give adrenaline 1 mg IV"
   * with label "give" and slot "drug" yields { drug: "adrenaline 1 mg iv" }).
   */
  slot?: string;
}

export interface VoiceMatch {
  command: VoiceCommand;
  /** 0..1 — rough confidence in the match. */
  score: number;
  /** The raw transcript that produced the match. */
  rawTranscript: string;
  /** The slot value, if the command declared a slot and a value was captured. */
  slotValue?: string;
}

export interface UseVoiceInputOptions {
  /** Commands to match incoming transcripts against. Pass [] to disable matching. */
  commands?: VoiceCommand[];
  /**
   * Fires for every final transcript that matched a command with confidence
   * above `minConfidence`. Fires once per utterance.
   */
  onCommand?: (match: VoiceMatch) => void;
  /** Minimum score to fire `onCommand`. Default 0.5. */
  minConfidence?: number;
  /** BCP-47 language tag. Defaults to navigator language → en-US. */
  lang?: string;
  /**
   * Require this wake-word / prefix before commands fire (e.g. "medic").
   * Matched case-insensitively. Default: none.
   */
  wakeWord?: string;
}

interface UseVoiceInputResult {
  /** True when the Web Speech API is available on this browser. */
  isSupported: boolean;
  /** True when the recogniser is actively listening. */
  isListening: boolean;
  /** Rolling interim transcript (updates live as the user speaks). */
  interimTranscript: string;
  /** Last finalised transcript (the utterance just committed). */
  finalTranscript: string;
  /** Last successful command match. */
  lastMatch: VoiceMatch | null;
  /** Last error code from the browser, if any. */
  error: string | null;
  /** Start listening. Noop if already listening or unsupported. */
  start: () => Promise<void>;
  /** Stop listening — ends the session permanently until start() is called again. */
  stop: () => void;
  /** Toggle convenience. */
  toggle: () => void;
}

// ============================================================================
// Normalisation — used on both transcript and command aliases
// ============================================================================

/**
 * Turn "Check A.B.C.D.E." or "Give 1 mg Adrenaline IV" into a canonical form
 * that matches regardless of punctuation, case, common medical spellings, or
 * spaces between letters. Keeps numbers intact.
 */
function normalise(s: string): string {
  return s
    .toLowerCase()
    // Common misrecognitions the browser produces for clinical words:
    .replace(/\badrenalin\b/g, 'adrenaline')
    .replace(/\bepi\b/g, 'adrenaline')
    .replace(/\bepinephrine\b/g, 'adrenaline')
    .replace(/\bsalbutamol\b/g, 'salbutamol')
    .replace(/\balbuterol\b/g, 'salbutamol')
    .replace(/\ba tropine\b/g, 'atropine')
    .replace(/\ba way\b/g, 'airway')
    .replace(/\bear way\b/g, 'airway')
    .replace(/\bea bc d e\b/g, 'abcde')
    .replace(/\bi\s*v\b/g, 'iv')
    .replace(/\bi\s*m\b/g, 'im')
    .replace(/\bi\s*o\b/g, 'io')
    .replace(/\bec g\b/g, 'ecg')
    .replace(/\be k g\b/g, 'ecg')
    .replace(/\bs p o 2\b/g, 'spo2')
    .replace(/\bs\s*p\s*o\s*2\b/g, 'spo2')
    .replace(/\bsats?\b/g, 'spo2')
    .replace(/\bb\s*p\b/g, 'blood pressure')
    .replace(/\bmilligrams?\b/g, 'mg')
    .replace(/\bmicrograms?\b/g, 'mcg')
    // Strip punctuation that doesn't carry semantic weight.
    .replace(/[.,;:!?'"()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenise(s: string): string[] {
  return normalise(s).split(' ').filter(Boolean);
}

/**
 * Overlap-plus-LCS similarity in [0..1].
 *
 * - Token overlap handles word-order tolerance ("airway check" == "check airway").
 * - Longest-common-subsequence keeps partial credit when the user says extra
 *   words ("can you check the airway please").
 */
function similarity(a: string, b: string): number {
  const ta = tokenise(a);
  const tb = tokenise(b);
  if (ta.length === 0 || tb.length === 0) return 0;

  const setA = new Set(ta);
  const setB = new Set(tb);
  let overlap = 0;
  for (const t of setA) if (setB.has(t)) overlap += 1;
  const jaccard = overlap / new Set([...ta, ...tb]).size;

  // LCS on tokens — dynamic programming, small strings so fine.
  const dp = Array.from({ length: ta.length + 1 }, () => new Array(tb.length + 1).fill(0));
  for (let i = 1; i <= ta.length; i++) {
    for (let j = 1; j <= tb.length; j++) {
      dp[i][j] = ta[i - 1] === tb[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const lcs = dp[ta.length][tb.length] / Math.max(ta.length, tb.length);

  // Weight LCS higher — order-aware matches should beat bag-of-words.
  return 0.4 * jaccard + 0.6 * lcs;
}

/** Find the best command match above `min`. Returns null if none qualifies. */
function matchCommand(
  transcript: string,
  commands: VoiceCommand[],
  min: number,
): { command: VoiceCommand; score: number; slotValue?: string } | null {
  let best: { command: VoiceCommand; score: number; slotValue?: string } | null = null;
  for (const cmd of commands) {
    const candidates = [cmd.label, ...(cmd.aliases ?? [])];
    for (const phrase of candidates) {
      const s = similarity(phrase, transcript);
      if (s < min) continue;

      let slotValue: string | undefined;
      if (cmd.slot) {
        // If the label occurs verbatim as a prefix, capture the tail as the slot.
        const normT = normalise(transcript);
        const normP = normalise(phrase);
        const idx = normT.indexOf(normP);
        if (idx >= 0) {
          const tail = normT.slice(idx + normP.length).trim();
          if (tail) slotValue = tail;
        }
      }

      if (!best || s > best.score) best = { command: cmd, score: s, slotValue };
    }
  }
  return best;
}

// ============================================================================
// Hook
// ============================================================================

// Browser vendor prefixing — Chrome still only exposes webkitSpeechRecognition.
// Use `any` locally because the browser types are inconsistent and the hook
// already encapsulates everything the caller sees.
type AnyRecognition = any;

function getRecognitionCtor(): AnyRecognition {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: AnyRecognition;
    webkitSpeechRecognition?: AnyRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const { commands = [], onCommand, minConfidence = 0.5, lang, wakeWord } = options;

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [lastMatch, setLastMatch] = useState<VoiceMatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const keepAliveRef = useRef(false);
  // Keep the latest closure args in refs so the recogniser instance doesn't
  // need to be torn down when `commands` changes.
  const commandsRef = useRef(commands);
  const onCommandRef = useRef(onCommand);
  const minConfidenceRef = useRef(minConfidence);
  const wakeWordRef = useRef(wakeWord);

  useEffect(() => { commandsRef.current = commands; }, [commands]);
  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { minConfidenceRef.current = minConfidence; }, [minConfidence]);
  useEffect(() => { wakeWordRef.current = wakeWord; }, [wakeWord]);

  const isSupported = getRecognitionCtor() !== null;

  const handleFinal = useCallback((raw: string) => {
    let text = raw;
    const wake = wakeWordRef.current;
    if (wake) {
      // Require the wake word as a prefix (case-insensitive); strip it before
      // matching so commands stay natural ("medic, check airway").
      const re = new RegExp(`^\\s*${wake}\\s*[,:.-]?\\s*`, 'i');
      if (!re.test(text)) return;
      text = text.replace(re, '');
    }
    const match = matchCommand(text, commandsRef.current, minConfidenceRef.current);
    if (match) {
      const result: VoiceMatch = {
        command: match.command,
        score: match.score,
        rawTranscript: raw,
        slotValue: match.slotValue,
      };
      setLastMatch(result);
      onCommandRef.current?.(result);
    }
  }, []);

  const buildRecogniser = useCallback((): any | null => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    rec.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          setFinalTranscript(text);
          setInterimTranscript('');
          handleFinal(text);
        } else {
          interim += text;
        }
      }
      if (interim) setInterimTranscript(interim);
    };
    rec.onerror = (event: any) => {
      // 'no-speech' fires routinely on silence; don't surface it as a real error.
      if (event.error && event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error);
      }
    };
    rec.onend = () => {
      setIsListening(false);
      // Browsers auto-terminate silent sessions. Re-arm if the caller wants
      // to keep listening.
      if (keepAliveRef.current) {
        try {
          rec.start();
        } catch {
          // A race can cause InvalidStateError if start() fires before the
          // end event settles. Schedule a tiny retry.
          setTimeout(() => {
            if (keepAliveRef.current) {
              try { rec.start(); } catch { /* give up — user can click mic again */ }
            }
          }, 200);
        }
      }
    };
    return rec;
  }, [lang, handleFinal]);

  const start = useCallback(async () => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }
    if (recognitionRef.current && isListening) return;
    // Request microphone permission explicitly so we can surface a clean
    // error if the user denies it (rather than the browser silently failing).
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // We only needed the permission prompt; release the track immediately.
        stream.getTracks().forEach(t => t.stop());
      }
    } catch {
      setError('mic-denied');
      return;
    }
    if (!recognitionRef.current) recognitionRef.current = buildRecogniser();
    if (!recognitionRef.current) return;
    keepAliveRef.current = true;
    try {
      recognitionRef.current.start();
    } catch {
      // already-started races are benign
    }
  }, [isSupported, isListening, buildRecogniser]);

  const stop = useCallback(() => {
    keepAliveRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop(); else void start();
  }, [isListening, start, stop]);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      keepAliveRef.current = false;
      try { recognitionRef.current?.abort?.(); } catch { /* noop */ }
      recognitionRef.current = null;
    };
  }, []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    finalTranscript,
    lastMatch,
    error,
    start,
    stop,
    toggle,
  };
}
