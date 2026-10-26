import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-slate-50 text-slate-900 overflow-y-auto min-h-[calc(100vh-4rem)] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
