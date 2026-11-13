import React from "react";
import { STAGES, KPI_METRICS } from "../../services/mockData";
import {
  FileText,
  Layers,
  FileSearch,
  CheckSquare,
  ShieldAlert,
  Calculator,
  FileSpreadsheet,
  UserCheck,
  GitCompare,
  CheckCircle2,
  Award,
  Send,
  TrendingUp,
  Clock,
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

const STAGE_ICON_MAP = {
  FileText,
  Layers,
  FileSearch,
  CheckSquare,
  ShieldAlert,
  Calculator,
  FileSpreadsheet,
  UserCheck,
  GitCompare,
  CheckCircle2,
  Award,
  Send,
};

export default function DashboardView({
  activeCase,
  allScenarios = [],
  onSelectScenario,
  onNavigateStage,
  onExecuteStage,
}) {
  const currentStageIndex = STAGES.findIndex(
    (s) => s.key === activeCase?.currentStageKey,
  );

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Value Proposition Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#008080] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> 10-Minute Executive
            Demonstration
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-2">
            Gen Re Quote-to-Bind Orchestration Platform
          </h1>
          <p className="text-sm text-slate-200 leading-relaxed">
            Multi-agent AI orchestration coordinating cedent intake, document
            intelligence, actuarial loss modeling, capacity management, and
            human-in-the-loop binding authority.
          </p>
        </div>

        {/* Value Metrics Badges */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10 pt-4 border-t border-white/10">
          <div>
            <div className="text-[11px] text-teal-200 font-medium">
              Triage Acceleration
            </div>
            <div className="text-lg font-bold text-white">
              4.2 Hrs{" "}
              <span className="text-xs font-normal text-teal-300">
                (was 4.5 days)
              </span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-teal-200 font-medium">
              Touchless Extraction
            </div>
            <div className="text-lg font-bold text-white">
              96.2%{" "}
              <span className="text-xs font-normal text-teal-300">
                Mean Conf.
              </span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-teal-200 font-medium">
              Audit Traceability
            </div>
            <div className="text-lg font-bold text-white">
              100%{" "}
              <span className="text-xs font-normal text-teal-300">
                Immutable Logs
              </span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-teal-200 font-medium">
              Governance Gates
            </div>
            <div className="text-lg font-bold text-white">
              6-Point Check{" "}
              <span className="text-xs font-normal text-teal-300">
                Enforced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Stage Interactive Workflow Stepper (FR-01, FR-02) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-600" />
              End-to-End QTB Lifecycle Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              Interactive 12-stage workflow visualizer. Click any stage to
              inspect workspace or trigger simulated agent execution.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono">
            Active: Stage {currentStageIndex + 1} of 12
          </span>
        </div>

        {/* Stepper Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {STAGES.map((stg, idx) => {
            const Icon = STAGE_ICON_MAP[stg.icon] || FileText;
            const isCompleted =
              idx < currentStageIndex ||
              (idx === currentStageIndex &&
                activeCase?.bindConfirmation?.bound);
            const isCurrent =
              idx === currentStageIndex && !activeCase?.bindConfirmation?.bound;
            const isPending = idx > currentStageIndex;

            let badgeStyle = "bg-slate-100 text-slate-500 border-slate-200";
            if (isCompleted)
              badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-300";
            if (isCurrent)
              badgeStyle =
                "bg-teal-50 text-teal-800 border-teal-500 ring-2 ring-teal-500/20";

            return (
              <button
                key={stg.key}
                onClick={() => onNavigateStage(stg.key)}
                className={`flex flex-col text-left p-3 rounded-lg border transition duration-150 relative group ${badgeStyle}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/80 border border-slate-200/60 text-slate-700">
                    {String(stg.number).padStart(2, "0")}
                  </span>
                  {isCompleted ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <Icon
                    className={`w-3.5 h-3.5 ${isCurrent ? "text-teal-600" : "text-slate-500"}`}
                  />
                  <span className="text-xs font-semibold text-slate-900 leading-tight truncate">
                    {stg.title}
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 truncate mt-auto">
                  {stg.agent}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Row (FR-01) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Submissions
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {KPI_METRICS.activeSubmissions}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />{" "}
              {KPI_METRICS.activeSubmissionsChange}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Bound Premium YTD
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {KPI_METRICS.boundPremiumYTD}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />{" "}
              {KPI_METRICS.boundPremiumChange}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Avg Triage Time
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {KPI_METRICS.avgTriageTime}
            </h3>
            <p className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {KPI_METRICS.avgTriageTimeChange}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              AI Confidence Rate
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {KPI_METRICS.aiConfidenceRate}
            </h3>
            <p className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />{" "}
              {KPI_METRICS.aiConfidenceRateChange}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Submissions Demo Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Predefined Demo Submissions & Scenario Switcher
            </h3>
            <p className="text-xs text-slate-500">
              Select any case below to switch active context and demonstrate its
              specific workflow path.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            3 Synthetic Cases Loaded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Case # / Scenario</th>
                <th className="py-3 px-4">Cedent & Broker</th>
                <th className="py-3 px-4">Line of Business</th>
                <th className="py-3 px-4">Limit Requested</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4">Status & Exception</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allScenarios.map((sc) => {
                const isSelected = sc.id === activeCase?.id;
                return (
                  <tr
                    key={sc.id}
                    className={`hover:bg-slate-50 transition cursor-pointer ${
                      isSelected ? "bg-teal-50/60 font-medium" : ""
                    }`}
                    onClick={() => onSelectScenario(sc.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sc.title}</div>
                      <div className="text-[11px] text-teal-600 font-mono">
                        {sc.id}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {sc.cedentName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Broker: Aon / Marsh
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {sc.lineOfBusiness}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {sc.requestedLimit}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sc.confidence >= 90
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${sc.confidence}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-700">
                          {sc.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          sc.requiresReferral
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : sc.status.includes("Exception")
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {sc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScenario(sc.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? "bg-teal-600 text-white shadow-sm"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isSelected ? "Active Case" : "Load Case"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
