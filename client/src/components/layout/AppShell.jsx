import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, Send, UserCheck, Layers, ExternalLink } from 'lucide-react';

export const AppShell = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/', icon: Layers },
    { label: 'Carrier Dashboard', path: '/carrier/dashboard', icon: FileText },
    { label: 'Submit Facultative Request', path: '/carrier/submit', icon: Send },
    { label: 'Underwriter Review Queue', path: '/underwriter/queue', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col text-[#0F1729]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="bg-primary text-white p-2 rounded-lg shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-900 tracking-tight block">
                    Facultative Reinsurance Portal
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium block -mt-0.5">
                    Cyber & D&O Placement & Underwriting Engine
                  </span>
                </div>
              </Link>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-light text-primary font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Test User Badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">
                Live System Mode
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-4 text-xs text-gray-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Facultative Reinsurance Web Portal. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Cyber & D&O Automated Risk Engine v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
