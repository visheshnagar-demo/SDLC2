import React, { useState } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { DocumentVault } from "./DocumentVault";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const LOB_OPTIONS = [
  {
    value: "CYBER",
    label: "Cyber Risk & Data Security",
    authorityThreshold: 5000000,
  },
  {
    value: "DO",
    label: "Directors & Officers Liability (D&O)",
    authorityThreshold: 5000000,
  },
  {
    value: "EO",
    label: "Errors & Omissions / Tech E&O",
    authorityThreshold: 5000000,
  },
  {
    value: "EPLI",
    label: "Employment Practices Liability (EPLI)",
    authorityThreshold: 5000000,
  },
  {
    value: "MED_MAL",
    label: "Medical Professional Liability (Med Mal)",
    authorityThreshold: 3000000,
  },
];

export const CEDING_COMPANIES = [
  { id: "HGIC-770", name: "Hartford General Insurance Corp" },
  { id: "TRV-401", name: "Travelers Specialty Ceding Syndicate" },
  { id: "CHUBB-902", name: "Chubb Re Intermediaries Ltd." },
  { id: "BERK-112", name: "Berkshire Global Insurance Co." },
];

export const INDUSTRIES = [
  "Healthcare & Life Sciences",
  "Financial Services & Fintech",
  "Technology & Software SaaS",
  "Energy & Critical Infrastructure",
  "Manufacturing & Logistics",
  "Retail & E-Commerce",
];

export const REVENUE_BANDS = [
  "$25M - $50M",
  "$50M - $100M",
  "$100M - $500M",
  "$500M - $1B",
  "> $1B Enterprise",
];

export const JURISDICTIONS = [
  "US - New York (NY)",
  "US - California (CA)",
  "US - Texas (TX)",
  "US - Illinois (IL)",
  "UK - Lloyd's of London",
  "Bermuda Reinsurance Market",
];

