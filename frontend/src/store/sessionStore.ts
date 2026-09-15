import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Question, QuestionEvaluation, SessionReport, SessionStage, VisionTelemetry } from '../types';
import { DEFAULT_HISTORICAL_SESSIONS } from '../fixtures/historicalSessions';

/**
 * 9-STAGE FINITE STATE MACHINE (FSM) TRANSITION GRAPH
 * Explicit valid state transition matrix. Any transition not defined here is strictly rejected.
 */
export const ALLOWED_TRANSITIONS: Record<SessionStage, SessionStage[]> = {
  idle: ['hardware_check', 'question_asked', 'idle'],
  hardware_check: ['question_asked', 'idle'],
  question_asked: ['recording', 'idle'],
  recording: ['transcribing', 'idle'],
  transcribing: ['analyzing', 'recording', 'idle'], // 'recording' permitted for audio retry
  analyzing: ['feedback', 'idle'],
  feedback: ['next_question', 'report', 'idle'],
  next_question: ['question_asked', 'report', 'idle'],
  report: ['idle'],
};

export interface HardwareStatus {
  cameraReady: boolean;
  micReady: boolean;
  speechReady: boolean;
  llmReady: boolean;
  permissionDenied: boolean;
  resolution?: string;
  frameRate?: number;
}

export interface SessionState {
  // 9-Stage FSM State
  stage: SessionStage;

  // Session Configuration
  sessionId: string;
  roleId: string;
  roleTitle: string;
  language: string;
  questions: Question[];
  currentQuestionIndex: number;

  // Real-time Timer State
  timerSeconds: number;
  timerTotal: number;
  isTimerPaused: boolean;

  // Speech & Transcript State
  interimTranscript: string;
  finalTranscript: string;
  fillerCounts: Record<string, number>;
  liveWpm: number;

  // Computer Vision & Composure Telemetry (MediaPipe 15fps)
  visionTelemetry: VisionTelemetry;

  // Feedback & Reports
  evaluations: Record<string, QuestionEvaluation>;
  overallReport: SessionReport | null;
  sessions: SessionReport[];

  // Hardware Diagnostics State
  hardwareStatus: HardwareStatus;

  // Global Error & Status
  errorMessage: string | null;

  // Strict FSM State Transition Action (Replaces direct stage setting)
  transitionTo: (targetStage: SessionStage) => boolean;

  // High-Level FSM Actions & Selectors
  selectRole: (roleId: string, roleTitle?: string) => void;
  setLanguage: (lang: string) => void;
  getCurrentQuestion: () => Question | null;
  initSession: (config: {
    sessionId: string;
    roleId: string;
    roleTitle: string;
    language: string;
    questions: Question[];
  }) => boolean;
  setHardwareStatus: (status: Partial<HardwareStatus>) => void;
  startQuestion: (index: number) => boolean;
  startRecording: () => boolean;
  stopRecording: () => boolean;
  tickTimer: () => void;
  setTimerSeconds: (seconds: number) => void;
  setInterimTranscript: (text: string) => void;
  setFinalTranscript: (text: string) => void;
  updateFillerCounts: (fillers: Record<string, number>) => void;
  setAnalyzing: () => boolean;
  setEvaluation: (questionId: string, evaluation: QuestionEvaluation) => boolean;
  setQuestionEvaluation: (questionId: string, evaluation: QuestionEvaluation) => boolean;
  nextQuestion: () => boolean;
  setOverallReport: (report: SessionReport) => boolean;
  addSessionToHistory: (report: SessionReport) => void;
  setSessionHistory: (sessions: SessionReport[]) => void;
  clearSessionHistory: () => void;
  updateVisionTelemetry: (telemetry: Partial<VisionTelemetry>) => void;
  setErrorMessage: (msg: string | null) => void;
  abortSession: () => boolean;
  resetSession: () => boolean;
}

const DEFAULT_VISION_TELEMETRY: VisionTelemetry = {
  pitch: 0,
  yaw: 0,
  confidence: 90,
  eyeContactStatus: 'Good',
  fps: 15,
  isLocked: true,
};

