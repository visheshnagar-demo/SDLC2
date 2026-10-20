import React from "react";
import { useAuth, ROLES } from "../../context/AuthContext";
import { ShieldCheck, UserCheck, Users, Sliders, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  const { currentRole, currentUser, switchRole } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Brand & Context */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Apex Specialty Reinsurance
            </span>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Facultative Reinsurance Submission & Underwriting Portal
            </h1>
          </div>
        </div>

        {/* Action Toolbar & Role Switcher */}
        <div className="flex items-center space-x-4">
          {/* Active User / Org pill */}
          <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-800">
              {currentUser.name}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">{currentUser.organization}</span>
          </div>

          {/* Persona Switcher for Evaluation */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-1 rounded-lg">
            <span className="text-xs font-semibold text-slate-500 pl-2 pr-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) => switchRole(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Switch User Role Persona"
            >
              <option value={ROLES.CEDING}>Ceding Insurer (Cedant)</option>
              <option value={ROLES.UNDERWRITER}>Reinsurance Underwriter</option>
              <option value={ROLES.MANAGER}>Underwriting Manager</option>
            </select>
          </div>

          {/* Quick config link */}
          <Link
            to="/config-rules"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="Configure Underwriting & Scoring Rules"
            aria-label="Scoring Configuration"
          >
            <Sliders className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
