# Demonstration Video Script & Production Guide

**Project**: Autonomous AI-Based Interview Simulator (HR Bot)  
**Academic Milestone**: Final Year Project (FYP) 2026  
**Department**: Department of Software Engineering, University of Sindh, Jamshoro  
**Target Video Duration**: 3 minutes 30 seconds  

---

## 1. Video Production Overview & Cut Strategy

To present a compelling, professional viva demonstration while maintaining complete authenticity:
- **Core Strategy**: The live interview is performed with real hardware, real audio, and real backend evaluation.
- **Strategic Cut**: During the 6–10s Whisper STT CPU inference delay, apply a brief 1-second cross-fade cut after showing the `TRANSCRIBING [WHISPER]...` indicator. This keeps the video brisk and engaging without concealing the underlying technology.
- **Fallback Recording**: A separate raw, uncut screen capture (`demo-fallback-full.mp4`) is preserved in the documentation archive for emergency viva defense if live presentation hardware experiences issues.

---

## 2. Shot-by-Shot Walkthrough Script

### Scene 1: Introduction & System Pre-Flight Check (0:00 – 0:45)
- **Visual**: Screen 1 (Landing Page) in Dark Obsidian (`#080A0F`).
- **Action**: Mouse hovers over the System Readiness Matrix in the header. Shows `CAM: 1080p 30FPS`, `MIC: ACTIVE`, `STT: READY`, `LLM: READY`. Demonstrates the 3D perspective tilt on the Software Engineer role card. Points out the live webcam feed with corner brackets in the Diagnostics Console.
- **Voiceover Narration**:
  > *"Welcome to the demonstration of our Final Year Project: the Autonomous AI-Based Interview Simulator, developed at the Department of Software Engineering, University of Sindh, Jamshoro.*  
  > *Our platform replaces traditional generic text quizzes with a live, spatial multimodal interview cockpit. In the top telemetry header, our pre-flight check validates connected camera and microphone devices. On the left, candidates select from specialized role tracks—Software Engineering, Product Management, or HR. On the right, our hardware diagnostics console confirms a 30 FPS optical stream and live Web Audio frequency response. Let's enter the interview room."*

---

### Scene 2: Live Spatial Cockpit & MediaPipe Telemetry (0:45 – 1:20)
- **Visual**: Screen 2 (Spatial Interview Cockpit).
- **Action**: The cockpit mounts with smooth staggered entry. The floating candidate optical card displays corner reticle brackets snapping to the face, reporting `PITCH: +1.2°`, `YAW: -0.8°`, `ACC: 96%`, and `15 FPS LOCKED`. Below it, the Web Audio visualizer breathes with an idle harmonic wave.
- **Voiceover Narration**:
  > *"Upon entering the interview room, the candidate is presented with an focused, distraction-free environment. On the left, our concentric FilmTimer tracks the response window with JetBrains Mono tabular figures. In the center, our floating webcam feed runs Google MediaPipe FaceMesh directly in the browser at 15 frames per second, continuously evaluating head-pose pitch, yaw, and eye-gaze contact without streaming sensitive video over the network.*  
  > *At the bottom, our Web Audio analyzer visualizes microphone frequencies at 30 FPS. Let's trigger Question 1 using our text-to-speech engine."*

---

### Scene 3: Question Delivery & Spoken Candidate Response (1:20 – 2:05)
- **Visual**: Question viewer with Space Grotesk kinetic typography.
- **Action**: Question is read aloud: *"Can you explain the core principles of Object-Oriented Programming (OOP) and give a brief real-world example of Polymorphism?"*. Candidate presses `[SPACE]` to start recording. Audio spectrum lights up in amber. Live speech recognition displays real-time interim words, live WPM counter (`126 WPM`), and filler word counts.
- **Voiceover Narration**:
  > *"The platform delivers curated questions with model answer benchmarks. The candidate begins speaking. Notice the acoustic transcript feed streaming words in real-time, tracking speaking cadence and vocalized hesitations. We capture the candidate's actual audio stream in WebM Opus format for neural transcription."*

