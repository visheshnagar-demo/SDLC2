import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Send, FileCheck, ShieldAlert } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { api } from '../../services/api';

const DECLINE_REASONS = [
  { code: 'HIGH_LOSS_FREQUENCY', label: 'High Loss Frequency / Adverse Loss Record' },
  { code: 'INSUFFICIENT_RETENTION', label: 'Insufficient Attachment Point / Retention' },
  { code: 'INADEQUATE_SECURITY_POSTURE', label: 'Inadequate Cyber Security Controls / Governance' },
  { code: 'UNFAVORABLE_INDUSTRY_EXPOSURE', label: 'Unfavorable Industry Sector Exposure' },
  { code: 'CAPACITY_LIMIT_EXCEEDED', label: 'Underwriting Capacity or Aggregation Limit Reached' },
  { code: 'MISSING_MANDATORY_DISCLOSURES', label: 'Missing Mandatory Risk Disclosures / Attachments' },
  { code: 'SANCTIONS_COMPLIANCE_RESTRICTION', label: 'Regulatory / Sanctions Compliance Restriction' },
];

export const DecisionConsoleForm = ({
  submissionId,
  sumInsured = 10000000,
  currentStatus,
  onDecisionRecorded,
}) => {
  const [decisionType, setDecisionType] = useState('QUOTE');
  const [formData, setFormData] = useState({
    capacity_offered: sumInsured,
    rate_on_line_pct: 2.5,
    premium_amount: Math.round(sumInsured * 0.025),
    binding_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subjectivities: 'Subject to clean loss warranty and satisfactory cyber risk audit.',
    decline_reason_code: 'HIGH_LOSS_FREQUENCY',
    decline_notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: parsedValue };
      // Auto-compute premium when capacity or rate on line changes
      if (name === 'capacity_offered' || name === 'rate_on_line_pct') {
        const cap = name === 'capacity_offered' ? Number(parsedValue) || 0 : Number(prev.capacity_offered) || 0;
        const rol = name === 'rate_on_line_pct' ? Number(parsedValue) || 0 : Number(prev.rate_on_line_pct) || 0;
        updated.premium_amount = Math.round(cap * (rol / 100));
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (decisionType === 'QUOTE') {
      if (!formData.capacity_offered || Number(formData.capacity_offered) <= 0) {
        newErrors.capacity_offered = 'Capacity Offered must be greater than 0';
      }
      if (!formData.rate_on_line_pct || Number(formData.rate_on_line_pct) <= 0) {
        newErrors.rate_on_line_pct = 'Rate on line must be greater than 0%';
      }
      if (!formData.binding_deadline) {
        newErrors.binding_deadline = 'Binding deadline is required';
      }
    } else {
      if (!formData.decline_reason_code) {
        newErrors.decline_reason_code = 'Decline reason code is mandatory';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        decision: decisionType,
        ...(decisionType === 'QUOTE'
          ? {
              capacity_offered: Number(formData.capacity_offered),
              rate_on_line_pct: Number(formData.rate_on_line_pct),
              premium_amount: Number(formData.premium_amount),
              binding_deadline: formData.binding_deadline,
              subjectivities: formData.subjectivities,
            }
          : {
              decline_reason_code: formData.decline_reason_code,
              decline_notes: formData.decline_notes || '',
            }),
      };

      const res = await api.recordDecision(submissionId, payload);
      setSuccessMsg(`Decision (${decisionType}) recorded successfully!`);

      if (onDecisionRecorded) {
        onDecisionRecorded(res);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Failed to record underwriting decision.';
      setErrorMsg(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadyFinalized = ['QUOTED', 'DECLINED'].includes(currentStatus);

  return (
    <Card
      title="Underwriting Decision Console"
      subtitle="Issue binding facultative quote or record structured decline notice"
      className="border-blue-200"
    >
      {errorMsg && (
        <div className="p-4 mb-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to persist decision</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-semibold">Decision Persisted</p>
            <p className="mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Decision Mode Toggle */}
      <div className="flex rounded-lg border border-slate-200 p-1 mb-6 bg-slate-50">
        <button
          type="button"
          onClick={() => setDecisionType('QUOTE')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
            decisionType === 'QUOTE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Issue Binding Quote</span>
        </button>

        <button
          type="button"
          onClick={() => setDecisionType('DECLINE')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
            decisionType === 'DECLINE'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Decline Submission</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {decisionType === 'QUOTE' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Capacity Offered (USD) *
                </label>
                <input
                  type="number"
                  name="capacity_offered"
                  value={formData.capacity_offered}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    errors.capacity_offered
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.capacity_offered && <p className="text-xs text-rose-600 mt-1">{errors.capacity_offered}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Rate on Line (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="rate_on_line_pct"
                  value={formData.rate_on_line_pct}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    errors.rate_on_line_pct
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.rate_on_line_pct && <p className="text-xs text-rose-600 mt-1">{errors.rate_on_line_pct}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Calculated Premium (USD)
                </label>
                <input
                  type="number"
                  name="premium_amount"
                  value={formData.premium_amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Binding Deadline *
                </label>
                <input
                  type="date"
                  name="binding_deadline"
                  value={formData.binding_deadline}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    errors.binding_deadline
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.binding_deadline && <p className="text-xs text-rose-600 mt-1">{errors.binding_deadline}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Subjectivities & Special Terms
              </label>
              <textarea
                name="subjectivities"
                rows="3"
                value={formData.subjectivities}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="e.g. Subject to clean loss warranty and satisfactory cyber risk audit..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mandatory Decline Reason Code *
              </label>
              <select
                name="decline_reason_code"
                value={formData.decline_reason_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 bg-white"
              >
                {DECLINE_REASONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
              {errors.decline_reason_code && (
                <p className="text-xs text-rose-600 mt-1">{errors.decline_reason_code}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Decline Notes & Risk Rationale
              </label>
              <textarea
                name="decline_notes"
                rows="3"
                value={formData.decline_notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500"
                placeholder="Detail specific risk thresholds or adverse loss findings resulting in decline..."
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            All decisions are immutably logged with underwriter credentials.
          </p>
          <Button
            type="submit"
            variant={decisionType === 'QUOTE' ? 'success' : 'danger'}
            disabled={isSubmitting}
            icon={decisionType === 'QUOTE' ? FileCheck : XCircle}
          >
            {isSubmitting
              ? 'Recording Decision...'
              : decisionType === 'QUOTE'
              ? 'Authorize & Issue Quote'
              : 'Confirm & Record Decline'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DecisionConsoleForm;
