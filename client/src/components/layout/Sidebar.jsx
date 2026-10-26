import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FilePlus2,
  Inbox,
  LayoutDashboard,
  ShieldAlert,
  FileCheck2,
  History,
  Lock,
  ExternalLink,
} from "lucide-react";

export const Sidebar = () => {
  const { isCedingUser, isUnderwriter, isManager, currentUser } = useAuth();

  const navItems = [
    {
      to: "/submissions/new",
      label: "New Risk Intake",
      icon: FilePlus2,
      badge: "Step 1-4",
      visible: true,
    },
    {
      to: "/underwriter/queue",
      label: "Underwriter Queue",
      icon: Inbox,
      badge: isUnderwriter || isManager ? "Live" : "Restricted",
      visible: true,
    },
    {
      to: "/manager/dashboard",
      label: "Executive Analytics",
      icon: LayoutDashboard,
      badge: isManager ? "Manager" : "Portfolio",
      visible: true,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div>
        <div className="px-3 mb-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Specialty Workspaces
          </p>
        </div>

        <nav className="space-y-1.5" aria-label="Sidebar Navigation">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sky-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
        </nav>

        {/* LOB Quick Filters Info */}
        <div className="mt-8 px-3">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Active Specialty Lines
          </p>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span>Cyber Risk</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                $25M Cap
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span>D&O Liability</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                $50M Cap
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span>E&O / Cyber Blend</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                $20M Cap
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span>EPLI</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                $15M Cap
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Medical Malpractice</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                $30M Cap
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Authority Limit & Compliance Footnote */}
      <div className="mt-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
          <span>Authority Level</span>
        </div>
        <p className="text-xs text-slate-400">
          {currentUser.authority_limit > 0
            ? `Individual Signing Limit: $${(currentUser.authority_limit / 1000000).toFixed(1)}M`
            : "External Submitter — No Direct Binding Authority"}
        </p>
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between pt-1.5 border-t border-slate-700/50">
          <span>AES-256 / SOC2 Encrypted</span>
          <span className="text-emerald-400 font-medium">Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
