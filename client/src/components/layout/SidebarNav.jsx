import React from "react";
import { NavLink } from "react-router-dom";
import {
  ShieldCheck,
  Inbox,
  PlusCircle,
  Layers,
  FileText,
  CheckCircle2,
} from "lucide-react";

export function SidebarNav() {
  const navItems = [
    {
      to: "/",
      label: "Underwriter Queue",
      icon: Inbox,
      badge: "Live",
    },
    {
      to: "/submit",
      label: "Carrier Portal",
      icon: PlusCircle,
      badge: "New",
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-inner">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wide text-white">
            AEGIS // RE
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Facultative Reinsurance
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-6 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Risk Class Appetite
        </div>
        <div className="px-3 space-y-2">
          <div className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-slate-800/50 text-cyan-300 border border-slate-800">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Cyber Risk Fac
            </span>
            <span className="text-[10px] font-mono text-slate-400">Active</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-slate-800/50 text-purple-300 border border-slate-800">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              D&O Liability Fac
            </span>
            <span className="text-[10px] font-mono text-slate-400">Active</span>
          </div>
        </div>
      </div>

      {/* Underwriting desk info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-900/80 border border-indigo-700/50 flex items-center justify-center text-xs font-bold text-indigo-200">
            UW
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-200 truncate">
              Senior Underwriter Desk
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Desk: NA-FAC-01
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SidebarNav;
