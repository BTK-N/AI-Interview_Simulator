import React, { useState } from 'react';
import { MetricRing } from './MetricRing';
import { AudioWaveformCanvas } from './AudioWaveformCanvas';
import { KineticTypography } from './KineticTypography';
import { ReticleOverlay } from './ReticleOverlay';
import { FilmTimer } from './FilmTimer';
import { PullQuoteFeedback } from './PullQuoteFeedback';

/**
 * ComponentShowcaseProof
 * Visual verification harness demonstrating all 6 Phase 2 Core UI Components
 * interacting seamlessly with the Dark Obsidian, Phosphor Amber & Arctic Mint system.
 */
export const ComponentShowcaseProof: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds] = useState(45);
  const [reticleStatus, setReticleStatus] = useState<'Good' | 'Fair' | 'Looking Away'>('Good');

  return (
    <div className="min-h-screen bg-surface-ground text-text-primary p-6 md:p-12 space-y-12">
      {/* Header */}
      <header className="border-b border-border-subtle pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-amber-signal">
            Phase 2 Verification Harness
          </span>
          <h1 className="text-3xl font-display font-bold mt-1">
            Studio-Grade Core UI Components
          </h1>
          <p className="text-text-secondary text-sm mt-1 font-body">
            Demonstrating MetricRing, AudioWaveformCanvas, KineticTypography, ReticleOverlay, FilmTimer, and PullQuoteFeedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className="px-4 py-2 rounded-lg bg-amber-signal text-surface-ground font-mono font-semibold text-xs hover:bg-amber-400 transition-colors"
          >
            Toggle Recording: {isRecording ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => {
              const states: ('Good' | 'Fair' | 'Looking Away')[] = ['Good', 'Fair', 'Looking Away'];
              const next = states[(states.indexOf(reticleStatus) + 1) % states.length];
              setReticleStatus(next);
            }}
            className="px-4 py-2 rounded-lg bg-surface-panel border border-border-subtle text-text-secondary font-mono text-xs hover:text-text-primary transition-colors"
          >
            Reticle State: {reticleStatus}
          </button>
        </div>
      </header>

      {/* Grid 1: Kinetic Typography */}
      <section className="space-y-4">
        <h2 className="text-lg font-display font-semibold text-text-secondary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-signal" />
          Kinetic Typography
        </h2>
        <KineticTypography
          questionIndex={1}
          totalQuestions={5}
          category="System Design & Concurrency"
          text="How would you design a distributed rate limiter that handles 100,000 requests per second across three multi-region clusters with strict p99 latency guarantees?"
          onSpeak={() => {}}
          onStopSpeak={() => {}}
        />
      </section>

      {/* Grid 2: Metric Rings & Film Timer */}
      <section className="space-y-4">
        <h2 className="text-lg font-display font-semibold text-text-secondary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-mint-eval" />
          Radial Metric Rings & Concentric Film Timer
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <MetricRing score={94} label="Relevance" color="#F59E0B" delayMs={100} />
          <MetricRing score={88} label="Clarity" color="#10B981" delayMs={250} />
          <MetricRing score={79} label="Composure" color="#38BDF8" delayMs={400} />
          <FilmTimer
            remainingSeconds={timerSeconds}
            totalSeconds={60}
            className="ml-auto"
          />
        </div>
      </section>

      {/* Grid 3: Audio Waveform & Reticle */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-text-secondary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-signal" />
            Audio Waveform Spectrum (30fps Throttled)
          </h2>
          <AudioWaveformCanvas
            isRecording={isRecording}
            barCount={36}
            height={72}
          />
          <p className="font-mono text-xs text-text-tertiary">
            Status: {isRecording ? 'Active dynamic FFT spectrum' : 'Harmonic ambient idle wave'}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-text-secondary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-coral-alert" />
            Reticle Overlay (MediaPipe Telemetry HUD)
          </h2>
          <div className="relative w-full h-80 rounded-2xl bg-surface-panel border border-border-subtle overflow-hidden flex items-center justify-center">
            <span className="font-mono text-xs text-text-tertiary">
              [ Candidate Video Feed Container Mock ]
            </span>
            <ReticleOverlay
              status={reticleStatus}
              pitch={1.4}
              yaw={-0.6}
              confidenceScore={96}
              isLocked={reticleStatus === 'Good'}
            />
          </div>
        </div>
      </section>

      {/* Grid 4: Pull Quote Feedback */}
      <section className="space-y-4">
        <h2 className="text-lg font-display font-semibold text-text-secondary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-signal" />
          Editorial Evaluation Pull-Quotes (Anti-Slop)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PullQuoteFeedback
            intent="strength"
            category="System Design"
            timestamp="01:14"
            scoreDelta="+18 pts"
            verbatimQuote="We utilized Redis token bucket with a Lua script to ensure atomic decrements without race conditions across nodes."
            coachingDirective="Exceptional precision. Explicitly articulating race-condition avoidance via atomic Redis primitives directly demonstrates senior-level concurrency awareness."
          />

          <PullQuoteFeedback
            intent="directive"
            category="Delivery Pacing"
            timestamp="02:35"
            scoreDelta="-4 pts"
            verbatimQuote="Um, basically like, you know, we could also sort of put Kafka in front if the burst is too high."
            coachingDirective="Avoid hedge words ('basically like', 'sort of'). Reframe decisively: 'For burst mitigation, Kafka decouples ingestion from consumer backpressure.'"
          />
        </div>
      </section>
    </div>
  );
};
