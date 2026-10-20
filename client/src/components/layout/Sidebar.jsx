import React from "react";
import { NavLink } from "react-router-dom";
import {
  FilePlus2,
  Inbox,
  Calculator,
  BarChart3,
  Sliders,
  Shield,
  Info,
} from "lucide-react";
import { useAuth, ROLES } from "../../context/AuthContext";

export const Sidebar = () => {
  const { currentRole, currentUser } = useAuth();

  const navItems = [
    {
      to: "/intake",
      label: "New Risk Intake",
      icon: FilePlus2,
      roles: [ROLES.CEDING, ROLES.UNDERWRITER, ROLES.MANAGER],
    },
    {
      to: "/queue",
      label: "Underwriter Queue",
      icon: Inbox,
      roles: [ROLES.CEDING, ROLES.UNDERWRITER, ROLES.MANAGER],
    },
    {
      to: "/manager-dashboard",
      label: "Manager Portfolio",
      icon: BarChart3,
      roles: [ROLES.UNDERWRITER, ROLES.MANAGER],
    },
    {
      to: "/config-rules",
      label: "Rules & Authority",
      icon: Sliders,
      roles: [ROLES.UNDERWRITER, ROLES.MANAGER],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      {/* Navigation menu */}
      <div className="p-4 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Specialty Portals
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isAccessible = item.roles.includes(currentRole);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {!isAccessible && (
                  <span className="ml-auto text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    Restricted
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* LOB Coverage tags */}
        <div className="mt-8 pt-6 border-t border-slate-800 px-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Specialty Lines (LOB)
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Cyber Risk
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              D&O Liability
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              E&O Tech
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              EPLI
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Med Mal
            </span>
          </div>
        </div>
      </div>

      {/* Role & Seed credentials badge */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center space-x-2 text-slate-200">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{currentUser.roleTitle}</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {currentRole === ROLES.CEDING &&
            "Viewing submissions for Hartford General only."}
          {currentRole === ROLES.UNDERWRITER &&
            "Authority Limit: $5,000,000 max policy limit."}
          {currentRole === ROLES.MANAGER &&
            "Full managerial approval & portfolio override authority."}
        </p>
        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-start gap-1">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <span>
            Seed Account:{" "}
            <strong className="text-slate-300">{currentUser.email}</strong> /
            testpassword
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
