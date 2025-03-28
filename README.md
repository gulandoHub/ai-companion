# Financial Recommendation System

A financial advisory system built with FastAPI, React, and PostgreSQL that provides personalized financial recommendations and market insights.

## Features

- **AI-Powered Financial Advice**: Leverages OpenAI's GPT models to provide recommendations on stocks, trading, and cryptocurrency
- **Conversation Management**: Create, name, and manage multiple chat sessions
- **User Authentication**: Secure login and registration system
- **Model Fine-Tuning**: Support for fine-tuning the AI model with financial data
- **Responsive UI**: Works on desktop and mobile devices

## Project Structure

```
financial-advisor/
├── backend/                # FastAPI backend
│   ├── app/                # Application code
│   │   ├── core/           # Core settings and configuration
│   │   ├── models/         # Database models
│   │   ├── routers/        # API routes
│   │   └── schemas/        # Pydantic schemas
│   ├── alembic/            # Database migrations
│   └── data/               # Training data for fine-tuning
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # UI components
│       ├── context/        # React context providers
│       ├── pages/          # Page components
│       └── services/       # API service layer
├── config/                 # Configuration files and scripts
│   ├── docker-compose.yml  # Docker configuration
│   ├── docker-start.sh     # Docker startup script
│   └── start.sh            # Local development startup script
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL
- OpenAI API key
- Docker and Docker Compose (for containerized setup)

## Setup Instructions

### Option 1: Docker Setup (Recommended)

The easiest way to run the application is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd financial-advisor

# Create .env file in the config directory with:
DATABASE_URL=postgresql://postgres:postgres@db:5432/financial_advisor
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key

# Start the application using Docker
cd config
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

#### 1. Database Setup

```bash
# Login to PostgreSQL as postgres user
sudo -i -u postgres

# Enter PostgreSQL command prompt
psql

# In PostgreSQL prompt, run:
ALTER USER postgres WITH PASSWORD 'postgres';
CREATE DATABASE financial_advisor;
GRANT ALL PRIVILEGES ON DATABASE financial_advisor TO postgres;

# Exit PostgreSQL prompt
\q
```

#### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up environment variables
# Create .env file in backend directory with:
DATABASE_URL=postgresql://postgres:postgres@localhost/financial_advisor
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start frontend development server
npm start
```

## API Endpoints

- **Authentication**:
  - POST `/api/auth/register` - Register new user
  - POST `/api/auth/token` - Login and get access token

- **User**:
  - GET `/api/users/me` - Get current user profile
  - PUT `/api/users/me` - Update user profile

- **Chat**:
  - POST `/api/chat/conversations` - Create new conversation
  - GET `/api/chat/conversations` - List user's conversations
  - POST `/api/chat/{conversation_id}/messages` - Send message
  - GET `/api/chat/{conversation_id}/messages` - Get conversation messages
  - DELETE `/api/chat/conversations/{conversation_id}` - Delete conversation
  - PATCH `/api/chat/conversations/{conversation_id}/name` - Update conversation name

- **Fine Tuning**:
  - POST `/api/fine-tune` - Start fine-tuning process
  - GET `/api/fine-tune/{fine_tune_id}/status` - Check fine-tuning status

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
   - Verify API URL in frontend configuration (default is http://localhost:8000/api)
   - Check browser console for CORS errors

## Security Notes

- Never commit `.env` files containing sensitive information
- Keep your OpenAI API key secure
- Regularly update dependencies for security patches
- Use strong passwords for database access

## Development Workflow

To contribute to this project:

1. Create a feature branch from main
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[MIT License](LICENSE)
