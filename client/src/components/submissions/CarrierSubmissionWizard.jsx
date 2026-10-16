import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Building,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Layers,
  Check,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import AttachmentUploader from "./AttachmentUploader";
import api from "../../services/api";

export function CarrierSubmissionWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Carrier & General Policy Info
    carrier_name: "Aegis Specialty Mutual",
    contact_email: "underwriting-ops@aegisspecialty.com",
    contact_phone: "+1 (555) 234-5678",
    primary_policy_number: "POL-CYB-2026-9081",
    effective_date: new Date().toISOString().split("T")[0],
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],

    // Step 2: Risk Selection & Placement Structure
    risk_type: "Cyber", // 'Cyber' | 'D&O'
    insured_name: "Apex Horizon Technologies Inc.",
    industry_sector: "Technology & Cloud SaaS",
    annual_revenue: "120000000",
    employee_count: "850",
    limit_requested: "10000000",
    attachment_point: "5000000",
    retention: "250000",

    // Step 3: Risk Profile & Underwriting Parameters
    // Cyber parameters
    has_mfa_everywhere: true,
    cloud_provider: "AWS / Multi-Cloud",
    endpoint_detection_deployed: true,
    prior_cyber_breaches_count: "0",
    backup_isolation_verified: true,

    // D&O parameters
    is_publicly_traded: false,
    has_active_litigation: false,
    independent_board_majority: true,
    prior_do_claims_count: "0",

    // Step 4: Attachments
    attachments: [
      {
        id: "init-1",
        document_type: "security_audit",
        document_type_label: "Third-Party Security Audit / Pen Test",
        file_name: "SOC2_TypeII_ApexHorizon_2025.pdf",
        file_size: "3.4 MB",
      },
    ],
  });

  const steps = [
    { number: 1, title: "Carrier & Policy Info", icon: Building },
    { number: 2, title: "Risk & Limits", icon: Shield },
    { number: 3, title: "Underwriting Profile", icon: Layers },
    { number: 4, title: "Documents & Verification", icon: FileText },
  ];

  const handleNext = () => {
    setErrorMsg("");
    // Validation per step
    if (currentStep === 1) {
      if (
        !formData.carrier_name ||
        !formData.effective_date ||
        !formData.expiry_date
      ) {
        setErrorMsg("Please complete all required carrier and policy dates.");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.insured_name) {
        setErrorMsg("Insured entity name is required.");
        return;
      }
      if (!formData.limit_requested || Number(formData.limit_requested) <= 0) {
        setErrorMsg("Requested facultative limit must be greater than $0.");
        return;
      }
      if (
        formData.attachment_point === "" ||
        Number(formData.attachment_point) < 0
      ) {
        setErrorMsg("Attachment point is required.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.limit_requested || !formData.effective_date) {
      setErrorMsg(
        "Mandatory submission fields (Requested Limit, Effective Date) are missing.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        carrier_name: formData.carrier_name,
        contact_email: formData.contact_email,
        risk_type: formData.risk_type,
        insured_name: formData.insured_name,
        industry_sector: formData.industry_sector,
        limit_requested: Number(formData.limit_requested),
        attachment_point: Number(formData.attachment_point || 0),
        retention: Number(formData.retention || 0),
        effective_date: formData.effective_date,
        expiry_date: formData.expiry_date,
        risk_profile_data: {
          annual_revenue: Number(formData.annual_revenue || 0),
          employee_count: Number(formData.employee_count || 0),
          ...(formData.risk_type === "Cyber"
            ? {
                has_mfa_everywhere: formData.has_mfa_everywhere,
                cloud_provider: formData.cloud_provider,
                endpoint_detection_deployed:
                  formData.endpoint_detection_deployed,
                prior_cyber_breaches_count: Number(
                  formData.prior_cyber_breaches_count,
                ),
                backup_isolation_verified: formData.backup_isolation_verified,
              }
            : {
                is_publicly_traded: formData.is_publicly_traded,
                has_active_litigation: formData.has_active_litigation,
                independent_board_majority: formData.independent_board_majority,
                prior_do_claims_count: Number(formData.prior_do_claims_count),
              }),
        },
        attachments: formData.attachments.map((a) => ({
          document_type: a.document_type,
          file_name: a.file_name,
          file_size: a.file_size,
        })),
      };

      const res = await api.createSubmission(payload);
      setSubmittedData(res);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail ||
          err.message ||
          "Submission failed. Please check network connection.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedData) {
    const subId =
      submittedData.id || submittedData.submission_id || "SUB-CREATED";
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-2xl mx-auto shadow-sm my-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Facultative Request Submitted
        </h2>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
          Your facultative reinsurance request has been ingested by the
          underwriting engine. Risk scoring and automated checklist rules have
          been evaluated.
        </p>

        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Submission ID:</span>
            <span className="font-mono font-bold text-slate-900">{subId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Insured Entity:</span>
            <span className="font-semibold text-slate-900">
              {formData.insured_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Risk Class:</span>
            <span className="font-semibold text-slate-900">
              {formData.risk_type} Risk
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Limit Requested:</span>
            <span className="font-semibold text-slate-900">
              ${Number(formData.limit_requested).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/")}>
            View Underwriting Queue
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/submissions/${subId}`)}
          >
            Open Submission Detail
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      {/* Wizard Header */}
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight">
            Facultative Reinsurance Placement Request
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Carrier intake portal for Cyber & D&O lines of business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={formData.risk_type === "Cyber" ? "cyber" : "do"}
            size="lg"
          >
            {formData.risk_type} Risk Line
          </Badge>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            return (
              <div
                key={step.number}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${
                  isCurrent
                    ? "bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold"
                    : isDone
                      ? "text-emerald-700 font-medium"
                      : "text-slate-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isCurrent
                      ? "bg-indigo-600 text-white"
                      : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.number}
                </div>
                <span className="truncate hidden sm:inline">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="m-6 mb-0 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              1. Submitting Carrier & Policy Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ceding Carrier Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.carrier_name}
                  onChange={(e) =>
                    setFormData({ ...formData, carrier_name: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Carrier Contact Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Policy Number
                </label>
                <input
                  type="text"
                  value={formData.primary_policy_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primary_policy_number: e.target.value,
                    })
                  }
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Carrier Phone
                </label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_phone: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Effective Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.effective_date}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_date: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiry_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              2. Risk Class & Financial Placement Terms
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, risk_type: "Cyber" })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  formData.risk_type === "Cyber"
                    ? "border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Cyber Risk Facultative
                  </span>
                  <Badge variant="cyber" size="sm">
                    Cyber
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ransomware, data breaches, business interruption, and network
                  security liability.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, risk_type: "D&O" })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  formData.risk_type === "D&O"
                    ? "border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Directors & Officers (D&O)
                  </span>
                  <Badge variant="do" size="sm">
                    D&O
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Management liability, regulatory scrutiny, fiduciary
                  litigation, and securities claims.
                </p>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Insured Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.insured_name}
                  onChange={(e) =>
                    setFormData({ ...formData, insured_name: e.target.value })
                  }
                  placeholder="e.g. Apex Horizon Technologies Inc."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry Sector <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.industry_sector}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      industry_sector: e.target.value,
                    })
                  }
                  placeholder="e.g. Financial Services, Healthcare, SaaS"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Requested Fac Limit ($){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.limit_requested}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limit_requested: e.target.value,
                    })
                  }
                  placeholder="e.g. 10000000"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attachment Point ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.attachment_point}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attachment_point: e.target.value,
                    })
                  }
                  placeholder="e.g. 5000000"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Self-Insured Retention ($)
                </label>
                <input
                  type="number"
                  value={formData.retention}
                  onChange={(e) =>
                    setFormData({ ...formData, retention: e.target.value })
                  }
                  placeholder="e.g. 250000"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Insured Revenue ($)
                </label>
                <input
                  type="number"
                  value={formData.annual_revenue}
                  onChange={(e) =>
                    setFormData({ ...formData, annual_revenue: e.target.value })
                  }
                  placeholder="e.g. 120000000"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              3. {formData.risk_type} Specific Underwriting Parameters
            </h3>

            {formData.risk_type === "Cyber" ? (
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_mfa_everywhere}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        has_mfa_everywhere: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Multi-Factor Authentication (MFA) Enforced
                      Organization-wide
                    </span>
                    <p className="text-[11px] text-slate-500">
                      MFA active for all remote, admin, and email access.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.endpoint_detection_deployed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endpoint_detection_deployed: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      24/7 EDR (Endpoint Detection & Response) Active
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Continuous telemetry monitoring and SOC response.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.backup_isolation_verified}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        backup_isolation_verified: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Immutable & Air-gapped Offline Backups
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Ransomware-resilient backup storage validated.
                    </p>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cloud Environment
                    </label>
                    <input
                      type="text"
                      value={formData.cloud_provider}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cloud_provider: e.target.value,
                        })
                      }
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Prior Breaches (Last 3 Years)
                    </label>
                    <input
                      type="number"
                      value={formData.prior_cyber_breaches_count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prior_cyber_breaches_count: e.target.value,
                        })
                      }
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.independent_board_majority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        independent_board_majority: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Independent Board Majority & Audit Committee Charter
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Corporate governance aligns with standard fiduciary codes.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_publicly_traded}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_publicly_traded: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Publicly Traded Entity
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Subject to SEC / securities regulatory disclosures.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_active_litigation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        has_active_litigation: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Active Shareholder / Regulatory Litigation
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Any ongoing derivative suits or investigation notices.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              4. Document Checklist & Attachment Ingestion
            </h3>
            <AttachmentUploader
              files={formData.attachments}
              onFilesChange={(newFiles) =>
                setFormData({ ...formData, attachments: newFiles })
              }
              riskType={formData.risk_type}
            />

            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Pre-submission Summary
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                <div>
                  Insured:{" "}
                  <strong className="text-slate-900">
                    {formData.insured_name}
                  </strong>
                </div>
                <div>
                  Risk Line:{" "}
                  <strong className="text-slate-900">
                    {formData.risk_type}
                  </strong>
                </div>
                <div>
                  Limit:{" "}
                  <strong className="text-slate-900">
                    ${Number(formData.limit_requested || 0).toLocaleString()}
                  </strong>
                </div>
                <div>
                  Attachment:{" "}
                  <strong className="text-slate-900">
                    ${Number(formData.attachment_point || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Nav */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={handlePrev}
              disabled={isSubmitting}
            >
              Previous
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting
                ? "Transmitting Request..."
                : "Submit Facultative Request"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CarrierSubmissionWizard;
