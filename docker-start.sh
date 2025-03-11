#!/bin/bash

# Build and start all containers
docker-compose up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Run database migrations (if needed)
echo "Running database migrations..."
docker-compose exec backend alembic upgrade head

echo "AI Companion is now running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000/api"
echo "To stop the services, run: docker-compose down" 