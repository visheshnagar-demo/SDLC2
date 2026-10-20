import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./genre_app.db")
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    )
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
    TESTING: bool = os.getenv("TESTING", "false").lower() in ("true", "1", "yes")
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "/tmp/genre_documents")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
