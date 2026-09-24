import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_database
from server.api.v1 import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Idempotent DB initialization and initial seeding
    init_db()
    seed_database()
    yield


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Backend decision-support API for Dollar General Snacks Assortment in Small Town Value Clusters",
    version="1.0.0",
    lifespan=lifespan,
)

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

app.include_router(api_v1_router)


@app.get("/")
def root():
    return {
        "app": "DG Cluster Assortment Advisor API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
