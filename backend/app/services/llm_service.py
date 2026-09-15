import json
import re
import requests
import logging
from typing import Dict, Any, List
from ..config import settings

logger = logging.getLogger("hr_bot.llm")

def extract_json_object(text: str) -> Dict[str, Any]:
    """Extracts JSON object from LLM output, handling markdown fences and reasoning blocks."""
    cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    
    code_block = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', cleaned, re.DOTALL)
    if code_block:
        return json.loads(code_block.group(1))

    first_brace = cleaned.find('{')
    last_brace = cleaned.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        json_str = cleaned[first_brace:last_brace + 1]
        return json.loads(json_str)

    raise ValueError("No valid JSON structure found in output")

def evaluate_with_local_heuristic(
    question_text: str,
    expected_points: List[str],
    transcript: str,
    role_title: str
) -> Dict[str, Any]:
    """
    Intelligent, deterministic rule-based evaluation engine.
    Guarantees the live interview demo never crashes even under zero connectivity.
    Scores relevance, completeness (rubric keyword hit-ratio), and STAR structural markers.
    """
    words = re.findall(r'\b[a-zA-Z0-9_\-\']+\b', transcript.lower())
    transcript_text = " ".join(words)
    word_count = len(words)
    
    # 1. Keyword & Expected Points Semantic Matching
    stopwords = {
        "the", "a", "an", "is", "are", "was", "were", "and", "or", "in", "on", "at", 
        "to", "for", "with", "by", "about", "like", "through", "over", "before", 
        "between", "after", "since", "without", "under", "within", "along", "following", 
        "across", "behind", "beyond", "plus", "except", "but", "up", "out", "around", 
        "down", "off", "above", "near", "it", "this", "that", "these", "those", "can", 
        "could", "should", "would", "may", "might", "must", "shall", "will", "of"
    }
    
    total_rubric_points = len(expected_points)
    matched_points = []
    missed_points = []
    
    for pt in expected_points:
        pt_words = [w for w in re.findall(r'\b[a-zA-Z0-9_\-\']+\b', pt.lower()) if w not in stopwords and len(w) > 3]
        if not pt_words:
            matched_points.append(pt)
            continue
        match_count = sum(1 for w in pt_words if w in transcript_text)
        match_ratio = match_count / max(1, len(pt_words))
        if match_ratio >= 0.30:
            matched_points.append(pt)
        else:
            missed_points.append(pt)
            
    hit_ratio = len(matched_points) / max(1, total_rubric_points)
    comp = min(9.5, max(3.5, hit_ratio * 9.5))
    
    # 2. Relevance Scoring
    q_words = [w for w in re.findall(r'\b[a-zA-Z0-9_\-\']+\b', question_text.lower()) if w not in stopwords and len(w) > 3]
    q_overlap = sum(1 for w in q_words if w in transcript_text) / max(1, len(q_words)) if q_words else 0.5
    
    if word_count < 15:
        length_factor = 0.35
    elif word_count < 40:
        length_factor = 0.65
    elif word_count < 75:
        length_factor = 0.85
    else:
        length_factor = 0.95
        
    rel = min(9.6, max(3.0, (0.4 * q_overlap + 0.6 * length_factor) * 10.0))
    
    # 3. Structural Progression (STAR / Architectural Grammar)
    premise_markers = ["because", "in our system", "the core concept", "first", "architecture", "designed to", "specifically", "fundamentally"]
    mechanism_markers = ["we implemented", "i configured", "by using", "consumers", "leverage", "utilize", "method", "class", "override", "algorithm"]
    outcome_markers = ["resulting in", "this prevented", "reduced latency", "sla", "compromise", "therefore", "trade-off", "performance", "finally"]
    
    has_premise = any(m in transcript_text for m in premise_markers)
    has_mechanism = any(m in transcript_text for m in mechanism_markers)
    has_outcome = any(m in transcript_text for m in outcome_markers)
    
    classes_hit = sum([has_premise, has_mechanism, has_outcome])
    if classes_hit == 3:
        struct = 9.0
    elif classes_hit == 2:
        struct = 7.8
    elif classes_hit == 1:
        struct = 6.4
    else:
        struct = 5.2
        
    content_100 = round((rel * 0.4 + comp * 0.4 + struct * 0.2) * 10.0, 1)
    
    if hit_ratio >= 0.7:
        summary = f"Strong command of foundational concepts for {role_title}. Demonstrates clear technical precision."
    elif hit_ratio >= 0.4:
        summary = f"Solid initial premise with good direction, though some key architectural trade-offs could be further detailed."
    else:
        summary = f"Candidate provided general context, but lacked depth against core rubric requirements."
        
    tips = []
    if missed_points:
        for mp in missed_points[:2]:
            clean_p = re.sub(r'^(mention|explain|provide|discuss|describe)\s+', '', mp, flags=re.IGNORECASE)
            tips.append(f"Explicitly detail: {clean_p}.")
    if not has_outcome:
        tips.append("Conclude responses with tangible results, latency trade-offs, or production metrics.")
    if len(tips) == 0:
        tips.append("Reinforce edge cases and failure recovery semantics in production scenarios.")
        
    return {
        "relevance_score": round(rel, 1),
        "completeness_score": round(comp, 1),
        "structure_score": round(struct, 1),
        "content_score": content_100,
        "feedback": summary,
        "improvement_tips": tips[:2],
        "model_used": "local_heuristic_scorer"
    }

