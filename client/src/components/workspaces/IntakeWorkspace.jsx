import React, { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function IntakeWorkspace({ activeCase, onNextStage }) {
  const [selectedDoc, setSelectedDoc] = useState(
    activeCase?.documents?.[0] || null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 uppercase">
              Stage 01 & 02: Intake & Classification
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Case: {activeCase?.caseNumber}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Cedent Submission & Slip Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Intake Agent ingests broker packets, auto-classifies contract type,
            checks document integrity, and initializes extraction pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateUpload}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-300 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>{isUploading ? "Ingesting..." : "Ingest New Slip"}</span>
          </button>

          <button
            onClick={() => onNextStage("extraction")}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <span>Proceed to Extracted Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Submission Metadata + Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Metadata & Attached Files */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Submission Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">
                  Cedent Name
                </span>
                <span className="font-semibold text-slate-900 text-sm">
                  {activeCase?.cedentName}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Placing Broker
                  </span>
                  <span className="font-medium text-slate-800">
                    {activeCase?.brokerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Line of Business
                  </span>
                  <span className="font-medium text-slate-800 truncate block">
                    {activeCase?.lineOfBusiness}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Period / Effective
                  </span>
                  <span className="font-medium text-slate-800">
                    {activeCase?.effectiveDate} to {activeCase?.expiryDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Requested Limit
                  </span>
                  <span className="font-bold text-teal-700 font-mono">
                    {activeCase?.requestedLimit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Packet Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Attached Document Packet</span>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                {activeCase?.documents?.length || 0} Files
              </span>
            </h3>

            <div className="space-y-2">
              {activeCase?.documents?.map((doc, idx) => {
                const isSelected = selectedDoc?.name === doc.name;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-teal-50/70 border-teal-500 shadow-sm"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {doc.size} • {doc.pages} pages • {doc.type}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      {doc.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Simulated Slip & Document Viewer (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold text-slate-900 font-mono">
                {selectedDoc?.name || "Treaty_Slip_Preview.pdf"}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                OCR Optical Layout
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Page 1 of {selectedDoc?.pages || 8}
              </span>
            </div>
          </div>

          {/* Document Content Simulated Slip Canvas */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-6 font-serif text-slate-800 text-xs leading-relaxed space-y-4 shadow-inner min-h-[460px] overflow-y-auto">
            <div className="border-b-2 border-slate-900 pb-3 text-center">
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                REINSURANCE PLACING SLIP & TREATY SCHEDULE
              </h2>
              <p className="text-[10px] font-sans text-slate-500 uppercase tracking-widest mt-1">
                CONFIDENTIAL — STRICTLY FOR AUTHORIZED UNDERWRITING REVIEW ONLY
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 font-sans text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="font-bold text-slate-600 text-[10px] uppercase block">
                  REINSURED (CEDENT)
                </span>
                <span className="font-semibold text-slate-900">
                  {activeCase?.cedentName}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="font-bold text-slate-600 text-[10px] uppercase block">
                  TYPE OF TREATY
                </span>
                <span className="font-semibold text-slate-900">
                  {activeCase?.lineOfBusiness}
                </span>
              </div>
            </div>

            <div className="space-y-3 font-sans text-xs bg-white p-4 rounded border border-slate-200">
              <div className="border-l-4 border-teal-500 pl-3 py-1 bg-teal-50/50 rounded-r">
                <span className="font-bold text-teal-900">
                  CLAUSE 1.1 — CLASS OF BUSINESS & SCOPE
                </span>
                <p className="text-slate-700 text-xs mt-1">
                  This Agreement covers all direct and facultative reinsurance
                  business classified by the Reinsured as{" "}
                  {activeCase?.lineOfBusiness}, written during the effective
                  period commencing {activeCase?.effectiveDate}.
                </p>
              </div>

              <div className="border-l-4 border-teal-500 pl-3 py-1 bg-teal-50/50 rounded-r">
                <span className="font-bold text-teal-900">
                  CLAUSE 2.0 — LIMITS & RETENTION
                </span>
                <p className="text-slate-700 text-xs mt-1">
                  The Reinsurer agrees to accept and cover up to{" "}
                  <strong className="text-teal-900">
                    {activeCase?.requestedLimit}
                  </strong>{" "}
                  in excess of the Reinsured retention of{" "}
                  <strong className="text-teal-900">
                    {activeCase?.attachmentPoint}
                  </strong>
                  .
                </p>
              </div>

              <div className="border-l-4 border-teal-500 pl-3 py-1 bg-teal-50/50 rounded-r">
                <span className="font-bold text-teal-900">
                  CLAUSE 3.2 — CEDING COMMISSION & PREMIUM TERMS
                </span>
                <p className="text-slate-700 text-xs mt-1">
                  Estimated Subject Gross Premium of{" "}
                  <strong className="text-teal-900">
                    {activeCase?.grossPremium}
                  </strong>
                  . Ceding commission provisionally agreed at{" "}
                  <strong className="text-teal-900">
                    {activeCase?.cedingCommission}
                  </strong>
                  , subject to quarterly bordereau reconciliation.
                </p>
              </div>
            </div>

            <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-lg flex items-center justify-between text-xs text-teal-900 font-sans">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>
                  Document Intelligence Agent has processed this slip with{" "}
                  <strong>{activeCase?.overallConfidence}% confidence</strong>.
                </span>
              </div>
              <button
                onClick={() => onNextStage("extraction")}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 underline"
              >
                Inspect Extracted Fields →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
