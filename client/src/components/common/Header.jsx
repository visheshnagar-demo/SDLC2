import React from "react";
import PersonaSwitcher from "./PersonaSwitcher";
import {
  RefreshCw,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Database,
} from "lucide-react";

export default function Header({
  activeCase,
  currentPersonaKey,
  onSelectPersona,
  activeScenarioId,
  onSelectScenario,
  onResetCase,
  isSyncing,
}) {
  return (
    <header className="h-16 bg-[#0B192C] border-b border-slate-800 text-white flex items-center justify-between px-6 sticky top-0 z-40 select-none shadow-md">
      {/* Left: Brand & Case Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center font-black text-white text-base tracking-tighter shadow-inner">
            GR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">
                GEN RE
              </span>
              <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Quote-to-Bind
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight">
              Agentic Underwriting & Governance OS
            </div>
          </div>
        </div>

        <div className="h-7 w-px bg-slate-800 hidden md:block" />

        {/* Active Case Meta */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-md flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">
              Case ID:
            </span>
            <span className="text-xs font-semibold text-teal-300 font-mono">
              {activeCase?.caseNumber || "N/A"}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-md flex items-center gap-2">
            <span className="text-[10px] uppercase text-slate-400 font-medium">
              LOB:
            </span>
            <span className="text-xs font-medium text-slate-200 truncate max-w-[220px]">
              {activeCase?.lineOfBusiness}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-800">
            {activeCase?.requiresReferral ? (
              <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" /> Referral Deal
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Standard Flow
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Scenario Selector, Persona Switcher, Reset & Live Status */}
      <div className="flex items-center gap-3">
        {/* Scenario Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
          <span className="text-[10px] font-semibold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">
            Demo:
          </span>
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-slate-800 text-xs text-slate-100 font-medium rounded px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            aria-label="Select Demo Scenario"
          >
            <option value="scenario_a">
              Scenario A: Low-Risk Renewal ($10M Quota Share)
            </option>
            <option value="scenario_b">
              Scenario B: Incomplete Submission (RFI / Exception)
            </option>
            <option value="scenario_c">
              Scenario C: High-Exposure Referral ($25M xs $10M)
            </option>
          </select>
        </div>

        {/* Reset State Button */}
        <button
          onClick={onResetCase}
          title="Reset Active Scenario to Initial Synthetic State"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Persona Switcher */}
        <PersonaSwitcher
          currentPersonaKey={currentPersonaKey}
          onSelectPersona={onSelectPersona}
        />

        {/* Live Sync Pulse */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
          <span
            className={`w-2 h-2 rounded-full ${isSyncing ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`}
          />
          <span className="hidden xl:inline">
            {isSyncing ? "Orchestrator Syncing..." : "12 Agents Active"}
          </span>
        </div>
      </div>
    </header>
  );
}
