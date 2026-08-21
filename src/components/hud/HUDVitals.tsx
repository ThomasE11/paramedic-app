/**
 * HUD chrome for the vital signs monitor: corner brackets, CRT
 * scan-lines, and a red pulsing alarm border when the patient is in
 * arrest. Frame-only — the LIFEPAK card underneath keeps its own
 * bezel styling and all of its interactivity.
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { HUDPanel } from './HUDPanel';

export function HUDVitals({
  alarm,
  className,
  children,
}: {
  alarm?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <HUDPanel frame scanlines alarm={alarm} className={cn('hud-monitor-readout', className)} aria-label="Vital signs monitor">
      <header className="hud-head">
        <span className="hud-tag">LIVE</span>
        <span className="hud-code">VITALS</span>
      </header>
      {children}
    </HUDPanel>
  );
}
