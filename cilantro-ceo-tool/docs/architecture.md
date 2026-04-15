# Cilantro CEO Tool — System Architecture

> **Version:** 1.0.0-mvp (Final — Iteration 3)
> **Purpose:** A CEO-level decision engine for Cilantro coffee retail chain.
> CEO opens the tool, gets 3-5 clear actions in under 2 minutes.

---

## Recursive Design Process

This system was designed through 3 aggressive iterations of critique → improve → rebuild.

### Iteration 1 — Initial Design

**Architecture:** FastAPI + PostgreSQL + React SPA + 12 API endpoints + ML anomaly detection

**Critique (Aggressive):**
- Overengineered: 12 endpoints for an MVP is too many. CEO needs 2-3 views, not a BI platform.
- ML anomaly detection: unrealistic without historical training data. No data scientist on team.
- PostgreSQL from day one: unnecessary overhead. SQLite handles MVP volume easily.
- React SPA: separate frontend adds deployment complexity. Can use existing Next.js.
- Assumed ERP integration existed. It doesn't.
- No fallback if APIs fail — system becomes useless.
- API keys stored in a config file, not environment variables.

**Score:** Practicality: 4 | API Robustness: 3 | Security: 3 | Decision Usefulness: 5

---

### Iteration 2 — Simplified

**Architecture:** FastAPI + SQLite + Next.js pages + 8 endpoints + threshold-based rules

**Improvements:**
- Dropped ML. Replaced with simple threshold rules (CEO can understand WHY).
- Reduced to 8 endpoints. Still too many — some overlap.
- Moved to SQLite for MVP. Config allows PostgreSQL swap later.
- Integrated frontend into existing Next.js app instead of separate SPA.
- Added CSV upload as primary ingestion (no API dependency).
- API keys moved to environment variables.

**Critique (Aggressive):**
- 8 endpoints still more than needed. Merge some.
- Decision engine runs on API call — no caching, every call re-scans.
- Alert deduplication is weak. Same alert fires every day.
- No data freshness indicator — CEO doesn't know if they're seeing stale data.
- POS integration assumed without documenting the assumption clearly.
- No health check endpoint for monitoring.

**Score:** Practicality: 6 | API Robustness: 5 | Security: 6 | Decision Usefulness: 6

---

### Iteration 3 — Final (Current)

**Architecture:** FastAPI + SQLite + Next.js + 7 endpoints + threshold rules + alert deduplication

**Improvements:**
- 7 focused endpoints (3 data ingestion, 3 insights, 1 health).
- Alert deduplication: same alert title won't fire twice while unresolved.
- Data freshness indicator on every morning brief response.
- POS integration clearly labeled as ASSUMPTION with fallback.
- Health check endpoint reports status of all components.
- Role-based API keys (admin/analyst/viewer).
- Constant-time key comparison (prevents timing attacks).
- Every decision rule explains WHY and recommends WHAT TO DO.

**Score:** Practicality: 8 | API Robustness: 8 | Security: 7 | Decision Usefulness: 8

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CEO (Browser)                           │
│                  Next.js Frontend Page                      │
│              /ceo-tool → Morning Brief UI                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS + X-API-Key header
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (FastAPI)                       │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │ /health      │  │ /api/v1/data  │  │ /api/v1/insights │ │
│  │ (no auth)    │  │ (analyst+)    │  │ (viewer+)        │ │
│  └──────────────┘  └───────┬───────┘  └────────┬─────────┘ │
│                            │                    │           │
│  ┌─────────────────────────┴────────────────────┘         │ │
│  │              Service Layer                              │ │
│  │  ┌────────────────┐  ┌───────────────────┐             │ │
│  │  │ DataProcessor  │  │ DecisionEngine    │             │ │
│  │  │ (CSV parsing)  │  │ (threshold rules) │             │ │
│  │  └────────────────┘  └───────────────────┘             │ │
│  │  ┌────────────────┐                                    │ │
│  │  │ POSClient      │ ← OPTIONAL, fallback to CSV       │ │
│  │  │ (API client)   │                                    │ │
│  │  └────────────────┘                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │                                 │
│                    ┌───────┴───────┐                         │
│                    │  SQLAlchemy   │                         │
│                    │    ORM        │                         │
│                    └───────┬───────┘                         │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │  SQLite (MVP)   │
                    │  / PostgreSQL   │
                    └─────────────────┘
```

**Key principle:** The API layer is decoupled from the decision engine.
If APIs fail, CSV upload still works. If the database is empty, the morning
brief returns safely with "no data" freshness.

---

## Data Model

```
stores
├── id            INTEGER  PK
├── name          TEXT     UNIQUE NOT NULL
├── location      TEXT     NOT NULL
├── is_active     BOOLEAN  DEFAULT true
└── created_at    DATETIME DEFAULT now()

