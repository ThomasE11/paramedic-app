/**
 * Voice Narration Hook — Humanised Edition
 *
 * Primary path: ElevenLabs through same-origin /api/tts. Production serves
 * that endpoint via Vercel Functions; local dev serves it via Vite middleware.
 * Supertonic remains a local-dev backup at 127.0.0.1:7788, and browser
 * SpeechSynthesis is the final fallback so narration still works offline.
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
import type { MutableRefObject } from 'react';

const VOICE_PREF_KEY = 'paramedic-studio-voice-enabled';

function readStoredVoiceEnabled(): boolean {
  try {
    const stored = localStorage.getItem(VOICE_PREF_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

let globalVoiceEnabled = readStoredVoiceEnabled();
const globalVoiceEnabledListeners = new Set<(enabled: boolean) => void>();

export function getVoiceEnabledPreference(): boolean {
  return globalVoiceEnabled;
}

export function subscribeVoiceEnabledPreference(listener: (enabled: boolean) => void): () => void {
  globalVoiceEnabledListeners.add(listener);
  listener(globalVoiceEnabled);
  return () => { globalVoiceEnabledListeners.delete(listener); };
}

export function setVoiceEnabledPreference(next: boolean): void {
  globalVoiceEnabled = next;
  try {
    localStorage.setItem(VOICE_PREF_KEY, String(next));
  } catch { /* ignore */ }
  globalVoiceEnabledListeners.forEach(listener => listener(next));
  if (!next) stopNarrationSession();
}

// Supertonic local server (dev only). We use the NATIVE /v1/tts endpoint
// (not /v1/audio/speech) because only the native route exposes `steps` —
// the diffusion step count that dominates latency. Measured on this machine:
// steps 2≈4s, 4≈7s, 8≈12s, default≈14.5s for a 3-sentence paragraph. The
// OpenAI-compat route ran at the default and always blew the timeout, which
// is why narration kept falling back to the robotic Web Speech voice.
//
// We synthesise sentence-by-sentence with one-ahead prefetch, so the FIRST
// words start in ~1.5s instead of waiting for the whole paragraph.
const SUPERTONIC_URL = 'http://127.0.0.1:7788/v1/tts';
// The dev server performs this optional localhost probe on the browser's
// behalf. A caught browser fetch to a missing port still emits a red
// ERR_CONNECTION_REFUSED resource error; the same-origin proxy can degrade
// quietly to Web Speech while preserving automatic Supertonic discovery.
const SUPERTONIC_HEALTH = '/api/supertonic/health';
// Diffusion steps — quality/speed tradeoff. The server is SERIAL (~50ms/char
// at steps 4), so to keep latency reasonable on a one-shot whole-utterance
// synth we run at 3 (still clean, ~25-35% faster than 4).
const SUPERTONIC_STEPS = 3;
// Whole-utterance timeout. We now synthesise the entire narration in ONE
// request (see SINGLE_SHOT_MAX_CHARS) so allow generous headroom for a long
// paragraph before declaring the server dead.
const SUPERTONIC_TIMEOUT_MS = 26000;

// --- Autoplay unlock --------------------------------------------------------
// Chrome/Safari block HTMLAudioElement.play() that isn't tied to a user
// gesture. The dispatch narration fires from a timer (no gesture on the call
// stack), so its Supertonic audio gets blocked and the app silently falls
// back to the robotic Web Speech voice — exactly the bug the Director hit.
//
// Standard fix: on the first real user gesture, play a tiny silent clip to
// "unlock" the page's audio for the rest of the session. After that,
// timer-initiated Audio.play() is permitted. The user always clicks through
// role-select → category → Generate before the dispatch fires, so by the time
// it plays, audio is unlocked.
let audioUnlocked = false;
let unlockListenersAttached = false;
// 44-byte silent WAV (RIFF header + empty data chunk).
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
function attemptAudioUnlock(): void {
  if (audioUnlocked || typeof window === 'undefined') return;
  try {
    const a = new Audio(SILENT_WAV);
    a.volume = 0;
    const p = a.play();
    if (p && typeof p.then === 'function') {
      p.then(() => { audioUnlocked = true; }).catch(() => { /* gesture not yet trusted */ });
    } else {
      audioUnlocked = true;
    }
  } catch { /* ignore */ }
}
function ensureUnlockListeners(): void {
  if (unlockListenersAttached || typeof window === 'undefined') return;
  unlockListenersAttached = true;
  const handler = () => attemptAudioUnlock();
  for (const evt of ['pointerdown', 'keydown', 'touchstart', 'click'] as const) {
    window.addEventListener(evt, handler, { capture: true, passive: true });
  }
}

