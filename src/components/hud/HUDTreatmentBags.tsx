/**
 * HUD chrome for the treatment jump bags: corner brackets + hover glow
 * over the existing loadout dock, giving it a game-inventory frame.
 * Frame-only — TreatmentJumpBagPanel keeps all logic and styling.
 */
import type { ReactNode } from 'react';
import { HUDPanel } from './HUDPanel';

export function HUDTreatmentBags({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <HUDPanel frame className={className} aria-label="Treatment jump bags">
      {children}
    </HUDPanel>
  );
}
