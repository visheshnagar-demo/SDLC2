import React from "react";
import {
  FileText,
  Compass,
  Code2,
  CheckCircle2,
  Rocket,
  AlertCircle,
  Clock,
  Lock,
} from "lucide-react";

export const STAGES = [
  {
    id: 1,
    key: "requirements",
    title: "Requirements",
    description: "Ingest & Structured Parsing",
    icon: FileText,
  },
  {
    id: 2,
    key: "design",
    title: "Architecture & Design",
    description: "HLD Generation & Sign-off",
    icon: Compass,
  },
  {
    id: 3,
    key: "development",
    title: "Development",
    description: "Code & GitHub Branch Sync",
    icon: Code2,
  },
  {
    id: 4,
    key: "testing",
    title: "Automated QA",
    description: "Test Suites & Verification",
    icon: CheckCircle2,
  },
  {
    id: 5,
    key: "deployment",
    title: "Cloud Deployment",
    description: "Build, Deploy & Health Check",
    icon: Rocket,
  },
];

export const getStageState = (stageKey, project) => {
  if (!project) return "pending";
  const status = (project.status || "NOT_STARTED").toUpperCase();

  switch (stageKey) {
    case "requirements":
      if (
        status === "REQUIREMENTS_INGESTED" ||
        status === "READY_FOR_DESIGN" ||
        status === "DESIGN_GENERATED" ||
        status === "DESIGN_APPROVED" ||
        status === "DEVELOPMENT_IN_PROGRESS" ||
        status === "DEVELOPMENT_COMPLETED" ||
        status === "QA_RUNNING" ||
        status === "QA_PASSED" ||
        status === "QA_FAILED" ||
        status === "DEPLOYING" ||
        status === "DEPLOYED_SUCCESS" ||
        status === "DEPLOYMENT_FAILED"
      ) {
        return "completed";
      }
      return "active";

    case "design":
      if (
        status === "DESIGN_APPROVED" ||
        status === "DEVELOPMENT_IN_PROGRESS" ||
        status === "DEVELOPMENT_COMPLETED" ||
        status === "QA_RUNNING" ||
        status === "QA_PASSED" ||
        status === "QA_FAILED" ||
        status === "DEPLOYING" ||
        status === "DEPLOYED_SUCCESS" ||
        status === "DEPLOYMENT_FAILED"
      ) {
        return "completed";
      }
      if (status === "READY_FOR_DESIGN" || status === "DESIGN_GENERATED") {
        return "active";
      }
      return "pending";

    case "development":
      if (
        status === "DEVELOPMENT_COMPLETED" ||
        status === "QA_RUNNING" ||
        status === "QA_PASSED" ||
        status === "QA_FAILED" ||
        status === "DEPLOYING" ||
        status === "DEPLOYED_SUCCESS" ||
        status === "DEPLOYMENT_FAILED"
      ) {
        return "completed";
      }
      if (
        status === "DEVELOPMENT_IN_PROGRESS" ||
        status === "DESIGN_APPROVED"
      ) {
        return "active";
      }
      return "pending";

    case "testing":
      if (
        status === "QA_PASSED" ||
        status === "DEPLOYING" ||
        status === "DEPLOYED_SUCCESS" ||
        status === "DEPLOYMENT_FAILED"
      ) {
        return "completed";
      }
      if (status === "QA_FAILED" || status === "TEST_TIMEOUT") {
        return "error";
      }
      if (status === "QA_RUNNING" || status === "DEVELOPMENT_COMPLETED") {
        return "active";
      }
      return "pending";

    case "deployment":
      if (status === "DEPLOYED_SUCCESS") {
        return "completed";
      }
      if (status === "DEPLOYMENT_FAILED") {
        return "error";
      }
      if (status === "DEPLOYING" || status === "QA_PASSED") {
        return "active";
      }
      return "pending";

    default:
      return "pending";
  }
};

export const StageStepper = ({ activeStage, onSelectStage, project }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-8">
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const stageState = getStageState(stage.key, project);
          const isSelected = activeStage === stage.key;

          let badgeColor = "bg-slate-800 text-slate-400 border-slate-700";
          let textColor = "text-slate-400";
          let borderHighlight = isSelected
            ? "ring-2 ring-cyan-500 bg-slate-800/90"
            : "bg-slate-800/40 border-slate-800 hover:border-slate-700";

          if (stageState === "completed") {
            badgeColor =
              "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
            textColor = "text-slate-200";
          } else if (stageState === "active") {
            badgeColor = "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
            textColor = "text-white";
          } else if (stageState === "error") {
            badgeColor = "bg-rose-500/20 text-rose-400 border-rose-500/40";
            textColor = "text-rose-200";
          }

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.key)}
              className={`flex-1 flex items-start gap-4 p-4 rounded-xl text-left transition relative border ${borderHighlight}`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${badgeColor}`}
              >
                {stageState === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : stageState === "error" ? (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Step 0{stage.id}
                  </span>
                  {stageState === "completed" && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      Done
                    </span>
                  )}
                  {stageState === "active" && (
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 animate-pulse">
                      In Progress
                    </span>
                  )}
                  {stageState === "error" && (
                    <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                      Failed
                    </span>
                  )}
                </div>
                <h4
                  className={`font-semibold text-sm mt-0.5 truncate ${textColor}`}
                >
                  {stage.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {stage.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StageStepper;
