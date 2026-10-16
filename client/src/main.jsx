import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import { CarrierDashboardPage } from "./pages/CarrierDashboardPage";
import { CarrierSubmissionPage } from "./pages/CarrierSubmissionPage";
import { UnderwriterQueuePage } from "./pages/UnderwriterQueuePage";
import { UnderwriterDetailPage } from "./pages/UnderwriterDetailPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Uncaught render error captured
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-surface border border-red-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-red-100 text-error rounded-full flex items-center justify-center mx-auto font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-bold text-textPrimary">
              Something went wrong
            </h2>
            <p className="text-xs text-textSecondary">
              An unexpected render error occurred in the application. Please
              reload the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/carrier/dashboard" replace />}
        />
        <Route
          path="/carrier"
          element={<Navigate to="/carrier/dashboard" replace />}
        />
        <Route path="/carrier/dashboard" element={<CarrierDashboardPage />} />
        <Route path="/carrier/submit" element={<CarrierSubmissionPage />} />
        <Route
          path="/underwriter"
          element={<Navigate to="/underwriter/queue" replace />}
        />
        <Route path="/underwriter/queue" element={<UnderwriterQueuePage />} />
        <Route
          path="/underwriter/submissions/:id"
          element={<UnderwriterDetailPage />}
        />
        <Route
          path="*"
          element={<Navigate to="/carrier/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
