"use client";

import { useState, useRef } from "react";
import {
  uploadSalesCSV,
  uploadCostsCSV,
  uploadCashCSV,
  syncPOS,
  type UploadResult,
} from "@/lib/ceo-api/client";

type UploadType = "sales" | "costs" | "cash";

const uploadConfig: Record<
  UploadType,
  { label: string; description: string; fn: (f: File) => Promise<UploadResult> }
> = {
  sales: {
    label: "Daily Sales",
    description:
      "Columns: store_name, date (YYYY-MM-DD), revenue, transactions, avg_ticket",
    fn: uploadSalesCSV,
  },
  costs: {
    label: "Costs",
    description:
      "Columns: store_name, date, category (cogs/labor/rent/utilities/marketing/other), amount, description",
    fn: uploadCostsCSV,
  },
  cash: {
    label: "Cash Position",
    description: "Columns: date, balance, inflows, outflows, notes",
    fn: uploadCashCSV,
  },
};

export default function DataUpload() {
  const [selectedType, setSelectedType] = useState<UploadType>("sales");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const config = uploadConfig[selectedType];
      const res = await config.fn(file);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handlePOSSync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);

    try {
      const res = await syncPOS();
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "POS sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Upload Data</h2>

      {/* Upload Type Selector */}
      <div className="flex gap-2">
        {(Object.keys(uploadConfig) as UploadType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type);
              setResult(null);
              setError(null);
            }}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedType === type
                ? "bg-haka-green text-black"
                : "bg-[#141a16] text-gray-300 hover:bg-[#1e2a24]"
            }`}
          >
            {uploadConfig[type].label}
          </button>
        ))}
      </div>

      {/* Upload Form */}
      <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-6">
        <p className="text-sm text-gray-400 mb-4">
          {uploadConfig[selectedType].description}
        </p>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">
              CSV File
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#1e2a24] file:text-gray-200 hover:file:bg-[#2a3a30]"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-haka-green hover:bg-haka-green-dark text-black font-medium px-6 py-2 rounded transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* POS Sync */}
      <div className="rounded-lg bg-[#141a16] border border-[#1e2a24] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              POS Auto-Sync
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Pull yesterday&apos;s sales data from the POS system (if
              configured)
            </p>
          </div>
          <button
            onClick={handlePOSSync}
            disabled={syncing}
            className="bg-[#1e2a24] hover:bg-[#2a3a30] text-gray-200 font-medium px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync POS"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg p-4 ${
            result.status === "success"
              ? "bg-emerald-900/20 border border-emerald-500"
              : result.status === "error"
              ? "bg-red-900/20 border border-red-500"
              : "bg-yellow-900/20 border border-yellow-500"
          }`}
        >
          <p className="font-semibold text-white mb-1">
            Status: {result.status} &middot; {result.rows_imported} rows
            imported
          </p>
          {result.warnings.map((w, i) => (
            <p key={`w-${i}`} className="text-sm text-yellow-300">
              {w}
            </p>
          ))}
          {result.errors.map((e, i) => (
            <p key={`e-${i}`} className="text-sm text-red-300">
              {e}
            </p>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-500 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
