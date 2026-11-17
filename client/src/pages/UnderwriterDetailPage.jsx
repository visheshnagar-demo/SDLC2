import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Briefcase,
  Lock,
  Unlock,
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  History,
  Download,
  Building,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import RiskScoreBreakdownCard from '../components/underwriter/RiskScoreBreakdownCard';
import DecisionConsoleForm from '../components/underwriter/DecisionConsoleForm';
import { api } from '../services/api';

export const UnderwriterDetailPage = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocking, setIsLocking] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSubmissionDetail(id);
      setSubmission(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch submission details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handleToggleLock = async () => {
    if (!submission) return;
    setIsLocking(true);
    const isLocked = !!submission.active_lock_user_id;
    try {
      await api.toggleLock(id, isLocked ? 'release' : 'acquire');
      await fetchDetail();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to toggle review concurrency lock');
    } finally {
      setIsLocking(false);
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

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-base font-semibold text-slate-700">Loading submission data and risk score model...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Unable to Load Submission</h2>
          <p className="text-xs text-rose-700 mt-1">{error || 'Submission was not found.'}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/underwriter/queue">
              <Button variant="secondary" icon={ArrowLeft}>
                Back to Review Queue
              </Button>
            </Link>
            <Button variant="primary" icon={RefreshCw} onClick={fetchDetail}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isLocked = !!submission.active_lock_user_id;

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/underwriter/queue" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Underwriting Review Queue</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant={isLocked ? 'secondary' : 'primary'}
            size="sm"
            icon={isLocked ? Unlock : Lock}
            onClick={handleToggleLock}
            disabled={isLocking}
          >
            {isLocked ? 'Release Lock' : 'Acquire Review Lock'}
          </Button>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchDetail}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Submission Header Card */}
      <Card className="border-l-4 border-l-[#2461F5]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-slate-900">
                {submission.submission_reference || submission.id}
              </span>
              <Badge variant={submission.status} size="md">
                {submission.status?.replace('_', ' ')}
              </Badge>
              {submission.risk_tier && (
                <Badge variant={submission.risk_tier} size="md">
                  {submission.risk_tier} RISK ({submission.risk_score || 0}/100)
                </Badge>
              )}
              {isLocked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  <Lock className="w-3 h-3" /> Locked for Underwriting
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-6 h-6 text-slate-400" />
              {submission.insured_name}
            </h1>
            <p className="text-xs text-slate-500">
              {submission.industry_segment} • Carrier ID: {submission.carrier_id?.slice(0, 8) || 'Carrier Partner'}
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            {submission.risk_type === 'CYBER' ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#2461F5] flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Cyber Facultative</p>
                  <p className="text-[10px] text-slate-500">Ransomware, Extortion & Privacy</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Directors & Officers (D&O)</p>
                  <p className="text-[10px] text-slate-500">Securities & Management Liability</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Grid: Insured Details & Limit Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Insured Financials & Security Posture">
          <dl className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-400 font-semibold uppercase tracking-wider">Annual Revenue</dt>
              <dd className="text-sm font-bold text-slate-900 mt-0.5">
                {formatCurrency(submission.annual_revenue)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                {submission.risk_type === 'CYBER' ? 'Security Posture Score' : 'Governance Score'}
              </dt>
              <dd className="text-sm font-bold text-blue-600 mt-0.5">
                {submission.security_governance_score || 0} / 100
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-semibold uppercase tracking-wider">Prior 5-Year Claims</dt>
              <dd className="text-sm font-bold text-slate-900 mt-0.5">
                {submission.prior_claims_count || 0} claim(s)
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-semibold uppercase tracking-wider">Prior Claims Incurred</dt>
              <dd className="text-sm font-bold text-rose-600 mt-0.5">
                {formatCurrency(submission.prior_claims_total)}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Placement Structure & Policy Period">
          <dl className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-400 font-semibold uppercase tracking-wider">Requested Reinsurance Limit</dt>
              <dd className="text-sm font-bold text-emerald-600 mt-0.5">
                {formatCurrency(submission.sum_insured)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-semibold uppercase tracking-wider">Attachment Point / Retention</dt>
              <dd className="text-sm font-bold text-slate-900 mt-0.5">
                {formatCurrency(submission.attachment_point)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-semibold uppercase tracking-wider">Policy Inception Date</dt>
              <dd className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {submission.policy_start_date || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-semibold uppercase tracking-wider">Policy Expiration Date</dt>
              <dd className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {submission.policy_end_date || 'N/A'}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Automated Risk Score Engine & Completeness Flags */}
      <RiskScoreBreakdownCard
        riskScore={submission.risk_score || 0}
        riskTier={submission.risk_tier || 'LOW'}
        riskBreakdowns={submission.risk_score_breakdowns || []}
        missingFlags={submission.missing_flags || []}
      />

      {/* Attachments Section */}
      <Card title="Submitted Policy Documents & Attachments" subtitle="Supporting slips, financials, and technical risk forms">
        {submission.attachments && submission.attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {submission.attachments.map((att) => (
              <div key={att.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{att.file_name || 'Document Attachment'}</p>
                    <p className="text-[10px] text-slate-400">{att.document_type || 'SUPPORTING_DOC'}</p>
                  </div>
                </div>
                <Badge variant="primary" size="sm">Attached</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-400">
            No document attachments were uploaded for this submission.
          </div>
        )}
      </Card>

      {/* Decision Console */}
      <DecisionConsoleForm
        submissionId={submission.id}
        sumInsured={submission.sum_insured}
        currentStatus={submission.status}
        onDecisionRecorded={fetchDetail}
      />

      {/* Decision & Audit History */}
      {submission.decisions && submission.decisions.length > 0 && (
        <Card title="Decision History & Binding Terms" subtitle="Audit trail of underwriter actions">
          <div className="space-y-3">
            {submission.decisions.map((dec) => (
              <div
                key={dec.id}
                className={`p-4 rounded-xl border text-xs ${
                  dec.decision === 'QUOTE'
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {dec.decision === 'QUOTE' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span className="font-bold">
                      {dec.decision === 'QUOTE' ? 'Binding Quote Issued' : 'Decline Notice Recorded'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {dec.created_at ? new Date(dec.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>

                {dec.decision === 'QUOTE' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Capacity Offered:</span>
                      <span className="font-bold">{formatCurrency(dec.capacity_offered)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Rate on Line:</span>
                      <span className="font-bold">{dec.rate_on_line_pct}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Premium:</span>
                      <span className="font-bold">{formatCurrency(dec.premium_amount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Binding Deadline:</span>
                      <span className="font-bold">{dec.binding_deadline || '30 Days'}</span>
                    </div>
                    {dec.subjectivities && (
                      <div className="col-span-2 sm:col-span-4 mt-1 bg-white/60 p-2 rounded">
                        <span className="text-slate-500 font-semibold block">Subjectivities:</span>
                        <span>{dec.subjectivities}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] space-y-1">
                    <p>
                      <span className="text-slate-500 font-semibold">Reason Code: </span>
                      <span className="font-mono font-bold text-rose-700">{dec.decline_reason_code}</span>
                    </p>
                    {dec.decline_notes && (
                      <p>
                        <span className="text-slate-500 font-semibold">Notes: </span>
                        {dec.decline_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default UnderwriterDetailPage;
