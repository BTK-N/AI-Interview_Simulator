from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models.database import init_db
from .api.router import api_router

# Initialize database schema on boot
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Multimodal AI Interview Simulator Backend with OpenRouter LLM, Speech & Confidence Analysis"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite dev server on any port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "llm_model": settings.OPENROUTER_MODEL
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

