"use client";

import { useState } from "react";
import MorningBriefView from "@/components/ceo-tool/morning-brief";
import DataUpload from "@/components/ceo-tool/data-upload";

type Tab = "brief" | "upload";

export default function CEOToolPage() {
  const [activeTab, setActiveTab] = useState<Tab>("brief");

  return (
    <div className="min-h-screen bg-[#080c0a]">
      {/* Top Bar */}
      <header className="border-b border-[#1e2a24] bg-[#0d1210]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-haka-green flex items-center justify-center text-black font-bold text-sm">
              C
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                Cilantro CEO Tool
              </h1>
              <p className="text-xs text-gray-500">
                Decision Engine &middot; MVP
              </p>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab("brief")}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === "brief"
                  ? "bg-haka-green text-black"
                  : "text-gray-400 hover:text-white hover:bg-[#141a16]"
              }`}
            >
              Morning Brief
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === "upload"
                  ? "bg-haka-green text-black"
                  : "text-gray-400 hover:text-white hover:bg-[#141a16]"
              }`}
            >
              Upload Data
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "brief" && <MorningBriefView />}
        {activeTab === "upload" && <DataUpload />}
      </main>
    </div>
  );
}
