import React, { useState } from "react";
import {
  Shield,
  Users,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  DollarSign,
  Calendar,
  Building2,
} from "lucide-react";
import api from "../services/api";

export default function CarrierIntakeForm({ onSubmissionSuccess }) {
  const [riskType, setRiskType] = useState("CYBER");
  const [insuredName, setInsuredName] = useState("Apex Global Financial Corp");
  const [industrySector, setIndustrySector] = useState("Financial Services");
  const [annualRevenue, setAnnualRevenue] = useState(85000000);
  const [primaryPolicyLimit, setPrimaryPolicyLimit] = useState(10000000);
  const [requestedReinsuranceLimit, setRequestedReinsuranceLimit] =
    useState(5000000);
  const [attachmentPoint, setAttachmentPoint] = useState(5000000);
  const [policyEffectiveDate, setPolicyEffectiveDate] = useState("2026-06-01");
  const [policyExpirationDate, setPolicyExpirationDate] =
    useState("2027-06-01");

  // Cyber Risk Profile
  const [cyberProfile, setCyberProfile] = useState({
    mfa_implemented: true,
    edr_deployed: true,
    cloud_backup_frequency: "DAILY",
    prior_cyber_incidents_3yr: 0,
    has_incident_response_plan: true,
    third_party_vendor_audit: true,
  });

  // D&O Risk Profile
  const [dAndOProfile, setDAndOProfile] = useState({
    regulatory_investigation_pending: false,
    financial_restatement_3yr: false,
    merger_acquisition_planned: false,
    board_independent_majority: true,
    shareholder_litigation_history: false,
  });

  // Document Uploads State
  const [documents, setDocuments] = useState([
    {
      document_type: "3_YEAR_LOSS_RUNS",
      file_name: "Apex_Loss_Runs_2023_2025.pdf",
      uploaded: true,
    },
    {
      document_type: "SECURITY_AUDIT_REPORT",
      file_name: "SOC2_Type_II_Audit_2025.pdf",
      uploaded: true,
    },
    {
      document_type: "POLICY_SCHEDULE_WORDING",
      file_name: "Primary_Policy_Specimen_Cyber.pdf",
      uploaded: false,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [createdSubmission, setCreatedSubmission] = useState(null);

  const handleDocumentToggle = (docType) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.document_type === docType) {
          return { ...doc, uploaded: !doc.uploaded };
        }
        return doc;
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const activeRiskProfile =
        riskType === "CYBER" ? cyberProfile : dAndOProfile;
      const uploadedDocs = documents.map((d) => ({
        document_type: d.document_type,
        file_name: d.file_name,
        status: d.uploaded ? "UPLOADED" : "PENDING",
      }));

      const payload = {
        risk_type: riskType,
        insured_name: insuredName,
        industry_sector: industrySector,
        annual_revenue: Number(annualRevenue),
        primary_policy_limit: Number(primaryPolicyLimit),
        requested_reinsurance_limit: Number(requestedReinsuranceLimit),
        attachment_point: Number(attachmentPoint),
        policy_effective_date: policyEffectiveDate,
        policy_expiration_date: policyExpirationDate,
        risk_profile: activeRiskProfile,
        documents: uploadedDocs,
      };

      const result = await api.createSubmission(payload);
      setCreatedSubmission(result);
      if (onSubmissionSuccess) {
        onSubmissionSuccess(result);
      }
    } catch (err) {
      console.error("Submission intake failed:", err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit reinsurance request.";
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdSubmission) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Facultative Reinsurance Submission Received
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Your request has been ingested by the underwriting engine. Initial
          automated risk scoring and missing data checks have been initiated.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-left mb-6 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tracking Reference ID:</span>
            <span className="font-mono font-bold text-blue-700">
              {createdSubmission.tracking_number ||
                createdSubmission.id ||
                "FAC-2026-CY-0012"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Insured Entity:</span>
            <span className="font-semibold text-slate-800">
              {createdSubmission.insured_name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Risk Type:</span>
            <span className="font-semibold text-slate-800">
              {createdSubmission.risk_type}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Requested Capacity:</span>
            <span className="font-semibold text-slate-800">
              $
              {Number(
                createdSubmission.requested_reinsurance_limit ||
                  requestedReinsuranceLimit,
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Current Status:</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">
              {createdSubmission.status || "PENDING_REVIEW"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setCreatedSubmission(null)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Submit Another Risk
          </button>
          <a
            href={`/submissions/${createdSubmission.id || "new"}`}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition"
          >
            View in Underwriter Workspace
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="pb-6 border-b border-slate-100 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Facultative Reinsurance Placement Intake
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Primary carriers submit single-risk Cyber or Directors & Officers
          (D&O) facultative reinsurance placement requests for automated
          underwriting triage.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">
              Submission Validation Error
            </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Risk Type Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            1. Select Line of Business Risk Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setRiskType("CYBER")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                riskType === "CYBER"
                  ? "border-blue-600 bg-blue-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div
                className={`p-2.5 rounded-lg ${riskType === "CYBER" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cyber Risk</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  First & third party cyber liability, ransomware extortion,
                  cloud outages, and privacy data breach exposure.
                </p>
              </div>
            </div>

            <div
              onClick={() => setRiskType("D_AND_O")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                riskType === "D_AND_O"
                  ? "border-blue-600 bg-blue-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div
                className={`p-2.5 rounded-lg ${riskType === "D_AND_O" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Directors & Officers (D&O)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Executive liability, securities class actions, regulatory
                  investigations, and corporate governance breaches.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Insured & Policy Specifics */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            2. Policy Exposure & Financial Parameters
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Insured Entity Full Legal Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={insuredName}
                  onChange={(e) => setInsuredName(e.target.value)}
                  required
                  placeholder="e.g., Apex Global Financial Corp"
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Industry Sector
              </label>
              <select
                value={industrySector}
                onChange={(e) => setIndustrySector(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Financial Services">
                  Financial Services / Banking
                </option>
                <option value="Healthcare & Life Sciences">
                  Healthcare & Life Sciences
                </option>
                <option value="Technology & SaaS">Technology & SaaS</option>
                <option value="Energy & Utilities">Energy & Utilities</option>
                <option value="Manufacturing & Industrial">
                  Manufacturing & Industrial
                </option>
                <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                <option value="Telecommunications">Telecommunications</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Insured Annual Revenue ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  required
                  min="100000"
                  step="100000"
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Primary Policy Limit ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={primaryPolicyLimit}
                  onChange={(e) => setPrimaryPolicyLimit(e.target.value)}
                  required
                  min="100000"
                  step="100000"
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Requested Facultative Reinsurance Capacity ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={requestedReinsuranceLimit}
                  onChange={(e) => setRequestedReinsuranceLimit(e.target.value)}
                  required
                  min="100000"
                  step="100000"
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Attachment Point / Retention ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={attachmentPoint}
                  onChange={(e) => setAttachmentPoint(e.target.value)}
                  required
                  min="100000"
                  step="100000"
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Policy Effective Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={policyEffectiveDate}
                  onChange={(e) => setPolicyEffectiveDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Policy Expiration Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={policyExpirationDate}
                  onChange={(e) => setPolicyExpirationDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Domain-Specific Risk Profile */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            3.{" "}
            {riskType === "CYBER"
              ? "Cybersecurity Posture & Controls"
              : "Corporate Governance & D&O Disclosures"}
          </label>

          {riskType === "CYBER" ? (
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cyberProfile.mfa_implemented}
                    onChange={(e) =>
                      setCyberProfile({
                        ...cyberProfile,
                        mfa_implemented: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      MFA Enforced Across All Access Points
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mandatory multi-factor authentication for email & VPN
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cyberProfile.edr_deployed}
                    onChange={(e) =>
                      setCyberProfile({
                        ...cyberProfile,
                        edr_deployed: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Endpoint Detection & Response (EDR)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      24/7 active telemetry and automated isolation
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cyberProfile.has_incident_response_plan}
                    onChange={(e) =>
                      setCyberProfile({
                        ...cyberProfile,
                        has_incident_response_plan: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Tested Incident Response Plan
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Retained forensic response firm & tabletop tested
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cyberProfile.third_party_vendor_audit}
                    onChange={(e) =>
                      setCyberProfile({
                        ...cyberProfile,
                        third_party_vendor_audit: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Supply Chain / Vendor Risk Program
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Annual tier-1 vendor audits & contractual warranties
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Immutable Cloud Backup Frequency
                  </label>
                  <select
                    value={cyberProfile.cloud_backup_frequency}
                    onChange={(e) =>
                      setCyberProfile({
                        ...cyberProfile,
                        cloud_backup_frequency: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 bg-white"
                  >
                    <option value="REALTIME">
                      Continuous / Real-Time Replication
                    </option>
                    <option value="DAILY">
                      Daily Air-Gapped / Immutable Backups
                    </option>
                    <option value="WEEKLY">Weekly Backups</option>
                    <option value="MONTHLY">Monthly Backups</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Prior Cyber Incidents (Past 3 Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={cyberProfile.prior_cyber_incidents_3yr}
                    onChange={(e) =>
                      setCyberProfile({
                        ...cyberProfile,
                        prior_cyber_incidents_3yr: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dAndOProfile.board_independent_majority}
                    onChange={(e) =>
                      setDAndOProfile({
                        ...dAndOProfile,
                        board_independent_majority: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Independent Board Majority
                    </span>
                    <span className="text-[11px] text-slate-500">
                      &gt;50% non-executive independent directors
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dAndOProfile.regulatory_investigation_pending}
                    onChange={(e) =>
                      setDAndOProfile({
                        ...dAndOProfile,
                        regulatory_investigation_pending: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Active Regulatory Inquiries / Subpoenas
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pending SEC, DOJ, or FTC formal inquiries
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dAndOProfile.financial_restatement_3yr}
                    onChange={(e) =>
                      setDAndOProfile({
                        ...dAndOProfile,
                        financial_restatement_3yr: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Material Financial Restatement (3 Yrs)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Prior audited financial statements revised
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dAndOProfile.merger_acquisition_planned}
                    onChange={(e) =>
                      setDAndOProfile({
                        ...dAndOProfile,
                        merger_acquisition_planned: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      M&A Activity Contemplated (&lt;12 Mos)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Planned material spin-off or acquisition
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Documentation Attachments Checklist */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            4. Underwriting Documentation Checklist
          </label>
          <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200 divide-y divide-slate-200">
            {documents.map((doc) => (
              <div
                key={doc.document_type}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText
                    className={`w-5 h-5 ${doc.uploaded ? "text-emerald-600" : "text-slate-400"}`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {doc.document_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {doc.file_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      doc.uploaded
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {doc.uploaded ? "Attached" : "Missing"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDocumentToggle(doc.document_type)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    {doc.uploaded ? "Detach" : "Attach File"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            {isSubmitting
              ? "Transmitting & Scoring Submission..."
              : "Submit Facultative Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
