"""
Cilantro CEO Tool - Insights Router

CEO-facing endpoints. These are the primary interface for the decision engine.
All endpoints require authentication (API key) — minimum 'viewer' role.
"""

from fastapi import APIRouter, Depends, HTTPException, Security, Query
from sqlalchemy.orm import Session

from auth.api_keys import validate_api_key, require_role
from database import get_db
from models import MorningBrief, StoreInsight, AlertSchema, Alert
from services.decision_engine import DecisionEngine

router = APIRouter(prefix="/api/v1/insights", tags=["insights"])


@router.get("/morning-brief", response_model=MorningBrief)
def get_morning_brief(
    db: Session = Depends(get_db),
    _auth: dict = Security(validate_api_key),
):
    """
    CEO Morning Brief — the primary daily decision summary.

    Returns:
    - Yesterday's total revenue + trend
    - Cash position + runway (days)
    - Active alerts (sorted by severity)
    - Per-store health snapshot
    - Top 5 recommended actions

    This endpoint runs all decision rules on each call,
    generating fresh alerts based on current data.

    Example response:
    {
      "date": "2024-01-16",
      "greeting": "Good morning",
      "total_revenue_yesterday": 285000,
      "total_revenue_trend": "up 8%",
      "cash_position": 1250000,
      "cash_runway_days": 42,
      "alerts": [...],
      "store_insights": [...],
      "top_actions": [
        "Investigate Cilantro Maadi: revenue dropped 25% below average",
        "Review supplier pricing — COGS at 38% at Heliopolis branch"
      ],
      "data_freshness": "current"
    }
    """
    engine = DecisionEngine(db)
    return engine.generate_morning_brief()


@router.get("/store/{store_id}", response_model=StoreInsight)
def get_store_insight(
    store_id: int,
    db: Session = Depends(get_db),
    _auth: dict = Security(validate_api_key),
):
    """
    Detailed insight for a single store.

    Returns revenue metrics, cost ratios, trend, status flags.
    Use this for drill-down after seeing an alert in the morning brief.
    """
    engine = DecisionEngine(db)
    insight = engine.get_store_detail(store_id)
    if not insight:
        raise HTTPException(404, f"Store {store_id} not found.")
    return insight


@router.get("/alerts", response_model=list[AlertSchema])
def get_active_alerts(
    severity: str = Query(None, description="Filter by severity: critical, warning, info, opportunity"),
    db: Session = Depends(get_db),
    _auth: dict = Security(validate_api_key),
):
    """
    List all active (unresolved) alerts.

    Optional filter by severity level.
    """
    query = db.query(Alert).filter(Alert.is_resolved == False)  # noqa: E712

    if severity:
        query = query.filter(Alert.severity == severity)

    alerts = query.order_by(Alert.created_at.desc()).limit(50).all()

    result = []
    for a in alerts:
        store_name = a.store.name if a.store else None
        result.append(
            AlertSchema(
                id=a.id,
                severity=a.severity,
                title=a.title,
                message=a.message,
                action=a.action,
                store_name=store_name,
                is_resolved=a.is_resolved,
                created_at=a.created_at,
            )
        )
    return result


@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    _auth: dict = Security(require_role("analyst")),
):
    """Mark an alert as resolved. Requires analyst or admin role."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(404, f"Alert {alert_id} not found.")

    alert.is_resolved = True
    db.commit()
    return {"status": "resolved", "alert_id": alert_id}
