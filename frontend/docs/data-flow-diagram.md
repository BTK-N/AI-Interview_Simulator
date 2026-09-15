# Interview Lifecycle Data Flow Specification

**Project**: Autonomous AI-Based Interview Simulator (HR Bot)  
**Academic Milestone**: Final Year Project (FYP) 2026  
**Department**: Department of Software Engineering, University of Sindh, Jamshoro  

---

## 1. End-to-End Interview Lifecycle Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate / User
    participant UI as Frontend Client (React 19)
    participant FSM as Zustand Store (FSM)
    participant FastAPIEngine as FastAPI Backend
    participant Whisper as Faster-Whisper (CPU)
    participant Scorer as 2-Tier Scoring Cascade
    participant SQLite as SQLite Database
    participant PDFEngine as ReportLab 5.0 Engine

    %% Step 1: Initialization
    Candidate->>UI: Selects Role (e.g. Software Engineer)
    UI->>FastAPIEngine: POST /api/sessions/start
    FastAPIEngine->>SQLite: INSERT into sessions (role, status='in_progress')
    FastAPIEngine-->>UI: Returns session_id, roleTitle, first_question
    UI->>FSM: transitionTo('question_asked')

    %% Step 2: Spatial Cockpit & Live Feed
    Candidate->>UI: Enters Interview Cockpit (Screen 2)
    UI->>UI: Mounts MediaPipe FaceMesh (15 FPS gaze tracking)
    UI->>UI: Mounts Web Audio API AnalyserNode (30 FPS FFT)
    Candidate->>UI: Clicks RECORD RESPONSE [SPACE]
    UI->>FSM: transitionTo('recording')
    UI->>UI: MediaRecorder captures audio/webm chunks
    UI->>UI: Live speech recognition renders interim transcript & WPM

    %% Step 3: Transcription Stage
    Candidate->>UI: Clicks SUBMIT ANSWER [ENTER]
    UI->>FSM: transitionTo('transcribing')
    Note over UI: AnswerControlsBar displays TRANSCRIBING [WHISPER]...
    Note over UI: If duration > 12s, display CPU warning banner
    UI->>FastAPIEngine: POST /api/sessions/{id}/transcribe (multipart audio/webm)
    FastAPIEngine->>Whisper: Decode WebM via PyAV & run int8 Whisper base model
    Whisper-->>FastAPIEngine: Returns verbatim transcript & confidence (0.99)
    FastAPIEngine-->>UI: JSON { transcript, duration, confidence }

    %% Step 4: Multimodal Evaluation Stage
    UI->>FSM: transitionTo('analyzing')
    Note over UI: AnswerControlsBar displays EVALUATING [RUBRIC]...
    Note over UI: If duration > 8s, display remote LLM warning banner
    UI->>FastAPIEngine: POST /api/sessions/{id}/evaluate (transcript, telemetry, duration)
    FastAPIEngine->>Scorer: 1. Evaluate with Local Heuristic Engine (Primary)
    alt Network Available & Active OpenRouter Free Pool
        Scorer->>Scorer: 2. Enhance via openrouter/free (Dynamic model negotiation)
    else Timeout / Quota Exhaustion / Offline
        Scorer->>Scorer: Silent fallback to Local Heuristic Scorer output
    end
    Scorer-->>FastAPIEngine: Synthesized scores (Content 40%, Clarity 30%, Composure 30%)
    FastAPIEngine->>SQLite: INSERT into answers (scores, transcript, feedback, tips)
    FastAPIEngine-->>UI: JSON QuestionEvaluation
    UI->>FSM: transitionTo('feedback')

    %% Step 5: Multimodal Feedback & Overlay
    UI->>Candidate: Renders AnswerAnalysisOverlay (Screen 3)
    Note over Candidate: Reviews MetricRings, interactive filler chips, & coaching tips
    Candidate->>UI: Clicks NEXT QUESTION [ENTER]
    UI->>FSM: transitionTo('next_question') -> transitionTo('question_asked')

    %% Step 6: Session Conclusion & PDF Dossier
    Note over UI: After final question completed:
    UI->>FastAPIEngine: POST /api/sessions/{id}/end
    FastAPIEngine->>SQLite: UPDATE sessions (overall_score, status='completed')
    FastAPIEngine-->>UI: JSON SessionReport
    UI->>FSM: transitionTo('report')
    UI->>Candidate: Renders Executive Performance Dossier (Screen 4)
    Candidate->>UI: Clicks DOWNLOAD DOSSIER (PDF)
    UI->>FastAPIEngine: GET /api/sessions/{id}/pdf
    FastAPIEngine->>PDFEngine: NumberedCanvas compiles 2-page publication dossier
    PDFEngine-->>Candidate: Streams binary PDF (interview_dossier_software_engineer.pdf)

    %% Step 7: Historical Persistence
    Candidate->>UI: Clicks ARCHIVE nav toggle (Screen 5)
    UI->>FastAPIEngine: GET /api/sessions?limit=20&offset=0
    FastAPIEngine->>SQLite: SELECT from sessions ORDER BY created_at DESC
    FastAPIEngine-->>UI: JSON SessionListResponse
    UI->>Candidate: Renders Longitudinal Progression Trendlines & Editorial Cards
```

---

## 2. Telemetry and State Flow Matrix

| Stage | Input Sensors | Processing Engine | State Target | Output Artifact |
|---|---|---|---|---|
| **`question_asked`** | User role choice | Web Speech TTS (Synthesis) | Local Zustand Store | Question headline & time limit |
| **`recording`** | Webcam + Microphone | MediaPipe FaceMesh + Web Audio FFT | Live Interim Buffer | Real-time gaze coordinates, live WPM, interim transcript |
| **`transcribing`** | WebM Opus Audio Blob | Hugging Face faster-whisper (CPU) | Backend In-Memory | Verbatim text transcript (`confidence > 0.95`) |
| **`analyzing`** | Transcript + Telemetry | Local Heuristic Scorer + OpenRouter | SQLite `answers` Table | Multi-axis scores, praise, and targeted improvement tips |
| **`feedback`** | Evaluator payload | React 19 UI DOM | Transient Modal Overlay | Color-coded transcript with clickable filler popovers |
| **`report`** | Aggregated answer metrics | Chart.js 5-Axis Radar + SVG Trendline | SQLite `sessions` Table | Composite Index, Readiness Tier (`STRONG`, `DEVELOPING`), PDF |
| **`history`** | Paginated DB query | Zustand Persistent Cache | Standalone History View | Dual-line SVG progression chart, per-question sparklines |
