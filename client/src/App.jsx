import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ReviewQueuePage from "./pages/ReviewQueuePage";
import CarrierSubmissionPage from "./pages/CarrierSubmissionPage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<ReviewQueuePage />} />
          <Route path="/queue" element={<ReviewQueuePage />} />
          <Route path="/submit" element={<CarrierSubmissionPage />} />
          <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
