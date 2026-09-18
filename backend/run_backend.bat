@echo off
cd /d %~dp0
call venv\Scripts\activate.bat

echo Preparing database...
python init_db.py
if errorlevel 1 (
    echo.
    echo Database setup failed - the API will not be able to serve data.
    echo Start PostgreSQL ^(or run "docker compose up -d" from the project root^) and try again.
    echo.
    pause
    exit /b 1
)

echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