---

### Scene 4: Whisper Transcription & Strategic Cut (2:05 – 2:20)
- **Visual**: Candidate presses `[ENTER]` to submit answer.
- **Action**: Button toggles to `TRANSCRIBING [WHISPER]...` with an amber pulsating spinner.
- **Editing Note**: Cross-fade cut (skip 4 seconds) to `EVALUATING [RUBRIC]...` in Arctic Mint, followed immediately by the analysis modal reveal.
- **Voiceover Narration**:
  > *"When the candidate submits their response, our finite state machine transitions to the transcribing stage. The WebM audio is dispatched to our FastAPI backend, where Hugging Face's faster-whisper runs on local CPU with int8 quantization. The transcript is then passed to our 2-Tier Scoring Cascade, which evaluates technical depth against calibrated rubrics."*

---

### Scene 5: Multimodal Answer Analysis & Interactive Coaching (2:20 – 2:50)
- **Visual**: Screen 3 (Multimodal Analysis Overlay).
- **Action**: Three radial MetricRings animate: Content Relevance (Amber 94%), Speech Clarity (Mint 86%), and Composure (Cyan 90%). Candidate hovers over an interactive filler chip (`"um"`); tooltip displays exact timestamp `[00:12]` and the coaching directive: *"Replace vocalized pauses with silent breath pauses. Silence signals executive command."*
- **Voiceover Narration**:
  > *"Immediately post-response, the candidate receives granular diagnostic feedback. Three radial score rings break down technical content depth, speech cadence, and optical composure.*  
  > *Every hesitation marker is timestamped and clickable. Hovering over a detected filler reveals contextual delivery coaching, training candidates to master executive silence over vocalized pauses."*

---

### Scene 6: Executive Performance Dossier & 5-Axis Radar (2:50 – 3:15)
- **Visual**: Screen 4 (Executive Performance Dossier).
- **Action**: Shows overall Readiness Tier badge (`STRONG`), 5-axis competency radar chart, pillar weight breakdown (40% Content, 30% Clarity, 30% Composure), and expands the collapsible per-question accordion showing model answer takeaways.
- **Voiceover Narration**:
  > *"At the conclusion of the interview, the platform synthesizes an Executive Performance Dossier. Candidates receive an honest Readiness Tier classification—in this case, Strong—accompanied by a 5-axis competency radar chart and per-question breakdowns comparing candidate transcripts directly against industry model answers."*

---

### Scene 7: Multi-Page PDF Dossier & Archive (3:15 – 3:30)
- **Visual**: Candidate clicks `DOWNLOAD DOSSIER (PDF)`. Shows the generated 2-page PDF dossier on screen. Toggles to Screen 5 (`ARCHIVE`), showing the pure SVG trendline chart tracking longitudinal improvement over time.
- **Voiceover Narration**:
  > *"Candidates can export a publication-grade, two-page vector PDF dossier generated via ReportLab in under 100 milliseconds for university examination records. Every mock session is persisted to our SQLite database and tracked across longitudinal SVG trendlines in our Archive view.*  
  > *This concludes our demonstration. Thank you."*

---

## 3. Emergency Viva Defense Runbook for Video Fallback

If the viva room encounters unexpected hardware failure (broken microphone, webcam permission failure, or projector incompatibility):
1. **Trigger Condition**: Any hardware or peripheral failure during pre-flight diagnostics.
2. **Action**: Open `frontend/docs/demo-fallback-full.mp4` in VLC Player or Google Chrome.
3. **Defense Script**:
   > *"Distinguished examiners, to ensure uninterrupted review, we have also archived this complete uncut screen capture of our platform executing the full 8-endpoint lifecycle against live faster-whisper STT and SQLite database persistence."*
