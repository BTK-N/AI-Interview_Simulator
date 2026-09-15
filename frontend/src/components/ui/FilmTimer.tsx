import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Clock } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FilmTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isPaused?: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * FilmTimer Component
 * Cinematic film-leader concentric countdown timer.
 * Motion Spec: 1000ms tick duration, cubic-bezier(0.25, 1, 0.5, 1) ease-out radial sweep.
 * 
 * - Concentric circular progress stroke with mechanical countdown sweep
 * - Tabular JetBrains Mono countdown figures
 * - Three-stage alert colors: Amber normal (>15s), Warning Orange (<=15s), Critical Coral (<=5s)
 * - Rhythmic warning pulse (disabled when prefers-reduced-motion is active)
 */
export const FilmTimer: React.FC<FilmTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  isPaused = false,
  size = 112,
  strokeWidth = 5,
  className = '',
}) => {
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const reducedMotion = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressFraction = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  const strokeDashoffset = circumference * (1 - progressFraction);

  // Determine stage and color tokens
  const isCritical = remainingSeconds <= 5 && remainingSeconds > 0;
  const isWarning = remainingSeconds <= 15 && remainingSeconds > 5;

  let strokeColor = '#F59E0B'; // Amber signal
  let badgeColor = 'text-amber-signal';

  if (isCritical) {
    strokeColor = '#F43F5E'; // Anomaly Coral
    badgeColor = 'text-coral-alert';
  } else if (isWarning) {
    strokeColor = '#FB923C'; // Warning Orange
    badgeColor = 'text-orange-400';
  }

  // Critical countdown pulse animation
  useEffect(() => {
    if (!pulseRef.current || reducedMotion || !isCritical || isPaused) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        pulseRef.current,
        { scale: 1, opacity: 0.8 },
        {
          scale: 1.05,
          opacity: 1,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
        }
      );
    });

    return () => ctx.revert();
  }, [isCritical, isPaused, reducedMotion]);

  // Format MM:SS with fixed-width tabular characters in JetBrains Mono
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      ref={pulseRef}
      role="timer"
      aria-label={`Time remaining: ${formattedTime}`}
      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-panel border border-border-subtle metallic-rim select-none ${className}`}
      style={{ width: size + 28 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90 transform"
          aria-hidden="true"
        >
          {/* Outer Film Calibration Hairline */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 1}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={1}
          />
          {/* Main Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Active Countdown Stroke: exactly 1000ms (1.0s) and cubic-bezier(0.25, 1, 0.5, 1) */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${strokeColor}50)`,
              transition: reducedMotion
                ? 'none'
                : 'stroke-dashoffset 1.0s cubic-bezier(0.25, 1, 0.5, 1), stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Center Countdown Numerals formatted in JetBrains Mono font-mono */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Clock className={`w-3 h-3 mb-0.5 ${badgeColor} opacity-70`} />
          <span
            className={`font-mono font-bold text-lg tracking-tight tabular-nums ${badgeColor}`}
          >
            {formattedTime}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary mt-0.5">
            {isCritical ? 'EXPIRING' : isPaused ? 'PAUSED' : 'WINDOW'}
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
          TIME LIMIT
        </span>
      </div>
    </div>
  );
};
