/**
 * Voice Narration Hook — Humanised Edition
 *
 * Uses the browser Web Speech API (SpeechSynthesis) to read text aloud.
 * Zero cost, works offline, no API keys required.
 *
 * Humanisation techniques used here:
 * 1. Explicit priority list for highest-quality OS voices (Samantha, Daniel,
 *    Google UK English, Microsoft Aria/Guy Natural, etc.), with a hard
 *    blacklist of novelty voices (Fred, Albert, Zarvox, Bad News, etc.).
 * 2. Sentence-level chunking so long paragraphs are broken into natural
 *    phrases with micro-pauses between sentences — this alone eliminates
 *    most of the "robot reading a wall of text" effect.
 * 3. Subtle per-chunk prosody jitter (±2% rate, ±3% pitch) to avoid the
 *    monotone flatline that makes TTS sound synthetic.
 * 4. Role-specific base pitch/rate/pause profiles:
 *      - dispatcher: slightly faster + lower pitch, radio-call cadence
 *      - patient:    slower + neutral pitch, breathier pauses
 *      - narrator:   neutral, slightly more expressive
 * 5. Text normalisation: expand medical abbreviations (BP → "B P",
 *    SpO2 → "sats", mg → "milligrams") and insert natural pauses for
 *    commas, colons, and em-dashes.
 * 6. Utterance queue with gap timing instead of a single massive string.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const VOICE_PREF_KEY = 'paramedic-studio-voice-enabled';

type VoiceRole = 'dispatcher' | 'patient' | 'narrator';

interface SpeakOptions {
  role?: VoiceRole;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
}

interface RoleProfile {
  baseRate: number;
  basePitch: number;
  // Pause in ms inserted between sentence chunks
  interSentenceGapMs: number;
  // Pause in ms inserted between clause chunks (commas, semicolons, colons)
  interClauseGapMs: number;
}

const ROLE_PROFILES: Record<VoiceRole, RoleProfile> = {
  dispatcher: {
    baseRate: 1.02,
    basePitch: 0.94,
    interSentenceGapMs: 240,
    interClauseGapMs: 90,
  },
  patient: {
    baseRate: 0.92,
    basePitch: 1.0,
    interSentenceGapMs: 320,
    interClauseGapMs: 130,
  },
  narrator: {
    baseRate: 0.98,
    basePitch: 1.0,
    interSentenceGapMs: 260,
    interClauseGapMs: 100,
  },
};

// Explicit priority order of high-quality voices by name substring.
// Order matters — first match wins.
const HIGH_QUALITY_VOICES: Record<VoiceRole, string[]> = {
  dispatcher: [
    // macOS / iOS
    'Daniel (Enhanced)', 'Daniel',
    'Oliver (Enhanced)', 'Oliver',
    'Alex',
    'Arthur',
    'Gordon',
    // Google (Chrome)
    'Google UK English Male',
    'Google US English',
    // Microsoft Edge natural
    'Microsoft Guy Online (Natural)',
    'Microsoft Ryan Online (Natural)',
    'Microsoft Davis Online (Natural)',
    'Microsoft Tony Online (Natural)',
    'Microsoft George',
  ],
  patient: [
    'Samantha (Enhanced)', 'Samantha',
    'Serena (Enhanced)', 'Serena',
    'Karen',
    'Moira',
    'Fiona',
    'Google UK English Female',
    'Microsoft Aria Online (Natural)',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Emma Online (Natural)',
    'Microsoft Libby Online (Natural)',
  ],
  narrator: [
    'Samantha (Enhanced)', 'Samantha',
    'Serena (Enhanced)', 'Serena',
    'Ava (Enhanced)', 'Ava',
    'Google UK English Female',
    'Microsoft Aria Online (Natural)',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Sonia Online (Natural)',
  ],
};

// macOS novelty voices — unlistenable for clinical narration.
const VOICE_BLACKLIST = /^(fred|albert|zarvox|bad news|good news|bahh|bells|boing|bubbles|cellos|deranged|hysterical|jester|junior|kathy|organ|pipe organ|princess|ralph|trinoids|whisper|wobble|superstar|grandma|grandpa|shelley|sandy|rocko|reed|eddy|flo)\b/i;

function jitter(value: number, amount: number): number {
  // Returns value ± random(0, amount)
  return value + (Math.random() * 2 - 1) * amount;
}

/**
 * Split text into speakable chunks on sentence boundaries.
 * Also splits very long sentences on commas/semicolons so the voice
 * has a chance to "breathe" mid-sentence.
 */
