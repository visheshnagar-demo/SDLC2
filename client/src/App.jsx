import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import QuotingPage from "./pages/QuotingPage.jsx";
import UnderwritingPage from "./pages/UnderwritingPage.jsx";
import BindersPage from "./pages/BindersPage.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/quoting" replace />} />
        <Route path="/quoting" element={<QuotingPage />} />
        <Route path="/underwriting" element={<UnderwritingPage />} />
        <Route path="/binders" element={<BindersPage />} />
        <Route path="*" element={<Navigate to="/quoting" replace />} />
      </Routes>
    </Router>
  );
}
