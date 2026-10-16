import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Send,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function MissingInfoAlertBanner({
  flags = [],
  onResolveFlag,
  onRequestCarrierUpdate,
  loading = false,
}) {
  const [expanded, setExpanded] = useState(true);
  const [requestSent, setRequestSent] = useState(false);

  if (!flags || flags.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between text-emerald-800 shadow-sm">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">
              All Required Information Complete
            </h4>
            <p className="text-xs text-emerald-700">
              No missing checklist items or required document deficiencies
              detected.
            </p>
          </div>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
          100% Complete
        </span>
      </div>
    );
  }

  const criticalCount = flags.filter(
    (f) => f.severity === "CRITICAL" || f.is_blocking,
  ).length;

  const handleSendRequest = () => {
    setRequestSent(true);
    if (onRequestCarrierUpdate) {
      onRequestCarrierUpdate();
    }
    setTimeout(() => setRequestSent(false), 3000);
  };

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-amber-100/70 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-200 text-amber-900 rounded-md">
            <ShieldAlert className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-amber-900 text-sm">
                Missing Information Flags Detected ({flags.length})
              </h3>
              {criticalCount > 0 && (
                <span className="bg-red-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {criticalCount} Blocking
                </span>
              )}
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              Action required before formal underwriting binding can be
              completed.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSendRequest}
            disabled={loading || requestSent}
            className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium px-3 py-1.5 rounded flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {requestSent ? "Carrier Alerted" : "Notify Carrier"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-amber-800 hover:text-amber-950 p-1 rounded transition"
            aria-label="Toggle missing info details"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 divide-y divide-amber-200/60">
          {flags.map((flag, idx) => (
            <div
              key={flag.id || idx}
              className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${flag.severity === "CRITICAL" ? "text-red-600" : "text-amber-600"}`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800">
                      {flag.field_name ||
                        flag.item_name ||
                        `Deficiency #${idx + 1}`}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        flag.severity === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {flag.severity || "REQUIRED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {flag.description ||
                      flag.message ||
                      "Required underwriting data point is missing from submission intake."}
                  </p>
                </div>
              </div>
              {onResolveFlag && (
                <button
                  type="button"
                  onClick={() => onResolveFlag(flag.id || idx)}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-medium underline flex-shrink-0"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
