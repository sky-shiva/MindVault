@echo off
echo ========================================================
echo Starting MindVault Next.js Frontend (Port 3000)
echo ========================================================
cd /d "%~dp0\..\frontend"
npm run dev
pause
