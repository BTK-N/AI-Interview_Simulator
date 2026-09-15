import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import '../../lib/gsapSetup';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MetricRingProps {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  unit?: string;
  delayMs?: number;
}

/**
 * MetricRing Component
 * Animated radial score meter with GSAP stroke-dashoffset interpolation
 * and live tabular numeral counter.
 * Motion Spec: 900ms duration, cubic-bezier(0.16, 1, 0.3, 1) mechanical spring easing.
 * Fully WCAG accessible with aria-valuenow and prefers-reduced-motion gating.
 */
export const MetricRing: React.FC<MetricRingProps> = ({
  score,
  label,
  size = 110,
  strokeWidth = 7,
  color = '#F59E0B',
  trackColor = 'rgba(255, 255, 255, 0.08)',
  unit = '%',
  delayMs = 0,
}) => {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const [displayValue, setDisplayValue] = useState<number>(0);
  const reducedMotion = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const targetOffset = circumference - (clampedScore / 100) * circumference;

  useEffect(() => {
    if (!circleRef.current) return;

    if (reducedMotion) {
      // Reduced motion: instant jump without vestibular disruption
      circleRef.current.style.strokeDashoffset = `${targetOffset}`;
      setDisplayValue(Math.round(clampedScore));
      return;
    }

    // Set initial state
    circleRef.current.style.strokeDasharray = `${circumference}`;
    circleRef.current.style.strokeDashoffset = `${circumference}`;

    const counterObj = { val: 0 };
    const ctx = gsap.context(() => {
      // Stroke animation: exactly 900ms with cubic-bezier(0.16, 1, 0.3, 1)
      gsap.to(circleRef.current, {
        strokeDashoffset: targetOffset,
        duration: 0.9,
        delay: delayMs / 1000,
        ease: 'cockpitSpring',
      });

      // Synchronized number counting: exactly 900ms with cubic-bezier(0.16, 1, 0.3, 1)
      gsap.to(counterObj, {
        val: clampedScore,
        duration: 0.9,
        delay: delayMs / 1000,
        ease: 'cockpitSpring',
        onUpdate: () => {
          setDisplayValue(Math.round(counterObj.val));
        },
      });
    });

    return () => ctx.revert();
  }, [clampedScore, circumference, targetOffset, delayMs, reducedMotion]);

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${clampedScore}${unit}`}
      className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-panel border border-border-subtle metallic-rim"
      style={{ width: size + 32 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90 transform"
          aria-hidden="true"
        >
          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Active Progress Ring */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={reducedMotion ? targetOffset : circumference}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`,
              transition: reducedMotion ? 'none' : undefined,
            }}
          />
        </svg>

        {/* Center Tabular Figure Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono font-bold text-xl text-text-primary tracking-tight">
            {displayValue}
            <span className="text-xs font-normal text-text-secondary ml-0.5">{unit}</span>
          </span>
        </div>
      </div>

      <span className="font-display font-medium text-xs text-text-secondary uppercase tracking-wider mt-2.5 text-center">
        {label}
      </span>
    </div>
  );
};
