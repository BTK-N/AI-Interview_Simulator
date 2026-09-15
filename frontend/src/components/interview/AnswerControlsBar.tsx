import React from 'react';
import { Mic, Square, ArrowRight, RefreshCw, XCircle, Volume2, AlertTriangle } from 'lucide-react';
import type { SessionStage } from '../../types';

interface AnswerControlsBarProps {
  stage: SessionStage;
  isRecording: boolean;
  canSubmit: boolean;
  warningMessage?: string | null;
  onToggleRecording: () => void;
  onSubmit: () => void;
  onAbort: () => void;
  onReplayQuestion?: () => void;
  className?: string;
}

/**
 * AnswerControlsBar Component
 * Precision record, transcribe, submit bar with high-tactile buttons,
 * explicit keyboard shortcut indicators (Space, Enter, Esc),
 * stage-specific async labels (Whisper STT vs Rubric Eval),
 * and stage latency warning thresholds.
 */
export const AnswerControlsBar: React.FC<AnswerControlsBarProps> = ({
  stage,
  isRecording,
  canSubmit,
  warningMessage,
  onToggleRecording,
  onSubmit,
  onAbort,
  onReplayQuestion,
  className = '',
}) => {
  const isTranscribing = stage === 'transcribing';
  const isAnalyzing = stage === 'analyzing';
  const isProcessing = isTranscribing || isAnalyzing;

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* Dynamic Stage Latency Warning Banner */}
      {warningMessage && (
        <div
          role="status"
          aria-live="polite"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-signal font-mono text-xs tracking-wide shadow-lg backdrop-blur-md animate-pulse select-none"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-signal" />
          <span>{warningMessage}</span>
        </div>
      )}

      <div
        role="toolbar"
        aria-label="Interview answer response controls"
        className="rounded-2xl bg-surface-panel/95 border border-border-subtle p-4 sm:p-5 metallic-rim shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4"
      >
        {/* Left: Tactical Abort & Question Audio Replay */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAbort}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-ground/70 border border-border-subtle hover:border-coral-alert/50 text-text-secondary hover:text-coral-alert transition-all font-mono text-xs focus:outline-none focus:ring-2 focus:ring-coral-alert/40 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Abort interview session and return to suite"
          >
            <XCircle className="w-4 h-4 stroke-[1.5]" />
            <span>ABORT [ESC]</span>
          </button>

          {onReplayQuestion && (
            <button
              type="button"
              onClick={onReplayQuestion}
              disabled={isProcessing || isRecording}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-ground/70 border border-border-subtle hover:border-border-default text-text-secondary hover:text-text-primary transition-all font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-signal/40 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Replay question text-to-speech audio"
            >
              <Volume2 className="w-4 h-4 stroke-[1.5] text-amber-signal" />
              <span>REPLAY AUDIO</span>
            </button>
          )}
        </div>

        {/* Center: Primary Record / Pause Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleRecording}
            disabled={isProcessing}
            className={`relative px-6 py-3.5 rounded-xl font-mono font-bold text-sm tracking-wide uppercase transition-all flex items-center gap-2.5 shadow-xl select-none focus:outline-none focus:ring-2 ${
              isRecording
                ? 'bg-coral-alert hover:bg-rose-600 text-white shadow-rose-500/25 focus:ring-coral-alert/60 animate-pulse'
                : 'bg-amber-signal hover:bg-amber-400 text-surface-ground shadow-amber-500/20 focus:ring-amber-signal/60 active:scale-[0.99]'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>STOP RECORDING [SPACE]</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 stroke-[1.7]" />
                <span>RECORD RESPONSE [SPACE]</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Submit Answer Button with Stage-Specific Indicators */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isProcessing}
            className={`px-6 py-3.5 rounded-xl font-mono font-bold text-sm tracking-wide uppercase transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-mint-eval/60 select-none ${
              isTranscribing
                ? 'bg-amber-signal/15 text-amber-signal border border-amber-signal/40 shadow-lg shadow-amber-500/10 cursor-wait'
                : isAnalyzing
                ? 'bg-mint-eval/15 text-mint-eval border border-mint-eval/40 shadow-lg shadow-emerald-500/10 cursor-wait'
                : canSubmit
                ? 'bg-mint-eval hover:bg-emerald-400 text-surface-ground shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-[0.99]'
                : 'bg-surface-elevated text-text-tertiary border border-border-subtle cursor-not-allowed'
            }`}
          >
            {isTranscribing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-signal stroke-[1.5]" />
                <span>TRANSCRIBING [WHISPER]...</span>
              </>
            ) : isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-mint-eval stroke-[1.5]" />
                <span>EVALUATING [RUBRIC]...</span>
              </>
            ) : (
              <>
                <span>SUBMIT ANSWER [ENTER]</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
