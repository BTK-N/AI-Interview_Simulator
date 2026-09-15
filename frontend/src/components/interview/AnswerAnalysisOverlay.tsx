import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MetricRing } from '../ui/MetricRing';
import { PullQuoteFeedback } from '../ui/PullQuoteFeedback';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ArrowRight, Award, AlertCircle, X, MessageSquare } from 'lucide-react';
import type { QuestionEvaluation } from '../../types';

interface AnswerAnalysisOverlayProps {
  evaluation: QuestionEvaluation;
  isLastQuestion: boolean;
  onNextQuestion: () => void;
  className?: string;
}

interface FillerTokenMeta {
  word: string;
  timestamp: string;
  suggestion: string;
}

const COMMON_FILLERS: Record<string, string> = {
  um: 'Replace vocalized pauses with silent breath pauses. Silence signals executive command.',
  uh: 'Deliberate cadence and structured breathing eliminate hesitation markers.',
  like: 'State assertions directly without comparative hedging ("like", "sort of").',
  basically: 'Eliminate meta-commentary. Lead with concrete architectural mechanisms.',
  actually: 'Drop conversational intensifiers; present technical rationale assertively.',
  'you know': 'Assume the interviewer understands fundamentals; focus on trade-off nuances.',
  'sort of': 'Provide exact system bounds and metrics rather than approximate qualifiers.',
};

/**
 * AnswerAnalysisOverlay Component (Screen 3)
 * Spatial executive feedback modal appearing directly over the cockpit.
 * 
 * Features:
 * - Modal overlay with backdrop-blur-xl and Dark Obsidian styling
 * - Three radial MetricRings: Content Relevance (Amber), Delivery Clarity (Mint), Composure (Cyan)
 * - Color-coded interactive transcript with clickable filler word chips (0.95 -> 1.0 hover scale)
 * - Clickable popover displaying timestamp, hesitation rationale, and actionable coaching suggestion
 * - Accessible score announcement via aria-live="polite"
 * - Full keyboard navigation (Tab through chips, Enter to advance, Esc to dismiss popover)
 * - Full prefers-reduced-motion support
 */
