import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Briefcase, Upload, AlertCircle, CheckCircle2, ArrowRight, Save, FileText } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { api } from '../../services/api';

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
    policy_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    prior_claims_count: 0,
    prior_claims_total: 0,
    security_governance_score: 80,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.insured_name.trim()) {
      newErrors.insured_name = 'Insured Company Name is required';
    }
    if (!formData.industry_segment) {
      newErrors.industry_segment = 'Industry segment is required';
    }
    if (!formData.annual_revenue || Number(formData.annual_revenue) <= 0) {
      newErrors.annual_revenue = 'Annual Revenue must be greater than 0';
    }
    if (!formData.sum_insured || Number(formData.sum_insured) <= 0) {
      newErrors.sum_insured = 'Sum Insured (Reinsurance Limit) must be greater than 0';
    }
    if (formData.attachment_point === '' || Number(formData.attachment_point) < 0) {
      newErrors.attachment_point = 'Attachment Point cannot be negative';
    }
    if (!formData.policy_start_date) {
      newErrors.policy_start_date = 'Policy start date is required';
    }
    if (!formData.policy_end_date) {
      newErrors.policy_end_date = 'Policy end date is required';
    }
    if (formData.policy_start_date && formData.policy_end_date && formData.policy_start_date > formData.policy_end_date) {
      newErrors.policy_end_date = 'Policy end date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (targetStatus = 'SUBMITTED') => {
    setServerError(null);
    if (targetStatus === 'SUBMITTED' && !validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        annual_revenue: Number(formData.annual_revenue) || 0,
        sum_insured: Number(formData.sum_insured) || 0,
        attachment_point: Number(formData.attachment_point) || 0,
        prior_claims_count: Number(formData.prior_claims_count) || 0,
        prior_claims_total: Number(formData.prior_claims_total) || 0,
        security_governance_score: Number(formData.security_governance_score) || 0,
        status: targetStatus,
      };

      const res = await api.createSubmission(payload);
      
      // Upload files if any
      if (selectedFiles.length > 0 && res?.id) {
        for (const file of selectedFiles) {
          const fileData = new FormData();
          fileData.append('file', file);
          fileData.append('document_type', file.name.endsWith('.pdf') ? 'POLICY_WORDING' : 'FINANCIALS');
          try {
            await api.uploadAttachment(res.id, fileData);
          } catch (uploadErr) {
            // Log file upload issue non-blockingly
          }
        }
      }

      setSuccessInfo({
        message: targetStatus === 'SUBMITTED' 
          ? `Submission ${res.submission_reference || res.id} submitted successfully!` 
          : 'Draft saved successfully!',
        submissionId: res.id,
      });

      setTimeout(() => {
        navigate('/carrier/dashboard');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to submit request. Please verify inputs and try again.';
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit Facultative Reinsurance Request</h1>
          <p className="text-sm text-slate-500 mt-1">
            Provide risk profile details, limits, and documentation for Cyber or D&O placements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={Save}
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            icon={ArrowRight}
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </div>

      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-semibold">Submission Error</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {successInfo && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <p className="font-semibold">Success</p>
            <p className="mt-0.5">{successInfo.message}</p>
          </div>
        </div>
      )}

      {/* Risk Type Selector */}
      <Card title="1. Select Risk Category" subtitle="Choose between Cyber Risk or Directors & Officers (D&O) Liability">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, risk_type: 'CYBER' }))}
            className={`p-5 rounded-xl border-2 text-left flex items-start space-x-4 transition-all ${
              formData.risk_type === 'CYBER'
                ? 'border-[#2461F5] bg-blue-50/50 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`p-3 rounded-lg ${formData.risk_type === 'CYBER' ? 'bg-[#2461F5] text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Cyber Facultative Reinsurance</span>
                <Badge variant="primary" size="sm">Cyber</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Protection for ransomware, extortion, business interruption, system failure, and privacy liabilities.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, risk_type: 'D_AND_O' }))}
            className={`p-5 rounded-xl border-2 text-left flex items-start space-x-4 transition-all ${
              formData.risk_type === 'D_AND_O'
                ? 'border-[#2461F5] bg-blue-50/50 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`p-3 rounded-lg ${formData.risk_type === 'D_AND_O' ? 'bg-[#2461F5] text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Directors & Officers (D&O)</span>
                <Badge variant="purple" size="sm">D&O</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Executive protection against securities litigation, fiduciary breach, regulatory investigations, and management claims.
              </p>
            </div>
          </button>
        </div>
      </Card>

      {/* Insured Profile & Parameters */}
      <Card title="2. Insured Profile & Risk Parameters" subtitle="Specify core insured parameters and financial information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="insured_name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Insured Company Name *
            </label>
            <input
              id="insured_name"
              type="text"
              name="insured_name"
              placeholder="e.g. Acme Cloud Corp"
              value={formData.insured_name}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                errors.insured_name
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
            {errors.insured_name && <p className="text-xs text-rose-600 mt-1">{errors.insured_name}</p>}
          </div>

          <div>
            <label htmlFor="industry_segment" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Industry Segment *
            </label>
            <select
              id="industry_segment"
              name="industry_segment"
              value={formData.industry_segment}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
            >
              <option value="Technology">Technology & Cloud Infrastructure</option>
              <option value="Financial Services">Financial Services & Banking</option>
              <option value="Healthcare">Healthcare & Life Sciences</option>
              <option value="Retail & E-Commerce">Retail & E-Commerce</option>
              <option value="Manufacturing">Manufacturing & Industrial</option>
              <option value="Professional Services">Professional & Legal Services</option>
              <option value="Energy & Utilities">Energy & Utilities</option>
            </select>
          </div>

          <div>
            <label htmlFor="annual_revenue" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Annual Revenue (USD) *
            </label>
            <input
              id="annual_revenue"
              type="number"
              name="annual_revenue"
              placeholder="50000000"
              value={formData.annual_revenue}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                errors.annual_revenue
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
            {errors.annual_revenue && <p className="text-xs text-rose-600 mt-1">{errors.annual_revenue}</p>}
          </div>

          <div>
            <label htmlFor="security_governance_score" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {formData.risk_type === 'CYBER' ? 'Security Posture Score (0 - 100)' : 'Governance & ESG Score (0 - 100)'}
            </label>
            <input
              id="security_governance_score"
              type="number"
              name="security_governance_score"
              min="0"
              max="100"
              value={formData.security_governance_score}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Based on MFA, endpoint detection, or corporate governance audit.</p>
          </div>
        </div>
      </Card>

      {/* Coverage & Placement Structure */}
      <Card title="3. Policy Limits & Attachment Point" subtitle="Define reinsurance layer requested">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="sum_insured" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Sum Insured / Reinsurance Limit (USD) *
            </label>
            <input
              id="sum_insured"
              type="number"
              name="sum_insured"
              placeholder="10000000"
              value={formData.sum_insured}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                errors.sum_insured
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
            {errors.sum_insured && <p className="text-xs text-rose-600 mt-1">{errors.sum_insured}</p>}
          </div>

          <div>
            <label htmlFor="attachment_point" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Attachment Point / Primary Retention (USD) *
            </label>
            <input
              id="attachment_point"
              type="number"
              name="attachment_point"
              placeholder="1000000"
              value={formData.attachment_point}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                errors.attachment_point
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
            {errors.attachment_point && <p className="text-xs text-rose-600 mt-1">{errors.attachment_point}</p>}
          </div>

          <div>
            <label htmlFor="policy_start_date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Policy Period Start Date *
            </label>
            <input
              id="policy_start_date"
              type="date"
              name="policy_start_date"
              value={formData.policy_start_date}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="policy_end_date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Policy Period End Date *
            </label>
            <input
              id="policy_end_date"
              type="date"
              name="policy_end_date"
              value={formData.policy_end_date}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                errors.policy_end_date
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
            {errors.policy_end_date && <p className="text-xs text-rose-600 mt-1">{errors.policy_end_date}</p>}
          </div>
        </div>
      </Card>

      {/* Loss & Claim History */}
      <Card title="4. Historical Claims & Loss Experience" subtitle="Past 5-year claims record for accurate risk scoring">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="prior_claims_count" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Prior Claims Count (Past 5 Years)
            </label>
            <input
              id="prior_claims_count"
              type="number"
              name="prior_claims_count"
              min="0"
              value={formData.prior_claims_count}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="prior_claims_total" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Prior Claims Total Incurred (USD)
            </label>
            <input
              id="prior_claims_total"
              type="number"
              name="prior_claims_total"
              min="0"
              value={formData.prior_claims_total}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Document Uploader */}
      <Card title="5. Required Supporting Documents" subtitle="Upload slip wording, financials, and technical risk assessments">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
            <input
              id="document_upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="document_upload" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX (Max 25MB each)</p>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Selected Files:</p>
              <div className="space-y-1.5">
                {selectedFiles.map((file, idx) => (
                  <div key={file.name + idx} className="flex items-center justify-between p-2.5 bg-slate-100 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-800">{file.name}</span>
                      <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Badge variant="primary" size="sm">Ready to upload</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Submit Action Bar */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          variant="secondary"
          icon={Save}
          onClick={() => handleSubmit('DRAFT')}
          disabled={isSubmitting}
        >
          Save Draft
        </Button>
        <Button
          variant="primary"
          icon={ArrowRight}
          onClick={() => handleSubmit('SUBMITTED')}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </div>
  );
};

export default CarrierSubmissionForm;
