import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import SessionLocal, init_db, seed_data
from server.routers import config, dashboard, quotes, submissions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and Seed Data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Facultative Reinsurance Submission & Underwriting API",
    description="REST API for specialty facultative reinsurance intake, risk scoring, underwriting queue, and dashboard analytics.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware (MANDATORY)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(submissions.router)
app.include_router(quotes.router)
app.include_router(dashboard.router)
app.include_router(config.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "facultative-reinsurance-portal"}


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Facultative Reinsurance Submission & Underwriting API",
        "docs_url": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
