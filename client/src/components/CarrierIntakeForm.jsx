import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, CheckCircle2, AlertCircle, Upload, ArrowRight, Building2, Calendar, DollarSign } from 'lucide-react';
import api from '../services/api';

export default function CarrierIntakeForm({ onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    risk_type: 'CYBER',
    insured_name: 'Apex Global Financial Corp',
    industry_sector: 'Financial Services',
    annual_revenue: 250000000,
    primary_policy_limit: 10000000,
    requested_reinsurance_limit: 5000000,
    attachment_point: 10000000,
    policy_effective_date: new Date().toISOString().split('T')[0],
    policy_expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    // Risk profile fields
    mfa_implemented: true,
    endpoint_detection_deployed: true,
    data_backup_airgapped: true,
    claims_history_5yr_count: 0,
    records_count: 500000,
    board_oversight_policy: true,
    dno_prior_litigation: false,
    financial_restatements_3yr: false,
    // Document flags
    doc_loss_runs: true,
    doc_financial_statement: true,
    doc_security_assessment: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const documents = [];
      if (formData.doc_loss_runs) {
        documents.push({ document_type: 'LOSS_RUNS', filename: `${formData.insured_name.replace(/\s+/g, '_')}_loss_runs_3yr.pdf` });
      }
      if (formData.doc_financial_statement) {
        documents.push({ document_type: 'FINANCIAL_STATEMENT', filename: `${formData.insured_name.replace(/\s+/g, '_')}_audited_financials_2025.pdf` });
      }
      if (formData.doc_security_assessment && formData.risk_type === 'CYBER') {
        documents.push({ document_type: 'SECURITY_ASSESSMENT', filename: `${formData.insured_name.replace(/\s+/g, '_')}_soc2_type2_report.pdf` });
      }

      const risk_profile = formData.risk_type === 'CYBER' ? {
        mfa_implemented: Boolean(formData.mfa_implemented),
        endpoint_detection_deployed: Boolean(formData.endpoint_detection_deployed),
        data_backup_airgapped: Boolean(formData.data_backup_airgapped),
        claims_history_5yr_count: Number(formData.claims_history_5yr_count || 0),
        records_count: Number(formData.records_count || 0),
      } : {
        board_oversight_policy: Boolean(formData.board_oversight_policy),
        dno_prior_litigation: Boolean(formData.dno_prior_litigation),
        financial_restatements_3yr: Boolean(formData.financial_restatements_3yr),
        claims_history_5yr_count: Number(formData.claims_history_5yr_count || 0),
      };

      const payload = {
        risk_type: formData.risk_type,
        insured_name: formData.insured_name,
        industry_sector: formData.industry_sector,
        annual_revenue: Number(formData.annual_revenue),
        primary_policy_limit: Number(formData.primary_policy_limit),
        requested_reinsurance_limit: Number(formData.requested_reinsurance_limit),
        attachment_point: Number(formData.attachment_point),
        policy_effective_date: formData.policy_effective_date,
        policy_expiration_date: formData.policy_expiration_date,
        risk_profile,
        documents,
      };

      const result = await api.createSubmission(payload);
      setSuccessData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => `${d.loc?.join('.') || 'field'}: ${d.msg}`).join(', '));
      } else {
        setError(err.message || 'Failed to submit reinsurance request.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Submission Successfully Received</h2>
        <p className="text-slate-600 mb-6">
          Your facultative reinsurance request has been automatically ingested, scored, and routed to the underwriter review queue.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Tracking Number:</span>
            <span className="font-semibold text-slate-800">{successData.tracking_number || successData.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Insured Entity:</span>
            <span className="font-semibold text-slate-800">{successData.insured_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Risk Type:</span>
            <span className="font-semibold text-slate-800">{successData.risk_type}</span>
          </div>
          {successData.overall_risk_score !== undefined && (
            <div className="flex justify-between">
              <span className="text-slate-500">Initial Automated Risk Score:</span>
              <span className="font-semibold text-blue-600">{Number(successData.overall_risk_score).toFixed(1)} / 100</span>
            </div>
          )}
          {successData.status && (
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                {successData.status}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setSuccessData(null);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
          >
            Submit Another Request
          </button>
          <button
            onClick={() => navigate(`/submissions/${successData.id}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2"
          >
            View Submission Details <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/queue')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm"
          >
            Go to Review Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3" role="alert">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Submission Validation Error</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Risk Type Selection */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label className="block text-sm font-semibold text-slate-800 mb-3">1. Select Risk Line of Business</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, risk_type: 'CYBER' }))}
            className={`p-4 rounded-lg border-2 text-left flex items-start gap-3 transition-all ${
              formData.risk_type === 'CYBER'
                ? 'border-blue-600 bg-blue-50/50 text-blue-950'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <Shield className={`w-6 h-6 mt-0.5 ${formData.risk_type === 'CYBER' ? 'text-blue-600' : 'text-slate-400'}`} />
            <div>
              <div className="font-bold">Cyber Reinsurance</div>
              <p className="text-xs text-slate-500 mt-1">
                Data breach, ransomware, business interruption, and liability excess coverage.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, risk_type: 'D_AND_O' }))}
            className={`p-4 rounded-lg border-2 text-left flex items-start gap-3 transition-all ${
              formData.risk_type === 'D_AND_O'
                ? 'border-blue-600 bg-blue-50/50 text-blue-950'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <Building2 className={`w-6 h-6 mt-0.5 ${formData.risk_type === 'D_AND_O' ? 'text-blue-600' : 'text-slate-400'}`} />
            <div>
              <div className="font-bold">Directors & Officers (D&O)</div>
              <p className="text-xs text-slate-500 mt-1">
                Executive liability, securities litigation, governance, and regulatory investigation coverage.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Insured & Policy Terms */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" /> 2. Insured Entity & Policy Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Insured Entity Name *</label>
            <input
              type="text"
              name="insured_name"
              required
              value={formData.insured_name}
              onChange={handleChange}
              placeholder="e.g. Apex Global Financial Corp"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector *</label>
            <select
              name="industry_sector"
              required
              value={formData.industry_sector}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare">Healthcare & Life Sciences</option>
              <option value="Technology">Technology & SaaS</option>
              <option value="Retail & E-commerce">Retail & E-commerce</option>
              <option value="Manufacturing">Manufacturing & Industrial</option>
              <option value="Energy & Utilities">Energy & Utilities</option>
              <option value="Professional Services">Professional Services</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Revenue ($) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
              <input
                type="number"
                name="annual_revenue"
                required
                min="1000"
                value={formData.annual_revenue}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Policy Limit ($) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
              <input
                type="number"
                name="primary_policy_limit"
                required
                min="1000"
                value={formData.primary_policy_limit}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Reinsurance Limit ($) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
              <input
                type="number"
                name="requested_reinsurance_limit"
                required
                min="1000"
                value={formData.requested_reinsurance_limit}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment Point ($) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
              <input
                type="number"
                name="attachment_point"
                required
                min="0"
                value={formData.attachment_point}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Effective Date *</label>
            <input
              type="date"
              name="policy_effective_date"
              required
              value={formData.policy_effective_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Expiration Date *</label>
            <input
              type="date"
              name="policy_expiration_date"
              required
              value={formData.policy_expiration_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Risk Profile Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" /> 3. Risk Assessment Criteria
        </h3>

        {formData.risk_type === 'CYBER' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="mfa_implemented"
                checked={formData.mfa_implemented}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-xs text-slate-700">
                <strong className="block text-slate-900">MFA Enforced Enterprise-Wide</strong>
                Multi-factor authentication enabled on all email, VPN, and privileged admin accounts.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="endpoint_detection_deployed"
                checked={formData.endpoint_detection_deployed}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-xs text-slate-700">
                <strong className="block text-slate-900">EDR / XDR Telemetry Active</strong>
                Endpoint Detection and Response deployed across all corporate endpoints and servers.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="data_backup_airgapped"
                checked={formData.data_backup_airgapped}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-xs text-slate-700">
                <strong className="block text-slate-900">Immutable / Air-gapped Backups</strong>
                Ransomware-resistant offline or immutable cloud backup system verified quarterly.
              </span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">5-Year Cyber Claims Count</label>
              <input
                type="number"
                name="claims_history_5yr_count"
                min="0"
                value={formData.claims_history_5yr_count}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="board_oversight_policy"
                checked={formData.board_oversight_policy}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-xs text-slate-700">
                <strong className="block text-slate-900">Formal Board Risk Oversight Policy</strong>
                Independent audit and compensation committees active with quarterly governance reviews.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="dno_prior_litigation"
                checked={formData.dno_prior_litigation}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-xs text-slate-700">
                <strong className="block text-slate-900">Prior D&O Litigation in Past 3 Years</strong>
                Entity or officers subject to shareholder derivative suits or SEC inquiries.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="financial_restatements_3yr"
                checked={formData.financial_restatements_3yr}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-xs text-slate-700">
                <strong className="block text-slate-900">Material Financial Restatements (3 Years)</strong>
                Any historical GAAP/IFRS restatements or internal control material weaknesses.
              </span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">5-Year D&O Claims Count</label>
              <input
                type="number"
                name="claims_history_5yr_count"
                min="0"
                value={formData.claims_history_5yr_count}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Underwriting Documentation Checklist */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> 4. Attached Risk Evidence Documents
        </h3>
        <p className="text-xs text-slate-500">
          Submitting required documents avoids automated Missing Information Flags and expedites Underwriter Quote generation.
        </p>

        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              name="doc_loss_runs"
              checked={formData.doc_loss_runs}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-xs text-slate-800 font-medium">3-Year Verified Loss Runs Declaration (.pdf)</span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              name="doc_financial_statement"
              checked={formData.doc_financial_statement}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-xs text-slate-800 font-medium">Audited Annual Financial Statements (.pdf)</span>
          </label>

          {formData.risk_type === 'CYBER' && (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="doc_security_assessment"
                checked={formData.doc_security_assessment}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-xs text-slate-800 font-medium">Third-Party Cyber Security Assessment / SOC2 Report (.pdf)</span>
            </label>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/queue')}
          className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold text-sm shadow-sm flex items-center gap-2"
        >
          {loading ? 'Submitting & Scoring...' : 'Submit Reinsurance Request'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
}
