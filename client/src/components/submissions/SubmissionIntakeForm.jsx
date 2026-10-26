import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSubmission } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DocumentCompletenessGate from "./DocumentCompletenessGate";
import Button from "../common/Button";
import Card from "../common/Card";
import Badge from "../common/Badge";
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Building2,
  DollarSign,
  Calendar,
  FileCheck2,
  Send,
} from "lucide-react";

const LOB_OPTIONS = [
  "Cyber Risk",
  "D&O",
  "E&O",
  "EPLI",
  "Medical Professional Liability",
];

const REVENUE_BANDS = [
  "< $50M",
  "$50M - $100M",
  "$100M - $250M",
  "$250M - $500M",
  "$500M - $1B",
  "> $1B",
];

export const SubmissionIntakeForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    ceding_company:
      currentUser.organization || "Global Specialty Insurers Corp",
    insured_name: "Apex Health Systems LLC",
    line_of_business: "Cyber Risk",
    policy_limit: "10000000",
    attachment_point: "2000000",
    retention: "250000",
    gross_premium: "180000",
    effective_date: "2026-06-01",
    expiry_date: "2027-06-01",
    industry: "Healthcare & Hospital Networks",
    revenue_band: "$500M - $1B",
    jurisdiction: "United States (NY/NJ)",
    documents: [
      {
        id: "doc-01",
        name: "Cyber_Application_ApexHealth.pdf",
        type: "application",
        size_mb: "2.4",
        status: "UPLOADED",
        uploaded_at: new Date().toISOString(),
      },
      {
        id: "doc-02",
        name: "ApexHealth_3Yr_Loss_Runs.xlsx",
        type: "loss_runs",
        size_mb: "1.1",
        status: "UPLOADED",
        uploaded_at: new Date().toISOString(),
      },
      {
        id: "doc-03",
        name: "Audited_Financials_FY2025.pdf",
        type: "financials",
        size_mb: "5.8",
        status: "UPLOADED",
        uploaded_at: new Date().toISOString(),
      },
      {
        id: "doc-04",
        name: "Cyber_Controls_MFA_Survey.pdf",
        type: "cyber_controls",
        size_mb: "1.9",
        status: "UPLOADED",
        uploaded_at: new Date().toISOString(),
      },
    ],
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleUploadDocument = (doc) => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, doc],
    }));
  };

  const handleRemoveDocument = (docId) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
    }));
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.ceding_company.trim())
        errs.ceding_company = "Ceding company is required.";
      if (!formData.insured_name.trim())
        errs.insured_name = "Insured entity name is required.";
      if (!formData.line_of_business)
        errs.line_of_business = "Line of business is required.";
      if (!formData.industry.trim())
        errs.industry = "Industry classification is required.";
    } else if (step === 2) {
      const limit = Number(formData.policy_limit);
      const attachment = Number(formData.attachment_point);
      const retention = Number(formData.retention);
      const premium = Number(formData.gross_premium);

      if (isNaN(limit) || limit <= 0)
        errs.policy_limit = "Policy limit must be a positive number.";
      if (isNaN(attachment) || attachment < 0)
        errs.attachment_point = "Attachment point must be non-negative.";
      if (limit <= attachment) {
        errs.policy_limit =
          "Validation Error: Policy Limit must strictly exceed Attachment Point.";
      }
      if (isNaN(retention) || retention < 0)
        errs.retention = "Retention must be non-negative.";
      if (isNaN(premium) || premium <= 0)
        errs.gross_premium = "Gross premium must be greater than zero.";

      if (!formData.effective_date)
        errs.effective_date = "Effective date is required.";
      if (!formData.expiry_date) errs.expiry_date = "Expiry date is required.";
      if (formData.effective_date && formData.expiry_date) {
        if (
          new Date(formData.effective_date) >= new Date(formData.expiry_date)
        ) {
          errs.expiry_date =
            "Date Error: Expiry date must be after Effective date.";
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    setLoading(true);
    try {
      const newSub = await createSubmission({
        ...formData,
        actor: currentUser.email,
      });
      setSubmissionSuccess(newSub);
    } catch (err) {
      console.error("Submission intake failed:", err);
      setErrors({
        form: err.message || "Submission failed. Please check inputs.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submissionSuccess) {
    return (
      <Card className="text-center py-10 max-w-2xl mx-auto shadow-md">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Facultative Risk Submission Received
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          Your risk submission has been registered and queued for reinsurance
          underwriting review.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto mb-6 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Submission Reference:</span>
            <span className="font-mono font-bold text-slate-900">
              {submissionSuccess.submission_number}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Insured Entity:</span>
            <span className="font-semibold text-slate-900">
              {submissionSuccess.insured_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Specialty Line:</span>
            <span className="font-medium text-slate-900">
              {submissionSuccess.line_of_business}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Requested Layer:</span>
            <span className="font-mono text-slate-900">
              ${(submissionSuccess.policy_limit / 1000000).toFixed(2)}M xs $
              {(submissionSuccess.attachment_point / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <Badge variant="RECEIVED" label="RECEIVED" size="sm" />
          </div>
        </div>

        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setSubmissionSuccess(null);
              setCurrentStep(1);
            }}
          >
            Submit Another Risk
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/submissions/${submissionSuccess.id}`)}
          >
            View Underwriting Detail
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/underwriter/queue")}
          >
            Open Review Queue
          </Button>
        </div>
      </Card>
    );
  }

  const limitNumber = Number(formData.policy_limit) || 0;
  const isAuthorityEscalationNeeded = limitNumber > 5000000;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Stepper Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-sky-600" />
              Facultative Risk Submission Intake
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Submit individual specialty lines risk for facultative reinsurance
              underwriting & pricing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              Specialty LOB:
            </span>
            <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-semibold text-xs rounded-full border border-sky-200">
              {formData.line_of_business}
            </span>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-4 gap-2 pt-6">
          {[
            { num: 1, label: "Ceding & Insured" },
            { num: 2, label: "Policy & Limits" },
            { num: 3, label: "LOB Documents" },
            { num: 4, label: "Review & Submit" },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < currentStep && setCurrentStep(s.num)}
              className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${
                s.num === currentStep
                  ? "bg-sky-50 border border-sky-300 text-sky-900 font-semibold"
                  : s.num < currentStep
                    ? "bg-slate-50 text-slate-700 cursor-pointer hover:bg-slate-100"
                    : "text-slate-400 opacity-60"
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                <span
                  className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                    s.num === currentStep
                      ? "bg-sky-600 text-white"
                      : s.num < currentStep
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {s.num < currentStep ? "✓" : s.num}
                </span>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {errors.form && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Step 1: Ceding & Insured Info */}
      {currentStep === 1 && (
        <Card
          title="Step 1: Ceding Company & Insured Information"
          subtitle="Enter primary cedent identification and policyholder details."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ceding Company Insurer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ceding_company}
                onChange={(e) => handleChange("ceding_company", e.target.value)}
                placeholder="e.g. Global Specialty Insurers Corp"
                className={`w-full text-sm rounded-lg border px-3.5 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.ceding_company
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-300 focus:ring-sky-200"
                }`}
              />
              {errors.ceding_company && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.ceding_company}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Named Insured Entity <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.insured_name}
                onChange={(e) => handleChange("insured_name", e.target.value)}
                placeholder="e.g. Apex Health Systems LLC"
                className={`w-full text-sm rounded-lg border px-3.5 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.insured_name
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-300 focus:ring-sky-200"
                }`}
              />
              {errors.insured_name && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.insured_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Specialty Line of Business{" "}
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.line_of_business}
                onChange={(e) =>
                  handleChange("line_of_business", e.target.value)
                }
                className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {LOB_OPTIONS.map((lob) => (
                  <option key={lob} value={lob}>
                    {lob}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Industry Sector <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
                placeholder="e.g. Healthcare & Hospital Networks"
                className={`w-full text-sm rounded-lg border px-3.5 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.industry
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-300 focus:ring-sky-200"
                }`}
              />
              {errors.industry && (
                <p className="text-xs text-rose-600 mt-1">{errors.industry}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Insured Annual Revenue Band
              </label>
              <select
                value={formData.revenue_band}
                onChange={(e) => handleChange("revenue_band", e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {REVENUE_BANDS.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Jurisdiction / Territory
              </label>
              <input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => handleChange("jurisdiction", e.target.value)}
                placeholder="e.g. United States (NY/NJ)"
                className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
              ></input>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button variant="primary" onClick={handleNext} icon={ArrowRight}>
              Continue to Policy Bounds
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Policy Bounds & Financials */}
      {currentStep === 2 && (
        <Card
          title="Step 2: Policy Bounds, Financial Layers & Dates"
          subtitle="Define policy layer limits, attachment points, and date bounds."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Policy Limit Requested ($){" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  step="50000"
                  value={formData.policy_limit}
                  onChange={(e) => handleChange("policy_limit", e.target.value)}
                  placeholder="10000000"
                  className={`w-full text-sm rounded-lg border pl-8 pr-3.5 py-2.5 focus:outline-none focus:ring-2 ${
                    errors.policy_limit
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-slate-300 focus:ring-sky-200"
                  }`}
                />
              </div>
              {errors.policy_limit && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.policy_limit}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Attachment Point ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  step="50000"
                  value={formData.attachment_point}
                  onChange={(e) =>
                    handleChange("attachment_point", e.target.value)
                  }
                  placeholder="2000000"
                  className={`w-full text-sm rounded-lg border pl-8 pr-3.5 py-2.5 focus:outline-none focus:ring-2 ${
                    errors.attachment_point
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-slate-300 focus:ring-sky-200"
                  }`}
                />
              </div>
              {errors.attachment_point && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.attachment_point}
                </p>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                Rule: Policy Limit must exceed Attachment Point.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Retention / SIR ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  step="10000"
                  value={formData.retention}
                  onChange={(e) => handleChange("retention", e.target.value)}
                  placeholder="250000"
                  className="w-full text-sm rounded-lg border border-slate-300 pl-8 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Gross Original Policy Premium ($){" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  step="5000"
                  value={formData.gross_premium}
                  onChange={(e) =>
                    handleChange("gross_premium", e.target.value)
                  }
                  placeholder="180000"
                  className={`w-full text-sm rounded-lg border pl-8 pr-3.5 py-2.5 focus:outline-none focus:ring-2 ${
                    errors.gross_premium
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-slate-300 focus:ring-sky-200"
                  }`}
                />
              </div>
              {errors.gross_premium && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.gross_premium}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Effective Policy Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.effective_date}
                onChange={(e) => handleChange("effective_date", e.target.value)}
                className={`w-full text-sm rounded-lg border px-3.5 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.effective_date
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-300 focus:ring-sky-200"
                }`}
              />
              {errors.effective_date && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.effective_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Expiry Policy Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleChange("expiry_date", e.target.value)}
                className={`w-full text-sm rounded-lg border px-3.5 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.expiry_date
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-300 focus:ring-sky-200"
                }`}
              />
              {errors.expiry_date && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.expiry_date}
                </p>
              )}
            </div>
          </div>

          {/* Real-time Layer Summary Box */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs text-slate-700">
              <DollarSign className="w-5 h-5 text-sky-600" />
              <div>
                <span className="font-semibold">
                  Calculated Facultative Layer:{" "}
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  ${(Number(formData.policy_limit || 0) / 1000000).toFixed(2)}M
                  xs $
                  {(Number(formData.attachment_point || 0) / 1000000).toFixed(
                    2,
                  )}
                  M
                </span>
              </div>
            </div>

            {isAuthorityEscalationNeeded && (
              <div className="flex items-center space-x-2 text-xs text-amber-800 bg-amber-100/70 px-3 py-1.5 rounded-lg border border-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>
                  Limit &gt; $5.0M requires Underwriting Manager referral
                  escalation.
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handlePrev} icon={ArrowLeft}>
              Back to Ceding Info
            </Button>
            <Button variant="primary" onClick={handleNext} icon={ArrowRight}>
              Continue to LOB Documents
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: LOB Document Checklist */}
      {currentStep === 3 && (
        <Card
          title="Step 3: Specialty Line Document Completeness"
          subtitle="Upload certified loss runs, applications, and risk questionnaires for this specialty line."
        >
          <DocumentCompletenessGate
            lineOfBusiness={formData.line_of_business}
            uploadedDocuments={formData.documents}
            onUploadDocument={handleUploadDocument}
            onRemoveDocument={handleRemoveDocument}
          />

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handlePrev} icon={ArrowLeft}>
              Back to Policy Bounds
            </Button>
            <Button variant="primary" onClick={handleNext} icon={ArrowRight}>
              Proceed to Review & Submit
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && (
        <Card
          title="Step 4: Submission Review & Underwriting Dispatch"
          subtitle="Verify all parameters and financial boundaries before registering the risk."
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <h4 className="font-semibold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
                  Insured & Ceding Details
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ceding Company:</span>
                  <span className="font-medium text-slate-900">
                    {formData.ceding_company}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Insured Entity:</span>
                  <span className="font-semibold text-slate-900">
                    {formData.insured_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Line of Business:</span>
                  <span className="font-medium text-slate-900">
                    {formData.line_of_business}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Industry:</span>
                  <span className="text-slate-900">{formData.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Revenue Band:</span>
                  <span className="text-slate-900">
                    {formData.revenue_band}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Territory:</span>
                  <span className="text-slate-900">
                    {formData.jurisdiction}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <h4 className="font-semibold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
                  Financial & Layer Parameters
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Policy Limit:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${Number(formData.policy_limit).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Attachment Point:</span>
                  <span className="font-mono text-slate-900">
                    ${Number(formData.attachment_point).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Retention:</span>
                  <span className="font-mono text-slate-900">
                    ${Number(formData.retention).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Premium:</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    ${Number(formData.gross_premium).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Effective Window:</span>
                  <span className="text-slate-900">
                    {formData.effective_date} to {formData.expiry_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Documents Attached:</span>
                  <span className="font-semibold text-sky-700">
                    {formData.documents.length} files
                  </span>
                </div>
              </div>
            </div>

            {isAuthorityEscalationNeeded && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-amber-900">
                    Automatic Manager Referral Required
                  </h5>
                  <p className="mt-0.5 text-amber-800">
                    The requested layer limit of $
                    {(Number(formData.policy_limit) / 1000000).toFixed(2)}M
                    exceeds standard Tier-1 Underwriter binding authority
                    ($5.00M). A manager referral will be automatically flagged
                    in the queue.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={handlePrev} icon={ArrowLeft}>
                Back to Document Manifest
              </Button>
              <Button
                variant="success"
                onClick={handleSubmit}
                loading={loading}
                icon={Send}
                size="lg"
              >
                Submit Risk for Facultative Underwriting
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SubmissionIntakeForm;
