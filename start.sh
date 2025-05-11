#!/bin/bash

# Navigate to backend directory
cd backend || exit

# Install Python dependencies
pip install pydantic typing fastapi gdown py7zr

# Set the port (change this value as needed)
UVICORN_PORT=8000

echo "Starting server..."
xdg-open "http://localhost:$UVICORN_PORT" >/dev/null 2>&1 &

# Start the uvicorn server
uvicorn main:app --reload --port "$UVICORN_PORT"

# Return to previous directory (not necessary if the script ends here)
cd ..