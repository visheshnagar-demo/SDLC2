import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useSubmissions } from "../../context/SubmissionContext";
import DocumentUploadVault from "./DocumentUploadVault";
import {
  Shield,
  AlertTriangle,
  Send,
  CheckCircle2,
  Info,
  Building,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";

const LOB_OPTIONS = [
  "Cyber Risk",
  "D&O",
  "E&O",
  "EPLI",
  "Medical Professional Liability",
];

const REVENUE_BANDS = ["< $10M", "$10M - $50M", "$50M - $250M", "> $250M"];

const JURISDICTIONS = [
  "US - California",
  "US - New York",
  "US - Illinois",
  "US - Texas",
  "US - Massachusetts",
  "US - Nationwide",
  "United Kingdom / London Market",
  "Bermuda",
  "European Union",
];

export default function SubmissionForm() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { refreshSubmissions } = useSubmissions();

  const [formData, setFormData] = useState({
    cedingCompanyName: currentUser.organization || "Travelers Insurance Co.",
    insuredName: "",
    lineOfBusiness: "Cyber Risk",
    policyLimit: "10000000",
    attachmentPoint: "5000000",
    retention: "500000",
    grossPremium: "150000",
    effectiveDate: "2026-06-01",
    expiryDate: "2027-06-01",
    industry: "Technology / Software & Cloud Services",
    revenueBand: "$50M - $250M",
    jurisdiction: "US - California",
    riskAttributes: {
      mfaEnforced: true,
      edrDeployed: true,
      immutableBackups: true,
      securityTraining: true,
    },
  });

  const [uploadedDocs, setUploadedDocs] = useState([
    {
      id: "init-1",
      name: "cyber_security_application_2026.pdf",
      size: "2.8 MB",
      type: "Application",
      uploadedAt: new Date().toISOString(),
      verified: true,
    },
    {
      id: "init-2",
      name: "claims_history_loss_runs.xlsx",
      size: "1.4 MB",
      type: "Loss Runs",
      uploadedAt: new Date().toISOString(),
      verified: true,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [successBanner, setSuccessBanner] = useState(null);

  const limitNum = Number(formData.policyLimit) || 0;
  const attachNum = Number(formData.attachmentPoint) || 0;
  const isOverAuthority = limitNum > 5000000;
  const isLimitInvalid = limitNum > 0 && attachNum > 0 && limitNum <= attachNum;
  const isDateInvalid =
    formData.effectiveDate &&
    formData.expiryDate &&
    formData.effectiveDate >= formData.expiryDate;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorBanner("");
  };

  const handleRiskAttributeChange = (attr, val) => {
    setFormData((prev) => ({
      ...prev,
      riskAttributes: {
        ...prev.riskAttributes,
        [attr]: val,
      },
    }));
  };

  const handleUploadDoc = (newDoc) => {
    setUploadedDocs((prev) => [...prev, newDoc]);
  };

  const handleDeleteDoc = (docId) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner("");

    // Field validation checks
    if (!formData.insuredName.trim()) {
      setErrorBanner("Insured Name is required.");
      return;
    }
    if (isLimitInvalid) {
      setErrorBanner(
        "Validation Error: Policy Limit must strictly exceed the Attachment Point.",
      );
      return;
    }
    if (isDateInvalid) {
      setErrorBanner(
        "Validation Error: Expiry Date must be after Effective Date.",
      );
      return;
    }
    if (limitNum <= 0 || Number(formData.grossPremium) <= 0) {
      setErrorBanner(
        "Policy Limit and Gross Premium must be positive numerical amounts.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        documents: uploadedDocs,
      };
      const created = await api.createSubmission(payload);
      await refreshSubmissions();
      setSuccessBanner(created);
      setTimeout(() => {
        navigate(`/submissions/${created.id}`);
      }, 1200);
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorBanner(
        "Failed to submit facultative risk. Please check inputs and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            <span>Facultative Reinsurance Submission Intake</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Submit specialty risk parameters, configure risk controls, and
            upload required underwriting files.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 text-blue-900 px-3.5 py-1.5 rounded-lg border border-blue-200 text-xs">
          <Building className="w-4 h-4 text-primary" />
          <span>
            Cedent: <strong>{formData.cedingCompanyName}</strong>
          </span>
        </div>
      </div>

      {/* Validation Banners */}
      {errorBanner && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-800 text-sm">
              Submission Validation Failed
            </div>
            <div className="text-xs text-red-700 mt-0.5">{errorBanner}</div>
          </div>
        </div>
      )}

      {successBanner && (
        <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-start gap-3 shadow-xs animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-emerald-800 text-sm">
              Submission Successfully Ingested!
            </div>
            <div className="text-xs text-emerald-700 mt-0.5">
              Assigned ID: {successBanner.submissionNumber} • Initial Score:{" "}
              {successBanner.riskScore}/100. Redirecting to Underwriting
              Detail...
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left Form: Metadata & Risk Attributes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Risk Metadata Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-primary" />
              <span>Policy & Insured Metadata</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ceding Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cedingCompanyName}
                  onChange={(e) =>
                    handleInputChange("cedingCompanyName", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Travelers Insurance Co."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Insured Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.insuredName}
                  onChange={(e) =>
                    handleInputChange("insuredName", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Apex Cybernetics Corp"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Line of Business *
                </label>
                <select
                  value={formData.lineOfBusiness}
                  onChange={(e) =>
                    handleInputChange("lineOfBusiness", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                >
                  {LOB_OPTIONS.map((lob) => (
                    <option key={lob} value={lob}>
                      {lob}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry Classification
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) =>
                    handleInputChange("industry", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Cloud & AI Technology"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Revenue Band
                </label>
                <select
                  value={formData.revenueBand}
                  onChange={(e) =>
                    handleInputChange("revenueBand", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                >
                  {REVENUE_BANDS.map((band) => (
                    <option key={band} value={band}>
                      {band}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Jurisdiction
                </label>
                <select
                  value={formData.jurisdiction}
                  onChange={(e) =>
                    handleInputChange("jurisdiction", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                >
                  {JURISDICTIONS.map((jur) => (
                    <option key={jur} value={jur}>
                      {jur}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Financials & Limits Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Financial & Coverage Structure</span>
              </div>
              {isOverAuthority && (
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Requires Manager Referral (&gt;$5M)
                </span>
              )}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Requested Policy Limit ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.policyLimit}
                    onChange={(e) =>
                      handleInputChange("policyLimit", e.target.value)
                    }
                    className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary ${
                      isLimitInvalid
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300"
                    }`}
                  />
                </div>
                {isLimitInvalid && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    Limit must be strictly greater than attachment point.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attachment Point ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.attachmentPoint}
                    onChange={(e) =>
                      handleInputChange("attachmentPoint", e.target.value)
                    }
                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Self-Insured Retention (SIR / Deductible) ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formData.retention}
                    onChange={(e) =>
                      handleInputChange("retention", e.target.value)
                    }
                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gross Policy Premium ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.grossPremium}
                    onChange={(e) =>
                      handleInputChange("grossPremium", e.target.value)
                    }
                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Policy Inception / Effective Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.effectiveDate}
                    onChange={(e) =>
                      handleInputChange("effectiveDate", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Policy Expiration Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) =>
                      handleInputChange("expiryDate", e.target.value)
                    }
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary ${
                      isDateInvalid
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300"
                    }`}
                  />
                </div>
                {isDateInvalid && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    Expiration date must follow effective date.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line-Specific Risk Scoring Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-primary" />
              <span>{formData.lineOfBusiness} Risk Controls Checklist</span>
            </h2>

            {formData.lineOfBusiness === "Cyber Risk" && (
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800">
                      Multi-Factor Authentication (MFA)
                    </div>
                    <div className="text-slate-500">
                      Enforced on all cloud services, VPN, and privileged admin
                      accounts (20 pts)
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.riskAttributes.mfaEnforced}
                    onChange={(e) =>
                      handleRiskAttributeChange("mfaEnforced", e.target.checked)
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800">
                      Endpoint Detection & Response (EDR / XDR)
                    </div>
                    <div className="text-slate-500">
                      Active 24/7 endpoint agent with automated isolation (15
                      pts)
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.riskAttributes.edrDeployed}
                    onChange={(e) =>
                      handleRiskAttributeChange("edrDeployed", e.target.checked)
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800">
                      Immutable / Air-Gapped Backups
                    </div>
                    <div className="text-slate-500">
                      Offline ransomware-resistant backups tested within 90 days
                      (15 pts)
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.riskAttributes.immutableBackups}
                    onChange={(e) =>
                      handleRiskAttributeChange(
                        "immutableBackups",
                        e.target.checked,
                      )
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800">
                      Monthly Phishing & Security Awareness Training
                    </div>
                    <div className="text-slate-500">
                      Regular training for all employees (20 pts)
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.riskAttributes.securityTraining}
                    onChange={(e) =>
                      handleRiskAttributeChange(
                        "securityTraining",
                        e.target.checked,
                      )
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                </label>
              </div>
            )}

            {formData.lineOfBusiness !== "Cyber Risk" && (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                Line-of-business underwriting factors configured. Rules-based
                engine will evaluate solvency, loss ratio history, and
                contractual risk transfer criteria upon submission.
              </div>
            )}
          </div>
        </div>

        {/* Right Form: Document Upload Vault & Submit Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <DocumentUploadVault
            lineOfBusiness={formData.lineOfBusiness}
            uploadedDocs={uploadedDocs}
            onUploadDoc={handleUploadDoc}
            onDeleteDoc={handleDeleteDoc}
          />

          {/* Submission Action Box */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Underwriting Authority & Handoff
            </h3>

            {isOverAuthority ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Manager Referral Required
                </div>
                <div>
                  Requested limit of{" "}
                  <strong>${limitNum.toLocaleString()}</strong> exceeds the
                  standard $5,000,000 underwriter limit. The risk will
                  automatically be routed to an Underwriting Manager for pricing
                  approval.
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Standard Authority Limit
                </div>
                <div>
                  Requested limit is within the underwriter delegated limit of
                  $5,000,000.
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || isLimitInvalid || isDateInvalid}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                submitting || isLimitInvalid || isDateInvalid
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover active:scale-[0.99]"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? "Processing Submission..."
                  : "Submit Risk for Underwriter Review"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
