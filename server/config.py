import os
from typing import List


class Settings:
    PROJECT_NAME: str = "Facultative Reinsurance Submission & Underwriting Portal"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////tmp/app.db")
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", "dev-secret-change-in-production-1234567890"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )
    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
        ).split(",")
        if origin.strip()
    ]
    UNDERWRITER_DEFAULT_AUTHORITY_LIMIT: float = float(
        os.getenv("UNDERWRITER_DEFAULT_AUTHORITY_LIMIT", "5000000.0")
    )
    MANAGER_DEFAULT_AUTHORITY_LIMIT: float = float(
        os.getenv("MANAGER_DEFAULT_AUTHORITY_LIMIT", "50000000.0")
    )
    SLA_WARNING_HOURS: float = float(os.getenv("SLA_WARNING_HOURS", "24.0"))
    SLA_BREACH_HOURS: float = float(os.getenv("SLA_BREACH_HOURS", "48.0"))


settings = Settings()
