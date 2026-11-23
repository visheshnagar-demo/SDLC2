import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1326] text-red-400 p-8 flex items-center justify-center font-mono">
          <div className="p-6 bg-[#171F33] rounded-lg border border-red-500/50 max-w-md text-center">
            <h2 className="text-lg font-bold mb-2">Something went wrong.</h2>
            <p className="text-xs text-slate-400 mb-4">An unexpected rendering error occurred.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-500 text-white text-xs px-4 py-2 rounded"
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
