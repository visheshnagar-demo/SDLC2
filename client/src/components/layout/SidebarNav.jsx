import React from "react";
import { NavLink } from "react-router-dom";
import {
  Shield,
  FilePlus,
  Inbox,
  Scale,
  CheckSquare,
  Search,
} from "lucide-react";

export default function SidebarNav() {
  const navItems = [
    {
      to: "/carrier/new",
      label: "New Submission",
      icon: FilePlus,
      badge: "Carrier",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      to: "/carrier/submissions",
      label: "Carrier Portal",
      icon: Inbox,
      badge: null,
    },
    {
      to: "/underwriting/queue",
      label: "Underwriter Queue",
      icon: Scale,
      badge: "Review",
      badgeColor: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E3E8F0] flex flex-col shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E3E8F0] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2461F5] to-[#0885E3] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-[#0F1729] leading-tight">
            Facultative Portal
          </h1>
          <p className="text-xs text-[#66738A]">Cyber & D&O Reinsurance</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#66738A]">
          Workflows
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#EDF2FF] text-[#2461F5] font-semibold shadow-xs"
                  : "text-[#66738A] hover:bg-gray-50 hover:text-[#0F1729]"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || "bg-gray-100 text-gray-600"}`}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="pt-6 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#66738A]">
          Quick Filters
        </div>
        <NavLink
          to="/underwriting/queue?risk_type=CYBER"
          className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-[#66738A] hover:bg-gray-50 hover:text-[#0F1729]"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          <span>Cyber Submissions</span>
        </NavLink>
        <NavLink
          to="/underwriting/queue?risk_type=D_AND_O"
          className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-[#66738A] hover:bg-gray-50 hover:text-[#0F1729]"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>D&O Submissions</span>
        </NavLink>
        <NavLink
          to="/underwriting/queue?risk_tier=HIGH"
          className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-[#66738A] hover:bg-gray-50 hover:text-[#0F1729]"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>High / Critical Risks</span>
        </NavLink>
      </div>

      {/* Role / Environment Footer */}
      <div className="p-4 border-t border-[#E3E8F0] bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2461F5] flex items-center justify-center font-bold text-xs">
            UW
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#0F1729] truncate">
              Underwriting Team
            </p>
            <p className="text-[11px] text-[#66738A] truncate">
              Active Session
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
