import uuid
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Float, Integer, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from ..config import settings

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBUser(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, default="Candidate")
    is_guest = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sessions = relationship("DBSession", back_populates="user")

class DBSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    role_id = Column(String, nullable=False)
    role_title = Column(String, nullable=False)
    interview_type = Column(String, default="all")
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    overall_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    clarity_score = Column(Float, default=0.0)
    content_score = Column(Float, default=0.0)
    status = Column(String, default="in_progress")  # in_progress, completed
    is_demo = Column(Integer, default=0)  # 1 for sample fixtures, 0 for live user sessions
    
    user = relationship("DBUser", back_populates="sessions")
    answers = relationship("DBAnswer", back_populates="session", cascade="all, delete-orphan")

class DBAnswer(Base):
    __tablename__ = "session_answers"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("interview_sessions.id"), nullable=False)
    question_id = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    transcript = Column(Text, default="")
    duration_seconds = Column(Float, default=0.0)
    
    relevance_score = Column(Float, default=0.0)
    completeness_score = Column(Float, default=0.0)
    structure_score = Column(Float, default=0.0)
    content_score = Column(Float, default=0.0)
    clarity_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    
    feedback = Column(Text, default="")
    improvement_tips = Column(Text, default="[]")  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("DBSession", back_populates="answers")

def seed_demo_sessions(db):
    """Seeds 4 realistic historical benchmark sessions spread across prior 4 weeks."""
    demo_count = db.query(DBSession).filter(DBSession.is_demo == 1).count()
    if demo_count > 0:
        return

    sample_sessions = [
        {
            "id": "sess-demo-swe-01",
            "role_id": "software_engineer",
            "role_title": "Software Engineer",
            "created_at": datetime(2026, 8, 20, 14, 22, 0),
            "overall_score": 74.5,
            "content_score": 72.0,
            "clarity_score": 76.0,
            "confidence_score": 78.0,
            "status": "completed",
            "is_demo": 1,
            "answers": [
                {
                    "question_id": "swe_tech_01",
                    "question_text": "Can you explain the core principles of Object-Oriented Programming (OOP) and give a brief real-world example of Polymorphism?",
                    "transcript": "OOP is built on encapsulation, abstraction, inheritance, and polymorphism. For polymorphism, consider a payment processor where different gateways implement the same execute payment method.",
                    "duration_seconds": 38.5,
                    "relevance_score": 8.0,
                    "completeness_score": 7.0,
                    "structure_score": 7.5,
                    "content_score": 75.0,
                    "clarity_score": 76.0,
                    "confidence_score": 78.0,
                    "overall_score": 75.8,
                    "feedback": "Clear explanation of the 4 pillars. Good payment gateway analogy.",
                    "improvement_tips": ["Mention interface-based polymorphism vs class inheritance."]
                }
            ]
        },
        {
            "id": "sess-demo-pm-02",
            "role_id": "product_manager",
            "role_title": "Product Manager",
            "created_at": datetime(2026, 8, 28, 10, 15, 0),
            "overall_score": 81.0,
            "content_score": 83.0,
            "clarity_score": 79.0,
            "confidence_score": 81.0,
            "status": "completed",
            "is_demo": 1,
            "answers": [
                {
                    "question_id": "pm_strat_01",
                    "question_text": "How do you prioritize competing engineering and business requests when roadmap capacity is constrained?",
                    "transcript": "I utilize the RICE framework combined with strategic alignment metrics. We quantify reach and impact against effort, while ensuring core platform reliability SLAs are guarded.",
                    "duration_seconds": 44.0,
                    "relevance_score": 8.5,
                    "completeness_score": 8.2,
                    "structure_score": 8.5,
                    "content_score": 84.0,
                    "clarity_score": 79.0,
                    "confidence_score": 81.0,
                    "overall_score": 81.6,
                    "feedback": "Strong structured prioritization framework with good stakeholder awareness.",
                    "improvement_tips": ["Include a specific example of handling executive escalations."]
                }
            ]
        },
        {
            "id": "sess-demo-ds-03",
            "role_id": "data_scientist",
            "role_title": "Data Scientist",
            "created_at": datetime(2026, 9, 5, 16, 40, 0),
            "overall_score": 84.2,
            "content_score": 86.0,
            "clarity_score": 82.0,
            "confidence_score": 85.0,
            "status": "completed",
            "is_demo": 1,
            "answers": [
                {
                    "question_id": "ds_eval_01",
                    "question_text": "When would you prefer ROC-AUC over Precision-Recall curves in evaluating imbalanced classification systems?",
                    "transcript": "In highly imbalanced regimes like fraud detection where the negative class dominates, ROC-AUC can present an overly optimistic curve because FPR stays low. PR curves directly expose precision trade-offs.",
                    "duration_seconds": 42.0,
                    "relevance_score": 9.0,
                    "completeness_score": 8.5,
                    "structure_score": 8.5,
                    "content_score": 87.0,
                    "clarity_score": 82.0,
                    "confidence_score": 85.0,
                    "overall_score": 84.9,
                    "feedback": "Sharp and accurate breakdown of true positive vs false positive rate distortion in imbalanced datasets.",
                    "improvement_tips": ["Address threshold calibration and cost-matrix integration."]
                }
            ]
        },
        {
            "id": "sess-demo-swe-04",
            "role_id": "software_engineer",
            "role_title": "Software Engineer",
            "created_at": datetime(2026, 9, 12, 11, 5, 0),
            "overall_score": 89.2,
            "content_score": 91.0,
            "clarity_score": 88.0,
            "confidence_score": 88.0,
            "status": "completed",
            "is_demo": 1,
            "answers": [
                {
                    "question_id": "swe_sys_02",
                    "question_text": "Describe how you would design a globally distributed rate limiting tier with low latency overhead.",
                    "transcript": "We implement a token bucket algorithm at the edge API gateway utilizing local in-memory token buffers backed by Redis clusters using sliding window logs with asynchronous batch sync to minimize cross-region latency.",
                    "duration_seconds": 49.0,
                    "relevance_score": 9.5,
                    "completeness_score": 9.0,
                    "structure_score": 9.2,
                    "content_score": 92.5,
                    "clarity_score": 88.0,
                    "confidence_score": 88.0,
                    "overall_score": 89.8,
                    "feedback": "Exceptional architectural clarity. Clear trade-off analysis between local in-memory accuracy and cross-region consensus latency.",
                    "improvement_tips": ["Discuss fallback behavior if the Redis synchronization cluster degrades."]
                }
            ]
        }
    ]

    import json
    for s in sample_sessions:
        ans_data = s.pop("answers")
        session_obj = DBSession(**s)
        db.add(session_obj)
        db.flush()
        for a in ans_data:
            tips = a.pop("improvement_tips", [])
            a["improvement_tips"] = json.dumps(tips)
            ans_obj = DBAnswer(session_id=session_obj.id, **a)
            db.add(ans_obj)
    db.commit()

def init_db():
    Base.metadata.create_all(bind=engine)
    # Self-healing migration for SQLite: ensure newly added columns exist
    with engine.connect() as conn:
        from sqlalchemy import text
        try:
            conn.execute(text("ALTER TABLE interview_sessions ADD COLUMN language VARCHAR DEFAULT 'en'"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE interview_sessions ADD COLUMN is_demo INTEGER DEFAULT 0"))
            conn.commit()
        except Exception:
            pass

    # Conditionally seed historical demo sessions if DEMO_MODE=true
    if settings.DEMO_MODE:
        db = SessionLocal()
        try:
            seed_demo_sessions(db)
        finally:
            db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
