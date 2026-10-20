from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.config import settings
from server.database import init_db, seed_data, SessionLocal
from server.routers import (
    auth_router,
    submissions_router,
    scoring_router,
    decisions_router,
    quotes_router,
    analytics_router,
    config_router,
    audit_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Facultative Reinsurance Submission & Underwriting Portal API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware (MANDATORY for full-stack integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(submissions_router)
app.include_router(scoring_router)
app.include_router(decisions_router)
app.include_router(quotes_router)
app.include_router(analytics_router)
app.include_router(config_router)
app.include_router(audit_router)


@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
