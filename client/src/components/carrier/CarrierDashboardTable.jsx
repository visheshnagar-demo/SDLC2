import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, RefreshCw, FileText, ExternalLink, Shield, Briefcase, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Card from '../common/Card';
import { api } from '../../services/api';

export const CarrierDashboardTable = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskTypeFilter, setRiskTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSubmissions();
      setSubmissions(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load submissions from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredSubmissions = submissions.filter((item) => {
    const matchesSearch =
      (item.insured_name && item.insured_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.submission_reference && item.submission_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRiskType = riskTypeFilter === 'ALL' || item.risk_type === riskTypeFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesRiskType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{submissions.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2461F5] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Placements</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {submissions.filter((s) => ['SUBMITTED', 'UNDER_REVIEW'].includes(s.status)).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Binding Quotes</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {submissions.filter((s) => s.status === 'QUOTED').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Declined</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {submissions.filter((s) => s.status === 'DECLINED').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by insured name, reference ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Risk Type Filter */}
            <select
              value={riskTypeFilter}
              onChange={(e) => setRiskTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Risk Types</option>
              <option value="CYBER">Cyber Risk</option>
              <option value="D_AND_O">D&O Liability</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="QUOTED">Quoted</option>
              <option value="DECLINED">Declined</option>
            </select>

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchSubmissions}>
              Refresh
            </Button>

            <Link to="/carrier/submit">
              <Button variant="primary" size="sm" icon={Plus}>
                New Request
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card>
        {error && (
          <div className="p-4 mb-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={fetchSubmissions} className="text-xs font-semibold underline hover:text-rose-900">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading carrier submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-800">No Submissions Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || riskTypeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or clear filters.'
                : 'Start by creating your first Cyber or D&O facultative reinsurance submission.'}
            </p>
            <div className="mt-4">
              <Link to="/carrier/submit">
                <Button variant="primary" size="sm" icon={Plus}>
                  Submit Request
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 border-y border-slate-200 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6">Reference / ID</th>
                  <th className="py-3 px-4">Insured Name</th>
                  <th className="py-3 px-4">Risk Category</th>
                  <th className="py-3 px-4">Limit Requested</th>
                  <th className="py-3 px-4">Attachment</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-900">
                      {item.submission_reference || item.id?.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.insured_name}
                      <span className="block text-[10px] font-normal text-slate-400">{item.industry_segment}</span>
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
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">
                      {formatCurrency(item.sum_insured)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatCurrency(item.attachment_point)}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.risk_tier ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant={item.risk_tier} size="sm">
                            {item.risk_tier} {item.risk_score ? `(${item.risk_score}/100)` : ''}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Score</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={item.status} size="sm">
                        {item.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link to={`/underwriter/submissions/${item.id}`}>
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
