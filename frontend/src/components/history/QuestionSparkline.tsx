import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface QuestionSparklineProps {
  scores: number[];
  color?: string;
  width?: number;
  height?: number;
}

/**
 * QuestionSparkline
 * Micro-telemetry SVG sparkline rendering per-question progression.
 * Features:
 * - Precise SVG cubic Bezier path interpolation across question scores
 * - 500ms stroke-dashoffset draw animation (bypassed on prefers-reduced-motion)
 * - Dot indicators with dark obsidian rims
 * - Accessible SVG title and aria attributes
 */
export const QuestionSparkline: React.FC<QuestionSparklineProps> = ({
  scores,
  color = '#10B981',
  width = 120,
  height = 36,
}) => {
  const prefersReduced = useReducedMotion();

  if (!scores || scores.length === 0) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-[10px] font-mono text-text-tertiary"
      >
        —
      </div>
    );
  }

  // Handle single question case
  if (scores.length === 1) {
    const score = scores[0];
    return (
      <div className="flex items-center gap-1 text-xs font-mono text-text-secondary">
        <span>Q1:</span>
        <span className="font-semibold text-text-primary">{score}%</span>
      </div>
    );
  }

  const paddingX = 8;
  const paddingY = 6;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  // Normalized scale between 50 and 100 for visual consistency
  const minVal = 50;
  const maxVal = 100;
  const range = maxVal - minVal;

  const points = scores.map((val, idx) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const x = paddingX + (idx / (scores.length - 1)) * usableWidth;
    const y = paddingY + usableHeight - ((clamped - minVal) / range) * usableHeight;
    return { x, y, val };
  });

  // Build SVG path
  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    const prev = points[idx - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Estimated path length for stroke-dashoffset animation
  const estimatedLength = usableWidth * 1.5;

  return (
    <div className="relative inline-flex items-center" title={`Per-question scores: ${scores.join('%, ')}%`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        role="img"
        aria-label={`Question trajectory: ${scores.join(', ')}`}
      >
        <defs>
          <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Ambient Subtle Guideline */}
        <line
          x1={paddingX}
          y1={height / 2}
          x2={width - paddingX}
          y2={height / 2}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeDasharray="2 2"
          strokeWidth="1"
        />

        {/* Sparkline Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: prefersReduced ? 'none' : estimatedLength,
            strokeDashoffset: prefersReduced ? 0 : 0,
            animation: prefersReduced
              ? 'none'
              : `sparklineDraw 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
          }}
        />

        {/* Question Vertex Dots */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="3"
              fill={color}
              stroke="#080A0F"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes sparklineDraw {
          from {
            stroke-dashoffset: ${estimatedLength};
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};
