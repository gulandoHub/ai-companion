# AI Companion Application

An AI-powered companion application built with FastAPI, React, and PostgreSQL that provides psychological support through AI interactions.

## Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL
- OpenAI API key
- Docker and Docker Compose (for containerized setup)

## Project Structure

```
ai-companion/
├── backend/           # FastAPI backend
├── frontend/         # React frontend
├── venv/            # Python virtual environment
├── docker-compose.yml # Docker configuration
└── README.md
```

## Setup Instructions

### Option 1: Docker Setup (Recommended)

The easiest way to run the application is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd ai-companion

# Create .env file in the root directory with:
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key

# Start the application using Docker
./docker-start.sh

# Alternatively, you can run:
docker-compose up -d --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

To stop the Docker containers:
```bash
docker-compose down
```

### Option 2: Manual Setup

### 1. Database Setup

```bash
# Login to PostgreSQL as postgres user
sudo -i -u postgres

# Enter PostgreSQL command prompt
psql

# In PostgreSQL prompt, run:
ALTER USER postgres WITH PASSWORD 'postgres';
CREATE DATABASE ai_companion;
GRANT ALL PRIVILEGES ON DATABASE ai_companion TO postgres;

# Exit PostgreSQL prompt
\q
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up environment variables
# Create .env file in backend directory with:
DATABASE_URL=postgresql://postgres:postgres@localhost/ai_companion
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start frontend development server
npm start
```

## Running the Application

1. **Start Backend**:
```bash
cd backend
source ../venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

2. **Start Frontend**:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Database Management

### Accessing PostgreSQL Database

```bash
# Connect to PostgreSQL
sudo -i -u postgres
psql ai_companion

# Useful PostgreSQL commands:
\dt             # List all tables
\d table_name   # Describe table structure
\q              # Quit PostgreSQL

# Example queries:
SELECT * FROM users;
SELECT * FROM conversations;
SELECT * FROM messages;
```

### Running Migrations

```bash
cd backend
source ../venv/bin/activate
alembic upgrade head          # Apply all migrations
alembic downgrade -1         # Rollback last migration
alembic revision -m "description"  # Create new migration
```

## API Endpoints

- **Authentication**:
  - POST `/api/auth/register` - Register new user
  - POST `/api/auth/token` - Login and get access token

- **Chat**:
  - POST `/api/chat/conversations` - Create new conversation
  - GET `/api/chat/conversations` - List user's conversations
  - POST `/api/chat/{conversation_id}/messages` - Send message
  - GET `/api/chat/{conversation_id}/messages` - Get conversation messages

## Troubleshooting

1. **Database Connection Issues**:
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check database credentials in `.env` file
   - Ensure database exists: `psql -U postgres -l`

2. **OpenAI API Issues**:
   - Verify API key in `.env` file
   - Check API key has sufficient credits
   - Verify network connectivity

3. **Frontend Connection Issues**:
   - Check if backend is running and accessible
   - Verify API URL in frontend configuration
   - Check browser console for CORS errors

## Security Notes

- Never commit `.env` files containing sensitive information
- Keep your OpenAI API key secure
- Regularly update dependencies for security patches
- Use strong passwords for database access

## Development Note

This project has been developed entirely through prompt engineering and configuration, without writing traditional code manually. The entire codebase was generated using:
- Carefully crafted prompts
- AI-assisted development
- Configuration management
- System architecture design through prompts

Development Environment:
- Cursor AI-powered IDE
- WindSurf AI-powered IDE

This approach demonstrates the potential of AI-assisted development in creating full-stack applications efficiently while maintaining high code quality and following best practices.
