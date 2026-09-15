import React, { useState } from 'react';
import type { SessionReport } from '../../types';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface HistoricalTrendlineChartProps {
  sessions: SessionReport[];
  className?: string;
}

/**
 * HistoricalTrendlineChart
 * Pure SVG Hand-Rolled Dual-Line Progression Chart:
 * - Content Depth: Phosphor Amber (#F59E0B)
 * - Speech Clarity: Arctic Mint (#10B981)
 *
 * Fully eliminates Chart.js dependency from the History page route,
 * dropping the History bundle size while delivering razor-sharp SVG vectors,
 * subtle area glow fills, hover data tooltips, and prefers-reduced-motion support.
 */
export const HistoricalTrendlineChart: React.FC<HistoricalTrendlineChartProps> = ({
  sessions,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center font-mono text-xs text-text-tertiary">
        No longitudinal data available
      </div>
    );
  }

  // Display chronological order (oldest to newest)
  const chronological = [...sessions].reverse();

  // SVG coordinate dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const padLeft = 46;
  const padRight = 32;
  const padTop = 24;
  const padBottom = 34;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Scale: 50% to 100%
  const minVal = 50;
  const maxVal = 100;
  const valRange = maxVal - minVal;

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return padTop + chartHeight - ((clamped - minVal) / valRange) * chartHeight;
  };

  const getX = (index: number) => {
    if (chronological.length <= 1) return padLeft + chartWidth / 2;
    return padLeft + (index / (chronological.length - 1)) * chartWidth;
  };

  // Points for Content and Clarity
  const contentPoints = chronological.map((s, idx) => ({
    x: getX(idx),
    y: getY(s.content_score),
    val: s.content_score,
    session: s,
  }));

  const clarityPoints = chronological.map((s, idx) => ({
    x: getX(idx),
    y: getY(s.clarity_score),
    val: s.clarity_score,
    session: s,
  }));

  // Build smooth bezier curves
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      d += ` C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }
    return d;
  };

  const contentPathD = buildSmoothPath(contentPoints);
  const clarityPathD = buildSmoothPath(clarityPoints);

  // Closed area fills
  const contentAreaD =
    contentPoints.length > 0
      ? `${contentPathD} L ${contentPoints[contentPoints.length - 1].x} ${padTop + chartHeight} L ${contentPoints[0].x} ${padTop + chartHeight} Z`
      : '';

  const clarityAreaD =
    clarityPoints.length > 0
      ? `${clarityPathD} L ${clarityPoints[clarityPoints.length - 1].x} ${padTop + chartHeight} L ${clarityPoints[0].x} ${padTop + chartHeight} Z`
      : '';

  // Grid tick values: 50, 60, 70, 80, 90, 100
  const yTicks = [50, 60, 70, 80, 90, 100];

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label="Longitudinal Progression Chart"
      >
        <defs>
          <linearGradient id="amberAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="mintAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines and Y-axis Ticks */}
        {yTicks.map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={svgWidth - padRight}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray={tick === 50 ? 'none' : '3 3'}
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 3}
                fill="#94A3B8"
                fontSize="10"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* X-axis Tick Labels & Vertical Hover Guideline */}
        {chronological.map((s, idx) => {
          const x = getX(idx);
          const isHovered = hoveredIndex === idx;
          const roleSnippet = s.role_title.split(' ')[0];
          return (
            <g key={s.session_id}>
              {isHovered && (
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + chartHeight}
                  stroke="rgba(245, 158, 11, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}
              <text
                x={x}
                y={svgHeight - 10}
                fill={isHovered ? '#F8FAFC' : '#94A3B8'}
                fontSize="10"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                className="transition-colors"
              >
                {s.created_at} ({roleSnippet})
              </text>
            </g>
          );
        })}

        {/* Area Glow Fills */}
        <path d={contentAreaD} fill="url(#amberAreaGrad)" />
        <path d={clarityAreaD} fill="url(#mintAreaGrad)" />

        {/* Dual Lines */}
        <path
          d={contentPathD}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: prefersReduced ? 'none' : 2000,
            strokeDashoffset: prefersReduced ? 0 : 0,
            animation: prefersReduced ? 'none' : 'svgLineDraw 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />

        <path
          d={clarityPathD}
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: prefersReduced ? 'none' : 2000,
            strokeDashoffset: prefersReduced ? 0 : 0,
            animation: prefersReduced ? 'none' : 'svgLineDraw 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />

        {/* Data Points (Interactive Hover Targets) */}
        {chronological.map((_, idx) => {
          const cPt = contentPoints[idx];
          const mPt = clarityPoints[idx];
          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Invisible touch/hover target bar */}
              <rect
                x={cPt.x - 20}
                y={padTop}
                width={40}
                height={chartHeight}
                fill="transparent"
              />

              {/* Content Depth Dot (Amber) */}
              <circle
                cx={cPt.x}
                cy={cPt.y}
                r={isHovered ? 6 : 4}
                fill="#F59E0B"
                stroke="#080A0F"
                strokeWidth="2"
                className="transition-all duration-150"
              />

              {/* Speech Clarity Dot (Mint) */}
              <circle
                cx={mPt.x}
                cy={mPt.y}
                r={isHovered ? 6 : 4}
                fill="#10B981"
                stroke="#080A0F"
                strokeWidth="2"
                className="transition-all duration-150"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Dossier Tooltip */}
      {hoveredIndex !== null && chronological[hoveredIndex] && (
        <div
          className="absolute z-20 pointer-events-none p-3 rounded-lg bg-surface-panel/95 border border-amber-500/30 shadow-xl backdrop-blur-md text-xs font-mono -translate-x-1/2 -translate-y-full transition-all duration-100"
          style={{
            left: `${(getX(hoveredIndex) / svgWidth) * 100}%`,
            top: `${(Math.min(getY(chronological[hoveredIndex].content_score), getY(chronological[hoveredIndex].clarity_score)) / svgHeight) * 100}%`,
            marginTop: '-12px',
          }}
        >
          <div className="font-display font-bold text-text-primary text-[13px] mb-1">
            {chronological[hoveredIndex].role_title}
          </div>
          <div className="text-[11px] text-text-tertiary mb-2">
            {chronological[hoveredIndex].created_at} • {chronological[hoveredIndex].session_id}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-amber-signal">Content Depth:</span>
              <span className="font-bold text-text-primary">
                {chronological[hoveredIndex].content_score.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-mint-eval">Speech Clarity:</span>
              <span className="font-bold text-text-primary">
                {chronological[hoveredIndex].clarity_score.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-border-subtle">
              <span className="text-text-secondary">Composite:</span>
              <span className="font-bold text-text-primary">
                {chronological[hoveredIndex].overall_score.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes svgLineDraw {
          from { stroke-dashoffset: 2000; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};
