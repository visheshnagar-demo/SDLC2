import React from "react";
import { Search, Bell, Shield, Radio, CheckCircle2 } from "lucide-react";

export default function Header({ title = "Gen Re QTB Portal" }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Title & Market Indicator */}
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-700 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Market: North American Treaty (Property & Casualty)</span>
        </div>
      </div>

      {/* Center Search / Action info */}
      <div className="hidden lg:flex items-center relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search treaties, cedents, quotes... (⌘K)"
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          readOnly
        />
      </div>

      {/* Right Telemetry & Badges */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-800">
          <Radio className="w-3.5 h-3.5 text-blue-600" />
          <span>Synthetic Engine Active</span>
        </div>

        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-900">
              Gen Re Underwriting
            </span>
            <span className="text-[10px] text-slate-500">
              Autonomous Branch
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm">
            GR
          </div>
        </div>
      </div>
    </header>
  );
}
