import React from "react";
import SidebarNav from "./SidebarNav";
import HeaderBar from "./HeaderBar";

export default function AppShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-[#F7FAFC]">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar title={title} subtitle={subtitle} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
