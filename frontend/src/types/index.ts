export interface RoleInfo {
  id: string;
  title: string;
  description: string;
}

export interface Question {
  id: string;
  role: string;
  type: 'technical' | 'behavioral' | 'hr';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  question_ur?: string;
  expected_points: string[];
  model_answer: string;
  time_limit_sec: number;
}

export interface QuestionEvaluation {
  question_id: string;
  question_text: string;
  transcript: string;
  relevance_score: number;
  completeness_score: number;
  structure_score: number;
  content_score: number;
  words_count: number;
  wpm: number;
  filler_words: Record<string, number>;
  filler_total: number;
  clarity_score: number;
  confidence_score: number;
  overall_question_score: number;
  feedback: string;
  improvement_tips: string[];
  model_answer: string;
}

export interface SessionReport {
  session_id: string;
  role_id: string;
  role_title: string;
  created_at: string;
  total_questions: number;
  overall_score: number;
  confidence_score: number;
  clarity_score: number;
  content_score: number;
  composure_score?: number;
  is_demo?: boolean;
  top_strengths: string[];
  top_weaknesses: string[];
  actionable_recommendations: string[];
  per_question_results: QuestionEvaluation[];
}

export type SessionStage =
  | 'idle'
  | 'hardware_check'
  | 'question_asked'
  | 'recording'
  | 'transcribing'
  | 'analyzing'
  | 'feedback'
  | 'next_question'
  | 'report';

export type ReadinessTier = 'Strong' | 'Developing' | 'Needs Practice' | 'Foundational';

export interface ReadinessInfo {
  tier: ReadinessTier;
  range: string;
  color: string;
  description: string;
}

export function getReadinessTier(score: number): ReadinessInfo {
  if (score >= 85) {
    return {
      tier: 'Strong',
      range: '85–100',
      color: '#10B981',
      description: 'Demonstrates clear technical depth, decisive framing, and high communication clarity.',
    };
  }
  if (score >= 70) {
    return {
      tier: 'Developing',
      range: '70–84',
      color: '#F59E0B',
      description: 'Solid conceptual understanding with occasional filler words or pacing hesitation.',
    };
  }
  if (score >= 50) {
    return {
      tier: 'Needs Practice',
      range: '50–69',
      color: '#FB923C',
      description: 'Core concepts identified, but responses require more architectural rigor and structured delivery.',
    };
  }
  return {
    tier: 'Foundational',
    range: '<50',
    color: '#94A3B8',
    description: 'Foundational stage. Focus on core STAR methodology and fundamentals.',
  };
}

export interface VisionTelemetry {
  pitch: number;
  yaw: number;
  confidence: number;
  eyeContactStatus: 'Good' | 'Fair' | 'Looking Away' | 'Searching';
  fps: number;
  isLocked: boolean;
}
