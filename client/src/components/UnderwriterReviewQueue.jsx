import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, AlertTriangle, ArrowRight, RefreshCw, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../services/api';

export default function UnderwriterReviewQueue() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskTypeFilter, setRiskTypeFilter] = useState('ALL');

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUnderwritingQueue();
      // Handle both raw list and wrapped object
      const items = Array.isArray(data) ? data : data.items || data.submissions || [];
      setSubmissions(items);
    } catch (err) {
      console.error('Failed to fetch underwriting queue:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load underwriting queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      searchTerm === '' ||
      sub.insured_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || sub.status?.toUpperCase() === statusFilter.toUpperCase();

    const matchesRisk =
      riskTypeFilter === 'ALL' || sub.risk_type?.toUpperCase() === riskTypeFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Calculate high-level metrics
  const activeCount = submissions.filter((s) => ['SUBMITTED', 'UNDER_REVIEW', 'FLAGGED'].includes(s.status?.toUpperCase())).length;
  const flaggedCount = submissions.filter((s) => s.missing_flags_count > 0 || s.status === 'FLAGGED').length;
  const quotedCount = submissions.filter((s) => s.status === 'QUOTED').length;
  const avgScore = submissions.length
    ? (submissions.reduce((acc, s) => acc + (Number(s.overall_risk_score) || 0), 0) / submissions.length).toFixed(1)
    : '0.0';

  const getRiskScoreBadge = (score) => {
    const num = Number(score) || 0;
    if (num < 40) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">{num.toFixed(1)} / Low Risk</span>;
    } else if (num <= 70) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">{num.toFixed(1)} / Moderate</span>;
    } else {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">{num.toFixed(1)} / Elevated</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'QUOTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle className="w-3.5 h-3.5" /> QUOTED</span>;
      case 'DECLINED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800"><XCircle className="w-3.5 h-3.5" /> DECLINED</span>;
      case 'FLAGGED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><AlertTriangle className="w-3.5 h-3.5" /> FLAGGED</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><Clock className="w-3.5 h-3.5" /> UNDER REVIEW</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status || 'SUBMITTED'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Review Queue</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-slate-900">{activeCount}</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">Prioritized</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Flagged Missing Info</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-amber-600">{flaggedCount}</span>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">Requires Action</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Risk Score</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-slate-900">{avgScore}</span>
            <span className="text-xs text-slate-500">Scale 0 - 100</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quotes Bound/Issued</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-emerald-600">{quotedCount}</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">Completed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Insured Name or Tracking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Risk:</span>
            <select
              value={riskTypeFilter}
              onChange={(e) => setRiskTypeFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Lines</option>
              <option value="CYBER">Cyber</option>
              <option value="D_AND_O">D&O</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="FLAGGED">Flagged</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="QUOTED">Quoted</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>

          <button
            onClick={fetchQueue}
            title="Refresh"
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchQueue} className="font-semibold underline ml-4">Retry</button>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading underwriting review queue...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <p className="font-medium text-slate-700">No facultative reinsurance submissions found.</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting search or submit a new carrier request.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Tracking ID</th>
                  <th className="px-5 py-3">Insured Entity</th>
                  <th className="px-5 py-3">Risk Line</th>
                  <th className="px-5 py-3">Requested Limit</th>
                  <th className="px-5 py-3">Attachment</th>
                  <th className="px-5 py-3">Risk Score</th>
                  <th className="px-5 py-3">Flags</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-900">
                      {sub.tracking_number || sub.id?.substring(0, 12)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div>{sub.insured_name}</div>
                      <div className="text-xs text-slate-500">{sub.industry_sector}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-700">
                        {sub.risk_type === 'CYBER' ? (
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                        )}
                        {sub.risk_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-mono text-xs">
                      ${((Number(sub.requested_reinsurance_limit || sub.requested_limit) || 0) / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-mono text-xs">
                      ${((Number(sub.attachment_point) || 0) / 1000000).toFixed(1)}M xs
                    </td>
                    <td className="px-5 py-3.5">
                      {getRiskScoreBadge(sub.overall_risk_score)}
                    </td>
                    <td className="px-5 py-3.5">
                      {sub.missing_flags_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> {sub.missing_flags_count} missing
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Complete</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/submissions/${sub.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        Review <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
