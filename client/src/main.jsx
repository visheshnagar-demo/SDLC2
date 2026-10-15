import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Error caught by boundary
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            color: "#F8FAFC",
            background: "#0D1322",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "1rem",
              color: "#EF4444",
            }}
          >
            Something went wrong.
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem" }}>
            Please refresh the page or return to login.
          </p>
          <a
            href="/login"
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#2563EB",
              color: "#fff",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            Go to Login
          </a>
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
