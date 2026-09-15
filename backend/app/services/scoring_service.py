from typing import List, Dict, Any
from ..config import settings

def calculate_weighted_score(
    confidence_score: float,
    clarity_score: float,
    content_score: float
) -> float:
    """
    Computes final composite score using the FYP defined weights:
    Score = (0.30 * Confidence) + (0.30 * Clarity) + (0.40 * Content)
    """
    score = (
        (settings.WEIGHT_CONFIDENCE * confidence_score) +
        (settings.WEIGHT_CLARITY * clarity_score) +
        (settings.WEIGHT_CONTENT * content_score)
    )
    return round(max(0.0, min(100.0, score)), 1)

def extract_session_insights(question_evals: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """
    Extracts top strengths, top weaknesses, and actionable recommendations across all answered questions.
    """
    if not question_evals:
        return {
            "strengths": ["Session started."],
            "weaknesses": ["No questions completed."],
            "recommendations": ["Complete a full session to generate insights."]
        }
        
    avg_content = sum(q.get("content_score", 0) for q in question_evals) / len(question_evals)
    avg_clarity = sum(q.get("clarity_score", 0) for q in question_evals) / len(question_evals)
    avg_confidence = sum(q.get("confidence_score", 0) for q in question_evals) / len(question_evals)
    
    total_fillers = sum(q.get("filler_total", 0) for q in question_evals)
    avg_wpm = sum(q.get("wpm", 0) for q in question_evals) / len(question_evals)
    
    strengths = []
    weaknesses = []
    recommendations = []
    
    # Analyze Strengths
    if avg_content >= 75:
        strengths.append("Strong technical & conceptual depth in your responses.")
    if avg_clarity >= 75:
        strengths.append(f"Clear articulation and steady speaking pace (~{round(avg_wpm, 1)} WPM).")
    if avg_confidence >= 75:
        strengths.append("High confidence, solid eye contact, and composed delivery.")
    if total_fillers <= 3:
        strengths.append("Minimal use of filler words; highly polished conversational tone.")
        
    if not strengths:
        strengths.append("Good initiative attempting all mock interview questions.")
        strengths.append("Willingness to articulate complex ideas under time limits.")

    # Analyze Weaknesses
    if avg_content < 65:
        weaknesses.append("Answers lacked sufficient depth, structure, or technical specifics.")
    if total_fillers > 8:
        weaknesses.append(f"Frequent filler word usage ({total_fillers} total instances across questions).")
    if avg_wpm < 100:
        weaknesses.append("Speaking pace was hesitant with notable conversational gaps.")
    elif avg_wpm > 175:
        weaknesses.append("Speaking tempo was occasionally rushed, potentially hindering clarity.")
    if avg_confidence < 65:
        weaknesses.append("Inconsistent eye contact with the camera and nervous hesitation.")
        
    if not weaknesses:
        weaknesses.append("Minor opportunities to incorporate more concrete metric-driven outcomes in stories.")

    # Actionable Recommendations
    if avg_content < 70:
        recommendations.append(
            "Use the STAR Method (Situation, Task, Action, Result) for behavioral questions to give structured, impactful answers."
        )
    if total_fillers > 5:
        recommendations.append(
            "Replace filler words ('um', 'like') with deliberate 1-second silent pauses. Silence conveys executive presence."
        )
    if avg_confidence < 70:
        recommendations.append(
            "Position your webcam at eye level and consciously look directly into the camera lens when making key points."
        )
    recommendations.append(
        "Compare your answers against the provided Model Answers to learn industry-preferred phrasing and terminology."
    )

    return {
        "strengths": strengths[:3],
        "weaknesses": weaknesses[:3],
        "recommendations": recommendations[:3]
    }
