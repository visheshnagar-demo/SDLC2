import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ClauseEvaluationTable({ clauses = [] }) {
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [expandedClauseId, setExpandedClauseId] = useState(null);

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case "HIGH":
      case "CRITICAL":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            HIGH RISK
          </span>
        );
      case "MEDIUM":
      case "MODERATE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <ShieldAlert className="w-3 h-3 mr-1" />
            MEDIUM RISK
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            LOW RISK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
            {severity || "INFO"}
          </span>
        );
    }
  };

  const filteredClauses = clauses.filter((clause) => {
    if (filterSeverity === "ALL") return true;
    if (filterSeverity === "NON_STANDARD") return !clause.is_standard;
    return clause.risk_severity?.toUpperCase() === filterSeverity;
  });

  const toggleExpand = (id) => {
    setExpandedClauseId(expandedClauseId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-[#0F2744]">
            Clause-by-Clause Evaluations & Risk Flags
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated LLM evaluation against standard Gen Re reinsurance
            baseline clauses
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 bg-slate-200/70 p-1 rounded-lg text-xs font-semibold">
          {["ALL", "HIGH", "MEDIUM", "LOW", "NON_STANDARD"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterSeverity(f)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === f
                  ? "bg-white text-[#0F2744] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Clause Title</th>
              <th className="py-3 px-4">Standard Alignment</th>
              <th className="py-3 px-4">Risk Severity</th>
              <th className="py-3 px-4">Deviation Summary</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredClauses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No clause evaluations match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredClauses.map((clause) => {
                const isExpanded = expandedClauseId === clause.id;
                return (
                  <React.Fragment key={clause.id}>
                    <tr
                      onClick={() => toggleExpand(clause.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {clause.clause_title || "Untitled Clause"}
                      </td>
                      <td className="py-3.5 px-4">
                        {clause.is_standard ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Standard Wording
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            Non-Standard Deviation
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {getSeverityBadge(clause.risk_severity)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">
                        {clause.deviation_analysis ||
                          "No deviation detected from standard guidelines."}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-auto" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={5} className="p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Extracted Slip Wording
                              </p>
                              <p className="text-xs text-slate-800 font-mono bg-slate-50 p-2.5 rounded border border-slate-100 whitespace-pre-wrap">
                                {clause.clause_text ||
                                  "No raw clause text recorded."}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                              <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                  AI Deviation Analysis
                                </p>
                                <p className="text-xs text-slate-700">
                                  {clause.deviation_analysis ||
                                    "Consistent with standard treaty guidelines."}
                                </p>
                              </div>
                              {clause.recommended_action && (
                                <div className="pt-2 border-t border-slate-100">
                                  <p className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wide mb-0.5">
                                    Recommended Underwriter Action
                                  </p>
                                  <p className="text-xs text-slate-800 bg-sky-50/60 p-2 rounded border border-sky-100">
                                    {clause.recommended_action}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
