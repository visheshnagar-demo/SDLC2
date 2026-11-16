import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Shield, Inbox, PlusCircle, CheckSquare, Layers } from 'lucide-react';
import SubmissionIntakePage from './pages/SubmissionIntakePage';
import UnderwriterQueuePage from './pages/UnderwriterQueuePage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';

function NavigationBar() {
  const location = useLocation();

  const isIntake = location.pathname.startsWith('/intake');
  const isQueue = location.pathname.startsWith('/queue') || location.pathname.startsWith('/submissions');

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/queue" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight leading-tight flex items-center gap-2">
              FACULTATIVE PORTAL <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">Cyber / D&O</span>
            </div>
            <div className="text-[11px] text-slate-400">Reinsurance Intake & Underwriter Queue</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/queue"
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              isQueue ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" /> Underwriter Queue
          </Link>

          <Link
            to="/intake"
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              isIntake ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Carrier Intake
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <NavigationBar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/queue" replace />} />
            <Route path="/intake" element={<SubmissionIntakePage />} />
            <Route path="/queue" element={<UnderwriterQueuePage />} />
            <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
            <Route path="*" element={<Navigate to="/queue" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Facultative Reinsurance Portal &bull; Enterprise Underwriting &amp; Automated Risk Intelligence</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
