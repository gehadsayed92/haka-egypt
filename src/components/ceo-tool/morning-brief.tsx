"use client";

import { useState, useEffect } from "react";
import {
  getMorningBrief,
  resolveAlert,
  type MorningBrief,
  type AlertItem,
  type StoreInsight,
} from "@/lib/ceo-api/client";

// ─── Severity styling ────────────────────────────────────────────────

const severityConfig = {
  critical: {
    bg: "bg-red-900/30",
    border: "border-red-500",
    badge: "bg-red-600 text-white",
    icon: "!!",
  },
  warning: {
    bg: "bg-yellow-900/20",
    border: "border-yellow-500",
    badge: "bg-yellow-600 text-black",
    icon: "!",
  },
  opportunity: {
    bg: "bg-emerald-900/20",
    border: "border-emerald-500",
    badge: "bg-emerald-600 text-white",
    icon: "+",
  },
  info: {
    bg: "bg-blue-900/20",
    border: "border-blue-500",
    badge: "bg-blue-600 text-white",
    icon: "i",
  },
};

const storeStatusColors = {
  healthy: "text-emerald-400",
  warning: "text-yellow-400",
  critical: "text-red-400",
};

// ─── Format helpers ──────────────────────────────────────────────────

function formatEGP(amount: number | null): string {
  if (amount === null) return "—";
  return `EGP ${amount.toLocaleString("en-EG", { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

// ─── Sub-components ──────────────────────────────────────────────────

function KPICard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string | null;
}) {
  return (
    <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function AlertCard({
  alert,
  onResolve,
}: {
  alert: AlertItem;
  onResolve: (id: number) => void;
}) {
  const config = severityConfig[alert.severity];

  return (
    <div
      className={`rounded-lg ${config.bg} border-l-4 ${config.border} p-4 mb-3`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${config.badge}`}
            >
              {config.icon}
            </span>
            <span className="font-semibold text-white text-sm">
              {alert.title}
            </span>
            {alert.store_name && (
              <span className="text-xs text-gray-400">
                {alert.store_name}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
          {alert.action && (
            <p className="text-sm text-gray-200 italic">
              Action: {alert.action}
            </p>
          )}
        </div>
        <button
          onClick={() => onResolve(alert.id)}
          className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 rounded px-2 py-1 transition-colors shrink-0"
          title="Mark as resolved"
        >
          Resolve
        </button>
      </div>
    </div>
  );
}

function StoreRow({ store }: { store: StoreInsight }) {
  const statusColor = storeStatusColors[store.status];

  return (
    <tr className="border-b border-[#1e2a24] hover:bg-[#111815]/50">
      <td className="py-3 px-4">
        <span className="font-medium text-white">{store.store_name}</span>
      </td>
      <td className="py-3 px-4 text-right">
        {formatEGP(store.today_revenue)}
      </td>
      <td className="py-3 px-4 text-right">
        {formatEGP(store.avg_30d_revenue)}
      </td>
      <td className="py-3 px-4 text-center">
        {store.revenue_trend === "up" && (
          <span className="text-emerald-400">&#9650;</span>
        )}
        {store.revenue_trend === "down" && (
          <span className="text-red-400">&#9660;</span>
        )}
        {store.revenue_trend === "flat" && (
          <span className="text-gray-400">&#9644;</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        {formatPercent(store.cogs_percent)}
      </td>
      <td className="py-3 px-4 text-right">
        {formatPercent(store.labor_percent)}
      </td>
      <td className="py-3 px-4">
        <span className={`font-semibold capitalize ${statusColor}`}>
          {store.status}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-400">
        {store.flags.length > 0 ? store.flags.join(", ") : "—"}
      </td>
    </tr>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function MorningBriefView() {
  const [brief, setBrief] = useState<MorningBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrief = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMorningBrief();
      setBrief(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load morning brief"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrief();
  }, []);

  const handleResolve = async (alertId: number) => {
    try {
      await resolveAlert(alertId);
      // Refresh brief after resolving
      await fetchBrief();
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  // ─── Loading / Error States ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 animate-pulse text-lg">
          Loading morning brief...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-500 p-6 text-center">
        <p className="text-red-400 font-semibold mb-2">
          Could not load morning brief
        </p>
        <p className="text-sm text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchBrief}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!brief) return null;

  // ─── Render ──────────────────────────────────────────────────────

  const criticalAlerts = brief.alerts.filter(
    (a) => a.severity === "critical"
  );
  const otherAlerts = brief.alerts.filter(
    (a) => a.severity !== "critical"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {brief.greeting}
          </h1>
          <p className="text-gray-400">
            {brief.date} &middot; Data:{" "}
            <span
              className={
                brief.data_freshness === "current"
                  ? "text-emerald-400"
                  : "text-yellow-400"
              }
            >
              {brief.data_freshness}
            </span>
          </p>
        </div>
        <button
          onClick={fetchBrief}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded px-3 py-1.5 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Revenue Yesterday"
          value={formatEGP(brief.total_revenue_yesterday)}
          sub={brief.total_revenue_trend}
        />
        <KPICard
          label="Cash Position"
          value={formatEGP(brief.cash_position)}
        />
        <KPICard
          label="Cash Runway"
          value={
            brief.cash_runway_days !== null
              ? `${brief.cash_runway_days} days`
              : "—"
          }
          sub={
            brief.cash_runway_days !== null && brief.cash_runway_days < 14
              ? "Below minimum"
              : null
          }
        />
        <KPICard
          label="Active Alerts"
          value={`${brief.alerts.length}`}
          sub={
            criticalAlerts.length > 0
              ? `${criticalAlerts.length} critical`
              : "None critical"
          }
        />
      </div>

      {/* Top Actions */}
      {brief.top_actions.length > 0 && (
        <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Today&apos;s Priority Actions
          </h2>
          <ol className="space-y-2">
            {brief.top_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-haka-green/20 text-haka-green flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-200">{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
            Critical Alerts
          </h2>
          {criticalAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}

      {/* Other Alerts */}
      {otherAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Warnings & Opportunities
          </h2>
          {otherAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}

      {/* Store Performance Table */}
      {brief.store_insights.length > 0 && (
        <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] overflow-hidden">
          <div className="p-4 border-b border-[#1e2a24]">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Store Performance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="bg-[#111815] text-xs uppercase text-gray-400">
                <tr>
                  <th className="py-3 px-4 text-left">Store</th>
                  <th className="py-3 px-4 text-right">Yesterday</th>
                  <th className="py-3 px-4 text-right">30d Avg</th>
                  <th className="py-3 px-4 text-center">Trend</th>
                  <th className="py-3 px-4 text-right">COGS%</th>
                  <th className="py-3 px-4 text-right">Labor%</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Flags</th>
                </tr>
              </thead>
              <tbody>
                {brief.store_insights.map((store) => (
                  <StoreRow key={store.store_id} store={store} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
