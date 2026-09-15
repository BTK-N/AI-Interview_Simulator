# API Reference Specification

**Project**: Autonomous AI-Based Interview Simulator (HR Bot)  
**Academic Milestone**: Final Year Project (FYP) 2026  
**Department**: Department of Software Engineering, University of Sindh, Jamshoro  
**Base URL**: `http://localhost:8000/api` (or `/api` via Vite frontend proxy)  

---

## Overview of Verified Endpoints

The backend exposes 8 production endpoints supporting the end-to-end interview lifecycle:

| # | HTTP Method | Endpoint Path | Description | Status Code |
|---|---|---|---|:---:|
| **1** | `GET` | `/api/roles` | Retrieve available interview role dossiers | `200 OK` |
| **2** | `POST` | `/api/sessions/start` | Initialize interview session & retrieve Q1 | `200 OK` |
| **3** | `POST` | `/api/sessions/{id}/transcribe` | Transcribe recorded audio with Whisper STT | `200 OK` |
| **4** | `POST` | `/api/sessions/{id}/evaluate` | Multimodal rubric scoring (Speech + Content + Composure) | `200 OK` |
| **5** | `GET` | `/api/sessions/{id}/report` | Compile final performance dossier report | `200 OK` |
| **6** | `GET` | `/api/sessions/{id}/pdf` | Generate publication-grade multi-page PDF | `200 OK` |
| **7** | `GET` | `/api/sessions` | Retrieve paginated historical sessions from SQLite | `200 OK` |
| **8** | `POST` | `/api/sessions/{id}/end` | Finalize session, commit scores, & return report | `200 OK` |

---

## 1. Role Discovery: `GET /api/roles`

Retrieves all configured interview tracks with domain metadata and category tags.

- **Request**: `GET /api/roles`
- **Headers**: `Accept: application/json`
- **Response `200 OK`**:
```json
[
  {
    "id": "software_engineer",
    "title": "Software Engineer",
    "description": "Distributed systems, system design, algorithm concurrency",
    "categories": ["technical", "behavioral"]
  },
  {
    "id": "marketing_executive",
    "title": "Marketing Executive",
    "description": "Growth strategy, brand positioning, campaign analytics",
    "categories": ["strategic", "behavioral"]
  },
  {
    "id": "hr_general",
    "title": "HR & General Professional",
    "description": "Talent acquisition, organizational culture, conflict resolution",
    "categories": ["behavioral", "situational"]
  }
]
```

---

## 2. Session Initialization: `POST /api/sessions/start`

Creates a new session in SQLite, allocates the question set, and returns the first question prompt.

- **Request**: `POST /api/sessions/start`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "role_id": "software_engineer",
  "interview_type": "technical",
  "num_questions": 3,
  "language": "en"
}
```
- **Response `200 OK`**:
```json
{
  "session_id": "f0d0d517-87d2-466c-8acf-8a2e3eb36d43",
  "role_id": "software_engineer",
  "role_title": "Software Engineer",
  "language": "en",
  "total_questions": 3,
  "first_question": {
    "id": "swe_tech_01",
    "role": "software_engineer",
    "type": "technical",
    "question": "Can you explain the core principles of Object-Oriented Programming (OOP) and give a brief real-world example of Polymorphism?",
    "time_limit_sec": 90,
    "expected_points": [
      "Mention the 4 pillars: Encapsulation, Abstraction, Inheritance, Polymorphism",
      "Briefly explain Encapsulation (data hiding) and Inheritance (code reuse)",
      "Provide a concrete Polymorphism example (e.g., Shape with draw(), or Payment with process())"
    ],
    "model_answer": "The four fundamental principles of OOP are Encapsulation, Abstraction, Inheritance, and Polymorphism..."
  }
}
```

---

## 3. Session Audio STT: `POST /api/sessions/{id}/transcribe`

Ingests recorded candidate audio in WebM Opus format and transcribes it on local CPU using Hugging Face `faster-whisper`.

- **Request**: `POST /api/sessions/{id}/transcribe`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `audio_file`: Binary WebM audio file (`audio/webm`)
  - `language`: Target language code (default: `"en"`)
- **Response `200 OK`**:
```json
{
  "transcript": "The four pillars of object-oriented programming are encapsulation abstraction inheritance and polymorphism...",
  "duration": 17.07,
  "confidence": 0.99,
  "language": "en"
}
```

---

## 4. Multimodal Answer Evaluation: `POST /api/sessions/{id}/evaluate`

Evaluates a single answered question using the 2-Tier Scoring Architecture (Local Heuristic Engine as Primary Scorer, `openrouter/free` as qualitative enhancement).

- **Request**: `POST /api/sessions/{id}/evaluate`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "question_id": "swe_tech_01",
  "transcript": "The four pillars of object-oriented programming are encapsulation abstraction inheritance and polymorphism...",
  "duration_seconds": 17.07,
  "confidence_score": 88.0,
  "language": "en",
  "visionTelemetry": {
    "confidence": 88.0,
    "eye_contact": "Direct",
    "pitch": 1.2,
    "yaw": -0.8
  }
}
```
- **Response `200 OK`**:
```json
{
  "question_id": "swe_tech_01",
  "question_text": "Can you explain the core principles of Object-Oriented Programming...",
  "transcript": "The four pillars of object-oriented programming are...",
  "relevance_score": 8.5,
  "completeness_score": 7.0,
  "structure_score": 7.8,
  "content_score": 74.0,
  "words_count": 36,
  "wpm": 126.5,
  "filler_words": {},
  "filler_total": 0,
  "clarity_score": 100.0,
  "confidence_score": 88.0,
  "overall_question_score": 74.0,
  "feedback": "The candidate correctly identified all four pillars of OOP and provided a solid definition of encapsulation...",
  "improvement_tips": [
    "Dedicate time to explaining each pillar with a concise definition and example.",
    "Always include a concrete real-world example when asked about polymorphism."
  ],
  "model_answer": "The four fundamental principles of OOP are..."
}
```

