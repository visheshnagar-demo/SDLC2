import React from "react";
import { useAuth, ROLES } from "../../context/AuthContext";
import {
  ShieldCheck,
  UserCheck,
  Bell,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

const BRAND_LOGO_URL =
  "/assets/preview/asset_3701c62a321b4641a2b052ef1746eb3f?session_id=chat-1793006305639";

export const Navbar = () => {
  const { currentUser, currentRole, switchRole, ROLES } = useAuth();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img
                src={BRAND_LOGO_URL}
                alt="ApexRe Specialty Logo"
                className="h-9 w-auto object-contain bg-slate-800 p-1 rounded border border-slate-700"
                onError={(e) => {
                  // Fallback styling if asset URL fails in sandbox
                  e.target.style.display = "none";
                }}
              />
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  ApexRe{" "}
                  <span className="text-sky-400 font-semibold text-xs uppercase px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                    Specialty Fac
                  </span>
                </span>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                  Facultative Underwriting Portal
                </p>
              </div>
            </div>
          </div>

          {/* Test Credentials & Role Switcher */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs">
              <span className="text-slate-400 mr-2 font-medium">
                Active Persona:
              </span>
              <select
                value={currentRole}
                onChange={(e) => switchRole(e.target.value)}
                className="bg-slate-900 text-sky-400 font-medium rounded px-2 py-1 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs cursor-pointer"
                aria-label="Switch Role Persona"
              >
                <option value={ROLES.CEDING_UNDERWRITER}>
                  Ceding Underwriter (External)
                </option>
                <option value={ROLES.REINSURANCE_UNDERWRITER}>
                  Reinsurance Underwriter (Internal)
                </option>
                <option value={ROLES.UNDERWRITING_MANAGER}>
                  Underwriting Manager (Internal)
                </option>
              </select>
            </div>

            {/* User Profile Badge */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-700">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentUser.organization}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
