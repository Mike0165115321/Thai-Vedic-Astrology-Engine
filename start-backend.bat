@echo off
echo Starting Backend...
cd backend
call venv\Scripts\activate
uvicorn api.main:app --reload --port 8000