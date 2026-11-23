import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import CustomerOnboardingPage from './pages/CustomerOnboardingPage';
import ComplianceDashboardPage from './pages/ComplianceDashboardPage';
import AdminAuditConsolePage from './pages/AdminAuditConsolePage';

export default function App() {
  const [activeRole, setActiveRole] = useState('customer');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B1326] text-[#DAE2FD] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <Navbar activeRole={activeRole} onRoleChange={setActiveRole} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<CustomerOnboardingPage />} />
            <Route path="/compliance" element={<ComplianceDashboardPage />} />
            <Route path="/admin/audit" element={<AdminAuditConsolePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-[#131B2E] border-t border-slate-800 py-4 text-center text-xs text-slate-500 font-mono">
          <p>IdentiVerify Enterprise Identity Verification Engine &copy; 2026. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
