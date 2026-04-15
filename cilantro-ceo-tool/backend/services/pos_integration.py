"""
Cilantro CEO Tool - POS Integration Service

ASSUMPTION: Cilantro's POS system exposes a REST API that can return
daily sales summaries per store. This is a common feature in modern
POS systems (e.g., Square, Toast, Lightspeed).

If the POS API is unavailable or not configured, the system falls back
to CSV uploads. This service is OPTIONAL — the tool works without it.

API Contract (assumed):
  GET /api/sales/daily?date=YYYY-MM-DD
  Headers: Authorization: Bearer <POS_API_KEY>
  Response: {
    "stores": [
      {
        "store_name": "Cilantro Zamalek",
        "date": "2024-01-15",
        "revenue": 45000.00,
        "transactions": 312,
        "avg_ticket": 144.23
      }
    ]
  }
"""

import logging
from datetime import date
from typing import Optional

import httpx

from config import settings
from models import UploadResult

logger = logging.getLogger(__name__)


class POSIntegrationError(Exception):
    """Raised when POS API communication fails."""

    pass


class POSClient:
    """
    Client for the POS system API.
    Falls back gracefully if POS is not configured or unreachable.
    """

    def __init__(self):
        self.enabled = settings.POS_ENABLED
        self.base_url = settings.POS_API_URL
        self.api_key = settings.POS_API_KEY
        self.timeout = 30.0  # seconds

    def is_available(self) -> bool:
        """Check if POS integration is configured and reachable."""
        if not self.enabled:
            return False

        try:
            # Simple health check — don't pull data, just verify connectivity
            response = httpx.get(
                f"{self.base_url}/health",
                headers=self._headers(),
                timeout=5.0,
            )
            return response.status_code == 200
        except httpx.HTTPError:
            logger.warning("POS API health check failed — falling back to CSV.")
            return False

    def fetch_daily_sales(self, target_date: date) -> Optional[str]:
        """
        Fetch daily sales from POS and return as CSV-formatted string.
        This allows reuse of the existing DataProcessor.process_sales_csv().

        Returns None if POS is unavailable (graceful fallback).
        """
        if not self.enabled:
            logger.info("POS integration not configured. Use CSV upload.")
            return None

        try:
            response = httpx.get(
                f"{self.base_url}/api/sales/daily",
                params={"date": target_date.isoformat()},
                headers=self._headers(),
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()

            # Convert POS response to CSV format for DataProcessor
            return self._to_csv(data.get("stores", []))

        except httpx.HTTPStatusError as e:
            logger.error(f"POS API returned {e.response.status_code}: {e.response.text}")
            raise POSIntegrationError(
                f"POS API error: {e.response.status_code}. "
                f"Falling back to CSV upload."
            )
        except httpx.HTTPError as e:
            logger.error(f"POS API connection failed: {e}")
            raise POSIntegrationError(
                f"Cannot reach POS API at {self.base_url}. "
                f"Check network connectivity. Falling back to CSV upload."
            )

    def sync_sales(self, target_date: date) -> UploadResult:
        """
        Full sync: fetch from POS and process into database.
        Returns UploadResult for consistent API response.
        """
        from services.data_processor import DataProcessor
        from database import SessionLocal

        csv_data = self.fetch_daily_sales(target_date)
        if csv_data is None:
            return UploadResult(
                status="skipped",
                rows_imported=0,
                warnings=["POS integration not configured. Upload CSV manually."],
            )

        db = SessionLocal()
        try:
            processor = DataProcessor(db)
            return processor.process_sales_csv(csv_data)
        finally:
            db.close()

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
        }

    def _to_csv(self, stores: list[dict]) -> str:
        """Convert POS JSON response to CSV string."""
        lines = ["store_name,date,revenue,transactions,avg_ticket"]
        for s in stores:
            lines.append(
                f"{s['store_name']},{s['date']},{s['revenue']},"
                f"{s['transactions']},{s['avg_ticket']}"
            )
        return "\n".join(lines)
