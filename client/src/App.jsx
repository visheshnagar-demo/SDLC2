import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { RegisterPage } from './pages/RegisterPage';
import { DocumentOnboardingPage } from './pages/DocumentOnboardingPage';
import { BiometricOnboardingPage } from './pages/BiometricOnboardingPage';
import { ApplicationStatusPage } from './pages/ApplicationStatusPage';
import { ComplianceQueuePage } from './pages/ComplianceQueuePage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/auth/register" element={<RegisterPage mode="register" />} />
          <Route path="/auth/login" element={<RegisterPage mode="login" />} />

          {/* Application Main Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/onboarding/document" replace />} />
            <Route path="onboarding/document" element={<DocumentOnboardingPage />} />
            <Route path="onboarding/biometric" element={<BiometricOnboardingPage />} />
            <Route path="onboarding/status" element={<ApplicationStatusPage />} />
            <Route path="compliance/queue" element={<ComplianceQueuePage />} />
            <Route path="admin/audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/onboarding/document" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
