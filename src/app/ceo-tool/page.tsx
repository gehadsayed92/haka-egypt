"use client";

import { useState, useMemo } from "react";

// ─── Embedded Sample Data ────────────────────────────────────────────
// In production, this comes from the FastAPI backend.
// For demo/mobile preview, we embed it directly.

interface StoreData {
  name: string;
  location: string;
  sales: { date: string; revenue: number; transactions: number; avg_ticket: number }[];
  costs: { date: string; category: string; amount: number }[];
}

interface CashData {
  date: string;
  balance: number;
  inflows: number;
  outflows: number;
}

const STORES: StoreData[] = [
  {
    name: "Cilantro Zamalek",
    location: "Zamalek, Cairo",
    sales: [
      { date: "2026-04-14", revenue: 52000, transactions: 340, avg_ticket: 152.94 },
      { date: "2026-04-13", revenue: 48500, transactions: 310, avg_ticket: 156.45 },
      { date: "2026-04-12", revenue: 51200, transactions: 328, avg_ticket: 156.10 },
      { date: "2026-04-11", revenue: 49800, transactions: 320, avg_ticket: 155.63 },
      { date: "2026-04-10", revenue: 53100, transactions: 345, avg_ticket: 153.91 },
      { date: "2026-04-09", revenue: 47200, transactions: 305, avg_ticket: 154.75 },
      { date: "2026-04-08", revenue: 50800, transactions: 330, avg_ticket: 153.94 },
    ],
    costs: [
      { date: "2026-04-14", category: "cogs", amount: 17200 },
      { date: "2026-04-14", category: "labor", amount: 14500 },
      { date: "2026-04-14", category: "rent", amount: 3500 },
      { date: "2026-04-14", category: "utilities", amount: 800 },
    ],
  },
  {
    name: "Cilantro Maadi",
    location: "Maadi, Cairo",
    sales: [
      { date: "2026-04-14", revenue: 31000, transactions: 210, avg_ticket: 147.62 },
      { date: "2026-04-13", revenue: 42500, transactions: 280, avg_ticket: 151.79 },
      { date: "2026-04-12", revenue: 44100, transactions: 290, avg_ticket: 152.07 },
      { date: "2026-04-11", revenue: 43200, transactions: 285, avg_ticket: 151.58 },
      { date: "2026-04-10", revenue: 41800, transactions: 275, avg_ticket: 152.00 },
      { date: "2026-04-09", revenue: 40500, transactions: 268, avg_ticket: 151.12 },
      { date: "2026-04-08", revenue: 43900, transactions: 288, avg_ticket: 152.43 },
    ],
    costs: [
      { date: "2026-04-14", category: "cogs", amount: 13200 },
      { date: "2026-04-14", category: "labor", amount: 12800 },
      { date: "2026-04-14", category: "rent", amount: 2800 },
      { date: "2026-04-14", category: "utilities", amount: 650 },
    ],
  },
  {
    name: "Cilantro Heliopolis",
    location: "Heliopolis, Cairo",
    sales: [
      { date: "2026-04-14", revenue: 61500, transactions: 395, avg_ticket: 155.70 },
      { date: "2026-04-13", revenue: 58200, transactions: 375, avg_ticket: 155.20 },
      { date: "2026-04-12", revenue: 59800, transactions: 385, avg_ticket: 155.32 },
      { date: "2026-04-11", revenue: 57500, transactions: 370, avg_ticket: 155.41 },
      { date: "2026-04-10", revenue: 62100, transactions: 400, avg_ticket: 155.25 },
      { date: "2026-04-09", revenue: 55800, transactions: 360, avg_ticket: 155.00 },
      { date: "2026-04-08", revenue: 60200, transactions: 388, avg_ticket: 155.15 },
    ],
    costs: [
      { date: "2026-04-14", category: "cogs", amount: 20100 },
      { date: "2026-04-14", category: "labor", amount: 17200 },
      { date: "2026-04-14", category: "rent", amount: 4200 },
      { date: "2026-04-14", category: "utilities", amount: 950 },
    ],
  },
  {
    name: "Cilantro New Cairo",
    location: "New Cairo",
    sales: [
      { date: "2026-04-14", revenue: 47800, transactions: 305, avg_ticket: 156.72 },
      { date: "2026-04-13", revenue: 45200, transactions: 290, avg_ticket: 155.86 },
      { date: "2026-04-12", revenue: 46500, transactions: 298, avg_ticket: 156.04 },
      { date: "2026-04-11", revenue: 44800, transactions: 288, avg_ticket: 155.56 },
      { date: "2026-04-10", revenue: 48200, transactions: 310, avg_ticket: 155.48 },
      { date: "2026-04-09", revenue: 43100, transactions: 278, avg_ticket: 155.04 },
      { date: "2026-04-08", revenue: 46900, transactions: 302, avg_ticket: 155.30 },
    ],
    costs: [
      { date: "2026-04-14", category: "cogs", amount: 15800 },
      { date: "2026-04-14", category: "labor", amount: 13500 },
      { date: "2026-04-14", category: "rent", amount: 3800 },
      { date: "2026-04-14", category: "utilities", amount: 750 },
    ],
  },
];

