/**
 * HUD chrome for the vital signs monitor: corner brackets, CRT
 * scan-lines, and a red pulsing alarm border when the patient is in
 * arrest. Frame-only — the LIFEPAK card underneath keeps its own
 * bezel styling and all of its interactivity.
 */
import type { ReactNode } from 'react';
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
    <HUDPanel frame scanlines alarm={alarm} className={className} aria-label="Vital signs monitor">
      {children}
    </HUDPanel>
  );
}
