import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type GazeStatus = 'Good' | 'Fair' | 'Looking Away' | 'Searching';

interface ReticleOverlayProps {
  status?: GazeStatus;
  confidenceScore?: number;
  pitch?: number;
  yaw?: number;
  isLocked?: boolean;
  className?: string;
}

/**
 * ReticleOverlay Component
 * Precision spatial cockpit targeting reticle for candidate positioning and gaze tracking.
 * Motion Spec: 600ms duration, cubic-bezier(0.34, 1.56, 0.64, 1) overshoot lock animation.
 * 
 * - 4 mechanical corner brackets with tactile overshoot lock animation
 * - JetBrains Mono telemetry readouts for pitch, yaw, and composure
 * - Color-coded feedback (Mint for centered, Amber for searching, Coral for deviation)
 * - AUDIT 2 compliance: when reduced motion is preferred, duration is 0 AND ease changes to 'none'
 */
export const ReticleOverlay: React.FC<ReticleOverlayProps> = ({
  status = 'Good',
  confidenceScore = 88,
  pitch = 1.2,
  yaw = -0.8,
  isLocked = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reticleBoxRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();

  // Status-driven color tokens
  const statusConfig = {
    Good: {
      color: '#10B981', // Mint
      label: 'CENTERED',
      icon: CheckCircle2,
      borderColor: 'border-mint-eval/50',
      badgeBg: 'bg-mint-subtle text-mint-eval',
    },
    Fair: {
      color: '#F59E0B', // Amber
      label: 'SLIGHT DRIFT',
      icon: Eye,
      borderColor: 'border-amber-signal/50',
      badgeBg: 'bg-amber-subtle text-amber-signal',
    },
    'Looking Away': {
      color: '#F43F5E', // Coral
      label: 'GAZE LOST',
      icon: AlertCircle,
      borderColor: 'border-coral-alert/50',
      badgeBg: 'bg-coral-subtle text-coral-alert',
    },
    Searching: {
      color: '#94A3B8', // Slate
      label: 'CALIBRATING',
      icon: Eye,
      borderColor: 'border-slate-500/50',
      badgeBg: 'bg-white/5 text-text-secondary',
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  // Mechanical corner snap animation with overshoot on lock state change
  useEffect(() => {
    if (!reticleBoxRef.current) return;

    const corners = reticleBoxRef.current.querySelectorAll('.reticle-bracket');
    if (corners.length === 0) return;

    const ctx = gsap.context(() => {
      if (isLocked) {
        // Snap inward with planned 600ms duration and cubic-bezier(0.34, 1.56, 0.64, 1) overshoot
        // If reduced motion is preferred: duration is 0 AND ease is 'none' (eliminates vestibular discomfort)
        gsap.fromTo(
          corners,
          {
            scale: prefersReduced ? 1 : 1.2,
            opacity: prefersReduced ? 1 : 0.5,
          },
          {
            scale: 1,
            opacity: 1,
            duration: prefersReduced ? 0 : 0.6, // Exactly 600ms
            ease: prefersReduced ? 'none' : 'back.out(1.7)', // cubic-bezier(0.34, 1.56, 0.64, 1)
            stagger: prefersReduced ? 0 : 0.04,
          }
        );
      } else {
        // Expand slightly when tracking is lost
        gsap.to(corners, {
          scale: prefersReduced ? 1 : 1.15,
          opacity: prefersReduced ? 1 : 0.6,
          duration: prefersReduced ? 0 : 0.4,
          ease: prefersReduced ? 'none' : 'power2.out',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isLocked, status, prefersReduced]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none p-4 flex flex-col justify-between select-none ${className}`}
      aria-hidden="true"
    >
      {/* Top Telemetry Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-ground/80 border border-border-subtle backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
          <span className="font-mono text-[10px] tracking-wider text-text-secondary uppercase">
            SYS.VISION // GZ-MK4
          </span>
        </div>

        {/* Live Status Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border border-border-subtle backdrop-blur-sm font-mono text-[11px] font-semibold ${statusConfig.badgeBg}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Center Reticle Targeting Frame */}
      <div className="relative self-center flex items-center justify-center w-52 h-64 sm:w-60 sm:h-72">
        <div
          ref={reticleBoxRef}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Top-Left Bracket */}
          <div
            className="reticle-bracket absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2"
            style={{ borderColor: statusConfig.color }}
          />
          {/* Top-Right Bracket */}
          <div
            className="reticle-bracket absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2"
            style={{ borderColor: statusConfig.color }}
          />
          {/* Bottom-Left Bracket */}
          <div
            className="reticle-bracket absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2"
            style={{ borderColor: statusConfig.color }}
          />
          {/* Bottom-Right Bracket */}
          <div
            className="reticle-bracket absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2"
            style={{ borderColor: statusConfig.color }}
          />

          {/* Precision Center Crosshair Ring */}
          <div
            className="w-12 h-12 rounded-full border border-dashed flex items-center justify-center transition-colors duration-200"
            style={{ borderColor: `${statusConfig.color}60` }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
              style={{ backgroundColor: statusConfig.color }}
            />
          </div>

          {/* Micro crosshair ticks */}
          <div className="absolute top-1/2 left-2 w-2 h-px bg-white/30 -translate-y-1/2" />
          <div className="absolute top-1/2 right-2 w-2 h-px bg-white/30 -translate-y-1/2" />
          <div className="absolute top-2 left-1/2 w-px h-2 bg-white/30 -translate-x-1/2" />
          <div className="absolute bottom-2 left-1/2 w-px h-2 bg-white/30 -translate-x-1/2" />
        </div>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="flex items-center justify-between font-mono text-[10px] text-text-tertiary z-10">
        <div className="flex items-center gap-3 px-2.5 py-1 rounded bg-surface-ground/80 border border-border-subtle backdrop-blur-sm">
          <span>PITCH: <strong className="text-text-primary">{pitch >= 0 ? `+${pitch.toFixed(1)}` : pitch.toFixed(1)}°</strong></span>
          <span className="text-white/20">|</span>
          <span>YAW: <strong className="text-text-primary">{yaw >= 0 ? `+${yaw.toFixed(1)}` : yaw.toFixed(1)}°</strong></span>
          <span className="text-white/20">|</span>
          <span>ACC: <strong className="text-text-primary">{confidenceScore}%</strong></span>
        </div>

        <div className="px-2.5 py-1 rounded bg-surface-ground/80 border border-border-subtle backdrop-blur-sm">
          <span className="text-text-tertiary">MP_RATE: </span>
          <span className="text-mint-eval font-semibold">15 FPS LOCKED</span>
        </div>
      </div>
    </div>
  );
};
