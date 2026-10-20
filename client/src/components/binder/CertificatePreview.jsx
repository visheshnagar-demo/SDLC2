import React from "react";
import {
  Award,
  ShieldCheck,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  Building2,
  Calendar,
  DollarSign,
} from "lucide-react";

export default function CertificatePreview({ binderData }) {
  const [copied, setCopied] = React.useState(false);

  const policy = binderData || {
    id: "bind-genre-na-001",
    policyReferenceId: "GENRE-2026-POL-9921",
    insuredName: "Apex Global Assurance Corp",
    lineOfBusiness: "Property Catastrophe Excess of Loss",
    effectiveDate: "2026-07-01",
    expiryDate: "2027-06-30",
    grossPremium: 4250000,
    limit: 50000000,
    attachmentPoint: 10000000,
    boundBy: "Aarchi Jain, FCAS (Lead Underwriter)",
    bindingTimestamp: "2026-05-18T14:32:00Z",
    status: "BOUND",
    documentSummary: {
      governingLaw: "State of New York, USA",
      arbitrationClause: "ARIAS U.S. Certified Rules",
      currency: "USD ($)",
      territorialScope: "United States & Territories",
      hashSha256:
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(policy.policyReferenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-slate-300 overflow-hidden relative">
      {/* Institutional Certificate Top Bar */}
      <div className="bg-primary text-white p-6 flex flex-wrap items-center justify-between gap-4 border-b-4 border-amber-500">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-2xl text-white shadow-inner border border-blue-400">
            GR
          </div>
          <div>
            <span className="text-[10px] tracking-widest font-bold uppercase text-amber-400">
              General Reinsurance Corporation &bull; Berkshire Hathaway Family
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">
              Official Reinsurance Binder Certificate
            </h2>
            <p className="text-xs text-blue-200">
              Contract of Reinsurance &bull; Evidentiary Binding Confirmation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copied" : "Copy Ref"}</span>
          </button>
        </div>
      </div>

      {/* Certificate Body */}
      <div className="p-8 space-y-6 bg-slate-50/50">
        {/* Policy Reference Badge */}
        <div className="flex flex-wrap items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Policy Reference Identification Number
            </span>
            <p className="text-lg font-mono font-extrabold text-blue-900">
              {policy.policyReferenceId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs flex items-center gap-1.5 border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              CONFIRMED & BOUND
            </span>
          </div>
        </div>

        {/* Core Treaty Summary Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-slate-50/60">
                <td className="p-3 font-semibold text-slate-500 w-1/3">
                  Reinsured / Cedent
                </td>
                <td className="p-3 font-bold text-slate-900 text-sm">
                  {policy.insuredName}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500">
                  Line of Business / Cover
                </td>
                <td className="p-3 font-semibold text-slate-800">
                  {policy.lineOfBusiness}
                </td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="p-3 font-semibold text-slate-500">
                  Treaty Period
                </td>
                <td className="p-3 font-mono text-slate-800">
                  {policy.effectiveDate} 00:01 HRS to {policy.expiryDate} 24:00
                  HRS Local Standard Time
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500">
                  Program Limit of Liability
                </td>
                <td className="p-3 font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(policy.limit)} Any One Occurrence / Aggregate
                </td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="p-3 font-semibold text-slate-500">
                  Attachment / Retention
                </td>
                <td className="p-3 font-mono font-medium text-slate-800">
                  {formatCurrency(policy.attachmentPoint)} Ultimate Net Loss
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500">
                  Agreed Gross Premium
                </td>
                <td className="p-3 font-mono font-extrabold text-emerald-800 text-base">
                  {formatCurrency(policy.grossPremium)}
                </td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="p-3 font-semibold text-slate-500">
                  Governing Law & Jurisdiction
                </td>
                <td className="p-3 text-slate-700">
                  {policy.documentSummary?.governingLaw ||
                    "State of New York, USA"}{" "}
                  &bull; ARIAS Arbitration
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cryptographic Seal & Execution Signoff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
              Cryptographic Attestation Hash (SHA-256)
            </span>
            <p className="font-mono text-[11px] text-slate-600 break-all leading-tight bg-slate-50 p-2 rounded border border-slate-200">
              {policy.documentSummary?.hashSha256 ||
                "9f83c12c4f12330a32d187997b611ec4ffd4dac0ab61a45b748f1e00c1251e4b"}
            </p>
            <p className="text-[10px] text-slate-500 pt-1">
              Binding Timestamp:{" "}
              {new Date(policy.bindingTimestamp || Date.now()).toUTCString()}
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-slate-200 flex flex-col justify-between text-xs">
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                Authorized Signatory Underwriter
              </span>
              <p className="font-bold text-slate-900 mt-1">{policy.boundBy}</p>
              <p className="text-slate-500 text-[11px]">
                General Reinsurance Corporation Underwriting Syndicate
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
              <span>Digital Underwriting Seal Verified</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
