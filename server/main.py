import os
from typing import List
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal
from server.routers.submissions import router as submissions_router
from server.routers.underwriting import router as underwriting_router
from server.schemas.decision import DeclineReason
from server.services.decision_service import DecisionService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed data idempotently
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Facultative Reinsurance Request Portal & Underwriter Review Queue API",
    version="1.0.0",
    description="Online portal for submitting Cyber and D&O facultative requests, risk scoring, missing info flagging, and underwriter decisioning.",
    lifespan=lifespan,
)

# CORS configuration
raw_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
ALLOWED_ORIGINS = [
    origin.strip() for origin in raw_origins.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(submissions_router)
app.include_router(underwriting_router)


@app.get(
    "/api/v1/decline-reasons", response_model=List[DeclineReason], tags=["Underwriting"]
)
def get_root_decline_reasons():
    return DecisionService.get_decline_reasons()


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": "Facultative Reinsurance Portal & Review Queue API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
