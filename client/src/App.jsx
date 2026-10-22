import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SubmissionProvider } from "./context/SubmissionContext";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";

import IntakePage from "./pages/IntakePage";
import QueuePage from "./pages/QueuePage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";
import QuoteBuilderPage from "./pages/QuoteBuilderPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import AuditLogPage from "./pages/AuditLogPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubmissionProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
            {/* Top persistent header */}
            <Header />

            <div className="flex-1 flex">
              {/* Collapsible / responsive side navigation */}
              <Sidebar />

              {/* Main content body */}
              <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
                <Routes>
                  <Route path="/" element={<Navigate to="/queue" replace />} />
                  <Route path="/intake" element={<IntakePage />} />
                  <Route path="/queue" element={<QueuePage />} />
                  <Route path="/submissions" element={<QueuePage />} />
                  <Route
                    path="/submissions/:id"
                    element={<SubmissionDetailPage />}
                  />
                  <Route
                    path="/submissions/:id/quote"
                    element={<QuoteBuilderPage />}
                  />
                  <Route path="/dashboard" element={<ManagerDashboardPage />} />
                  <Route path="/audit" element={<AuditLogPage />} />
                  <Route path="*" element={<Navigate to="/queue" replace />} />
                </Routes>
              </main>
            </div>

            {/* Bottom compliance and test credentials footer */}
            <footer className="bg-white border-t border-slate-200 py-3 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                © 2026 ReSecure Facultative Underwriting Systems • Specialty
                Lines Syndicate
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Test account: <strong>test@example.com / testpassword</strong>
                </span>
                <span>•</span>
                <span>
                  Manager account:{" "}
                  <strong>manager@example.com / adminpassword</strong>
                </span>
              </div>
            </footer>
          </div>
        </SubmissionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
