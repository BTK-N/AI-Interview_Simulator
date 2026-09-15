import React from 'react';
import { Quote, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export type FeedbackIntent = 'strength' | 'observation' | 'directive';

interface PullQuoteFeedbackProps {
  intent?: FeedbackIntent;
  category: string;
  verbatimQuote: string;
  timestamp?: string;
  coachingDirective: string;
  scoreDelta?: string;
  className?: string;
}

/**
 * PullQuoteFeedback Component
 * Senior executive editorial evaluation pull-quote.
 * Anti-AI Slop: Eliminates generic bullet points in favor of contextual,
 * verbatim-grounded coaching blocks with precision timestamp tags.
 * Motion Spec: 180ms duration, cubic-bezier(0.16, 1, 0.3, 1) hover/state transition.
 */
export const PullQuoteFeedback: React.FC<PullQuoteFeedbackProps> = ({
  intent = 'observation',
  category,
  verbatimQuote,
  timestamp = '01:24',
  coachingDirective,
  scoreDelta,
  className = '',
}) => {
  // Intent configurations
  const intentConfig = {
    strength: {
      border: 'border-l-mint-eval',
      bgGlow: 'bg-mint-subtle/30',
      badgeText: 'text-mint-eval',
      badgeBorder: 'border-mint-eval/30',
      icon: CheckCircle2,
      label: 'TECHNICAL MASTERY',
    },
    observation: {
      border: 'border-l-amber-signal',
      bgGlow: 'bg-amber-subtle/30',
      badgeText: 'text-amber-signal',
      badgeBorder: 'border-amber-signal/30',
      icon: Sparkles,
      label: 'EXECUTIVE OBSERVATION',
    },
    directive: {
      border: 'border-l-coral-alert',
      bgGlow: 'bg-coral-subtle/30',
      badgeText: 'text-coral-alert',
      badgeBorder: 'border-coral-alert/30',
      icon: AlertTriangle,
      label: 'GROWTH DIRECTIVE',
    },
  }[intent];

  const IntentIcon = intentConfig.icon;

  return (
    <div
      className={`relative rounded-r-xl border-l-[3px] ${intentConfig.border} bg-surface-card p-4 md:p-5 border-y border-r border-border-subtle shadow-lg transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-r-border-default hover:bg-surface-elevated ${className}`}
    >
      {/* Top Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold border ${intentConfig.badgeBorder} ${intentConfig.badgeText} ${intentConfig.bgGlow}`}
          >
            <IntentIcon className="w-3 h-3" />
            <span>{category.toUpperCase()}</span>
          </span>

          <span className="font-mono text-[10px] text-text-tertiary">
            // {intentConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {scoreDelta && (
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-ground border border-border-subtle text-text-primary">
              {scoreDelta}
            </span>
          )}
          {timestamp && (
            <span className="font-mono text-[11px] text-text-tertiary px-2 py-0.5 rounded bg-surface-ground/70 border border-border-subtle/60">
              REC [{timestamp}]
            </span>
          )}
        </div>
      </div>

      {/* Verbatim Candidate Quote */}
      <div className="relative pl-6 py-1 my-3 border-l border-white/10 italic text-text-secondary font-body text-sm sm:text-base leading-relaxed">
        <Quote className="absolute -left-1 -top-1 w-4 h-4 text-text-tertiary/40 not-italic transform -scale-x-100" />
        <span className="text-text-primary/95">"{verbatimQuote}"</span>
      </div>

      {/* Evaluator Coaching Directive */}
      <div className="mt-3 pt-3 border-t border-border-subtle/50 text-text-secondary text-xs sm:text-sm font-body leading-normal">
        <strong className="text-text-primary font-display font-medium block mb-1">
          Evaluator Takeaway:
        </strong>
        <p className="text-text-secondary/90">{coachingDirective}</p>
      </div>
    </div>
  );
};
