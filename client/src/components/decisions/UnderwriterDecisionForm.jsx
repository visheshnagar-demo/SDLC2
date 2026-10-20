import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Send, RefreshCw, X } from "lucide-react";
import { api } from "../../services/api";

export default function UnderwriterDecisionForm({
  documentId,
  initialDocuments = [],
  onDecisionSuccess,
}) {
  const [selectedDocId, setSelectedDocId] = useState(documentId || "");
  const [decision, setDecision] = useState("APPROVED");
  const [underwriterId, setUnderwriterId] = useState("UW-8842");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [subjectivities, setSubjectivities] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docIdToUse = selectedDocId || documentId;
    if (!docIdToUse) {
      setError("Please select a valid treaty document.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        document_id: docIdToUse,
        decision: decision,
        underwriter_id: underwriterId || "UW-8842",
        reviewer_notes: reviewerNotes,
        subjectivities: subjectivities,
      };

      const res = await api.createDecision(payload);
      setSuccessMsg(
        `Decision "${decision}" successfully recorded for document ${docIdToUse}.`,
      );
      setReviewerNotes("");
      setSubjectivities("");
      if (onDecisionSuccess) {
        onDecisionSuccess(res);
      }
    } catch (err) {
      console.error("Decision submission failed:", err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit underwriter decision.";
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-[#0F2744]">
            Underwriter Sign-off & Decision Recording
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit binding underwriting decisions, exclusions, and treaty
            subjectivities
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1E3A8A]">
          Authorized Sign-off
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2"
        >
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold uppercase">Submission Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start space-x-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold uppercase">Decision Recorded</p>
            <p className="mt-0.5">{successMsg}</p>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Selector if multiple */}
        {initialDocuments.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Treaty Document
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="">-- Select Treaty Document --</option>
              {initialDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.file_name || doc.id} ({doc.file_type || "PDF"})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Decision & Underwriter ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Underwriting Decision
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="APPROVED">APPROVED (Full Acceptance)</option>
              <option value="CONDITIONAL_APPROVAL">
                CONDITIONAL APPROVAL (Subjectivities Required)
              </option>
              <option value="REFERRED">
                REFERRED (Senior Reviewer Escalation)
              </option>
              <option value="DECLINED">DECLINED (Out of Appetite)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Underwriter Identifier
            </label>
            <input
              type="text"
              value={underwriterId}
              onChange={(e) => setUnderwriterId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              placeholder="e.g. UW-8842 / Sarah Jenkins"
              required
            />
          </div>
        </div>

        {/* Reviewer Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Underwriter Reviewer Notes & Justification
          </label>
          <textarea
            rows={3}
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            placeholder="Document rationale, pricing adjustments, non-standard clause mitigations, or line limit exceptions..."
          />
        </div>

        {/* Subjectivities */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Conditions Precedent & Subjectivities (Optional)
          </label>
          <textarea
            rows={2}
            value={subjectivities}
            onChange={(e) => setSubjectivities(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            placeholder="e.g. Subject to receipt of satisfactory 5-year clean loss record by Q3 2026..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-colors shadow-sm ${
              submitting
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-[#0F2744] hover:bg-[#1E3A8A]"
            }`}
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Recording Decision...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Underwriting Sign-off
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
