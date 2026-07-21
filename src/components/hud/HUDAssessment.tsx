/**
 * Mission-objective styled assessment panel: dark glassmorphic HUD
 * panel with an objective diamond marker, uppercase title, progress
 * readout, and a mono code tag (e.g. SABCDE).
 */
import type { ReactNode } from 'react';
import { HUDPanel } from './HUDPanel';

export function HUDAssessment({
  title,
  code,
  progress,
  className = '',
  children,
}: {
  title: string;
  /** Mono code tag, e.g. "SABCDE" */
  code?: string;
  /** Progress readout, e.g. "3/5" */
  progress?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <HUDPanel className={`hud-objectives ${className}`} aria-label={title}>
      <header className="hud-head">
        <span className="hud-objective-diamond" aria-hidden="true" />
        <h3 className="hud-title">{title}</h3>
        {progress && <span className="hud-tag">{progress}</span>}
        {code && <span className="hud-code">{code}</span>}
      </header>
      {children}
    </HUDPanel>
  );
}