export type MediaPlaybackAttempt = 'playing' | 'error' | 'cancelled';

export async function playAudioWithRetry(
  audio: Pick<HTMLAudioElement, 'play'>,
  isCurrent: () => boolean,
): Promise<MediaPlaybackAttempt> {
  try {
    await audio.play();
    return isCurrent() ? 'playing' : 'cancelled';
  } catch {
    attemptAudioUnlock();
    await new Promise(resolve => setTimeout(resolve, 120));
    if (!isCurrent()) return 'cancelled';
    try {
      await audio.play();
      return isCurrent() ? 'playing' : 'cancelled';
    } catch {
      return isCurrent() ? 'error' : 'cancelled';
    }
  }
}

// --- Global playback arbitration -------------------------------------------
// Several surfaces call useVoiceNarration independently: dispatch replay,
// SceneSurveyPanel, patient reactions, and generic NarrationButton instances.
// Browser SpeechSynthesis is global, but ElevenLabs/Supertonic playback uses
// HTMLAudioElement objects. If those are stored per-hook, each surface can
// pause only its own audio, which lets dispatch and scene narration overlap.
// These module-level refs make narration a single shared lane across the app.
export type VoiceRole = 'dispatcher' | 'patient' | 'narrator';
export type VoicePlaybackStatus = 'idle' | 'loading' | 'speaking' | 'error';
export interface PatientVoiceProfile {
  gender?: 'male' | 'female';
}

interface VoicePlaybackState {
  sessionId: number;
  role: VoiceRole | null;
  status: VoicePlaybackStatus;
}

let globalVoiceSessionId = 0;
let globalActiveAudio: HTMLAudioElement | null = null;
let globalCancelAudioCompletion: (() => void) | null = null;
let globalQueueTimers: number[] = [];
let globalIsSpeaking = false;
let globalSyntheticMouthActive = false;
let globalPlaybackState: VoicePlaybackState = {
  sessionId: globalVoiceSessionId,
  role: null,
  status: 'idle',
};
const globalSpeakingListeners = new Set<(speaking: boolean) => void>();
const globalPlaybackListeners = new Set<(state: VoicePlaybackState) => void>();

export function derivePlaybackSignals(
  status: VoicePlaybackStatus,
  role: VoiceRole | null,
): { busy: boolean; audiblePatient: boolean } {
  return {
    busy: status === 'loading' || status === 'speaking',
    audiblePatient: status === 'speaking' && role === 'patient',
  };
}

function setGlobalSpeaking(next: boolean): void {
  globalIsSpeaking = next;
  globalSpeakingListeners.forEach(listener => listener(next));
}

function publishPlaybackState(next: VoicePlaybackState): void {
  globalPlaybackState = next;
  setGlobalSpeaking(derivePlaybackSignals(next.status, next.role).busy);
  globalPlaybackListeners.forEach(listener => listener(next));
  startMouthLoop();
}

function setCurrentPlaybackStatus(sessionId: number, status: VoicePlaybackStatus): void {
  if (!isCurrentNarrationSession(sessionId)) return;
  publishPlaybackState({ ...globalPlaybackState, sessionId, status });
}

function clearGlobalQueueTimers(): void {
  if (typeof window === 'undefined') {
    globalQueueTimers = [];
    return;
  }
  globalQueueTimers.forEach(id => window.clearTimeout(id));
  globalQueueTimers = [];
}

function releaseAudio(audio: HTMLAudioElement): void {
  audio.onended = null;
  audio.onerror = null;
  try { audio.pause(); } catch { /* ignore */ }
  try { audio.currentTime = 0; } catch { /* ignore */ }
  try { elementSources.get(audio)?.disconnect(); } catch { /* ignore */ }
  try { if (audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src); } catch { /* ignore */ }
}

