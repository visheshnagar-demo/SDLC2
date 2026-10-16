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

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            fontFamily: "sans-serif",
            maxWidth: "600px",
            margin: "40px auto",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#e11d48", marginTop: 0 }}>
            Something went wrong.
          </h2>
          <p style={{ color: "#475569", fontSize: "14px" }}>
            An error occurred while rendering the application.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              background: "#2461F5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Reload Gateway
          </button>
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
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
