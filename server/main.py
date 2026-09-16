import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal
from server.routers.kpi_router import router as kpi_router
from server.routers.sku_router import router as sku_router
from server.routers.scenario_router import router as scenario_router
from server.routers.plan_router import router as plan_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed data idempotently on startup
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Decision-support tool for Dollar General category managers evaluating Snacks assortment for Small Town Value Cluster stores.",
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

# Register Routers
app.include_router(kpi_router)
app.include_router(sku_router)
app.include_router(scenario_router)
app.include_router(plan_router)


@app.get("/")
def root_endpoint():
    return {
        "service": "DG Cluster Assortment Advisor API",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
    }


@app.get("/health")
@app.get("/api/v1/health")
def healthcheck():
    return {"status": "healthy"}
