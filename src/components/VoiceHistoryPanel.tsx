/**
 * VoiceHistoryPanel
 *
 * Replaces the old click-through SAMPLE form with a real-time spoken
 * conversation between the student and the patient. The student presses
 * the mic, asks any history question, the system transcribes the question
 * live, classifies what was asked, and the patient (or a bystander, if
 * unconscious) answers in voice via Supertonic.
 *
 * Realism beats the previous SAMPLE list because:
 *   1. Students must phrase the question themselves (boards demand verbal skill).
 *   2. The patient sometimes can't answer ("I... I don't remember") — that's
 *      the real clinical experience and forces the student to escalate.
 *   3. Unconscious patients shift the burden to collateral history from
 *      bystanders, with explicit attribution ("His wife says...").
 *   4. Coverage chips show which SAMPLE categories were obtained — replaces
 *      checkbox UX without losing the scoring signal.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CaseScenario } from '@/types';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { usePatientVoice } from '@/hooks/usePatientVoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mic, MicOff, MessageCircle, AlertCircle, User, Stethoscope,
  CheckCircle2, History, Volume2, Send,
} from 'lucide-react';
import {
  classifyQuestion,
  generatePatientResponse,
  generateCollateralResponse,
  CATEGORY_LABELS,
  SAMPLE_CATEGORIES,
  type HistoryCategory,
  type HistoryTurn,
} from '@/lib/historyTaking';

interface VoiceHistoryPanelProps {
  caseData: CaseScenario;
  /** Called whenever a new category is successfully obtained. Lets the
   *  parent feed this into debrief scoring. */
  onCategoryObtained?: (category: HistoryCategory) => void;
  /** Optional content rendered inside the history card's footer — used to fold
   *  the pain-severity (OPQRST "S") control into history-taking rather than a
   *  separate card. */
  footer?: ReactNode;
}

