import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";
import IntakePage from "./pages/IntakePage";
import ReviewQueuePage from "./pages/ReviewQueuePage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";
import QuoteBuilderPage from "./pages/QuoteBuilderPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/underwriter/queue" replace />}
            />
            <Route path="/submissions/new" element={<IntakePage />} />
            <Route path="/underwriter/queue" element={<ReviewQueuePage />} />
            <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
            <Route
              path="/submissions/:id/quote"
              element={<QuoteBuilderPage />}
            />
            <Route
              path="/manager/dashboard"
              element={<ManagerDashboardPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
