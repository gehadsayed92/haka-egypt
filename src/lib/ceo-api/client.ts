/**
 * Cilantro CEO Tool - API Client
 *
 * Typed client for the FastAPI backend. Handles authentication,
 * error handling, and response parsing.
 *
 * API key is read from environment variable (NEXT_PUBLIC_CEO_API_KEY)
 * for client-side calls, or CEO_API_KEY for server-side.
 */

const API_BASE = process.env.NEXT_PUBLIC_CEO_API_URL || "http://localhost:8000";
const API_KEY =
  process.env.NEXT_PUBLIC_CEO_API_KEY || process.env.CEO_API_KEY || "";

// ─── Types (mirror backend Pydantic schemas) ─────────────────────────

export interface AlertItem {
  id: number;
  severity: "critical" | "warning" | "info" | "opportunity";
  title: string;
  message: string;
  action: string | null;
  store_name: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface StoreInsight {
  store_name: string;
  store_id: number;
  today_revenue: number | null;
  avg_30d_revenue: number | null;
  revenue_trend: "up" | "down" | "flat" | null;
  cogs_percent: number | null;
  labor_percent: number | null;
  status: "healthy" | "warning" | "critical";
  flags: string[];
}

export interface MorningBrief {
  date: string;
  greeting: string;
  total_revenue_yesterday: number | null;
  total_revenue_trend: string | null;
  cash_position: number | null;
  cash_runway_days: number | null;
  alerts: AlertItem[];
  store_insights: StoreInsight[];
  top_actions: string[];
  data_freshness: string;
}

export interface UploadResult {
  status: string;
  rows_imported: number;
  errors: string[];
  warnings: string[];
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  components: {
    database: string;
    pos_api: string;
    api_keys_configured: boolean;
  };
  version: string;
}

// ─── API Client ──────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "X-API-Key": API_KEY,
    ...((options.headers as Record<string, string>) || {}),
  };

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API error ${res.status}: ${errorBody}`);
  }

  return res.json();
}

// ─── Endpoints ───────────────────────────────────────────────────────

export async function getMorningBrief(): Promise<MorningBrief> {
  return apiFetch<MorningBrief>("/api/v1/insights/morning-brief");
}

export async function getStoreInsight(
  storeId: number
): Promise<StoreInsight> {
  return apiFetch<StoreInsight>(`/api/v1/insights/store/${storeId}`);
}

export async function getAlerts(
  severity?: string
): Promise<AlertItem[]> {
  const params = severity ? `?severity=${severity}` : "";
  return apiFetch<AlertItem[]>(`/api/v1/insights/alerts${params}`);
}

export async function resolveAlert(alertId: number): Promise<void> {
  await apiFetch(`/api/v1/insights/alerts/${alertId}/resolve`, {
    method: "POST",
  });
}

export async function uploadSalesCSV(
  file: File
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadResult>("/api/v1/data/upload/sales", {
    method: "POST",
    body: formData,
  });
}

export async function uploadCostsCSV(
  file: File
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadResult>("/api/v1/data/upload/costs", {
    method: "POST",
    body: formData,
  });
}

export async function uploadCashCSV(
  file: File
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadResult>("/api/v1/data/upload/cash", {
    method: "POST",
    body: formData,
  });
}

export async function syncPOS(
  targetDate?: string
): Promise<UploadResult> {
  const params = targetDate ? `?target_date=${targetDate}` : "";
  return apiFetch<UploadResult>(`/api/v1/data/sync-pos${params}`, {
    method: "POST",
  });
}

export async function getHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>("/health");
}
