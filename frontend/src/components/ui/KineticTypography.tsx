import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import '../../lib/gsapSetup';
import { Volume2, VolumeX } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface KineticTypographyProps {
  text: string;
  category?: string;
  questionIndex?: number;
  totalQuestions?: number;
  onSpeak?: () => void;
  onStopSpeak?: () => void;
  isSpeaking?: boolean;
  className?: string;
}

/**
 * KineticTypography Component
 * Editorial line-staggered kinetic text reveal using Space Grotesk.
 * Motion Spec: 450ms duration, cubic-bezier(0.16, 1, 0.3, 1) spring easing, line-by-line stagger.
 * 
 * - Splits text into semantic phrases/lines
 * - GSAP cubic-bezier(0.16, 1, 0.3, 1) vertical translation with optical fade
 * - Instant fallback under prefers-reduced-motion
 * - Accessible aria-live announcements for screen readers
 */
export const KineticTypography: React.FC<KineticTypographyProps> = ({
  text,
  category,
  questionIndex,
  totalQuestions,
  onSpeak,
  onStopSpeak,
  isSpeaking = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  // Split text into lines/sentences for staggered delivery
  const lines = useMemo(() => {
    if (!text) return [];
    const rawLines = text.split('\n').filter(Boolean);
    if (rawLines.length > 1) return rawLines;

    const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g);
    return sentences && sentences.length > 1 ? sentences : [text];
  }, [text]);

  useEffect(() => {
    if (!containerRef.current || lines.length === 0) return;

    const lineElements = containerRef.current.querySelectorAll('.kinetic-line-inner');
    if (lineElements.length === 0) return;

    if (reducedMotion) {
      // Instant render for vestibular safety
      lineElements.forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    // GSAP context for clean garbage collection
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineElements,
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.45, // Exactly 450ms
          stagger: 0.08,
          ease: 'cockpitSpring', // Exactly cubic-bezier(0.16, 1, 0.3, 1)
          overwrite: 'auto',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [lines, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl bg-surface-panel/90 border border-border-subtle p-6 md:p-8 metallic-rim shadow-2xl ${className}`}
    >
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-border-subtle/60 mb-6">
        <div className="flex items-center gap-3">
          {questionIndex !== undefined && (
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-subtle text-amber-signal border border-amber-500/30">
              Q{String(questionIndex).padStart(2, '0')}
              {totalQuestions ? ` / ${String(totalQuestions).padStart(2, '0')}` : ''}
            </span>
          )}
          {category && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
              {category}
            </span>
          )}
        </div>

        {/* TTS Toggle Audio Button */}
        {onSpeak && (
          <button
            type="button"
            onClick={isSpeaking ? onStopSpeak : onSpeak}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle hover:border-border-default bg-surface-ground/60 hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-all text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-signal/50"
            aria-label={isSpeaking ? 'Stop voice reading' : 'Read question aloud'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-coral-alert" />
                <span className="text-coral-alert">Mute Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-signal" />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Kinetic Typography Body (Aria Live for accessibility) */}
      <div
        aria-live="polite"
        className="space-y-2 text-text-primary font-display font-semibold text-xl sm:text-2xl md:text-3xl leading-snug tracking-tight"
      >
        {lines.map((line, idx) => (
          <div key={idx} className="overflow-hidden">
            <div className="kinetic-line-inner block will-change-transform">
              {line.trim()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
