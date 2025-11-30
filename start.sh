#!/bin/bash
set -e

# Navigate to backend directory
cd backend || exit 1

# Install dependencies only if uvicorn is missing
if ! python3 -m pip show uvicorn >/dev/null 2>&1; then
    echo "Installing required Python packages..."
    python3 -m pip install fastapi uvicorn pydantic gdown py7zr
fi

# Set the port (change this value if needed)
UVICORN_PORT=8000

echo "Starting server at http://localhost:$UVICORN_PORT ..."

# Open the browser (Linux desktop)
if command -v xdg-open >/dev/null; then
    xdg-open "http://localhost:$UVICORN_PORT" >/dev/null 2>&1 &
fi

# Start uvicorn
python3 -m uvicorn main:app --reload --port "$UVICORN_PORT"
