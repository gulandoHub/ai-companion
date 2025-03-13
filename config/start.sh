#!/bin/bash

# Store the config directory path
CONFIG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$CONFIG_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Copy example env file if .env doesn't exist in config directory
if [ ! -f "$CONFIG_DIR/.env" ]; then
    cp .env.example "$CONFIG_DIR/.env"
    echo "Created .env file in config directory. Please update it with your configuration."
fi

# Initialize the database
export PYTHONPATH=$PYTHONPATH:$(pwd)
alembic upgrade head

# Start the backend server in the background
uvicorn app.main:app --reload --port 8000 &

# Install frontend dependencies and start the frontend server
cd ../frontend
npm install
npm start
