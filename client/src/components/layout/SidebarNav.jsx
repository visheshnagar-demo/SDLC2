import React from "react";
import { NavLink } from "react-router-dom";
import {
  FilePlus2,
  LayoutGrid,
  ShieldAlert,
  FileText,
  CheckCircle2,
} from "lucide-react";

export function SidebarNav() {
  const navItems = [
    {
      name: "Carrier Submission",
      path: "/submit",
      icon: FilePlus2,
      badge: "Portal",
      description: "Submit Cyber / D&O Risk",
    },
    {
      name: "Underwriter Queue",
      path: "/queue",
      icon: LayoutGrid,
      badge: "Review",
      description: "Scoring & Decisions",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E3E8F0] min-h-[calc(100vh-61px)] flex flex-col justify-between shrink-0 p-4">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#66738A]">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#2461F5] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? "text-white" : "text-slate-500"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{item.name}</span>
                        </div>
                        <p
                          className={`text-[11px] truncate ${isActive ? "text-blue-100" : "text-slate-400"}`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Risk Categories info box */}
        <div className="bg-[#F8FAFC] rounded-xl border border-[#E3E8F0] p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ShieldAlert className="w-4 h-4 text-[#2461F5]" />
            Supported Facultative Lines
          </div>
          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="font-medium text-indigo-700">Cyber Risk</span>
              <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-medium text-purple-700">
                Directors & Officers (D&O)
              </span>
              <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#E3E8F0] space-y-2 text-[11px] text-[#66738A]">
        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Risk Scoring Engine v2.4</span>
        </div>
        <div className="text-[10px] text-slate-400">
          AIG Commercial Reinsurance Platform
        </div>
      </div>
    </aside>
  );
}

export default SidebarNav;
