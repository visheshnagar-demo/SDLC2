import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data
from server.routers import scenarios, cases, health, rules, pricing, quotes, bind


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

# Include Health Router
app.include_router(health.router)

# Include Routers with standard prefix /api/v1/qtb
app.include_router(scenarios.router, prefix="/api/v1/qtb/scenarios")
app.include_router(cases.router, prefix="/api/v1/qtb/cases")
app.include_router(rules.router, prefix="/api/v1/qtb/business-rules")
app.include_router(rules.router, prefix="/api/v1/qtb/rules")
app.include_router(pricing.router, prefix="/api/v1/qtb/pricing")
app.include_router(quotes.router, prefix="/api/v1/qtb/quotes")
app.include_router(bind.router, prefix="/api/v1/qtb/bind")

# Include Routers with /api/v1 prefix alias
app.include_router(scenarios.router, prefix="/api/v1/scenarios")
app.include_router(cases.router, prefix="/api/v1/cases")
app.include_router(rules.router, prefix="/api/v1/business-rules")
app.include_router(rules.router, prefix="/api/v1/rules")
app.include_router(pricing.router, prefix="/api/v1/pricing")
app.include_router(quotes.router, prefix="/api/v1/quotes")
app.include_router(bind.router, prefix="/api/v1/bind")

# Include Routers at root level alias (/scenarios, /cases, /business-rules, /rules, /pricing, /quotes, /bind)
app.include_router(scenarios.router, prefix="/scenarios")
app.include_router(cases.router, prefix="/cases")
app.include_router(rules.router, prefix="/business-rules")
app.include_router(rules.router, prefix="/rules")
app.include_router(pricing.router, prefix="/pricing")
app.include_router(quotes.router, prefix="/quotes")
app.include_router(bind.router, prefix="/bind")


@app.get("/")
def root():
    return {
        "message": "Gen Re Quote-to-Bind (QTB) Prototype API",
        "docs_url": "/docs",
        "version": "1.0.0",
        "status": "ok",
    }
