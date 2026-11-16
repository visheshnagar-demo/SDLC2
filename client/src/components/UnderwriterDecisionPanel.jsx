import React, { useState } from 'react';
import { CheckCircle2, XCircle, DollarSign, Percent, ShieldAlert, FileCheck2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function UnderwriterDecisionPanel({ submissionId, currentDecision, onDecisionRecorded }) {
  const [decisionType, setDecisionType] = useState('QUOTE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [quoteForm, setQuoteForm] = useState({
    quoted_capacity: 5000000,
    premium_rate_pct: 2.75,
    quoted_premium: 137500,
    quote_validity_days: 30,
    underwriter_notes: 'Terms approved based on clean loss history and verified air-gapped backup protocol.',
  });

  const [declineForm, setDeclineForm] = useState({
    decline_reason_code: 'HIGH_EXPOSURE_AGGREGATION',
    underwriter_notes: 'Exceeds facultative capacity limit for industry sector exposure.',
  });

  const handleCapacityChange = (val) => {
    const capacity = Number(val) || 0;
    const premium = (capacity * (Number(quoteForm.premium_rate_pct) || 0)) / 100;
    setQuoteForm((p) => ({
      ...p,
      quoted_capacity: capacity,
      quoted_premium: Math.round(premium),
    }));
  };

  const handleRateChange = (val) => {
    const rate = Number(val) || 0;
    const premium = ((Number(quoteForm.quoted_capacity) || 0) * rate) / 100;
    setQuoteForm((p) => ({
      ...p,
      premium_rate_pct: rate,
      quoted_premium: Math.round(premium),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = decisionType === 'QUOTE' ? {
        decision_type: 'QUOTE',
        quoted_capacity: Number(quoteForm.quoted_capacity),
        premium_rate_pct: Number(quoteForm.premium_rate_pct),
        quoted_premium: Number(quoteForm.quoted_premium),
        quote_validity_days: Number(quoteForm.quote_validity_days),
        underwriter_notes: quoteForm.underwriter_notes,
      } : {
        decision_type: 'DECLINE',
        decline_reason_code: declineForm.decline_reason_code,
        underwriter_notes: declineForm.underwriter_notes,
      };

      const result = await api.recordDecision(submissionId, payload);
      if (onDecisionRecorded) onDecisionRecorded(result);
    } catch (err) {
      console.error('Failed to record decision:', err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : err.message || 'Failed to record decision.');
    } finally {
      setLoading(false);
    }
  };

  if (currentDecision) {
    const isQuote = currentDecision.decision_type?.toUpperCase() === 'QUOTE';
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" /> Formal Underwriting Decision Recorded
          </h3>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            isQuote ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {isQuote ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {currentDecision.decision_type}
          </span>
        </div>

        {isQuote ? (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
              <span className="text-slate-500 block">Quoted Capacity</span>
              <span className="text-base font-bold text-emerald-900">
                ${Number(currentDecision.quoted_capacity || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
              <span className="text-slate-500 block">Rate on Line</span>
              <span className="text-base font-bold text-emerald-900">
                {currentDecision.premium_rate_pct}%
              </span>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
              <span className="text-slate-500 block">Annual Premium</span>
              <span className="text-base font-bold text-emerald-900">
                ${Number(currentDecision.quoted_premium || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
              <span className="text-slate-500 block">Quote Validity</span>
              <span className="text-base font-bold text-emerald-900">
                {currentDecision.quote_validity_days || 30} Days
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50/50 rounded-lg border border-red-100 text-xs space-y-1.5">
            <span className="font-semibold text-red-900 block">Decline Reason Code:</span>
            <span className="text-slate-700 font-mono bg-white px-2 py-0.5 rounded border border-red-200 inline-block">
              {currentDecision.decline_reason_code}
            </span>
          </div>
        )}

        {currentDecision.underwriter_notes && (
          <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-0.5">Underwriter Rationale:</span>
            {currentDecision.underwriter_notes}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-blue-600" /> Record Underwriting Decision
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Execute formal binding Quote placement terms or issue structured Decline notification.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Decision Type Switcher */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-lg">
        <button
          type="button"
          onClick={() => setDecisionType('QUOTE')}
          className={`py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            decisionType === 'QUOTE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> ISSUE FORMAL QUOTE
        </button>

        <button
          type="button"
          onClick={() => setDecisionType('DECLINE')}
          className={`py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            decisionType === 'DECLINE'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <XCircle className="w-4 h-4" /> DECLINE REQUEST
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {decisionType === 'QUOTE' ? (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quoted Capacity ($)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  required
                  min="1000"
                  value={quoteForm.quoted_capacity}
                  onChange={(e) => handleCapacityChange(e.target.value)}
                  className="w-full pl-6 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rate on Line (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    value={quoteForm.premium_rate_pct}
                    onChange={(e) => handleRateChange(e.target.value)}
                    className="w-full pr-6 pl-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quoted Premium ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quoteForm.quoted_premium}
                    onChange={(e) => setQuoteForm((p) => ({ ...p, quoted_premium: Number(e.target.value) }))}
                    className="w-full pl-6 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quote Validity Window (Days)</label>
              <input
                type="number"
                required
                min="1"
                max="90"
                value={quoteForm.quote_validity_days}
                onChange={(e) => setQuoteForm((p) => ({ ...p, quote_validity_days: Number(e.target.value) }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriter Rationale / Endorsements</label>
              <textarea
                rows={2}
                value={quoteForm.underwriter_notes}
                onChange={(e) => setQuoteForm((p) => ({ ...p, underwriter_notes: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="Subjectivities, warranties, or endorsements..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Decline Reason Code</label>
              <select
                value={declineForm.decline_reason_code}
                onChange={(e) => setDeclineForm((p) => ({ ...p, decline_reason_code: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="HIGH_EXPOSURE_AGGREGATION">HIGH_EXPOSURE_AGGREGATION - Exceeds Sector Limit Capacity</option>
                <option value="UNRESOLVED_CLAIMS_HISTORY">UNRESOLVED_CLAIMS_HISTORY - Excessive 5-Year Loss Frequency</option>
                <option value="INADEQUATE_SECURITY_CONTROLS">INADEQUATE_SECURITY_CONTROLS - MFA/Airgap Deficiencies</option>
                <option value="UNRESOLVED_MISSING_DISCLOSURES">UNRESOLVED_MISSING_DISCLOSURES - Incomplete Critical Documentation</option>
                <option value="REGULATORY_INVESTIGATION_EXPOSURE">REGULATORY_INVESTIGATION_EXPOSURE - Pending SEC/DOJ Inquiries</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Decline Commentary</label>
              <textarea
                rows={3}
                required
                value={declineForm.underwriter_notes}
                onChange={(e) => setDeclineForm((p) => ({ ...p, underwriter_notes: e.target.value }))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="Explain the technical basis for declining..."
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-bold text-xs transition-colors shadow-sm ${
            decisionType === 'QUOTE'
              ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
              : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
          }`}
        >
          {loading ? 'Recording Decision...' : decisionType === 'QUOTE' ? 'CONFIRM & BIND QUOTE' : 'CONFIRM DECLINE'}
        </button>
      </form>
    </div>
  );
}
