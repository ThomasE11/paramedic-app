/**
 * Game-HUD component library — presentational only.
 *
 * Glassmorphic panels with sci-fi corner brackets, optional scan-lines,
 * glow-on-active borders, and monitor-style value readouts that flicker
 * on change and pulse on critical values. No clinical logic lives here —
 * these wrap the existing battle-tested panels without touching their
 * props, handlers, or state.
 */
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface HUDPanelProps {
  /** Optional uppercase HUD header title */
  title?: string;
  /** Small mono tag on the right of the header (e.g. "LIVE", "SABCDE") */
  tag?: string;
  icon?: ReactNode;
  /**
   * Frame mode: corner brackets + glow only, no panel background.
   * Use to overlay HUD chrome on an already-styled card (e.g. the
   * LIFEPAK monitor card) without doubling up borders/backgrounds.
   */
  frame?: boolean;
  active?: boolean;
  /** Red pulsing alarm state (e.g. patient in arrest) */
  alarm?: boolean;
  /** CRT scan-line overlay with a slow sweep */
  scanlines?: boolean;
  className?: string;
  'aria-label'?: string;
  children: ReactNode;
}

export function HUDPanel({
  title,
  tag,
  icon,
  frame,
  active,
  alarm,
  scanlines,
  className = '',
  'aria-label': ariaLabel,
  children,
}: HUDPanelProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={[
        frame ? 'hud-frame' : 'hud-panel',
        active ? 'hud-active' : '',
        alarm ? 'hud-alarm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel ?? title}
    >
      <span className="hud-bracket hud-bracket-tl" aria-hidden="true" />
      <span className="hud-bracket hud-bracket-tr" aria-hidden="true" />
      <span className="hud-bracket hud-bracket-bl" aria-hidden="true" />
      <span className="hud-bracket hud-bracket-br" aria-hidden="true" />
      {scanlines && <span className="hud-scanlines" aria-hidden="true" />}
      {title && (
        <header className="hud-head">
          {icon}
          <h3 className="hud-title">{title}</h3>
          {tag && <span className="hud-tag">{tag}</span>}
        </header>
      )}
      {children}
    </motion.section>
  );
}

export interface HUDValueProps {
  label?: string;
  value: string | number;
  unit?: string;
  critical?: boolean;
  warning?: boolean;
}

/**
 * Monitor-style readout. Re-keys on value change so framer-motion
 * replays a brief flicker, like a real cardiac monitor refreshing.
 * Renders bare <span>/<strong>/<em> so existing tile CSS
 * (.tactical-hud-tile) keeps styling the typography.
 */
export function HUDValue({ label, value, unit, critical, warning }: HUDValueProps) {
  return (
    <>
      {label !== undefined && <span>{label}</span>}
      <motion.strong
        key={String(value)}
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={critical ? 'hud-value-critical' : warning ? 'hud-value-warning' : undefined}
      >
        {value}
      </motion.strong>
      {unit !== undefined && <em>{unit}</em>}
    </>
  );
}
