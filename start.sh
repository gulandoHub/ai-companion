#!/bin/bash

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Copy example env file if .env doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please update it with your configuration."
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
