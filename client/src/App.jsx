import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  Link,
} from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  FilePlus,
  Layers,
  UserCheck,
} from "lucide-react";
import SubmissionIntakePage from "./pages/SubmissionIntakePage";
import UnderwriterQueuePage from "./pages/UnderwriterQueuePage";
import SubmissionDetailPage from "./pages/SubmissionDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        {/* Top Navbar */}
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <Link to="/queue" className="flex flex-col">
                <span className="font-black text-base sm:text-lg tracking-tight leading-tight text-white">
                  FACULTATIVE RE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
                  Cyber & D&O Placement Platform
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <NavLink
                to="/intake"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`
                }
              >
                <FilePlus className="w-4 h-4" />
                <span>Carrier Intake</span>
              </NavLink>

              <NavLink
                to="/queue"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Underwriter Queue</span>
              </NavLink>
            </nav>

            {/* Test Credentials & Role Badge */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-200 block">
                  Senior Underwriter
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  test@example.com
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Global Notice Bar (Constitution requirement: Test account notice) */}
        <div className="bg-blue-50 border-b border-blue-100 py-1.5 px-4 text-center text-[11px] text-blue-800 flex items-center justify-center gap-2">
          <span className="font-bold bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded text-[10px]">
            DEMO MODE
          </span>
          <span>
            Test account active: <strong>test@example.com</strong> /{" "}
            <strong>testpassword</strong> &bull; Facultative Reinsurance Engine
            v2.4
          </span>
        </div>

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/queue" replace />} />
            <Route path="/intake" element={<SubmissionIntakePage />} />
            <Route path="/queue" element={<UnderwriterQueuePage />} />
            <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
            <Route path="*" element={<Navigate to="/queue" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">
                Facultative Reinsurance Intake Portal & Underwriter Queue
              </span>
              <span>&mdash; Cyber & D&O Excess Risk Triage</span>
            </div>
            <div>
              <span>Compliance & Audit Logging Enabled (SOC2 / ISO 27001)</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
