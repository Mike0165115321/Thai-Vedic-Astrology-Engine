@echo off
echo Starting Thai-Vedic Astro Engine...

:: Start Backend
start "Backend - FastAPI" cmd /k "cd backend && call venv\Scripts\activate && uvicorn api.main:app --reload --port 8000"

:: Start Frontend
start "Frontend - Next.js" cmd /k "cd frontend && npm run dev"

echo.
echo Backend  → http://localhost:8000
echo Frontend → http://localhost:3000
echo API Docs → http://localhost:8000/docs
echo.
pause