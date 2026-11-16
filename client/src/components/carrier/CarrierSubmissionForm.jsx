import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  ShieldAlert,
  Building2,
  DollarSign,
  Calendar,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
} from 'lucide-react';

export const CarrierSubmissionForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    risk_type: 'CYBER',
    insured_name: '',
    industry_segment: 'Technology',
    annual_revenue: '',
    sum_insured: '',
    attachment_point: '',
    policy_start_date: new Date().toISOString().split('T')[0],
    policy_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    prior_claims_count: '0',
    prior_claims_total: '0',
    security_governance_score: '85',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('POLICY_SLIP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const validate = () => {
    const errors = {};
    if (!formData.insured_name.trim()) errors.insured_name = 'Insured Name is required';
    if (!formData.industry_segment) errors.industry_segment = 'Industry Segment is required';
    if (!formData.annual_revenue || Number(formData.annual_revenue) <= 0)
      errors.annual_revenue = 'Annual Revenue must be greater than 0';
    if (!formData.sum_insured || Number(formData.sum_insured) <= 0)
      errors.sum_insured = 'Sum Insured must be greater than 0';
    if (!formData.attachment_point || Number(formData.attachment_point) < 0)
      errors.attachment_point = 'Attachment Point is required';
    if (!formData.policy_start_date) errors.policy_start_date = 'Policy Start Date is required';
    if (!formData.policy_end_date) errors.policy_end_date = 'Policy End Date is required';
    if (
      formData.security_governance_score === '' ||
      Number(formData.security_governance_score) < 0 ||
      Number(formData.security_governance_score) > 100
    ) {
      errors.security_governance_score = 'Score must be between 0 and 100';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e, isDraft = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);

    if (!isDraft && !validate()) {
      setError('Please resolve all validation errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        risk_type: formData.risk_type,
        insured_name: formData.insured_name.trim(),
        industry_segment: formData.industry_segment,
        annual_revenue: Number(formData.annual_revenue) || 0,
        sum_insured: Number(formData.sum_insured) || 0,
        attachment_point: Number(formData.attachment_point) || 0,
        policy_start_date: formData.policy_start_date,
        policy_end_date: formData.policy_end_date,
        prior_claims_count: parseInt(formData.prior_claims_count, 10) || 0,
        prior_claims_total: Number(formData.prior_claims_total) || 0,
        security_governance_score: Number(formData.security_governance_score) || 0,
        status: isDraft ? 'DRAFT' : 'SUBMITTED',
      };

      const response = await api.createSubmission(payload);

      // If a file was attached, upload it
      if (selectedFile && response.id) {
        try {
          const filePayload = new FormData();
          filePayload.append('file', selectedFile);
          filePayload.append('doc_type', documentType);
          await api.uploadAttachment(response.id, filePayload);
        } catch {
          // Non-blocking attachment upload warning
        }
      }

      setSubmissionSuccess(response);
    } catch (err) {
      const errorDetail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to submit reinsurance request.';
      setError(typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : String(errorDetail));
    } finally {
      setLoading(false);
    }
  };

  if (submissionSuccess) {
    return (
      <Card className="max-w-2xl mx-auto my-8 border-emerald-200">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Facultative Reinsurance Request Submitted!
          </h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
            Your request has been ingested into the automated risk scoring engine and placed in the underwriter review queue.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 max-w-lg mx-auto mb-6 text-left border border-gray-200">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-200 text-sm">
              <span className="text-gray-500 font-medium">Submission Reference:</span>
              <span className="font-mono font-bold text-gray-900">
                {submissionSuccess.submission_reference || submissionSuccess.id}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-200 text-sm">
              <span className="text-gray-500 font-medium">Insured Name:</span>
              <span className="font-semibold text-gray-900">{formData.insured_name}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-200 text-sm">
              <span className="text-gray-500 font-medium">Risk Class:</span>
              <Badge variant={formData.risk_type.toLowerCase()}>{formData.risk_type}</Badge>
            </div>
            <div className="flex justify-between items-center py-1.5 text-sm">
              <span className="text-gray-500 font-medium">Initial Risk Tier:</span>
              <Badge variant={submissionSuccess.risk_tier || 'medium'}>
                {submissionSuccess.risk_tier || 'PROCESSED'}
              </Badge>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSubmissionSuccess(null);
                setFormData({
                  risk_type: 'CYBER',
                  insured_name: '',
                  industry_segment: 'Technology',
                  annual_revenue: '',
                  sum_insured: '',
                  attachment_point: '',
                  policy_start_date: new Date().toISOString().split('T')[0],
                  policy_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                  prior_claims_count: '0',
                  prior_claims_total: '0',
                  security_governance_score: '85',
                });
                setSelectedFile(null);
              }}
            >
              Submit Another Request
            </Button>
            <Button variant="primary" onClick={() => navigate('/carrier/dashboard')}>
              Go to Carrier Dashboard
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Submit Facultative Reinsurance Request
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Provide risk specifications for Cyber or Directors & Officers (D&O) facultative placement.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Submission Incomplete or Rejected</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Step 1: Risk Type Selection */}
        <Card title="1. Risk Classification & Product Line">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3.5 ${
                formData.risk_type === 'CYBER'
                  ? 'border-primary bg-primary-light/40 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="risk_type"
                value="CYBER"
                checked={formData.risk_type === 'CYBER'}
                onChange={handleChange}
                className="mt-1 text-primary focus:ring-primary"
              />
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  <span className="font-bold text-gray-900 text-sm">Cyber Risk Placement</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Facultative coverage for ransomware, data breach liabilities, system interruption, and security governance risks.
                </p>
              </div>
            </label>

            <label
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3.5 ${
                formData.risk_type === 'D_AND_O'
                  ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="risk_type"
                value="D_AND_O"
                checked={formData.risk_type === 'D_AND_O'}
                onChange={handleChange}
                className="mt-1 text-purple-600 focus:ring-purple-600"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-900 text-sm">Directors & Officers (D&O)</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Management liability, regulatory exposures, shareholder litigation, and corporate governance protection.
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Step 2: Insured & Financials */}
        <Card title="2. Insured Profile & Financial Parameters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Insured Legal Entity Name *
              </label>
              <input
                type="text"
                name="insured_name"
                value={formData.insured_name}
                onChange={handleChange}
                placeholder="e.g. Acme Technologies Corp."
                className={`w-full text-sm px-3.5 py-2 rounded-lg border ${
                  validationErrors.insured_name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {validationErrors.insured_name && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.insured_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Industry Segment *
              </label>
              <select
                name="industry_segment"
                value={formData.industry_segment}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="Technology">Technology & Software</option>
                <option value="Financial Services">Financial Services & Banking</option>
                <option value="Healthcare">Healthcare & Life Sciences</option>
                <option value="Manufacturing">Manufacturing & Industrial</option>
                <option value="Retail">Retail & E-Commerce</option>
                <option value="Energy">Energy & Utilities</option>
                <option value="Telecommunications">Telecommunications</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Annual Revenue (USD) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  name="annual_revenue"
                  value={formData.annual_revenue}
                  onChange={handleChange}
                  placeholder="e.g. 50000000"
                  className={`w-full text-sm pl-7 pr-3.5 py-2 rounded-lg border ${
                    validationErrors.annual_revenue ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                />
              </div>
              {validationErrors.annual_revenue && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.annual_revenue}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Security & Governance Score (0-100) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                name="security_governance_score"
                value={formData.security_governance_score}
                onChange={handleChange}
                placeholder="e.g. 85"
                className={`w-full text-sm px-3.5 py-2 rounded-lg border ${
                  validationErrors.security_governance_score ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                {formData.risk_type === 'CYBER'
                  ? 'Based on MFA, endpoint security & backup audits'
                  : 'Based on board independence & compliance audits'}
              </span>
            </div>
          </div>
        </Card>

        {/* Step 3: Reinsurance Structure & Policy Period */}
        <Card title="3. Reinsurance Structure & Loss History">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Sum Insured / Limit Requested (USD) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  name="sum_insured"
                  value={formData.sum_insured}
                  onChange={handleChange}
                  placeholder="e.g. 10000000"
                  className={`w-full text-sm pl-7 pr-3.5 py-2 rounded-lg border ${
                    validationErrors.sum_insured ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                />
              </div>
              {validationErrors.sum_insured && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.sum_insured}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Attachment Point / Excess (USD) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  name="attachment_point"
                  value={formData.attachment_point}
                  onChange={handleChange}
                  placeholder="e.g. 1000000"
                  className={`w-full text-sm pl-7 pr-3.5 py-2 rounded-lg border ${
                    validationErrors.attachment_point ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary`}
                />
              </div>
              {validationErrors.attachment_point && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.attachment_point}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Policy Inception Date *
              </label>
              <input
                type="date"
                name="policy_start_date"
                value={formData.policy_start_date}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Policy Expiration Date *
              </label>
              <input
                type="date"
                name="policy_end_date"
                value={formData.policy_end_date}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Prior Claims Count (Last 3 Years)
              </label>
              <input
                type="number"
                min="0"
                name="prior_claims_count"
                value={formData.prior_claims_count}
                onChange={handleChange}
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Prior Claims Incurred Total (USD)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  name="prior_claims_total"
                  value={formData.prior_claims_total}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full text-sm pl-7 pr-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Step 4: Supporting Document Attachment */}
        <Card title="4. Supporting Documentation & Disclosures">
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Attach underwriting slips, audited financial statements, or loss run reports.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="POLICY_SLIP">Facultative Placement Slip</option>
                  <option value="LOSS_RUNS">5-Year Loss Run Summary</option>
                  <option value="FINANCIAL_STATEMENTS">Audited Financial Statements</option>
                  <option value="SECURITY_AUDIT">Cybersecurity / Governance Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            Save as Draft
          </Button>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/carrier/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              icon={CheckCircle2}
            >
              {loading ? 'Submitting & Scoring...' : 'Submit Facultative Request'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CarrierSubmissionForm;
