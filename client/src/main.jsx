import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
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
    // Uncaught render error handler
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] p-8 flex flex-col items-center justify-center">
          <div className="bg-[#1E293B] border border-[#F43F5E] rounded-xl p-6 max-w-lg w-full text-center">
            <h2 className="text-2xl font-bold text-[#FFDD00] mb-2">
              Something went wrong.
            </h2>
            <p className="text-[#94A3B8] text-sm mb-4">
              An unexpected error occurred in the dashboard application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#FFDD00] text-[#090D16] font-semibold rounded-lg hover:bg-yellow-400 transition"
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
