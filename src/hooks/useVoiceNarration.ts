/**
 * Voice Narration Hook
 *
 * Uses the browser Web Speech API (SpeechSynthesis) to read text aloud.
 * Zero cost, works offline, no API keys required.
 *
 * Features:
 * - Auto-select a natural English voice (prefers en-GB/en-US neural voices)
 * - Cancel previous utterance when a new one starts
 * - User preference persisted to localStorage (voice on/off)
 * - Per-utterance onEnd callback for chaining
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
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const toggleEnabled = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem(VOICE_PREF_KEY, String(next));
      } catch { /* ignore */ }
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  }, []);

  /**
   * Pick the best voice for a given role.
   * Dispatcher: prefer crisp authoritative voice (male, en-GB/en-US)
   * Patient: prefer natural conversational voice
   * Narrator: default high-quality voice
   */
  const pickVoice = useCallback((role: VoiceRole): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    if (voices.length === 0) return null;

    // Prefer en-GB or en-US voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
    if (englishVoices.length === 0) return voices[0];

    // Prefer neural/premium voices (names often contain "Google", "Premium", "Enhanced", "Neural")
    const premiumPatterns = /google|premium|enhanced|neural|siri|microsoft/i;
    const premiumVoices = englishVoices.filter(v => premiumPatterns.test(v.name));
    const candidateVoices = premiumVoices.length > 0 ? premiumVoices : englishVoices;

    // Role-specific preferences
    if (role === 'dispatcher') {
      // Dispatcher: prefer authoritative male voices
      const male = candidateVoices.find(v => /male|daniel|alex|george|david|james/i.test(v.name));
      if (male) return male;
    }
    if (role === 'patient') {
      // Patient: prefer natural conversational voices
      const natural = candidateVoices.find(v => /natural|aria|samantha|emma|karen/i.test(v.name));
      if (natural) return natural;
    }

    return candidateVoices[0];
  }, []);

  /**
   * Speak the given text aloud. Cancels any currently-speaking utterance first.
   */
  const speak = useCallback((text: string, options: SpeakOptions = {}) => {
    if (!enabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text || !text.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(options.role || 'narrator');
    if (voice) utterance.voice = voice;

    // Role-specific tone adjustments
    if (options.role === 'dispatcher') {
      utterance.rate = options.rate ?? 1.05;
      utterance.pitch = options.pitch ?? 0.95;
    } else if (options.role === 'patient') {
      utterance.rate = options.rate ?? 0.95;
      utterance.pitch = options.pitch ?? 1.0;
    } else {
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (currentUtteranceRef.current === utterance) {
        currentUtteranceRef.current = null;
      }
      options.onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (currentUtteranceRef.current === utterance) {
        currentUtteranceRef.current = null;
      }
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [enabled, pickVoice]);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
