import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, SessionLocal, seed_data
from server.routers.assortment import router as assortment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & seed data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Decision-support API for Dollar General category managers for Small Town Value Cluster stores.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
raw_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
allowed_origins = [
    origin.strip() for origin in raw_origins.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(assortment_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "DG Cluster Assortment Advisor",
        "version": "1.0.0",
    }


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "DG Cluster Assortment Advisor API is running",
        "docs_url": "/docs",
    }
