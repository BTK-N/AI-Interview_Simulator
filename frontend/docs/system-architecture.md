# System Architecture Specification

**Project**: Autonomous AI-Based Interview Simulator (HR Bot)  
**Academic Milestone**: Final Year Project (FYP) 2026  
**Department**: Department of Software Engineering, University of Sindh, Jamshoro  

---

## 1. High-Level System Architecture Diagram

```
+--------------------------------------------------------------------------------------------------+
|                                    PRESENTATION TIER (CLIENT)                                     |
|                                                                                                  |
|   React 19 + TypeScript + Vite + Tailwind CSS (Dark Obsidian #080A0F)                           |
|                                                                                                  |
|   [Spatial Cockpit]           [Computer Vision Engine]           [Audio Signal Processing]       |
|   - Screen 1: Suite Landing   - MediaPipe FaceMesh (15 FPS)      - Web Audio API (30 FPS FFT)    |
|   - Screen 2: Spatial Room    - Corner Reticle HUD Tracking      - MediaRecorder (WebM Opus)     |
|   - Screen 3: Analysis Modal  - Pitch / Yaw / Gaze Vector        - Live Interim Speech Feed      |
|   - Screen 4: Report Dossier                                                                     |
|   - Screen 5: History Archive                                                                    |
|                                                                                                  |
|   [State Management & Offline Safety]                                                            |
|   - Zustand FSM (Strict 9-Stage Finite State Machine: idle -> report)                            |
|   - LocalStorage Caching (Automatic offline failover if backend disconnects)                     |
+-------------------------------------------------+------------------------------------------------+
                                                  |
                                HTTP REST / JSON / Multipart WebM
                                (Vite Proxy: /api/* -> 127.0.0.1:8000)
                                                  |
                                                  v
+--------------------------------------------------------------------------------------------------+
|                                    APPLICATION TIER (BACKEND)                                     |
|                                                                                                  |
|   FastAPI + Uvicorn + Python 3.12                                                                |
|                                                                                                  |
|   [Speech-to-Text Pipeline]                  [Persistence Engine]                                |
|   - Hugging Face faster-whisper (CPU)        - SQLite Database (interview_simulator.db)          |
|   - Model: base (int8 quantized)             - SQLAlchemy 2.0 ORM with Self-Healing Migrations  |
|   - VAD: min_silence_duration_ms=1500        - Benchmark Demo Partitioning (is_demo flag)        |
|   - PyAV Native WebM Opus Decoding                                                               |
|                                                                                                  |
|   [Publication PDF Generation Engine]        [Audio & Cadence Analyzer]                          |
|   - ReportLab 5.0 Vector Engine              - Words Per Minute (120-150 standard)               |
|   - NumberedCanvas (2-Pass Page Counting)    - Bilingual Filler Word Lexicon (English & Urdu)    |
|   - Executive Dossier + Rubric Breakdown     - Pause Interval & Hesitation Detection             |
+-------------------------------------------------+------------------------------------------------+
                                                  |
                                 2-Tier Resilient Scoring Cascade
                                                  |
                         +------------------------+------------------------+
                         |                                                 |
                         v                                                 v
    +------------------------------------------+      +------------------------------------------+
    |         PRIMARY SCORER (DEFAULT)         |      |        ENHANCEMENT LAYER (OPTIONAL)      |
    |                                          |      |                                          |
    |  Local Deterministic Heuristic Engine    |      |  OpenRouter Free Router (openrouter/free)|
    |  - Zero Network, Zero API Key Dependency |      |  - Dynamic Free Model Negotiation        |
    |  - Jaccard Expected-Point Hit Ratio      |      |  - Runtime Model Logging                 |
    |  - STAR Structural Progression Markers   |      |  - Qualitative Praise & Coaching Depth   |
    |  - Strict Cadence & Filler Deductions    |      |  - Silent Fallback to Primary on Timeout |
    |  - 100% Defensible & Auditable for Viva  |      |  - Regional Resilience (Pakistan)        |
    +------------------------------------------+      +------------------------------------------+
```

---

## 2. Layer-by-Layer Engineering Justification

### 1. Presentation Tier (Frontend)
- **Framework Choice**: React 19 with Vite 8.
  - *Rationale*: Micro-bundle build performance (<2.5s), native ES modules, and tree-shaking capability that keeps chunk sizes minimal (`InterviewSessionPage` 9.66 KB gzip, `HistoryPage` 6.08 KB gzip).
- **Styling & Aesthetics**: Dark Obsidian (`#080A0F`), Electric Amber (`#F59E0B`), Arctic Mint (`#10B981`).
  - *Rationale*: Intentional enterprise aesthetic modeled on professional developer cockpits (Linear, Raycast, Bloomberg). Reduces optical fatigue during high-stress interview evaluations.
- **Client-Side Edge Telemetry**:
  - *Optical*: MediaPipe FaceMesh runs at 15 FPS directly in the browser via WebAssembly/WebGL, computing head pose stability and gaze vector without streaming candidate video bytes over the network.
  - *Acoustic*: Web Audio API `AnalyserNode` throttled strictly to 30 FPS via `requestAnimationFrame` with a 128 FFT buffer, computing live frequency formants with zero memory allocation churn.

### 2. State Management Tier
- **Zustand 9-Stage Finite State Machine (FSM)**:
  - Transition matrix strictly limits state evolution:
    `idle -> hardware_check -> question_asked -> recording -> transcribing -> analyzing -> feedback -> next_question -> report`.
  - Prohibits race conditions and prevents premature submission.
- **Dual Persistence Architecture**:
  - Live session state mirrored to browser `localStorage`. If the browser tab is accidentally refreshed or backend temporarily disconnects, candidate progress is preserved without restarting.

### 3. Application & STT Tier (Backend)
- **Framework Choice**: FastAPI on Python 3.12.
  - *Rationale*: Native asynchronous request dispatching, automatic OpenAPI (`/docs`) validation via Pydantic v2, and high-performance streaming responses.
- **Speech-to-Text Engine**: `faster-whisper` (`base` model, `int8` quantization).
  - *Rationale*: High inference throughput on CPU without requiring an external GPU. Voice Activity Detection (VAD) with `min_silence_duration_ms=1500` strips silence. Delivers 100% word accuracy on real 17s acoustic WebM audio in 4.45s.

### 4. 2-Tier Resilient Scoring Architecture
- **Primary Scorer: Local Heuristic Engine**:
  - Fully self-contained inside `backend/app/services/llm_service.py`.
  - Uses Jaccard keyword hit-ratio across domain rubric points, detects STAR structural markers (Situation, Task, Action, Result), and applies deterministic pacing deductions.
  - Always available: requires zero network, zero API key, zero cost, and zero external trust.
- **Enhancement Layer: `openrouter/free`**:
  - *Regional Routing Context*: During development in Pakistan, direct NVIDIA NIM API access was unavailable due to country restrictions in NVIDIA's phone verification system. Our system uses OpenRouter's free-tier router (`openrouter/free`), which automatically selects an available model from its free pool and routes through OpenRouter's infrastructure. The specific model used is logged for each evaluation but not depended on. The architecture prioritizes resilience over specific provider choice.

### 5. Document Generation Tier
- **ReportLab 5.0 Vector Engine**:
  - Generates high-density, publication-grade executive performance dossiers (`.pdf`) in under 100ms.
  - Two-pass `NumberedCanvas` compiles dynamic page counts ("Page X of Y"), institutional headers, Readiness Tier banners, 5-Axis Competency Matrices, and per-question evaluator feedback.
