import React from "react";
import {
  FileText,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function RiskMetricGroup({ metrics }) {
  const defaultMetrics = {
    activeTreaties: 48,
    activeTreatiesChange: "+12% MoM",
    avgRiskScore: 68.4,
    avgRiskLabel: "Moderate Exposure",
    flaggedClauses: 14,
    flaggedLabel: "Requires Underwriter Review",
    jobsCompleted: 128,
    jobsLabel: "100% Audit Tracked",
  };

  const data = { ...defaultMetrics, ...metrics };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Treaties */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Active Treaties
          </p>
          <div className="p-2 bg-blue-50 text-[#1E3A8A] rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-[#0F2744] mt-2">
          {data.activeTreaties}
        </p>
        <span className="inline-block mt-2 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
          {data.activeTreatiesChange}
        </span>
      </div>

      {/* Avg Composite Risk */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Avg Composite Risk
          </p>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-amber-600 mt-2">
          {data.avgRiskScore} / 100
        </p>
        <span className="inline-block mt-2 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
          {data.avgRiskLabel}
        </span>
      </div>

      {/* Flagged Non-Std Clauses */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Flagged Non-Std Clauses
          </p>
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-red-600 mt-2">
          {data.flaggedClauses}
        </p>
        <span className="inline-block mt-2 text-xs text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded">
          {data.flaggedLabel}
        </span>
      </div>

      {/* Agent Jobs Completed */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Agent Jobs Completed
          </p>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-600 mt-2">
          {data.jobsCompleted}
        </p>
        <span className="inline-block mt-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
          {data.jobsLabel}
        </span>
      </div>
    </div>
  );
}
