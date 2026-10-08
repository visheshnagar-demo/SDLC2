import React from "react";
import { AlertTriangle, XCircle } from "lucide-react";

export default function ValidationErrorAlert({
  errors = [],
  title = "Underwriting Validation Errors",
}) {
  if (!errors || errors.length === 0) return null;

  return (
    <div
      role="alert"
      className="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-900 shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-red-100 rounded-lg text-red-700 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-red-800 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-red-200 text-red-900 rounded-full">
              {errors.length} {errors.length === 1 ? "issue" : "issues"}
            </span>
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-red-700 list-disc list-inside">
            {errors.map((err, idx) => (
              <li key={`val-err-${idx}`} className="leading-relaxed">
                {typeof err === "string"
                  ? err
                  : err.message || JSON.stringify(err)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
