"""
Cilantro CEO Tool - Configuration
All secrets loaded from environment variables. Never hardcoded.
"""

import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Settings:
    """Application settings loaded from environment variables."""

    # --- API Security ---
    # API keys for authenticating requests to this service.
    # Comma-separated list of valid keys. Rotate by adding new key,
    # deploying, then removing old key.
    API_KEYS: list[str] = field(default_factory=list)

    # --- Database ---
    # SQLite for MVP. Swap to PostgreSQL connection string for production.
    DATABASE_URL: str = "sqlite:///./cilantro_ceo.db"

    # --- POS Integration (ASSUMPTION: POS system exposes a REST API) ---
    POS_API_URL: Optional[str] = None
    POS_API_KEY: Optional[str] = None
    POS_ENABLED: bool = False

    # --- Decision Engine Thresholds ---
    # Revenue: flag if daily revenue drops below this % of 30-day average
    REVENUE_DROP_THRESHOLD: float = 0.80
    # COGS: flag if COGS exceeds this % of revenue
    COGS_MAX_PERCENT: float = 0.35
    # Labor: flag if labor cost exceeds this % of revenue
    LABOR_MAX_PERCENT: float = 0.30
    # Cash runway: flag if cash covers fewer than this many days
    CASH_RUNWAY_MIN_DAYS: int = 14
    # Store underperformance: flag if store is this % below peer average
    STORE_UNDERPERFORM_PERCENT: float = 0.20
    # Revenue growth: flag as opportunity if week-over-week growth exceeds this
    REVENUE_GROWTH_OPPORTUNITY: float = 0.10

    # --- App ---
    APP_NAME: str = "Cilantro CEO Tool"
    DEBUG: bool = False

    def __post_init__(self):
        """Load values from environment, overriding defaults."""
        raw_keys = os.getenv("CEO_TOOL_API_KEYS", "")
        if raw_keys:
            self.API_KEYS = [k.strip() for k in raw_keys.split(",") if k.strip()]

        self.DATABASE_URL = os.getenv("CEO_TOOL_DATABASE_URL", self.DATABASE_URL)

        self.POS_API_URL = os.getenv("CEO_TOOL_POS_API_URL")
        self.POS_API_KEY = os.getenv("CEO_TOOL_POS_API_KEY")
        self.POS_ENABLED = bool(self.POS_API_URL and self.POS_API_KEY)

        # Thresholds (allow env overrides for tuning without code changes)
        self.REVENUE_DROP_THRESHOLD = float(
            os.getenv("CEO_TOOL_REVENUE_DROP_THRESHOLD", self.REVENUE_DROP_THRESHOLD)
        )
        self.COGS_MAX_PERCENT = float(
            os.getenv("CEO_TOOL_COGS_MAX_PERCENT", self.COGS_MAX_PERCENT)
        )
        self.LABOR_MAX_PERCENT = float(
            os.getenv("CEO_TOOL_LABOR_MAX_PERCENT", self.LABOR_MAX_PERCENT)
        )
        self.CASH_RUNWAY_MIN_DAYS = int(
            os.getenv("CEO_TOOL_CASH_RUNWAY_MIN_DAYS", self.CASH_RUNWAY_MIN_DAYS)
        )

        self.DEBUG = os.getenv("CEO_TOOL_DEBUG", "false").lower() == "true"


settings = Settings()
