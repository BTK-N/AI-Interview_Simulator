# AI-Based Interview Simulator (HR Bot)
## Migration Guide & Project Handover Documentation
**Author:** Muhammad Ali (<borntokillnoob@gmail.com>)  
**Project:** Final Year Project (FYP) 2026 — University of Sindh, Jamshoro  
**Repository:** [https://github.com/BTK-N/AI-Interview_Simulator](https://github.com/BTK-N/AI-Interview_Simulator)  
**Latest Synced Commit:** `ccdc836` (Branches: `main`, `master`)  
**Date of Handover:** September 2026  

---

## 1. Project Overview & Current State

The **AI-Based Interview Simulator** is a full-stack, multimodal mock interview application. It acts as an autonomous virtual HR technical interviewer:
- Presents role-specific technical and behavioral questions.
- Transcribes candidate speech locally using **Faster-Whisper (base / int8 on CPU)**.
- Tracks candidate confidence and gaze alignment in real time using **MediaPipe FaceMesh**.
- Computes real-time acoustic spectrum frequency data at **30 FPS**.
- Analyzes candidate answer substance against rubric benchmarks using **OpenRouter (`openrouter/free`)** with an automatic, zero-dependency **Local Heuristic Engine fallback**.
- Calculates a weighted composite performance score:
  $$\text{Final Score} = (0.30 \times \text{Confidence}) + (0.30 \times \text{Clarity}) + (0.40 \times \text{Content})$$
- Generates downloadable PDF candidate evaluation dossiers using **ReportLab**.

---

## 2. Solved Issues & Key Architectural Fixes

Before migrating, all core bugs and regressions were diagnosed and resolved with empirical test suites:

1. **Whisper STT 3-Minute CPU Freeze**:
   - *Problem*: Faster-Whisper default temperature fallback tuple `(0.0, 0.2, 0.4, 0.6, 0.8, 1.0)` caused up to 6 decoding passes when silence or ambient background noise was detected, pegging 2-core CPUs for 3+ minutes.
   - *Fix*: Locked single-pass decoding with `temperature=0.0`, `beam_size=1`, and Silero VAD (`vad_filter=True`). Transcription now completes in **~2.7 seconds**.
2. **Camera Flicker / Blackout on State Changes**:
   - *Problem*: Inlined callbacks in React triggered unnecessary remounting of `FloatingWebcamCard` and `getUserMedia()` cycles.
   - *Fix*: Wrapped stream handlers in `useCallback` and separated MediaRecorder stream cloning from active display video tracks.
3. **Scoring Fabrication on Empty/Short Answers**:
   - *Problem*: Empty or off-topic transcripts were previously floored at high scores due to default fallback minimums.
   - *Fix*: Added strict `< 5` words guard clauses in both frontend and backend. Empty responses score **0.0**, off-topic answers score **< 3.0**, and substantive technical answers score **> 7.0**.
4. **FSM Stuck in Transcribing after Pause/Resume**:
   - *Problem*: Clicking Pause prematurely transitioned the 9-stage FSM to `'transcribing'` and wiped audio buffer chunks.
   - *Fix*: Added explicit `pauseRecording` action in Zustand store. Audio chunks and transcripts are preserved across pauses. Submission alone advances to `'transcribing'` with a 15s network timeout safeguard.
5. **Frozen Acoustic Waveform Canvas**:
   - *Problem*: Chrome Autoplay policy left `AudioContext` in `suspended` state, and an early `if (reducedMotion) return;` check prevented canvas drawing on Windows machines with performance mode active.
   - *Fix*: Added `audioCtx.resume()` triggers on recording toggle and moved frequency buffer sampling ahead of motion gating.
6. **Record Button Blocked by Stale Persisted FSM State**:
   - *Problem*: Zustand `persist` middleware was serializing the volatile `stage` (e.g. `'transcribing'`, `'feedback'`) into browser `localStorage`. Any reload or return visit locked the record button in a disabled state.
   - *Fix*: Restricted `partialize` to cross-session safe fields (`roleId`, `roleTitle`, `language`, `sessions`), and added `onRehydrateStorage` reset to guarantee initial state always begins at `'idle'`.
7. **Git Author & Committer History**:
   - *Action*: Re-authored the entire Git history so all commits reflect **`Muhammad Ali <borntokillnoob@gmail.com>`**.

---

## 3. Fresh Setup Instructions on New Laptop

### Prerequisites
- **Git** installed ([git-scm.com](https://git-scm.com/))
- **Python 3.10** or **Python 3.11** installed (ensure *Add Python to PATH* is checked)
- **Node.js 18.x** or **Node.js 20.x** (LTS) installed ([nodejs.org](https://nodejs.org/))
- **Google Chrome** browser (for webcam & Web Audio API support)

---

### Step 1: Clone Repository
```powershell
git clone https://github.com/BTK-N/AI-Interview_Simulator.git
cd AI-Interview_Simulator
```

---

### Step 2: Backend Setup (FastAPI + Python)

1. Open PowerShell and navigate to `backend`:
   ```powershell
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   *(If script execution is disabled in PowerShell, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)*

3. Upgrade pip and install all required dependencies:
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Configure the environment variables (`.env`):
   ```powershell
   copy .env.example .env
   ```
   Open `backend/.env` and verify settings:
   ```ini
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=openrouter/free
   OPENROUTER_FALLBACK_MODEL=meta-llama/llama-3-8b-instruct:free
   PROJECT_NAME="AI-Based Interview Simulator (HR Bot)"
   DATABASE_URL=sqlite:///./interview_simulator.db
   SECRET_KEY=hr-bot-super-secret-jwt-key-2026-usindh
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   WEIGHT_CONFIDENCE=0.30
   WEIGHT_CLARITY=0.30
   WEIGHT_CONTENT=0.40
   DEMO_MODE=true
   ```

5. Test running the backend:
   ```powershell
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Verify by opening `http://127.0.0.1:8000/docs` in your browser.

---

### Step 3: Frontend Setup (React + Vite + TypeScript)

1. Open a new PowerShell terminal and navigate to `frontend`:
   ```powershell
   cd frontend
   ```
2. Install npm packages:
   ```powershell
   npm install
   ```
3. Start Vite dev server:
   ```powershell
   npm run dev
   ```
4. Access the web application at:
   ```
   http://localhost:5173
   ```

---

### Step 4: Quick Launchers (Optional)
Double-click shortcuts are available in the project root:
- **`run_backend.bat`**: Activates `.venv` and starts uvicorn on port 8000.
- **`run_frontend.bat`**: Runs `npm run dev` in `frontend`.

---

### Step 5: Windows OS Animation Setting (Crucial Note)
If the new laptop has Windows visual performance optimizations enabled (*"Adjust for best performance"*), Windows sets `prefers-reduced-motion: reduce = true`. This will cause the browser to suppress GSAP spring physics and draw calm static bars instead of dynamic bouncing waves.

To enable full fluid motion:
1. Open Windows **Settings** → **Accessibility** → **Visual effects**.
2. Toggle **Animation effects** to **ON**.

---

## 4. Key Testing & Demo Routes

| Route / View | URL | Purpose |
| :--- | :--- | :--- |
| **Welcome / Role Selection** | `http://localhost:5173/` | Screen 1: Select role (Software Engineer, ML Engineer, Product Manager), set question limit, choose language (English / Urdu). |
| **Active Cockpit Session** | `http://localhost:5173/?view=interview` | Screen 2: Spatial Cockpit with Kinetic Typography, live webcam, MediaPipe reticle, FilmTimer, and Acoustic Spectrum. |
| **Answer Evaluation Overlay**| `http://localhost:5173/?view=interview&stage=feedback` | Screen 3: Multimodal score overlay with WPM, filler word count, radar chart, and feedback tips. |
| **Comprehensive Report** | `http://localhost:5173/?view=report` | Screen 4: Executive candidate summary, composite scoring radar, category breakdowns, and PDF generator. |
| **Interactive API Docs** | `http://127.0.0.1:8000/docs` | FastAPI Swagger documentation for all endpoints. |

---

## 5. Repository File Structure Quick Reference

```
mock Interviews/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/interview.py   # Question lifecycle, submission & upsert
│   │   ├── services/
│   │   │   ├── llm_service.py           # OpenRouter API client + Local Heuristic Scorer
│   │   │   ├── stt_service.py           # Faster-Whisper single-pass inference (CPU/int8)
│   │   │   ├── speech_service.py        # WPM & filler word analysis
│   │   │   └── scoring_service.py       # Weighted composite metric calculation
│   │   └── data/questions.json          # Curated technical & behavioral questions
│   ├── .env                             # Active environment configuration
│   └── requirements.txt                 # All backend Python packages
├── frontend/
│   ├── src/
│   │   ├── api/client.ts                # Axios/Fetch API client with timeout protection
│   │   ├── components/
│   │   │   ├── interview/               # Cockpit components (AnswerControlsBar, Overlay, etc.)
│   │   │   └── ui/                      # AudioWaveformCanvas, FilmTimer, MetricRing, etc.
│   │   ├── store/sessionStore.ts        # Zustand FSM with safe partialize & rehydrate reset
│   │   └── pages/                       # HomePage, InterviewSessionPage, ReportPage
│   └── package.json                     # Frontend dependencies
├── NEW_LAPTOP_SETUP.md                  # This complete guide
├── run_backend.bat                      # 1-click backend runner
└── run_frontend.bat                     # 1-click frontend runner
```

---

*Handover verified and pushed to remote GitHub master & main branches.*
