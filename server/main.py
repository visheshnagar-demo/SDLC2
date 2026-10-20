import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db
from server.routers.quotes import router as quotes_router
from server.routers.risks import router as risks_router
from server.routers.binders import router as binders_router
from server.routers.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed data
    init_db()
    yield


app = FastAPI(
    title="Gen Re QTB Backend",
    description="Gen Re Quote to Bind (QTB) Static Web Prototype API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware configuration
allowed_origins_raw = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
)
ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(quotes_router)
app.include_router(risks_router)
app.include_router(binders_router)
app.include_router(health_router)


@app.get("/")
def root():
    return {
        "message": "Gen Re QTB Prototype API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
