import React from "react";
import ReactDOM from "react-dom/client";
import DashboardPage from "./pages/DashboardPage";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in application:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-rose-800 rounded-2xl p-8 max-w-lg w-full text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              An error occurred while rendering the dashboard.
            </p>
            <p className="text-xs font-mono text-rose-300 bg-rose-950/40 p-3 rounded border border-rose-900 text-left overflow-auto">
              {this.state.error?.message || "Unknown error"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DashboardPage />
    </ErrorBoundary>
  </React.StrictMode>,
);
