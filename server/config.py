import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/facultative_reinsurance.db")
JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "dev-secret-key-facultative-reinsurance-2026"
)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
