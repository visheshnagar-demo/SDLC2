import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import CarrierDashboardPage from './pages/CarrierDashboardPage';
import CarrierSubmissionPage from './pages/CarrierSubmissionPage';
import UnderwriterQueuePage from './pages/UnderwriterQueuePage';
import UnderwriterDetailPage from './pages/UnderwriterDetailPage';

export const App = () => {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/carrier/dashboard" replace />} />
        <Route path="/carrier/dashboard" element={<CarrierDashboardPage />} />
        <Route path="/carrier/submit" element={<CarrierSubmissionPage />} />
        <Route path="/underwriter/queue" element={<UnderwriterQueuePage />} />
        <Route path="/underwriter/submissions/:id" element={<UnderwriterDetailPage />} />
        <Route path="*" element={<Navigate to="/carrier/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
};

export default App;
