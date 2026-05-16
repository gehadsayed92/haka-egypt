"""
Cilantro CEO Tool - FastAPI Application Entry Point

Start with:
    uvicorn main:app --reload --port 8000

API docs available at:
    http://localhost:8000/docs (Swagger UI)
    http://localhost:8000/redoc (ReDoc)
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db
from routers import health, data_ingestion, insights

# ─── Logging ──────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# ─── App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "A CEO-level decision engine for Cilantro coffee retail chain. "
        "Aggregates financial and operational data, highlights risks and "
        "opportunities, and delivers clear daily action items."
    ),
    version="1.0.0-mvp",
)

# CORS — allow the Next.js frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in dev; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────

app.include_router(health.router)
app.include_router(data_ingestion.router)
app.include_router(insights.router)


# ─── Startup ──────────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    """Initialize database tables on first run."""
    init_db()
    logging.info(f"{settings.APP_NAME} started.")
    logging.info(f"POS integration: {'enabled' if settings.POS_ENABLED else 'disabled (CSV fallback)'}")
    if not settings.API_KEYS:
        logging.warning(
            "No API keys configured! Set CEO_TOOL_API_KEYS env variable. "
            "All authenticated endpoints will return 500."
        )


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
        "morning_brief": "/api/v1/insights/morning-brief",
    }
