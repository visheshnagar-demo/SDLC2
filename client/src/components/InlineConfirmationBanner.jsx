import React from "react";
import { CheckCircle2, X } from "lucide-react";

export const InlineConfirmationBanner = ({
  auditId = "AT-2026-89412",
  message,
  onDismiss,
  timestamp,
}) => {
  const displayMsg =
    message ||
    `Assortment Update Submitted Successfully. Audit Trail ID: #${auditId}. Changes logged to central planogram repository.`;

  return (
    <div
      role="status"
      className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-lg flex justify-between items-center mb-6 shadow-xs animate-in fade-in duration-300"
      data-testid="inline-confirmation-banner"
    >
      <div className="flex items-center space-x-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div className="text-sm font-medium">
          <span>{displayMsg}</span>
          {timestamp && (
            <span className="text-xs text-emerald-700 ml-2 font-mono">
              ({new Date(timestamp).toLocaleTimeString()})
            </span>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default InlineConfirmationBanner;
