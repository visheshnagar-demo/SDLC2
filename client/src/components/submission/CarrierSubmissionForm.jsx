import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  FilePlus2,
  ShieldAlert,
  Building2,
  Calendar,
  DollarSign,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import RiskScoringPreview from "./RiskScoringPreview";
import { submitReinsuranceRequest } from "../../services/api";

export function CarrierSubmissionForm({ onSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    carrier_name: "Travelers Casualty & Surety Co",
    carrier_rating: "A++",
    risk_category: "CYBER",
    insured_entity_name: "Apex HealthTech Solutions Inc.",
    industry_sector: "Healthcare",
    primary_policy_number: "POL-CYB-2026-9812",
    policy_limit_usd: 10000000,
    attachment_point_usd: 5000000,
    prior_loss_amount_usd: 125000,
    effective_date: "2026-06-01",
    expiration_date: "2027-06-01",
  });

  const [documents, setDocuments] = useState({
    cyber_questionnaire: true,
    financial_statements: true,
    loss_runs: true,
    policy_copy: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.carrier_name?.trim())
      newErrors.carrier_name = "Carrier name is required";
    if (!formData.carrier_rating)
      newErrors.carrier_rating = "Carrier rating is required";
    if (!formData.insured_entity_name?.trim())
      newErrors.insured_entity_name = "Insured entity name is required";
    if (!formData.industry_sector)
      newErrors.industry_sector = "Industry sector is required";
    if (!formData.primary_policy_number?.trim())
      newErrors.primary_policy_number = "Primary policy number is required";

    const limit = Number(formData.policy_limit_usd);
    if (isNaN(limit) || limit <= 0) {
      newErrors.policy_limit_usd = "Policy limit must be a positive amount";
    }

    const attachment = Number(formData.attachment_point_usd);
    if (isNaN(attachment) || attachment < 0) {
      newErrors.attachment_point_usd = "Attachment point must be 0 or greater";
    }

    if (!formData.effective_date) {
      newErrors.effective_date = "Effective date is required";
    }
    if (!formData.expiration_date) {
      newErrors.expiration_date = "Expiration date is required";
    } else if (
      formData.effective_date &&
      formData.expiration_date <= formData.effective_date
    ) {
      newErrors.expiration_date =
        "Expiration date must be after effective date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDocToggle = (docKey) => {
    setDocuments((prev) => ({
      ...prev,
      [docKey]: !prev[docKey],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Build attached documents payload
      const attachedList = [];
      if (documents.cyber_questionnaire) {
        attachedList.push({
          document_type: "CYBER_ASSESSMENT_QUESTIONNAIRE",
          filename: "Apex_Cyber_Security_Audit_2026.pdf",
        });
      }
      if (documents.financial_statements) {
        attachedList.push({
          document_type: "FINANCIAL_STATEMENTS",
          filename: "Apex_Audited_Financials_FY2025.pdf",
        });
      }
      if (documents.loss_runs) {
        attachedList.push({
          document_type: "LOSS_RUNS",
          filename: "Apex_5Yr_Loss_Runs.pdf",
        });
      }
      if (documents.policy_copy) {
        attachedList.push({
          document_type: "PRIMARY_POLICY_COPY",
          filename: `${formData.primary_policy_number}_Underlying.pdf`,
        });
      }

      const payload = {
        carrier_name: formData.carrier_name,
        carrier_rating: formData.carrier_rating,
        risk_category: formData.risk_category,
        insured_entity_name: formData.insured_entity_name,
        industry_sector: formData.industry_sector,
        primary_policy_number: formData.primary_policy_number,
        policy_limit_usd: Number(formData.policy_limit_usd),
        attachment_point_usd: Number(formData.attachment_point_usd),
        prior_loss_amount_usd: Number(formData.prior_loss_amount_usd) || 0,
        effective_date: formData.effective_date,
        expiration_date: formData.expiration_date,
        attached_documents: attachedList,
      };

      const result = await submitReinsuranceRequest(payload);
      setSubmissionResult(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setApiError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to submit facultative reinsurance request. Please check inputs and backend connectivity.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionResult) {
    const ref =
      submissionResult.submission_reference ||
      submissionResult.id ||
      "FAC-2026-SUBMITTED";
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <Badge variant="success" size="lg">
            Submission Accepted
          </Badge>
          <h2 className="text-2xl font-bold text-[#0F1729]">
            Facultative Reinsurance Request Dispatched
          </h2>
          <p className="text-sm text-[#66738A]">
            Reference Code:{" "}
            <span className="font-mono font-bold text-blue-600 text-base">
              {ref}
            </span>
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your request for{" "}
            <strong className="text-slate-800">
              {formData.insured_entity_name}
            </strong>{" "}
            ({formData.risk_category}) has been logged in the Underwriter Review
            Queue with initial risk scoring.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-left text-xs">
          <div>
            <span className="text-slate-400 block">Risk Line</span>
            <strong className="text-slate-800">{formData.risk_category}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Requested Limit</span>
            <strong className="text-slate-800">
              ${(formData.policy_limit_usd / 1000000).toFixed(1)}M
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block">Attachment Point</span>
            <strong className="text-slate-800">
              ${(formData.attachment_point_usd / 1000000).toFixed(1)}M
            </strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setSubmissionResult(null);
              setFormData({
                carrier_name: "Berkshire Hathaway Specialty",
                carrier_rating: "A++",
                risk_category: "DO",
                insured_entity_name: "Nexus BioPharmaceuticals Corp",
                industry_sector: "Healthcare",
                primary_policy_number: "POL-DO-2026-4421",
                policy_limit_usd: 15000000,
                attachment_point_usd: 10000000,
                prior_loss_amount_usd: 350000,
                effective_date: "2026-07-01",
                expiration_date: "2027-07-01",
              });
            }}
          >
            Create Another Submission
          </Button>
          <Button
            variant="primary"
            icon={ArrowRight}
            onClick={() => navigate("/queue")}
          >
            View in Underwriter Queue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner / Heading */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Carrier Ingestion Gateway</Badge>
            <span className="text-xs text-slate-400">Step 1 of 1</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F1729]">
            Submit Facultative Reinsurance Request
          </h2>
          <p className="text-xs text-[#66738A]">
            Direct submission portal for Primary Carriers placing excess Cyber
            and Directors & Officers (D&O) treaty layers.
          </p>
        </div>

        {/* Risk Line Selector */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() =>
              setFormData((p) => ({ ...p, risk_category: "CYBER" }))
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              formData.risk_category === "CYBER"
                ? "bg-white text-indigo-700 shadow-sm border border-indigo-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            Cyber Risk
          </button>
          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, risk_category: "DO" }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              formData.risk_category === "DO"
                ? "bg-white text-purple-700 shadow-sm border border-purple-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-600" />
            Directors & Officers (D&O)
          </button>
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block">Submission Error</strong>
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Carrier & Insured Entity Details */}
          <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#66738A] flex items-center gap-2 pb-2 border-b border-[#E3E8F0]">
              <Building2 className="w-4 h-4 text-[#2461F5]" />
              1. Carrier & Insured Entity Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ceding Carrier Name *
                </label>
                <input
                  type="text"
                  name="carrier_name"
                  value={formData.carrier_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                    errors.carrier_name
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-slate-300"
                  }`}
                  placeholder="e.g. Travelers Casualty, Chubb"
                />
                {errors.carrier_name && (
                  <span className="text-[11px] text-rose-600 mt-0.5 block">
                    {errors.carrier_name}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Carrier Financial Rating (A.M. Best) *
                </label>
                <select
                  name="carrier_rating"
                  value={formData.carrier_rating}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="A++">A++ (Superior)</option>
                  <option value="A+">A+ (Superior)</option>
                  <option value="A">A (Excellent)</option>
                  <option value="A-">A- (Excellent)</option>
                  <option value="B++">B++ (Good)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Insured Entity Name *
                </label>
                <input
                  type="text"
                  name="insured_entity_name"
                  value={formData.insured_entity_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                    errors.insured_entity_name
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-slate-300"
                  }`}
                  placeholder="e.g. Acme Global Health Inc."
                />
                {errors.insured_entity_name && (
                  <span className="text-[11px] text-rose-600 mt-0.5 block">
                    {errors.insured_entity_name}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry Sector *
                </label>
                <select
                  name="industry_sector"
                  value={formData.industry_sector}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="Healthcare">Healthcare & BioTech</option>
                  <option value="Financial Services">
                    Financial Services & Banking
                  </option>
                  <option value="Technology">Technology & SaaS</option>
                  <option value="Retail">Retail & E-Commerce</option>
                  <option value="Manufacturing">
                    Manufacturing & Supply Chain
                  </option>
                  <option value="Energy">Energy & Utilities</option>
                  <option value="Professional Services">
                    Professional Services
                  </option>
                  <option value="Other">Other Commercial Enterprise</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Underlying Policy Number *
                </label>
                <input
                  type="text"
                  name="primary_policy_number"
                  value={formData.primary_policy_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                    errors.primary_policy_number
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-slate-300"
                  }`}
                  placeholder="e.g. POL-CYB-2026-9812"
                />
                {errors.primary_policy_number && (
                  <span className="text-[11px] text-rose-600 mt-0.5 block">
                    {errors.primary_policy_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Coverage Parameters & Attachment */}
          <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#66738A] flex items-center gap-2 pb-2 border-b border-[#E3E8F0]">
              <DollarSign className="w-4 h-4 text-[#2461F5]" />
              2. Coverage Limits, Attachment & Term
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reinsurance Policy Limit (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    name="policy_limit_usd"
                    value={formData.policy_limit_usd}
                    onChange={handleChange}
                    step="500000"
                    min="100000"
                    className={`w-full pl-8 pr-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                      errors.policy_limit_usd
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.policy_limit_usd && (
                  <span className="text-[11px] text-rose-600 mt-0.5 block">
                    {errors.policy_limit_usd}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Attachment Point (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    name="attachment_point_usd"
                    value={formData.attachment_point_usd}
                    onChange={handleChange}
                    step="500000"
                    min="0"
                    className={`w-full pl-8 pr-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                      errors.attachment_point_usd
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.attachment_point_usd && (
                  <span className="text-[11px] text-rose-600 mt-0.5 block">
                    {errors.attachment_point_usd}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prior 5-Year Incurred Losses (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    name="prior_loss_amount_usd"
                    value={formData.prior_loss_amount_usd}
                    onChange={handleChange}
                    step="50000"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Effective Period (From / To) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="effective_date"
                    value={formData.effective_date}
                    onChange={handleChange}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none"
                  />
                  <input
                    type="date"
                    name="expiration_date"
                    value={formData.expiration_date}
                    onChange={handleChange}
                    className={`w-full px-2 py-2 text-xs rounded-lg border focus:outline-none ${
                      errors.expiration_date
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.expiration_date && (
                  <span className="text-[11px] text-rose-600 mt-0.5 block">
                    {errors.expiration_date}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Risk Documentation & Mandatory Attachments */}
          <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E8F0]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#66738A] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#2461F5]" />
                3. Mandatory Risk Documentation
              </h3>
              <span className="text-[11px] text-slate-500">
                Rule engine flags missing mandatory documents
              </span>
            </div>

            <div className="space-y-3">
              {formData.risk_category === "CYBER" ? (
                <div
                  onClick={() => handleDocToggle("cyber_questionnaire")}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    documents.cyber_questionnaire
                      ? "bg-emerald-50/60 border-emerald-300"
                      : "bg-amber-50/60 border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={documents.cyber_questionnaire}
                      onChange={() => {}}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Cyber Risk Assessment Questionnaire (Mandatory)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Network posture, MFA enforcement, and ransomware
                        contingency plan
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      documents.cyber_questionnaire ? "success" : "warning"
                    }
                  >
                    {documents.cyber_questionnaire
                      ? "Attached"
                      : "Missing Flag"}
                  </Badge>
                </div>
              ) : (
                <div
                  onClick={() => handleDocToggle("financial_statements")}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    documents.financial_statements
                      ? "bg-emerald-50/60 border-emerald-300"
                      : "bg-amber-50/60 border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={documents.financial_statements}
                      onChange={() => {}}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Audited Financials & Board Disclosures (Mandatory for
                        D&O)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        SEC 10-K / 10-Q filings, capitalization table, and
                        corporate governance audit
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      documents.financial_statements ? "success" : "warning"
                    }
                  >
                    {documents.financial_statements
                      ? "Attached"
                      : "Missing Flag"}
                  </Badge>
                </div>
              )}

              <div
                onClick={() => handleDocToggle("loss_runs")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  documents.loss_runs
                    ? "bg-emerald-50/60 border-emerald-300"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={documents.loss_runs}
                    onChange={() => {}}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      5-Year Incurred Loss Runs
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Historical loss runs certified by ceding carrier actuary
                    </div>
                  </div>
                </div>
                <Badge variant={documents.loss_runs ? "success" : "default"}>
                  {documents.loss_runs ? "Attached" : "Optional"}
                </Badge>
              </div>

              <div
                onClick={() => handleDocToggle("policy_copy")}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  documents.policy_copy
                    ? "bg-emerald-50/60 border-emerald-300"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={documents.policy_copy}
                    onChange={() => {}}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Primary Policy Schedule & Specimen Form
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Full primary underlying terms, endorsements, and exclusion
                      list
                    </div>
                  </div>
                </div>
                <Badge variant={documents.policy_copy ? "success" : "default"}>
                  {documents.policy_copy ? "Attached" : "Optional"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Scoring Preview & Action */}
        <div className="space-y-6">
          <RiskScoringPreview
            riskCategory={formData.risk_category}
            policyLimitUsd={formData.policy_limit_usd}
            attachmentPointUsd={formData.attachment_point_usd}
            carrierRating={formData.carrier_rating}
            industrySector={formData.industry_sector}
            priorLossAmountUsd={formData.prior_loss_amount_usd}
          />

          <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#66738A]">
              Submit for Underwriting Review
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upon submission, this facultative request will enter the
              underwriter queue, calculate binding risk weights, and evaluate
              missing documents against underwriting completeness rules.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full font-bold shadow-md"
            >
              Submit Facultative Request
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

CarrierSubmissionForm.propTypes = {
  onSuccess: PropTypes.func,
};

export default CarrierSubmissionForm;
