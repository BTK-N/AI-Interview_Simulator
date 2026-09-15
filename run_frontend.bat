@echo off
title HR Bot - React Vite Frontend
cd /d "%~dp0frontend"
echo Starting AI Interview Simulator Frontend on http://localhost:5173 ...
call npm.cmd run dev
pause
