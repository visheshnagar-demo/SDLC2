import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data
from server.routers import quotes, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed sample data
    init_db()
    seed_data()
    yield


app = FastAPI(
    title="Motor Insurance Premium Calculator API",
    description="RESTful API for instant motor insurance premium calculation and itemized factor breakdown",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api/v1 prefix
app.include_router(health.router, prefix="/api/v1")
app.include_router(quotes.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "service": "Motor Insurance Premium Calculator API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_prefix": "/api/v1",
        "endpoints": {
            "calculate_quote": "POST /api/v1/quotes/calculate",
            "list_quotes": "GET /api/v1/quotes",
            "get_quote": "GET /api/v1/quotes/{id}",
            "quote_stats": "GET /api/v1/quotes/stats",
            "health": "GET /api/v1/health"
        }
    }
