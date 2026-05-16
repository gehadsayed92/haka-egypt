"""
Cilantro CEO Tool - Data Models
SQLAlchemy ORM models + Pydantic schemas for API validation.
"""

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    Boolean,
    ForeignKey,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# ─── SQLAlchemy ORM Models ───────────────────────────────────────────────


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    location = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    daily_sales = relationship("DailySales", back_populates="store")
    costs = relationship("Cost", back_populates="store")
    alerts = relationship("Alert", back_populates="store")


class DailySales(Base):
    __tablename__ = "daily_sales"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    date = Column(Date, nullable=False)
    revenue = Column(Float, nullable=False)
    transactions = Column(Integer, nullable=False, default=0)
    avg_ticket = Column(Float, nullable=False, default=0.0)

    store = relationship("Store", back_populates="daily_sales")


class CostCategory(str, Enum):
    COGS = "cogs"
    LABOR = "labor"
    RENT = "rent"
    UTILITIES = "utilities"
    MARKETING = "marketing"
    OTHER = "other"


class Cost(Base):
    __tablename__ = "costs"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    date = Column(Date, nullable=False)
    category = Column(SAEnum(CostCategory), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)

    store = relationship("Store", back_populates="costs")


class CashPosition(Base):
    __tablename__ = "cash_positions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True)
    balance = Column(Float, nullable=False)
    inflows = Column(Float, nullable=False, default=0.0)
    outflows = Column(Float, nullable=False, default=0.0)
    notes = Column(String, nullable=True)


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    OPPORTUNITY = "opportunity"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(SAEnum(AlertSeverity), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    action = Column(String, nullable=True)  # Recommended CEO action
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    store = relationship("Store", back_populates="alerts")


# ─── Pydantic Schemas (API Request/Response) ─────────────────────────────


class StoreSchema(BaseModel):
    id: int
    name: str
    location: str
    is_active: bool

    model_config = {"from_attributes": True}


class DailySalesSchema(BaseModel):
    store_id: int
    date: date
    revenue: float
    transactions: int = 0
    avg_ticket: float = 0.0


class CostSchema(BaseModel):
    store_id: int
    date: date
    category: CostCategory
    amount: float
    description: Optional[str] = None


class CashPositionSchema(BaseModel):
    date: date
    balance: float
    inflows: float = 0.0
    outflows: float = 0.0
    notes: Optional[str] = None


class AlertSchema(BaseModel):
    id: int
    severity: AlertSeverity
    title: str
    message: str
    action: Optional[str] = None
    store_name: Optional[str] = None
    is_resolved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UploadResult(BaseModel):
    status: str
    rows_imported: int
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class StoreInsight(BaseModel):
    store_name: str
    store_id: int
    today_revenue: Optional[float] = None
    avg_30d_revenue: Optional[float] = None
    revenue_trend: Optional[str] = None  # "up", "down", "flat"
    cogs_percent: Optional[float] = None
    labor_percent: Optional[float] = None
    status: str  # "healthy", "warning", "critical"
    flags: list[str] = Field(default_factory=list)


class MorningBrief(BaseModel):
    """The CEO's daily decision summary."""

    date: str
    greeting: str
    total_revenue_yesterday: Optional[float] = None
    total_revenue_trend: Optional[str] = None
    cash_position: Optional[float] = None
    cash_runway_days: Optional[int] = None
    alerts: list[AlertSchema] = Field(default_factory=list)
    store_insights: list[StoreInsight] = Field(default_factory=list)
    top_actions: list[str] = Field(default_factory=list)
    data_freshness: str  # "current", "stale (2 days)", etc.
