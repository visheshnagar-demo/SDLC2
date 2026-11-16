import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { RiskScoreBreakdownCard } from '../components/underwriter/RiskScoreBreakdownCard';
import { DecisionConsoleForm } from '../components/underwriter/DecisionConsoleForm';
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Calendar,
  ShieldAlert,
  FileText,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
} from 'lucide-react';

export const UnderwriterDetailPage = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUnderwritingSubmissionDetail(id);
      setSubmission(data);
      setIsLocked(Boolean(data?.active_lock_user_id));
    } catch (err) {
      setError('Unable to load submission detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleToggleLock = async () => {
    try {
      const nextAction = isLocked ? 'unlock' : 'lock';
      await api.lockSubmission(id, nextAction);
      setIsLocked(!isLocked);
    } catch {
      // Non-blocking
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

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500 text-sm">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
        Loading submission risk profile...
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-2xl mx-auto my-12 text-center space-y-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold">Submission Not Found</h2>
          <p className="text-xs text-red-600 mt-1">{error || 'Unable to retrieve risk data.'}</p>
        </div>
        <Link to="/underwriter/queue">
          <Button variant="secondary" icon={ArrowLeft}>
            Back to Underwriter Queue
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/underwriter/queue">
            <Button variant="secondary" size="sm" icon={ArrowLeft}>
              Back to Queue
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{submission.insured_name}</h1>
              <Badge variant={submission.risk_type?.toLowerCase() || 'default'}>
                {submission.risk_type}
              </Badge>
              <Badge variant={submission.status?.toLowerCase() || 'default'}>
                {submission.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Ref: {submission.submission_reference || submission.id} &bull; Sector:{' '}
              {submission.industry_segment || 'General Industry'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isLocked ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggleLock}
            icon={isLocked ? Lock : Unlock}
          >
            {isLocked ? 'Release Review Lock' : 'Acquire Review Lock'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left = Risk Details & Breakdown, Right = Decision Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Risk Parameters & Scoring Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Profile & Parameters Card */}
          <Card title="Facultative Reinsurance Terms & Insured Exposure">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-500 font-medium block">Sum Insured / Limit:</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                  {formatCurrency(submission.sum_insured)}
                </span>
              </div>

              <div>
                <span className="text-gray-500 font-medium block">Attachment Point / Excess:</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                  {formatCurrency(submission.attachment_point)}
                </span>
              </div>

              <div>
                <span className="text-gray-500 font-medium block">Annual Revenue (USD):</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                  {formatCurrency(submission.annual_revenue)}
                </span>
              </div>

              <div>
                <span className="text-gray-500 font-medium block">Policy Period:</span>
                <span className="text-gray-800 font-semibold block mt-0.5">
                  {submission.policy_start_date} to {submission.policy_end_date}
                </span>
              </div>

              <div>
                <span className="text-gray-500 font-medium block">3-Yr Loss History:</span>
                <span className="text-gray-800 font-semibold block mt-0.5">
                  {submission.prior_claims_count || 0} claims (
                  {formatCurrency(submission.prior_claims_total)})
                </span>
              </div>

              <div>
                <span className="text-gray-500 font-medium block">Security Audit Score:</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                  {submission.security_governance_score || 85} / 100
                </span>
              </div>
            </div>

            {/* Attachments Section if present */}
            {submission.attachments && submission.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-700 block mb-2">
                  Uploaded Supporting Attachments:
                </span>
                <div className="flex flex-wrap gap-2">
                  {submission.attachments.map((att, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs font-medium text-gray-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      {att.file_name || att.doc_type || 'Attachment Document'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Automated Risk Score & Missing Flags Card */}
          <RiskScoreBreakdownCard submission={submission} />
        </div>

        {/* Right Column (1 Col): Decision Console */}
        <div className="space-y-6">
          <DecisionConsoleForm
            submission={submission}
            onDecisionRecorded={(decisionResult) => {
              setSubmission((prev) => ({
                ...prev,
                status: decisionResult?.decision === 'QUOTE' ? 'QUOTED' : 'DECLINED',
              }));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UnderwriterDetailPage;
