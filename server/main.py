import os
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal
from server.routers import auth, submissions, underwriting, decisions
from server.schemas import DeclineReason
from server.routers.submissions import DECLINE_REASONS


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Facultative Reinsurance Intake Portal & Underwriter Review Queue API",
    version="1.0.0",
    description="Automated intake, risk scoring, missing info flagging, and decision recording for Cyber & D&O facultative reinsurance requests.",
    lifespan=lifespan,
)

# CORS Middleware (MANDATORY for fullstack projects)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(submissions.router)
app.include_router(underwriting.router)
app.include_router(decisions.router)


@app.get(
    "/api/v1/decline-reasons", response_model=List[DeclineReason], tags=["underwriting"]
)
@app.get("/decline-reasons", response_model=List[DeclineReason], tags=["underwriting"])
def get_global_decline_reasons():
    return [DeclineReason(**r) for r in DECLINE_REASONS]


@app.get("/health", tags=["health"])
@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {
        "status": "healthy",
        "service": "facultative-reinsurance-backend",
        "version": "1.0.0",
    }
