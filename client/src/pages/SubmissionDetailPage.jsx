import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Briefcase, AlertTriangle, CheckCircle, Ban, DollarSign, Calendar, Building, Loader2 } from 'lucide-react';
import RiskScoreBadge from '../components/RiskScoreBadge';
import DecisionWorkbenchModal from '../components/DecisionWorkbenchModal';
import { api } from '../services/api';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSubmissionById(id);
      setSubmission(data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to retrieve submission details.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-sm text-slate-500">Loading placement dossier...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <h3 className="font-bold text-base mb-1">Error Loading Submission</h3>
          <p className="text-sm">{error || 'Submission record could not be found.'}</p>
          <button
            onClick={() => navigate('/underwriter')}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Return to Review Queue
          </button>
        </div>
      </div>
    );
  }

  const isCyber = submission.risk_type === 'CYBER';
  const cyber = submission.cyber_profile || {};
  const doRisk = submission.do_profile || {};
  const flags = submission.missing_flags || [];
  const decisions = submission.decisions || [];
  const score = submission.risk_score ?? submission.risk_score_value ?? 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{submission.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                submission.status === 'QUOTED' || submission.status === 'QUOTE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : submission.status === 'DECLINED' || submission.status === 'DECLINE'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {submission.status || 'PENDING_REVIEW'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">
              {submission.insured_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RiskScoreBadge score={score} size="lg" />
          <button
            onClick={() => setDecisionModalOpen(true)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md transition-colors"
          >
            Execute Decision
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Financial Terms and Risk Profile */}
        <div className="lg:col-span-8 space-y-6">
          {/* Financial Terms Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Reinsurance Financial Structure
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block">Primary Limit</span>
                <span className="text-base font-bold text-slate-900">${Number(submission.primary_limit || 0).toLocaleString()}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block">Attachment Point</span>
                <span className="text-base font-bold text-slate-900">${Number(submission.attachment_point || 0).toLocaleString()}</span>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                <span className="text-xs text-blue-700 font-semibold block">Requested Fac Limit</span>
                <span className="text-base font-bold text-blue-900">${Number(submission.ceded_limit || 0).toLocaleString()}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block">Underlying Premium</span>
                <span className="text-base font-bold text-slate-900">${Number(submission.carrier_premium || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div>
                <span className="font-semibold text-slate-700">Ceding Carrier:</span> {submission.carrier_name}
              </div>
              <div className="font-mono">
                <span className="font-semibold text-slate-700">Policy Period:</span> {submission.policy_start_date} to {submission.policy_end_date}
              </div>
            </div>
          </div>

          {/* Risk Profile Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              {isCyber ? <Shield className="h-5 w-5 text-blue-600" /> : <Briefcase className="h-5 w-5 text-indigo-600" />}
              {isCyber ? 'Cyber Security Controls & Exposure Profile' : 'D&O Corporate Governance & Financial Profile'}
            </h3>

            {isCyber ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg border ${cyber.mfa_enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <span className="text-xs text-slate-500 block font-medium">MFA Enforced</span>
                    <span className={`text-sm font-bold ${cyber.mfa_enabled ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {cyber.mfa_enabled ? 'Enforced (Active)' : 'Missing / Incomplete'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border ${cyber.edr_deployed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <span className="text-xs text-slate-500 block font-medium">EDR Active</span>
                    <span className={`text-sm font-bold ${cyber.edr_deployed ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {cyber.edr_deployed ? 'Deployed' : 'Not Deployed'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border ${cyber.backups_offline ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <span className="text-xs text-slate-500 block font-medium">Air-gapped Backups</span>
                    <span className={`text-sm font-bold ${cyber.backups_offline ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {cyber.backups_offline ? 'Tested & Isolated' : 'Vulnerable'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-slate-50 rounded-lg text-xs">
                    <span className="text-slate-500 block">Sensitive Record Count:</span>
                    <span className="text-sm font-bold text-slate-900">{Number(cyber.records_count || 0).toLocaleString()} records</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-xs">
                    <span className="text-slate-500 block">Prior Breaches (3 Yrs):</span>
                    <span className="text-sm font-bold text-slate-900">{cyber.prior_breach_count || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg text-xs">
                    <span className="text-slate-500 block">Debt-to-Equity:</span>
                    <span className="text-sm font-bold text-slate-900">{doRisk.debt_to_equity_ratio ?? 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-xs">
                    <span className="text-slate-500 block">Executive Turnover:</span>
                    <span className="text-sm font-bold text-slate-900">{doRisk.executive_turnover_rate ? `${doRisk.executive_turnover_rate}%` : '0%'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-xs">
                    <span className="text-slate-500 block">Pending Litigation:</span>
                    <span className="text-sm font-bold text-slate-900">{doRisk.pending_litigation_count || 0}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${doRisk.independent_board_charter ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <span className="text-xs text-slate-500 block font-medium">Independent Board Charter</span>
                  <span className={`text-sm font-bold ${doRisk.independent_board_charter ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {doRisk.independent_board_charter ? 'Confirmed' : 'Unverified'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 cols: Flags and Underwriting Decisions History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Missing Info Flags */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Missing Info Flags
              </span>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-700">
                {flags.length}
              </span>
            </h3>

            {flags.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                No missing information flags.
              </div>
            ) : (
              <div className="space-y-3">
                {flags.map((flag, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span>{flag.flag_code || 'FLAG'}</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono">
                        {flag.severity || 'MEDIUM'}
                      </span>
                    </div>
                    <p className="text-slate-700">{flag.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Underwriting Decisions Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Underwriting Decision Log
            </h3>

            {decisions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No formal quote or decline decision recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {decisions.map((dec, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      dec.decision_type === 'QUOTE' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wider text-slate-900">
                        {dec.decision_type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {dec.created_at ? new Date(dec.created_at).toLocaleDateString() : 'Recorded'}
                      </span>
                    </div>

                    {dec.decision_type === 'QUOTE' ? (
                      <div>
                        <div>Offered Capacity: <strong>${Number(dec.offered_capacity || 0).toLocaleString()}</strong></div>
                        <div>Rate-on-Line: <strong>{dec.quoted_rate}%</strong></div>
                      </div>
                    ) : (
                      <div>
                        <div>Reason Code: <strong className="font-mono">{dec.decline_reason_code}</strong></div>
                        {dec.decline_notes && <p className="italic text-slate-600 mt-1">{dec.decline_notes}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DecisionWorkbenchModal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        submission={submission}
        onDecisionSuccess={fetchDetail}
      />
    </div>
  );
}
