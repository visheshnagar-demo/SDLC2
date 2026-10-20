import React from "react";
import { User, Bell, Search, ShieldCheck } from "lucide-react";

export default function TopHeader({ title = "Underwriting Risk Dashboard" }) {
  return (
    <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center space-x-3">
        <img src="/GENRE.svg" alt="Gen Re Header Logo" className="h-7 w-auto" />
        <div className="h-5 w-px bg-slate-300"></div>
        <h1 className="text-xl font-bold text-[#0F2744] tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Environment badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Treaty Analysis Engine</span>
        </div>

        {/* User Role */}
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
          Role: Senior Risk Analyst
        </span>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#0F2744] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            RA
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">
              Underwriter Portal
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              test@example.com
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
