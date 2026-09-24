import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db
from server.routers.clusters import router as clusters_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial data
    init_db()
    yield


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    version="1.0.0",
    description="Decision-support platform for Dollar General Snacks assortment optimization in Small Town Value Clusters.",
    lifespan=lifespan,
)

# CORS configuration
ALLOWED_ORIGINS_ENV = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
ALLOWED_ORIGINS = [
    origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(clusters_router)


@app.get("/health", tags=["health"])
@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {
        "status": "healthy",
        "service": "dg-cluster-assortment-advisor-api",
        "version": "1.0.0",
    }


@app.get("/", tags=["root"])
def root():
    return {
        "message": "Welcome to DG Cluster Assortment Advisor API",
        "docs_url": "/docs",
        "health_url": "/health",
    }