function chunkText(text: string): Array<{ text: string; terminal: boolean }> {
  // First pass: split on sentence terminators while keeping them.
  const sentenceRegex = /[^.!?]+[.!?]+|[^.!?]+$/g;
  const sentences = text.match(sentenceRegex)?.map(s => s.trim()).filter(Boolean) ?? [text.trim()];

  const chunks: Array<{ text: string; terminal: boolean }> = [];
  for (const sentence of sentences) {
    // If a sentence is very long (> ~120 chars), sub-split on commas/semicolons
    if (sentence.length > 120) {
      const parts = sentence.split(/([,;:—–])/);
      // Re-stitch pairs so the punctuation stays with the preceding clause
      const clauses: string[] = [];
      for (let i = 0; i < parts.length; i += 2) {
        const clause = (parts[i] ?? '').trim() + (parts[i + 1] ?? '');
        if (clause.trim()) clauses.push(clause.trim());
      }
      clauses.forEach((c, idx) => {
        chunks.push({ text: c, terminal: idx === clauses.length - 1 });
      });
    } else {
      chunks.push({ text: sentence, terminal: true });
    }
  }
  return chunks;
}

/**
 * Expand clinical abbreviations for more natural pronunciation.
 * Web Speech API voices otherwise spell them letter-by-letter or butcher them.
 */
