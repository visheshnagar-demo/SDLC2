import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Building2,
  Layers,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import Badge from "../common/Badge";
import IntakeScannerWidget from "./IntakeScannerWidget";
import api from "../../services/api";

export default function CarrierSubmissionWizard({ onSubmissionCreated }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const [formData, setFormData] = useState({
    carrier_id: "CARRIER-TRV-01",
    carrier_name: "Travelers Insurance Group",
    insured_name: "Acme Global Enterprises Inc.",
    industry_sector: "Technology & Cloud Infrastructure",
    annual_revenue: 150000000,
    risk_type: "CYBER",
    requested_limit: 10000000,
    attachment_point: 2500000,
    policy_effective_date: "2026-11-01",
    policy_expiration_date: "2027-11-01",
    risk_parameters: {
      mfa_enforced: "yes",
      endpoint_detection: "yes",
      backup_frequency: "daily",
      past_breaches_3yr: "0",
      security_training: "annual",
      // D&O defaults
      board_experience_years: "8",
      pending_litigation: "no",
      financial_restatements: "no",
      debt_to_equity: "1.2",
      loss_history_3yr: "0",
    },
    attachments: [
      {
        id: "att-1",
        name: "SOC2_Type_II_Audit_Report.pdf",
        size: "2.4 MB",
        type: "application/pdf",
      },
      {
        id: "att-2",
        name: "2026_Penetration_Testing_Summary.pdf",
        size: "1.8 MB",
        type: "application/pdf",
      },
    ],
  });

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRiskParamChange = (param, value) => {
    setFormData((prev) => ({
      ...prev,
      risk_parameters: {
        ...prev.risk_parameters,
        [param]: value,
      },
    }));
  };

  const handleAddAttachment = (fileName) => {
    setFormData((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          id: `att-${Date.now()}`,
          name: fileName,
          size: "1.5 MB",
          type: "application/pdf",
        },
      ],
    }));
  };

  const handleRemoveAttachment = (id) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        carrier_id: formData.carrier_id,
        carrier_name: formData.carrier_name,
        insured_name: formData.insured_name,
        industry_sector: formData.industry_sector,
        annual_revenue: parseFloat(formData.annual_revenue) || 0,
        risk_type: formData.risk_type,
        requested_limit: parseFloat(formData.requested_limit) || 0,
        attachment_point: parseFloat(formData.attachment_point) || 0,
        policy_effective_date: formData.policy_effective_date,
        policy_expiration_date: formData.policy_expiration_date,
        risk_parameters: formData.risk_parameters,
      };

      const result = await api.createSubmission(payload);
      setSubmittedData(result);
      if (onSubmissionCreated) {
        onSubmissionCreated(result);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setError(
        err?.response?.data?.detail ||
          err.message ||
          "Failed to submit reinsurance request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedData) {
    return (
      <Card className="max-w-3xl mx-auto border-emerald-200">
        <div className="text-center py-8 px-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F1729]">
            Facultative Request Submitted
          </h2>
          <p className="text-sm text-[#66738A] mt-2 max-w-md mx-auto">
            Your reinsurance submission for{" "}
            <strong className="text-[#0F1729]">
              {submittedData.insured_name || formData.insured_name}
            </strong>{" "}
            has been received and processed by the Automated Risk Engine.
          </p>

          <div className="mt-8 p-6 bg-slate-50 border border-[#E3E8F0] rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-2xl mx-auto">
            <div>
              <p className="text-xs text-[#66738A]">Submission ID</p>
              <p className="text-xs font-mono font-bold text-[#0F1729] mt-1 truncate">
                {submittedData.id}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#66738A]">Risk Type</p>
              <p className="text-sm font-semibold text-[#0F1729] mt-1">
                {submittedData.risk_type}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#66738A]">Risk Score</p>
              <p className="text-base font-bold text-[#2461F5] mt-0.5">
                {submittedData.composite_score !== undefined
                  ? submittedData.composite_score
                  : (submittedData.risk_score?.score ?? "N/A")}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#66738A]">Assigned Tier</p>
              <div className="mt-1">
                <Badge
                  variant={(
                    submittedData.risk_tier ||
                    submittedData.risk_score?.tier ||
                    "medium"
                  ).toLowerCase()}
                >
                  {submittedData.risk_tier ||
                    submittedData.risk_score?.tier ||
                    "MEDIUM"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={() =>
                navigate(`/underwriting/queue?highlight=${submittedData.id}`)
              }
            >
              View in Underwriter Queue
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmittedData(null);
                setCurrentStep(1);
              }}
            >
              Submit Another Request
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Wizard Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Step Indicator */}
        <div className="bg-white border border-[#E3E8F0] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          {[
            { num: 1, title: "Carrier & Insured", icon: Building2 },
            { num: 2, title: "Policy Structure", icon: Layers },
            { num: 3, title: "Risk Parameters", icon: Shield },
            { num: 4, title: "Documents & Review", icon: FileCheck2 },
          ].map((step) => (
            <div
              key={step.num}
              onClick={() => setCurrentStep(step.num)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                currentStep === step.num
                  ? "text-[#2461F5] font-bold"
                  : currentStep > step.num
                    ? "text-emerald-600 font-medium"
                    : "text-gray-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === step.num
                    ? "bg-[#2461F5] text-white shadow-sm"
                    : currentStep > step.num
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {step.num}
              </div>
              <span className="hidden sm:inline text-xs">{step.title}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Step 1: Carrier & Insured */}
        {currentStep === 1 && (
          <Card
            title="Carrier & Insured Details"
            subtitle="Primary account and financial information for the cedant request"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Submitting Carrier
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                    value={formData.carrier_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      handleFieldChange("carrier_name", name);
                      handleFieldChange(
                        "carrier_id",
                        `CARRIER-${name.substring(0, 3).toUpperCase()}-01`,
                      );
                    }}
                  >
                    <option value="Travelers Insurance Group">
                      Travelers Insurance Group
                    </option>
                    <option value="Chubb Global Risk">Chubb Global Risk</option>
                    <option value="Zurich North America">
                      Zurich North America
                    </option>
                    <option value="AIG Specialty Markets">
                      AIG Specialty Markets
                    </option>
                    <option value="The Hartford Re">The Hartford Re</option>
                    <option value="Liberty Mutual Commercial">
                      Liberty Mutual Commercial
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Carrier Code / ID
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E3E8F0] rounded-xl text-sm text-gray-500 font-mono"
                    value={formData.carrier_id}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                  Insured Entity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Global Enterprises Inc."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                  value={formData.insured_name}
                  onChange={(e) =>
                    handleFieldChange("insured_name", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Industry Sector *
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                    value={formData.industry_sector}
                    onChange={(e) =>
                      handleFieldChange("industry_sector", e.target.value)
                    }
                  >
                    <option value="Technology & Cloud Infrastructure">
                      Technology & Cloud Infrastructure
                    </option>
                    <option value="Financial Services & Banking">
                      Financial Services & Banking
                    </option>
                    <option value="Healthcare & Life Sciences">
                      Healthcare & Life Sciences
                    </option>
                    <option value="Manufacturing & Supply Chain">
                      Manufacturing & Supply Chain
                    </option>
                    <option value="Retail & E-Commerce">
                      Retail & E-Commerce
                    </option>
                    <option value="Energy & Utilities">
                      Energy & Utilities
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Annual Revenue ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="100000"
                    placeholder="150000000"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                    value={formData.annual_revenue}
                    onChange={(e) =>
                      handleFieldChange("annual_revenue", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={() => setCurrentStep(2)} icon={ArrowRight}>
                  Next: Policy Structure
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Policy Structure */}
        {currentStep === 2 && (
          <Card
            title="Policy & Facultative Layer Structure"
            subtitle="Select line of business and requested capacity limit"
          >
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#0F1729] mb-2">
                  Facultative Risk Line *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => handleFieldChange("risk_type", "CYBER")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                      formData.risk_type === "CYBER"
                        ? "border-[#2461F5] bg-blue-50/40 text-[#2461F5]"
                        : "border-[#E3E8F0] bg-white hover:border-gray-300"
                    }`}
                  >
                    <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-[#0F1729]">
                        Cyber Risk
                      </p>
                      <p className="text-xs text-[#66738A] mt-1">
                        First & Third-party Cyber extortion, data privacy, and
                        business interruption.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleFieldChange("risk_type", "D_AND_O")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                      formData.risk_type === "D_AND_O"
                        ? "border-[#2461F5] bg-blue-50/40 text-[#2461F5]"
                        : "border-[#E3E8F0] bg-white hover:border-gray-300"
                    }`}
                  >
                    <Layers className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-[#0F1729]">
                        Directors & Officers (D&O)
                      </p>
                      <p className="text-xs text-[#66738A] mt-1">
                        Executive liability, shareholder derivative actions, and
                        securities claims.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Requested Facultative Limit ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="500000"
                    placeholder="10000000"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                    value={formData.requested_limit}
                    onChange={(e) =>
                      handleFieldChange("requested_limit", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Attachment Point / Retention ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="250000"
                    placeholder="2500000"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                    value={formData.attachment_point}
                    onChange={(e) =>
                      handleFieldChange("attachment_point", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Policy Effective Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                    value={formData.policy_effective_date}
                    onChange={(e) =>
                      handleFieldChange("policy_effective_date", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Policy Expiration Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                    value={formData.policy_expiration_date}
                    onChange={(e) =>
                      handleFieldChange(
                        "policy_expiration_date",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(1)}
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} icon={ArrowRight}>
                  Next: Risk Parameters
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Risk Parameters */}
        {currentStep === 3 && (
          <Card
            title={
              formData.risk_type === "CYBER"
                ? "Cyber Security Risk Profile"
                : "D&O Corporate Governance Profile"
            }
            subtitle="Underwriting telemetry evaluated by the automated risk scoring engine"
          >
            {formData.risk_type === "CYBER" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                      Multi-Factor Authentication (MFA) Enforcement *
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                      value={formData.risk_parameters.mfa_enforced || "yes"}
                      onChange={(e) =>
                        handleRiskParamChange("mfa_enforced", e.target.value)
                      }
                    >
                      <option value="yes">
                        100% Enforced across all endpoints & email
                      </option>
                      <option value="partial">
                        Partial (Admin only or key systems)
                      </option>
                      <option value="no">Not Enforced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                      Endpoint Detection & Response (EDR / XDR) *
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                      value={
                        formData.risk_parameters.endpoint_detection || "yes"
                      }
                      onChange={(e) =>
                        handleRiskParamChange(
                          "endpoint_detection",
                          e.target.value,
                        )
                      }
                    >
                      <option value="yes">Active 24/7 Managed SOC / EDR</option>
                      <option value="no">
                        Basic Antivirus / No Managed SOC
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                      Immutable / Offline Backup Frequency *
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                      value={
                        formData.risk_parameters.backup_frequency || "daily"
                      }
                      onChange={(e) =>
                        handleRiskParamChange(
                          "backup_frequency",
                          e.target.value,
                        )
                      }
                    >
                      <option value="daily">
                        Daily Air-Gapped / Cloud Immutable
                      </option>
                      <option value="weekly">Weekly Automated</option>
                      <option value="monthly">Monthly / Ad-hoc</option>
                      <option value="none">No Immutable Backups</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                      Past Security Breaches / Ransomware (Last 3 Years) *
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                      value={formData.risk_parameters.past_breaches_3yr || "0"}
                      onChange={(e) =>
                        handleRiskParamChange(
                          "past_breaches_3yr",
                          e.target.value,
                        )
                      }
                    >
                      <option value="0">0 Incidents</option>
                      <option value="1">
                        1 Material Incident (Remediated)
                      </option>
                      <option value="2">2+ Material Incidents</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    Employee Phishing & Cyber Training Cadence *
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                    value={
                      formData.risk_parameters.security_training || "annual"
                    }
                    onChange={(e) =>
                      handleRiskParamChange("security_training", e.target.value)
                    }
                  >
                    <option value="monthly">
                      Monthly Simulation & Testing
                    </option>
                    <option value="quarterly">Quarterly Training</option>
                    <option value="annual">Annual Mandatory Training</option>
                    <option value="none">No Formal Program</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                      Average Board Experience (Years) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                      value={
                        formData.risk_parameters.board_experience_years || "8"
                      }
                      onChange={(e) =>
                        handleRiskParamChange(
                          "board_experience_years",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                      Pending Litigation / Regulatory Inquiries *
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                      value={
                        formData.risk_parameters.pending_litigation || "no"
                      }
                      onChange={(e) =>
                        handleRiskParamChange(
                          "pending_litigation",
                          e.target.value,
                        )
                      }
                    >
                      <option value="no">None Reported</option>
                      <option value="yes">
                        Yes - Active Regulatory/Shareholder Inquiries
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                      Financial Restatements (Past 3 Years) *
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                      value={
                        formData.risk_parameters.financial_restatements || "no"
                      }
                      onChange={(e) =>
                        handleRiskParamChange(
                          "financial_restatements",
                          e.target.value,
                        )
                      }
                    >
                      <option value="no">Clean Audit / No Restatements</option>
                      <option value="yes">
                        Yes - Material Restatement Occurred
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                      Debt-to-Equity Ratio *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="1.2"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                      value={formData.risk_parameters.debt_to_equity || "1.2"}
                      onChange={(e) =>
                        handleRiskParamChange("debt_to_equity", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1729] mb-1.5">
                    3-Year D&O Historical Losses / Claims Incurred ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                    value={formData.risk_parameters.loss_history_3yr || "0"}
                    onChange={(e) =>
                      handleRiskParamChange("loss_history_3yr", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            <div className="pt-6 flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(2)}
                icon={ArrowLeft}
              >
                Back
              </Button>
              <Button onClick={() => setCurrentStep(4)} icon={ArrowRight}>
                Next: Documents & Review
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Documents & Review */}
        {currentStep === 4 && (
          <Card
            title="Documentation Attachments & Final Submission"
            subtitle="Attach required audit files and complete submission"
          >
            <div className="space-y-6">
              {/* Document Uploader */}
              <div>
                <label className="block text-xs font-semibold text-[#0F1729] mb-2">
                  Uploaded Policy & Risk Documents (
                  {formData.attachments.length})
                </label>

                <div className="space-y-2 mb-3">
                  {formData.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-slate-50 border border-[#E3E8F0] rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#2461F5]" />
                        <div>
                          <p className="text-xs font-semibold text-[#0F1729]">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-[#66738A]">
                            {file.size}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(file.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-2 border-dashed border-[#E3E8F0] rounded-xl bg-gray-50/50 flex flex-col items-center justify-center text-center">
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs font-medium text-[#0F1729]">
                    Add policy slips or risk assessment files
                  </p>
                  <p className="text-[11px] text-[#66738A] mt-0.5">
                    Supports PDF, DOCX up to 25MB
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        handleAddAttachment(
                          `Loss_History_Summary_${Date.now().toString().slice(-4)}.pdf`,
                        )
                      }
                    >
                      + Attach 3-Yr Loss Run
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        handleAddAttachment(
                          `Audited_Financials_${Date.now().toString().slice(-4)}.pdf`,
                        )
                      }
                    >
                      + Attach Financial Audit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Summary Review */}
              <div className="p-4 bg-slate-50 border border-[#E3E8F0] rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#66738A] mb-3">
                  Submission Summary
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="text-[#66738A]">Insured:</span>{" "}
                    <span className="font-semibold text-[#0F1729]">
                      {formData.insured_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#66738A]">Risk Type:</span>{" "}
                    <span className="font-semibold text-[#0F1729]">
                      {formData.risk_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#66738A]">Requested Limit:</span>{" "}
                    <span className="font-semibold text-[#0F1729]">
                      ${Number(formData.requested_limit).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#66738A]">Attachment Point:</span>{" "}
                    <span className="font-semibold text-[#0F1729]">
                      ${Number(formData.attachment_point).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-[#E3E8F0]">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(3)}
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                  icon={CheckCircle2}
                >
                  {submitting
                    ? "Submitting Request..."
                    : "Submit Reinsurance Request"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Real-time Intake Scanner Panel */}
      <div className="lg:col-span-1">
        <IntakeScannerWidget
          formData={formData}
          riskType={formData.risk_type}
        />
      </div>
    </div>
  );
}
