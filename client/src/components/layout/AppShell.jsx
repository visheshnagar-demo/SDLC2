import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  FilePlus,
  LayoutDashboard,
  Inbox,
  UserCheck,
  Building2,
  Lock,
} from "lucide-react";

export const AppShell = ({ children }) => {
  const location = useLocation();

  const isCarrierRoute =
    location.pathname.startsWith("/carrier") || location.pathname === "/";
  const isUnderwriterRoute = location.pathname.startsWith("/underwriter");

  const navLinks = [
    {
      label: "Carrier Portal",
      items: [
        {
          name: "New Submission",
          path: "/carrier/submit",
          icon: FilePlus,
        },
        {
          name: "Carrier Dashboard",
          path: "/carrier/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Underwriting Workbench",
      items: [
        {
          name: "Review Queue",
          path: "/underwriter/queue",
          icon: Inbox,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-surface border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <span className="font-bold text-lg text-textPrimary tracking-tight block">
                  FacRe Portal
                </span>
                <span className="text-xs text-textSecondary hidden sm:block">
                  Facultative Reinsurance Intake & Underwriter Scoring
                </span>
              </div>
            </div>

            {/* Role Quick Toggle Navigation */}
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <Link
                to="/carrier/dashboard"
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isCarrierRoute
                    ? "bg-surface text-primary shadow-sm"
                    : "text-textSecondary hover:text-textPrimary"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Carrier View
              </Link>
              <Link
                to="/underwriter/queue"
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isUnderwriterRoute
                    ? "bg-surface text-primary shadow-sm"
                    : "text-textSecondary hover:text-textPrimary"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Underwriter View
              </Link>
            </div>

            {/* User Info / Test Account */}
            <div className="hidden md:flex items-center space-x-3 text-xs text-textSecondary border-l border-gray-200 pl-4">
              <div className="text-right">
                <div className="font-medium text-textPrimary">
                  {isUnderwriterRoute
                    ? "Lead Underwriter (D&O / Cyber)"
                    : "Apex Global Carrier"}
                </div>
                <div className="text-[11px] text-gray-500">
                  {isUnderwriterRoute
                    ? "test@example.com (Underwriter)"
                    : "carrier@apex.com (Carrier)"}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-xs">
                {isUnderwriterRoute ? "UW" : "CR"}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Sub-nav Links */}
        <div className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 py-2 overflow-x-auto">
            {navLinks.map((group) => (
              <div
                key={group.label}
                className="flex items-center space-x-2 pr-4 border-r border-gray-200 last:border-r-0 last:pr-0"
              >
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 hidden lg:inline">
                  {group.label}:
                </span>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-textSecondary hover:bg-gray-200/60 hover:text-textPrimary"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-textSecondary gap-2">
          <span>
            &copy; 2026 Facultative Reinsurance Portal &bull; Enterprise Cyber
            &amp; D&amp;O Underwriting Engine
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Scoring Engine Active
            </span>
            <span>API: Connected (v1.0)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
