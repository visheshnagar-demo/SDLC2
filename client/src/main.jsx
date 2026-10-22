import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
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
    // Log error internally if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-rose-400 mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            An unexpected error occurred in the SDLC UI application.
          </p>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-rose-300 font-mono max-w-xl overflow-x-auto text-left">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
