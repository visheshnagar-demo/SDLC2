import React from "react";
import {
  Shield,
  Calculator,
  History,
  CheckCircle,
  UserCheck,
} from "lucide-react";

export default function CalculatorAppShell({
  activeTab,
  onTabChange,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-inner text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white font-sans">
                Apex Shield
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Insurance Portal
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            <button
              type="button"
              onClick={() => onTabChange("calculator")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "calculator"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Premium Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("audit")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "audit"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit History</span>
            </button>
          </nav>
        </div>

        {/* System & Agent Footer in Sidebar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-300">
              Rating Engine Online
            </span>
          </div>
          <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800 text-slate-400">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
              AG
            </div>
            <div className="truncate">
              <div className="text-[11px] font-bold text-slate-200 truncate">
                Agent Portal
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Underwriter Level 2
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {activeTab === "calculator"
                ? "Instant Motor Insurance Premium Calculator"
                : "Quote Calculation History & Audit Trail"}
            </h1>
            <p className="text-xs text-slate-500">
              Automated actuarial quote generation and compliance audit ledger
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>SLA Target: &lt; 2.0s</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-6 flex-1 bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
