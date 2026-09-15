import os
import json
import asyncio
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from ...models.schemas import (
    RoleInfo, Question, SessionStartRequest, SessionStartResponse,
    AnswerSubmission, QuestionEvaluation, SessionReport,
    SessionSummaryItem, SessionListResponse
)
from ...models.database import get_db, DBSession, DBAnswer
from ...services.llm_service import evaluate_answer_with_llm
from ...services.speech_service import analyze_speech_transcript
from ...services.scoring_service import calculate_weighted_score, extract_session_insights

router = APIRouter()

# Load questions JSON
QUESTIONS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "questions.json"

def load_questions_data():
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/roles", response_model=List[RoleInfo])
def get_roles():
    """Returns list of interview roles available."""
    data = load_questions_data()
    return data.get("roles", [])
    
@router.get("/sessions", response_model=SessionListResponse)
def list_sessions(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    """Returns paginated historical interview sessions for the History page."""
    total = db.query(DBSession).count()
    sessions = (
        db.query(DBSession)
        .order_by(DBSession.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    result = []
    for s in sessions:
        ans_count = len(s.answers)
        result.append(SessionSummaryItem(
            id=s.id,
            session_id=s.id,
            role_id=s.role_id,
            role_title=s.role_title,
            created_at=s.created_at.strftime("%Y-%m-%d %H:%M"),
            overall_score=round(s.overall_score, 1),
            content_score=round(s.content_score, 1),
            clarity_score=round(s.clarity_score, 1),
            confidence_score=round(s.confidence_score, 1),
            composure_score=round(s.confidence_score, 1),
            status=s.status,
            is_demo=bool(s.is_demo),
            total_questions=ans_count
        ))
        
    return SessionListResponse(total=total, sessions=result)

@router.post("/sessions/start", response_model=SessionStartResponse)
def start_interview_session(req: SessionStartRequest, db: Session = Depends(get_db)):
    """Initializes a new interview session and returns the first question."""
    data = load_questions_data()
    role_id = req.get_role_id()
    role_info = next((r for r in data.get("roles", []) if r["id"] == role_id), None)
    if not role_info:
        raise HTTPException(status_code=404, detail="Role not found")
        
    role_questions = [
        q for q in data.get("questions", []) 
        if q["role"] == role_id and (req.interview_type == "all" or q["type"] == req.interview_type)
    ]
    if not role_questions:
        role_questions = [q for q in data.get("questions", []) if q["role"] == role_id]
        
    if not role_questions:
        raise HTTPException(status_code=400, detail="No questions found for this role.")
        
    # Create DB Session
    db_session = DBSession(
        role_id=role_id,
        role_title=role_info["title"],
        interview_type=req.interview_type,
        language=req.language or "en"
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    first_q = Question(**role_questions[0])
    
    return SessionStartResponse(
        session_id=db_session.id,
        role_id=role_id,
        role_title=role_info["title"],
        language=db_session.language,
        total_questions=min(len(role_questions), req.num_questions or 5),
        first_question=first_q
    )

@router.get("/sessions/{session_id}/questions")
def get_session_questions(session_id: str, db: Session = Depends(get_db)):
    """Returns all questions configured for the session's role."""
    db_session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    data = load_questions_data()
    role_questions = [
        q for q in data.get("questions", []) 
        if q["role"] == db_session.role_id and (db_session.interview_type == "all" or q["type"] == db_session.interview_type)
    ]
    return [Question(**q) for q in role_questions]

@router.post("/sessions/{session_id}/submit-answer", response_model=QuestionEvaluation)
def submit_answer(
    session_id: str, 
    sub: AnswerSubmission, 
    db: Session = Depends(get_db)
):
    """Evaluates a single answered question using speech metrics and OpenRouter LLM."""
    db_session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not db_session:
        if session_id.startswith("sess-sim") or session_id.startswith("sess-demo"):
            db_session = DBSession(
                id=session_id,
                role_id="software_engineer",
                role_title="Principal Distributed Systems Architect",
                language="en",
                status="in_progress",
                is_demo=1
            )
            db.add(db_session)
            db.commit()
            db.refresh(db_session)
        else:
            raise HTTPException(status_code=404, detail="Session not found")
        
    data = load_questions_data()
    q_data = next((q for q in data.get("questions", []) if q["id"] == sub.question_id), None)
    if not q_data:
        role_qs = [q for q in data.get("questions", []) if q.get("role") == db_session.role_id]
        if role_qs:
            q_data = role_qs[0]
        else:
            raise HTTPException(status_code=404, detail="Question not found")
        
    lang = sub.language or db_session.language or "en"
    
    # 1. Analyze speech clarity (pace, filler words, pauses)
    speech_res = analyze_speech_transcript(
        transcript=sub.transcript,
        duration_seconds=sub.duration_seconds,
        detected_pauses=sub.pause_count or 0,
        language=lang
    )
    
    # 2. Analyze content via OpenRouter LLM (supports English, Urdu, and Roman Urdu)
    llm_res = evaluate_answer_with_llm(
        question_text=q_data["question"],
        expected_points=q_data.get("expected_points", []),
        transcript=sub.transcript,
        role_title=db_session.role_title,
        language=lang
    )
    
    # 3. Facial Confidence Score (passed from client MediaPipe tracker or default to healthy ~78)
    confidence = sub.confidence_score if sub.confidence_score is not None else 78.0
    
    # 4. Overall score for this question: (30% Conf, 30% Clarity, 40% Content)
    overall_q_score = calculate_weighted_score(
        confidence_score=confidence,
        clarity_score=speech_res["clarity_score"],
        content_score=llm_res["content_score"]
    )
    
    # Combine improvement tips
    combined_tips = llm_res.get("improvement_tips", []) + speech_res.get("speech_tips", [])
    
    # Save Answer to DB
    db_ans = DBAnswer(
        session_id=session_id,
        question_id=sub.question_id,
        question_text=q_data["question"],
        transcript=sub.transcript,
        duration_seconds=sub.duration_seconds,
        relevance_score=llm_res["relevance_score"],
        completeness_score=llm_res["completeness_score"],
        structure_score=llm_res["structure_score"],
        content_score=llm_res["content_score"],
        clarity_score=speech_res["clarity_score"],
        confidence_score=confidence,
        overall_score=overall_q_score,
        feedback=llm_res["feedback"],
        improvement_tips=json.dumps(combined_tips)
    )
    db.add(db_ans)
    db.commit()
    
    return QuestionEvaluation(
        question_id=sub.question_id,
        question_text=q_data["question"],
        transcript=sub.transcript,
        relevance_score=llm_res["relevance_score"],
        completeness_score=llm_res["completeness_score"],
        structure_score=llm_res["structure_score"],
        content_score=llm_res["content_score"],
        words_count=speech_res["words_count"],
        wpm=speech_res["wpm"],
        filler_words=speech_res["filler_words"],
        filler_total=speech_res["filler_total"],
        clarity_score=speech_res["clarity_score"],
        confidence_score=confidence,
        overall_question_score=overall_q_score,
        feedback=llm_res["feedback"],
        improvement_tips=combined_tips,
        model_answer=q_data.get("model_answer", "")
    )

@router.get("/sessions/{session_id}/report", response_model=SessionReport)
def get_session_report(session_id: str, db: Session = Depends(get_db)):
    """Computes and returns the comprehensive final interview report."""
    db_session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    answers = db.query(DBAnswer).filter(DBAnswer.session_id == session_id).all()
    if not answers:
        raise HTTPException(status_code=400, detail="No answers have been submitted for this session yet.")
        
    # Compute aggregate scores
    avg_content = round(sum(a.content_score for a in answers) / len(answers), 1)
    avg_clarity = round(sum(a.clarity_score for a in answers) / len(answers), 1)
    avg_confidence = round(sum(a.confidence_score for a in answers) / len(answers), 1)
    
    overall = calculate_weighted_score(
        confidence_score=avg_confidence,
        clarity_score=avg_clarity,
        content_score=avg_content
    )
    
    # Update session in DB
    db_session.overall_score = overall
    db_session.confidence_score = avg_confidence
    db_session.clarity_score = avg_clarity
    db_session.content_score = avg_content
    db_session.status = "completed"
    db.commit()
    
    # Convert answers to QuestionEvaluation list
    data = load_questions_data()
    q_map = {q["id"]: q for q in data.get("questions", [])}
    
    eval_list = []
    eval_dicts = []
    for a in answers:
        q_info = q_map.get(a.question_id, {})
        tips = json.loads(a.improvement_tips) if a.improvement_tips else []
        words = len(a.transcript.split()) if a.transcript else 0
        minutes = max(a.duration_seconds / 60.0, 0.1)
        wpm = round(words / minutes, 1) if a.duration_seconds > 0 else 0.0
        
        q_eval = QuestionEvaluation(
            question_id=a.question_id,
            question_text=a.question_text,
            transcript=a.transcript,
            relevance_score=a.relevance_score,
            completeness_score=a.completeness_score,
            structure_score=a.structure_score,
            content_score=a.content_score,
            words_count=words,
            wpm=wpm,
            filler_words={},
            filler_total=0,
            clarity_score=a.clarity_score,
            confidence_score=a.confidence_score,
            overall_question_score=a.overall_score,
            feedback=a.feedback,
            improvement_tips=tips,
            model_answer=q_info.get("model_answer", "")
        )
        eval_list.append(q_eval)
        eval_dicts.append({
            "content_score": a.content_score,
            "clarity_score": a.clarity_score,
            "confidence_score": a.confidence_score,
            "wpm": wpm
        })
        
    insights = extract_session_insights(eval_dicts)
    
    return SessionReport(
        session_id=db_session.id,
        role_id=db_session.role_id,
        role_title=db_session.role_title,
        created_at=db_session.created_at.strftime("%Y-%m-%d %H:%M"),
        total_questions=len(answers),
        overall_score=overall,
        confidence_score=avg_confidence,
        clarity_score=avg_clarity,
        content_score=avg_content,
        composure_score=avg_confidence,
        is_demo=bool(db_session.is_demo),
        top_strengths=insights["strengths"],
        top_weaknesses=insights["weaknesses"],
        actionable_recommendations=insights["recommendations"],
        per_question_results=eval_list
    )

@router.post("/sessions/{session_id}/end", response_model=SessionReport)
def end_interview_session(session_id: str, db: Session = Depends(get_db)):
    """Concludes active interview session, aggregates final score, and returns dossier."""
    return get_session_report(session_id=session_id, db=db)

@router.post("/sessions/{session_id}/evaluate", response_model=QuestionEvaluation)
def evaluate_session_answer(
    session_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    """
    Multimodal evaluation endpoint accepting camelCase or snake_case payloads.
    Computes 40% Content + 30% Clarity + 30% Composure and writes to DB.
    """
    q_id = payload.get("questionId") or payload.get("question_id")
    transcript = payload.get("transcript", "")
    duration = float(payload.get("durationSeconds") or payload.get("duration_seconds") or 0.0)
    vision_telem = payload.get("visionTelemetry") or payload.get("vision_telemetry") or {}
    confidence = float(vision_telem.get("confidence") or payload.get("confidence_score") or 78.0)
    audio_filler_count = payload.get("audio_filler_count")
    
    sub = AnswerSubmission(
        session_id=session_id,
        question_id=q_id,
        transcript=transcript,
        duration_seconds=duration,
        language=payload.get("language", "en"),
        confidence_score=confidence,
        audio_filler_count=audio_filler_count
    )
    return submit_answer(session_id=session_id, sub=sub, db=db)

@router.post("/sessions/{session_id}/transcribe")
async def transcribe_session_audio(
    session_id: str,
    audio_file: UploadFile = File(...),
    language: Optional[str] = Form("en")
):
    """Transcribes audio chunk recorded via browser MediaRecorder for a specific session."""
    return await transcribe_speech_audio(audio_file=audio_file, language=language)

import base64
import cv2
import numpy as np
from pydantic import BaseModel

class FrameAnalysisRequest(BaseModel):
    image_base64: str

@router.post("/vision/analyze-frame")
def analyze_camera_frame(req: FrameAnalysisRequest):
    """Processes webcam image frame with MediaPipe Face Mesh for eye-gaze and head pose."""
    from ...services.vision_service import get_face_analyzer
    try:
        data_str = req.image_base64
        if "," in data_str:
            data_str = data_str.split(",")[1]
        img_bytes = base64.b64decode(data_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return {"face_detected": False, "confidence_score": 50.0, "eye_contact": "Not Detected"}
            
        analyzer = get_face_analyzer()
        return analyzer.analyze_frame(frame)
    except Exception as e:
        return {"face_detected": False, "confidence_score": 50.0, "error": str(e)}

import tempfile
import shutil
from fastapi import UploadFile, File, Form

def _save_and_inspect_upload(audio_file: UploadFile) -> str:
    suffix = os.path.splitext(audio_file.filename or "")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(audio_file.file, tmp)
        tmp_path = tmp.name

    size_bytes = os.path.getsize(tmp_path)
    print(f"[UPLOAD] Received {size_bytes} bytes")

    try:
        import av
        container = av.open(tmp_path)
        print(f"[UPLOAD] Audio streams: {len(container.streams.audio)}, Video streams: {len(container.streams.video)}")
        container.close()
    except Exception as e:
        print(f"[UPLOAD] Container inspection error: {e}")

    return tmp_path

@router.post("/speech/transcribe")
async def transcribe_speech_audio(
    audio_file: UploadFile = File(...),
    language: Optional[str] = Form("en")
):
    """
    Transcribes uploaded recorded candidate audio using Hugging Face faster-whisper.
    Supports English, Urdu ('ur'), or auto-detection.
    Wrapped in asyncio.to_thread to unblock the FastAPI event loop.
    """
    from ...services.stt_service import transcribe_audio_file
    
    tmp_path = await asyncio.to_thread(_save_and_inspect_upload, audio_file)

    try:
        result = await asyncio.to_thread(transcribe_audio_file, tmp_path, language=language)
        return result
    except Exception as err:
        return {
            "transcript": "",
            "error": str(err),
            "duration": 0.0
        }
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass

