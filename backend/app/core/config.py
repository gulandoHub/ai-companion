from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Financial Recommendation System"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost/financial_advisor"
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    OPENAI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
