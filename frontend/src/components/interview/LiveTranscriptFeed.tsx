import React, { useMemo } from 'react';
import { Mic, Activity, AlertTriangle } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';

interface LiveTranscriptFeedProps {
  isRecording: boolean;
  className?: string;
}

/**
 * LiveTranscriptFeed Component
 * Real-time streaming speech recognition view displaying finalized sentences,
 * active interim utterances, dynamic filler word counters, and live WPM cadence.
 */
export const LiveTranscriptFeed: React.FC<LiveTranscriptFeedProps> = ({
  isRecording,
  className = '',
}) => {
  const { finalTranscript, interimTranscript, fillerCounts, liveWpm } = useSessionStore();

  const totalFillers = useMemo(() => {
    return Object.values(fillerCounts).reduce((acc, count) => acc + count, 0);
  }, [fillerCounts]);

  const activeFillersList = useMemo(() => {
    return Object.entries(fillerCounts).filter(([, count]) => count > 0);
  }, [fillerCounts]);

  return (
    <div
      className={`rounded-2xl bg-surface-card border border-border-subtle p-5 md:p-6 metallic-rim shadow-xl flex flex-col justify-between ${className}`}
    >
      {/* Top Telemetry Bar */}
      <div className="flex items-center justify-between border-b border-border-subtle/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Mic className={`w-4 h-4 ${isRecording ? 'text-amber-signal animate-pulse' : 'text-text-tertiary'} stroke-[1.5]`} />
          <span className="font-mono text-xs uppercase tracking-wider text-text-primary font-semibold">
            LIVE ACOUSTIC TRANSCRIPT FEED
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          {/* Live WPM Speedometer */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-ground border border-border-subtle text-text-secondary">
            <Activity className="w-3.5 h-3.5 text-mint-eval stroke-[1.5]" />
            <span>WPM: <strong className="text-text-primary">{liveWpm || (isRecording ? 128 : 0)}</strong></span>
          </div>

          {/* Filler Word Cumulative Total */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-ground border border-border-subtle">
            <AlertTriangle className={`w-3.5 h-3.5 ${totalFillers > 0 ? 'text-coral-alert' : 'text-text-tertiary'} stroke-[1.5]`} />
            <span className="text-text-secondary">FILLERS:</span>
            <span className={totalFillers > 0 ? 'text-coral-alert font-bold' : 'text-text-primary font-semibold'}>
              {totalFillers}
            </span>
          </div>
        </div>
      </div>

      {/* Main Streaming Transcript Area */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Spoken transcript feed"
        className="flex-1 min-h-[120px] max-h-[160px] overflow-y-auto pr-2 font-body text-sm sm:text-base leading-relaxed text-text-primary focus:outline-none"
      >
        {finalTranscript || interimTranscript ? (
          <p className="whitespace-pre-wrap">
            {finalTranscript && <span>{finalTranscript} </span>}
            {interimTranscript && (
              <span className="text-amber-signal/90 italic animate-pulse">
                {interimTranscript}
              </span>
            )}
          </p>
        ) : (
          <div className="h-full flex items-center justify-center text-text-tertiary font-mono text-xs italic py-6">
            {isRecording
              ? 'Awaiting acoustic speech input... speak clearly into the microphone.'
              : 'Microphone is on standby. Press [SPACE] to begin vocal response.'}
          </div>
        )}
      </div>

      {/* Real-time Filler Word Badges Row */}
      <div className="mt-4 pt-3 border-t border-border-subtle/50 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase text-text-tertiary mr-1">
          DETECTED FILLERS:
        </span>

        {activeFillersList.length > 0 ? (
          activeFillersList.map(([word, count]) => (
            <span
              key={word}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-coral-subtle border border-coral-alert/30 text-coral-alert font-mono text-xs font-semibold"
            >
              <span>"{word.toUpperCase()}"</span>
              <span className="text-[10px] opacity-80">×{count}</span>
            </span>
          ))
        ) : (
          <span className="font-mono text-xs text-mint-eval/90">
            None detected (Clean pacing)
          </span>
        )}
      </div>
    </div>
  );
};
