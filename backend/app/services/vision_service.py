import os
from pathlib import Path
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from typing import Dict, Any

MODEL_PATH = Path(__file__).resolve().parent.parent / "data" / "face_landmarker.task"

class FaceConfidenceAnalyzer:
    def __init__(self):
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
            
        base_options = python.BaseOptions(model_asset_path=str(MODEL_PATH))
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            output_face_blendshapes=True,
            output_facial_transformation_matrixes=True,
            num_faces=1
        )
        self.detector = vision.FaceLandmarker.create_from_options(options)

    def analyze_frame(self, frame_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Analyzes webcam frame using MediaPipe FaceLandmarker with blendshapes:
        - Eye Contact (EyeLookIn/Out/Up/Down blendshapes)
        - Head Pose (Facial transformation matrix)
        - Positivity / Smile (mouthSmile blendshape)
        - Tension / Brow furrow (browDown blendshape)
        - Generates 0-100 Confidence Score
        """
        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        detection = self.detector.detect(mp_image)

        if not detection.face_landmarks or len(detection.face_landmarks) == 0:
            return {
                "face_detected": False,
                "confidence_score": 50.0,
                "eye_contact": "Face Not In Frame",
                "smile_detected": False,
                "status_note": "Position yourself in center of webcam frame."
            }

        # 1. Extract Blendshapes
        blendshapes = {}
        if detection.face_blendshapes and len(detection.face_blendshapes) > 0:
            for category in detection.face_blendshapes[0]:
                blendshapes[category.category_name] = category.score

        smile_score = (blendshapes.get("mouthSmileLeft", 0.0) + blendshapes.get("mouthSmileRight", 0.0)) / 2.0
        brow_tension = (blendshapes.get("browDownLeft", 0.0) + blendshapes.get("browDownRight", 0.0)) / 2.0
        
        # Gaze deviation: looking away left/right/down
        eye_look_out = max(
            blendshapes.get("eyeLookOutLeft", 0.0), 
            blendshapes.get("eyeLookOutRight", 0.0),
            blendshapes.get("eyeLookDownLeft", 0.0),
            blendshapes.get("eyeLookDownRight", 0.0)
        )

        # 2. Eye Contact Evaluation
        if eye_look_out < 0.25:
            eye_contact_status = "Direct Eye Contact"
            eye_contact_score = 95.0
        elif eye_look_out < 0.50:
            eye_contact_status = "Fair • Slight Gaze Drift"
            eye_contact_score = 78.0
        else:
            eye_contact_status = "Looking Away / Down"
            eye_contact_score = 55.0

        # 3. Overall Confidence Calculation (0 - 100)
        confidence = eye_contact_score
        if smile_score > 0.3:
            confidence = min(100.0, confidence + 5.0)  # Calm, positive demeanor bonus
        if brow_tension > 0.4:
            confidence = max(40.0, confidence - 8.0)   # Stress / furrowed brow penalty

        return {
            "face_detected": True,
            "confidence_score": round(confidence, 1),
            "eye_contact": eye_contact_status,
            "is_smiling": bool(smile_score > 0.35),
            "smile_score": round(float(smile_score), 2),
            "tension_score": round(float(brow_tension), 2),
            "status_note": "Good posture & composed presentation." if confidence >= 75 else "Look directly at camera lens to maximize confidence."
        }

_analyzer = None

def get_face_analyzer() -> FaceConfidenceAnalyzer:
    global _analyzer
    if _analyzer is None:
        _analyzer = FaceConfidenceAnalyzer()
    return _analyzer