const CASH: CashData[] = [
  { date: "2026-04-14", balance: 1250000, inflows: 192300, outflows: 178500 },
  { date: "2026-04-13", balance: 1236200, inflows: 194400, outflows: 182100 },
  { date: "2026-04-12", balance: 1223900, inflows: 201600, outflows: 185300 },
  { date: "2026-04-11", balance: 1207600, inflows: 195300, outflows: 179800 },
  { date: "2026-04-10", balance: 1192100, inflows: 205200, outflows: 188400 },
  { date: "2026-04-09", balance: 1175300, inflows: 186600, outflows: 173200 },
  { date: "2026-04-08", balance: 1161900, inflows: 201800, outflows: 184500 },
];

// ─── Decision Engine (client-side) ───────────────────────────────────

const THRESHOLDS = {
  revenueDropPct: 0.80,
  cogsMaxPct: 0.35,
  laborMaxPct: 0.30,
  cashRunwayMinDays: 14,
  storeUnderperformPct: 0.20,
};

interface AlertItem {
  id: number;
  severity: "critical" | "warning" | "opportunity";
  title: string;
  message: string;
  action: string;
  storeName: string | null;
}

interface StoreInsight {
  name: string;
  yesterdayRevenue: number;
  avg7dRevenue: number;
  trend: "up" | "down" | "flat";
  cogsPct: number | null;
  laborPct: number | null;
  status: "healthy" | "warning" | "critical";
  flags: string[];
}

