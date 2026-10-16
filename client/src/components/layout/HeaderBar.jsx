import React from "react";
import PropTypes from "prop-types";
import {
  ShieldCheck,
  UserCheck,
  Bell,
  Search,
  ExternalLink,
} from "lucide-react";

export function HeaderBar({
  title = "AIG Facultative Gateway",
  userRole = "Senior Reinsurance Underwriter",
}) {
  return (
    <header className="bg-white border-b border-[#E3E8F0] px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#2461F5] flex items-center justify-center text-white shadow-sm font-bold text-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#0F1729] leading-tight">
              {title}
            </h1>
            <p className="text-[11px] font-medium text-[#66738A]">
              Cyber & D&O Facultative Reinsurance Risk Engine
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Test Credentials banner pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium">Test Account:</span>
          <code className="bg-white/80 px-1.5 py-0.5 rounded text-[11px] font-mono">
            test@example.com / testpassword
          </code>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#E3E8F0]">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <UserCheck className="w-4 h-4 text-[#2461F5]" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-[#0F1729]">
              Alex Morgan
            </div>
            <div className="text-[11px] text-[#66738A]">{userRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

HeaderBar.propTypes = {
  title: PropTypes.string,
  userRole: PropTypes.string,
};

export default HeaderBar;
