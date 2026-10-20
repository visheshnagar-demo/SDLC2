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
    console.error("Uncaught error in UI:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white p-6 rounded-xl border border-red-200 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-red-600">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-600">
              The application encountered an unexpected runtime error. Please
              reload or check the console.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0F2744] text-white text-xs font-bold rounded-lg hover:bg-[#1E3A8A]"
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
