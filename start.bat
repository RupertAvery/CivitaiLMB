@echo off
setlocal

REM --- Set venv directory name ---
set VENV_DIR=venv

REM --- Check if venv exists ---
if not exist "%VENV_DIR%\Scripts\python.exe" (
    echo Virtual environment not found. Creating...
    python -m venv %VENV_DIR%
)

REM --- Activate venv ---
call "%VENV_DIR%\Scripts\activate.bat"

pushd backend

REM --- Install deps only if missing uvicorn ---
pip show uvicorn >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing required packages...
    call pip install fastapi uvicorn pydantic typing gdown py7zr
)

REM Allow overriding port
set UVICORN_PORT=8000

echo Starting server at http://localhost:%UVICORN_PORT% ...

REM --- Open browser ---
start "" "http://localhost:%UVICORN_PORT%"

REM --- Start server ---
call uvicorn main:app --reload --port %UVICORN_PORT%

popd
endlocal