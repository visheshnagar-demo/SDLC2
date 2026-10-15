import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Send, ShieldCheck, Sparkles } from "lucide-react";
import Button from "../common/Button";

export const Header = ({ onSearch, searchValue = "" }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#151B2B] border-b border-[#33394A]/40 px-6 flex items-center justify-between shrink-0">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search accounts, transactions, or reference IDs..."
            value={searchValue}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-[#191F2F] border border-[#33394A]/60 rounded-lg pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* System Health Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#191F2F] border border-[#33394A]/40 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[#94A3B8]">Ledger Engine:</span>
          <span className="text-[#F8FAFC] font-medium">ONLINE</span>
        </div>

        {/* Transfer Quick Action */}
        <Button
          variant="primary"
          size="sm"
          icon={Send}
          onClick={() => navigate("/transfers")}
          className="shadow-sm"
        >
          Transfer Funds
        </Button>

        {/* Notifications Bell */}
        <div className="relative p-2 rounded-lg bg-[#191F2F] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#33394A]/40 cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0EA5E9] rounded-full"></span>
        </div>
      </div>
    </header>
  );
};

export default Header;