function stopActiveAudio(): void {
  const audio = globalActiveAudio;
  globalActiveAudio = null;
  // Pausing does not dispatch ended/error. Settle the local queue explicitly
  // so an interrupted answer can release its prefetched clip and finish.
  const cancelCompletion = globalCancelAudioCompletion;
  globalCancelAudioCompletion = null;
  cancelCompletion?.();
  if (audio) releaseAudio(audio);
}

function stopCurrentPlayback(): void {
  globalSyntheticMouthActive = false;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  stopActiveAudio();
  clearGlobalQueueTimers();
}

function startNarrationSession(role: VoiceRole): number {
  globalVoiceSessionId += 1;
  stopCurrentPlayback();
  publishPlaybackState({ sessionId: globalVoiceSessionId, role, status: 'loading' });
  return globalVoiceSessionId;
}

function stopNarrationSession(): void {
  globalVoiceSessionId += 1;
  stopCurrentPlayback();
  publishPlaybackState({ sessionId: globalVoiceSessionId, role: null, status: 'idle' });
}

function isCurrentNarrationSession(sessionId: number): boolean {
  return sessionId === globalVoiceSessionId;
}

function registerQueueTimer(id: number): void {
  globalQueueTimers.push(id);
}

function setActiveAudio(audio: HTMLAudioElement | null): void {
  if (globalActiveAudio && globalActiveAudio !== audio) stopActiveAudio();
  globalActiveAudio = audio;
  if (audio) attachAnalyser(audio);
}

// --- Lip-sync analyser ------------------------------------------------------
// A single shared AudioContext + AnalyserNode taps the currently-playing TTS
// clip and publishes a smoothed 0..1 "mouth open" amplitude that the 3D patient
// reads per-frame to drive the viseme_open morph. The analyser sits inline
// (source → analyser → destination); an AnalyserNode is a pass-through, so it
// adds no audible latency and never blocks playback. RMS is EMA-smoothed to
// stop the jaw juddering on every syllable transient.
//
// Web Speech (SpeechSynthesis) has no media element to tap. Its utterance
// lifecycle therefore enables a conservative syllabic envelope below, so an
// offline patient still moves their mouth while talking instead of speaking
// through a frozen face.
let globalAudioCtx: AudioContext | null = null;
let globalAnalyser: AnalyserNode | null = null;
let analyserData: Uint8Array<ArrayBuffer> | null = null;
// createMediaElementSource throws if called twice on the same element, so cache
// the source per element via a WeakMap.
const elementSources = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
let globalMouthOpen = 0;
let rafId: number | null = null;
const mouthOpenListeners = new Set<MutableRefObject<number>>();

const SPEECH_TAU = Math.PI * 2;

/**
 * Procedural lip opening for SpeechSynthesis, whose audio samples cannot be
 * connected to an AnalyserNode. It supplies frequent closures for consonants
 * and a slower phrase envelope, avoiding both a static open jaw and rapid
 * high-frequency chatter.
 */
export function fallbackSpeechMouthTarget(timeSeconds: number): number {
  const time = Number.isFinite(timeSeconds) ? Math.max(0, timeSeconds) : 0;
  const syllable = Math.max(0, Math.sin(time * SPEECH_TAU * 4.6));
  const phrase = 0.68 + 0.32 * Math.pow(Math.sin(time * SPEECH_TAU * 1.15 + 0.7), 2);
  return 0.055 + Math.pow(syllable, 1.25) * phrase * 0.62;
}

export function mouthTargetForPlayback(
  status: VoicePlaybackStatus,
  role: VoiceRole | null,
  source: 'analysed-audio' | 'web-speech',
  timeSeconds: number,
  rms: number,
): number {
  if (!derivePlaybackSignals(status, role).audiblePatient) return 0;
  if (source === 'web-speech') return fallbackSpeechMouthTarget(timeSeconds);
  return Math.min(1, Math.max(0, Number.isFinite(rms) ? rms : 0) * 5.5);
}

