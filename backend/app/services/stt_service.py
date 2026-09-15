import time
import os
import tempfile
from typing import Dict, Any, Optional
from faster_whisper import WhisperModel

_stt_model: Optional[WhisperModel] = None

def get_stt_model() -> WhisperModel:
    """Lazily loads the quantized Whisper base model from Hugging Face."""
    global _stt_model
    if _stt_model is None:
        # 'base' is ~140MB, int8 quantization uses ~250MB RAM and runs ultra-fast on CPU
        _stt_model = WhisperModel("base", device="cpu", compute_type="int8")
    return _stt_model

get_whisper_model = get_stt_model

def transcribe_audio_file(
    file_path: str,
    language: Optional[str] = "en"
) -> Dict[str, Any]:
    """
    Transcribes spoken audio using Hugging Face faster-whisper with diagnostic timing.
    """
    t0 = time.time()

    # Stage 1: model load (should be cached, not re-loaded)
    model = get_whisper_model()
    t1 = time.time()
    print(f"[TIMING] Model fetch: {t1 - t0:.2f}s")

    # Stage 2: audio decode
    import av
    container = av.open(file_path)
    try:
        container.close()
    except Exception:
        pass
    t2 = time.time()
    print(f"[TIMING] Container open: {t2 - t1:.2f}s")

    lang = language if language in ["en", "ur"] else None

    # Stage 3: actual transcription
    # Default Whisper retries at temperatures 0.0, 0.2, 0.4, 0.6, 0.8, 1.0
    # when silence or noise trips the fallback heuristics. On a 2-core
    # CPU this turns a 3-second transcription into 3+ minutes. Setting
    # temperature=0.0 disables the fallback entirely — one pass, always.
    #
    # Disabling the thresholds prevents Whisper from deciding "this is
    # silence, let me retry at higher temperatures." For interview
    # audio, silence is common; we want a fast empty result, not a
    # hallucination loop.
    segments, info = model.transcribe(
        file_path,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=1000),
        beam_size=1,
        language=lang,

        # FIX: Single-pass decode. Prevents 6x temperature retry loop
        # on silence or ambient noise.
        temperature=0.0,
        condition_on_previous_text=False,
        compression_ratio_threshold=None,
        log_prob_threshold=None,
        no_speech_threshold=None,
    )

    # Materialize the generator — this is where the work happens
    segments_list = list(segments)
    t3 = time.time()
    print(f"[TIMING] Transcription: {t3 - t2:.2f}s")
    print(f"[TIMING] Segments returned: {len(segments_list)}")

    transcript_parts = []
    segment_list = []
    for s in segments_list:
        text = s.text.strip()
        if text:
            transcript_parts.append(text)
            segment_list.append({
                "start": round(s.start, 2),
                "end": round(s.end, 2),
                "text": text,
                "avg_logprob": round(s.avg_logprob, 3) if hasattr(s, 'avg_logprob') else -0.2
            })

    full_transcript = " ".join(transcript_parts)
    confidence = max(0.70, min(0.99, round(info.language_probability, 2))) if info.language_probability else 0.85

    return {
        "text": full_transcript,
        "transcript": full_transcript,
        "detected_language": info.language,
        "language_probability": round(info.language_probability, 3),
        "confidence": confidence,
        "duration": round(info.duration, 2),
        "segments": segment_list
    }
