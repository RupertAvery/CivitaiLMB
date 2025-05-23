@echo off
pushd backend
call pip install --upgrade pip setuptools
call pip install pydantic fastapi gdown py7zr
REM To change the port, uncomment the line below and specify the desired port
SET UVICORN_PORT=8000
ECHO Starting server...
call start http://localhost:%UVICORN_PORT%
call uvicorn main:app --reload --port %UVICORN_PORT%
popd