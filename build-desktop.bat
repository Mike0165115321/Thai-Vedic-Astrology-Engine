@echo off
echo Starting Desktop App Build Process...
echo =======================================

:: Kill any running instances to prevent file lock errors
echo Closing running application...
taskkill /F /IM "Aetox Astro.exe" /T >nul 2>&1
taskkill /F /IM "backend.exe" /T >nul 2>&1
timeout /t 2 /nobreak >nul

:: 1. Build Backend with PyInstaller
echo [1/4] Building Backend...
cd backend
call venv\Scripts\activate
pip install pyinstaller
pyinstaller -y backend.spec
if %ERRORLEVEL% neq 0 (
    echo Backend build failed!
    exit /b %ERRORLEVEL%
)
cd ..

:: 2. Build Frontend
echo [2/4] Building Frontend...
cd frontend
call npm install --legacy-peer-deps
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Frontend build failed!
    exit /b %ERRORLEVEL%
)
cd ..

:: 3. Prepare Electron Resources
echo [3/4] Preparing Electron Resources...
if not exist "electron\resources" mkdir "electron\resources"
if not exist "electron\resources\backend-dist" mkdir "electron\resources\backend-dist"
if not exist "electron\resources\frontend-out" mkdir "electron\resources\frontend-out"

:: Clear old resources
del /q /s "electron\resources\*"

:: Copy Backend Dist
xcopy /E /I /Y "backend\dist\backend" "electron\resources\backend-dist\backend"

:: Copy Frontend Out
xcopy /E /I /Y "frontend\out" "electron\resources\frontend-out"

:: Copy icon if exists in public
if exist "frontend\public\icon.png" (
    copy /Y "frontend\public\icon.png" "electron\resources\frontend-out\icon.png"
)

:: 4. Build Electron App
echo [4/4] Building Electron App...
cd electron
call npm install
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Electron build failed!
    exit /b %ERRORLEVEL%
)
cd ..

echo =======================================
echo Build Complete! Installer should be in electron\dist folder.
pause
