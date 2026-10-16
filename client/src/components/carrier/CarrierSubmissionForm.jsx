import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Building,
  DollarSign,
  Calendar,
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileText,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Lock,
} from "lucide-react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { api } from "../../services/api";

export const CarrierSubmissionForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    risk_type: "CYBER",
    insured_name: "",
    industry_segment: "Technology",
    annual_revenue: "",
    sum_insured: "",
    attachment_point: "",
    policy_start_date: new Date().toISOString().split("T")[0],
    policy_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    prior_claims_count: "0",
    prior_claims_total: "0",
    security_governance_score: "85",
  });

  const [attachedFiles, setAttachedFiles] = useState([]);

  const industryOptions = [
    "Technology",
    "Financial Services",
    "Healthcare & Life Sciences",
    "Retail & E-Commerce",
    "Manufacturing & Industrial",
    "Energy & Utilities",
    "Professional Services",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type || "application/pdf",
      }));
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.insured_name.trim())
        errors.insured_name = "Insured legal name is required.";
      if (!formData.annual_revenue || Number(formData.annual_revenue) <= 0) {
        errors.annual_revenue = "Annual revenue must be greater than 0.";
      }
    }
    if (step === 2) {
      if (!formData.sum_insured || Number(formData.sum_insured) <= 0) {
        errors.sum_insured = "Sum insured must be greater than 0.";
      }
      if (!formData.attachment_point || Number(formData.attachment_point) < 0) {
        errors.attachment_point = "Attachment point must be 0 or higher.";
      }
      if (!formData.policy_start_date)
        errors.policy_start_date = "Policy start date is required.";
      if (!formData.policy_end_date)
        errors.policy_end_date = "Policy end date is required.";
    }
    if (step === 3) {
      if (
        formData.prior_claims_count === "" ||
        Number(formData.prior_claims_count) < 0
      ) {
        errors.prior_claims_count = "Prior claims count cannot be negative.";
      }
      if (
        formData.prior_claims_total === "" ||
        Number(formData.prior_claims_total) < 0
      ) {
        errors.prior_claims_total = "Prior claims amount cannot be negative.";
      }
      if (
        formData.security_governance_score === "" ||
        Number(formData.security_governance_score) < 0 ||
        Number(formData.security_governance_score) > 100
      ) {
        errors.security_governance_score = "Score must be between 0 and 100.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrorMsg("");
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (status = "SUBMITTED") => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setErrorMsg(
        "Please correct the validation errors across form steps before submitting.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      risk_type: formData.risk_type,
      insured_name: formData.insured_name.trim(),
      industry_segment: formData.industry_segment,
      annual_revenue: Number(formData.annual_revenue),
      sum_insured: Number(formData.sum_insured),
      attachment_point: Number(formData.attachment_point),
      policy_start_date: formData.policy_start_date,
      policy_end_date: formData.policy_end_date,
      prior_claims_count: parseInt(formData.prior_claims_count, 10) || 0,
      prior_claims_total: Number(formData.prior_claims_total) || 0,
      security_governance_score:
        Number(formData.security_governance_score) || 80,
      status: status,
    };

    try {
      const response = await api.createSubmission(payload);
      if (onSuccess) {
        onSuccess(response);
      } else {
        navigate("/carrier/dashboard", {
          state: {
            newSubmissionRef: response?.submission_reference || response?.id,
          },
        });
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : err.message ||
            "Submission failed. Please check inputs and backend connection.";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Steps */}
      <div className="bg-surface p-4 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Risk Profile" },
            { num: 2, label: "Coverage & Retention" },
            { num: 3, label: "Loss & Governance" },
            { num: 4, label: "Documents & Review" },
          ].map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    currentStep === step.num
                      ? "bg-primary text-white"
                      : currentStep > step.num
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {currentStep > step.num ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    currentStep === step.num
                      ? "text-primary font-bold"
                      : "text-textSecondary"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > idx + 1 ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-sm text-error">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Step 1: Risk Identification & Insured Profile */}
      {currentStep === 1 && (
        <Card
          title="Step 1: Risk Category & Insured Details"
          subtitle="Select line of business and primary corporate demographic details"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-2">
                Line of Business (Facultative Risk Type)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`border-2 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition-all ${
                    formData.risk_type === "CYBER"
                      ? "border-primary bg-blue-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="risk_type"
                    value="CYBER"
                    checked={formData.risk_type === "CYBER"}
                    onChange={handleChange}
                    className="mt-1 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-semibold text-textPrimary flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-primary" />
                      Cyber Risk
                    </div>
                    <p className="text-xs text-textSecondary mt-1">
                      First &amp; third party cyber liability, ransomware, data
                      breach, and business interruption.
                    </p>
                  </div>
                </label>

                <label
                  className={`border-2 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition-all ${
                    formData.risk_type === "D_AND_O"
                      ? "border-primary bg-blue-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="risk_type"
                    value="D_AND_O"
                    checked={formData.risk_type === "D_AND_O"}
                    onChange={handleChange}
                    className="mt-1 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-semibold text-textPrimary flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-indigo-600" />
                      Directors &amp; Officers (D&amp;O)
                    </div>
                    <p className="text-xs text-textSecondary mt-1">
                      Management liability, securities litigation, regulatory
                      investigations, and fiduciary exposures.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="insured_name"
                  className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-1"
                >
                  Insured Legal Entity Name *
                </label>
                <input
                  id="insured_name"
                  type="text"
                  name="insured_name"
                  value={formData.insured_name}
                  onChange={handleChange}
                  placeholder="e.g. Apex Financial Technologies Inc."
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.insured_name
                      ? "border-error bg-red-50/30"
                      : "border-gray-300"
                  }`}
                />
                {fieldErrors.insured_name && (
                  <p className="text-xs text-error mt-1">
                    {fieldErrors.insured_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="industry_segment"
                  className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-1"
                >
                  Industry Segment *
                </label>
                <select
                  id="industry_segment"
                  name="industry_segment"
                  value={formData.industry_segment}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                >
                  {industryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="annual_revenue"
                  className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-1"
                >
                  Annual Revenue ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    $
                  </span>
                  <input
                    id="annual_revenue"
                    type="number"
                    name="annual_revenue"
                    value={formData.annual_revenue}
                    onChange={handleChange}
                    placeholder="e.g. 50000000"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      fieldErrors.annual_revenue
                        ? "border-error bg-red-50/30"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {fieldErrors.annual_revenue && (
                  <p className="text-xs text-error mt-1">
                    {fieldErrors.annual_revenue}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Coverage & Attachment Point */}
      {currentStep === 2 && (
        <Card
          title="Step 2: Facultative Reinsurance Coverage Structure"
          subtitle="Specify requested capacity, underlying attachment point, and policy period"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="sum_insured"
                className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-1"
              >
                Requested Facultative Limit (Sum Insured) ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  $
                </span>
                <input
                  id="sum_insured"
                  type="number"
                  name="sum_insured"
                  value={formData.sum_insured}
                  onChange={handleChange}
                  placeholder="e.g. 10000000"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.sum_insured
                      ? "border-error bg-red-50/30"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {fieldErrors.sum_insured && (
                <p className="text-xs text-error mt-1">
                  {fieldErrors.sum_insured}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="attachment_point"
                className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-1"
              >
                Underlying Attachment Point / Retention ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  $
                </span>
                <input
                  id="attachment_point"
                  type="number"
                  name="attachment_point"
                  value={formData.attachment_point}
                  onChange={handleChange}
                  placeholder="e.g. 5000000 (0 for Primary Layer)"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.attachment_point
                      ? "border-error bg-red-50/30"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {fieldErrors.attachment_point && (
                <p className="text-xs text-error mt-1">
                  {fieldErrors.attachment_point}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="policy_start_date"
                className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-1"
              >
                Policy Inception Date *
              </label>
              <input
                id="policy_start_date"
                type="date"
                name="policy_start_date"
                value={formData.policy_start_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
              />
            </div>

            <div>
              <label
                htmlFor="policy_end_date"
                className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-1"
              >
                Policy Expiration Date *
              </label>
              <input
                id="policy_end_date"
                type="date"
                name="policy_end_date"
                value={formData.policy_end_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Loss History & Security / Governance Profile */}
      {currentStep === 3 && (
        <Card
          title="Step 3: Loss Experience & Risk Governance Factors"
          subtitle="Provide past 5-year claims experience and technical risk evaluation parameters"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="prior_claims_count"
                  className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-1"
                >
                  Prior Claims / Incurred Losses Count (Last 5 Years) *
                </label>
                <input
                  id="prior_claims_count"
                  type="number"
                  name="prior_claims_count"
                  value={formData.prior_claims_count}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.prior_claims_count
                      ? "border-error bg-red-50/30"
                      : "border-gray-300"
                  }`}
                />
                {fieldErrors.prior_claims_count && (
                  <p className="text-xs text-error mt-1">
                    {fieldErrors.prior_claims_count}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="prior_claims_total"
                  className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-1"
                >
                  Total Incurred Claims Amount ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    $
                  </span>
                  <input
                    id="prior_claims_total"
                    type="number"
                    name="prior_claims_total"
                    value={formData.prior_claims_total}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      fieldErrors.prior_claims_total
                        ? "border-error bg-red-50/30"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {fieldErrors.prior_claims_total && (
                  <p className="text-xs text-error mt-1">
                    {fieldErrors.prior_claims_total}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="security_governance_score"
                  className="text-xs font-semibold uppercase tracking-wider text-textSecondary"
                >
                  {formData.risk_type === "CYBER"
                    ? "Cyber Security Posture Rating (MFA / EDR / Patching)"
                    : "Corporate Governance & D&O Risk Score"}
                </label>
                <span className="text-sm font-bold text-primary">
                  {formData.security_governance_score} / 100
                </span>
              </div>
              <input
                id="security_governance_score"
                type="range"
                name="security_governance_score"
                min="0"
                max="100"
                value={formData.security_governance_score}
                onChange={handleChange}
                className="w-full accent-primary h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-textSecondary mt-1">
                <span>0 (Critical Vulnerabilities / Weak Board Controls)</span>
                <span>50 (Standard)</span>
                <span>100 (Tier-1 Defense / Comprehensive Governance)</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Document Upload & Summary Review */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card
            title="Step 4: Supporting Documentation & Submission Review"
            subtitle="Upload risk assessments, slip wordings, and audited financial statements"
          >
            <div className="space-y-6">
              {/* File Upload Box */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors bg-gray-50/50">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-textPrimary">
                  Upload Policy Wording, Loss Runs or Audit Reports
                </p>
                <p className="text-xs text-textSecondary mt-1 mb-3">
                  PDF, DOCX, XLSX up to 25MB each
                </p>
                <label className="inline-flex">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="px-4 py-2 bg-surface border border-gray-300 rounded-md text-xs font-semibold text-textPrimary hover:bg-gray-100 cursor-pointer shadow-sm">
                    Browse Files
                  </span>
                </label>
              </div>

              {/* Uploaded File List */}
              {attachedFiles.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-textSecondary mb-2">
                    Attached Files ({attachedFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={file.name + idx}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="font-medium text-textPrimary">
                            {file.name}
                          </span>
                          <span className="text-gray-400">({file.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-error hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Summary Table */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-textSecondary mb-3">
                  Review Submission Summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-textSecondary block">Risk Type:</span>
                    <span className="font-semibold text-textPrimary">
                      {formData.risk_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-textSecondary block">
                      Insured Name:
                    </span>
                    <span className="font-semibold text-textPrimary">
                      {formData.insured_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-textSecondary block">Industry:</span>
                    <span className="font-semibold text-textPrimary">
                      {formData.industry_segment}
                    </span>
                  </div>
                  <div>
                    <span className="text-textSecondary block">
                      Annual Revenue:
                    </span>
                    <span className="font-semibold text-textPrimary">
                      ${Number(formData.annual_revenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-textSecondary block">
                      Sum Insured:
                    </span>
                    <span className="font-semibold text-primary">
                      ${Number(formData.sum_insured || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-textSecondary block">
                      Attachment Point:
                    </span>
                    <span className="font-semibold text-textPrimary">
                      ${Number(formData.attachment_point || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-textSecondary block">
                      Prior Claims:
                    </span>
                    <span className="font-semibold text-textPrimary">
                      {formData.prior_claims_count} ($
                      {Number(
                        formData.prior_claims_total || 0,
                      ).toLocaleString()}
                      )
                    </span>
                  </div>
                  <div>
                    <span className="text-textSecondary block">
                      Security / Gov Score:
                    </span>
                    <span className="font-semibold text-textPrimary">
                      {formData.security_governance_score} / 100
                    </span>
                  </div>
                  <div>
                    <span className="text-textSecondary block">Documents:</span>
                    <span className="font-semibold text-textPrimary">
                      {attachedFiles.length} file(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Form Navigation Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={handlePrev}
              icon={ArrowLeft}
              disabled={submitting}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {currentStep < 4 ? (
            <Button variant="primary" onClick={handleNext} icon={ArrowRight}>
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => handleSubmit("DRAFT")}
                loading={submitting}
                icon={Save}
              >
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit("SUBMITTED")}
                loading={submitting}
                icon={Send}
              >
                Submit to Underwriter Queue
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarrierSubmissionForm;
