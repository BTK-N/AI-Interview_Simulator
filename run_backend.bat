@echo off
title HR Bot - FastAPI Backend Server
cd /d "%~dp0backend"
echo Starting AI Interview Simulator Backend on http://127.0.0.1:8000 ...
".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
pause
