import React from "react";
import { NavLink } from "react-router-dom";
import {
  Calculator,
  ShieldCheck,
  FileCheck2,
  Activity,
  Layers,
  Database,
  UserCheck,
} from "lucide-react";

export default function Sidebar() {
  const navItems = [
    {
      to: "/quoting",
      label: "Quoting & Pricing",
      description: "Reinsurance Submissions",
      icon: Calculator,
    },
    {
      to: "/underwriting",
      label: "Risk Structuring",
      description: "Layer Matrix & Underwriting",
      icon: Layers,
    },
    {
      to: "/binders",
      label: "Policy Binding",
      description: "Certificates & Binders",
      icon: FileCheck2,
    },
  ];

  return (
    <aside className="w-64 bg-primary text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none shadow-xl">
      <div>
        {/* Gen Re Brand Header */}
        <div className="p-5 border-b border-primary-light/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl tracking-wider text-white shadow-md border border-blue-400/30">
              GR
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-tight text-white">
                Gen Re QTB
              </h1>
              <p className="text-xs text-blue-200 tracking-wide uppercase font-medium">
                Treaty & Quoting Portal
              </p>
            </div>
          </div>
        </div>

        {/* System Mode Badge */}
        <div className="px-5 py-3 bg-primary-dark/60 border-b border-slate-800">
          <div className="flex items-center justify-between text-xs text-blue-200">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Engine Data Mode
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-900/80 text-emerald-300 rounded-full border border-emerald-500/40">
              SYNTHETIC
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workflows
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-start space-x-3 px-3.5 py-3 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-blue-700 text-white font-semibold shadow-sm border border-blue-400/40"
                      : "text-slate-300 hover:bg-primary-light/40 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 mt-0.5 text-blue-300" />
                <div>
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[11px] text-blue-200/70 font-normal mt-0.5">
                    {item.description}
                  </div>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Underwriter Profile & Telemetry Footer */}
      <div className="p-4 border-t border-primary-light/30 bg-primary-dark/80 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Backend API: Spring Boot 3
          </span>
          <span className="text-emerald-400 font-medium">v1.0.0</span>
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-xs font-semibold text-white">
            AJ
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              Aarchi Jain
            </p>
            <p className="text-[11px] text-blue-200 truncate">
              Lead Treaty Underwriter
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
