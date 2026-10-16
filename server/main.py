import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data
from server.routers import submissions, underwriting, decisions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and default seed data
    init_db()
    seed_data()
    yield


app = FastAPI(
    title="Facultative Reinsurance Web Portal API",
    description="Backend API for Cyber and D&O facultative reinsurance submissions, risk scoring, missing info checks, and underwriter decision recording.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
allowed_origins_raw = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
allowed_origins = [
    origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(submissions.router)
app.include_router(underwriting.router)
app.include_router(decisions.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "facultative-reinsurance-backend",
        "version": "1.0.0",
    }


@app.get("/ready", tags=["Health"])
def readiness_check():
    return {"status": "ready", "database": "connected"}


@app.get("/", tags=["Root"])
def root_info():
    return {
        "message": "Welcome to Facultative Reinsurance Web Portal API",
        "docs_url": "/docs",
        "health_url": "/health",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=True)
