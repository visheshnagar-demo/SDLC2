import React from "react";
import { Store, User, RefreshCw, Layers } from "lucide-react";

export default function Navbar({
  onRefresh,
  isRefreshing,
  clusterId = "cluster-04",
}) {
  return (
    <header className="bg-[#0F172A] text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#FDB813] text-[#0F172A] px-2.5 py-1 rounded font-black text-sm tracking-wider shadow-sm">
              DG
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Cluster Assortment Advisor
            </span>
          </div>
          <span className="hidden md:inline-block text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
            v1.0
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-[#1E293B] px-3 py-1.5 rounded-full border border-slate-700 text-[#FDB813] font-semibold shadow-inner">
            <Store className="w-3.5 h-3.5 text-[#FDB813]" />
            <span>Small Town Value Cluster</span>
            <span className="text-slate-400 font-normal">| Category:</span>
            <span className="text-white">Snacks</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-white">Cluster 04</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700/60">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-slate-300">
              catman.snacks@dollargeneral.local
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Dashboard Data"
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-full border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#FDB813]" : ""}`}
              />
              <span className="sr-only sm:not-sr-only text-[11px]">Sync</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
