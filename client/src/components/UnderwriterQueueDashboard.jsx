import React, { useState, useEffect } from 'react';
import { Shield, Briefcase, Filter, RefreshCw, AlertTriangle, CheckCircle, Ban, Eye, FileText, ChevronRight, Loader2 } from 'lucide-react';
import RiskScoreBadge from './RiskScoreBadge';
import MissingInfoFlagsDrawer from './MissingInfoFlagsDrawer';
import DecisionWorkbenchModal from './DecisionWorkbenchModal';
import { api } from '../services/api';

export default function UnderwriterQueueDashboard({ onSelectSubmission }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [riskTypeFilter, setRiskTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minScoreFilter, setMinScoreFilter] = useState('');

  // Selected Submission Modals / Drawers
  const [selectedSubmissionForFlags, setSelectedSubmissionForFlags] = useState(null);
  const [flagsDrawerOpen, setFlagsDrawerOpen] = useState(false);
  const [selectedFlags, setSelectedFlags] = useState([]);

  const [selectedSubmissionForDecision, setSelectedSubmissionForDecision] = useState(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (riskTypeFilter !== 'ALL') params.risk_type = riskTypeFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (minScoreFilter) params.min_score = Number(minScoreFilter);

      const data = await api.getSubmissions(params);
      const items = Array.isArray(data) ? data : data?.items || [];
      setSubmissions(items);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to fetch underwriter review queue.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [riskTypeFilter, statusFilter, minScoreFilter]);

  const handleOpenFlags = async (sub) => {
    setSelectedSubmissionForFlags(sub);
    try {
      const flags = await api.getSubmissionFlags(sub.id);
      setSelectedFlags(Array.isArray(flags) ? flags : flags?.flags || []);
    } catch (err) {
      setSelectedFlags(sub.missing_flags || []);
    }
    setFlagsDrawerOpen(true);
  };

  const handleOpenDecision = (sub) => {
    setSelectedSubmissionForDecision(sub);
    setDecisionModalOpen(true);
  };

  const handleDecisionSuccess = () => {
    fetchSubmissions();
  };

  // KPI calculations
  const totalCount = submissions.length;
  const pendingCount = submissions.filter(s => !s.status || s.status === 'PENDING_REVIEW' || s.status === 'PENDING').length;
  const quotedCount = submissions.filter(s => s.status === 'QUOTED' || s.status === 'QUOTE').length;
  const declinedCount = submissions.filter(s => s.status === 'DECLINED' || s.status === 'DECLINE').length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Placement Queue</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Underwriting</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{pendingCount}</div>
          </div>
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Quoted Placements</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{quotedCount}</div>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Declined Risks</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{declinedCount}</div>
          </div>
          <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
            <Ban className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Risk Type Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setRiskTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              riskTypeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Risks
          </button>
          <button
            onClick={() => setRiskTypeFilter('CYBER')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
              riskTypeFilter === 'CYBER' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Cyber
          </button>
          <button
            onClick={() => setRiskTypeFilter('DO')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
              riskTypeFilter === 'DO' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            D&O
          </button>
        </div>

        {/* Status Dropdown and Min Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="status_filter" className="text-xs font-semibold text-slate-500">Status:</label>
            <select
              id="status_filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-semibold bg-white text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="QUOTED">Quoted</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="min_score_filter" className="text-xs font-semibold text-slate-500">Min Score:</label>
            <input
              id="min_score_filter"
              type="number"
              min="0"
              max="100"
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              placeholder="e.g. 50"
              className="w-20 px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800"
            />
          </div>

          <button
            onClick={fetchSubmissions}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200"
            title="Refresh queue"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submissions Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Placement / Insured</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Risk Class</th>
                <th className="py-3 px-4">Ceded Limit / Att. Pt</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Missing Flags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading underwriter queue...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No facultative submissions match the selected filters.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const score = sub.risk_score ?? sub.risk_score_value ?? 0;
                  const flags = sub.missing_flags || [];
                  const unresolvedFlags = flags.filter(f => !f.is_resolved);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="font-bold text-sm text-slate-900">{sub.insured_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{sub.id}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {sub.carrier_name}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          sub.risk_type === 'CYBER' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {sub.risk_type === 'CYBER' ? <Shield className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                          {sub.risk_type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 font-mono">
                        <div><span className="font-bold">${Number(sub.ceded_limit || 0).toLocaleString()}</span></div>
                        <div className="text-[11px] text-slate-400">xs ${Number(sub.attachment_point || 0).toLocaleString()}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskScoreBadge score={score} size="sm" />
                      </td>

                      <td className="py-3.5 px-4">
                        {unresolvedFlags.length > 0 ? (
                          <button
                            onClick={() => handleOpenFlags(sub)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold hover:bg-amber-200"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {unresolvedFlags.length} Flag{unresolvedFlags.length > 1 ? 's' : ''}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Complete
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === 'QUOTED' || sub.status === 'QUOTE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'DECLINED' || sub.status === 'DECLINE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status || 'PENDING_REVIEW'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenDecision(sub)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-white rounded font-bold text-[11px] transition-colors"
                        >
                          Decision
                        </button>
                        {onSelectSubmission && (
                          <button
                            onClick={() => onSelectSubmission(sub.id)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 inline-block align-middle"
                            title="View Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals and Drawers */}
      <MissingInfoFlagsDrawer
        isOpen={flagsDrawerOpen}
        onClose={() => setFlagsDrawerOpen(false)}
        flags={selectedFlags}
        submissionId={selectedSubmissionForFlags?.id}
      />

      <DecisionWorkbenchModal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        submission={selectedSubmissionForDecision}
        onDecisionSuccess={handleDecisionSuccess}
      />
    </div>
  );
}
