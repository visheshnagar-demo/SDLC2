import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import SessionLocal, init_db, seed_data
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dg_assortment_advisor")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database schema and initial seed data...")
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    logger.info("Startup complete.")
    yield
    logger.info("Application shutdown.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="DG Cluster Assortment Advisor Decision-Support REST API",
    lifespan=lifespan,
)

# CORS Middleware (Constitution Section 5.4)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/healthz", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )
