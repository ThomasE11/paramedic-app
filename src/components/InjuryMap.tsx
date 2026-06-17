/**
 * InjuryMap — at-a-glance 2D body diagram showing what's visibly wrong with
 * the patient and where.
 *
 * Answers the Director's complaint: "they have a rotated leg — that should be
 * seen on the anatomy." The 3D body is for hands-on regional examination;
 * this flat anterior silhouette is the injury map — a student glances at it
 * and immediately sees "left leg: external rotation, right chest: flail".
 *
 * Driven entirely by inferInjuries() in lib/injuryMap.ts, so it stays in sync
 * with the Scene Survey figure and the 3D pips. Renders nothing (returns a
 * "no visible external injuries" note) for medical cases with no trauma —
 * which is correct; a chest-pain patient has no external injury map.
 */

import { useMemo } from 'react';
import type { CaseScenario } from '@/types';
import { inferInjuries, inferGeneralAppearance, SEVERITY_STYLE, type BodyInjury } from '@/lib/injuryMap';
import { AlertTriangle, Droplet, Activity, Flame, Bone, Scissors } from 'lucide-react';

interface InjuryMapProps {
  caseData: CaseScenario;
  className?: string;
}

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  bleeding: Droplet,
  burn: Flame,
  fracture: Bone,
  deformity: Bone,
  rotation: Activity,
  shortening: Activity,
  amputation: Scissors,
  flail: AlertTriangle,
  wound: AlertTriangle,
  bruising: AlertTriangle,
  swelling: AlertTriangle,
  distension: AlertTriangle,
};

export function InjuryMap({ caseData, className = '' }: InjuryMapProps) {
  const injuries = useMemo(() => inferInjuries(caseData), [caseData]);
  const appearance = useMemo(() => inferGeneralAppearance(caseData), [caseData]);

  // Skin tone reflects pallor / cyanosis so the silhouette itself carries
  // the perfusion story, not just the markers.
  const skin = appearance.cyanotic ? '#8fa8bd' : appearance.pale ? '#cdb4a3' : '#c08a6a';

  const hasInjuries = injuries.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="grid grid-cols-[150px_1fr] gap-3">
        {/* ---- Anterior silhouette ---- */}
        <div className="relative">
          <svg viewBox="0 0 100 200" className="w-full h-auto" aria-label="Patient injury diagram">
            {/* Body silhouette — simple but anatomically proportioned */}
            <g fill={skin} stroke="rgba(0,0,0,0.12)" strokeWidth="0.5">
              {/* head */}
              <ellipse cx="50" cy="14" rx="9" ry="11" />
              {/* neck */}
              <rect x="46" y="24" width="8" height="6" rx="2" />
              {/* torso */}
              <path d="M38 30 Q50 27 62 30 L64 58 Q64 64 60 70 L40 70 Q36 64 36 58 Z" />
              {/* pelvis */}
              <path d="M40 70 L60 70 L58 86 Q50 90 42 86 Z" />
              {/* arms */}
              <path d="M38 32 Q30 34 28 44 L26 64 Q25 70 28 70 L31 70 L34 48 Q35 38 38 36 Z" />
              <path d="M62 32 Q70 34 72 44 L74 64 Q75 70 72 70 L69 70 L66 48 Q65 38 62 36 Z" />
              {/* legs */}
              <path d="M42 86 L48 86 L48 150 Q48 160 45 168 L41 168 Q39 160 40 150 Z" />
              <path d="M52 86 L58 86 L60 150 Q61 160 59 168 L55 168 Q52 160 52 150 Z" />
            </g>
            {/* cyanosis tint on lips when cyanotic */}
            {appearance.cyanotic && <ellipse cx="50" cy="18" rx="3" ry="1.2" fill="#5b7c99" />}

            {/* Injury markers as SVG pulse rings */}
            {injuries.map((inj) => {
              const style = SEVERITY_STYLE[inj.severity];
              const cx = inj.x;
              const cy = inj.y * 2; // viewBox is 0-200 tall, coords are 0-100
              const color = inj.severity === 'critical' ? '#f43f5e' : inj.severity === 'major' ? '#f97316' : '#fbbf24';
              return (
                <g key={inj.id}>
                  <circle cx={cx} cy={cy} r="3.5" fill={color} opacity="0.9">
                    <animate attributeName="r" values="3.5;6;3.5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy} r="2" fill={color} />
                </g>
              );
            })}
          </svg>
          <p className="text-center text-[8px] uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">Anterior view</p>
        </div>

        {/* ---- Injury list ---- */}
        <div className="min-w-0">
          {hasInjuries ? (
            <ul className="space-y-1.5">
              {injuries.map((inj) => {
                const Icon = KIND_ICON[inj.kind] || AlertTriangle;
                const style = SEVERITY_STYLE[inj.severity];
                return (
                  <li
                    key={inj.id}
                    className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 ${
                      inj.severity === 'critical' ? 'border-rose-500/30 bg-rose-500/[0.06]'
                      : inj.severity === 'major' ? 'border-orange-500/30 bg-orange-500/[0.06]'
                      : 'border-amber-400/30 bg-amber-400/[0.06]'
                    }`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                      <Icon className={`h-3 w-3 ${style.text}`} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold leading-tight">{inj.label}</span>
                        <span className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/60">
                          {inj.region.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{inj.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex h-full items-center">
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                No visible external injuries. This is a <span className="font-medium text-foreground/70">medical</span> presentation —
                work the problem through assessment, history, and the monitor rather than an injury survey.
              </p>
            </div>
          )}

          {/* General appearance chips */}
          {(appearance.pale || appearance.cyanotic || appearance.diaphoretic || appearance.unconscious) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {appearance.unconscious && <AppearanceChip label="Unconscious" tone="critical" />}
              {appearance.cyanotic && <AppearanceChip label="Cyanotic" tone="critical" />}
              {appearance.pale && <AppearanceChip label="Pale" tone="major" />}
              {appearance.diaphoretic && <AppearanceChip label="Diaphoretic" tone="minor" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppearanceChip({ label, tone }: { label: string; tone: 'critical' | 'major' | 'minor' }) {
  const cls = tone === 'critical' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
    : tone === 'major' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25'
    : 'bg-amber-400/10 text-amber-700 dark:text-amber-400 border-amber-400/25';
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] ${cls}`}>
      {label}
    </span>
  );
}

/** Count of injuries — for a badge on the section header. Null-safe so it
 *  can be called unconditionally at the top of a component whose case may
 *  not be loaded yet. */
export function useInjuryCount(caseData: CaseScenario | null | undefined): number {
  return useMemo(() => (caseData ? inferInjuries(caseData).length : 0), [caseData]);
}

export type { BodyInjury };
