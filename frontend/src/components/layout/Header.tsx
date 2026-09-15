import React from 'react';
import { Bot, Activity, ShieldCheck, Video, Mic, RefreshCw } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';

interface HeaderProps {
  onReset?: () => void;
  onNavigate?: (view: 'home' | 'history') => void;
  currentView?: string;
  inSession?: boolean;
}

/**
 * Header Component
 * Studio-grade executive cockpit header with live system readiness indicators:
 * Webcam, Microphone, Whisper STT, and LLM Evaluator telemetry.
 */
export const Header: React.FC<HeaderProps> = ({ onReset, onNavigate, currentView = 'home', inSession }) => {
  const { hardwareStatus } = useSessionStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-panel/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Suite Identification */}
        <div
          role="button"
          tabIndex={0}
          onClick={onReset}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onReset?.();
          }}
          className="flex items-center gap-3 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-amber-signal/50 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-lg bg-surface-ground border border-border-default flex items-center justify-center text-amber-signal group-hover:border-amber-signal/50 transition-colors shadow-sm">
            <Bot className="w-5 h-5 stroke-[1.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-text-primary tracking-tight">
                HR BOT
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-amber-subtle text-amber-signal border border-amber-500/30">
                MK-IV
              </span>
            </div>
            <p className="text-[11px] font-mono text-text-tertiary">
              AUTONOMOUS INTERVIEW SIMULATOR // FYP 2026
            </p>
          </div>
        </div>

        {/* Global Navigation Controls */}
        <nav
          aria-label="Primary Navigation"
          className="flex items-center gap-1 p-1 rounded-lg bg-surface-ground border border-border-subtle text-xs font-mono"
        >
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            aria-current={currentView !== 'history' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-signal/50 ${
              currentView !== 'history'
                ? 'bg-amber-signal/15 text-amber-signal font-semibold border border-amber-500/40 shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
            }`}
          >
            SIMULATOR
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('history')}
            aria-current={currentView === 'history' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-signal/50 ${
              currentView === 'history'
                ? 'bg-amber-signal/15 text-amber-signal font-semibold border border-amber-500/40 shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
            }`}
          >
            ARCHIVE
          </button>
        </nav>

        {/* Live System Readiness Matrix */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 text-xs font-mono">
          {/* Webcam Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-ground/70 border border-border-subtle">
            <span
              className={`w-2 h-2 rounded-full ${
                hardwareStatus.cameraReady
                  ? 'bg-mint-eval shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : hardwareStatus.permissionDenied
                  ? 'bg-coral-alert'
                  : 'bg-amber-signal animate-pulse'
              }`}
            />
            <Video className="w-3.5 h-3.5 text-text-secondary stroke-[1.5]" />
            <span className="text-text-secondary">CAM:</span>
            <span className={hardwareStatus.cameraReady ? 'text-text-primary' : 'text-text-tertiary'}>
              {hardwareStatus.cameraReady
                ? `${hardwareStatus.resolution ?? '720p'} ${hardwareStatus.frameRate ? `${hardwareStatus.frameRate}FPS` : '30FPS'}`
                : hardwareStatus.permissionDenied
                ? 'DENIED'
                : '—'}
            </span>
          </div>

          {/* Separate MediaPipe Inference Throttle Label */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-ground/70 border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-mint-eval shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-text-secondary">INFERENCE:</span>
            <span className="text-text-primary font-semibold">15FPS</span>
          </div>

          {/* Mic Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-ground/70 border border-border-subtle">
            <span
              className={`w-2 h-2 rounded-full ${
                hardwareStatus.micReady
                  ? 'bg-mint-eval shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : hardwareStatus.permissionDenied
                  ? 'bg-coral-alert'
                  : 'bg-amber-signal animate-pulse'
              }`}
            />
            <Mic className="w-3.5 h-3.5 text-text-secondary stroke-[1.5]" />
            <span className="text-text-secondary">MIC:</span>
            <span className={hardwareStatus.micReady ? 'text-text-primary' : 'text-text-tertiary'}>
              {hardwareStatus.micReady ? 'READY' : hardwareStatus.permissionDenied ? 'DENIED' : '—'}
            </span>
          </div>

          {/* Whisper STT Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-ground/70 border border-border-subtle">
            <span
              className={`w-2 h-2 rounded-full ${
                hardwareStatus.speechReady
                  ? 'bg-mint-eval shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-text-tertiary'
              }`}
            />
            <Activity className="w-3.5 h-3.5 text-text-secondary stroke-[1.5]" />
            <span className="text-text-secondary">STT:</span>
            <span className={hardwareStatus.speechReady ? 'text-text-primary' : 'text-text-tertiary'}>
              {hardwareStatus.speechReady ? 'WHISPER-V3' : '—'}
            </span>
          </div>

          {/* LLM Engine Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-ground/70 border border-border-subtle">
            <span
              className={`w-2 h-2 rounded-full ${
                hardwareStatus.llmReady
                  ? 'bg-mint-eval shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-text-tertiary'
              }`}
            />
            <ShieldCheck className="w-3.5 h-3.5 text-text-secondary stroke-[1.5]" />
            <span className="text-text-secondary">LLM:</span>
            <span className={hardwareStatus.llmReady ? 'text-text-primary' : 'text-text-tertiary'}>
              {hardwareStatus.llmReady ? 'ONLINE' : '—'}
            </span>
          </div>
        </div>

        {/* Exit Session Action (When active) */}
        {inSession && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default hover:border-coral-alert/50 bg-surface-ground text-xs font-mono text-text-secondary hover:text-coral-alert transition-all focus:outline-none focus:ring-2 focus:ring-coral-alert/50"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>ABORT</span>
          </button>
        )}
      </div>
    </header>
  );
};
