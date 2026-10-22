"""Main FastAPI application entry point."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, SessionLocal, seed_data
from server.routers.sdlc import router as sdlc_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="SDLC Lifecycle Management Platform API",
    description="Centralized automated SDLC orchestration, tracking, and governance platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sdlc_router)


@app.get("/health", response_model=dict, tags=["Health"])
def health_check():
    """Liveness and readiness health probe."""
    return {"status": "UP", "service": "sdlc-platform-backend"}


@app.get("/api/v1/health", response_model=dict, tags=["Health"])
def api_health_check():
    """API health check endpoint."""
    return {"status": "UP", "version": "1.0.0"}


@app.get("/", response_model=dict, tags=["Root"])
def root():
    """Root platform metadata endpoint."""
    return {
        "platform": "SDLC Assistant Platform",
        "description": "End-to-End Automated SDLC Lifecycle Management Platform",
        "docs_url": "/docs",
    }