def evaluate_answer_with_llm(
    question_text: str,
    expected_points: List[str],
    transcript: str,
    role_title: str,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Evaluates candidate transcript against question rubric using OpenRouter API (openrouter/free).
    Falls back gracefully to the Local Heuristic Engine on error or timeout.
    """
    if not transcript or len(transcript.strip().split()) < 3:
        is_urdu = language == "ur" or bool(re.search(r'[\u0600-\u06FF]', transcript))
        return {
            "relevance_score": 1.0,
            "completeness_score": 1.0,
            "structure_score": 1.0,
            "content_score": 10.0,
            "feedback": "جواب بہت مختصر یا ناکافی تھا جس کی بنا پر مکمل جانچ نہیں کی جا سکی۔" if is_urdu else "The answer was too brief or inaudible to evaluate effectively.",
            "improvement_tips": [
                "Provide a detailed response addressing the core prompt.",
                "Structure your thoughts before speaking using the STAR or Definition-Example method."
            ],
            "model_used": "local_heuristic_scorer"
        }

    points_bulleted = "\n".join([f"- {p}" for p in expected_points])
    
    prompt = f"""You are an elite, fair HR and Technical Interviewer assessing a candidate for a {role_title} position.

Interview Question:
\"{question_text}\"

Expected Key Points (Rubric):
{points_bulleted}

Candidate's Spoken Response (Transcribed):
\"{transcript}\"

Evaluate objectively and output ONLY a JSON object with this EXACT structure (no markdown fences, no text outside the JSON):
{{
  "relevance_score": <float 0.0 to 10.0: how directly the candidate answered the prompt>,
  "completeness_score": <float 0.0 to 10.0: coverage of key technical/behavioral concepts>,
  "structure_score": <float 0.0 to 10.0: logical organization, premise, development, outcome>,
  "feedback": "<2-3 sentence constructive evaluation of the candidate's answer depth and delivery>",
  "improvement_tips": [
    "<actionable, specific suggestion 1>",
    "<actionable, specific suggestion 2>"
  ]
}}"""

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost",
        "X-Title": "AI-Based Interview Simulator"
    }

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {
                "role": "system", 
                "content": "You are a professional technical hiring evaluator who evaluates interview answers strictly following JSON schemas."
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=12
        )
        
        if response.status_code == 200:
            res_json = response.json()
            actual_model = res_json.get('model', 'unknown')
            logger.info(f"Evaluated via {actual_model}")
            print(f"[LLM Engine] Evaluated via {actual_model}")
            
            raw_content = res_json['choices'][0]['message']['content'].strip()
            parsed = extract_json_object(raw_content)
            rel = float(parsed.get("relevance_score", 7.0))
            comp = float(parsed.get("completeness_score", 7.0))
            struct = float(parsed.get("structure_score", 7.0))
            
            content_100 = round((rel * 0.4 + comp * 0.4 + struct * 0.2) * 10.0, 1)
            
            return {
                "relevance_score": rel,
                "completeness_score": comp,
                "structure_score": struct,
                "content_score": content_100,
                "feedback": parsed.get("feedback", "Good effort addressing the core concepts."),
                "improvement_tips": parsed.get("improvement_tips", ["Elaborate on specific examples to strengthen your response."]),
                "model_used": actual_model
            }
        else:
            logger.warning(f"OpenRouter returned {response.status_code}: {response.text}")
            print(f"[LLM Engine] OpenRouter returned {response.status_code}, falling back to Local Heuristic Scorer")
    except Exception as err:
        logger.warning(f"OpenRouter call failed: {err}. Executing local heuristic engine.")
        print(f"[LLM Engine] OpenRouter error ({err}), falling back to Local Heuristic Scorer")

    # Local Heuristic Scorer fallback
    return evaluate_with_local_heuristic(
        question_text=question_text,
        expected_points=expected_points,
        transcript=transcript,
        role_title=role_title
    )