function ensureAudioGraph(): boolean {
  if (typeof window === 'undefined') return false;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return false;
  if (!globalAudioCtx) {
    try {
      globalAudioCtx = new Ctor();
      globalAnalyser = globalAudioCtx.createAnalyser();
      globalAnalyser.fftSize = 512;
      globalAnalyser.smoothingTimeConstant = 0.5;
      globalAnalyser.connect(globalAudioCtx.destination);
      analyserData = new Uint8Array(globalAnalyser.fftSize) as Uint8Array<ArrayBuffer>;
    } catch {
      globalAudioCtx = null;
      globalAnalyser = null;
      return false;
    }
  }
  return !!globalAnalyser;
}

function attachAnalyser(audio: HTMLAudioElement): void {
  if (!ensureAudioGraph() || !globalAudioCtx || !globalAnalyser) return;
  // Autoplay policies can leave the context suspended until a gesture.
  if (globalAudioCtx.state === 'suspended') { globalAudioCtx.resume().catch(() => {}); }
  try {
    let src = elementSources.get(audio);
    if (!src) {
      src = globalAudioCtx.createMediaElementSource(audio);
      elementSources.set(audio, src);
      src.connect(globalAnalyser);
    }
    startMouthLoop();
  } catch {
    // createMediaElementSource can throw on cross-origin/tainted media; the
    // clip still plays via its own element, we just skip lip-sync for it.
  }
}

function startMouthLoop(): void {
  if (rafId !== null || typeof window === 'undefined') return;
  const tick = () => {
    const { status, role } = globalPlaybackState;
    const patientIsAudible = derivePlaybackSignals(status, role).audiblePatient;
    if (globalSyntheticMouthActive && patientIsAudible) {
      const target = mouthTargetForPlayback(
        status,
        role,
        'web-speech',
        performance.now() / 1000,
        0,
      );
      globalMouthOpen += (target - globalMouthOpen) * 0.32;
    } else if (globalAnalyser && analyserData && patientIsAudible) {
      globalAnalyser.getByteTimeDomainData(analyserData);
      let sumSq = 0;
      for (let i = 0; i < analyserData.length; i++) {
        const v = (analyserData[i] - 128) / 128; // -1..1
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / analyserData.length); // ~0..1
      // Cloud/local clips use only measured audio energy. Silence stays shut;
      // the approximate syllabic envelope is reserved for Web Speech because
      // its samples cannot be connected to an analyser.
      const target = mouthTargetForPlayback(
        status,
        role,
        'analysed-audio',
        performance.now() / 1000,
        rms,
      );
      globalMouthOpen += (target - globalMouthOpen) * 0.35;
    } else if (!patientIsAudible) {
      // Role changes, synthesis latency, inter-chunk gaps, errors and explicit
      // cancellation must never leak residual movement into the patient jaw.
      globalMouthOpen = 0;
    } else {
      // Patient audio is playing but this browser could not expose samples.
      globalMouthOpen += (0 - globalMouthOpen) * 0.35;
    }
    mouthOpenListeners.forEach(ref => { ref.current = globalMouthOpen; });
    if (derivePlaybackSignals(globalPlaybackState.status, globalPlaybackState.role).busy
      || globalMouthOpen > 0.01) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  };
  rafId = window.requestAnimationFrame(tick);
}

const SUPERTONIC_VOICE_BY_ROLE: Record<VoiceRole, string> = {
  dispatcher: 'M2',
  patient: 'F1',
  narrator: 'F2',
};

export function resolveSupertonicVoice(
  role: VoiceRole,
  patientVoice?: PatientVoiceProfile,
): string {
  if (role === 'patient' && patientVoice?.gender === 'male') return 'M1';
  return SUPERTONIC_VOICE_BY_ROLE[role];
}

