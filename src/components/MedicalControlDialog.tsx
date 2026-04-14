/**
 * Medical Control Dialog
 *
 * Simulates a phone call to medical control / base hospital physician.
 * Provides context-aware advice, authorisations, and red flag warnings
 * based on the current patient state.
 *
 * Matches the Body Interact "Call Specialist" feature concept.
 */

import { useMemo, useEffect, useState } from 'react';
import { Phone, AlertTriangle, CheckCircle2, Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { callMedicalControl } from '@/lib/medicalControl';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { NarrationButton } from '@/components/NarrationButton';
import type { CaseScenario, VitalSigns } from '@/types';

interface MedicalControlDialogProps {
  open: boolean;
  onClose: () => void;
  caseData: CaseScenario;
  currentVitals: VitalSigns;
  appliedTreatmentIds: string[];
  isInArrest: boolean;
}

export function MedicalControlDialog({
  open, onClose, caseData, currentVitals, appliedTreatmentIds, isInArrest,
}: MedicalControlDialogProps) {
  const { speak, stop } = useVoiceNarration();
  const [connectionStage, setConnectionStage] = useState<'connecting' | 'connected'>('connecting');

  const advice = useMemo(() => {
    if (!open) return null;
    return callMedicalControl({
      caseData, currentVitals, appliedTreatmentIds, isInArrest,
    });
  }, [open, caseData, currentVitals, appliedTreatmentIds, isInArrest]);

  // Simulate a 1.5s "connecting" phase, then auto-speak the greeting
  useEffect(() => {
    if (!open) {
      setConnectionStage('connecting');
      stop();
      return;
    }
    const timer = setTimeout(() => {
      setConnectionStage('connected');
      if (advice) {
        // Speak greeting and sitrep in sequence
        const fullText = `${advice.greeting} ${advice.sitrep}`;
        speak(fullText, { role: 'dispatcher' });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [open, advice, speak, stop]);

  const handleClose = () => {
    stop();
    onClose();
  };

  if (!open || !advice) return null;

  const fullAdviceText = [
    advice.greeting,
    advice.sitrep,
    ...advice.redFlags.map(f => `Red flag: ${f}`),
    ...advice.authorizations.map(a => `Authorisation: ${a}`),
    ...advice.recommendations.map(r => `Recommendation: ${r}`),
    advice.signOff,
  ].join(' ');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30 bg-blue-500/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
            <Phone className={`h-5 w-5 text-blue-500 ${connectionStage === 'connecting' ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base">Medical Control</h3>
            <p className="text-xs text-muted-foreground">
              {connectionStage === 'connecting' ? 'Connecting to base hospital…' : 'Dr. Al Mansouri — Emergency Physician'}
            </p>
          </div>
          {connectionStage === 'connected' && (
            <NarrationButton
              size="md"
              role="dispatcher"
              label="Read medical control advice"
              text={fullAdviceText}
            />
          )}
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors touch-manipulation"
            aria-label="End call"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {connectionStage === 'connecting' ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center gap-1 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-muted-foreground">Calling medical control…</p>
            </div>
          ) : (
            <>
              {/* Greeting */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                <p className="text-sm font-medium italic text-foreground/90">"{advice.greeting}"</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{advice.sitrep}</p>
              </div>

              {/* Red flags */}
              {advice.redFlags.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Red Flags — Listen Carefully
                  </h4>
                  <ul className="space-y-2">
                    {advice.redFlags.map((flag, idx) => (
                      <li key={idx} className="flex gap-2 text-xs sm:text-sm leading-relaxed">
                        <span className="text-red-500 shrink-0 mt-0.5">⚠</span>
                        <span className="text-foreground/90">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Authorisations */}
              {advice.authorizations.length > 0 && (
                <div className="bg-green-500/5 border border-green-500/30 rounded-xl p-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Orders Authorised
                  </h4>
                  <ul className="space-y-2">
                    {advice.authorizations.map((auth, idx) => (
                      <li key={idx} className="flex gap-2 text-xs sm:text-sm leading-relaxed">
                        <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                        <span className="text-foreground/90">{auth}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {advice.recommendations.length > 0 && (
                <div className="bg-blue-500/5 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" /> Clinical Guidance
                  </h4>
                  <ul className="space-y-2">
                    {advice.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-2 text-xs sm:text-sm leading-relaxed">
                        <span className="text-blue-500 shrink-0 mt-0.5">◆</span>
                        <span className="text-foreground/90">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sign off */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-sm italic text-foreground/80">"{advice.signOff}"</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/30 bg-muted/20">
          <Button onClick={handleClose} className="w-full h-10" variant="default">
            <Phone className="h-4 w-4 mr-2" /> End Call
          </Button>
        </div>
      </div>
    </div>
  );
}
