/**
 * AmbientBackground
 *
 * Subtle clinical-room wash and measurement grid behind every workspace,
 * classroom, and lobby surface. No floating blobs: the app should feel like
 * a simulator bay, not a marketing hero.
 */

interface AmbientBackgroundProps {
  /** Render as `fixed` (default) or `absolute`. Use absolute when the
   *  parent wrapper already establishes a positioned, clipping
   *  container — keeps the clinical wash scoped to that surface. */
  variant?: 'fixed' | 'absolute';
}

export function AmbientBackground({ variant = 'fixed' }: AmbientBackgroundProps) {
  // `.ambient-bg` styles `position: fixed; inset: 0; pointer-events: none;
  // z-index: 0; overflow: hidden;` — when we want the wash scoped to a
  // parent (e.g. inside the workspace card), we swap to absolute.
  const positionClass = variant === 'absolute'
    ? 'absolute inset-0 overflow-hidden pointer-events-none z-0'
    : 'ambient-bg';

  return (
    <div className={`${positionClass} clinical-ambient`} aria-hidden="true" />
  );
}

export default AmbientBackground;
