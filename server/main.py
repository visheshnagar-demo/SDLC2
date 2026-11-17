from contextlib import asynccontextmanager
from typing import List, Dict
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.config import settings
from server.database import init_db, seed_data, SessionLocal
from server.routers import auth_router, submission_router, underwriting_router
from server.schemas.underwriting import DeclineReason
from server.services.underwriting_service import get_decline_reasons


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed database
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Facultative Reinsurance Web Portal: Carrier Request Submission & Underwriter Scoring Review Queue",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware for fullstack integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(submission_router, prefix=settings.API_V1_STR)
app.include_router(underwriting_router, prefix=settings.API_V1_STR)


@app.get(
    "/api/v1/decline-reasons",
    response_model=List[DeclineReason],
    tags=["Underwriting Workbench"],
)
def get_global_decline_reasons():
    """Global alias endpoint returning standardized decline reason codes."""
    return get_decline_reasons()


@app.get("/health", response_model=Dict[str, str], tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", response_model=Dict[str, str], tags=["Root"])
def root_endpoint():
    return {
        "message": "Facultative Reinsurance Web Portal API",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }
