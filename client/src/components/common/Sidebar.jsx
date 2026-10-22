import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth, ROLES } from "../../context/AuthContext";
import {
  FilePlus,
  Layers,
  LayoutDashboard,
  History,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export default function Sidebar() {
  const { currentRole, roles } = useAuth();

  const links = [
    {
      to: "/intake",
      label: "New Risk Intake",
      icon: FilePlus,
      roles: [roles.CEDENT, roles.UNDERWRITER, roles.MANAGER],
    },
    {
      to: "/queue",
      label: "Review Queue & SLA",
      icon: Layers,
      roles: [roles.CEDENT, roles.UNDERWRITER, roles.MANAGER],
    },
    {
      to: "/dashboard",
      label: "Executive Dashboard",
      icon: LayoutDashboard,
      roles: [roles.UNDERWRITER, roles.MANAGER],
    },
    {
      to: "/audit",
      label: "Audit & Governance",
      icon: History,
      roles: [roles.CEDENT, roles.UNDERWRITER, roles.MANAGER],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-3">
          Specialty Operations
        </div>
        <nav className="space-y-1">
          {links
            .filter((link) => link.roles.includes(currentRole))
            .map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 text-primary font-semibold shadow-xs border-r-4 border-primary"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
        </nav>

        {/* Specialty Lines Covered Box */}
        <div className="mt-8 bg-slate-50 rounded-xl p-3.5 border border-slate-200">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            Specialty Lines
          </div>
          <ul className="text-xs space-y-1.5 text-slate-600">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Cyber Risk
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              D&O (Directors & Officers)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              E&O (Errors & Omissions)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              EPLI (Employment Practices)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Medical Professional Liability
            </li>
          </ul>
        </div>
      </div>

      {/* Underwriting authority notice */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="text-xs font-medium text-slate-500">
          Underwriting Authority:
        </div>
        <div className="text-sm font-bold text-slate-800">
          {currentRole === roles.MANAGER
            ? "$50,000,000 (Manager)"
            : currentRole === roles.UNDERWRITER
              ? "$5,000,000 (Standard)"
              : "External Cedant"}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          {currentRole === roles.UNDERWRITER &&
            "Submissions > $5M trigger manager referral."}
          {currentRole === roles.MANAGER &&
            "Full authority to approve referred risks."}
        </div>
      </div>
    </aside>
  );
}
