import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Veritas IDV Uncaught UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1326] text-[#F8FAFC] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#0F172A] border border-[#EF4444]/40 rounded-xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 flex items-center justify-center mx-auto mb-4">
              ⚠
            </div>
            <h2 className="text-base font-bold text-[#F8FAFC]">Application Error Encountered</h2>
            <p className="text-xs text-[#94A3B8] mt-2 mb-4">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-lg transition-colors"
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
