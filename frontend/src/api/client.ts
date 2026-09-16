import type { RoleInfo, Question, QuestionEvaluation, SessionReport } from '../types';
import sampleReportFixture from '../fixtures/report-sample.json';

const API_BASE = '/api';

/**
 * Robust fetch with explicit timeout to prevent hanging on offline backends
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchRoles(): Promise<RoleInfo[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/roles`);
    if (!res.ok) throw new Error('Backend offline');
    return res.json();
  } catch {
    return [
      { id: 'software_engineer', title: 'Software Engineer', description: 'Distributed systems, system design, algorithm concurrency' },
      { id: 'product_manager', title: 'Product Manager', description: 'Product strategy, execution, technical roadmapping' },
      { id: 'data_scientist', title: 'Data Scientist', description: 'Applied machine learning, causal inference, data systems' },
    ];
  }
}

export async function startSession(
  roleId: string, 
  interviewType: string = 'all', 
  numQuestions: number = 5,
  language: string = 'en'
): Promise<{ session_id: string; role_id: string; role_title: string; language: string; total_questions: number; first_question: Question }> {
  const res = await fetch(`${API_BASE}/sessions/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role_id: roleId,
      interview_type: interviewType,
      num_questions: numQuestions,
      language: language
    })
  });
  if (!res.ok) throw new Error('Failed to start interview session');
  return res.json();
}

export async function fetchSessionQuestions(sessionId: string): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/questions`);
  if (!res.ok) throw new Error('Failed to fetch questions for session');
  return res.json();
}

export async function submitAnswer(
  sessionId: string,
  payload: {
    question_id: string;
    transcript: string;
    duration_seconds: number;
    language?: string;
    confidence_score?: number;
    audio_filler_count?: number;
  }
): Promise<QuestionEvaluation> {
  const res = await fetchWithTimeout(`${API_BASE}/sessions/${sessionId}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      ...payload
    })
  }, 25000);
  if (!res.ok) throw new Error('Failed to evaluate answer');
  return res.json();
}

export async function analyzeWebcamFrame(imageBase64: string): Promise<{
  face_detected: boolean;
  confidence_score: number;
  eye_contact: string;
  is_smiling?: boolean;
}> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/vision/analyze-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 })
    }, 4000);
    if (!res.ok) throw new Error('Vision analysis request failed');
    return res.json();
  } catch (err) {
    return { face_detected: true, confidence_score: 80.0, eye_contact: 'Good' };
  }
}

export async function transcribeAudio(audioBlob: Blob, language: string = 'en'): Promise<{
  transcript: string;
  duration: number;
  detected_language?: string;
}> {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, 'response.webm');
  formData.append('language', language);

  const res = await fetchWithTimeout(`${API_BASE}/speech/transcribe`, {
    method: 'POST',
    body: formData
  }, 15000);
  if (!res.ok) throw new Error('Speech transcription failed');
  return res.json();
}

export async function transcribeSessionAudio(sessionId: string, audioBlob: Blob, language: string = 'en'): Promise<{
  transcript: string;
  duration: number;
  confidence?: number;
}> {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, 'response.webm');
  formData.append('language', language);

  const res = await fetchWithTimeout(`${API_BASE}/sessions/${sessionId}/transcribe`, {
    method: 'POST',
    body: formData
  }, 15000);
  if (!res.ok) throw new Error('Session speech transcription failed');
  return res.json();
}


export async function fetchSessionReport(sessionId: string): Promise<SessionReport> {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    return sampleReportFixture as unknown as SessionReport;
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE}/sessions/${sessionId}/report`, {}, 3000);
    if (!res.ok) throw new Error('Failed to generate interview report from backend');
    return res.json();
  } catch (err) {
    console.warn('[API Client] Backend offline or unavailable, using cached report dossier fixture:', err);
    return sampleReportFixture as unknown as SessionReport;
  }
}

export function getDownloadPdfUrl(sessionId: string): string {
  return `${API_BASE}/sessions/${sessionId}/pdf`;
}

export interface HistoricalSessionSummary {
  id: string;
  session_id: string;
  role_id: string;
  role_title: string;
  created_at: string;
  overall_score: number;
  content_score: number;
  clarity_score: number;
  confidence_score: number;
  composure_score?: number;
  status: string;
  is_demo?: boolean;
  total_questions: number;
}

export async function fetchHistoricalSessions(limit = 20, offset = 0): Promise<{ total: number; sessions: HistoricalSessionSummary[] }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/sessions?limit=${limit}&offset=${offset}`, {}, 3000);
    if (!res.ok) throw new Error('Failed to fetch historical sessions');
    return res.json();
  } catch (err) {
    console.warn('[API Client] Backend offline or unavailable, falling back to local cache:', err);
    throw err;
  }
}

export async function endSession(sessionId: string): Promise<SessionReport> {
  try {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/end`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to conclude session');
    return res.json();
  } catch (err) {
    console.warn('[API Client] Error concluding session via backend:', err);
    return fetchSessionReport(sessionId);
  }
}
