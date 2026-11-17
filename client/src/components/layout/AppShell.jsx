import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, FileText, Send, Inbox, User, Layers } from 'lucide-react';

export const AppShell = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(
    () => localStorage.getItem('user_role') || 'carrier'
  );

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('user_role', newRole);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-3">
              <Link to="/carrier/dashboard" className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#2461F5] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    FacRe Portal
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-[#2461F5] border border-blue-200">
                      Cyber & D&O
                    </span>
                  </span>
                  <p className="text-[11px] text-slate-500 -mt-0.5">Facultative Reinsurance Workbench</p>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-1 sm:space-x-3">
              <NavLink
                to="/carrier/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-[#2461F5]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <FileText className="w-4 h-4" />
                <span>Submissions</span>
              </NavLink>

              <NavLink
                to="/carrier/submit"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-[#2461F5]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Send className="w-4 h-4" />
                <span>New Request</span>
              </NavLink>

              <NavLink
                to="/underwriter/queue"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-[#2461F5]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Inbox className="w-4 h-4" />
                <span>Underwriter Queue</span>
              </NavLink>
            </nav>

            {/* Role Switcher & User Info */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => handleRoleChange('carrier')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    currentRole === 'carrier'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Carrier View
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('underwriter')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    currentRole === 'underwriter'
                      ? 'bg-white text-[#2461F5] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Underwriter View
                </button>
              </div>

              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-slate-800 capitalize">{currentRole} User</p>
                  <p className="text-[10px] text-slate-500">test@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Facultative Reinsurance Portal. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>Cyber & D&O Automated Risk Engine</span>
            <span>•</span>
            <span>ISO 27001 / SOC 2 Audited</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
