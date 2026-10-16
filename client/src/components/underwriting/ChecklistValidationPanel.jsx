import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileQuestion,
  Mail,
  Check,
  AlertTriangle,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";

export function ChecklistValidationPanel({
  checklist = [],
  riskType = "Cyber",
  onRequestInfo,
}) {
  const [items, setItems] = useState(
    checklist.length > 0
      ? checklist
      : [
          {
            id: "doc-1",
            name: riskType.toLowerCase().includes("cyber")
              ? "Third-Party Penetration Test & Audit"
              : "Audited Financial Statements (Last 3 Years)",
            category: "Required Document",
            is_present: false,
            severity: "HIGH",
            description: riskType.toLowerCase().includes("cyber")
              ? "SOC2 Type II or independent pen-test performed within 12 months."
              : "Complete SEC 10-K filings or audited balance sheets.",
          },
          {
            id: "doc-2",
            name: riskType.toLowerCase().includes("cyber")
              ? "MFA Architecture & Backup Policy"
              : "Board Governance & Litigation Summary",
            category: "Underwriting Parameter",
            is_present: true,
            severity: "MEDIUM",
            description: "Verified active configuration with zero exclusions.",
          },
          {
            id: "doc-3",
            name: "Historical Loss Runs (5 Years)",
            category: "Required Document",
            is_present: true,
            severity: "HIGH",
            description: "Signed carrier loss experience report.",
          },
          {
            id: "doc-4",
            name: riskType.toLowerCase().includes("cyber")
              ? "Incident Response Plan (IRP)"
              : "Director & Officer Shareholding Roster",
            category: "Compliance Rule",
            is_present: false,
            severity: "LOW",
            description:
              "Formal policy document required prior to binding quote.",
          },
        ],
  );

  const [notificationSent, setNotificationSent] = useState(false);

  const missingItems = items.filter(
    (item) => !item.is_present && !item.is_resolved,
  );

  const handleToggleResolve = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_resolved: !item.is_resolved } : item,
      ),
    );
  };

  const handleRequestInfoClick = () => {
    setNotificationSent(true);
    if (onRequestInfo) {
      onRequestInfo(missingItems);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Missing Information & Checklist Rules
            </h3>
            <p className="text-xs text-slate-500">
              Automated underwriting compliance inspection
            </p>
          </div>
        </div>
        {missingItems.length > 0 ? (
          <Badge variant="warning" size="md">
            {missingItems.length} Missing Items
          </Badge>
        ) : (
          <Badge variant="success" size="md">
            100% Complete
          </Badge>
        )}
      </div>

      {notificationSent && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            Information request notification dispatched to submitting carrier.
          </span>
          <button
            onClick={() => setNotificationSent(false)}
            className="text-[11px] font-semibold underline text-indigo-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const isComplete = item.is_present || item.is_resolved;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isComplete
                  ? "bg-slate-50/60 border-slate-200/70"
                  : "bg-amber-50/40 border-amber-200 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${isComplete ? "text-slate-700" : "text-slate-900"}`}
                      >
                        {item.name || item.field_or_doc_name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {item.category || item.flag_type || "Checklist"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleResolve(item.id)}
                    className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                      item.is_resolved
                        ? "bg-emerald-100 text-emerald-800"
                        : isComplete
                          ? "text-slate-400 hover:text-slate-600"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.is_resolved
                      ? "Resolved"
                      : isComplete
                        ? "Verified"
                        : "Waive / Resolve"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {missingItems.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Send an automated deficiency notification to carrier
            representatives.
          </p>
          <Button
            size="sm"
            variant="secondary"
            icon={Mail}
            onClick={handleRequestInfoClick}
            disabled={notificationSent}
          >
            Request Missing Info
          </Button>
        </div>
      )}
    </div>
  );
}

export default ChecklistValidationPanel;
