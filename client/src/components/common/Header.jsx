import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, ROLES } from "../../context/AuthContext";
import {
  Shield,
  FilePlus,
  Layers,
  LayoutDashboard,
  History,
  UserCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function Header() {
  const { currentUser, currentRole, switchRole, roles } = useAuth();
  const location = useLocation();

  const navLinks = [
    {
      path: "/intake",
      label: "Submit Risk",
      icon: FilePlus,
      roles: [roles.CEDENT, roles.UNDERWRITER, roles.MANAGER],
    },
    {
      path: "/queue",
      label: "Underwriter Queue",
      icon: Layers,
      roles: [roles.CEDENT, roles.UNDERWRITER, roles.MANAGER],
    },
    {
      path: "/dashboard",
      label: "Manager Dashboard",
      icon: LayoutDashboard,
      roles: [roles.UNDERWRITER, roles.MANAGER],
    },
    {
      path: "/audit",
      label: "Audit Trail",
      icon: History,
      roles: [roles.CEDENT, roles.UNDERWRITER, roles.MANAGER],
    },
  ];

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md border-b border-primary-container">
      {/* Top utility notification bar */}
      <div className="bg-slate-900/40 text-slate-200 text-xs py-1 px-4 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            SYSTEM ONLINE
          </span>
          <span className="hidden sm:inline text-slate-300">
            Facultative Reinsurance Engine • Specialty Lines (Cyber, D&O, E&O,
            EPLI, MPL)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Test Account:</span>
          <span className="font-mono text-slate-200 bg-slate-800/80 px-1.5 py-0.5 rounded">
            {currentUser.email}
          </span>
          <span className="text-slate-400 hidden md:inline">
            Authority: ${currentUser.authorityLimit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/queue" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-lg text-white flex items-center gap-1.5">
              <span>RESECURE</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                FACULTATIVE
              </span>
            </div>
            <div className="text-[11px] text-blue-200/80 font-medium tracking-wide uppercase">
              Specialty Reinsurance Submission & Underwriting
            </div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks
            .filter((link) => link.roles.includes(currentRole))
            .map((link) => {
              const Icon = link.icon;
              const isActive =
                location.pathname === link.path ||
                (link.path === "/queue" &&
                  location.pathname.startsWith("/submissions/"));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* User Profile & Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:block">
            <div className="text-xs font-semibold text-white flex items-center justify-end gap-1">
              <span>{currentUser.name}</span>
              <UserCheck className="w-3.5 h-3.5 text-blue-300" />
            </div>
            <div className="text-[11px] text-blue-200">
              {currentUser.organization}
            </div>
          </div>

          {/* Interactive Role Switcher Pill */}
          <div className="relative inline-block">
            <label htmlFor="role-select" className="sr-only">
              Active Portal Role
            </label>
            <select
              id="role-select"
              aria-label="Active Portal Role"
              value={currentRole}
              onChange={(e) => switchRole(e.target.value)}
              className="bg-slate-900/60 hover:bg-slate-900 border border-white/30 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors shadow-sm"
            >
              <option value={ROLES.CEDENT} className="bg-slate-900 text-white">
                Role: Ceding Insurer
              </option>
              <option
                value={ROLES.UNDERWRITER}
                className="bg-slate-900 text-white"
              >
                Role: Reinsurance Underwriter ($5M Auth)
              </option>
              <option value={ROLES.MANAGER} className="bg-slate-900 text-white">
                Role: Underwriting Manager ($50M Auth)
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
