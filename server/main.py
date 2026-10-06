import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data, SessionLocal
from server.routers import kpis, skus, scenarios, assortment_plans


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed default data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Backend decision-support API for Dollar General category managers optimizing Snacks assortments in Small Town Value Cluster stores.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS Middleware
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
allowed_origins = [
    origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(kpis.router)
app.include_router(skus.router)
app.include_router(scenarios.router)
app.include_router(assortment_plans.router)


@app.get("/")
def root():
    return {
        "name": "DG Cluster Assortment Advisor API",
        "version": "1.0.0",
        "status": "online",
        "cluster": "STV-042 (Small Town Value Cluster)",
        "category": "Snacks",
    }


@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy"}
