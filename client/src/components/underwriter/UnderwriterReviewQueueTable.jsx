import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  UserCheck,
  Search,
  Filter,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldAlert,
  ArrowUpDown,
  ExternalLink,
  RefreshCw,
  FileWarning,
  CheckCircle2,
} from 'lucide-react';

export const UnderwriterReviewQueueTable = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskTypeFilter, setRiskTypeFilter] = useState('ALL');
  const [riskTierFilter, setRiskTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score_desc');
  const [lockingId, setLockingId] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUnderwritingQueue();
      const list = Array.isArray(data) ? data : data?.items || data?.submissions || [];
      setQueue(list);
    } catch (err) {
      setError('Failed to load underwriter review queue.');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleToggleLock = async (id, currentLock) => {
    setLockingId(id);
    try {
      const nextAction = currentLock ? 'unlock' : 'lock';
      await api.lockSubmission(id, nextAction);
      // Update local state
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, active_lock_user_id: currentLock ? null : 'UW-CURRENT' } : item
        )
      );
    } catch {
      // Non-blocking warning on lock failure
    } finally {
      setLockingId(null);
    }
  };

  const filteredAndSortedQueue = queue
    .filter((item) => {
      const matchesSearch =
        !searchQuery ||
        (item.insured_name && item.insured_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.carrier_name && item.carrier_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.submission_reference &&
          item.submission_reference.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRiskType =
        riskTypeFilter === 'ALL' || item.risk_type?.toUpperCase() === riskTypeFilter;

      const matchesRiskTier =
        riskTierFilter === 'ALL' || item.risk_tier?.toUpperCase() === riskTierFilter;

      const matchesStatus =
        statusFilter === 'ALL' || item.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesRiskType && matchesRiskTier && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score_desc') return (b.risk_score || 0) - (a.risk_score || 0);
      if (sortBy === 'score_asc') return (a.risk_score || 0) - (b.risk_score || 0);
      if (sortBy === 'limit_desc') return (b.sum_insured || 0) - (a.sum_insured || 0);
      if (sortBy === 'date_desc')
        return new Date(b.created_at || b.policy_start_date || 0) -
          new Date(a.created_at || a.policy_start_date || 0);
      return 0;
    });

  const stats = {
    total: queue.length,
    highRisk: queue.filter((item) => item.risk_tier?.toUpperCase() === 'HIGH').length,
    flagged: queue.filter(
      (item) => item.missing_flags?.length > 0 || item.has_missing_info || item.missing_flags_count > 0
    ).length,
    pending: queue.filter((item) => ['SUBMITTED', 'UNDER_REVIEW'].includes(item.status?.toUpperCase()))
      .length,
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getRiskTierBadgeVariant = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'LOW':
        return 'low';
      case 'MEDIUM':
        return 'medium';
      case 'HIGH':
        return 'high';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Underwriter Review Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Prioritized facultative reinsurance risk queue with automated risk scoring and completeness checks.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchQueue} icon={RefreshCw} size="md">
          Refresh Queue
        </Button>
      </div>

      {/* Underwriting KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4" bodyClassName="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pending Submissions
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 text-primary p-2.5 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4" bodyClassName="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                High Risk Tiers (Score ≥ 70)
              </p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{stats.highRisk}</p>
            </div>
            <div className="bg-rose-50 text-rose-600 p-2.5 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4" bodyClassName="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Missing Information Flags
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.flagged}</p>
            </div>
            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg">
              <FileWarning className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4" bodyClassName="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Placements in Queue
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-gray-100 text-gray-700 p-2.5 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <Card bodyClassName="p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search insured, carrier or ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">Risk Class:</span>
              <select
                value={riskTypeFilter}
                onChange={(e) => setRiskTypeFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"
              >
                <option value="ALL">All Risks</option>
                <option value="CYBER">Cyber Risk</option>
                <option value="D_AND_O">Directors & Officers</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Risk Tier:</span>
              <select
                value={riskTierFilter}
                onChange={(e) => setRiskTierFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"
              >
                <option value="ALL">All Tiers</option>
                <option value="HIGH">High Risk Tier</option>
                <option value="MEDIUM">Medium Risk Tier</option>
                <option value="LOW">Low Risk Tier</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="QUOTED">Quoted</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"
              >
                <option value="score_desc">Risk Score (High to Low)</option>
                <option value="score_asc">Risk Score (Low to High)</option>
                <option value="limit_desc">Sum Insured (High to Low)</option>
                <option value="date_desc">Newest First</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Review Queue Table */}
      <Card bodyClassName="p-0">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
            Loading Underwriter Review Queue...
          </div>
        ) : filteredAndSortedQueue.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <UserCheck className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-gray-700">No matching requests in review queue</p>
            <p className="text-xs text-gray-500 mt-1">
              Adjust your filters or wait for new carrier submissions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Ref / Timestamp</th>
                  <th className="px-6 py-3.5">Insured Legal Entity</th>
                  <th className="px-6 py-3.5">Risk Class</th>
                  <th className="px-6 py-3.5">Limit / Attachment</th>
                  <th className="px-6 py-3.5">Risk Score / Tier</th>
                  <th className="px-6 py-3.5">Completeness</th>
                  <th className="px-6 py-3.5">Review Lock</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedQueue.map((item) => {
                  const hasFlags =
                    item.missing_flags?.length > 0 ||
                    item.has_missing_info ||
                    item.missing_flags_count > 0;
                  const isLocked = Boolean(item.active_lock_user_id);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-xs text-primary">
                          {item.submission_reference || item.id?.slice(0, 8)}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {item.policy_start_date || 'Inception Pending'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{item.insured_name}</div>
                        <div className="text-xs text-gray-500">
                          {item.industry_segment || 'General Industry'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={item.risk_type?.toLowerCase() || 'default'}>
                          {item.risk_type}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(item.sum_insured)}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          xs {formatCurrency(item.attachment_point)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${
                              item.risk_tier?.toUpperCase() === 'HIGH'
                                ? 'bg-rose-500 ring-2 ring-rose-200'
                                : item.risk_tier?.toUpperCase() === 'MEDIUM'
                                ? 'bg-amber-500 ring-2 ring-amber-200'
                                : 'bg-emerald-500 ring-2 ring-emerald-200'
                            }`}
                          />
                          <Badge variant={getRiskTierBadgeVariant(item.risk_tier)}>
                            {item.risk_tier || 'UNSCORED'}
                          </Badge>
                          <span className="font-mono font-bold text-xs text-gray-800">
                            {item.risk_score ?? '--'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {hasFlags ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Incomplete / Missing Docs
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Disclosures Complete
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleLock(item.id, isLocked)}
                          disabled={lockingId === item.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            isLocked
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                              Locked for Review
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-gray-400" />
                              Unlocked
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link to={`/underwriter/submissions/${item.id}`}>
                          <Button variant="primary" size="sm" icon={ExternalLink}>
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
