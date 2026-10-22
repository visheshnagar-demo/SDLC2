import React, { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";

export default function InfoRequestModal({ isOpen, onClose, onSubmit }) {
  const [requestText, setRequestText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestText.trim()) return;
    setSubmitting(true);
    await onSubmit(requestText);
    setSubmitting(false);
    setRequestText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Issue Information Request to Cedent
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Specify the additional underwriting information, clarifications, or
            missing loss runs required from the ceding company. The submission
            will move to <strong>Info Requested</strong> status.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Information / Clarification Request *
            </label>
            <textarea
              required
              rows={4}
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="e.g. Please provide updated 3-year loss runs for the newly acquired subsidiary and clarify current EDR deployment percentage across server fleet."
              className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !requestText.trim()}
              className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:bg-slate-300"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submitting ? "Sending Request..." : "Send Info Request"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
