import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, UserCheck, FileSearch, Lock } from 'lucide-react';

export default function Navbar({ activeRole = 'customer', onRoleChange }) {
  const location = useLocation();

  const navLinks = [
    {
      to: '/',
      label: 'Customer Onboarding',
      icon: UserCheck
    },
    {
      to: '/compliance',
      label: 'Compliance Review',
      icon: FileSearch
    },
    {
      to: '/admin/audit',
      label: 'Audit Console',
      icon: Lock
    }
  ];

  return (
    <header className="bg-[#131B2E] border-b border-slate-700/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="bg-blue-600/20 border border-blue-500/40 p-2 rounded-lg text-blue-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  IdentiVerify
                </span>
                <span className="block text-[10px] font-mono text-slate-400 tracking-wider">
                  ENTERPRISE IDENTITY SYSTEM
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex space-x-1 sm:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-[#171F33] hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1.5 bg-[#0B1326] px-2.5 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono text-emerald-400">256-Bit SSL Encrypted</span>
            </div>

            {onRoleChange && (
              <select
                value={activeRole}
                onChange={(e) => onRoleChange(e.target.value)}
                aria-label="Active Role"
                className="bg-[#0B1326] border border-slate-700 rounded-md px-2.5 py-1 text-xs text-[#DAE2FD] focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="customer">Role: Customer</option>
                <option value="compliance_officer">Role: Compliance Officer</option>
                <option value="admin">Role: Admin</option>
              </select>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
