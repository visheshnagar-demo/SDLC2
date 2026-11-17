import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Lock,
  Unlock,
  Shield,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Card from '../common/Card';
import { api } from '../../services/api';

export const UnderwriterReviewQueueTable = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskTypeFilter, setRiskTypeFilter] = useState('ALL');
  const [riskTierFilter, setRiskTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('risk_score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [lockingId, setLockingId] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUnderwriterQueue({
        risk_type: riskTypeFilter !== 'ALL' ? riskTypeFilter : undefined,
        risk_tier: riskTierFilter !== 'ALL' ? riskTierFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setQueue(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch underwriter review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [riskTypeFilter, riskTierFilter, statusFilter]);

  const handleToggleLock = async (submissionId, isLocked) => {
    setLockingId(submissionId);
    try {
      await api.toggleLock(submissionId, isLocked ? 'release' : 'acquire');
      await fetchQueue();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update concurrency lock');
    } finally {
      setLockingId(null);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredQueue = queue
    .filter((item) => {
      const matchSearch =
        (item.insured_name && item.insured_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.submission_reference && item.submission_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.carrier_name && item.carrier_name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (aVal === undefined || aVal === null) aVal = 0;
      if (bVal === undefined || bVal === null) bVal = 0;
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const highRiskCount = queue.filter((i) => i.risk_tier === 'HIGH').length;
  const pendingCount = queue.filter((i) => ['SUBMITTED', 'UNDER_REVIEW'].includes(i.status)).length;
  const lockedCount = queue.filter((i) => !!i.active_lock_user_id).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Underwriter Review Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Prioritize, score, audit missing information, and issue binding quotes or decline decisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchQueue}>
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Underwriting</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2461F5] flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">High Risk Submissions</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{highRiskCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Concurrency Locks</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{lockedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total in Workbench</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{queue.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by Insured, Carrier, or Reference ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            {/* Risk Type Filter */}
            <select
              value={riskTypeFilter}
              onChange={(e) => setRiskTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Categories</option>
              <option value="CYBER">Cyber Risk</option>
              <option value="D_AND_O">D&O Liability</option>
            </select>

            {/* Risk Tier Filter */}
            <select
              value={riskTierFilter}
              onChange={(e) => setRiskTierFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="QUOTED">Quoted</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Queue Table */}
      <Card>
        {error && (
          <div className="p-4 mb-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={fetchQueue} className="text-xs font-semibold underline hover:text-rose-900">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading underwriter review queue...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-800">Review Queue is Empty</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No pending requests matching the active filter criteria. Check back soon for new carrier submissions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 border-y border-slate-200 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6 cursor-pointer" onClick={() => handleSort('submission_reference')}>
                    <div className="flex items-center gap-1">
                      <span>Reference</span>
                      {sortField === 'submission_reference' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="py-3 px-4">Insured & Industry</th>
                  <th className="py-3 px-4">Risk Category</th>
                  <th className="py-3 px-4">Limit / Attachment</th>
                  <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('risk_score')}>
                    <div className="flex items-center gap-1">
                      <span>Risk Score</span>
                      {sortField === 'risk_score' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="py-3 px-4">Missing Flags</th>
                  <th className="py-3 px-4">Lock Status</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredQueue.map((item) => {
                  const isLocked = !!item.active_lock_user_id;
                  const missingCount = Array.isArray(item.missing_flags) ? item.missing_flags.length : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-slate-900 font-bold">
                        {item.submission_reference || item.id?.slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{item.insured_name}</span>
                        <span className="text-[10px] text-slate-400">{item.industry_segment}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.risk_type === 'CYBER' ? (
                          <div className="flex items-center gap-1.5 text-blue-700">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Cyber</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-purple-700">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>D&O</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-semibold text-slate-900">{formatCurrency(item.sum_insured)}</span>
                        <span className="block text-[10px] text-slate-400">Att: {formatCurrency(item.attachment_point)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.risk_tier ? (
                          <div className="space-y-1">
                            <Badge variant={item.risk_tier} size="sm">
                              {item.risk_tier} ({item.risk_score || 0}/100)
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {missingCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px] font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            {missingCount} missing item{missingCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Complete
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleLock(item.id, isLocked)}
                          disabled={lockingId === item.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            isLocked
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={item.status} size="sm">
                          {item.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link to={`/underwriter/submissions/${item.id}`}>
                          <Button variant="primary" size="sm" icon={ArrowRight}>
                            Review & Decide
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UnderwriterReviewQueueTable;
