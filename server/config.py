import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Facultative Reinsurance Web Portal"
    API_V1_STR: str = "/api/v1/reinsurance"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./reinsurance.db")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
    TESTING: bool = os.getenv("TESTING", "false").lower() == "true"

    class Config:
        case_sensitive = True


settings = Settings()
