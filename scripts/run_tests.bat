@echo off
echo ========================================================
echo Running MindVault Automated Test Suite
echo ========================================================
cd /d "%~dp0\.."
call backend\venv\Scripts\activate.bat
pytest tests\test_backend.py -v -W ignore::DeprecationWarning
pause