function runDecisionEngine() {
  const alerts: AlertItem[] = [];
  const insights: StoreInsight[] = [];
  let alertId = 1;

  const latestDate = "2026-04-14";

  // Per-store analysis
  const storeAvgs: number[] = [];

  for (const store of STORES) {
    const yesterday = store.sales.find((s) => s.date === latestDate);
    const avg7d =
      store.sales.reduce((sum, s) => sum + s.revenue, 0) / store.sales.length;
    storeAvgs.push(avg7d);

    const rev = yesterday?.revenue ?? 0;
    const cogs = store.costs.find((c) => c.category === "cogs")?.amount ?? 0;
    const labor = store.costs.find((c) => c.category === "labor")?.amount ?? 0;

    const cogsPct = rev > 0 ? cogs / rev : null;
    const laborPct = rev > 0 ? labor / rev : null;

    const ratio = avg7d > 0 ? rev / avg7d : 1;
    const trend: "up" | "down" | "flat" =
      ratio > 1.05 ? "up" : ratio < 0.95 ? "down" : "flat";

    const flags: string[] = [];
    let status: "healthy" | "warning" | "critical" = "healthy";

    // Rule 1: Revenue drop
    if (ratio < THRESHOLDS.revenueDropPct) {
      const dropPct = ((1 - ratio) * 100).toFixed(1);
      alerts.push({
        id: alertId++,
        severity: "critical",
        title: `Revenue drop at ${store.name}`,
        message: `Yesterday's revenue (EGP ${rev.toLocaleString()}) was ${dropPct}% below the 7-day average (EGP ${Math.round(avg7d).toLocaleString()}).`,
        action: `Investigate ${store.name}: check foot traffic, staffing, promotions, or local disruptions.`,
        storeName: store.name,
      });
      flags.push("Revenue trending down");
      status = "critical";
    } else if (trend === "down") {
      flags.push("Revenue trending down");
      status = "warning";
    }

    // Rule 2: COGS spike
    if (cogsPct !== null && cogsPct > THRESHOLDS.cogsMaxPct) {
      alerts.push({
        id: alertId++,
        severity: "warning",
        title: `High COGS at ${store.name}`,
        message: `COGS is ${(cogsPct * 100).toFixed(1)}% of revenue (threshold: ${THRESHOLDS.cogsMaxPct * 100}%). Absolute: EGP ${cogs.toLocaleString()} on EGP ${rev.toLocaleString()} revenue.`,
        action: `Review supplier pricing and waste levels at ${store.name}. Check for inventory shrinkage.`,
        storeName: store.name,
      });
      flags.push(`COGS high (${(cogsPct * 100).toFixed(0)}%)`);
      if (status === "healthy") status = "warning";
    }

    // Rule 3: Labor overrun
    if (laborPct !== null && laborPct > THRESHOLDS.laborMaxPct) {
      alerts.push({
        id: alertId++,
        severity: "warning",
        title: `Labor cost high at ${store.name}`,
        message: `Labor is ${(laborPct * 100).toFixed(1)}% of revenue (threshold: ${THRESHOLDS.laborMaxPct * 100}%). EGP ${labor.toLocaleString()} on EGP ${rev.toLocaleString()} revenue.`,
        action: `Review shift scheduling at ${store.name}. Consider adjusting staffing to match traffic patterns.`,
        storeName: store.name,
      });
      flags.push(`Labor high (${(laborPct * 100).toFixed(0)}%)`);
      if (status === "healthy") status = "warning";
    }

    insights.push({
      name: store.name,
      yesterdayRevenue: rev,
      avg7dRevenue: Math.round(avg7d),
      trend,
      cogsPct,
      laborPct,
      status,
      flags,
    });
  }

  // Rule 5: Store underperformance (peer comparison)
  const overallAvg =
    storeAvgs.reduce((a, b) => a + b, 0) / storeAvgs.length;
  for (let i = 0; i < STORES.length; i++) {
    const peerAvgs = storeAvgs.filter((_, j) => j !== i);
    const peerMean = peerAvgs.reduce((a, b) => a + b, 0) / peerAvgs.length;
    const gap = (peerMean - storeAvgs[i]) / peerMean;
    if (gap > THRESHOLDS.storeUnderperformPct) {
      alerts.push({
        id: alertId++,
        severity: "warning",
        title: `${STORES[i].name} underperforming peers`,
        message: `${STORES[i].name} 7-day avg (EGP ${Math.round(storeAvgs[i]).toLocaleString()}) is ${(gap * 100).toFixed(0)}% below peer average (EGP ${Math.round(peerMean).toLocaleString()}).`,
        action: `Schedule review of ${STORES[i].name} operations, location traffic, and local competitive landscape.`,
        storeName: STORES[i].name,
      });
    }
  }

  // Rule 4: Cash runway
  const latestCash = CASH[0];
  const avgDailyOutflow =
    CASH.reduce((sum, c) => sum + c.outflows, 0) / CASH.length;
  const runwayDays = Math.round(latestCash.balance / avgDailyOutflow);

  if (runwayDays < THRESHOLDS.cashRunwayMinDays) {
    alerts.push({
      id: alertId++,
      severity: "critical",
      title: "Low cash runway",
      message: `Current cash (EGP ${latestCash.balance.toLocaleString()}) covers approximately ${runwayDays} days of operations. Minimum target: ${THRESHOLDS.cashRunwayMinDays} days.`,
      action:
        "Accelerate receivables, defer non-essential spending, or arrange short-term credit facility.",
      storeName: null,
    });
  }

  // Total revenue
  const totalRevYesterday = STORES.reduce(
    (sum, s) => sum + (s.sales.find((x) => x.date === latestDate)?.revenue ?? 0),
    0
  );
  const totalRevDayBefore = STORES.reduce(
    (sum, s) => sum + (s.sales.find((x) => x.date === "2026-04-13")?.revenue ?? 0),
    0
  );
  const revChange =
    totalRevDayBefore > 0
      ? ((totalRevYesterday - totalRevDayBefore) / totalRevDayBefore) * 100
      : 0;

  // Sort alerts: critical first
  alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, opportunity: 2 };
    return order[a.severity] - order[b.severity];
  });

  return {
    totalRevYesterday,
    revTrend:
      revChange > 5 ? `up ${revChange.toFixed(0)}%` : revChange < -5 ? `down ${Math.abs(revChange).toFixed(0)}%` : "flat",
    cashBalance: latestCash.balance,
    cashRunwayDays: runwayDays,
    alerts,
    insights,
    topActions: alerts.slice(0, 5).map((a) => a.action),
  };
}

// ─── Format helpers ──────────────────────────────────────────────────

