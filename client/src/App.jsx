import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import IntakePage from "./pages/IntakePage";
import QueuePage from "./pages/QueuePage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import RulesConfigPage from "./pages/RulesConfigPage";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/queue" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/intake" element={<IntakePage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
          <Route path="/dashboard" element={<ManagerDashboardPage />} />
          <Route path="/rules" element={<RulesConfigPage />} />
          <Route path="*" element={<Navigate to="/queue" replace />} />
        </Routes>
      </main>
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} Apex Reinsurance Specialty
            Underwriting Platform. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>AES-256 Encrypted</span>
            <span>•</span>
            <span>Restricted Access (RBAC)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
