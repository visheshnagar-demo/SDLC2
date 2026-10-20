import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";
import SubmissionIntakePage from "./pages/SubmissionIntakePage";
import ReviewQueuePage from "./pages/ReviewQueuePage";
import RiskDetailPage from "./pages/RiskDetailPage";
import QuoteBuilderPage from "./pages/QuoteBuilderPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import ConfigRulesPage from "./pages/ConfigRulesPage";

export function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/queue" replace />} />
          <Route path="/intake" element={<SubmissionIntakePage />} />
          <Route path="/queue" element={<ReviewQueuePage />} />
          <Route path="/submissions/:id" element={<RiskDetailPage />} />
          <Route path="/quote-builder" element={<QuoteBuilderPage />} />
          <Route path="/quote-builder/:id" element={<QuoteBuilderPage />} />
          <Route path="/manager-dashboard" element={<ManagerDashboardPage />} />
          <Route path="/config-rules" element={<ConfigRulesPage />} />
          <Route path="*" element={<Navigate to="/queue" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