export function VoiceHistoryPanel({ caseData, onCategoryObtained, footer }: VoiceHistoryPanelProps) {
  const patientVoice = usePatientVoice(caseData);
  const [turns, setTurns] = useState<HistoryTurn[]>([]);
  const [obtained, setObtained] = useState<Set<HistoryCategory>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Derive the patient's mental status once — drives the response generator.
  const responseContext = useMemo(() => {
    const gcs = caseData.abcde?.disability?.gcs?.total ?? caseData.vitalSignsProgression?.initial?.gcs;
    const spo2 = caseData.abcde?.breathing?.spo2 ?? caseData.vitalSignsProgression?.initial?.spo2;
    const sbp = caseData.abcde?.circulation?.bp?.systolic;
    const severe = (typeof spo2 === 'number' && spo2 < 88)
      || (typeof gcs === 'number' && gcs >= 9 && gcs <= 12)
      || (typeof sbp === 'number' && sbp < 90);
    return {
      severity: (severe ? 'severe' : 'mild') as 'severe' | 'mild',
      altered: typeof gcs === 'number' && gcs >= 9 && gcs <= 12,
    };
  }, [caseData]);

  // Process an incoming question once — classify, fetch response, push to
  // the conversation, speak via patient voice.
  const processQuestion = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const category = classifyQuestion(trimmed);
    const studentTurn: HistoryTurn = {
      id: `${Date.now()}-s`,
      role: 'student',
      text: trimmed,
      category,
      timestamp: Date.now(),
    };

    let answer: string | null;
    let attribution: 'patient' | 'system' = 'patient';
    if (patientVoice.canVocalize) {
      answer = generatePatientResponse(caseData, category, responseContext);
    } else {
      answer = generateCollateralResponse(caseData, category);
      attribution = 'system';
    }

    const answerTurn: HistoryTurn = {
      id: `${Date.now()}-a`,
      role: attribution,
      text: answer ?? '(no answer available)',
      category,
      timestamp: Date.now() + 1,
    };
    setTurns(prev => [...prev, studentTurn, answerTurn]);

    // Track coverage — only count classified (non-unknown) questions. Functional
    // update so rapid back-to-back questions can't clobber each other. The
    // onCategoryObtained side-effect is fired from an effect (below), NOT here,
    // to avoid setState-in-render warnings in the parent.
    if (category !== 'unknown') {
      setObtained(prev => {
        if (prev.has(category)) return prev;
        const next = new Set(prev);
        next.add(category);
        return next;
      });
    }

    // Voice the patient's answer aloud
    if (answer && attribution === 'patient') {
      // Small delay so the student sees their bubble appear before the
      // voice starts — feels like the patient pausing to think.
      setTimeout(() => patientVoice.say(answer!), 400);
    }
    // For collateral / system messages we deliberately don't speak — the
    // attribution makes more sense as a written note than a synthesised
    // bystander voice (we don't have a voice per bystander).
  }, [caseData, responseContext, patientVoice]);

  // Report newly-obtained categories to the parent from an EFFECT (not during
  // render). A ref tracks what's already been reported so each fires once.
  const reportedRef = useRef<Set<HistoryCategory>>(new Set());
  useEffect(() => {
    obtained.forEach(cat => {
      if (!reportedRef.current.has(cat)) {
        reportedRef.current.add(cat);
        onCategoryObtained?.(cat);
      }
    });
  }, [obtained, onCategoryObtained]);

  // Free-text dictation: onFinalTranscript fires for EVERY finalised utterance
  // (including a question asked twice) — the old finalTranscript-value effect
  // silently dropped repeats.
  const voice = useVoiceInput({
    commands: [],
    onFinalTranscript: processQuestion,
  });

  // Typed fallback — works when the mic is unavailable / denied, or the room
  // is too noisy. History-taking must never become unusable.
  const [typed, setTyped] = useState('');
  const submitTyped = useCallback(() => {
    const q = typed.trim();
    if (!q) return;
    processQuestion(q);
    setTyped('');
  }, [typed, processQuestion]);

  // Auto-scroll to newest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns.length, voice.interimTranscript]);

  // Stop any in-flight speech when the user leaves the panel
  useEffect(() => () => { patientVoice.stop(); voice.stop(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sampleCovered = SAMPLE_CATEGORIES.filter(c => obtained.has(c));

  return (
    <Card className="border border-border/60 bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
              <MessageCircle className="h-4 w-4 text-blue-500" />
            </div>
            History Taking — Ask the Patient
          </CardTitle>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            SAMPLE {sampleCovered.length}/6
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Coverage chips */}
        <div className="px-4 pt-3 pb-2 border-b border-border/40 flex flex-wrap gap-1.5">
          {SAMPLE_CATEGORIES.map(cat => {
            const got = obtained.has(cat);
            return (
              <Badge
                key={cat}
                variant={got ? 'default' : 'outline'}
                className={`text-[10px] ${got ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15' : 'text-muted-foreground'}`}
              >
                {got && <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                {CATEGORY_LABELS[cat]}
              </Badge>
            );
          })}
        </div>

        {/* Conversation thread */}
        <div
          ref={scrollRef}
          className="px-4 py-4 min-h-[260px] max-h-[420px] overflow-y-auto space-y-3 bg-muted/20"
        >
          {turns.length === 0 && !voice.isListening && !voice.interimTranscript && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <History className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground/70 max-w-md leading-relaxed">
                Press the mic and ask the patient a history question — anything you'd
                ask in real practice. The patient will answer in their own voice.
              </p>
              <p className="text-[11px] text-muted-foreground/50 mt-3">
                Try: <em>"What medications do you take?"</em> · <em>"Any allergies?"</em> ·
                <em>"What were you doing when this started?"</em>
              </p>
            </div>
          )}
          {turns.map(turn => (
            <div
              key={turn.id}
              className={`flex gap-2 ${turn.role === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              {turn.role !== 'student' && (
                <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${turn.role === 'system' ? 'bg-amber-500/15' : 'bg-blue-500/15'}`}>
                  {turn.role === 'system'
                    ? <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    : <User className="h-3.5 w-3.5 text-blue-500" />}
                </div>
              )}
              <div
                className={`rounded-2xl px-3 py-2 max-w-[78%] text-sm leading-relaxed ${
                  turn.role === 'student'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : turn.role === 'system'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-foreground rounded-tl-sm'
                      : 'bg-card border border-border rounded-tl-sm'
                }`}
              >
                {turn.role === 'student' && turn.category && turn.category !== 'unknown' && (
                  <p className="text-[9px] uppercase tracking-[0.16em] opacity-70 mb-0.5">
                    {CATEGORY_LABELS[turn.category]}
                  </p>
                )}
                <p>{turn.text}</p>
              </div>
              {turn.role === 'student' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 shrink-0">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
            </div>
          ))}
          {/* Live interim transcript while student is speaking */}
          {voice.interimTranscript && (
            <div className="flex gap-2 justify-end opacity-60 animate-pulse">
              <div className="rounded-2xl px-3 py-2 max-w-[78%] text-sm leading-relaxed bg-primary/70 text-primary-foreground rounded-tr-sm italic">
                {voice.interimTranscript}…
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 shrink-0">
                <Mic className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Status line */}
        <div className="border-t border-border/40 px-4 pt-2.5 flex items-center gap-3 min-h-[24px]">
          {voice.isListening ? (
            <span className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Listening…
            </span>
          ) : !voice.isSupported ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Mic unavailable — type your question below
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Speak or type — ask the patient anything you'd ask in real practice
            </span>
          )}
          {patientVoice.isSpeaking && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <Volume2 className="h-3 w-3" />
              Patient answering…
            </span>
          )}
        </div>

        {/* Mic + typed-input bar */}
        <div className="px-4 py-3 flex items-center gap-2 bg-card">
          <Button
            onClick={voice.toggle}
            disabled={!voice.isSupported}
            size="icon"
            variant={voice.isListening ? 'destructive' : 'default'}
            className="rounded-full shrink-0 h-10 w-10"
            title={voice.isSupported ? (voice.isListening ? 'Stop listening' : 'Ask by voice') : 'Mic not supported — type instead'}
          >
            {voice.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <form
            className="flex-1 flex items-center gap-2"
            onSubmit={(e) => { e.preventDefault(); submitTyped(); }}
          >
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder='e.g. "Any allergies?" · "Where is the pain?" · "What happened?"'
              className="flex-1 min-w-0 rounded-full border border-border/60 bg-background px-3.5 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <Button type="submit" size="icon" variant="outline" disabled={!typed.trim()} className="rounded-full shrink-0 h-9 w-9" title="Send question">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {voice.error && (
          <div className="px-4 py-2 text-xs text-rose-600 bg-rose-500/5 border-t border-rose-500/20">
            Voice error: {voice.error}
          </div>
        )}

        {footer}
      </CardContent>
    </Card>
  );
}
