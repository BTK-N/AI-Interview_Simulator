from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RoleInfo(BaseModel):
    id: str
    title: str
    description: str

class Question(BaseModel):
    id: str
    role: str
    type: str  # technical, behavioral, hr
    difficulty: str  # easy, medium, hard
    question: str
    expected_points: List[str]
    model_answer: str
    time_limit_sec: int = 60

class AnswerSubmission(BaseModel):
    session_id: str
    question_id: str
    transcript: str
    duration_seconds: float = Field(..., ge=0)
    language: Optional[str] = "en"
    audio_filler_count: Optional[int] = None
    pause_count: Optional[int] = None
    confidence_score: Optional[float] = Field(None, ge=0, le=100)

class QuestionEvaluation(BaseModel):
    question_id: str
    question_text: str
    transcript: str
    relevance_score: float = Field(..., ge=0, le=10)
    completeness_score: float = Field(..., ge=0, le=10)
    structure_score: float = Field(..., ge=0, le=10)
    content_score: float = Field(..., ge=0, le=100)  # Average of the 3 * 10
    
    # Speech Metrics
    words_count: int
    wpm: float
    filler_words: Dict[str, int]
    filler_total: int
    clarity_score: float = Field(..., ge=0, le=100)
    
    # Facial Confidence Metrics
    confidence_score: float = Field(..., ge=0, le=100)
    
    # Weighted Final for this question
    overall_question_score: float = Field(..., ge=0, le=100)
    
    feedback: str
    improvement_tips: List[str]
    model_answer: str

class SessionStartRequest(BaseModel):
    role_id: Optional[str] = None
    roleId: Optional[str] = None
    interview_type: Optional[str] = "all"  # technical, behavioral, or all
    language: Optional[str] = "en"          # en, ur, auto
    guest_name: Optional[str] = "Candidate"
    num_questions: Optional[int] = 5

    def get_role_id(self) -> str:
        return self.role_id or self.roleId or "software_engineer"

class SessionStartResponse(BaseModel):
    session_id: str
    role_id: str
    role_title: str
    language: str = "en"
    total_questions: int
    first_question: Question

class SessionSummaryItem(BaseModel):
    id: str
    session_id: str
    role_id: str
    role_title: str
    created_at: str
    overall_score: float
    content_score: float
    clarity_score: float
    confidence_score: float
    composure_score: float
    status: str
    is_demo: bool = False
    total_questions: int = 0

class SessionListResponse(BaseModel):
    total: int
    sessions: List[SessionSummaryItem]

class SessionReport(BaseModel):
    session_id: str
    role_id: str
    role_title: str
    created_at: str
    total_questions: int
    
    # Aggregate Scores (0-100)
    overall_score: float
    confidence_score: float
    clarity_score: float
    content_score: float
    composure_score: Optional[float] = None
    is_demo: Optional[bool] = False
    
    top_strengths: List[str]
    top_weaknesses: List[str]
    actionable_recommendations: List[str]
    
    per_question_results: List[QuestionEvaluation]

