import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.config import settings
from server.database import init_db, SessionLocal
from server.seed import seed_data
from server.routers import (
    kpi_router,
    sku_router,
    scenario_router,
    plan_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kpi_router, prefix=settings.API_V1_PREFIX)
app.include_router(sku_router, prefix=settings.API_V1_PREFIX)
app.include_router(scenario_router, prefix=settings.API_V1_PREFIX)
app.include_router(plan_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "message": "DG Cluster Assortment Advisor API is running",
        "version": settings.VERSION,
        "docs_url": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
