import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ShieldCheck,
  LogOut,
  Landmark,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Fund Transfer", path: "/transfers", icon: ArrowLeftRight },
  ];

  return (
    <aside className="w-[260px] bg-[#151B2B] border-r border-[#33394A]/50 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#33394A]/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#0EA5E9] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#F8FAFC]">
              APEX BANK
            </h1>
            <p className="text-[11px] text-[#0EA5E9] font-medium tracking-wide">
              ENTERPRISE CORE
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-6">
          <p className="px-3 text-[11px] font-semibold text-[#94A3B8]/70 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/30"
                        : "text-[#94A3B8] hover:bg-[#191F2F] hover:text-[#F8FAFC]"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <p className="px-3 text-[11px] font-semibold text-[#94A3B8]/70 uppercase tracking-wider mt-8 mb-2">
            Security & Compliance
          </p>
          <div className="p-3 bg-[#191F2F]/60 rounded-lg border border-[#33394A]/40 space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-medium">256-Bit TLS 1.3 Active</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Automated session protection & double-entry ledger enabled.
            </p>
          </div>
        </div>
      </div>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-[#33394A]/40 bg-[#121724]">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#0EA5E9] font-semibold text-xs shrink-0">
              {user?.username ? (
                user.username.charAt(0).toUpperCase()
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                {user?.fullName || user?.username || "Banking Customer"}
              </p>
              <p className="text-[10px] text-[#94A3B8] truncate">
                {user?.email || "Verified Account"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg border border-rose-500/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
