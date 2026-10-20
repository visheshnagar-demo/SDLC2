import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarNav from "./SidebarNav";
import TopHeader from "./TopHeader";

export default function AppLayout() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === "/") return "Underwriting Risk Dashboard";
    if (pathname.startsWith("/documents"))
      return "Document Management & Ingestion Hub";
    if (pathname.startsWith("/analysis"))
      return "Treaty & Risk Analysis Detail View";
    if (pathname.startsWith("/decisions"))
      return "Underwriter Decision & Clause Comparison Workspace";
    return "Gen Re AI Engine";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <TopHeader title={getPageTitle(location.pathname)} />
          <div className="pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
