import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

interface CockpitLoadingSkeletonProps {
  label?: string;
  className?: string;
}

/**
 * CockpitLoadingSkeleton Component
 * Spatial cockpit skeleton loader rendered during React.lazy chunk resolution.
 * Matches the Dark Obsidian & Phosphor Amber aesthetic with zero layout shift.
 */
export const CockpitLoadingSkeleton: React.FC<CockpitLoadingSkeletonProps> = ({
  label = 'INITIALIZING COCKPIT RUNTIME // HYDRATING MODULES...',
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse select-none ${className}`}
    >
      {/* Top Cockpit Header Skeleton */}
      <div className="h-16 rounded-2xl bg-surface-panel/70 border border-border-subtle p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-48 h-5 rounded bg-surface-card border border-border-subtle" />
          <div className="w-24 h-4 rounded bg-surface-card/60" />
        </div>
        <div className="w-28 h-8 rounded-full bg-surface-card border border-border-subtle" />
        <div className="w-32 h-5 rounded bg-surface-card/60" />
      </div>

      {/* Main Split Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question & Telemetry Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="h-64 rounded-2xl bg-surface-panel/80 border border-border-subtle p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-28 h-5 rounded bg-surface-card" />
              <div className="w-20 h-5 rounded bg-surface-card/60" />
            </div>
            <div className="space-y-3 pt-2">
              <div className="w-full h-6 rounded bg-surface-card/90" />
              <div className="w-5/6 h-6 rounded bg-surface-card/70" />
              <div className="w-3/4 h-6 rounded bg-surface-card/50" />
            </div>
          </div>

          <div className="h-44 rounded-2xl bg-surface-panel/60 border border-border-subtle p-5 flex flex-col justify-between">
            <div className="w-40 h-4 rounded bg-surface-card/70" />
            <div className="w-full h-12 rounded bg-surface-card/40" />
            <div className="w-32 h-3 rounded bg-surface-card/40" />
          </div>
        </div>

        {/* Right Column: Video & Reticle Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative h-72 rounded-2xl bg-surface-panel/80 border border-border-subtle overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            {/* Corner Brackets */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-mint-eval/40" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-mint-eval/40" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-mint-eval/40" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-mint-eval/40" />

            <RefreshCw className="w-7 h-7 text-amber-signal animate-spin mb-3 stroke-[1.5]" />
            <span className="font-mono text-[11px] tracking-wider uppercase text-text-secondary font-semibold">
              {label}
            </span>
            <span className="font-mono text-[9px] text-text-tertiary mt-1">
              ESTABLISHING WEBSOCKET // ALLOCATING AUDIO BUFFER
            </span>
          </div>

          <div className="h-32 rounded-2xl bg-surface-panel/50 border border-border-subtle p-4 flex items-center justify-center">
            <div className="flex items-center gap-2 font-mono text-[10px] text-text-tertiary">
              <Activity className="w-4 h-4 text-amber-signal/70" />
              <span>AWAITING LIVE ACOUSTIC TELEMETRY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar Skeleton */}
      <div className="h-16 rounded-2xl bg-surface-panel/70 border border-border-subtle p-3 flex items-center justify-between">
        <div className="w-24 h-8 rounded-lg bg-surface-card" />
        <div className="w-56 h-10 rounded-xl bg-amber-signal/20 border border-amber-signal/30" />
        <div className="w-28 h-8 rounded-lg bg-surface-card" />
      </div>
    </div>
  );
};
