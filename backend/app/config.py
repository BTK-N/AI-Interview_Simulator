import os
from pathlib import Path
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "AI-Based Interview Simulator (HR Bot)")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    OPENROUTER_FALLBACK_MODEL: str = os.getenv("OPENROUTER_FALLBACK_MODEL", "meta-llama/llama-3-8b-instruct:free")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./interview_simulator.db")
    
    # Scoring weights
    WEIGHT_CONFIDENCE: float = float(os.getenv("WEIGHT_CONFIDENCE", "0.30"))
    WEIGHT_CLARITY: float = float(os.getenv("WEIGHT_CLARITY", "0.30"))
    WEIGHT_CONTENT: float = float(os.getenv("WEIGHT_CONTENT", "0.40"))
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secret-key-for-jwt-token")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Demo Mode (seed sample historical sessions if DB empty)
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")

settings = Settings()