daily_sales
├── id            INTEGER  PK
├── store_id      INTEGER  FK → stores.id
├── date          DATE     NOT NULL
├── revenue       FLOAT    NOT NULL
├── transactions  INTEGER  DEFAULT 0
└── avg_ticket    FLOAT    DEFAULT 0

costs
├── id            INTEGER  PK
├── store_id      INTEGER  FK → stores.id
├── date          DATE     NOT NULL
├── category      ENUM     (cogs|labor|rent|utilities|marketing|other)
├── amount        FLOAT    NOT NULL
└── description   TEXT     NULLABLE

cash_positions
├── id            INTEGER  PK
├── date          DATE     UNIQUE NOT NULL
├── balance       FLOAT    NOT NULL
├── inflows       FLOAT    DEFAULT 0
├── outflows      FLOAT    DEFAULT 0
└── notes         TEXT     NULLABLE

alerts
├── id            INTEGER  PK
├── severity      ENUM     (critical|warning|info|opportunity)
├── title         TEXT     NOT NULL
├── message       TEXT     NOT NULL
├── action        TEXT     NULLABLE  (recommended CEO action)
├── store_id      INTEGER  FK → stores.id  NULLABLE
├── is_resolved   BOOLEAN  DEFAULT false
└── created_at    DATETIME DEFAULT now()
```

Relationships:
- Store → has many DailySales, Costs, Alerts
- CashPosition is company-wide (no store FK)
- Alerts can be store-specific or company-wide

---

## API Specification

### Authentication

All endpoints (except `/health`) require an `X-API-Key` header.

```
X-API-Key: your-api-key-here
```

Keys are stored in the `CEO_TOOL_API_KEYS` environment variable (comma-separated).
Keys can be prefixed with a role: `admin:key123`, `analyst:key456`, `key789` (default: viewer).

**Role hierarchy:** admin > analyst > viewer

**Key rotation process:**
1. Add new key to env variable (keep old key)
2. Deploy
3. Update all clients to use new key
4. Remove old key
5. Deploy again

### Endpoints

#### 1. Health Check
```
GET /health
Auth: None
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-15T08:00:00",
  "components": {
    "database": "connected",
    "pos_api": "not_configured",
    "api_keys_configured": true
  },
  "version": "1.0.0-mvp"
}
```

#### 2. Upload Sales CSV
```
POST /api/v1/data/upload/sales
Auth: analyst+
Content-Type: multipart/form-data
Body: file (CSV)
```
Response:
```json
{
  "status": "success",
  "rows_imported": 28,
  "errors": [],
  "warnings": ["Row 5: Updated existing record for Cilantro Zamalek on 2026-04-14."]
}
```

#### 3. Upload Costs CSV
```
POST /api/v1/data/upload/costs
Auth: analyst+
Content-Type: multipart/form-data
Body: file (CSV)
```

#### 4. Upload Cash CSV
```
POST /api/v1/data/upload/cash
Auth: analyst+
Content-Type: multipart/form-data
Body: file (CSV)
```

#### 5. Sync POS [OPTIONAL — ASSUMED API]
```
POST /api/v1/data/sync-pos?target_date=2026-04-14
Auth: admin
```
Response (POS not configured):
```json
{
  "status": "skipped",
  "rows_imported": 0,
  "warnings": ["POS integration is not configured. Upload data via CSV."]
}
```

#### 6. Morning Brief (PRIMARY CEO ENDPOINT)
```
GET /api/v1/insights/morning-brief
Auth: viewer+
```
Response:
```json
{
  "date": "2026-04-15",
  "greeting": "Good morning",
  "total_revenue_yesterday": 192300,
  "total_revenue_trend": "down 5%",
  "cash_position": 1250000,
  "cash_runway_days": 42,
  "alerts": [
    {
      "id": 1,
      "severity": "critical",
      "title": "Revenue drop at Cilantro Maadi",
      "message": "Yesterday's revenue (EGP 31,000) was 27% below the 30-day average (EGP 42,571).",
      "action": "Investigate Cilantro Maadi: check foot traffic, staffing, promotions, or local disruptions.",
      "store_name": "Cilantro Maadi",
      "is_resolved": false,
      "created_at": "2026-04-15T08:00:00"
    }
  ],
  "store_insights": [
    {
      "store_name": "Cilantro Zamalek",
      "store_id": 1,
      "today_revenue": 52000,
      "avg_30d_revenue": 50371,
      "revenue_trend": "up",
      "cogs_percent": 0.331,
      "labor_percent": 0.279,
      "status": "healthy",
      "flags": []
    },
    {
      "store_name": "Cilantro Maadi",
      "store_id": 2,
      "today_revenue": 31000,
      "avg_30d_revenue": 42571,
      "revenue_trend": "down",
      "cogs_percent": 0.426,
      "labor_percent": 0.413,
      "status": "critical",
      "flags": ["Revenue trending down", "COGS high (43%)", "Labor high (41%)"]
    }
  ],
  "top_actions": [
    "Investigate Cilantro Maadi: check foot traffic, staffing, promotions, or local disruptions.",
    "Review supplier pricing and waste levels at Cilantro Maadi. Check for inventory shrinkage."
  ],
  "data_freshness": "current"
}
```

#### 7. Store Detail
```
GET /api/v1/insights/store/{store_id}
Auth: viewer+
```

#### 8. Active Alerts
```
GET /api/v1/insights/alerts?severity=critical
Auth: viewer+
```

#### 9. Resolve Alert
```
POST /api/v1/insights/alerts/{alert_id}/resolve
Auth: analyst+
```

---

## Decision Engine Rules

All thresholds are configurable via environment variables.

| # | Rule | Condition | Severity | Default Threshold |
|---|------|-----------|----------|-------------------|
| 1 | Revenue Drop | Daily revenue < X% of 30-day average | CRITICAL | 80% |
| 2 | COGS Spike | COGS as % of revenue > X% | WARNING | 35% |
| 3 | Labor Overrun | Labor as % of revenue > X% | WARNING | 30% |
| 4 | Low Cash Runway | Cash balance / avg daily spend < X days | CRITICAL | 14 days |
| 5 | Store Underperformance | Store 7-day avg < X% below peer average | WARNING | 20% |
| 6 | Revenue Growth | Week-over-week growth > X% | OPPORTUNITY | 10% |

**Design principles:**
- Every alert explains the **cause** (numbers, comparisons)
- Every alert recommends a **specific action**
- Alerts are deduplicated (same title won't fire twice while unresolved)
- CEO resolves alerts manually to acknowledge them

---

## Assumptions (Explicitly Stated)

1. **POS API:** Assumed that Cilantro's POS system MAY expose a REST API. The system works fully without it via CSV upload.
2. **Data format:** Financials are available as CSV exports from Excel or accounting software.
3. **Currency:** All monetary values in Egyptian Pounds (EGP).
4. **Store count:** Designed for 5-50 stores. Beyond 50, consider PostgreSQL and pagination.
5. **Data frequency:** Daily uploads (sales, costs) and weekly cash position updates.
6. **Single user:** MVP designed for CEO as primary user. Multi-user requires proper auth.

---

## MVP Build Plan

### Phase 1: Backend (Week 1)
1. Set up Python virtualenv + FastAPI
2. Define SQLAlchemy models
3. Implement CSV data processor
4. Implement decision engine (6 rules)
5. Build API endpoints
6. Test with sample data

### Phase 2: Frontend (Week 2)
1. Create Next.js page at /ceo-tool
2. Build Morning Brief component
3. Build Data Upload component
4. Connect to backend API
5. Style with existing Tailwind config

### Phase 3: Deploy (Week 3)
1. Deploy FastAPI to any Python host (Railway, Render, or VPS)
2. Switch DATABASE_URL to PostgreSQL
3. Set up environment variables
4. Configure CORS for production domain
5. Generate and distribute API keys

### Phase 4: Iterate (Ongoing)
1. Tune decision thresholds based on CEO feedback
2. Add POS integration if API becomes available
3. Add email/WhatsApp morning brief summary
4. Add budget vs. actual variance tracking

---

## Graceful Degradation

The system is designed to work even when components fail:

| Component | Failure | Behavior |
|-----------|---------|----------|
| POS API | Not configured / down | CSV upload works. Status shown in health check. |
| Database | Empty | Morning brief returns with "no data" freshness. No errors. |
| Database | Connection lost | Health check reports "degraded". API returns 500 with message. |
| CSV upload | Bad data | Partial import. Errors reported per-row. Valid rows still imported. |
| API keys | Not configured | Health check warns. Auth endpoints return 500 with setup instructions. |
| Frontend | Can't reach backend | Error state with retry button. No crash. |

---

## Security Summary

- API keys in environment variables (never hardcoded, never in code)
- Constant-time key comparison (prevents timing attacks)
- Role-based access (admin > analyst > viewer)
- CORS restricted to known frontend origins
- No SQL injection risk (SQLAlchemy ORM parameterizes all queries)
- File upload restricted to CSV only
- .env.example provided; .env excluded from git
