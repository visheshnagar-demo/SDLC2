import React from "react";
import { Bell, Search, ShieldCheck, User } from "lucide-react";

export default function HeaderBar({ title, subtitle }) {
  return (
    <header className="h-16 bg-white border-b border-[#E3E8F0] px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-[#0F1729] leading-tight">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-[#66738A]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Rules Engine Active</span>
        </div>

        {/* User profile badge */}
        <div className="flex items-center gap-2 pl-4 border-l border-[#E3E8F0]">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-[#E3E8F0]">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-[#0F1729]">Alex Morgan</p>
            <p className="text-[10px] text-[#66738A]">Senior Underwriter</p>
          </div>
        </div>
      </div>
    </header>
  );
}
