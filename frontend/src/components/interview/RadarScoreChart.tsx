import React, { useEffect, useRef } from 'react';
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Explicit registration to guarantee aggressive tree-shaking (zero unnecessary controllers)
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export interface RadarMetricScores {
  technicalDepth: number;
  communicationClarity: number;
  gazeComposure: number;
  toneStability: number;
  pacing: number;
}

interface RadarScoreChartProps {
  scores: RadarMetricScores;
  className?: string;
}

/**
 * RadarScoreChart Component (Screen 4: Executive Performance Dossier)
 * 5-Axis Multi-Dimensional Competency Radar
 * 
 * Features:
 * - Explicit Chart.js tree-shaking (RadarController + RadialLinearScale only)
 * - 5 Evaluated Competency Axes: Technical Depth, Communication Clarity, Gaze Composure, Tone Stability, Pacing
 * - Obsidian Ground & Electric Phosphor Amber aesthetic
 * - 900ms unfurl animation with cockpitSpring easing
 * - Full prefers-reduced-motion bypass
 */
export const RadarScoreChart: React.FC<RadarScoreChartProps> = ({ scores, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          'Technical Depth',
          'Communication Clarity',
          'Gaze Composure',
          'Tone Stability',
          'Pacing',
        ],
        datasets: [
          {
            label: 'Candidate Competency',
            data: [
              scores.technicalDepth,
              scores.communicationClarity,
              scores.gazeComposure,
              scores.toneStability,
              scores.pacing,
            ],
            backgroundColor: 'rgba(245, 158, 11, 0.18)', // Phosphor Amber subtle fill
            borderColor: '#F59E0B',                      // Phosphor Amber line
            borderWidth: 2,
            pointBackgroundColor: '#F59E0B',
            pointBorderColor: '#080A0F',                 // Obsidian Ground rim
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#10B981',        // Arctic Mint hover
            pointHoverBorderColor: '#080A0F',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReduced
          ? false
          : {
              duration: 900,
              easing: 'easeOutQuart',
            },
        scales: {
          r: {
            angleLines: {
              color: 'rgba(255, 255, 255, 0.08)',
              lineWidth: 1,
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.06)',
              lineWidth: 1,
            },
            pointLabels: {
              color: '#94A3B8', // Titanium Slate
              font: {
                family: 'JetBrains Mono',
                size: 11,
                weight: 500,
              },
              padding: 12,
            },
            ticks: {
              display: false,
              stepSize: 20,
            },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
        plugins: {
          tooltip: {
            backgroundColor: '#0F131C',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            borderWidth: 1,
            padding: 10,
            titleColor: '#F59E0B',
            titleFont: {
              family: 'Space Grotesk',
              size: 12,
              weight: 'bold',
            },
            bodyColor: '#F8FAFC',
            bodyFont: {
              family: 'JetBrains Mono',
              size: 11,
            },
            callbacks: {
              label: (context) => ` ${context.parsed.r}% Competency`,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [scores, prefersReduced]);

  return (
    <div className={`relative w-full h-[280px] sm:h-[320px] flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};
