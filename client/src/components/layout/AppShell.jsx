import React from "react";
import SidebarNav from "./SidebarNav";

export function AppShell({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export default AppShell;
