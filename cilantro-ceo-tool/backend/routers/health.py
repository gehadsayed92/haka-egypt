"""
Cilantro CEO Tool - Health Check Router

No authentication required. Used for monitoring and uptime checks.
"""

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from config import settings
from database import get_db
from services.pos_integration import POSClient

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    System health check. Reports status of all components.

    Returns:
        - database: connected/disconnected
        - pos_api: connected/disconnected/not_configured
        - api_keys_configured: true/false
        - data_freshness: latest data date
    """
    # Check DB
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    # Check POS
    pos_status = "not_configured"
    if settings.POS_ENABLED:
        pos_client = POSClient()
        pos_status = "connected" if pos_client.is_available() else "disconnected"

    return {
        "status": "healthy" if db_ok else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "database": "connected" if db_ok else "disconnected",
            "pos_api": pos_status,
            "api_keys_configured": len(settings.API_KEYS) > 0,
        },
        "version": "1.0.0-mvp",
    }
