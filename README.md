# AI-Based Interview Simulator (HR Bot)

> **Final Year Project (FYP) 2026**  
> Department of Software Engineering, Faculty of Engineering and Technology  
> **University of Sindh, Jamshoro**

An autonomous, multimodal AI web application that conducts realistic mock job interviews using video, voice, and artificial intelligence. It acts as an interactive virtual HR interviewer—asking role-specific questions, listening to spoken answers, tracking confidence and speech clarity, and generating comprehensive performance reports.

---

## 1. Core Architecture & Multimodal Scoring

The system computes a weighted composite performance score out of 100:

$$\text{Final Score} = (0.30 \times \text{Confidence}) + (0.30 \times \text{Speech Clarity}) + (0.40 \times \text{Content Quality})$$

| Component | Weight | Technology | Evaluated Metrics |
| :--- | :---: | :--- | :--- |
| **Content Quality** | **40%** | **Primary**: Local Heuristic Engine<br/>**Enhancement**: `openrouter/free` Dynamic Router | Rubric semantic keyword matching, STAR structural progression (Situation, Task, Action, Result), conceptual completeness, and technical depth. |
| **Speech Clarity** | **30%** | Speech Prosody & Faster-Whisper | Words Per Minute (120–150 WPM benchmark), filler word frequency (`um`, `uh`, `like`, `basically`), and long hesitation pauses. |
| **Confidence** | **30%** | Google MediaPipe FaceMesh & Telemetry | Optical eye-gaze tracking, head-pose stability (Yaw/Pitch), and facial composure. |

> **Regional AI Resilience & Routing**:  
> During development in Pakistan, direct NVIDIA NIM API access was unavailable due to country restrictions in NVIDIA's phone verification system. Our system uses OpenRouter's free-tier router (`openrouter/free`), which automatically selects an available model from its free pool and routes through OpenRouter's infrastructure. The specific model used is logged for each evaluation but not depended on. The architecture prioritizes resilience over specific provider choice.  
> The system is architected around a **Local Heuristic Engine** as the primary scorer (zero network, zero cloud dependency, fully deterministic and auditable during examination), with OpenRouter acting as an optional qualitative enhancement layer.


---

## 2. Project Structure

```
mock Interviews/
├── allfiles/                           # Original FYP Proposal Form & Abstract Template
├── backend/                            # FastAPI Python Backend
│   ├── .venv/                          # Isolated Python 3.11 virtual environment
│   ├── .env                            # OpenRouter API Key & settings
│   ├── requirements.txt                # FastAPI, SQLAlchemy, ReportLab, etc.
│   ├── interview_simulator.db          # Local SQLite database
│   └── app/
│       ├── main.py                     # App entry point, CORS, and routing
│       ├── config.py                   # Environment settings
│       ├── data/
│       │   └── questions.json          # Curated question banks with rubrics & model answers
│       ├── models/
│       │   ├── database.py             # SQLAlchemy models (User, Session, Answers)
│       │   └── schemas.py              # Pydantic data validation schemas
│       ├── services/
│       │   ├── llm_service.py          # OpenRouter LLM evaluation engine
│       │   ├── speech_service.py       # WPM, filler word counter, clarity scoring
│       │   └── scoring_service.py      # Weighted composite scoring & insights
│       └── api/
│           └── endpoints/
│               ├── interview.py        # Session lifecycle & question endpoints
│               └── pdf_report.py       # Downloadable PDF report generator
├── frontend/                           # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── api/client.ts               # Backend API client
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # University branding & status badges
│   │   │   ├── WebcamCapture.tsx       # Live camera feed, eye contact & audio level visualizer
│   │   │   ├── QuestionCard.tsx        # Text-to-Speech (Web Speech API) & concept hints
│   │   │   └── SpeechRecorder.tsx      # Live speech recognition, countdown timer & controls
│   │   ├── pages/
│   │   │   ├── HomePage.tsx            # Role selection (SWE, Marketing, HR) & interview mix
│   │   │   ├── InterviewSessionPage.tsx # Live mock interview workspace
│   │   │   └── ReportPage.tsx          # Radar chart, score breakdown & PDF download
│   │   └── App.tsx
├── run_backend.bat                     # Double-click launcher for backend
├── run_frontend.bat                    # Double-click launcher for frontend
└── README.md
```

---

## 3. How to Run the Application

### Configuration Setup
Before launching, copy the environment template in `backend/` and configure your API keys:
```powershell
cd backend
copy .env.example .env
```
> **Note**: An OpenRouter API key can be obtained for free at [openrouter.ai/keys](https://openrouter.ai/keys).

### Option A: Quick Launch (Double-click)
1. Double-click **`run_backend.bat`** (Starts backend on `http://127.0.0.1:8000`).
2. Double-click **`run_frontend.bat`** (Starts Vite React on `http://localhost:5173`).
3. Open your browser to `http://localhost:5173`.

### Option B: Terminal Launch

**Terminal 1 (Backend):**
```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
Interactive API docs are available at: `http://127.0.0.1:8000/docs`

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

---

## 4. Key Features Implemented

1. **Role & Question Bank Selection**: Software Engineer, Marketing Executive, and HR & General Professional.
2. **Text-To-Speech (TTS)**: The bot reads questions aloud using the browser's native `SpeechSynthesis` API with natural cadence.
3. **Live Speech Transcription**: Real-time microphone capture with live word-by-word transcription.
4. **Speech Fluency Scoring**: Automatically flags filler words (`um`, `uh`, `like`, `you know`, `actually`, `basically`) and measures speaking tempo.
5. **AI Evaluation with OpenRouter**: Scores relevance, completeness, and structure (0–10 each) and generates custom feedback and actionable suggestions.
6. **Recharts Radar & Visual Dashboard**: Multi-dimensional capability visualization.
7. **Downloadable PDF Report**: Official export generated via ReportLab containing candidate metadata, session scores, question reviews, and model benchmark comparisons.
