/**
 * CaseSkeleton — structural placeholder for the case view while it loads.
 *
 * Replaces the generic Loader2 spinner with a skeleton that matches the real
 * case layout (header band, vitals grid, action row). Feels 2-3x faster even
 * though nothing has changed underneath — Nielsen Norman / Facebook pattern.
 * No runtime cost: pure CSS, no JS animations.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function CaseSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header band — dispatch, priority badge, case id */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>

      {/* Vitals grid — 4 cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>

      {/* Two-column content — case + action panel */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-5 w-28" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
