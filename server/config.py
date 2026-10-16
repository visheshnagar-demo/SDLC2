import os
from typing import List


class Settings:
    PROJECT_NAME: str = "Facultative Reinsurance Web Portal"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////tmp/fac_reinsurance.db")
    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
        ).split(",")
        if origin.strip()
    ]
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/tmp/fac_uploads")


settings = Settings()
