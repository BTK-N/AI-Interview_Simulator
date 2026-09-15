import React, { useEffect, useRef, useState } from 'react';
import {
  Archive,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import gsap from 'gsap';
import { useSessionStore } from '../store/sessionStore';
import { getReadinessTier, type SessionReport } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { HistoricalTrendlineChart } from '../components/history/HistoricalTrendlineChart';
import { QuestionSparkline } from '../components/history/QuestionSparkline';
import { fetchHistoricalSessions } from '../api/client';

interface HistoryPageProps {
  onSelectSession: (sessionId: string) => void;
  onStartNewInterview: () => void;
}

/**
 * HistoryPage Component (Screen 5: Interview Archive & Analytics)
 *
 * Dedicated executive archive featuring:
 * - Real-time aggregate telemetry (sessions, average index, total questions, hours practiced)
 * - Historical dual-line progression chart (Content Depth vs. Speech Clarity)
 * - Editorial session cards with animated SVG sparklines and readiness tier badges
 * - Staggered entrance animations (60ms stagger) with reduced-motion support
 * - Complete empty state support (?empty=1 or zero sessions)
 */
export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectSession,
  onStartNewInterview,
}) => {
  const { sessions, clearSessionHistory, setSessionHistory } = useSessionStore();
  const prefersReduced = useReducedMotion();
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Fetch backend sessions on mount (Option A: Backend-driven History with local cache fallback)
  useEffect(() => {
    let mounted = true;
    fetchHistoricalSessions(20, 0)
      .then((data) => {
        if (!mounted) return;
        if (data && data.sessions && data.sessions.length > 0) {
          const mapped: SessionReport[] = data.sessions.map((s) => ({
            session_id: s.session_id || s.id,
            role_id: s.role_id,
            role_title: s.role_title,
            created_at: s.created_at,
            total_questions: s.total_questions || 3,
            overall_score: s.overall_score,
            confidence_score: s.confidence_score,
            clarity_score: s.clarity_score,
            content_score: s.content_score,
            is_demo: s.is_demo,
            top_strengths: ['Solid articulation of core engineering concepts and trade-offs.'],
            top_weaknesses: ['Minor pause hesitations between architectural layers.'],
            actionable_recommendations: ['Structure complex explanations with deliberate silent pauses.'],
            per_question_results: [
              {
                question_id: 'q1',
                question_text: 'Key architectural fundamentals.',
                transcript: 'Spoken candidate answer.',
                relevance_score: 8.5,
                completeness_score: 8.0,
                structure_score: 8.2,
                content_score: s.content_score,
                words_count: 85,
                wpm: 140,
                filler_words: {},
                filler_total: 0,
                clarity_score: s.clarity_score,
                confidence_score: s.confidence_score,
                overall_question_score: s.overall_score,
                feedback: 'Substantive response.',
                improvement_tips: [],
                model_answer: ''
              }
            ]
          }));
          setSessionHistory(mapped);
          setIsOffline(false);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setIsOffline(true);
      });

    return () => {
      mounted = false;
    };
  }, [setSessionHistory]);

  // Allow URL override (?empty=1) for testing the empty state
  const [forceEmpty] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('empty') === '1';
    }
    return false;
  });

  const displaySessions: SessionReport[] = forceEmpty ? [] : sessions;

  // Staggered card entrance with GSAP
  useEffect(() => {
    if (prefersReduced || displaySessions.length === 0 || !cardsContainerRef.current) return;

    const cards = cardsContainerRef.current.querySelectorAll('.history-card');
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all',
      }
    );
  }, [displaySessions.length, prefersReduced]);

  // Aggregate telemetry metrics
  const totalSessions = displaySessions.length;
  const avgCompositeScore =
    totalSessions > 0
      ? (
          displaySessions.reduce((acc, s) => acc + s.overall_score, 0) / totalSessions
        ).toFixed(1)
      : '0.0';

  const totalQuestions = displaySessions.reduce(
    (acc, s) => acc + (s.total_questions || s.per_question_results?.length || 3),
    0
  );

  const estimatedMinutes = Math.round(totalQuestions * 3.5);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-ground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Banner & Primary Actions */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-mono text-amber-signal uppercase tracking-widest mb-1.5">
              <Archive className="w-4 h-4 stroke-[1.5]" />
              <span>Screen 05 // Executive Dossier Archive & Analytics</span>
              {isOffline && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  LOCAL CACHE (OFFLINE)
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
              Historical Performance Archive
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Multi-session longitudinal evaluation telemetry, competency curves, and archival dossiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {displaySessions.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all session history and reset archive?')) {
                    clearSessionHistory();
                  }
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border-default hover:border-coral-alert/40 text-xs font-mono text-text-secondary hover:text-coral-alert bg-surface-panel/60 transition-colors"
                title="Reset session history"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>RESET ARCHIVE</span>
              </button>
            )}

            <button
              onClick={onStartNewInterview}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-signal text-surface-ground font-display font-bold text-sm tracking-wide hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-signal/50"
            >
              <PlusCircle className="w-4 h-4 stroke-[2]" />
              <span>NEW INTERVIEW</span>
            </button>
          </div>
        </header>

        {/* Empty State */}
        {displaySessions.length === 0 ? (
          <div className="py-20 px-6 max-w-xl mx-auto text-center space-y-5 bg-surface-panel/40 border border-border-subtle rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-surface-ground border border-border-default flex items-center justify-center mx-auto text-text-tertiary">
              <Archive className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-bold text-xl text-text-primary tracking-tight">
                No Interview Sessions Recorded
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed font-body">
                {forceEmpty
                  ? 'Viewing forced empty state preview (?empty=1). Remove parameter to see populated archive.'
                  : "You haven't completed any interview simulator sessions yet. Launch the cockpit simulator to generate your first multimodal performance dossier."}
              </p>
            </div>
            <button
              onClick={onStartNewInterview}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-signal text-surface-ground font-display font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/15"
            >
              <PlusCircle className="w-4 h-4 stroke-[2]" />
              <span>LAUNCH INTERVIEW ROOM</span>
            </button>
          </div>
        ) : (
          <>
            {/* Real-time Aggregate Telemetry Matrix */}
            <section
              aria-label="Aggregate Performance Metrics"
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <div className="p-4 rounded-xl bg-surface-panel border border-border-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-tertiary mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Total Sessions</span>
                  <Layers className="w-4 h-4 text-amber-signal stroke-[1.5]" />
                </div>
                <div>
                  <div className="font-display font-bold text-2xl sm:text-3xl text-text-primary">
                    {totalSessions}
                  </div>
                  <span className="text-[11px] font-mono text-text-tertiary">Archived dossiers</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-panel border border-border-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-tertiary mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Composite Avg</span>
                  <Award className="w-4 h-4 text-mint-eval stroke-[1.5]" />
                </div>
                <div>
                  <div className="font-display font-bold text-2xl sm:text-3xl text-mint-eval">
                    {avgCompositeScore}%
                  </div>
                  <span className="text-[11px] font-mono text-text-tertiary">Overall proficiency</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-panel border border-border-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-tertiary mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Evaluated Qs</span>
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 stroke-[1.5]" />
                </div>
                <div>
                  <div className="font-display font-bold text-2xl sm:text-3xl text-text-primary">
                    {totalQuestions}
                  </div>
                  <span className="text-[11px] font-mono text-text-tertiary">STAR responses parsed</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-panel border border-border-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between text-text-tertiary mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Practice Time</span>
                  <Clock className="w-4 h-4 text-text-secondary stroke-[1.5]" />
                </div>
                <div>
                  <div className="font-display font-bold text-2xl sm:text-3xl text-text-primary">
                    {estimatedMinutes}m
                  </div>
                  <span className="text-[11px] font-mono text-text-tertiary">Active interview airtime</span>
                </div>
              </div>
            </section>

            {/* Longitudinal Progression Chart */}
            <section
              aria-label="Progression Trendline"
              className="p-5 sm:p-6 rounded-2xl bg-surface-panel border border-border-subtle space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-mint-eval stroke-[1.5]" />
                    <span>Longitudinal Competency Progression</span>
                  </div>
                  <h2 className="font-display font-bold text-lg text-text-primary mt-1">
                    Content Depth vs. Speech Clarity Trajectory
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-signal" />
                    Content Depth
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-mint-eval" />
                    Speech Clarity
                  </span>
                </div>
              </div>

              <HistoricalTrendlineChart sessions={displaySessions} />
            </section>

            {/* Editorial Session Cards Grid */}
            <section aria-label="Archived Interview Sessions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-text-primary tracking-tight">
                  Archived Performance Dossiers
                </h2>
                <span className="text-xs font-mono text-text-tertiary">
                  Showing {displaySessions.length} sessions
                </span>
              </div>

              <div
                ref={cardsContainerRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                {displaySessions.map((session) => {
                  const tierInfo = getReadinessTier(session.overall_score);
                  const qScores =
                    session.per_question_results?.map(
                      (q) => q.overall_question_score || q.content_score || 85
                    ) || [85, 85, 85];

                  const keyStrength =
                    session.top_strengths?.[0] ||
                    'Strong domain articulation and consistent architectural grounding.';

                  return (
                    <article
                      key={session.session_id}
                      tabIndex={0}
                      role="button"
                      onClick={() => onSelectSession(session.session_id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectSession(session.session_id);
                        }
                      }}
                      className="history-card group relative p-5 rounded-2xl bg-surface-panel border border-border-subtle hover:border-amber-signal/50 focus:border-amber-signal focus:outline-none focus:ring-2 focus:ring-amber-signal/30 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Header: Role & Date */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-text-tertiary mb-1">
                              <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                              <span>{session.created_at}</span>
                              <span>•</span>
                              <span className="text-text-secondary">{session.session_id}</span>
                            </div>
                            <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-amber-signal transition-colors tracking-tight">
                              {session.role_title}
                            </h3>
                          </div>

                          {/* Badges Container */}
                          <div className="flex items-center gap-2 shrink-0">
                            {Boolean(session.is_demo || (session as unknown as { is_demo?: boolean }).is_demo) && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-slate-800/80 text-slate-400 border border-slate-700/60 shrink-0">
                                SAMPLE
                              </span>
                            )}
                            {/* Readiness Tier Badge */}
                            <div
                              className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold border flex items-center gap-1.5 shrink-0"
                              style={{
                                backgroundColor: `${tierInfo.color}15`,
                                borderColor: `${tierInfo.color}40`,
                                color: tierInfo.color,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: tierInfo.color }}
                              />
                              <span>{tierInfo.tier.toUpperCase()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Metrics & Sparkline Row */}
                        <div className="grid grid-cols-12 gap-3 py-3 my-2 border-y border-border-subtle/80 items-center">
                          {/* Composite Score Pill */}
                          <div className="col-span-5 flex items-baseline gap-2">
                            <span className="font-display font-bold text-3xl text-text-primary">
                              {session.overall_score.toFixed(1)}
                            </span>
                            <span className="text-xs font-mono text-text-tertiary">/ 100</span>
                          </div>

                          {/* Question Sparkline Micro-Telemetry */}
                          <div className="col-span-7 flex flex-col items-end justify-center">
                            <div className="flex items-center gap-1 text-[11px] font-mono text-text-tertiary mb-1">
                              <span>Q-TRAJECTORY:</span>
                              <span className="text-text-primary font-semibold">
                                {qScores.join(' → ')}%
                              </span>
                            </div>
                            <QuestionSparkline
                              scores={qScores}
                              color={tierInfo.color}
                              width={140}
                              height={32}
                            />
                          </div>
                        </div>

                        {/* Pillar Breakdown Micro-Pills */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-1">
                          <div className="p-1.5 rounded bg-surface-ground border border-border-subtle">
                            <div className="text-[10px] text-text-tertiary uppercase">Content</div>
                            <div className="font-bold text-amber-signal">
                              {session.content_score?.toFixed(1) ?? '—'}%
                            </div>
                          </div>
                          <div className="p-1.5 rounded bg-surface-ground border border-border-subtle">
                            <div className="text-[10px] text-text-tertiary uppercase">Clarity</div>
                            <div className="font-bold text-mint-eval">
                              {session.clarity_score?.toFixed(1) ?? '—'}%
                            </div>
                          </div>
                          <div className="p-1.5 rounded bg-surface-ground border border-border-subtle">
                            <div className="text-[10px] text-text-tertiary uppercase">Composure</div>
                            <div className="font-bold text-cyan-400">
                              {session.confidence_score?.toFixed(1) ?? '—'}%
                            </div>
                          </div>
                        </div>

                        {/* Key Strength Excerpt */}
                        <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary leading-relaxed line-clamp-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-signal shrink-0 mt-0.5" />
                          <span>{keyStrength}</span>
                        </div>
                      </div>

                      {/* Card Footer: Inspect Dossier Link */}
                      <div className="pt-4 mt-3 flex items-center justify-between border-t border-border-subtle/50 text-xs font-mono">
                        <span className="text-text-tertiary">
                          {session.total_questions || session.per_question_results?.length || 3} questions evaluated
                        </span>
                        <div className="flex items-center gap-1.5 text-amber-signal group-hover:translate-x-1 transition-transform font-semibold">
                          <span>INSPECT DOSSIER</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
