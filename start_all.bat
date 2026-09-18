@echo off
REM Starts the full Vehicle Service Management System stack:
REM   1. PostgreSQL (uses a local server if one is running, else Docker Compose)
REM   2. FastAPI backend  - creates its venv on first run, sets up the database
REM   3. React frontend   - installs node_modules on first run
REM The backend and frontend each run in their own window so you can read their logs.

setlocal
cd /d "%~dp0"

echo ============================================
echo  Vehicle Service Management System - Startup
echo ============================================

echo.
echo [1/3] Database...
REM A local PostgreSQL on 5432 is used as-is; otherwise fall back to Docker Compose.
netstat -an | findstr "LISTENING" | findstr ":5432" >nul 2>&1
if not errorlevel 1 (
    echo   PostgreSQL already listening on port 5432 - using it.
) else (
    where docker >nul 2>&1
    if errorlevel 1 (
        echo   WARNING: nothing is listening on port 5432 and Docker was not found.
        echo   Install/start PostgreSQL, or install Docker Desktop, then run this again.
    ) else (
        echo   Starting the postgres container...
        docker compose up -d
    )
)

echo.
echo [2/3] Backend...
if not exist "backend\venv\Scripts\activate.bat" (
    echo   Creating the Python virtual environment ^(first run only^)...
    py -3 -m venv backend\venv
    if errorlevel 1 (
        echo   ERROR: could not create the venv. Is Python 3 installed and on PATH?
        pause
        exit /b 1
    )
    echo   Installing Python dependencies...
    backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
)
start "VSMS Backend" cmd /k "%~dp0backend\run_backend.bat"

echo.
echo [3/3] Frontend...
start "VSMS Frontend" cmd /k "%~dp0frontend\run_frontend.bat"

echo.
echo ============================================
echo   Backend    http://localhost:8000
echo   API docs   http://localhost:8000/docs
echo   Frontend   http://localhost:5173
echo.
echo   No sign-in needed - pick the Customer or
echo   Mechanic portal on the entry screen.
echo ============================================
echo.
endlocal
