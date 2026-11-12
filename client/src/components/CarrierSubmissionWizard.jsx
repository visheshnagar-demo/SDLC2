import React, { useState } from 'react';
import { Shield, Briefcase, Calendar, DollarSign, Building, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import CyberRiskDisclosures from './CyberRiskDisclosures';
import DoRiskDisclosures from './DoRiskDisclosures';
import { api } from '../services/api';

export default function CarrierSubmissionWizard({ onSubmissionSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    carrier_name: 'Apex Insurance Mutual',
    insured_name: '',
    risk_type: 'CYBER', // 'CYBER' or 'DO'
    primary_limit: 5000000,
    attachment_point: 10000000,
    ceded_limit: 2500000,
    carrier_premium: 150000,
    policy_start_date: '2026-06-01',
    policy_end_date: '2027-06-01',
    cyber_profile: {
      mfa_enabled: true,
      edr_deployed: true,
      backups_offline: true,
      records_count: 500000,
      prior_breach_count: 0,
    },
    do_profile: {
      debt_to_equity_ratio: 1.5,
      executive_turnover_rate: 10.0,
      pending_litigation_count: 0,
      independent_board_charter: true,
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCyberProfileChange = (profileData) => {
    setFormData((prev) => ({
      ...prev,
      cyber_profile: profileData,
    }));
  };

  const handleDoProfileChange = (profileData) => {
    setFormData((prev) => ({
      ...prev,
      do_profile: profileData,
    }));
  };

  const validateStep1 = () => {
    setError(null);
    if (!formData.carrier_name.trim()) {
      setError('Carrier Name is required.');
      return false;
    }
    if (!formData.insured_name.trim()) {
      setError('Insured Enterprise Name is required.');
      return false;
    }
    if (Number(formData.primary_limit) <= 0) {
      setError('Primary Policy Limit must be greater than $0.');
      return false;
    }
    if (Number(formData.attachment_point) < 0) {
      setError('Attachment Point cannot be negative.');
      return false;
    }
    if (Number(formData.ceded_limit) <= 0) {
      setError('Requested Ceded Facultative Limit must be greater than $0.');
      return false;
    }
    if (Number(formData.carrier_premium) <= 0) {
      setError('Underlying Policy Premium must be greater than $0.');
      return false;
    }
    if (!formData.policy_start_date || !formData.policy_end_date) {
      setError('Policy Start and End dates are required.');
      return false;
    }
    if (new Date(formData.policy_end_date) <= new Date(formData.policy_start_date)) {
      setError('Policy Expiration Date must be strictly after the Start Date.');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    setError(null);
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setError(null);

    const payload = {
      carrier_name: formData.carrier_name.trim(),
      insured_name: formData.insured_name.trim(),
      risk_type: formData.risk_type,
      primary_limit: Number(formData.primary_limit),
      attachment_point: Number(formData.attachment_point),
      ceded_limit: Number(formData.ceded_limit),
      carrier_premium: Number(formData.carrier_premium),
      policy_start_date: formData.policy_start_date,
      policy_end_date: formData.policy_end_date,
      cyber_profile: formData.risk_type === 'CYBER' ? formData.cyber_profile : undefined,
      do_profile: formData.risk_type === 'DO' ? formData.do_profile : undefined,
    };

    try {
      setSubmitting(true);
      const result = await api.createSubmission(payload);
      setSuccessResult(result);
      if (onSubmissionSuccess) {
        onSubmissionSuccess(result);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Submission failed. Please check form parameters.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessResult(null);
    setCurrentStep(1);
    setError(null);
    setFormData((prev) => ({
      ...prev,
      insured_name: '',
      primary_limit: 5000000,
      attachment_point: 10000000,
      ceded_limit: 2500000,
      carrier_premium: 150000,
    }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Wizard Header Bar */}
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Facultative Reinsurance Placement Intake</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Submit Cyber or D&O facultative risk requests with automated underwriting ingestion & scoring
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
          <span className="text-slate-500 text-xs">→</span>
          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
          <span className="text-slate-500 text-xs">→</span>
          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Validation Error:</span> {error}
          </div>
        </div>
      )}

      {/* Success View */}
      {successResult ? (
        <div className="p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-100 rounded-full text-emerald-600 mx-auto">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">Facultative Placement Submitted Successfully</h3>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Your reinsurance request has been ingested into the automated review queue and scored.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-lg p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Submission ID:</span>
              <span className="font-mono font-bold text-slate-900">{successResult.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Insured:</span>
              <span className="font-semibold text-slate-900">{successResult.insured_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Risk Type:</span>
              <span className="font-bold text-blue-600">{successResult.risk_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Initial Calculated Risk Score:</span>
              <span className="font-bold text-slate-900">{successResult.risk_score ?? successResult.risk_score_value ?? 'Calculated (Pending Review)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Workflow Status:</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{successResult.status || 'PENDING_REVIEW'}</span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={resetForm}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm"
            >
              Submit Another Placement Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* STEP 1: Policy Parameters */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 1: Carrier & Placement Financial Terms</h3>
                <p className="text-xs text-slate-500">Enter primary policy limits, attachment points, and policy dates.</p>
              </div>

              {/* Risk Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Risk Class *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('risk_type', 'CYBER')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      formData.risk_type === 'CYBER'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Shield className={`h-6 w-6 mt-0.5 ${formData.risk_type === 'CYBER' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-sm text-slate-900">Cyber Liability & Extortion</div>
                      <div className="text-xs text-slate-500 mt-0.5">Ransomware, data breaches, business interruption, and network security risks.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('risk_type', 'DO')}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      formData.risk_type === 'DO'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Briefcase className={`h-6 w-6 mt-0.5 ${formData.risk_type === 'DO' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-sm text-slate-900">Directors & Officers (D&O)</div>
                      <div className="text-xs text-slate-500 mt-0.5">Management liability, shareholder litigation, and regulatory enforcement.</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="carrier_name" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-slate-400" />
                    Ceding Carrier Name *
                  </label>
                  <input
                    id="carrier_name"
                    type="text"
                    value={formData.carrier_name}
                    onChange={(e) => handleInputChange('carrier_name', e.target.value)}
                    placeholder="e.g. Apex Insurance Mutual"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="insured_name" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-slate-400" />
                    Insured Enterprise Name *
                  </label>
                  <input
                    id="insured_name"
                    type="text"
                    value={formData.insured_name}
                    onChange={(e) => handleInputChange('insured_name', e.target.value)}
                    placeholder="e.g. Acme Health Technologies"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Financial Limits */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="primary_limit" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    Primary Policy Limit ($) *
                  </label>
                  <input
                    id="primary_limit"
                    type="number"
                    min="1"
                    value={formData.primary_limit}
                    onChange={(e) => handleInputChange('primary_limit', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="attachment_point" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    Attachment Point ($) *
                  </label>
                  <input
                    id="attachment_point"
                    type="number"
                    min="0"
                    value={formData.attachment_point}
                    onChange={(e) => handleInputChange('attachment_point', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="ceded_limit" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    Ceded Fac Limit ($) *
                  </label>
                  <input
                    id="ceded_limit"
                    type="number"
                    min="1"
                    value={formData.ceded_limit}
                    onChange={(e) => handleInputChange('ceded_limit', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="carrier_premium" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    Policy Premium ($) *
                  </label>
                  <input
                    id="carrier_premium"
                    type="number"
                    min="1"
                    value={formData.carrier_premium}
                    onChange={(e) => handleInputChange('carrier_premium', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Policy Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="policy_start_date" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Policy Effective Date *
                  </label>
                  <input
                    id="policy_start_date"
                    type="date"
                    value={formData.policy_start_date}
                    onChange={(e) => handleInputChange('policy_start_date', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="policy_end_date" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Policy Expiration Date *
                  </label>
                  <input
                    id="policy_end_date"
                    type="date"
                    value={formData.policy_end_date}
                    onChange={(e) => handleInputChange('policy_end_date', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Risk Disclosures */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Step 2: {formData.risk_type === 'CYBER' ? 'Cyber Security Controls' : 'D&O Corporate Governance'}
                </h3>
                <p className="text-xs text-slate-500">Provide risk profile details for underwriting scoring and checklist validation.</p>
              </div>

              {formData.risk_type === 'CYBER' ? (
                <CyberRiskDisclosures
                  data={formData.cyber_profile}
                  onChange={handleCyberProfileChange}
                />
              ) : (
                <DoRiskDisclosures
                  data={formData.do_profile}
                  onChange={handleDoProfileChange}
                />
              )}
            </div>
          )}

          {/* STEP 3: Review & Summary */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 3: Review & Submit Facultative Request</h3>
                <p className="text-xs text-slate-500">Confirm parameters prior to automated underwriting queue ingestion.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Placement Summary</h4>
                  <div className="text-sm">
                    <span className="text-slate-500">Insured Enterprise:</span>{' '}
                    <span className="font-bold text-slate-900">{formData.insured_name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Ceding Carrier:</span>{' '}
                    <span className="font-semibold text-slate-800">{formData.carrier_name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Risk Class:</span>{' '}
                    <span className="font-bold text-blue-600">{formData.risk_type}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Policy Period:</span>{' '}
                    <span className="font-mono text-slate-800">{formData.policy_start_date} to {formData.policy_end_date}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial Structure</h4>
                  <div className="text-sm">
                    <span className="text-slate-500">Primary Limit:</span>{' '}
                    <span className="font-semibold text-slate-900">${Number(formData.primary_limit).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Attachment Point:</span>{' '}
                    <span className="font-semibold text-slate-900">${Number(formData.attachment_point).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Requested Fac Limit:</span>{' '}
                    <span className="font-bold text-emerald-700">${Number(formData.ceded_limit).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Underlying Premium:</span>{' '}
                    <span className="font-semibold text-slate-900">${Number(formData.carrier_premium).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous Step
              </button>
            ) : <div />}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-sm"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-md"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Ingest & Score Placement
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
