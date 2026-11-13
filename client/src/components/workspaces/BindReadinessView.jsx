import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Send,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  Sparkles,
} from "lucide-react";

export default function BindReadinessView({ activeCase, onExecuteBind }) {
  const [isBinding, setIsBinding] = useState(false);
  const [activeTab, setActiveTab] = useState("summary"); // 'summary' | 'binder_pdf' | 'pas_json'
  const [copiedJson, setCopiedJson] = useState(false);

  const checklist = activeCase?.bindChecklist || [];
  const allGatesPassed = checklist.every((item) => item.passed);
  const isBound = activeCase?.bindConfirmation?.bound;

  const handleBind = () => {
    setIsBinding(true);
    setTimeout(() => {
      onExecuteBind({
        underwriterName: "Sarah Jenkins (VP Underwriting)",
        caseNumber: activeCase?.caseNumber,
      });
      setIsBinding(false);
    }, 800);
  };

  const pasPayload = {
    message_type: "PAS_POLICY_BIND_HANDOFF",
    timestamp:
      activeCase?.bindConfirmation?.boundAt || new Date().toISOString(),
    binder_reference:
      activeCase?.bindConfirmation?.binderId || "BND-GENRE-889102",
    policy_number:
      activeCase?.bindConfirmation?.pasPolicyNumber || "POL-RE-2026-7712",
    cedent: {
      name: activeCase?.cedentName,
      broker: activeCase?.brokerName,
      line_of_business: activeCase?.lineOfBusiness,
      jurisdiction: "United States",
    },
    coverage: {
      limit: activeCase?.requestedLimit,
      attachment: activeCase?.attachmentPoint,
      gross_premium: activeCase?.grossPremium,
      ceding_commission: activeCase?.cedingCommission,
      rate_on_line: activeCase?.rateOnLine,
      effective_date: activeCase?.effectiveDate,
      expiry_date: activeCase?.expiryDate,
    },
    governance: {
      sanctions_status: "CLEARED",
      hurdle_roe: activeCase?.pricingData?.roeProjected + "%",
      authority_signoff:
        activeCase?.bindConfirmation?.boundBy || "Sarah Jenkins",
      audit_traceability_id:
        "AUD-TRACE-" + Math.floor(100000 + Math.random() * 900000),
    },
  };

  const handleCopyJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(pasPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
              Stage 10, 11 & 12: Bind Readiness & Contract Handoff
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Case: {activeCase?.caseNumber}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Bind Readiness Checklist & Policy Execution
          </h2>
          <p className="text-xs text-slate-500">
            Bind Readiness Agent validates the 6-point pre-bind governance
            matrix before authorizing final policy execution and PAS contract
            handoff.
          </p>
        </div>

        {isBound ? (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> Policy Legally Bound & Handoff
            Complete
          </span>
        ) : (
          <button
            onClick={handleBind}
            disabled={!allGatesPassed || isBinding}
            className={`flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold rounded-lg transition shadow-md ${
              allGatesPassed && !isBinding
                ? "bg-emerald-600 hover:bg-emerald-500 animate-pulse cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>
              {isBinding
                ? "Executing Binder & PAS Handoff..."
                : "Authorize & Execute Bind"}
            </span>
          </button>
        )}
      </div>

      {/* 6-Point Governance Gate Grid (FR-12) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              6-Point Pre-Bind Governance Gate Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic verification rules enforced prior to contract
              issuance (BR-05).
            </p>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
              allGatesPassed
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            {checklist.filter((i) => i.passed).length} of 6 Gates Cleared
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {checklist.map((gate) => (
            <div
              key={gate.id}
              className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                gate.passed
                  ? "bg-emerald-50/60 border-emerald-300/80"
                  : "bg-amber-50/60 border-amber-300/80"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 leading-snug">
                    {gate.label}
                  </span>
                  {gate.passed ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {gate.citation}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 text-[10px] text-slate-500">
                <span>{gate.agent}</span>
                <span>{gate.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bind Confirmation & Contract Handoff Result Card (FR-13) */}
      {isBound && (
        <div className="bg-white rounded-xl border-2 border-emerald-500 p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                  Stage 12 Completed
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  Reinsurance Binder Executed & PAS Policy Created
                </h3>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === "summary"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Binder Summary
              </button>
              <button
                onClick={() => setActiveTab("pas_json")}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeTab === "pas_json"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                PAS JSON Payload
              </button>
            </div>
          </div>

          {activeTab === "summary" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                  Binder Reference
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                  {activeCase?.bindConfirmation?.binderId}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                  PAS Policy Number
                </span>
                <span className="text-sm font-bold text-teal-700 font-mono mt-0.5 block">
                  {activeCase?.bindConfirmation?.pasPolicyNumber}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                  Authorized By
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {activeCase?.bindConfirmation?.boundBy}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                  Execution Timestamp
                </span>
                <span className="text-xs font-medium text-slate-700 mt-0.5 block font-mono">
                  {activeCase?.bindConfirmation?.boundAt}
                </span>
              </div>
            </div>
          )}

          {activeTab === "pas_json" && (
            <div className="relative">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono font-semibold text-slate-600">
                  Downstream Policy Administration System Contract Handoff
                  Payload (JSON):
                </span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-mono transition"
                >
                  {copiedJson ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-teal-300 p-4 rounded-xl text-xs font-mono overflow-auto max-h-72 border border-slate-800">
                {JSON.stringify(pasPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
