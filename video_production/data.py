"""
Cilantro Egypt — Executive MBR Video
Data module: Replace dummy values with real MBR data here.
"""

# ── Brand Palette ─────────────────────────────────────────────────────────────
GREEN  = "#2D6A4F"   # Actual
GOLD   = "#C9A84C"   # Budget
GREY   = "#8C8C8C"   # LY
WHITE  = "#FFFFFF"
BLACK  = "#1A1A1A"
LIGHT  = "#F5F5F5"

# ── Report Metadata ───────────────────────────────────────────────────────────
REPORT_PERIOD  = "February 2026"
COMPANY_NAME   = "Cilantro Egypt"
SUBTITLE       = "Monthly Business Review"

# ── Scene 2 — Revenue Performance (EGP Millions) ─────────────────────────────
MONTHS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]

REVENUE = {
    "actual": [18.4, 21.2, 23.7, 28.1, 24.6, 26.3],
    "budget": [17.5, 20.0, 22.5, 27.0, 23.5, 25.0],
    "ly":     [15.8, 18.6, 20.9, 24.4, 21.2, 22.7],
}

# ── Scene 3 — Gross Profit & Margin ─────────────────────────────────────────
GROSS_PROFIT = {
    "actual": [7.55, 8.91, 9.85, 11.52, 10.11, 10.93],   # EGP M
    "budget": [7.18, 8.40, 9.45, 11.34, 9.88, 10.50],
    "ly":     [6.01, 7.06, 7.74, 9.05, 7.85, 8.30],
    "gp_pct_actual": [41.0, 42.0, 41.5, 41.0, 41.1, 41.6],
    "gp_pct_budget": [41.0, 42.0, 42.0, 42.0, 42.1, 42.0],
}

# ── Scene 4 — Branch Performance (Revenue EGP M, Feb) ────────────────────────
BRANCHES = {
    "names":  ["City Stars", "Maadi", "New Cairo", "Zamalek",
               "Heliopolis", "Sheikh Zayed", "Obour City", "Nasr City"],
    "actual": [3.4, 3.1, 2.9, 2.7, 2.5, 2.4, 2.2, 1.9],
    "budget": [3.2, 3.0, 2.8, 2.6, 2.4, 2.3, 2.1, 1.8],
    "ly":     [2.9, 2.7, 2.5, 2.3, 2.1, 2.0, 1.8, 1.6],
}

# ── Scene 5 — Product Mix (% of Revenue, Feb) ────────────────────────────────
PRODUCT_MIX = {
    "labels":  ["Hot Beverages", "Cold Beverages", "Food Items",
                "Desserts & Cakes", "Retail / Merch"],
    "values":  [38, 27, 22, 10, 3],
    "colors":  [GREEN, "#52B788", GOLD, "#D4A017", GREY],
}

# ── Scene 6 — Customer Traffic & Avg Ticket ───────────────────────────────────
TRAFFIC = {
    "transactions": [68400, 78200, 87500, 103000, 90200, 96800],  # monthly
    "avg_ticket":   [268, 271, 271, 273, 273, 272],               # EGP
}

# ── Scene 7 — Operating Cost Breakdown (% of Revenue, Feb actual) ────────────
OPEX = {
    "categories": ["COGS", "Labor", "Rent & Utilities", "G&A", "Marketing"],
    "actual":     [58.4, 16.2, 11.8, 5.6, 2.4],
    "budget":     [58.0, 16.5, 12.0, 5.5, 2.5],
}

# ── Scene 8 — KPI Scorecard (Feb) ────────────────────────────────────────────
KPI_SCORECARD = [
    ("Total Revenue",       "EGP 26.3M",  "+5.2% vs Bgt",   "+15.9% vs LY",  "✓"),
    ("Gross Profit",        "EGP 10.9M",  "+4.1% vs Bgt",   "+31.7% vs LY",  "✓"),
    ("GP Margin",           "41.6%",      "+0.4 pp below",  "+0.5 pp above", "✓"),
    ("Transactions",        "96,800",     "+2.7% vs Bgt",   "+14.6% vs LY",  "✓"),
    ("Avg Ticket (EGP)",    "272",        "-0.4% vs Bgt",   "+6.3% vs LY",   "~"),
    ("COGS %",              "58.4%",      "-0.4 pp vs Bgt", "-1.2 pp vs LY", "✓"),
    ("Labor %",             "16.2%",      "+0.3 pp vs Bgt", "+0.8 pp vs LY", "~"),
]