export const AnswerAnalysisOverlay: React.FC<AnswerAnalysisOverlayProps> = ({
  evaluation,
  isLastQuestion,
  onNextQuestion,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  const [selectedFiller, setSelectedFiller] = useState<{
    index: number;
    meta: FillerTokenMeta;
    targetRect: DOMRect | null;
  } | null>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('popover')) {
      return {
        index: 0,
        meta: {
          word: 'um',
          timestamp: '00:14',
          suggestion: 'Replace vocalized pauses with silent breath pauses. Silence signals executive command.',
        },
        targetRect: null,
      };
    }
    return null;
  });

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const continueBtnRef = useRef<HTMLButtonElement | null>(null);

  // Close popover on Outside Click or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedFiller(null);
      } else if (e.key === 'Enter' && !selectedFiller) {
        onNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFiller, onNextQuestion]);

  // Tokenize transcript into normal words and actionable filler chips
  const parsedTranscriptTokens = useMemo(() => {
    const text = evaluation.transcript || 'No spoken transcript captured for this question.';
    const rawTokens = text.split(/(\s+)/);

    let wordCounter = 0;
    return rawTokens.map((token, idx) => {
      const cleanWord = token.toLowerCase().replace(/[^a-z]/g, '');
      const isFiller = Boolean(COMMON_FILLERS[cleanWord]);

      if (token.trim().length > 0) wordCounter++;

      if (isFiller) {
        // Compute pseudo-timestamps based on approximate word position
        const estimatedSeconds = Math.max(12, Math.min(110, Math.round(wordCounter * 0.45)));
        const mm = String(Math.floor(estimatedSeconds / 60)).padStart(2, '0');
        const ss = String(estimatedSeconds % 60).padStart(2, '0');

        return {
          id: idx,
          raw: token,
          isFiller: true,
          meta: {
            word: cleanWord,
            timestamp: `${mm}:${ss}`,
            suggestion: COMMON_FILLERS[cleanWord],
          },
        };
      }

      return {
        id: idx,
        raw: token,
        isFiller: false,
      };
    });
  }, [evaluation.transcript]);

  // Sync initial selected filler word when popover query param is present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('popover')) {
      const firstFiller = parsedTranscriptTokens.find((t) => t.isFiller && t.meta);
      if (firstFiller && firstFiller.meta) {
        setSelectedFiller({
          index: firstFiller.id,
          meta: firstFiller.meta,
          targetRect: null,
        });
      }
    }
  }, [parsedTranscriptTokens]);

  const handleChipClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number,
    meta: FillerTokenMeta
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (selectedFiller?.index === index) {
      setSelectedFiller(null);
    } else {
      setSelectedFiller({ index, meta, targetRect: rect });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-ground/85 backdrop-blur-xl overflow-y-auto"
      onClick={() => setSelectedFiller(null)}
    >
      {/* Screen Reader Score Announcement */}
      <div className="sr-only" aria-live="polite">
        {`Answer evaluation complete. Overall score: ${evaluation.overall_question_score || 89} out of 100. Content relevance score: ${evaluation.relevance_score || 90}. Speech clarity score: ${evaluation.clarity_score || 85}. Physical composure score: ${evaluation.confidence_score || 88}.`}
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl max-h-[96vh] overflow-y-auto rounded-3xl bg-surface-panel/95 border border-border-default p-5 md:p-6 metallic-rim shadow-2xl space-y-4 ${className}`}
      >
        {/* Top Header & Progression Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-mint-subtle text-mint-eval border border-mint-eval/30">
              <Award className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-signal font-semibold">
                  SCREEN 03 // MULTIMODAL EVALUATION
                </span>
                <span className="text-white/20">•</span>
                <span className="font-mono text-[10px] text-text-tertiary">
                  OVERALL: {evaluation.overall_question_score || 89}/100
                </span>
              </div>
              <h2 id="analysis-title" className="font-display font-bold text-2xl text-text-primary mt-0.5">
                Response Analysis & Rubric Directives
              </h2>
            </div>
          </div>

          <button
            ref={continueBtnRef}
            type="button"
            onClick={onNextQuestion}
            className="px-6 py-2.5 rounded-xl bg-amber-signal hover:bg-amber-400 text-surface-ground font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-signal/70 active:scale-[0.98]"
          >
            <span>{isLastQuestion ? 'PROCEED TO FINAL REPORT' : 'CONTINUE TO NEXT QUESTION'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* 3 Radial MetricRings Section */}
        <section aria-label="Performance Metrics">
          <div className="p-3.5 rounded-2xl bg-surface-ground/70 border border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-4 items-center justify-items-center">
            {/* Ring 1: Content Relevance (Amber) */}
            <div className="flex flex-col items-center text-center">
              <MetricRing
                score={evaluation.relevance_score || 90}
                label="Content Relevance"
                color="#F59E0B"
                delayMs={prefersReduced ? 0 : 100}
                size={104}
              />
              <span className="font-mono text-[10px] text-text-tertiary mt-1.5">
                LLM ARCHITECTURAL RUBRIC
              </span>
            </div>

            {/* Ring 2: Delivery Clarity (Mint) */}
            <div className="flex flex-col items-center text-center">
              <MetricRing
                score={evaluation.clarity_score || 85}
                label="Delivery Clarity"
                color="#10B981"
                delayMs={prefersReduced ? 0 : 250}
                size={104}
              />
              <span className="font-mono text-[10px] text-text-tertiary mt-1.5">
                SPEECH & VOCAL CADENCE
              </span>
            </div>

            {/* Ring 3: Composure (Cyan) */}
            <div className="flex flex-col items-center text-center">
              <MetricRing
                score={evaluation.confidence_score || 88}
                label="Composure"
                color="#06B6D4"
                delayMs={prefersReduced ? 0 : 400}
                size={104}
              />
              <span className="font-mono text-[10px] text-text-tertiary mt-1.5">
                OPTICAL GAZE & HEAD STABILITY
              </span>
            </div>
          </div>
        </section>

        {/* Color-Coded Interactive Transcript Feed with Clickable Filler Chips */}
        <section aria-label="Spoken Transcript & Filler Analysis" className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-text-secondary stroke-[1.5]" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-text-primary font-semibold">
                SPOKEN TRANSCRIPT & CADENCE AUDIT
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-text-tertiary">
                SPEED: <strong className="text-text-secondary">{evaluation.wpm || 132} WPM</strong>
              </span>
              <span className="text-white/20">•</span>
              <span className="text-coral-alert font-semibold">
                {evaluation.filler_total ?? Object.keys(evaluation.filler_words || {}).length} FILLERS DETECTED
              </span>
            </div>
          </div>

          <div className="relative p-4 rounded-xl bg-surface-card border border-border-subtle font-body text-sm text-text-secondary leading-relaxed select-text">
            {parsedTranscriptTokens.map((token) => {
              if (token.isFiller && token.meta) {
                const isSelected = selectedFiller?.index === token.id;
                return (
                  <button
                    key={token.id}
                    type="button"
                    onClick={(e) => handleChipClick(e, token.id, token.meta!)}
                    aria-label={`Filler word ${token.meta.word}. Press Enter to view coaching tip.`}
                    aria-expanded={isSelected}
                    className={`inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded border font-mono text-xs font-semibold cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-coral-alert/70 ${
                      prefersReduced
                        ? 'transition-none'
                        : 'transition-all duration-180 ease-out transform hover:scale-100 scale-95'
                    } ${
                      isSelected
                        ? 'bg-coral-alert text-surface-ground border-coral-alert shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : 'bg-coral-alert/15 text-coral-alert border-coral-alert/40 hover:bg-coral-alert/25'
                    }`}
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{token.raw}</span>
                  </button>
                );
              }
              return <span key={token.id}>{token.raw}</span>;
            })}

            {/* Clickable Filler Word Popover Card */}
            {selectedFiller && (
              <div
                ref={popoverRef}
                role="tooltip"
                className="absolute z-30 max-w-sm left-6 right-6 sm:left-auto sm:right-6 bottom-4 p-4 rounded-xl bg-surface-panel border border-coral-alert/40 shadow-2xl backdrop-blur-xl space-y-2 animate-fadeIn"
              >
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-coral-alert/20 text-coral-alert font-mono text-[10px] font-bold">
                      [{selectedFiller.meta.timestamp}]
                    </span>
                    <span className="font-mono text-xs text-text-primary font-semibold">
                      Hesitation: &ldquo;{selectedFiller.meta.word}&rdquo;
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFiller(null)}
                    className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-white/5 cursor-pointer"
                    aria-label="Close suggestion popover"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-body text-xs text-text-secondary leading-normal">
                  {selectedFiller.meta.suggestion}
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-text-tertiary">
                  <span>TIP: Press [ESC] to dismiss</span>
                  <span className="text-amber-signal">Speech Cadence Impact</span>
                </div>
              </div>
            )}
          </div>
          <p className="font-mono text-[11px] text-text-tertiary">
            Click any highlighted coral chip to inspect timestamps and speech pacing directives.
          </p>
        </section>

        {/* Editorial Evaluation Pull-Quotes Grid */}
        <section aria-label="Editorial Coaching Directives" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PullQuoteFeedback
              intent="strength"
              category="Technical Mastery"
              timestamp="01:18"
              scoreDelta={`+${Math.round((evaluation.content_score || 88) * 0.2)} pts`}
              verbatimQuote={
                evaluation.transcript && evaluation.transcript.length > 20
                  ? evaluation.transcript.slice(0, 120) + '...'
                  : 'Articulated horizontal scalability invariants with zero unnecessary preamble.'
              }
              coachingDirective={
                evaluation.feedback ||
                'Decisive technical rationale. Seamlessly connected system primitives to fault tolerance boundaries.'
              }
            />

            <PullQuoteFeedback
              intent="directive"
              category="Delivery Optimization"
              timestamp="02:04"
              scoreDelta={
                evaluation.filler_total > 2
                  ? `-${evaluation.filler_total} fillers`
                  : 'Cadence optimal'
              }
              verbatimQuote={
                evaluation.filler_total > 0
                  ? `Recorded ${evaluation.filler_total} verbal pauses across response runtime.`
                  : 'Maintained continuous verbal tempo of ' + (evaluation.wpm || 132) + ' WPM.'
              }
              coachingDirective={
                evaluation.improvement_tips && evaluation.improvement_tips[0]
                  ? evaluation.improvement_tips[0]
                  : 'State high-level architectural invariants before descending into concurrency specifics.'
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
};
