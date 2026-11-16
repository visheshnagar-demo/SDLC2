import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { CarrierDashboardPage } from './pages/CarrierDashboardPage';
import { CarrierSubmissionPage } from './pages/CarrierSubmissionPage';
import { UnderwriterQueuePage } from './pages/UnderwriterQueuePage';
import { UnderwriterDetailPage } from './pages/UnderwriterDetailPage';
import { Card } from './components/common/Card';
import { Button } from './components/common/Button';
import {
  ShieldAlert,
  Building2,
  FileText,
  Send,
  UserCheck,
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="space-y-8 py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-sm border border-white/20">
            <Activity className="w-3.5 h-3.5" />
            Automated Cyber & D&O Facultative Reinsurance Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Facultative Reinsurance Web Portal
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Carrier submission intake, algorithmic risk severity scoring (0–100), automated missing information detection, and centralized underwriter review workbench with binding quote and decline decision workflows.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/carrier/submit">
              <Button variant="accent" size="lg" icon={Send}>
                Submit Carrier Request
              </Button>
            </Link>
            <Link to="/underwriter/queue">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                icon={UserCheck}
              >
                Underwriter Review Queue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carrier Portal Card */}
        <Card
          title="Carrier Placement Workspace"
          subtitle="Submit new facultative reinsurance requests & track binding status"
          className="hover:border-primary/50 transition-colors"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              Insurance carriers can structure Cyber and D&O facultative placement requests with custom limits, attachment points, industry profiles, loss runs, and policy slip attachments.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-900 block flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                  Cyber Reinsurance
                </span>
                <span className="text-gray-500 text-[11px] block mt-0.5">
                  Ransomware & cyber liabilities
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-900 block flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  D&O Reinsurance
                </span>
                <span className="text-gray-500 text-[11px] block mt-0.5">
                  Management & corporate liability
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link to="/carrier/submit" className="flex-1">
                <Button variant="primary" className="w-full" icon={Send} size="md">
                  Submit New Request
                </Button>
              </Link>
              <Link to="/carrier/dashboard" className="flex-1">
                <Button variant="secondary" className="w-full" icon={FileText} size="md">
                  View Carrier Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Underwriter Workbench Card */}
        <Card
          title="Underwriter Scoring & Review Workbench"
          subtitle="Automated risk scores, completeness checks & decision console"
          className="hover:border-emerald-500/50 transition-colors"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              Underwriters evaluate prioritized risk queues sorted by algorithmic risk severity (Low, Medium, High), inspect missing disclosure tags, acquire concurrency locks, and record binding quote terms or standardized decline reasons.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
                <span className="font-semibold text-emerald-900 block flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Risk Scoring Engine
                </span>
                <span className="text-emerald-700 text-[11px] block mt-0.5">
                  Algorithmic points & tiers
                </span>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <span className="font-semibold text-blue-900 block flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  Decision & Concurrency
                </span>
                <span className="text-blue-700 text-[11px] block mt-0.5">
                  Quote terms & decline notices
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/underwriter/queue">
                <Button variant="accent" className="w-full" icon={UserCheck} size="md">
                  Open Underwriter Review Queue
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/carrier/dashboard" element={<CarrierDashboardPage />} />
          <Route path="/carrier/submit" element={<CarrierSubmissionPage />} />
          <Route path="/underwriter/queue" element={<UnderwriterQueuePage />} />
          <Route path="/underwriter/submissions/:id" element={<UnderwriterDetailPage />} />
          <Route path="/underwriter/queue/:id" element={<UnderwriterDetailPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
