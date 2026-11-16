import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  FileText,
  Plus,
  Search,
  Filter,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export const CarrierDashboardTable = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskTypeFilter, setRiskTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSubmissions();
      // Ensure data is array or extracted from items
      const list = Array.isArray(data) ? data : data?.items || data?.submissions || [];
      setSubmissions(list);
    } catch (err) {
      setError('Unable to load carrier submissions.');
      // Empty array fallback without fake data
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      (item.insured_name && item.insured_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.submission_reference &&
        item.submission_reference.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRiskType =
      riskTypeFilter === 'ALL' || item.risk_type?.toUpperCase() === riskTypeFilter;

    const matchesStatus =
      statusFilter === 'ALL' || item.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesRiskType && matchesStatus;
  });

  const stats = {
    total: submissions.length,
    underReview: submissions.filter((s) => ['SUBMITTED', 'UNDER_REVIEW'].includes(s.status?.toUpperCase())).length,
    quoted: submissions.filter((s) => s.status?.toUpperCase() === 'QUOTED').length,
    declined: submissions.filter((s) => s.status?.toUpperCase() === 'DECLINED').length,
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'QUOTED':
        return 'success';
      case 'DECLINED':
        return 'danger';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'SUBMITTED':
        return 'primary';
      default:
        return 'default';
    }
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

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carrier Submissions Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and track your Cyber and D&O facultative reinsurance placements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={fetchSubmissions} icon={RefreshCw} size="md">
            Refresh
          </Button>
          <Link to="/carrier/submit">
            <Button variant="primary" icon={Plus} size="md">
              New Facultative Request
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4" bodyClassName="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Placements
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-50 text-primary p-2.5 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4" bodyClassName="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                In Review / Pending
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.underReview}</p>
            </div>
            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4" bodyClassName="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Binding Quotes Issued
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.quoted}</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4" bodyClassName="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Declined Placements
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.declined}</p>
            </div>
            <div className="bg-red-50 text-red-600 p-2.5 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Insured or Ref #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">Risk Class:</span>
              <select
                value={riskTypeFilter}
                onChange={(e) => setRiskTypeFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Risk Types</option>
                <option value="CYBER">Cyber Risk</option>
                <option value="D_AND_O">Directors & Officers (D&O)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="QUOTED">Quoted</option>
                <option value="DECLINED">Declined</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions Table */}
      <Card bodyClassName="p-0">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
            Loading submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-gray-700">No submissions found</p>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery || riskTypeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filters.'
                : 'Click "New Facultative Request" to submit your first placement.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Ref / Inception</th>
                  <th className="px-6 py-3.5">Insured Legal Entity</th>
                  <th className="px-6 py-3.5">Risk Class</th>
                  <th className="px-6 py-3.5">Limit / Attachment</th>
                  <th className="px-6 py-3.5">Risk Tier</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-xs text-primary">
                        {row.submission_reference || row.id?.slice(0, 8)}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {row.policy_start_date || 'Inception Pending'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{row.insured_name}</div>
                      <div className="text-xs text-gray-500">{row.industry_segment}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={row.risk_type?.toLowerCase() || 'default'}>
                        {row.risk_type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(row.sum_insured)}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        xs {formatCurrency(row.attachment_point)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={getRiskTierBadgeVariant(row.risk_tier)}>
                          {row.risk_tier || 'UNSCORED'}
                        </Badge>
                        {row.risk_score !== undefined && row.risk_score !== null && (
                          <span className="text-xs font-mono font-semibold text-gray-600">
                            ({row.risk_score})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(row.status)}>
                        {row.status || 'SUBMITTED'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/underwriter/submissions/${row.id}`}>
                        <Button variant="ghost" size="sm" icon={ExternalLink}>
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CarrierDashboardTable;
