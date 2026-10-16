import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import Badge from "../common/Badge";

export default function IntakeScannerWidget({ formData, riskType }) {
  // Compute missing items
  const missingItems = [];
  let completedCount = 0;
  let totalCount = 0;

  // Check general fields
  const basicFields = [
    { key: "carrier_name", label: "Carrier Name" },
    { key: "insured_name", label: "Insured Name" },
    { key: "industry_sector", label: "Industry Sector" },
    { key: "annual_revenue", label: "Annual Revenue" },
    { key: "requested_limit", label: "Requested Limit" },
    { key: "attachment_point", label: "Attachment Point" },
    { key: "policy_effective_date", label: "Policy Effective Date" },
    { key: "policy_expiration_date", label: "Policy Expiration Date" },
  ];

  basicFields.forEach((field) => {
    totalCount++;
    if (!formData[field.key] || formData[field.key] === "") {
      missingItems.push({
        field: field.label,
        type: "Required Field",
        severity: "HIGH",
      });
    } else {
      completedCount++;
    }
  });

  // Risk parameters checks
  const riskParams = formData.risk_parameters || {};
  let calculatedScore = 30; // base score

  if (riskType === "CYBER") {
    totalCount += 5;
    if (
      riskParams.mfa_enforced === undefined ||
      riskParams.mfa_enforced === ""
    ) {
      missingItems.push({
        field: "MFA Enforcement Status",
        type: "Security Parameter",
        severity: "HIGH",
      });
    } else {
      completedCount++;
      if (riskParams.mfa_enforced === "no") calculatedScore += 25;
      if (riskParams.mfa_enforced === "partial") calculatedScore += 15;
    }

    if (
      riskParams.endpoint_detection === undefined ||
      riskParams.endpoint_detection === ""
    ) {
      missingItems.push({
        field: "EDR / XDR Implementation",
        type: "Security Parameter",
        severity: "MEDIUM",
      });
    } else {
      completedCount++;
      if (riskParams.endpoint_detection === "no") calculatedScore += 20;
    }

    if (!riskParams.backup_frequency) {
      missingItems.push({
        field: "Offline Backup Frequency",
        type: "Security Parameter",
        severity: "MEDIUM",
      });
    } else {
      completedCount++;
      if (
        riskParams.backup_frequency === "monthly" ||
        riskParams.backup_frequency === "none"
      )
        calculatedScore += 15;
    }

    if (
      riskParams.past_breaches_3yr === undefined ||
      riskParams.past_breaches_3yr === ""
    ) {
      missingItems.push({
        field: "3-Year Breach History",
        type: "Loss History",
        severity: "HIGH",
      });
    } else {
      completedCount++;
      const breaches = parseInt(riskParams.past_breaches_3yr, 10) || 0;
      if (breaches > 0) calculatedScore += Math.min(breaches * 15, 30);
    }

    if (
      riskParams.security_training === undefined ||
      riskParams.security_training === ""
    ) {
      missingItems.push({
        field: "Employee Security Training",
        type: "Compliance",
        severity: "LOW",
      });
    } else {
      completedCount++;
    }

    // Attachment check
    totalCount += 1;
    if (!formData.attachments || formData.attachments.length === 0) {
      missingItems.push({
        field: "Security Audit / Pen-Test Report",
        type: "Required Document",
        severity: "HIGH",
      });
    } else {
      completedCount++;
    }
  } else {
    // D&O checks
    totalCount += 5;
    if (
      riskParams.board_experience_years === undefined ||
      riskParams.board_experience_years === ""
    ) {
      missingItems.push({
        field: "Avg Board Experience (Years)",
        type: "Governance",
        severity: "MEDIUM",
      });
    } else {
      completedCount++;
      const yrs = parseFloat(riskParams.board_experience_years) || 0;
      if (yrs < 3) calculatedScore += 15;
    }

    if (
      riskParams.pending_litigation === undefined ||
      riskParams.pending_litigation === ""
    ) {
      missingItems.push({
        field: "Pending Litigation Disclosures",
        type: "Legal Risk",
        severity: "HIGH",
      });
    } else {
      completedCount++;
      if (riskParams.pending_litigation === "yes") calculatedScore += 30;
    }

    if (
      riskParams.financial_restatements === undefined ||
      riskParams.financial_restatements === ""
    ) {
      missingItems.push({
        field: "Financial Restatements (3 Years)",
        type: "Financial Health",
        severity: "HIGH",
      });
    } else {
      completedCount++;
      if (riskParams.financial_restatements === "yes") calculatedScore += 25;
    }

    if (!riskParams.debt_to_equity) {
      missingItems.push({
        field: "Debt-to-Equity Ratio",
        type: "Financial Metric",
        severity: "MEDIUM",
      });
    } else {
      completedCount++;
      const de = parseFloat(riskParams.debt_to_equity) || 0;
      if (de > 2.5) calculatedScore += 15;
    }

    if (
      riskParams.loss_history_3yr === undefined ||
      riskParams.loss_history_3yr === ""
    ) {
      missingItems.push({
        field: "3-Year D&O Loss History",
        type: "Loss History",
        severity: "HIGH",
      });
    } else {
      completedCount++;
      const losses = parseFloat(riskParams.loss_history_3yr) || 0;
      if (losses > 0) calculatedScore += 20;
    }

    // Attachment check
    totalCount += 1;
    if (!formData.attachments || formData.attachments.length === 0) {
      missingItems.push({
        field: "Loss History Summary (3 Years)",
        type: "Required Document",
        severity: "HIGH",
      });
    } else {
      completedCount++;
    }
  }

  // Bound score
  calculatedScore = Math.min(100, Math.max(10, calculatedScore));

  let tier = "LOW";
  if (calculatedScore >= 80) tier = "CRITICAL";
  else if (calculatedScore >= 60) tier = "HIGH";
  else if (calculatedScore >= 40) tier = "MEDIUM";

  const completionPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white border border-[#E3E8F0] rounded-2xl p-6 shadow-xs sticky top-24">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E3E8F0]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2461F5]" />
          <h4 className="font-bold text-sm text-[#0F1729]">Intake Scanner</h4>
        </div>
        <span className="text-xs font-semibold text-[#66738A]">
          Real-Time Audit
        </span>
      </div>

      {/* Estimated Risk Score Widget */}
      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#66738A]">
            Estimated Risk Score
          </span>
          <Badge variant={tier.toLowerCase()}>{tier} RISK</Badge>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-extrabold text-[#0F1729]">
            {calculatedScore}
          </span>
          <span className="text-xs text-[#66738A]">/ 100</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              tier === "LOW"
                ? "bg-emerald-500"
                : tier === "MEDIUM"
                  ? "bg-amber-500"
                  : tier === "HIGH"
                    ? "bg-orange-500"
                    : "bg-rose-500"
            }`}
            style={{ width: `${calculatedScore}%` }}
          />
        </div>
      </div>

      {/* Form Completeness */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#0F1729]">
            Intake Completeness
          </span>
          <span className="text-xs font-bold text-[#2461F5]">
            {completionPercent}%
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#2461F5] h-full transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Missing Information / Flags Checklist */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#66738A]">
            Validation Flags ({missingItems.length})
          </span>
          {missingItems.length === 0 ? (
            <span className="flex items-center text-xs font-semibold text-emerald-600 gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Complete
            </span>
          ) : (
            <span className="flex items-center text-xs font-semibold text-amber-600 gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Items Pending
            </span>
          )}
        </div>

        {missingItems.length === 0 ? (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Ready for submission. All mandatory underwriting fields provided.
            </span>
          </div>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {missingItems.map((item, index) => (
              <li
                key={index}
                className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-lg flex items-start justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-semibold text-rose-900">{item.field}</p>
                  <p className="text-[10px] text-rose-600 mt-0.5">
                    {item.type}
                  </p>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-800 shrink-0">
                  {item.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
