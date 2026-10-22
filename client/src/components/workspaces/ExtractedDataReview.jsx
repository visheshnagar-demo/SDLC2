import React, { useState } from "react";
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Save,
  X,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Mail,
} from "lucide-react";

export default function ExtractedDataReview({
  activeCase,
  onUpdateOverride,
  onNextStage,
}) {
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [exceptionReason, setExceptionReason] = useState("");

  const handleStartEdit = (field) => {
    setEditingFieldId(field.id);
    setEditValue(field.value);
  };

  const handleSaveEdit = (fieldId) => {
    onUpdateOverride({ fieldId, newValue: editValue });
    setEditingFieldId(null);
  };

  const handleResolveException = () => {
    onUpdateOverride({ clearException: true, reason: exceptionReason });
    setShowOverrideModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
              Stage 03 & 04: Extraction & Validation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Case: {activeCase?.caseNumber}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Extracted Treaty Terms & Completeness Review
          </h2>
          <p className="text-xs text-slate-500">
            Document Intelligence Agent extracts structured clauses with
            confidence scores and source citations. Underwriters can verify or
            manually override values.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeCase?.completenessCheck?.status !== "PASSED" && (
            <button
              onClick={() => setShowOverrideModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Override Exceptions</span>
            </button>
          )}

          <button
            onClick={() => onNextStage("risk")}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <span>Proceed to Underwriting Risk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Completeness & Exception Center Alert (FR-05) */}
      {activeCase?.completenessCheck?.status !== "PASSED" && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  Completeness Exception Detected (Score:{" "}
                  {activeCase?.completenessCheck?.score}%)
                  <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-mono uppercase">
                    Action Required
                  </span>
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  Validation Agent identified missing data points required for
                  actuarial risk pricing.
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-amber-900">
                  {activeCase?.completenessCheck?.missingItems?.map(
                    (item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        <span>{item}</span>
                      </div>
                    ),
                  )}
                </div>

                {activeCase?.completenessCheck?.rfiGenerated && (
                  <div className="mt-3 p-2.5 bg-amber-100/80 rounded border border-amber-300/80 text-[11px] text-amber-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>{activeCase?.completenessCheck?.rfiDetails}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowOverrideModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm whitespace-nowrap"
            >
              Apply HITL Override
            </button>
          </div>
        </div>
      )}

      {/* Extracted Fields Table (FR-04) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Structured Treaty Terms Extraction
            </h3>
            <p className="text-xs text-slate-500">
              Mean extraction confidence:{" "}
              <strong className="text-teal-700">
                {activeCase?.overallConfidence}%
              </strong>{" "}
              with full document citations.
            </p>
          </div>
          <span className="text-xs font-mono bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded">
            {activeCase?.extractedFields?.length || 0} Terms Captured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Field / Parameter</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Extracted Term Value</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4">Source Citation</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeCase?.extractedFields?.map((field) => {
                const isEditing = editingFieldId === field.id;
                const isLowConfidence =
                  field.confidence < 80 || field.isMissing;

                return (
                  <tr
                    key={field.id}
                    className={`hover:bg-slate-50 transition ${
                      isLowConfidence ? "bg-amber-50/50" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {field.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                        {field.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="bg-white border border-teal-500 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 w-full"
                          />
                          <button
                            onClick={() => handleSaveEdit(field.id)}
                            className="p-1 bg-teal-600 text-white rounded hover:bg-teal-500"
                            title="Save Override"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingFieldId(null)}
                            className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group">
                          <span
                            className={`font-mono ${
                              field.isMissing
                                ? "text-rose-600 font-bold"
                                : "text-slate-800 font-medium"
                            }`}
                          >
                            {field.value}
                          </span>
                          <button
                            onClick={() => handleStartEdit(field)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-teal-600 transition"
                            title="Edit / Override Field"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              field.confidence >= 95
                                ? "bg-emerald-500"
                                : field.confidence >= 80
                                  ? "bg-blue-500"
                                  : "bg-rose-500"
                            }`}
                            style={{ width: `${field.confidence}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono text-[11px] ${
                            field.confidence < 80
                              ? "text-rose-600 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          {field.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {field.citation}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {field.verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(field)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 hover:bg-amber-100"
                        >
                          <AlertTriangle className="w-3 h-3" /> Fix Gap
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exception Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Human-In-The-Loop Exception Override
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Authorize an underwriting exception for missing census/loss data.
              This action is permanently logged to the immutable audit trail
              with your persona signature.
            </p>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-semibold text-slate-700 block">
                Underwriter Justification / Audit Rationale:
              </label>
              <textarea
                rows={3}
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                placeholder="e.g. Provisional terms granted subject to receipt of certified claims census within 30 days of inception..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveException}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
              >
                Sign & Authorize Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