export interface SpeakOptions {
  role?: VoiceRole;
  patientVoice?: PatientVoiceProfile;
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

const HIGH_QUALITY_MALE_PATIENT_VOICES = [
  'Daniel (Enhanced)', 'Daniel',
  'Oliver (Enhanced)', 'Oliver',
  'Alex',
  'Arthur',
  'Gordon',
  'Google UK English Male',
  'Microsoft Ryan Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Microsoft George',
];

export function voicePriorityForRole(
  role: VoiceRole,
  patientVoice?: PatientVoiceProfile,
): readonly string[] {
  return role === 'patient' && patientVoice?.gender === 'male'
    ? HIGH_QUALITY_MALE_PATIENT_VOICES
    : HIGH_QUALITY_VOICES[role];
}

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

// One-shot probe to detect a running Supertonic server. Cached for the
// session so we only pay the round-trip once. Returns false in prod builds
// (import.meta.env.DEV is false), bypassing the network entirely.
let supertonicProbe: Promise<boolean> | null = null;
function probeSupertonic(): Promise<boolean> {
  if (!import.meta.env.DEV) return Promise.resolve(false);
  if (supertonicProbe) return supertonicProbe;
  supertonicProbe = (async () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 800);
      // Same-origin dev proxy checks Supertonic's real /v1/health route.
      const res = await fetch(SUPERTONIC_HEALTH, { method: 'GET', signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return false;
      const json = await res.json().catch(() => ({} as { ok?: boolean }));
      return json.ok === true;
    } catch {
      return false;
    }
  })();
  return supertonicProbe;
}

function docLangForSupertonic(): string {
  if (typeof document === 'undefined') return 'en';
  const l = (document.documentElement.lang || '').toLowerCase();
  if (l.startsWith('ar')) return 'ar';
  return 'en';
}

// ElevenLabs cloud TTS, reached through the same-origin /api/tts endpoint so
// the API key stays server-side. Local dev serves this via Vite middleware;
// production serves it via Vercel Functions in api/tts/*.ts. This is the
// PRIMARY voice when configured — it's fast (~1-2s) and returns one continuous
// clip, which avoids the robotic browser SpeechSynthesis fallback.
const TTS_PROXY_URL = '/api/tts';
const TTS_PROXY_HEALTH = '/api/tts/health';
let elevenProbe: Promise<boolean> | null = null;
function probeElevenLabs(): Promise<boolean> {
  if (elevenProbe) return elevenProbe;
  elevenProbe = (async () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(TTS_PROXY_HEALTH, { method: 'GET', signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return false;
      const j = await res.json().catch(() => ({} as { ok?: boolean }));
      return !!j.ok;
    } catch {
      return false;
    }
  })();
  return elevenProbe;
}

