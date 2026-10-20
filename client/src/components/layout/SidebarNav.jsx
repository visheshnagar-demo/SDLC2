import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ShieldAlert,
  CheckSquare,
  Activity,
  Layers,
} from "lucide-react";

export default function SidebarNav() {
  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Documents & Ingestion", path: "/documents", icon: FileText },
    { name: "Treaty Analysis", path: "/analysis", icon: ShieldAlert },
    { name: "Decision Workspace", path: "/decisions", icon: CheckSquare },
  ];

  return (
    <aside className="w-64 bg-[#0F2744] text-white p-4 flex flex-col justify-between shrink-0 shadow-lg min-h-screen">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2 py-2">
          <img src="/GENRE.svg" alt="Gen Re Logo" className="h-9 w-auto" />
          <span className="text-lg font-bold tracking-tight text-white">
            Gen Re AI Engine
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#1E3A8A] text-white shadow-sm font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status Footprint */}
      <div className="pt-4 border-t border-slate-700/60 px-2 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
            Multi-Agent Pipeline
          </span>
          <span className="font-mono text-emerald-400">ONLINE</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            Active Engine
          </span>
          <span className="text-slate-300">v1.0 (GPT-4o / Claude)</span>
        </div>
      </div>
    </aside>
  );
}