export const SubmissionIntakeForm = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    ceding_company_id: "HGIC-770",
    insured_name: "Nexus Health Systems Inc.",
    line_of_business: "CYBER",
    policy_limit: 10000000,
    attachment_point: 2000000,
    retention: 500000,
    proposed_premium: 350000,
    effective_date: "2026-11-01",
    expiry_date: "2027-11-01",
    industry: "Healthcare & Life Sciences",
    revenue_band: "$100M - $500M",
    jurisdiction: "US - New York (NY)",
    // LOB Specific parameters
    cyber_mfa_enforced: true,
    cyber_edr_deployed: true,
    cyber_backups_airgapped: true,
    prior_loss_ratio: 12.4,
    prior_claims_count: 1,
  });

  const [documents, setDocuments] = useState([
    {
      id: "doc-seed-1",
      document_type: "APPLICATION",
      file_name: "Nexus_Health_Facultative_Application_2026.pdf",
      file_size_bytes: 2450000,
      uploaded_at: "2026-10-20T14:30:00Z",
      is_mandatory: true,
    },
    {
      id: "doc-seed-2",
      document_type: "LOSS_RUNS",
      file_name: "Nexus_5Yr_Historical_Loss_Runs.xlsx",
      file_size_bytes: 1120000,
      uploaded_at: "2026-10-20T14:31:00Z",
      is_mandatory: true,
    },
    {
      id: "doc-seed-3",
      document_type: "CYBER_CONTROLS_AUDIT",
      file_name: "Nexus_SOC2_Cyber_Controls_Audit.pdf",
      file_size_bytes: 4180000,
      uploaded_at: "2026-10-20T14:32:00Z",
      is_mandatory: true,
    },
  ]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};

    if (!formData.insured_name.trim())
      errs.insured_name = "Insured legal name is required.";
    if (!formData.policy_limit || Number(formData.policy_limit) <= 0)
      errs.policy_limit = "Policy limit must be a positive number.";
    if (Number(formData.attachment_point) < 0)
      errs.attachment_point = "Attachment point cannot be negative.";

    // Mandatory Rule: Limit must be greater than Attachment point
    if (Number(formData.policy_limit) <= Number(formData.attachment_point)) {
      errs.policy_limit =
        "Policy limit must strictly exceed the attachment point.";
    }

    if (Number(formData.proposed_premium) <= 0) {
      errs.proposed_premium = "Proposed premium must be greater than 0.";
    }

    if (!formData.effective_date)
      errs.effective_date = "Effective date is required.";
    if (!formData.expiry_date) errs.expiry_date = "Expiry date is required.";

    if (formData.effective_date && formData.expiry_date) {
      if (new Date(formData.expiry_date) <= new Date(formData.effective_date)) {
        errs.expiry_date = "Expiry date must be after the effective date.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      policy_limit: Number(formData.policy_limit),
      attachment_point: Number(formData.attachment_point),
      retention: Number(formData.retention),
      proposed_premium: Number(formData.proposed_premium),
      prior_loss_ratio: Number(formData.prior_loss_ratio),
      documents,
    };

    onSubmit(payload);
  };

  const limitNum = Number(formData.policy_limit) || 0;
  const isHighLimit = limitNum > 5000000;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Overview & Identification */}
      <Card
        title="1. Submission Intake & Identification"
        subtitle="Capture ceding insurer, insured entity, line of business, and policy terms"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Ceding Insurer <span className="text-rose-500">*</span>
            </label>
            <select
              name="ceding_company_id"
              value={formData.ceding_company_id}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              required
            >
              {CEDING_COMPANIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Insured Legal Entity <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="insured_name"
              value={formData.insured_name}
              onChange={handleChange}
              placeholder="e.g. Nexus Health Systems Inc."
              className={`w-full text-sm border rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 ${
                errors.insured_name
                  ? "border-rose-500 ring-1 ring-rose-500"
                  : "border-slate-300"
              }`}
              required
            />
            {errors.insured_name && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.insured_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Specialty Line of Business{" "}
              <span className="text-rose-500">*</span>
            </label>
            <select
              name="line_of_business"
              value={formData.line_of_business}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {LOB_OPTIONS.map((lob) => (
                <option key={lob.value} value={lob.value}>
                  {lob.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Industry Sector
            </label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Annual Revenue Band
            </label>
            <select
              name="revenue_band"
              value={formData.revenue_band}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
            >
              {REVENUE_BANDS.map((rev) => (
                <option key={rev} value={rev}>
                  {rev}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Primary Jurisdiction
            </label>
            <select
              name="jurisdiction"
              value={formData.jurisdiction}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
            >
              {JURISDICTIONS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Financial Limits & Underwriting Parameters */}
      <Card
        title="2. Policy Limits & Financial Parameters"
        subtitle="Specify limit, attachment point, deductible retention, and proposed pricing"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Requested Limit ($) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                $
              </span>
              <input
                type="number"
                name="policy_limit"
                value={formData.policy_limit}
                onChange={handleChange}
                step="100000"
                className={`w-full text-sm border rounded-lg pl-7 pr-3 py-2.5 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 ${
                  errors.policy_limit
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-300"
                }`}
                required
              />
            </div>
            {errors.policy_limit && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.policy_limit}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Attachment Point ($) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                $
              </span>
              <input
                type="number"
                name="attachment_point"
                value={formData.attachment_point}
                onChange={handleChange}
                step="50000"
                className="w-full text-sm border border-slate-300 rounded-lg pl-7 pr-3 py-2.5 bg-white text-slate-800 font-semibold"
                required
              />
            </div>
            {errors.attachment_point && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.attachment_point}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Primary Retention ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                $
              </span>
              <input
                type="number"
                name="retention"
                value={formData.retention}
                onChange={handleChange}
                step="25000"
                className="w-full text-sm border border-slate-300 rounded-lg pl-7 pr-3 py-2.5 bg-white text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Proposed Premium ($) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                $
              </span>
              <input
                type="number"
                name="proposed_premium"
                value={formData.proposed_premium}
                onChange={handleChange}
                step="10000"
                className="w-full text-sm border border-slate-300 rounded-lg pl-7 pr-3 py-2.5 bg-white text-slate-800 font-semibold text-emerald-700"
                required
              />
            </div>
            {errors.proposed_premium && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.proposed_premium}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Effective Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="effective_date"
              value={formData.effective_date}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              required
            />
            {errors.effective_date && (
              <p className="text-xs text-rose-600 mt-1">
                {errors.effective_date}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Expiry Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              required
            />
            {errors.expiry_date && (
              <p className="text-xs text-rose-600 mt-1">{errors.expiry_date}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between h-full">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase block">
                  Rate on Line (ROL)
                </span>
                <span className="text-lg font-bold text-blue-700">
                  {limitNum > 0
                    ? `${((Number(formData.proposed_premium) / limitNum) * 100).toFixed(2)}%`
                    : "0.00%"}
                </span>
              </div>
              {isHighLimit && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Managerial Referral Required (&gt;$5M)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* LOB Risk Scoring Controls */}
      <Card
        title="3. Rules-Based Risk Factor Inputs"
        subtitle="Underwriting telemetry evaluated by the automated risk scoring engine"
      >
        <div className="space-y-4">
          {formData.line_of_business === "CYBER" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50/50">
                <input
                  type="checkbox"
                  name="cyber_mfa_enforced"
                  checked={formData.cyber_mfa_enforced}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Strict MFA Enforced
                  </span>
                  <span className="text-[11px] text-slate-500">
                    MFA on all email, VPN, and privileged admin sessions (+20
                    pts)
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50/50">
                <input
                  type="checkbox"
                  name="cyber_edr_deployed"
                  checked={formData.cyber_edr_deployed}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    EDR Telemetry & SOC 24/7
                  </span>
                  <span className="text-[11px] text-slate-500">
                    CrowdStrike/SentinelOne with active MDR containment (+20
                    pts)
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50/50">
                <input
                  type="checkbox"
                  name="cyber_backups_airgapped"
                  checked={formData.cyber_backups_airgapped}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Air-Gapped Immutable Backups
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Ransomware-isolated offsite backup retention tested
                    quarterly (+15 pts)
                  </span>
                </div>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                3-Year Historical Loss Ratio (%)
              </label>
              <input
                type="number"
                name="prior_loss_ratio"
                value={formData.prior_loss_ratio}
                onChange={handleChange}
                step="0.1"
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Loss ratio &lt;30% grants full positive actuarial rating
                credits.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Prior Claims / Incidents Count (Past 5 Yrs)
              </label>
              <input
                type="number"
                name="prior_claims_count"
                value={formData.prior_claims_count}
                onChange={handleChange}
                min="0"
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                0-1 claims acceptable; &gt;2 claims deducts risk score points.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Mandatory Document Vault & Completeness */}
      <Card
        title="4. Document Vault & LOB Completeness Check"
        subtitle="Upload mandatory ACORD applications, loss history, and line-specific questionnaires"
      >
        <DocumentVault
          lineOfBusiness={formData.line_of_business}
          documents={documents}
          onDocumentsChange={setDocuments}
        />
      </Card>

      {/* Submission Actions */}
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>
            Encrypted transmission compliant with SOC 2 & NAIC Facultative
            standards
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          icon={ArrowRight}
        >
          Submit Risk for Underwriting Review
        </Button>
      </div>
    </form>
  );
};

export default SubmissionIntakeForm;
