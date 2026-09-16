import React, { useState, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import type { Question } from './types';
import { startSession, fetchSessionQuestions } from './api/client';
import { useSessionStore } from './store/sessionStore';
import { CockpitLoadingSkeleton } from './components/ui/CockpitLoadingSkeleton';

const InterviewSessionPage = React.lazy(() =>
  import('./pages/InterviewSessionPage').then((m) => ({ default: m.InterviewSessionPage }))
);
const ReportPage = React.lazy(() =>
  import('./pages/ReportPage').then((m) => ({ default: m.ReportPage }))
);
const HistoryPage = React.lazy(() =>
  import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage }))
);
const ComponentShowcaseProof = React.lazy(() =>
  import('./components/ui/ComponentShowcaseProof').then((m) => ({ default: m.ComponentShowcaseProof }))
);

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    role: 'software_engineer',
    type: 'technical',
    difficulty: 'hard',
    question: 'Describe how you architect an event-driven microservices pipeline with idempotent consumers and dead-letter queues.',
    expected_points: ['Idempotency keys', 'Dead-letter queues', 'Message ordering', 'Distributed transactions/Saga pattern'],
    model_answer: 'An event-driven architecture leverages unique message identifiers as idempotency keys, durable partitioned brokers, dead-letter exchanges for unrecoverable errors, and outbox patterns to guarantee consistency.',
    time_limit_sec: 120,
  },
  {
    id: 'q-2',
    role: 'software_engineer',
    type: 'technical',
    difficulty: 'hard',
    question: 'How do you diagnose and resolve an intermittent memory leak in a high-throughput backend service under production load?',
    expected_points: ['Heap profiling / core dumps', 'V8 / GC mechanics', 'Unbounded caches / event listeners', 'Telemetry metrics'],
    model_answer: 'I systematically capture heap snapshots during baseline and peak usage, inspect retained object graphs, examine event emitter bindings, and monitor GC pause times via Prometheus metrics.',
    time_limit_sec: 120,
  },
  {
    id: 'q-3',
    role: 'software_engineer',
    type: 'behavioral',
    difficulty: 'medium',
    question: 'Describe a situation where you had to push back on an executive deadline due to architectural technical debt.',
    expected_points: ['Quantifiable business risk', 'Alternative phased roadmap', 'Clear stakeholder alignment', 'Post-launch stability'],
    model_answer: 'I framed the risk in terms of customer SLA violations and MTTR impact, presented a phased delivery compromise, and secured buy-in for refactoring foundational storage bottlenecks.',
    time_limit_sec: 90,
  },
];

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'interview' | 'report' | 'history'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'interview') return 'interview';
      if (view === 'report') return 'report';
      if (view === 'history') return 'history';
    }
    return 'home';
  });

  const [showProofHarness, setShowProofHarness] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.search.includes('showcase');
  });

  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const querySession = params.get('session_id') || params.get('sessionId');
      if (querySession) return querySession;
      if (window.location.search.includes('interview')) return 'sess-sim-cockpit-alpha';
      if (window.location.search.includes('report')) return 'sess-sim-exec-782';
    }
    return '';
  });

  const [roleTitle, setRoleTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get('role_title') || params.get('roleTitle');
      if (queryRole) return queryRole;
      if (window.location.search.includes('interview') || window.location.search.includes('report')) {
        return 'Principal Distributed Systems Architect';
      }
    }
    return '';
  });

  const [sessionLanguage, setSessionLanguage] = useState<string>('en');

  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('interview')) {
      return FALLBACK_QUESTIONS;
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleStartSession = async (roleId: string, interviewType: string, language: string) => {
    setIsLoading(true);
    try {
      const sessionData = await startSession(roleId, interviewType, 5, language);
      const sessionQuestions = await fetchSessionQuestions(sessionData.session_id);
      
      setSessionId(sessionData.session_id);
      setRoleTitle(sessionData.role_title);
      setSessionLanguage(language);
      setQuestions(sessionQuestions);
      useSessionStore.getState().initSession({
        sessionId: sessionData.session_id,
        roleId,
        roleTitle: sessionData.role_title,
        language,
        questions: sessionQuestions,
      });
      setCurrentView('interview');
    } catch (err) {
      console.warn("Backend unavailable, initializing diagnostic simulation session:", err);
      const fallbackTitle =
        roleId === 'data_scientist'
          ? 'Lead Machine Learning Systems Engineer'
          : roleId === 'product_manager'
          ? 'Principal Technical Product Director'
          : 'Principal Distributed Systems Architect';

      setSessionId('sess-sim-cockpit-alpha');
      setRoleTitle(fallbackTitle);
      setSessionLanguage(language);
      setQuestions(FALLBACK_QUESTIONS);
      useSessionStore.getState().initSession({
        sessionId: 'sess-sim-cockpit-alpha',
        roleId,
        roleTitle: fallbackTitle,
        language,
        questions: FALLBACK_QUESTIONS,
      });
      setCurrentView('interview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSession = () => {
    setCurrentView('report');
  };

  const navigateToView = (view: 'home' | 'interview' | 'report' | 'history') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (view === 'home') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', view);
      }
      window.history.pushState({ view }, '', url.toString());
    }
  };

  React.useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'interview') setCurrentView('interview');
      else if (view === 'report') setCurrentView('report');
      else if (view === 'history') setCurrentView('history');
      else setCurrentView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleReset = () => {
    navigateToView('home');
    setSessionId('');
    setQuestions([]);
  };

  const handleSelectHistoricalSession = (selectedId: string) => {
    setSessionId(selectedId);
    navigateToView('report');
  };

  return (
    <div className="min-h-screen bg-surface-ground text-text-primary flex flex-col font-body">
      {showProofHarness ? (
        <div>
          <div className="bg-surface-panel border-b border-border-subtle px-6 py-2 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-signal">DEVELOPMENT HARNESS // PHASE 2 CORE COMPONENT AUDIT</span>
            <button
              onClick={() => setShowProofHarness(false)}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary"
            >
              Exit to Standard App →
            </button>
          </div>
          <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-text-tertiary">Loading Showcase Harness...</div>}>
            <ComponentShowcaseProof />
          </Suspense>
        </div>
      ) : (
        <>
          <Header
            onReset={handleReset}
            onNavigate={(view) => navigateToView(view)}
            currentView={currentView}
            inSession={currentView === 'interview' || currentView === 'report'}
          />

          <main className="flex-1">
            {currentView === 'home' && (
              <HomePage
                onStartSession={handleStartSession}
                isLoading={isLoading}
              />
            )}

            {currentView === 'interview' && (
              <Suspense fallback={<CockpitLoadingSkeleton label="INITIALIZING INTERVIEW COCKPIT..." />}>
                <InterviewSessionPage
                  sessionId={sessionId}
                  roleTitle={roleTitle}
                  language={sessionLanguage}
                  questions={questions}
                  onCompleteSession={handleCompleteSession}
                />
              </Suspense>
            )}

            {currentView === 'report' && (
              <Suspense fallback={<CockpitLoadingSkeleton label="CALCULATING METRICS & EVALUATION REPORT..." />}>
                <ReportPage
                  sessionId={sessionId}
                  onNewInterview={handleReset}
                />
              </Suspense>
            )}

            {currentView === 'history' && (
              <Suspense fallback={<CockpitLoadingSkeleton label="RETRIEVING ARCHIVED PERFORMANCE DOSSIERS..." />}>
                <HistoryPage
                  onSelectSession={handleSelectHistoricalSession}
                  onStartNewInterview={handleReset}
                />
              </Suspense>
            )}
          </main>

          <footer className="border-t border-border-subtle py-5 text-center text-xs text-text-tertiary bg-surface-panel/40 font-mono">
            <p>HR BOT (AI-BASED INTERVIEW SIMULATOR) • DEPT. OF SOFTWARE ENGINEERING • FYP 2026</p>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;

