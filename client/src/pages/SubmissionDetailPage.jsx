import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Building2, Calendar, DollarSign, FileText, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';
import RiskScoreBreakdownCard from '../components/RiskScoreBreakdownCard';
import MissingInfoAlertBanner from '../components/MissingInfoAlertBanner';
import UnderwriterDecisionPanel from '../components/UnderwriterDecisionPanel';
import AuditTrailTimeline from '../components/AuditTrailTimeline';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recalculating, setRecalculating] = useState(false);

  const fetchSubmission = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSubmissionById(id);
      setSubmission(data);
    } catch (err) {
      console.error('Failed to fetch submission details:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load submission details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const handleRecalculateScore = async () => {
    setRecalculating(true);
    try {
      await api.recalculateRiskScore(id);
      await fetchSubmission();
    } catch (err) {
      alert('Failed to recompute score: ' + (err.response?.data?.detail || err.message));
    } finally {
      setRecalculating(false);
    }
  };

  const handleDecisionRecorded = (decisionResult) => {
    fetchSubmission();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
        <p className="text-sm font-medium">Loading submission workspace...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl max-w-lg mx-auto text-center space-y-4 my-8">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="font-bold text-base">Submission Not Found</h3>
        <p className="text-xs text-red-700">{error || 'Could not locate submission records.'}</p>
        <Link to="/queue" className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
          Return to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/queue"
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {submission.tracking_number || submission.id}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                {submission.risk_type === 'CYBER' ? <Shield className="w-3.5 h-3.5 text-blue-600" /> : <Building2 className="w-3.5 h-3.5 text-purple-600" />}
                {submission.risk_type}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{submission.insured_name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            {submission.status || 'SUBMITTED'}
          </span>
        </div>
      </div>

      {/* Main 12-Column Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk & Data Overview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Missing Info Alert Banner */}
          <MissingInfoAlertBanner flags={submission.missing_flags || submission.missing_information_flags || []} />

          {/* Risk Score Breakdown Card */}
          <RiskScoreBreakdownCard
            riskScore={submission.risk_score || submission.risk_scores?.[0] || { overall_risk_score: submission.overall_risk_score }}
            onRecalculate={handleRecalculateScore}
            isRecalculating={recalculating}
          />

          {/* Policy Limits & Terms Overview */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Policy Parameters & Exposure
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Industry Sector</span>
                <span className="font-semibold text-slate-800 text-sm">{submission.industry_sector}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Annual Revenue</span>
                <span className="font-semibold text-slate-800 text-sm">
                  ${Number(submission.annual_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Primary Policy Limit</span>
                <span className="font-semibold text-slate-800 text-sm">
                  ${Number(submission.primary_policy_limit || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Requested Reinsurance</span>
                <span className="font-semibold text-blue-700 text-sm font-bold">
                  ${Number(submission.requested_reinsurance_limit || submission.requested_limit || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Attachment Point</span>
                <span className="font-semibold text-slate-800 text-sm">
                  ${Number(submission.attachment_point || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Policy Period</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {submission.policy_effective_date} to {submission.policy_expiration_date}
                </span>
              </div>
            </div>
          </div>

          {/* Attached Evidence Documents */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Attached Underwriting Documents
            </h3>

            {(!submission.documents || submission.documents.length === 0) ? (
              <p className="text-xs text-slate-400 py-2">No documents attached with initial submission.</p>
            ) : (
              <div className="space-y-2">
                {submission.documents.map((doc, idx) => (
                  <div key={doc.id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <div>
                        <span className="font-semibold text-slate-800">{doc.document_type}</span>
                        <span className="text-slate-400 ml-2 font-mono">{doc.filename}</span>
                      </div>
                    </div>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Underwriter Decision Panel & Audit Log (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <UnderwriterDecisionPanel
            submissionId={submission.id}
            currentDecision={submission.decision || submission.underwriting_decision || submission.decisions?.[0]}
            onDecisionRecorded={handleDecisionRecorded}
          />

          <AuditTrailTimeline
            submissionId={submission.id}
            logs={submission.audit_logs || submission.audit_trail || []}
          />
        </div>
      </div>
    </div>
  );
}
