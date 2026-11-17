import os
from typing import List


class Settings:
    PROJECT_NAME: str = "Facultative Reinsurance Web Portal"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./reinsurance.db")
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", "dev-secret-key-change-in-production-bfsi-2026"
    )
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )

    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")


settings = Settings()
