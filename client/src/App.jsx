import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Layers, Inbox, PlusCircle, CheckCircle } from 'lucide-react';
import CarrierSubmissionPage from './pages/CarrierSubmissionPage';
import UnderwriterQueuePage from './pages/UnderwriterQueuePage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import CarrierTrackingPage from './pages/CarrierTrackingPage';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-inner">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <Link to="/" className="font-extrabold text-base tracking-tight text-white hover:text-blue-300 transition-colors">
              Apex Reinsurance Mutual
            </Link>
            <div className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
              Facultative Placement Portal & Review Queue
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <Link
            to="/carrier/new"
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isActive('/carrier/new') ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">New Placement</span>
          </Link>

          <Link
            to="/carrier/tracking"
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isActive('/carrier/tracking') ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Carrier Tracking</span>
          </Link>

          <Link
            to="/underwriter"
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isActive('/underwriter') || isActive('/submissions') ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">Underwriter Review Queue</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navigation />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<UnderwriterQueuePage />} />
            <Route path="/carrier/new" element={<CarrierSubmissionPage />} />
            <Route path="/carrier/tracking" element={<CarrierTrackingPage />} />
            <Route path="/underwriter" element={<UnderwriterQueuePage />} />
            <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
          </Routes>
        </main>

        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              &copy; 2026 Apex Insurance Mutual & Reinsurance Syndicate. All rights reserved.
            </div>
            <div className="text-[11px] text-slate-400">
              Test account: <span className="text-slate-300 font-mono">test@example.com</span> / <span className="text-slate-300 font-mono">testpassword</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