const DEFAULT_HARDWARE_STATUS: HardwareStatus = {
  cameraReady: false,
  micReady: false,
  speechReady: false,
  llmReady: false,
  permissionDenied: false,
};

/**
 * useSessionStore
 * Zustand-powered Session State Machine with devtools and persist middleware.
 * All stage transitions MUST pass through transitionTo() validation.
 */
export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set, get) => ({
        stage: 'idle',
        sessionId: '',
        roleId: '',
        roleTitle: '',
        language: 'en',
        questions: [],
        currentQuestionIndex: 0,

        timerSeconds: 90,
        timerTotal: 90,
        isTimerPaused: false,

        interimTranscript: '',
        finalTranscript: '',
        fillerCounts: {},
        liveWpm: 0,

        visionTelemetry: DEFAULT_VISION_TELEMETRY,
        evaluations: {},
        overallReport: null,
        sessions: DEFAULT_HISTORICAL_SESSIONS,
        hardwareStatus: DEFAULT_HARDWARE_STATUS,
        errorMessage: null,

        /**
         * transitionTo: Centralized FSM transition validator
         * Evaluates whether the requested state transition is legally permissible
         * from the current stage. Rejects invalid transitions with an error log.
         */
        transitionTo: (targetStage: SessionStage): boolean => {
          const currentStage = get().stage;

          // Self-transition is a safe no-op
          if (targetStage === currentStage) {
            return true;
          }

          const allowed = ALLOWED_TRANSITIONS[currentStage] || [];
          if (!allowed.includes(targetStage)) {
            const errorMsg = `[FSM Validation Error] Illegal state transition from "${currentStage}" to "${targetStage}". Allowed targets: [${allowed.join(', ')}]`;
            console.error(errorMsg);
            set({ errorMessage: errorMsg });
            return false;
          }

          // Valid transition approved
          set({
            stage: targetStage,
            errorMessage: null,
          });
          return true;
        },

        selectRole: (roleId: string, roleTitle?: string) =>
          set({
            roleId,
            roleTitle:
              roleTitle ||
              roleId
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' '),
          }),

        setLanguage: (lang: string) => set({ language: lang }),

        getCurrentQuestion: () => {
          const { questions, currentQuestionIndex } = get();
          return questions[currentQuestionIndex] || null;
        },

        initSession: ({ sessionId, roleId, roleTitle, language, questions }) => {
          const firstQTime = questions[0]?.time_limit_sec || 90;
          const success = get().transitionTo('question_asked');
          if (!success) return false;

          set({
            sessionId,
            roleId,
            roleTitle,
            language,
            questions,
            currentQuestionIndex: 0,
            timerSeconds: firstQTime,
            timerTotal: firstQTime,
            interimTranscript: '',
            finalTranscript: '',
            fillerCounts: {},
            evaluations: {},
            overallReport: null,
            errorMessage: null,
          });
          return true;
        },

        setHardwareStatus: (status) =>
          set((state) => ({
            hardwareStatus: { ...state.hardwareStatus, ...status },
          })),

        startQuestion: (index: number) => {
          const success = get().transitionTo('question_asked');
          if (!success) return false;

          const q = get().questions[index];
          const timeLimit = q?.time_limit_sec || 90;
          set({
            currentQuestionIndex: index,
            timerSeconds: timeLimit,
            timerTotal: timeLimit,
            isTimerPaused: false,
            interimTranscript: '',
            finalTranscript: '',
            fillerCounts: {},
          });
          return true;
        },

        startRecording: () => {
          const success = get().transitionTo('recording');
          if (!success) return false;

          set({
            isTimerPaused: false,
            interimTranscript: '',
            finalTranscript: '',
          });
          return true;
        },

        stopRecording: () => {
          const success = get().transitionTo('transcribing');
          if (!success) return false;

          set({ isTimerPaused: true });
          return true;
        },

        tickTimer: () => {
          const { timerSeconds, isTimerPaused, stage } = get();
          if (isTimerPaused || stage !== 'recording') return;

          if (timerSeconds <= 1) {
            set({ timerSeconds: 0 });
            get().stopRecording();
          } else {
            set({ timerSeconds: timerSeconds - 1 });
          }
        },

        setTimerSeconds: (seconds: number) => set({ timerSeconds: seconds }),

        setInterimTranscript: (text: string) => set({ interimTranscript: text }),

        setFinalTranscript: (text: string) =>
          set((state) => ({
            finalTranscript: state.finalTranscript ? `${state.finalTranscript} ${text}` : text,
            interimTranscript: '',
          })),

        updateFillerCounts: (fillers: Record<string, number>) =>
          set((state) => ({
            fillerCounts: { ...state.fillerCounts, ...fillers },
          })),

        setAnalyzing: () => get().transitionTo('analyzing'),

        setEvaluation: (questionId: string, evaluation: QuestionEvaluation) => {
          const success = get().transitionTo('feedback');
          if (!success) return false;

          set((state) => ({
            evaluations: { ...state.evaluations, [questionId]: evaluation },
          }));
          return true;
        },

        setQuestionEvaluation: (questionId: string, evaluation: QuestionEvaluation) =>
          get().setEvaluation(questionId, evaluation),

        nextQuestion: () => {
          const { currentQuestionIndex, questions } = get();
          const nextIndex = currentQuestionIndex + 1;
          if (nextIndex < questions.length) {
            const stepOk = get().transitionTo('next_question');
            if (!stepOk) return false;
            return get().startQuestion(nextIndex);
          } else {
            return get().transitionTo('report');
          }
        },

        setOverallReport: (report: SessionReport) => {
          const success = get().transitionTo('report');
          if (!success) return false;

          const existing = get().sessions || [];
          const exists = existing.some((s) => s.session_id === report.session_id);
          const updatedSessions = exists
            ? existing.map((s) => (s.session_id === report.session_id ? report : s))
            : [report, ...existing];

          set({
            overallReport: report,
            sessions: updatedSessions,
          });
          return true;
        },

        addSessionToHistory: (report: SessionReport) => {
          set((state) => {
            const existing = state.sessions || [];
            const exists = existing.some((s) => s.session_id === report.session_id);
            return {
              sessions: exists
                ? existing.map((s) => (s.session_id === report.session_id ? report : s))
                : [report, ...existing],
            };
          });
        },

        setSessionHistory: (sessions: SessionReport[]) => set({ sessions }),

        clearSessionHistory: () => set({ sessions: [] }),

        updateVisionTelemetry: (telemetry) =>
          set((state) => ({
            visionTelemetry: { ...state.visionTelemetry, ...telemetry },
          })),

        setErrorMessage: (msg: string | null) => set({ errorMessage: msg }),

        abortSession: () => {
          const { evaluations, sessionId } = get();
          if (sessionId && Object.keys(evaluations).length > 0) {
            try {
              localStorage.setItem(
                `aborted_session_${sessionId}`,
                JSON.stringify({
                  sessionId,
                  evaluations,
                  abortedAt: new Date().toISOString(),
                })
              );
            } catch (err) {
              console.warn('Failed to snapshot aborted session:', err);
            }
          }
          return get().transitionTo('idle');
        },

        resetSession: () => {
          get().transitionTo('idle');
          set({
            sessionId: '',
            roleId: '',
            roleTitle: '',
            questions: [],
            currentQuestionIndex: 0,
            timerSeconds: 90,
            timerTotal: 90,
            isTimerPaused: false,
            interimTranscript: '',
            finalTranscript: '',
            fillerCounts: {},
            evaluations: {},
            overallReport: null,
            errorMessage: null,
          });
          return true;
        },
      }),
      {
        name: 'interview-session-storage',
        partialize: (state) => ({
          stage: state.stage,
          sessionId: state.sessionId,
          roleId: state.roleId,
          roleTitle: state.roleTitle,
          language: state.language,
          questions: state.questions,
          currentQuestionIndex: state.currentQuestionIndex,
          evaluations: state.evaluations,
          overallReport: state.overallReport,
          sessions: state.sessions,
        }),
      }
    ),
    { name: 'InterviewSessionFSM' }
  )
);
