import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Percent,
  FileText,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const DecisionConsoleForm = ({ submission, onDecisionRecorded }) => {
  const [decisionType, setDecisionType] = useState('QUOTE');
  const [declineReasons, setDeclineReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Quote fields
  const [quoteData, setQuoteData] = useState({
    capacity_offered: submission?.sum_insured || '',
    rate_on_line_pct: '2.5',
    premium_amount: '',
    binding_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    subjectivities: 'Subject to satisfactory ransomware resilience audit and receipt of clean claims warranty prior to binding.',
  });

  // Decline fields
  const [declineData, setDeclineData] = useState({
    decline_reason_code: 'HIGH_EXPOSURE_AGGREGATION',
    decline_notes: '',
  });

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const reasons = await api.getDeclineReasons();
        setDeclineReasons(Array.isArray(reasons) ? reasons : []);
      } catch {
        setDeclineReasons([
          { code: 'HIGH_EXPOSURE_AGGREGATION', label: 'High Exposure Aggregation across portfolio' },
          { code: 'POOR_SECURITY_GOVERNANCE', label: 'Inadequate Security Controls or Governance Score' },
          { code: 'EXCESSIVE_CLAIM_HISTORY', label: 'Excessive Prior Claim Frequency or Severity' },
          { code: 'INADEQUATE_ATTACHMENT_POINT', label: 'Attachment Point Below Minimum Underwriting Guidelines' },
          { code: 'APPETITE_RESTRICTION', label: 'Restricted Industry Segment or Risk Class' },
          { code: 'UNRESOLVED_SUBJECTIVITIES', label: 'Incomplete Audit Disclosures or Unresolved Subjectivities' },
        ]);
      }
    };
    fetchReasons();
  }, []);

  // Auto-calculate premium from capacity * rate on line
  useEffect(() => {
    const cap = Number(quoteData.capacity_offered) || 0;
    const rol = Number(quoteData.rate_on_line_pct) || 0;
    if (cap > 0 && rol > 0) {
      const calcPremium = Math.round((cap * rol) / 100);
      setQuoteData((prev) => ({ ...prev, premium_amount: String(calcPremium) }));
    }
  }, [quoteData.capacity_offered, quoteData.rate_on_line_pct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (decisionType === 'QUOTE') {
      if (!quoteData.capacity_offered || Number(quoteData.capacity_offered) <= 0) {
        setError('Capacity Offered must be greater than 0');
        return;
      }
      if (!quoteData.premium_amount || Number(quoteData.premium_amount) <= 0) {
        setError('Premium Amount must be greater than 0');
        return;
      }
      if (!quoteData.binding_deadline) {
        setError('Binding Deadline is required');
        return;
      }
    } else {
      if (!declineData.decline_reason_code) {
        setError('Standardized Decline Reason Code is mandatory for decline decisions');
        return;
      }
    }

    setLoading(true);
    try {
      const payload =
        decisionType === 'QUOTE'
          ? {
              decision: 'QUOTE',
              capacity_offered: Number(quoteData.capacity_offered),
              rate_on_line_pct: Number(quoteData.rate_on_line_pct),
              premium_amount: Number(quoteData.premium_amount),
              binding_deadline: quoteData.binding_deadline,
              subjectivities: quoteData.subjectivities,
            }
          : {
              decision: 'DECLINE',
              decline_reason_code: declineData.decline_reason_code,
              decline_notes: declineData.decline_notes,
            };

      const result = await api.recordDecision(submission.id, payload);
      setSuccess({
        decision: decisionType,
        timestamp: new Date().toISOString(),
        details: result,
      });

      if (onDecisionRecorded) {
        onDecisionRecorded(result);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to record underwriting decision.';
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : String(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/40">
        <div className="p-4 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">
            Underwriting Decision Formally Recorded
          </h3>
          <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
            Decision notice for <strong>{submission.insured_name}</strong> has been sealed with an immutable audit log entry.
          </p>

          <div className="mt-4 inline-flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Recorded Decision:</span>
            <Badge variant={success.decision === 'QUOTE' ? 'success' : 'danger'}>
              {success.decision === 'QUOTE' ? 'BINDING QUOTE ISSUED' : 'DECLINE NOTICE RECORDED'}
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Underwriting Decision Console"
      subtitle="Issue binding facultative terms or record formal decline notice with audit trail"
    >
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Decision Mode Selector Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setDecisionType('QUOTE')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            decisionType === 'QUOTE'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Issue Binding Quote Terms
        </button>

        <button
          type="button"
          onClick={() => setDecisionType('DECLINE')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            decisionType === 'DECLINE'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-600" />
          Record Decline Decision
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {decisionType === 'QUOTE' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Capacity Offered (USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={quoteData.capacity_offered}
                    onChange={(e) =>
                      setQuoteData((prev) => ({ ...prev, capacity_offered: e.target.value }))
                    }
                    placeholder="5000000"
                    className="w-full text-xs pl-7 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rate on Line (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={quoteData.rate_on_line_pct}
                    onChange={(e) =>
                      setQuoteData((prev) => ({ ...prev, rate_on_line_pct: e.target.value }))
                    }
                    placeholder="2.5"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 text-xs">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Calculated Premium (USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={quoteData.premium_amount}
                    onChange={(e) =>
                      setQuoteData((prev) => ({ ...prev, premium_amount: e.target.value }))
                    }
                    placeholder="125000"
                    className="w-full text-xs pl-7 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Binding Terms Deadline *
                </label>
                <input
                  type="date"
                  value={quoteData.binding_deadline}
                  onChange={(e) =>
                    setQuoteData((prev) => ({ ...prev, binding_deadline: e.target.value }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Underwriting Subjectivities & Conditions
              </label>
              <textarea
                rows={3}
                value={quoteData.subjectivities}
                onChange={(e) =>
                  setQuoteData((prev) => ({ ...prev, subjectivities: e.target.value }))
                }
                placeholder="List all policy endorsements or required audits prior to binding..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Standardized Decline Reason Code *
              </label>
              <select
                value={declineData.decline_reason_code}
                onChange={(e) =>
                  setDeclineData((prev) => ({ ...prev, decline_reason_code: e.target.value }))
                }
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white font-medium"
              >
                {declineReasons.length > 0 ? (
                  declineReasons.map((r) => (
                    <option key={r.code || r} value={r.code || r}>
                      {r.label ? `${r.code} — ${r.label}` : r}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="HIGH_EXPOSURE_AGGREGATION">
                      HIGH_EXPOSURE_AGGREGATION — High Exposure Aggregation across portfolio
                    </option>
                    <option value="POOR_SECURITY_GOVERNANCE">
                      POOR_SECURITY_GOVERNANCE — Inadequate Security Controls or Governance Score
                    </option>
                    <option value="EXCESSIVE_CLAIM_HISTORY">
                      EXCESSIVE_CLAIM_HISTORY — Excessive Prior Claim Frequency or Severity
                    </option>
                    <option value="INADEQUATE_ATTACHMENT_POINT">
                      INADEQUATE_ATTACHMENT_POINT — Attachment Point Below Minimum Guidelines
                    </option>
                    <option value="APPETITE_RESTRICTION">
                      APPETITE_RESTRICTION — Restricted Industry Segment or Risk Class
                    </option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Decline Underwriting Notes / Detailed Justification
              </label>
              <textarea
                rows={3}
                value={declineData.decline_notes}
                onChange={(e) =>
                  setDeclineData((prev) => ({ ...prev, decline_notes: e.target.value }))
                }
                placeholder="Optional notes explaining portfolio capacity constraints or risk evaluation..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <Button
            type="submit"
            variant={decisionType === 'QUOTE' ? 'accent' : 'danger'}
            disabled={loading}
            icon={Send}
            size="md"
          >
            {loading
              ? 'Recording Decision...'
              : decisionType === 'QUOTE'
              ? 'Confirm & Transmit Binding Quote'
              : 'Confirm & Transmit Formal Decline'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DecisionConsoleForm;
