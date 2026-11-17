import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./identity.db")
if os.getenv("TESTING", "false").lower() == "true":
    DATABASE_URL = "sqlite:///:memory:"

JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "dev-secret-change-in-production-aegis-trust-2026"
)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    if origin.strip()
]

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
