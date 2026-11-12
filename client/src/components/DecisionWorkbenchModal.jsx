import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Ban, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function DecisionWorkbenchModal({ isOpen, onClose, submission, onDecisionSuccess }) {
  const [decisionType, setDecisionType] = useState('QUOTE');
  const [offeredCapacity, setOfferedCapacity] = useState('');
  const [quotedRate, setQuotedRate] = useState('');
  const [quotedPremium, setQuotedPremium] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [exclusions, setExclusions] = useState('');
  
  const [declineReasonCode, setDeclineReasonCode] = useState('');
  const [declineNotes, setDeclineNotes] = useState('');
  
  const [declineReasons, setDeclineReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      // Prepopulate capacity with requested ceded_limit if available
      if (submission?.ceded_limit) {
        setOfferedCapacity(submission.ceded_limit);
      }
      loadDeclineReasons();
    }
  }, [isOpen, submission]);

  const loadDeclineReasons = async () => {
    try {
      setLoadingReasons(true);
      const data = await api.getDeclineReasons();
      setDeclineReasons(Array.isArray(data) ? data : data?.reasons || []);
    } catch (err) {
      // Fallback standard decline reasons if API is empty
      setDeclineReasons([
        { code: 'CAPACITY_EXCEEDED', label: 'Aggregate Capacity Limit Exceeded' },
        { code: 'HIGH_RISK_SCORE', label: 'Unacceptable Risk Score Threshold' },
        { code: 'INADEQUATE_CONTROLS', label: 'Inadequate Security / Governance Controls' },
        { code: 'UNFAVORABLE_LOSS_HISTORY', label: 'Adverse Historical Loss Experience' },
        { code: 'PRICING_INADEQUACY', label: 'Target Premium Inadequate for Attachment Point' },
        { code: 'HIGH_EXPOSURE_AGGREGATION', label: 'High Exposure Aggregation' },
      ]);
    } finally {
      setLoadingReasons(false);
    }
  };

  if (!isOpen || !submission) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (decisionType === 'DECLINE' && !declineReasonCode) {
      setError('Please select a mandatory Decline Reason Code before submitting.');
      return;
    }

    if (decisionType === 'QUOTE') {
      if (!offeredCapacity || Number(offeredCapacity) <= 0) {
        setError('Please enter a valid Offered Capacity greater than 0.');
        return;
      }
      if (!quotedRate || Number(quotedRate) <= 0) {
        setError('Please enter a valid Quoted Rate greater than 0.');
        return;
      }
    }

    const payload = {
      decision_type: decisionType,
      offered_capacity: decisionType === 'QUOTE' ? Number(offeredCapacity) : undefined,
      quoted_rate: decisionType === 'QUOTE' ? Number(quotedRate) : undefined,
      quoted_premium: decisionType === 'QUOTE' && quotedPremium ? Number(quotedPremium) : undefined,
      terms_conditions: decisionType === 'QUOTE' ? termsConditions : undefined,
      exclusions: decisionType === 'QUOTE' && exclusions 
        ? exclusions.split(',').map(s => s.trim()).filter(Boolean) 
        : [],
      decline_reason_code: decisionType === 'DECLINE' ? declineReasonCode : undefined,
      decline_notes: decisionType === 'DECLINE' ? declineNotes : undefined,
    };

    try {
      setSubmitting(true);
      const result = await api.createDecision(submission.id, payload);
      if (onDecisionSuccess) {
        onDecisionSuccess(result);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to record decision.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Underwriting Decision Terminal
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Placement: <span className="text-blue-300 font-semibold">{submission.insured_name}</span> ({submission.risk_type} Risk)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-sm">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Decision Type Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Decision Action
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecisionType('QUOTE')}
                className={`py-3 px-4 rounded-lg border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  decisionType === 'QUOTE'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Issue Reinsurance Quote
              </button>

              <button
                type="button"
                onClick={() => setDecisionType('DECLINE')}
                className={`py-3 px-4 rounded-lg border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  decisionType === 'DECLINE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/20'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Ban className="h-4 w-4" />
                Decline Facultative Risk
              </button>
            </div>
          </div>

          {/* QUOTE FIELDS */}
          {decisionType === 'QUOTE' && (
            <div className="space-y-4 bg-emerald-50/40 p-4 rounded-lg border border-emerald-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="offered_capacity" className="block text-xs font-semibold text-slate-700 mb-1">
                    Offered Capacity ($) *
                  </label>
                  <input
                    id="offered_capacity"
                    type="number"
                    min="1"
                    value={offeredCapacity}
                    onChange={(e) => setOfferedCapacity(e.target.value)}
                    placeholder="e.g. 5000000"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="quoted_rate" className="block text-xs font-semibold text-slate-700 mb-1">
                    Quoted Rate-on-Line (%) *
                  </label>
                  <input
                    id="quoted_rate"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quotedRate}
                    onChange={(e) => setQuotedRate(e.target.value)}
                    placeholder="e.g. 3.25"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="quoted_premium" className="block text-xs font-semibold text-slate-700 mb-1">
                    Quoted Premium ($)
                  </label>
                  <input
                    id="quoted_premium"
                    type="number"
                    min="0"
                    value={quotedPremium}
                    onChange={(e) => setQuotedPremium(e.target.value)}
                    placeholder="e.g. 162500"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="terms_conditions" className="block text-xs font-semibold text-slate-700 mb-1">
                  Terms & Conditions / Subjectivities
                </label>
                <textarea
                  id="terms_conditions"
                  rows={2}
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  placeholder="e.g. Subject to favorable third-party network vulnerability audit within 30 days."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="exclusions" className="block text-xs font-semibold text-slate-700 mb-1">
                  Exclusions (comma-separated)
                </label>
                <input
                  id="exclusions"
                  type="text"
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  placeholder="e.g. Nation-state cyber warfare, Unencrypted mobile devices"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* DECLINE FIELDS */}
          {decisionType === 'DECLINE' && (
            <div className="space-y-4 bg-rose-50/40 p-4 rounded-lg border border-rose-200">
              <div>
                <label htmlFor="decline_reason_code" className="block text-xs font-bold text-rose-900 uppercase tracking-wide mb-1">
                  Mandatory Decline Reason Code *
                </label>
                {loadingReasons ? (
                  <div className="text-xs text-slate-500 flex items-center gap-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                    Loading decline catalogue...
                  </div>
                ) : (
                  <select
                    id="decline_reason_code"
                    value={declineReasonCode}
                    onChange={(e) => setDeclineReasonCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="">-- Select a valid decline reason code --</option>
                    {declineReasons.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} — {r.label || r.description}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  A formal decline reason is mandatory for reinsurance compliance and audit reporting.
                </p>
              </div>

              <div>
                <label htmlFor="decline_notes" className="block text-xs font-semibold text-slate-700 mb-1">
                  Underwriter Notes / Rationale
                </label>
                <textarea
                  id="decline_notes"
                  rows={3}
                  value={declineNotes}
                  onChange={(e) => setDeclineNotes(e.target.value)}
                  placeholder="Additional context regarding why this facultative risk cannot be bound at this time..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 rounded-lg text-white text-sm font-bold shadow-md flex items-center gap-2 ${
                decisionType === 'QUOTE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {decisionType === 'QUOTE' ? 'Submit Quote Terms' : 'Confirm & Decline Risk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
