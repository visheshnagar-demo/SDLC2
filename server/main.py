import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal
from server.routers import submissions, queue, scoring, decisions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed sample data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Facultative Reinsurance Gateway API",
    description="Portal for carrier facultative reinsurance submissions and underwriter review queue.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(submissions.router)
app.include_router(queue.router)
app.include_router(scoring.router)
app.include_router(decisions.router)


@app.get("/healthz", tags=["Health"])
@app.get("/livez", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "facultative-reinsurance-backend",
        "version": "1.0.0",
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Facultative Reinsurance Submission Portal and Underwriter Review Queue API",
        "docs_url": "/docs",
        "health_check": "/healthz",
    }
