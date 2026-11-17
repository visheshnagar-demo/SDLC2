import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Lock, Activity, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="bg-[#0F172A] border-b border-[#334155] sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded bg-[#1E293B] border border-[#0284C7] flex items-center justify-center text-[#0284C7] shadow-[0_0_15px_rgba(2,132,199,0.3)] transition-transform group-hover:scale-105">
              <Shield className="w-6 h-6 text-[#0284C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#F8FAFC]">Veritas<span className="text-[#0284C7]">IDV</span></span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1E293B] text-[#93CCFF] border border-[#334155]">v1.0-eKYC</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] font-sans">Enterprise Digital Identity Verification</p>
            </div>
          </Link>

          {/* Cryptographic Badges */}
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-[#334155]">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              MERKLE-TREE VALIDATED
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#94A3B8] bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155]">
              <Lock className="w-3 h-3 text-[#38BDF8]" />
              AES-256 GCM
            </span>
          </div>
        </div>

        {/* User context & Quick Role Navigation */}
        <div className="flex items-center gap-4">
          {/* Quick Role Switcher for QA and Demo Exploration */}
          <div className="hidden lg:flex items-center gap-1 bg-[#0B1326] p-1 rounded border border-[#334155]">
            <span className="text-[10px] font-mono text-[#94A3B8] px-2 uppercase">Role:</span>
            <button
              onClick={() => switchRole('customer')}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                user?.role === 'customer'
                  ? 'bg-[#0284C7] text-white font-medium'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => switchRole('compliance_officer')}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                user?.role === 'compliance_officer'
                  ? 'bg-[#0284C7] text-white font-medium'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Compliance
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                user?.role === 'admin'
                  ? 'bg-[#0284C7] text-white font-medium'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Admin
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-[#F8FAFC]">{user.full_name || user.email}</div>
                <div className="text-[10px] font-mono text-[#38BDF8] uppercase">{user.role}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#38BDF8]">
                <User className="w-4 h-4" />
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#1E293B] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="text-xs font-medium px-4 py-2 rounded bg-[#0284C7] text-white hover:bg-[#0369A1] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
