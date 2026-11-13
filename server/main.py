import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data
from server.routers import scenarios, cases, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and seed initial scenarios
    init_db()
    seed_data()
    yield


app = FastAPI(
    title="Gen Re Quote-to-Bind (QTB) Mock Service",
    description="Backend API and Agentic Orchestration Engine for Reinsurance QTB Prototype",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
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

# Include Routers
app.include_router(health.router)
app.include_router(scenarios.router)
app.include_router(cases.router)


@app.get("/")
def root():
    return {
        "message": "Gen Re Quote-to-Bind (QTB) Prototype API",
        "docs_url": "/docs",
        "version": "1.0.0",
    }
