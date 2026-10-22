import React from "react";

const STATUS_CONFIGS = {
  NOT_STARTED: {
    label: "Not Started",
    bg: "bg-slate-800",
    text: "text-slate-400",
    border: "border-slate-700",
  },
  REQUIREMENTS_INGESTED: {
    label: "Requirements Ingested",
    bg: "bg-blue-950/80",
    text: "text-blue-300",
    border: "border-blue-700/60",
  },
  READY_FOR_DESIGN: {
    label: "Ready for Design",
    bg: "bg-indigo-950/80",
    text: "text-indigo-300",
    border: "border-indigo-700/60",
  },
  DESIGN_GENERATED: {
    label: "Design Generated",
    bg: "bg-purple-950/80",
    text: "text-purple-300",
    border: "border-purple-700/60",
  },
  DESIGN_APPROVED: {
    label: "Design Approved",
    bg: "bg-teal-950/80",
    text: "text-teal-300",
    border: "border-teal-700/60",
  },
  DEVELOPMENT_IN_PROGRESS: {
    label: "Development In Progress",
    bg: "bg-amber-950/80",
    text: "text-amber-300",
    border: "border-amber-700/60",
  },
  DEVELOPMENT_COMPLETED: {
    label: "Development Completed",
    bg: "bg-emerald-950/80",
    text: "text-emerald-300",
    border: "border-emerald-700/60",
  },
  QA_RUNNING: {
    label: "QA Running",
    bg: "bg-cyan-950/80",
    text: "text-cyan-300",
    border: "border-cyan-700/60",
  },
  QA_PASSED: {
    label: "QA Passed",
    bg: "bg-emerald-950/80",
    text: "text-emerald-300",
    border: "border-emerald-700/60",
  },
  QA_FAILED: {
    label: "QA Failed",
    bg: "bg-rose-950/80",
    text: "text-rose-300",
    border: "border-rose-700/60",
  },
  TEST_TIMEOUT: {
    label: "Test Timeout",
    bg: "bg-orange-950/80",
    text: "text-orange-300",
    border: "border-orange-700/60",
  },
  DEPLOYING: {
    label: "Deploying",
    bg: "bg-sky-950/80",
    text: "text-sky-300",
    border: "border-sky-700/60",
  },
  DEPLOYED_SUCCESS: {
    label: "Deployed (Live)",
    bg: "bg-emerald-950/80",
    text: "text-emerald-300",
    border: "border-emerald-700/60",
  },
  DEPLOYMENT_FAILED: {
    label: "Deployment Failed",
    bg: "bg-rose-950/80",
    text: "text-rose-300",
    border: "border-rose-700/60",
  },
};

export const StatusBadge = ({ status = "NOT_STARTED" }) => {
  const norm = status ? String(status).toUpperCase() : "NOT_STARTED";
  const config = STATUS_CONFIGS[norm] || {
    label: status || "Unknown",
    bg: "bg-slate-800",
    text: "text-slate-300",
    border: "border-slate-700",
  };

  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
