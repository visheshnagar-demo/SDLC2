import React from "react";
import {
  LayoutDashboard,
  FileText,
  FileSearch,
  ShieldAlert,
  Calculator,
  FileSpreadsheet,
  UserCheck,
  Award,
  Terminal,
  Activity,
  ChevronRight,
  Info,
} from "lucide-react";

export default function LeftNavigation({
  activeView,
  onSelectView,
  activeCase,
  unreadAgentLogsCount,
  onToggleConsole,
  isConsoleOpen,
}) {
  const navItems = [
    {
      id: "dashboard",
      label: "Executive Dashboard",
      subtitle: "QTB 12-Stage Pipeline & KPIs",
      icon: LayoutDashboard,
      badge: activeCase?.status || "Active",
    },
    {
      id: "intake",
      label: "Submission Workspace",
      subtitle: "Original Slips & Exposure SOVs",
      icon: FileText,
      badge: `${activeCase?.documents?.length || 0} Docs`,
    },
    {
      id: "extraction",
      label: "Extracted Data Review",
      subtitle: "AI Citations & Bounding Boxes",
      icon: FileSearch,
      badge: `${activeCase?.overallConfidence || 0}% Conf.`,
    },
    {
      id: "risk",
      label: "Underwriting & Risk View",
      subtitle: "Cat PML, Accumulation & Perils",
      icon: ShieldAlert,
      badge: activeCase?.riskLevel || "Normal",
    },
    {
      id: "pricing",
      label: "Actuarial Pricing Studio",
      subtitle: "Stochastic Loss Curves & RoE",
      icon: Calculator,
      badge: `RoE ${activeCase?.pricingData?.roeProjected || "14"}%`,
    },
    {
      id: "quote",
      label: "Quote Builder & Terms",
      subtitle: "Layer Structure & Commissions",
      icon: FileSpreadsheet,
      badge: activeCase?.rateOnLine || "RoL",
    },
    {
      id: "approval",
      label: "Approval & Governance",
      subtitle: "HITL Authority & Referral Sign-Off",
      icon: UserCheck,
      badge: activeCase?.requiresReferral ? "Referral" : "Cleared",
    },
    {
      id: "bind",
      label: "Bind Readiness & Handoff",
      subtitle: "6-Gate Pre-Bind & PAS Contract",
      icon: Award,
      badge: activeCase?.bindConfirmation?.bound ? "BOUND" : "Ready",
    },
  ];

  return (
    <aside className="w-64 bg-[#0B192C] border-r border-slate-800 flex flex-col justify-between text-slate-300 select-none flex-shrink-0">
      {/* Top Nav List */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Quote-To-Bind Workspaces
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition group ${
                isActive
                  ? "bg-teal-900/40 text-teal-200 border border-teal-500/40 shadow-sm"
                  : "hover:bg-slate-800/80 hover:text-white text-slate-300 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive
                      ? "text-teal-400"
                      : "text-slate-400 group-hover:text-teal-300"
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium leading-tight truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight truncate">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${
                    isActive
                      ? "bg-teal-500/30 text-teal-200"
                      : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: Agent Orchestration Console Toggle & System Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
        <button
          onClick={onToggleConsole}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
            isConsoleOpen
              ? "bg-slate-800 text-teal-300 border border-teal-500/30"
              : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span>Agent Console</span>
          </div>
          <span className="bg-teal-500/20 text-teal-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
            LIVE
          </span>
        </button>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Gen Re Prototype v1.0</span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            Simulated agentic orchestration with deterministic human-in-the-loop
            controls.
          </p>
        </div>
      </div>
    </aside>
  );
}