function fmtEGP(n: number | null): string {
  if (n === null) return "—";
  return `EGP ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number | null): string {
  if (n === null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

// ─── Severity styling ────────────────────────────────────────────────

const sevStyle = {
  critical: { bg: "bg-red-900/30", border: "border-l-red-500", badge: "bg-red-600 text-white", icon: "!!" },
  warning: { bg: "bg-yellow-900/20", border: "border-l-yellow-500", badge: "bg-yellow-600 text-black", icon: "!" },
  opportunity: { bg: "bg-emerald-900/20", border: "border-l-emerald-500", badge: "bg-emerald-600 text-white", icon: "+" },
};

const statusColor = {
  healthy: "text-emerald-400",
  warning: "text-yellow-400",
  critical: "text-red-400",
};

// ─── Component ───────────────────────────────────────────────────────

export default function CEOToolPage() {
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());

  const data = useMemo(() => runDecisionEngine(), []);
  const activeAlerts = data.alerts.filter((a) => !resolvedIds.has(a.id));
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");
  const otherAlerts = activeAlerts.filter((a) => a.severity !== "critical");

  const resolve = (id: number) => {
    setResolvedIds((prev) => new Set([...prev, id]));
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      {/* Header */}
      <header className="border-b border-[#1e2a24] bg-[#0d1210] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-haka-green flex items-center justify-center text-black font-bold text-sm shrink-0">
            C
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Cilantro CEO Tool</h1>
            <p className="text-[10px] text-gray-500">Decision Engine &middot; MVP</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold">{greeting}</h2>
          <p className="text-sm text-gray-400">
            April 14, 2026 &middot; Data: <span className="text-emerald-400">current</span>
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Revenue Yesterday</p>
            <p className="text-lg font-bold mt-0.5">{fmtEGP(data.totalRevYesterday)}</p>
            <p className="text-xs text-gray-400">{data.revTrend}</p>
          </div>
          <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cash Position</p>
            <p className="text-lg font-bold mt-0.5">{fmtEGP(data.cashBalance)}</p>
          </div>
          <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cash Runway</p>
            <p className="text-lg font-bold mt-0.5">{data.cashRunwayDays} days</p>
            {data.cashRunwayDays < 14 && (
              <p className="text-xs text-red-400">Below minimum</p>
            )}
          </div>
          <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Active Alerts</p>
            <p className="text-lg font-bold mt-0.5">{activeAlerts.length}</p>
            {criticalAlerts.length > 0 && (
              <p className="text-xs text-red-400">{criticalAlerts.length} critical</p>
            )}
          </div>
        </div>

        {/* Priority Actions */}
        <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-4">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Today&apos;s Priority Actions
          </h3>
          <ol className="space-y-2.5">
            {data.topActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-haka-green/20 text-haka-green flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-200 leading-snug">{action}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
              Critical Alerts
            </h3>
            {criticalAlerts.map((alert) => {
              const s = sevStyle[alert.severity];
              return (
                <div key={alert.id} className={`rounded-lg ${s.bg} border-l-4 ${s.border} p-3 mb-2.5`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold ${s.badge}`}>
                          {s.icon}
                        </span>
                        <span className="font-semibold text-sm truncate">{alert.title}</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-1.5">{alert.message}</p>
                      <p className="text-xs text-gray-200 italic">Action: {alert.action}</p>
                    </div>
                    <button
                      onClick={() => resolve(alert.id)}
                      className="text-[10px] text-gray-500 border border-gray-700 rounded px-1.5 py-0.5 shrink-0"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Other Alerts */}
        {otherAlerts.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Warnings & Opportunities
            </h3>
            {otherAlerts.map((alert) => {
              const s = sevStyle[alert.severity];
              return (
                <div key={alert.id} className={`rounded-lg ${s.bg} border-l-4 ${s.border} p-3 mb-2.5`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold ${s.badge}`}>
                          {s.icon}
                        </span>
                        <span className="font-semibold text-sm truncate">{alert.title}</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-1.5">{alert.message}</p>
                      <p className="text-xs text-gray-200 italic">Action: {alert.action}</p>
                    </div>
                    <button
                      onClick={() => resolve(alert.id)}
                      className="text-[10px] text-gray-500 border border-gray-700 rounded px-1.5 py-0.5 shrink-0"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Store Performance */}
        <div>
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Store Performance
          </h3>
          <div className="space-y-2">
            {data.insights.map((store) => (
              <div
                key={store.name}
                className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{store.name}</span>
                  <span className={`text-xs font-semibold capitalize ${statusColor[store.status]}`}>
                    {store.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Yesterday</p>
                    <p className="font-medium">{fmtEGP(store.yesterdayRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">7d Avg</p>
                    <p className="font-medium">{fmtEGP(store.avg7dRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Trend</p>
                    <p className="font-medium">
                      {store.trend === "up" && <span className="text-emerald-400">&#9650; Up</span>}
                      {store.trend === "down" && <span className="text-red-400">&#9660; Down</span>}
                      {store.trend === "flat" && <span className="text-gray-400">&#9644; Flat</span>}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <p className="text-gray-500">COGS%</p>
                    <p className={`font-medium ${store.cogsPct && store.cogsPct > 0.35 ? "text-yellow-400" : ""}`}>
                      {fmtPct(store.cogsPct)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Labor%</p>
                    <p className={`font-medium ${store.laborPct && store.laborPct > 0.30 ? "text-yellow-400" : ""}`}>
                      {fmtPct(store.laborPct)}
                    </p>
                  </div>
                </div>
                {store.flags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {store.flags.map((f, i) => (
                      <span key={i} className="text-[10px] bg-yellow-900/30 text-yellow-300 px-1.5 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-600 pb-4">
          Cilantro CEO Tool v1.0.0-mvp &middot; Data as of April 14, 2026
        </p>
      </main>
    </div>
  );
}
