import re
from typing import Dict, Any

# Bilingual English & Urdu filler words / phrases patterns
FILLER_PATTERNS = {
    # English fillers
    "um": r'\b(um|umm|ummm)\b',
    "uh": r'\b(uh|uhh|uhhh)\b',
    "like": r'\b(like)\b',
    "you know": r'\b(you know)\b',
    "actually": r'\b(actually)\b',
    "basically": r'\b(basically)\b',
    "sort of": r'\b(sort of|sorta)\b',
    
    # Urdu / Roman Urdu fillers
    "matlab / مطلب": r'\b(matlab|مطلب)\b',
    "yani / یعنی": r'\b(yani|یعنی)\b',
    "acha / اچھا": r'\b(acha|achha|اچھا)\b',
    "to / تو": r'\b(to|toh|تو)\b',
    "sahi / صحیح": r'\b(sahi|sahii|صحیح)\b'
}

def analyze_speech_transcript(
    transcript: str, 
    duration_seconds: float,
    detected_pauses: int = 0,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Analyzes spoken transcript (English, Urdu, or Bilingual Roman Urdu) for:
    - Word count & Speaking pace (Words Per Minute - WPM)
    - Bilingual filler word counts (English & Urdu)
    - Long pause penalization
    - Returns calculated Speech Clarity Score (0-100) and personalized tips
    """
    text_lower = transcript.lower().strip()
    words = re.findall(r'\b[\w\u0600-\u06FF]+\b', text_lower)
    word_count = len(words)
    
    # Calculate WPM
    minutes = max(duration_seconds / 60.0, 0.1)
    wpm = round(word_count / minutes, 1) if duration_seconds > 0 else 0.0
    
    # Track filler words
    filler_counts = {}
    filler_total = 0
    for filler, pattern in FILLER_PATTERNS.items():
        matches = len(re.findall(pattern, text_lower))
        if matches > 0:
            filler_counts[filler] = matches
            filler_total += matches
            
    # Calculate Speech Clarity Score (0 - 100)
    # Ideal pace: 120 - 165 WPM
    pace_score = 100.0
    if wpm < 85:
        pace_score -= min(40, (85 - wpm) * 0.8)
    elif wpm > 175:
        pace_score -= min(35, (wpm - 175) * 0.6)
        
    # Filler word penalty: each filler above 2 lowers clarity
    filler_penalty = max(0, (filler_total - 2) * 4.0)
    
    # Long pause penalty
    pause_penalty = min(20, detected_pauses * 5.0)
    
    clarity_score = max(20.0, min(100.0, pace_score - filler_penalty - pause_penalty))
    clarity_score = round(clarity_score, 1)
    
    # Generate bilingual tips
    speech_tips = []
    is_urdu = language == "ur" or bool(re.search(r'[\u0600-\u06FF]', transcript))
    
    if filler_total > 4:
        most_common_filler = max(filler_counts, key=filler_counts.get)
        if is_urdu:
            speech_tips.append(
                f"آپ نے تکیا کلام (filler words) کا استعمال {filler_total} بار کیا (خاص طور پر '{most_common_filler}')۔ بولنے سے پہلے ایک مختصر لمحہ خاموش رہ کر سوچیں۔"
            )
        else:
            speech_tips.append(
                f"You used filler words {filler_total} times (e.g. '{most_common_filler}'). Try pausing silently to gather your thoughts."
            )
    elif filler_total == 0 and word_count > 25:
        speech_tips.append("Excellent speech fluency with virtually no filler words!")
        
    if wpm < 95 and word_count > 10:
        speech_tips.append(f"Speaking tempo was hesitant ({wpm} WPM). Aim for a conversational 130-150 WPM.")
    elif wpm > 175:
        speech_tips.append(f"Speaking pace was very fast ({wpm} WPM). Slow down slightly so the interviewer can absorb details.")
    else:
        speech_tips.append(f"Great pacing at {wpm} WPM within standard conversational limits.")
        
    return {
        "words_count": word_count,
        "wpm": wpm,
        "filler_words": filler_counts,
        "filler_total": filler_total,
        "pause_count": detected_pauses,
        "clarity_score": clarity_score,
        "speech_tips": speech_tips
    }
