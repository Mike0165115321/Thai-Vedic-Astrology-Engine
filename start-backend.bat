@echo off
echo Starting Backend...
cd backend
venv\Scripts\python.exe -m uvicorn api.main:app --reload --port 8000