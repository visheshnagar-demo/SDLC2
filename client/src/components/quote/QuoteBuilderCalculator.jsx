import React, { useState } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import {
  Calculator,
  CheckSquare,
  FileCheck,
  DollarSign,
  ShieldAlert,
  Award,
} from "lucide-react";

export const STANDARD_SUBJECTIVITIES = [
  {
    id: "subj-1",
    text: "War, Cyber Terrorism & State-Sponsored Attack Exclusion Clause (LMA5391)",
    checked: true,
  },
  {
    id: "subj-2",
    text: "Mandatory 24/7 Managed EDR Maintenance & SOC Telemetry Sharing",
    checked: true,
  },
  {
    id: "subj-3",
    text: "Prompt Notice of Incident Condition (<48h from confirmed breach)",
    checked: true,
  },
  {
    id: "subj-4",
    text: "30-Day Prior Written Notice of Material Underwriting Changes",
    checked: true,
  },
  {
    id: "subj-5",
    text: "Specific Prior or Pending Litigation Exclusions attached to Schedule B",
    checked: false,
  },
];

export const QuoteBuilderCalculator = ({
  submission,
  onSaveQuote,
  isLoading = false,
  readOnly = false,
}) => {
  const grossPremium = submission?.proposed_premium || 350000;
  const policyLimit = submission?.policy_limit || 10000000;

  const [sharePct, setSharePct] = useState(50);
  const [commissionPct, setCommissionPct] = useState(20);
  const [subjectivities, setSubjectivities] = useState(STANDARD_SUBJECTIVITIES);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [additionalTerms, setAdditionalTerms] = useState(
    "Facultative Certificate Subject to Reinsurer standard wording format and timely monthly bordereaux reporting.",
  );

  // Financial Waterfall Calculations
  const reinsuranceLimitOffered = (policyLimit * sharePct) / 100;
  const grossReinsurancePremium = (grossPremium * sharePct) / 100;
  const cedingCommissionAmount =
    (grossReinsurancePremium * commissionPct) / 100;
  const netReinsurancePremium =
    grossReinsurancePremium - cedingCommissionAmount;

  const toggleSubjectivity = (id) => {
    if (readOnly) return;
    setSubjectivities((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s)),
    );
  };

  const handleIssueQuote = () => {
    const quotePayload = {
      submission_id: submission?.id,
      share_offered_pct: Number(sharePct),
      ceding_commission_pct: Number(commissionPct),
      reinsurance_limit: reinsuranceLimitOffered,
      gross_reinsurance_premium: grossReinsurancePremium,
      ceding_commission_amount: cedingCommissionAmount,
      reinsurance_premium: netReinsurancePremium,
      conditions: subjectivities.filter((s) => s.checked).map((s) => s.text),
      additional_terms: additionalTerms,
      valid_until: validUntil,
    };

    onSaveQuote?.(quotePayload);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Terms & Waterfall */}
        <Card
          title="1. Facultative Terms & Pricing Waterfall"
          subtitle="Configure participation share, commission, and calculate net reinsurance premium"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Share Offered (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sharePct}
                    onChange={(e) =>
                      setSharePct(
                        Math.min(100, Math.max(1, Number(e.target.value))),
                      )
                    }
                    disabled={readOnly}
                    className="w-full text-base font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Capacity: {formatCurrency(reinsuranceLimitOffered)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Ceding Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={commissionPct}
                    onChange={(e) =>
                      setCommissionPct(
                        Math.min(50, Math.max(0, Number(e.target.value))),
                      )
                    }
                    disabled={readOnly}
                    className="w-full text-base font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Cedant allowance: {formatCurrency(cedingCommissionAmount)}
                </span>
              </div>
            </div>

            {/* Waterfall Summary Table */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Gross 100% Proposed Premium:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(grossPremium)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span>Reinsurance Gross Share ({sharePct}%):</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(grossReinsurancePremium)}
                </span>
              </div>

              <div className="flex justify-between items-center text-rose-600">
                <span>Less Ceding Commission ({commissionPct}%):</span>
                <span className="font-semibold">
                  -{formatCurrency(cedingCommissionAmount)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-sm font-extrabold text-emerald-800 block">
                    Net Reinsurance Premium
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Payable within 30 days of binding
                  </span>
                </div>
                <span className="text-xl font-extrabold text-emerald-700">
                  {formatCurrency(netReinsurancePremium)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Quote Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                disabled={readOnly}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              />
            </div>
          </div>
        </Card>

        {/* Subjectivities & Governance Checklist */}
        <Card
          title="2. Reinsurance Subjectivities & Exclusions"
          subtitle="Mandatory warranty clauses and conditions precedent to binding"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select all standard endorsement clauses and subjectivities
              required for this formal quote slip:
            </p>

            <div className="space-y-2.5">
              {subjectivities.map((subj) => (
                <label
                  key={subj.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    subj.checked
                      ? "bg-blue-50/50 border-blue-300 text-slate-900"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={subj.checked}
                    onChange={() => toggleSubjectivity(subj.id)}
                    disabled={readOnly}
                    className="mt-0.5 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="leading-snug">{subj.text}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Underwriting Conditions & Endorsements
              </label>
              <textarea
                rows={3}
                value={additionalTerms}
                onChange={(e) => setAdditionalTerms(e.target.value)}
                disabled={readOnly}
                placeholder="Specify bespoke warranty or subjectivities..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Quote Slip Issuance Bar */}
      {!readOnly && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Issue Formal Reinsurance Quote Slip
              </h4>
              <p className="text-xs text-slate-500">
                Advances workflow to <strong>QUOTED</strong> status and logs
                signed quote terms to immutable audit trail.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleIssueQuote}
            loading={isLoading}
            icon={Award}
          >
            Generate & Issue Quote
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuoteBuilderCalculator;
