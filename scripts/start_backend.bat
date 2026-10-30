@echo off
echo ========================================================
echo Starting MindVault FastAPI Backend Server (Port 8000)
echo ========================================================
cd /d "%~dp0\..\backend"
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