export function useVoiceNarration() {
  const [voicesReady, setVoicesReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(globalIsSpeaking);
  const [playbackState, setPlaybackState] = useState(globalPlaybackState);
  const [enabled, setEnabled] = useState(globalVoiceEnabled);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  // Per-frame lip-sync amplitude (0..1), written by the shared analyser loop.
  const mouthOpenRef = useRef(0);
  useEffect(() => {
    const ref = mouthOpenRef;
    mouthOpenListeners.add(ref);
    return () => { mouthOpenListeners.delete(ref); };
  }, []);

  useEffect(() => {
    const listener = (state: VoicePlaybackState) => setPlaybackState(state);
    globalPlaybackListeners.add(listener);
    setPlaybackState(globalPlaybackState);
    return () => {
      globalPlaybackListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeVoiceEnabledPreference(setEnabled);
    // The module may have first loaded during SSR, before localStorage existed.
    // Reconcile once on mount, then propagate same-tab changes through the
    // module listener set and cross-tab changes through the storage event.
    const stored = readStoredVoiceEnabled();
    if (stored !== globalVoiceEnabled) setVoiceEnabledPreference(stored);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== VOICE_PREF_KEY || event.newValue === null) return;
      const next = event.newValue === 'true';
      if (next !== globalVoiceEnabled) setVoiceEnabledPreference(next);
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Attach the one-time audio-unlock gesture listeners as early as possible
  // so the page is audio-unlocked before the dispatch narration fires.
  useEffect(() => { ensureUnlockListeners(); }, []);

  useEffect(() => {
    const listener = (speaking: boolean) => setIsSpeaking(speaking);
    globalSpeakingListeners.add(listener);
    setIsSpeaking(globalIsSpeaking);
    return () => {
      globalSpeakingListeners.delete(listener);
    };
  }, []);

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
    setVoiceEnabledPreference(!globalVoiceEnabled);
  }, []);

  /**
   * Pick the best voice for a given role using an explicit priority list,
   * then fall back to generic heuristics. Novelty voices are blacklisted.
   */
  const pickVoice = useCallback((
    role: VoiceRole,
    patientVoice?: PatientVoiceProfile,
  ): SpeechSynthesisVoice | null => {
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
    const priorityList = voicePriorityForRole(role, patientVoice);
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
   * Synthesise one sentence via Supertonic's native /v1/tts (returns an
   * <audio> element ready to play, or null on failure). Kept separate so the
   * speak loop can PREFETCH the next sentence while the current one plays.
   */
  const synthSentence = useCallback(async (
    text: string,
    role: VoiceRole,
    patientVoice?: PatientVoiceProfile,
  ): Promise<HTMLAudioElement | null> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), SUPERTONIC_TIMEOUT_MS);
    try {
      const res = await fetch(SUPERTONIC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: resolveSupertonicVoice(role, patientVoice),
          lang: docLangForSupertonic(),
          steps: SUPERTONIC_STEPS,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob || blob.size < 64) return null; // empty/invalid audio
      const audio = new Audio(URL.createObjectURL(blob));
      return audio;
    } catch {
      clearTimeout(timer);
      return null;
    }
  }, []);

  /**
   * Speak via Supertonic, sentence-by-sentence with one-ahead prefetch so the
   * first words start ASAP and playback stays continuous. Resolves true when
   * Supertonic owns the narration (reachable + first sentence synthesised),
   * false only when the server is unreachable / the first synth fails — the
   * single point where the caller may fall back to Web Speech. Never returns
   * false just because autoplay was momentarily blocked (that would reintroduce
   * the robotic-voice regression).
   */
  const speakViaSupertonic = useCallback(async (
    normalised: string,
    role: VoiceRole,
    mySession: number,
    patientVoice?: PatientVoiceProfile,
    onEnd?: () => void,
  ): Promise<boolean> => {
    const reachable = await probeSupertonic();
    if (!reachable) return false;
    if (!isCurrentNarrationSession(mySession)) return true;

    // CONTINUITY: the server is serial and ~50ms/char, so sentence-by-sentence
    // playback starves — synthesis can't keep up with playback, leaving audible
    // GAPS between sentences (the "pauses / delayed words / fragmented" effect).
    // Synthesising the WHOLE utterance in ONE request returns a single
    // continuous audio clip with zero internal gaps. We accept a one-time
    // upfront synth latency (hidden behind the pulsing "speaking" indicator) in
    // exchange for a seamless read. Only absurdly long text (>600 chars, which
    // no narration here hits) falls back to chunking.
    const SINGLE_SHOT_MAX_CHARS = 600;
    const sentences = normalised.length <= SINGLE_SHOT_MAX_CHARS
      ? [normalised]
      : chunkText(normalised).map(c => c.text).filter(Boolean);
    if (sentences.length === 0) return true;

    // Synthesise the first sentence up front. If even this fails, the server
    // is effectively unusable for this utterance → allow Web Speech fallback.
    let current = await synthSentence(sentences[0], role, patientVoice);
    if (!current) return false;
    if (!isCurrentNarrationSession(mySession)) {
      releaseAudio(current);
      return true;
    }

    // Drive the queue with one-ahead prefetch.
    (async () => {
      for (let i = 0; i < sentences.length; i++) {
        if (!isCurrentNarrationSession(mySession)) {
          if (current) releaseAudio(current);
          return;
        }
        const audio = current!;
        // Kick off synth of the NEXT sentence while this one plays.
        const nextPromise = i + 1 < sentences.length
          ? synthSentence(sentences[i + 1], role, patientVoice).then(next => {
            if (next && !isCurrentNarrationSession(mySession)) {
              releaseAudio(next);
              return null;
            }
            return next;
          })
          : Promise.resolve(null);

        setActiveAudio(audio);
        const completion = new Promise<'ended' | 'error' | 'cancelled'>((resolve) => {
          let settled = false;
          const done = (outcome: 'ended' | 'error' | 'cancelled') => {
            if (settled) return;
            settled = true;
            resolve(outcome);
          };
          audio.onended = () => done('ended');
          audio.onerror = () => done('error');
          globalCancelAudioCompletion = () => done('cancelled');
        });

        const playResult = await playAudioWithRetry(
          audio,
          () => isCurrentNarrationSession(mySession),
        );
        if (playResult === 'cancelled') {
          const next = await nextPromise;
          if (next) releaseAudio(next);
          return;
        }
        if (playResult === 'error') {
          globalCancelAudioCompletion = null;
          releaseAudio(audio);
          if (globalActiveAudio === audio) globalActiveAudio = null;
          setCurrentPlaybackStatus(mySession, 'error');
          const next = await nextPromise;
          if (next) releaseAudio(next);
          return;
        }
        setCurrentPlaybackStatus(mySession, 'speaking');
        const completionResult = await completion;
        if (globalActiveAudio === audio) {
          globalActiveAudio = null;
          globalCancelAudioCompletion = null;
          releaseAudio(audio);
        }

        if (!isCurrentNarrationSession(mySession)) {
          const next = await nextPromise;
          if (next) releaseAudio(next);
          return;
        }
        if (completionResult === 'error') {
          setCurrentPlaybackStatus(mySession, 'error');
          const next = await nextPromise;
          if (next) releaseAudio(next);
          return;
        }
        if (i + 1 < sentences.length) setCurrentPlaybackStatus(mySession, 'loading');
        current = await nextPromise;
        if (!current) break; // a later sentence failed to synth — stop cleanly
      }
      if (isCurrentNarrationSession(mySession)) {
        if (globalActiveAudio) globalActiveAudio = null;
        setCurrentPlaybackStatus(mySession, 'idle');
        onEnd?.();
      }
    })();

    return true;
  }, [synthSentence]);

  /**
   * Web Speech queue — used directly in production, and as fallback when
   * Supertonic isn't reachable. Sentence-chunked with role-based prosody.
   */
  const speakViaWebSpeech = useCallback((
    normalised: string,
    role: VoiceRole,
    mySession: number,
    options: SpeakOptions,
  ) => {
    const profile = ROLE_PROFILES[role];
    const voice = pickVoice(role, options.patientVoice);
    const chunks = chunkText(normalised);

    let chunkIndex = 0;
    const speakNext = () => {
      if (!isCurrentNarrationSession(mySession)) return;
      if (chunkIndex >= chunks.length) {
        setCurrentPlaybackStatus(mySession, 'idle');
        options.onEnd?.();
        return;
      }
      const chunk = chunks[chunkIndex];
      chunkIndex += 1;

      const utterance = new SpeechSynthesisUtterance(chunk.text);
      if (voice) utterance.voice = voice;

      const baseRate = options.rate ?? profile.baseRate;
      const basePitch = options.pitch ?? profile.basePitch;
      utterance.rate = Math.max(0.7, Math.min(1.3, jitter(baseRate, 0.02)));
      utterance.pitch = Math.max(0.6, Math.min(1.4, jitter(basePitch, 0.03)));
      utterance.volume = 1;

      utterance.onstart = () => {
        if (!isCurrentNarrationSession(mySession)) return;
        globalSyntheticMouthActive = true;
        setCurrentPlaybackStatus(mySession, 'speaking');
        startMouthLoop();
      };

      utterance.onend = () => {
        if (!isCurrentNarrationSession(mySession)) return;
        globalSyntheticMouthActive = false;
        setCurrentPlaybackStatus(mySession, 'loading');
        const gap = chunk.terminal ? profile.interSentenceGapMs : profile.interClauseGapMs;
        const gapWithJitter = gap + Math.random() * 80 - 40;
        const t = window.setTimeout(speakNext, Math.max(30, gapWithJitter));
        registerQueueTimer(t);
      };
      utterance.onerror = () => {
        if (!isCurrentNarrationSession(mySession)) return;
        globalSyntheticMouthActive = false;
        setCurrentPlaybackStatus(mySession, 'error');
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        globalSyntheticMouthActive = false;
        setCurrentPlaybackStatus(mySession, 'error');
      }
    };

    speakNext();
  }, [pickVoice]);

  /**
   * ElevenLabs (cloud) via the dev proxy — PRIMARY voice when configured.
   * Synthesises the WHOLE utterance in one request and plays it as a single
   * continuous clip (no inter-sentence gaps), fast enough that the start delay
   * is ~1-2s. Returns true once ElevenLabs owns the narration; false only when
   * it's unconfigured / unreachable / failed, so the caller falls back to
   * Supertonic → Web Speech.
   */
  const speakViaElevenLabs = useCallback(async (
    normalised: string,
    role: VoiceRole,
    mySession: number,
    patientVoice?: PatientVoiceProfile,
    onEnd?: () => void,
  ): Promise<boolean> => {
    const configured = await probeElevenLabs();
    if (!configured) return false;
    if (!isCurrentNarrationSession(mySession)) return true;

    let blob: Blob;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 22000);
      const res = await fetch(TTS_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: normalised, role, patientVoice }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return false;
      blob = await res.blob();
    } catch {
      return false;
    }
    if (!blob || blob.size < 64) return false;           // empty/invalid audio
    if (!isCurrentNarrationSession(mySession)) return true;  // superseded mid-synth

    const audio = new Audio(URL.createObjectURL(blob));
    setActiveAudio(audio); // shared "current audio" ref for stop()/interrupt
    let finished = false;
    const finish = (status: 'idle' | 'error') => {
      if (!isCurrentNarrationSession(mySession)) return;
      if (finished) return;
      finished = true;
      releaseAudio(audio);
      if (globalActiveAudio === audio) globalActiveAudio = null;
      setCurrentPlaybackStatus(mySession, status);
      if (status === 'idle') onEnd?.();
    };
    audio.onended = () => finish('idle');
    audio.onerror = () => finish('error');
    playAudioWithRetry(audio, () => isCurrentNarrationSession(mySession) && !finished).then(result => {
      if (result === 'playing') setCurrentPlaybackStatus(mySession, 'speaking');
      if (result === 'error') finish('error');
    });
    return true;
  }, []);

  /**
   * Speak the given text aloud. Cancels any currently-speaking utterance first.
   * Engine priority: ElevenLabs → Supertonic → Web Speech.
   */
  const speak = useCallback((text: string, options: SpeakOptions = {}) => {
    if (!globalVoiceEnabled) return;
    if (typeof window === 'undefined') return;
    if (!text || !text.trim()) return;

    const role = options.role || 'narrator';
    const normalised = normaliseForSpeech(text);

    // Cancel any ongoing dispatch, scene narration, patient voice, or generic
    // narration before starting the new utterance.
    const mySession = startNarrationSession(role);

    // Engine priority: ElevenLabs (fast, continuous) → Supertonic (local) →
    // Web Speech (always available). Each returns false only if it can't own
    // the narration, so the chain falls through cleanly with no double-play.
    speakViaElevenLabs(normalised, role, mySession, options.patientVoice, options.onEnd).then(elOk => {
      if (elOk) return;
      if (!isCurrentNarrationSession(mySession)) return;
      return speakViaSupertonic(normalised, role, mySession, options.patientVoice, options.onEnd).then(ok => {
        if (ok) return;
        if (!isCurrentNarrationSession(mySession)) return; // superseded
        if (!('speechSynthesis' in window)) {
          setCurrentPlaybackStatus(mySession, 'error');
          return;
        }
        speakViaWebSpeech(normalised, role, mySession, options);
      });
    });
  }, [speakViaElevenLabs, speakViaSupertonic, speakViaWebSpeech]);

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return;
    stopNarrationSession();
  }, []);

  const stopRole = useCallback((role: VoiceRole) => {
    if (typeof window === 'undefined') return;
    // Consult the live shared lane, not this hook's last rendered snapshot:
    // another surface may have started dispatch since this callback was made.
    if (globalPlaybackState.role === role) stopNarrationSession();
  }, []);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return {
    speak,
    stop,
    stopRole,
    isSpeaking,
    /** Precise shared-lane lifecycle; unlike isSpeaking, loading is not audible. */
    playbackStatus: playbackState.status,
    playbackRole: playbackState.role,
    enabled,
    toggleEnabled,
    isSupported,
    voicesReady,
    /** Per-frame 0..1 lip-sync amplitude (RMS of the playing TTS clip). */
    mouthOpenRef,
  };
}
