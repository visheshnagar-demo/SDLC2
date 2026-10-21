import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  FileWarning,
  FileCheck,
} from "lucide-react";

export const MANDATORY_DOCS_BY_LOB = {
  "Cyber Risk": [
    { type: "application", label: "Cyber Application Form" },
    { type: "loss_runs", label: "3-Year Loss Runs" },
    { type: "security_controls", label: "Cyber Controls Assessment (MFA/EDR)" },
  ],
  "D&O": [
    { type: "application", label: "D&O Application Form" },
    { type: "loss_runs", label: "5-Year Loss Runs" },
    { type: "financials", label: "Audited Financial Statements" },
  ],
  "E&O": [
    { type: "application", label: "E&O Application Form" },
    { type: "loss_runs", label: "Loss Runs" },
    { type: "contracts", label: "Standard Client Contract Template" },
  ],
  EPLI: [
    { type: "application", label: "EPLI Application Form" },
    { type: "loss_runs", label: "Historical Claims Summary" },
    { type: "handbook", label: "Employee Handbook / HR Policy" },
  ],
  "Medical Professional Liability": [
    { type: "application", label: "MPL Application Form" },
    { type: "loss_runs", label: "10-Year Loss Experience" },
    { type: "credentials", label: "Physician/Facility Credentialing List" },
  ],
};

export default function CompletenessCheckBadge({
  lineOfBusiness,
  documents = [],
  detailed = false,
}) {
  const required = MANDATORY_DOCS_BY_LOB[lineOfBusiness] || [
    { type: "application", label: "Application Form" },
    { type: "loss_runs", label: "Loss Runs" },
  ];

  // Check which document types are uploaded
  const uploadedTypes = new Set(
    documents.map(
      (d) => d.doc_type || d.type || (d.name ? d.name.toLowerCase() : ""),
    ),
  );

  // Fuzzy match
  const missing = [];
  const present = [];

  required.forEach((req) => {
    const isFound = documents.some((doc) => {
      const docName = (doc.name || doc.filename || "").toLowerCase();
      const docType = (doc.doc_type || doc.type || "").toLowerCase();
      return (
        docType === req.type.toLowerCase() ||
        docName.includes(req.type.toLowerCase()) ||
        (req.type === "loss_runs" && docName.includes("loss")) ||
        (req.type === "application" && docName.includes("app")) ||
        (req.type === "financials" &&
          (docName.includes("finan") || docName.includes("audit"))) ||
        (req.type === "security_controls" &&
          (docName.includes("cyber") ||
            docName.includes("mfa") ||
            docName.includes("sec"))) ||
        (req.type === "handbook" &&
          (docName.includes("handbook") ||
            docName.includes("hr") ||
            docName.includes("epli"))) ||
        (req.type === "contracts" && docName.includes("contract")) ||
        (req.type === "credentials" &&
          (docName.includes("cred") || docName.includes("cv")))
      );
    });

    if (isFound) {
      present.push(req);
    } else {
      missing.push(req);
    }
  });

  const percent = Math.round((present.length / required.length) * 100);
  const isComplete = missing.length === 0;

  if (!detailed) {
    if (isComplete) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Docs Complete (100%)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        <FileWarning className="w-3.5 h-3.5 text-amber-600" />
        <span>
          {percent}% Complete ({missing.length} missing)
        </span>
      </span>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl border ${isComplete ? "bg-emerald-50/50 border-emerald-200" : "bg-amber-50/50 border-amber-200"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
          <span className="font-semibold text-slate-800 text-sm">
            LOB Document Completeness ({lineOfBusiness || "Standard"})
          </span>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isComplete ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
          }`}
        >
          {percent}% Verified
        </span>
      </div>

      <div className="space-y-1.5 text-xs">
        {required.map((req, idx) => {
          const isPresent = present.some((p) => p.type === req.type);
          return (
            <div
              key={idx}
              className="flex items-center justify-between py-1 px-2 rounded bg-white/70 border border-slate-200/60"
            >
              <span className="text-slate-700">{req.label}</span>
              {isPresent ? (
                <span className="text-emerald-700 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Attached</span>
                </span>
              ) : (
                <span className="text-rose-600 font-medium flex items-center space-x-1">
                  <FileWarning className="w-3.5 h-3.5 text-rose-500" />
                  <span>Missing</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!isComplete && (
        <p className="mt-2.5 text-[11px] text-amber-800 leading-tight">
          ⚠️ Completeness warning: Underwriter review will flag missing
          mandatory files for {lineOfBusiness}.
        </p>
      )}
    </div>
  );
}
