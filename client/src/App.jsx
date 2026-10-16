import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CarrierPortalPage from "./pages/CarrierPortalPage";
import UnderwriterQueuePage from "./pages/UnderwriterQueuePage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/submit" replace />} />
      <Route path="/submit" element={<CarrierPortalPage />} />
      <Route path="/queue" element={<UnderwriterQueuePage />} />
      <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
      <Route path="*" element={<Navigate to="/submit" replace />} />
    </Routes>
  );
}

export default App;
