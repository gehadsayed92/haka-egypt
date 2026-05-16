"""
Cilantro CEO Tool - Decision Engine

Core logic that transforms raw data into CEO-level insights and actions.
Uses threshold-based rules — no ML, no black boxes. Every alert explains WHY.

Decision Rules (all thresholds configurable via environment):
1. Revenue Drop:    daily revenue < 80% of 30-day avg → CRITICAL
2. COGS Spike:      COGS% of revenue > 35%           → WARNING
3. Labor Overrun:   labor% of revenue > 30%           → WARNING
4. Cash Runway:     cash / avg daily spend < 14 days  → CRITICAL
5. Store Underperf: store < 20% below peer avg        → WARNING
6. Revenue Growth:  WoW growth > 10%                  → OPPORTUNITY
"""

from datetime import date, timedelta
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from config import settings
from models import (
    Store,
    DailySales,
    Cost,
    CashPosition,
    Alert,
    AlertSeverity,
    CostCategory,
    MorningBrief,
    StoreInsight,
    AlertSchema,
)


class DecisionEngine:
    """Stateless engine. Takes a DB session, returns insights."""

    def __init__(self, db: Session):
        self.db = db
        self.today = date.today()
        self.yesterday = self.today - timedelta(days=1)

    # ─── Public API ───────────────────────────────────────────────────

    def generate_morning_brief(self) -> MorningBrief:
        """Generate the CEO's daily decision summary."""
        # Run all checks and generate fresh alerts
        self._run_all_checks()

        # Gather data
        total_rev = self._total_revenue_yesterday()
        rev_trend = self._revenue_trend_description()
        cash = self._latest_cash_position()
        runway = self._cash_runway_days()
        active_alerts = self._get_active_alerts()
        store_insights = self._get_all_store_insights()
        top_actions = self._prioritize_actions(active_alerts)
        freshness = self._data_freshness()

        return MorningBrief(
            date=self.today.isoformat(),
            greeting=self._greeting(),
            total_revenue_yesterday=total_rev,
            total_revenue_trend=rev_trend,
            cash_position=cash,
            cash_runway_days=runway,
            alerts=active_alerts,
            store_insights=store_insights,
            top_actions=top_actions,
            data_freshness=freshness,
        )

    def get_store_detail(self, store_id: int) -> Optional[StoreInsight]:
        """Deep dive into a single store's performance."""
        store = self.db.query(Store).filter(Store.id == store_id).first()
        if not store:
            return None
        return self._build_store_insight(store)

    # ─── Decision Rule Checks ─────────────────────────────────────────

    def _run_all_checks(self):
        """Execute all decision rules. Creates alerts for violations."""
        stores = self.db.query(Store).filter(Store.is_active == True).all()  # noqa: E712

        for store in stores:
            self._check_revenue_drop(store)
            self._check_cogs_spike(store)
            self._check_labor_overrun(store)
            self._check_store_underperformance(store, stores)

        self._check_cash_runway()
        self._check_revenue_growth_opportunities(stores)
        self.db.commit()

    def _check_revenue_drop(self, store: Store):
        """Rule 1: Flag if yesterday's revenue < threshold of 30-day average."""
        yesterday_rev = self._store_revenue_on_date(store.id, self.yesterday)
        avg_30d = self._store_avg_revenue(store.id, days=30)

        if yesterday_rev is None or avg_30d is None or avg_30d == 0:
            return

        ratio = yesterday_rev / avg_30d
        if ratio < settings.REVENUE_DROP_THRESHOLD:
            drop_pct = round((1 - ratio) * 100, 1)
            self._create_alert(
                severity=AlertSeverity.CRITICAL,
                title=f"Revenue drop at {store.name}",
                message=(
                    f"Yesterday's revenue (EGP {yesterday_rev:,.0f}) was {drop_pct}% "
                    f"below the 30-day average (EGP {avg_30d:,.0f})."
                ),
                action=(
                    f"Investigate {store.name}: check foot traffic, staffing, "
                    f"promotions, or local disruptions."
                ),
                store_id=store.id,
            )

    def _check_cogs_spike(self, store: Store):
        """Rule 2: Flag if COGS% of revenue exceeds threshold."""
        revenue = self._store_revenue_on_date(store.id, self.yesterday)
        cogs = self._store_cost_on_date(store.id, self.yesterday, CostCategory.COGS)

        if not revenue or revenue == 0 or cogs is None:
            return

        cogs_pct = cogs / revenue
        if cogs_pct > settings.COGS_MAX_PERCENT:
            self._create_alert(
                severity=AlertSeverity.WARNING,
                title=f"High COGS at {store.name}",
                message=(
                    f"COGS is {cogs_pct:.1%} of revenue (threshold: "
                    f"{settings.COGS_MAX_PERCENT:.0%}). "
                    f"Absolute: EGP {cogs:,.0f} on EGP {revenue:,.0f} revenue."
                ),
                action=(
                    f"Review supplier pricing and waste levels at {store.name}. "
                    f"Check for inventory shrinkage."
                ),
                store_id=store.id,
            )

    def _check_labor_overrun(self, store: Store):
        """Rule 3: Flag if labor cost% of revenue exceeds threshold."""
        revenue = self._store_revenue_on_date(store.id, self.yesterday)
        labor = self._store_cost_on_date(store.id, self.yesterday, CostCategory.LABOR)

        if not revenue or revenue == 0 or labor is None:
            return

        labor_pct = labor / revenue
        if labor_pct > settings.LABOR_MAX_PERCENT:
            self._create_alert(
                severity=AlertSeverity.WARNING,
                title=f"Labor cost high at {store.name}",
                message=(
                    f"Labor is {labor_pct:.1%} of revenue (threshold: "
                    f"{settings.LABOR_MAX_PERCENT:.0%}). "
                    f"EGP {labor:,.0f} on EGP {revenue:,.0f} revenue."
                ),
                action=(
                    f"Review shift scheduling at {store.name}. "
                    f"Consider adjusting staffing to match traffic patterns."
                ),
                store_id=store.id,
            )

    def _check_cash_runway(self):
        """Rule 4: Flag if cash runway is below minimum days."""
        runway = self._cash_runway_days()
        if runway is not None and runway < settings.CASH_RUNWAY_MIN_DAYS:
            cash = self._latest_cash_position()
            self._create_alert(
                severity=AlertSeverity.CRITICAL,
                title="Low cash runway",
                message=(
                    f"Current cash (EGP {cash:,.0f}) covers approximately "
                    f"{runway} days of operations. Minimum target: "
                    f"{settings.CASH_RUNWAY_MIN_DAYS} days."
                ),
                action=(
                    "Accelerate receivables, defer non-essential spending, "
                    "or arrange short-term credit facility."
                ),
                store_id=None,
            )

    def _check_store_underperformance(self, store: Store, all_stores: list[Store]):
        """Rule 5: Flag if store trails peer average by threshold."""
        if len(all_stores) < 2:
            return

        store_avg = self._store_avg_revenue(store.id, days=7)
        if store_avg is None:
            return

        peer_avgs = []
        for s in all_stores:
            if s.id != store.id:
                avg = self._store_avg_revenue(s.id, days=7)
                if avg is not None:
                    peer_avgs.append(avg)

        if not peer_avgs:
            return

        peer_mean = sum(peer_avgs) / len(peer_avgs)
        if peer_mean == 0:
            return

        gap = (peer_mean - store_avg) / peer_mean
        if gap > settings.STORE_UNDERPERFORM_PERCENT:
            self._create_alert(
                severity=AlertSeverity.WARNING,
                title=f"{store.name} underperforming peers",
                message=(
                    f"{store.name} 7-day avg (EGP {store_avg:,.0f}) is "
                    f"{gap:.0%} below peer average (EGP {peer_mean:,.0f})."
                ),
                action=(
                    f"Schedule review of {store.name} operations, location "
                    f"traffic, and local competitive landscape."
                ),
                store_id=store.id,
            )

    def _check_revenue_growth_opportunities(self, stores: list[Store]):
        """Rule 6: Flag stores with strong week-over-week growth."""
        for store in stores:
            this_week = self._store_total_revenue_period(
                store.id,
                self.today - timedelta(days=7),
                self.today,
            )
            last_week = self._store_total_revenue_period(
                store.id,
                self.today - timedelta(days=14),
                self.today - timedelta(days=7),
            )

            if this_week is None or last_week is None or last_week == 0:
                continue

            growth = (this_week - last_week) / last_week
            if growth > settings.REVENUE_GROWTH_OPPORTUNITY:
                self._create_alert(
                    severity=AlertSeverity.OPPORTUNITY,
                    title=f"Strong growth at {store.name}",
                    message=(
                        f"{store.name} revenue grew {growth:.0%} week-over-week. "
                        f"This week: EGP {this_week:,.0f}, last week: EGP {last_week:,.0f}."
                    ),
                    action=(
                        f"Investigate what's working at {store.name} — "
                        f"replicate successful tactics across other stores."
                    ),
                    store_id=store.id,
                )

    # ─── Data Access Helpers ──────────────────────────────────────────

    def _store_revenue_on_date(
        self, store_id: int, target_date: date
    ) -> Optional[float]:
        result = (
            self.db.query(DailySales.revenue)
            .filter(DailySales.store_id == store_id, DailySales.date == target_date)
            .first()
        )
        return result[0] if result else None

    def _store_avg_revenue(self, store_id: int, days: int) -> Optional[float]:
        start = self.today - timedelta(days=days)
        result = (
            self.db.query(func.avg(DailySales.revenue))
            .filter(
                DailySales.store_id == store_id,
                DailySales.date >= start,
                DailySales.date < self.today,
            )
            .first()
        )
        return result[0] if result and result[0] else None

    def _store_total_revenue_period(
        self, store_id: int, start: date, end: date
    ) -> Optional[float]:
        result = (
            self.db.query(func.sum(DailySales.revenue))
            .filter(
                DailySales.store_id == store_id,
                DailySales.date >= start,
                DailySales.date < end,
            )
            .first()
        )
        return result[0] if result and result[0] else None

    def _store_cost_on_date(
        self, store_id: int, target_date: date, category: CostCategory
    ) -> Optional[float]:
        result = (
            self.db.query(func.sum(Cost.amount))
            .filter(
                Cost.store_id == store_id,
                Cost.date == target_date,
                Cost.category == category,
            )
            .first()
        )
        return result[0] if result and result[0] else None

    def _total_revenue_yesterday(self) -> Optional[float]:
        result = (
            self.db.query(func.sum(DailySales.revenue))
            .filter(DailySales.date == self.yesterday)
            .first()
        )
        return result[0] if result and result[0] else None

    def _revenue_trend_description(self) -> Optional[str]:
        """Compare yesterday to day-before-yesterday across all stores."""
        day_before = self.yesterday - timedelta(days=1)
        rev_yesterday = self._total_revenue_on_date(self.yesterday)
        rev_before = self._total_revenue_on_date(day_before)

        if rev_yesterday is None or rev_before is None or rev_before == 0:
            return None

        change = (rev_yesterday - rev_before) / rev_before
        if change > 0.05:
            return f"up {change:.0%}"
        elif change < -0.05:
            return f"down {abs(change):.0%}"
        return "flat"

    def _total_revenue_on_date(self, target_date: date) -> Optional[float]:
        result = (
            self.db.query(func.sum(DailySales.revenue))
            .filter(DailySales.date == target_date)
            .first()
        )
        return result[0] if result and result[0] else None

    def _latest_cash_position(self) -> Optional[float]:
        result = (
            self.db.query(CashPosition)
            .order_by(CashPosition.date.desc())
            .first()
        )
        return result.balance if result else None

    def _cash_runway_days(self) -> Optional[int]:
        cash = self._latest_cash_position()
        if cash is None:
            return None

        # Average daily outflows over last 30 days
        start = self.today - timedelta(days=30)
        result = (
            self.db.query(func.avg(CashPosition.outflows))
            .filter(CashPosition.date >= start)
            .first()
        )
        avg_daily_spend = result[0] if result and result[0] else None
        if not avg_daily_spend or avg_daily_spend == 0:
            return None

        return int(cash / avg_daily_spend)

    def _data_freshness(self) -> str:
        """How recent is the latest sales data?"""
        result = (
            self.db.query(func.max(DailySales.date)).first()
        )
        if not result or not result[0]:
            return "no data"

        latest = result[0]
        delta = (self.today - latest).days
        if delta <= 1:
            return "current"
        return f"stale ({delta} days old)"

    # ─── Alert Management ─────────────────────────────────────────────

    def _create_alert(
        self,
        severity: AlertSeverity,
        title: str,
        message: str,
        action: str,
        store_id: Optional[int],
    ):
        """Create alert if a similar unresolved one doesn't already exist."""
        existing = (
            self.db.query(Alert)
            .filter(
                Alert.title == title,
                Alert.is_resolved == False,  # noqa: E712
            )
            .first()
        )
        if existing:
            return  # Don't duplicate

        alert = Alert(
            severity=severity,
            title=title,
            message=message,
            action=action,
            store_id=store_id,
        )
        self.db.add(alert)

    def _get_active_alerts(self) -> list[AlertSchema]:
        alerts = (
            self.db.query(Alert)
            .filter(Alert.is_resolved == False)  # noqa: E712
            .order_by(
                # CRITICAL first, then WARNING, then OPPORTUNITY, then INFO
                Alert.severity.desc(),
                Alert.created_at.desc(),
            )
            .limit(20)
            .all()
        )
        result = []
        for a in alerts:
            store_name = None
            if a.store_id and a.store:
                store_name = a.store.name
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

    # ─── Store Insights ───────────────────────────────────────────────

    def _build_store_insight(self, store: Store) -> StoreInsight:
        today_rev = self._store_revenue_on_date(store.id, self.yesterday)
        avg_30d = self._store_avg_revenue(store.id, days=30)

        # Determine trend
        trend = None
        if today_rev and avg_30d and avg_30d > 0:
            ratio = today_rev / avg_30d
            if ratio > 1.05:
                trend = "up"
            elif ratio < 0.95:
                trend = "down"
            else:
                trend = "flat"

        # Cost ratios
        revenue = today_rev or 0
        cogs = self._store_cost_on_date(store.id, self.yesterday, CostCategory.COGS)
        labor = self._store_cost_on_date(store.id, self.yesterday, CostCategory.LABOR)

        cogs_pct = (cogs / revenue) if cogs and revenue > 0 else None
        labor_pct = (labor / revenue) if labor and revenue > 0 else None

        # Build flags
        flags = []
        status = "healthy"

        if cogs_pct and cogs_pct > settings.COGS_MAX_PERCENT:
            flags.append(f"COGS high ({cogs_pct:.0%})")
            status = "warning"
        if labor_pct and labor_pct > settings.LABOR_MAX_PERCENT:
            flags.append(f"Labor high ({labor_pct:.0%})")
            status = "warning"
        if trend == "down":
            flags.append("Revenue trending down")
            if today_rev and avg_30d and (today_rev / avg_30d) < settings.REVENUE_DROP_THRESHOLD:
                status = "critical"

        return StoreInsight(
            store_name=store.name,
            store_id=store.id,
            today_revenue=today_rev,
            avg_30d_revenue=avg_30d,
            revenue_trend=trend,
            cogs_percent=round(cogs_pct, 3) if cogs_pct else None,
            labor_percent=round(labor_pct, 3) if labor_pct else None,
            status=status,
            flags=flags,
        )

    def _get_all_store_insights(self) -> list[StoreInsight]:
        stores = self.db.query(Store).filter(Store.is_active == True).all()  # noqa: E712
        return [self._build_store_insight(s) for s in stores]

    # ─── Helpers ──────────────────────────────────────────────────────

    def _greeting(self) -> str:
        from datetime import datetime

        hour = datetime.now().hour
        if hour < 12:
            return "Good morning"
        elif hour < 17:
            return "Good afternoon"
        return "Good evening"

    def _prioritize_actions(self, alerts: list[AlertSchema]) -> list[str]:
        """Extract top 5 actions from active alerts, ordered by severity."""
        actions = []
        for alert in alerts:
            if alert.action and alert.action not in actions:
                actions.append(alert.action)
            if len(actions) >= 5:
                break
        if not actions:
            actions.append("No urgent actions today. Review store performance trends.")
        return actions
