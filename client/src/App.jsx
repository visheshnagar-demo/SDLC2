import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CarrierPortalPage from "./pages/CarrierPortalPage";
import UnderwritingQueuePage from "./pages/UnderwritingQueuePage";
import SubmissionInspectionPage from "./pages/SubmissionInspectionPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/underwriting/queue" replace />}
        />
        <Route path="/carrier/new" element={<CarrierPortalPage />} />
        <Route path="/carrier/submissions" element={<CarrierPortalPage />} />
        <Route path="/underwriting/queue" element={<UnderwritingQueuePage />} />
        <Route
          path="/underwriting/submissions/:id"
          element={<SubmissionInspectionPage />}
        />
        <Route
          path="*"
          element={<Navigate to="/underwriting/queue" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
