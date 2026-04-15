"""
Cilantro CEO Tool - Data Ingestion Router

Endpoints for uploading CSV data and triggering POS sync.
All endpoints require authentication (API key) with 'admin' or 'analyst' role.
"""

from datetime import date

from fastapi import APIRouter, Depends, File, Security, UploadFile, HTTPException
from sqlalchemy.orm import Session

from auth.api_keys import require_role
from database import get_db
from models import UploadResult
from services.data_processor import DataProcessor
from services.pos_integration import POSClient, POSIntegrationError

router = APIRouter(prefix="/api/v1/data", tags=["data"])


@router.post("/upload/sales", response_model=UploadResult)
async def upload_sales(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _auth: dict = Security(require_role("analyst")),
):
    """
    Upload daily sales data as CSV.

    Expected CSV columns:
    - store_name (required): Name of the store
    - date (required): Date in YYYY-MM-DD format
    - revenue (required): Daily revenue in EGP
    - transactions (optional): Number of transactions
    - avg_ticket (optional): Average ticket size in EGP

    Upserts: if data for the same store+date exists, it will be updated.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are accepted.")

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("utf-8-sig")  # Handle BOM from Excel

    processor = DataProcessor(db)
    return processor.process_sales_csv(text)


@router.post("/upload/costs", response_model=UploadResult)
async def upload_costs(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _auth: dict = Security(require_role("analyst")),
):
    """
    Upload cost data as CSV.

    Expected CSV columns:
    - store_name (required): Name of the store
    - date (required): Date in YYYY-MM-DD format
    - category (required): One of: cogs, labor, rent, utilities, marketing, other
    - amount (required): Cost amount in EGP
    - description (optional): Description of the cost
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are accepted.")

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("utf-8-sig")

    processor = DataProcessor(db)
    return processor.process_costs_csv(text)


@router.post("/upload/cash", response_model=UploadResult)
async def upload_cash(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _auth: dict = Security(require_role("analyst")),
):
    """
    Upload cash position data as CSV.

    Expected CSV columns:
    - date (required): Date in YYYY-MM-DD format
    - balance (required): End-of-day cash balance in EGP
    - inflows (optional): Total inflows for the day
    - outflows (optional): Total outflows for the day
    - notes (optional): Any notes
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are accepted.")

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("utf-8-sig")

    processor = DataProcessor(db)
    return processor.process_cash_csv(text)


@router.post("/sync-pos", response_model=UploadResult)
async def sync_pos(
    target_date: date = None,
    _auth: dict = Security(require_role("admin")),
):
    """
    Trigger a POS data sync for a specific date.

    ASSUMPTION: POS system exposes a REST API (see pos_integration.py).
    If POS is not configured, returns a helpful message directing
    the user to upload CSV instead.

    Query params:
    - target_date: Date to sync (defaults to yesterday)
    """
    if target_date is None:
        from datetime import timedelta

        target_date = date.today() - timedelta(days=1)

    pos = POSClient()

    if not pos.enabled:
        return UploadResult(
            status="skipped",
            rows_imported=0,
            warnings=[
                "POS integration is not configured. "
                "Set CEO_TOOL_POS_API_URL and CEO_TOOL_POS_API_KEY "
                "environment variables, or upload data via CSV."
            ],
        )

    try:
        return pos.sync_sales(target_date)
    except POSIntegrationError as e:
        return UploadResult(
            status="error",
            rows_imported=0,
            errors=[str(e)],
            warnings=["POS sync failed. Upload CSV as fallback."],
        )