function normaliseForSpeech(text: string): string {
  return text
    // Vital signs & units
    .replace(/\bSpO2\b/gi, 'sats')
    .replace(/\bBP\b/g, 'B P')
    .replace(/\bHR\b/g, 'heart rate')
    .replace(/\bRR\b/g, 'resp rate')
    .replace(/\bGCS\b/g, 'G C S')
    .replace(/\bBGL\b/g, 'blood glucose')
    .replace(/\bETA\b/g, 'E T A')
    .replace(/\bECG\b/g, 'E C G')
    .replace(/\bIV\b/g, 'I V')
    .replace(/\bIM\b/g, 'I M')
    .replace(/\bNG\b/g, 'N G')
    .replace(/\bOG\b/g, 'O G')
    .replace(/\bOPA\b/g, 'O P A')
    .replace(/\bNPA\b/g, 'N P A')
    .replace(/\bBVM\b/g, 'B V M')
    .replace(/\bCPR\b/g, 'C P R')
    .replace(/\bROSC\b/g, 'rosk')
    .replace(/\bACLS\b/g, 'A C L S')
    .replace(/\bSTEMI\b/g, 'stemmy')
    .replace(/\bNSTEMI\b/g, 'N stemmy')
    .replace(/\bACS\b/g, 'A C S')
    .replace(/\bCVA\b/g, 'C V A')
    .replace(/\bTIA\b/g, 'T I A')
    .replace(/\bCOPD\b/g, 'C O P D')
    .replace(/\bDKA\b/g, 'D K A')
    .replace(/\bHHS\b/g, 'H H S')
    .replace(/\bPCI\b/g, 'P C I')
    .replace(/\bCCU\b/g, 'C C U')
    .replace(/\bICU\b/g, 'I C U')
    .replace(/\bED\b/g, 'E D')
    .replace(/\bLVEF\b/g, 'L V E F')
    .replace(/\bNIHSS\b/g, 'N I H S S')
    .replace(/\bABG\b/g, 'A B G')
    .replace(/\bFBC\b/g, 'F B C')
    .replace(/\bU&E\b/g, 'U and E')
    .replace(/\bCRP\b/g, 'C R P')
    .replace(/\bGTN\b/g, 'G T N')
    .replace(/\bC-spine\b/gi, 'C spine')
    .replace(/\bVF\b/g, 'V fib')
    .replace(/\bVT\b/g, 'V tach')
    .replace(/\bPEA\b/g, 'P E A')
    .replace(/\bTBSA\b/g, 'total body surface area')
    // Doses — "5mg" → "5 milligrams"
    .replace(/(\d+(?:\.\d+)?)\s*mg\b/gi, '$1 milligrams')
    .replace(/(\d+(?:\.\d+)?)\s*mcg\b/gi, '$1 micrograms')
    .replace(/(\d+(?:\.\d+)?)\s*mL\b/g, '$1 millilitres')
    .replace(/(\d+(?:\.\d+)?)\s*kg\b/gi, '$1 kilograms')
    // Temperature
    .replace(/(\d+(?:\.\d+)?)\s*°?C\b/g, '$1 degrees')
    // Vital sign slash: "120/80" → "120 over 80"
    .replace(/(\d{2,3})\/(\d{2,3})/g, '$1 over $2')
    // Soft em-dash/hyphen as pause
    .replace(/—/g, ', ')
    .replace(/\s-\s/g, ', ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export function useVoiceNarration() {
  const [voicesReady, setVoicesReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(VOICE_PREF_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  // Track pending chunk timeouts so we can cancel them
  const queueTimersRef = useRef<number[]>([]);
  const sessionIdRef = useRef(0);

  // Load voices (async in some browsers)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        setVoicesReady(true);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const clearQueueTimers = useCallback(() => {
    queueTimersRef.current.forEach(id => window.clearTimeout(id));
    queueTimersRef.current = [];
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem(VOICE_PREF_KEY, String(next));
      } catch { /* ignore */ }
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        clearQueueTimers();
        setIsSpeaking(false);
      }
      return next;
    });
  }, [clearQueueTimers]);

  /**
   * Pick the best voice for a given role using an explicit priority list,
   * then fall back to generic heuristics. Novelty voices are blacklisted.
   */
  const pickVoice = useCallback((role: VoiceRole): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    if (voices.length === 0) return null;

    // Drop novelty voices immediately
    const usable = voices.filter(v => !VOICE_BLACKLIST.test(v.name));

    // Respect the <html lang> attribute. Arabic users should hear an Arabic
    // voice; anything else falls back to the English priority list below.
    const docLang = typeof document !== 'undefined' ? (document.documentElement.lang || '').toLowerCase() : '';
    if (docLang.startsWith('ar')) {
      // Prefer high-quality Arabic voices by common names, then any ar-* voice.
      const arabicPriority = [
        'Majed (Enhanced)', 'Majed', 'Tarik', 'Maged', 'Laila',
        'Microsoft Hamed', 'Microsoft Naayf', 'Microsoft Shakir', 'Microsoft Salma',
        'Google العربية',
      ];
      for (const name of arabicPriority) {
        const m = usable.find(v => v.name === name || v.name.toLowerCase().includes(name.toLowerCase()));
        if (m) return m;
      }
      const anyArabic = usable.find(v => v.lang.toLowerCase().startsWith('ar'));
      if (anyArabic) return anyArabic;
      // No Arabic voice installed — fall through to English rather than a
      // novelty voice or whatever is first in the list.
    }

    // Prefer English locales
    const englishVoices = usable.filter(v => v.lang.startsWith('en-'));
    const pool = englishVoices.length > 0 ? englishVoices : usable;

    // 1. Walk explicit priority list for this role
    const priorityList = HIGH_QUALITY_VOICES[role];
    for (const name of priorityList) {
      const match = pool.find(v => v.name === name);
      if (match) return match;
    }
    // Partial match on the priority list (handles minor name variations)
    for (const name of priorityList) {
      const lower = name.toLowerCase();
      const match = pool.find(v => v.name.toLowerCase().includes(lower));
      if (match) return match;
    }

    // 2. Fallback: any voice with "Natural", "Enhanced", or "Neural" in the name
    const neural = pool.find(v => /natural|enhanced|neural|premium/i.test(v.name));
    if (neural) return neural;

    // 3. Fallback: Google voices (Chrome default)
    const google = pool.find(v => /google/i.test(v.name));
    if (google) return google;

    // 4. Last resort: first English voice or first voice
    return pool[0] || voices[0];
  }, []);

  /**
   * Speak the given text aloud. Cancels any currently-speaking utterance first.
   * Long text is broken into chunks so the voice has natural pauses and breath.
   */
  const speak = useCallback((text: string, options: SpeakOptions = {}) => {
    if (!enabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text || !text.trim()) return;

    // Cancel any ongoing speech and pending queue
    window.speechSynthesis.cancel();
    clearQueueTimers();

    const role = options.role || 'narrator';
    const profile = ROLE_PROFILES[role];
    const voice = pickVoice(role);
    const normalised = normaliseForSpeech(text);
    const chunks = chunkText(normalised);

    // Bump session id — any timers from prior calls that fire late will bail out
    sessionIdRef.current += 1;
    const mySession = sessionIdRef.current;

    setIsSpeaking(true);

    let chunkIndex = 0;
    const speakNext = () => {
      if (mySession !== sessionIdRef.current) return; // superseded
      if (chunkIndex >= chunks.length) {
        setIsSpeaking(false);
        options.onEnd?.();
        return;
      }
      const chunk = chunks[chunkIndex];
      chunkIndex += 1;

      const utterance = new SpeechSynthesisUtterance(chunk.text);
      if (voice) utterance.voice = voice;

      // Apply role profile with subtle per-chunk jitter for natural variation
      const baseRate = options.rate ?? profile.baseRate;
      const basePitch = options.pitch ?? profile.basePitch;
      utterance.rate = Math.max(0.7, Math.min(1.3, jitter(baseRate, 0.02)));
      utterance.pitch = Math.max(0.6, Math.min(1.4, jitter(basePitch, 0.03)));
      utterance.volume = 1;

      utterance.onend = () => {
        if (mySession !== sessionIdRef.current) return;
        const gap = chunk.terminal ? profile.interSentenceGapMs : profile.interClauseGapMs;
        // Small randomisation on the gap too, so cadence isn't metronomic
        const gapWithJitter = gap + Math.random() * 80 - 40;
        const timer = window.setTimeout(speakNext, Math.max(30, gapWithJitter));
        queueTimersRef.current.push(timer);
      };
      utterance.onerror = () => {
        if (mySession !== sessionIdRef.current) return;
        // On error, advance to next chunk rather than stalling the whole queue
        const timer = window.setTimeout(speakNext, 60);
        queueTimersRef.current.push(timer);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [enabled, pickVoice, clearQueueTimers]);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    sessionIdRef.current += 1; // invalidate any pending callbacks
    window.speechSynthesis.cancel();
    clearQueueTimers();
    setIsSpeaking(false);
  }, [clearQueueTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      clearQueueTimers();
    };
  }, [clearQueueTimers]);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return {
    speak,
    stop,
    isSpeaking,
    enabled,
    toggleEnabled,
    isSupported,
    voicesReady,
  };
}
