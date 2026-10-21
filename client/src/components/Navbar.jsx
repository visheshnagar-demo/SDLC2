import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, DEFAULT_USERS } from "../context/AuthContext";
import {
  ShieldCheck,
  FileText,
  ListFilter,
  BarChart3,
  Sliders,
  UserCheck,
  LogOut,
  Building2,
  AlertTriangle,
  Layers,
} from "lucide-react";

export default function Navbar() {
  const {
    user,
    switchPersona,
    logout,
    isCedingUnderwriter,
    isReinsuranceUnderwriter,
    isUnderwritingManager,
  } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Title */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors shadow-sm">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  APEX RE
                </span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                  Specialty Fac Portal
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 ml-6">
              {/* Submission Intake */}
              <Link
                to="/intake"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/intake")
                    ? "bg-indigo-900/60 text-indigo-200 border border-indigo-700/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>
                  {isCedingUnderwriter ? "New Risk Submission" : "Intake Form"}
                </span>
              </Link>

              {/* Review Queue */}
              <Link
                to="/queue"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/queue")
                    ? "bg-indigo-900/60 text-indigo-200 border border-indigo-700/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <ListFilter className="w-4 h-4 text-emerald-400" />
                <span>
                  {isCedingUnderwriter ? "My Submissions" : "Underwriter Queue"}
                </span>
              </Link>

              {/* Manager Dashboard & Referrals */}
              {(isUnderwritingManager || isReinsuranceUnderwriter) && (
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "bg-indigo-900/60 text-indigo-200 border border-indigo-700/50"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Portfolio Analytics</span>
                </Link>
              )}

              {/* Scoring Rules Matrix */}
              {(isUnderwritingManager || isReinsuranceUnderwriter) && (
                <Link
                  to="/rules"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/rules")
                      ? "bg-indigo-900/60 text-indigo-200 border border-indigo-700/50"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Scoring Rules</span>
                </Link>
              )}
            </nav>
          </div>

          {/* User Persona Switcher & Profile */}
          <div className="flex items-center space-x-3">
            {/* Persona Quick Switcher */}
            <div className="flex items-center space-x-1 bg-slate-800/90 border border-slate-700 p-1 rounded-lg">
              <span className="text-xs text-slate-400 px-2 font-medium hidden sm:inline">
                Role:
              </span>
              <button
                type="button"
                onClick={() => switchPersona("ceding")}
                className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                  isCedingUnderwriter
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
                title="Ceding Company Underwriter (External)"
              >
                Ceding Insurer
              </button>
              <button
                type="button"
                onClick={() => switchPersona("underwriter")}
                className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                  isReinsuranceUnderwriter
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
                title="Reinsurance Underwriter (Internal)"
              >
                Underwriter
              </button>
              <button
                type="button"
                onClick={() => switchPersona("manager")}
                className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                  isUnderwritingManager
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
                title="Underwriting Manager (Referral Authority)"
              >
                Manager
              </button>
            </div>

            {/* User Profile Pill */}
            {user && (
              <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.full_name || user.email}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-end space-x-1">
                    <span>{user.company_name}</span>
                    {user.authority_limit > 0 && (
                      <span className="text-emerald-400 font-mono font-medium ml-1">
                        (Auth: ${(user.authority_limit / 1_000_000).toFixed(0)}
                        M)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
