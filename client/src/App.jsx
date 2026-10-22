import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProjectsListPage from "./pages/ProjectsListPage";
import DashboardPage from "./pages/DashboardPage";

export const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ProjectsListPage />} />
          <Route path="/project/:projectId" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            SDLC Assistant &bull; Automated Lifecycle Management Platform
            (SCRUM-462)
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            Repo: visheshnagar-demo/SDLC2 &bull; Space: SCRUM2
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
