import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FileText,
  Camera,
  CheckCircle,
  AlertTriangle,
  History,
  UserCheck,
  ShieldAlert,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const customerNav = [
    {
      to: '/onboarding/document',
      label: '1. Document Upload & OCR',
      icon: FileText,
      scrum: 'SCRUM-492',
    },
    {
      to: '/onboarding/biometric',
      label: '2. Biometric & Liveness',
      icon: Camera,
      scrum: 'SCRUM-493',
    },
    {
      to: '/onboarding/status',
      label: '3. Application Status',
      icon: CheckCircle,
      scrum: 'SCRUM-490',
    },
  ];

  const complianceNav = [
    {
      to: '/compliance/queue',
      label: 'Compliance Review Queue',
      icon: AlertTriangle,
      badge: '14 Flagged',
      scrum: 'SCRUM-494',
    },
  ];

  const adminNav = [
    {
      to: '/admin/audit-logs',
      label: 'Audit Trail & Event Logs',
      icon: History,
      badge: 'Merkle Root',
      scrum: 'SCRUM-495',
    },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-[#334155] flex flex-col justify-between p-4 min-h-[calc(100vh-61px)] shrink-0">
      <div className="space-y-6">
        {/* Customer Journey Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
              Customer Journey
            </span>
            <span className="text-[9px] font-mono text-[#0284C7] bg-[#0284C7]/10 px-1.5 py-0.5 rounded">
              eKYC Flow
            </span>
          </div>
          <nav className="space-y-1">
            {customerNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1E293B] text-[#38BDF8] border-l-2 border-[#0284C7] shadow-[0_0_10px_rgba(2,132,199,0.15)]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#0284C7]' : 'text-transparent'}`} />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Compliance Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
              Risk &amp; Compliance
            </span>
            <span className="text-[9px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded">
              Portal
            </span>
          </div>
          <nav className="space-y-1">
            {complianceNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1E293B] text-[#F59E0B] border-l-2 border-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono bg-[#EF4444]/20 text-[#EF4444] px-1.5 py-0.5 rounded border border-[#EF4444]/40">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin Governance Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
              Governance &amp; Audit
            </span>
            <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
              Immutable
            </span>
          </div>
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1E293B] text-[#10B981] border-l-2 border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#10B981]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono bg-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded border border-[#10B981]/40">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Telemetry Box */}
      <div className="bg-[#0B1326] p-3 rounded border border-[#334155] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#94A3B8]">System Health</span>
          <span className="text-[#10B981] flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            OPERATIONAL
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#64748B] flex justify-between">
          <span>Latency: ~42ms</span>
          <span>FastAPI v0.110</span>
        </div>
        <div className="text-[10px] font-mono text-[#64748B] truncate">
          SHA-256 Root: 0x9f82...3e1a
        </div>
      </div>
    </aside>
  );
};