---

## 5. Performance Dossier Report: `GET /api/sessions/{id}/report`

Synthesizes aggregate scores across all answered questions and compiles top candidate strengths, growth areas, and actionable recommendations.

- **Request**: `GET /api/sessions/{id}/report`
- **Response `200 OK`**:
```json
{
  "session_id": "f0d0d517-87d2-466c-8acf-8a2e3eb36d43",
  "role_id": "software_engineer",
  "role_title": "Software Engineer",
  "created_at": "2026-09-15 13:06",
  "total_questions": 1,
  "overall_score": 74.0,
  "content_score": 44.0,
  "clarity_score": 100.0,
  "confidence_score": 88.0,
  "composure_score": 88.0,
  "is_demo": false,
  "top_strengths": [
    "Clear articulation and steady speaking pace (~119.5 WPM).",
    "High confidence, solid eye contact, and composed delivery.",
    "Minimal use of filler words; highly polished conversational tone."
  ],
  "top_weaknesses": [
    "Answers lacked sufficient depth, structure, or technical specifics."
  ],
  "actionable_recommendations": [
    "Use the STAR Method (Situation, Task, Action, Result) for behavioral questions.",
    "Compare answers against Model Answers to learn industry phrasing."
  ],
  "per_question_results": [ /* QuestionEvaluation items */ ]
}
```

---

## 6. Publication-Grade PDF Dossier: `GET /api/sessions/{id}/pdf`

Compiles and streams a high-density, 2-page publication-grade PDF dossier with institutional headers, readiness tiers, 5-axis competency matrix, and verbatim rubric breakdown.

- **Request**: `GET /api/sessions/{id}/pdf`
- **Response `200 OK`**:
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename="interview_dossier_software_engineer_f0d0d517.pdf"`
  - `Body`: Binary PDF stream (ReportLab 5.0 vector format with `%PDF-1.4` magic bytes).

---

## 7. Historical Session Archive: `GET /api/sessions`

Returns paginated historical interview dossiers persisted in SQLite. Supports demonstration tagging via `is_demo`.

- **Request**: `GET /api/sessions?limit=20&offset=0`
- **Query Parameters**:
  - `limit`: Number of sessions per page (default: `20`)
  - `offset`: Offset index (default: `0`)
- **Response `200 OK`**:
```json
{
  "total": 13,
  "sessions": [
    {
      "id": "f0d0d517-87d2-466c-8acf-8a2e3eb36d43",
      "session_id": "f0d0d517-87d2-466c-8acf-8a2e3eb36d43",
      "role_id": "software_engineer",
      "role_title": "Software Engineer",
      "created_at": "2026-09-15 13:06",
      "overall_score": 74.0,
      "content_score": 44.0,
      "clarity_score": 100.0,
      "confidence_score": 88.0,
      "composure_score": 88.0,
      "status": "completed",
      "is_demo": false,
      "total_questions": 1
    },
    {
      "id": "sess-demo-swe-01",
      "session_id": "sess-demo-swe-01",
      "role_id": "software_engineer",
      "role_title": "Software Engineer",
      "created_at": "2026-08-20 10:15",
      "overall_score": 88.4,
      "content_score": 90.0,
      "clarity_score": 85.0,
      "confidence_score": 90.0,
      "composure_score": 90.0,
      "status": "completed",
      "is_demo": true,
      "total_questions": 3
    }
  ]
}
```

---

## 8. Session Finalization: `POST /api/sessions/{id}/end`

Formally concludes an active session, aggregates final score metrics into the database, and returns the finalized `SessionReport`.

- **Request**: `POST /api/sessions/{id}/end`
- **Response `200 OK`**: Identical schema to `GET /api/sessions/{id}/report`.
