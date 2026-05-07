@echo off
echo Setting up Thai-Vedic Astro Engine...

:: Backend setup
echo [1/4] Creating Python venv...
cd backend
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt

:: Frontend setup
echo [3/4] Installing Node dependencies...
cd ..\frontend
npm install

echo [4/4] Done!
echo Run start.bat to launch the project
pause