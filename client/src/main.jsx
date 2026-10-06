import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
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
    // Error caught by boundary
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-800">
          <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200 max-w-lg w-full text-center">
            <h2 className="text-xl font-bold text-rose-600 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              An unexpected error occurred while rendering the DG Cluster
              Assortment Advisor.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-4 py-2 rounded text-sm transition-colors"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
