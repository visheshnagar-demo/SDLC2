import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Layers,
  Database,
  Network,
  Check,
} from "lucide-react";
import api from "../../services/api";

export const DesignStage = ({ project, onProjectUpdated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approverName, setApproverName] = useState("Lead Architect");
  const [approvalComment, setApprovalComment] = useState(
    "Architecture and API contracts reviewed and approved for development.",
  );
  const [error, setError] = useState(null);
  const [designDoc, setDesignDoc] = useState(
    project?.design || project?.designs?.[0] || null,
  );

  const isApproved =
    designDoc?.status === "APPROVED" ||
    project?.status === "DESIGN_APPROVED" ||
    project?.status === "DEVELOPMENT_IN_PROGRESS" ||
    project?.status === "DEVELOPMENT_COMPLETED" ||
    project?.status === "QA_PASSED" ||
    project?.status === "DEPLOYED_SUCCESS";

  const handleGenerate = async () => {
    if (!project?.id) return;
    setError(null);
    setIsGenerating(true);
    try {
      const res = await api.generateDesign(project.id);
      setDesignDoc(res);
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to trigger automated HLD generation.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!project?.id) return;
    const designId = designDoc?.id || "design-latest";
    setError(null);
    setIsApproving(true);
    try {
      const res = await api.approveDesign(project.id, designId, {
        approved_by: approverName.trim() || "Lead Architect",
        comments: approvalComment.trim(),
      });
      setDesignDoc((prev) => ({ ...prev, ...res, status: "APPROVED" }));
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to approve design specification.",
      );
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Compass className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Stage 2: Architecture & Design Document Generation
            </h3>
            <p className="text-xs text-slate-400">
              Automated High-Level Design (HLD) generation, API schemas, and
              Confluence sign-off
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !project?.id}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>
              {designDoc ? "Regenerate HLD" : "Generate HLD Specification"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">{error}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left: Design Components & Schemas */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                System Components & Microservices
              </h4>
              <span className="text-[10px] font-mono text-slate-500">
                Spring Boot 3.x + React 18
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  name: "SDLC Orchestration Engine",
                  tech: "Java 17 / Spring Boot",
                  desc: "Coordinates 5-stage lifecycle state machine transitions",
                },
                {
                  name: "Requirement Ingestion Engine",
                  tech: "Jakarta Validation / JSON",
                  desc: "Parses Markdown/JSON goals and tracking IDs",
                },
                {
                  name: "Architecture & Design Manager",
                  tech: "Confluence REST API",
                  desc: "Generates HLD specs and tracks sign-off state",
                },
                {
                  name: "Git & Repo Sync Engine",
                  tech: "GitHub REST API v3",
                  desc: "Monitors staging branches and commits in SDLC2",
                },
                {
                  name: "Automated QA Test Runner",
                  tech: "JUnit5 / TestNG",
                  desc: "Executes unit & integration test suites",
                },
                {
                  name: "Cloud Deployment Orchestrator",
                  tech: "GCP Cloud Run / Docker",
                  desc: "Container builds, deployment, and /health checks",
                },
              ].map((comp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900/80 border border-slate-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {comp.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">
                    {comp.tech}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">{comp.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Database and API contracts summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Database Schema (JPA / PostgreSQL)
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                <li className="flex items-center justify-between">
                  <span>sdlc_projects</span>
                  <span className="text-[10px] text-slate-500">UUID PK</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>sdlc_requirements</span>
                  <span className="text-[10px] text-slate-500">
                    project_id FK
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>sdlc_designs</span>
                  <span className="text-[10px] text-slate-500">
                    requirement_id FK
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>sdlc_repo_syncs</span>
                  <span className="text-[10px] text-slate-500">
                    commit tracking
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>sdlc_qa_runs</span>
                  <span className="text-[10px] text-slate-500">
                    metrics & logs
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>sdlc_deployments</span>
                  <span className="text-[10px] text-slate-500">
                    health check
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>sdlc_audit_logs</span>
                  <span className="text-[10px] text-slate-500">
                    immutable events
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <Network className="w-4 h-4 text-teal-400" />
                REST API Contracts
              </h4>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">POST</span>
                  <span className="truncate">/api/v1/sdlc/projects</span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">GET</span>
                  <span className="truncate">
                    /api/v1/sdlc/projects/&#123;id&#125;
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">POST</span>
                  <span className="truncate">
                    /api/v1/sdlc/.../requirements
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">POST</span>
                  <span className="truncate">
                    /api/v1/sdlc/.../designs/generate
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">POST</span>
                  <span className="truncate">
                    /api/v1/sdlc/.../development/sync
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">POST</span>
                  <span className="truncate">
                    /api/v1/sdlc/.../testing/execute
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">POST</span>
                  <span className="truncate">
                    /api/v1/sdlc/.../deployment/deploy
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sign-off / Confluence Card */}
        <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              HLD Sign-Off & Governance
            </h4>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  Confluence HLD Page
                </span>
                <a
                  href="https://bfsi-na-ai-engineering-v4.atlassian.net/wiki/spaces/SCRUM2/pages/93880321/SCRUM-462+HLD"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 break-all"
                >
                  <span>SCRUM-462 High-Level Design</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  Design Status
                </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold mt-1 ${
                    isApproved
                      ? "bg-teal-950 text-teal-300 border border-teal-800"
                      : "bg-indigo-950 text-indigo-300 border border-indigo-800"
                  }`}
                >
                  {isApproved ? "DESIGN_APPROVED" : "AWAITING_APPROVAL"}
                </span>
              </div>
            </div>

            {!isApproved ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Approver Name
                  </label>
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Approval Comments
                  </label>
                  <textarea
                    rows={2}
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving || !project?.id}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording Approval...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Approve & Lock Design (DESIGN_APPROVED)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-lg bg-teal-950/40 border border-teal-800/40 text-teal-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>HLD Approved. Unlocked Development Stage.</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            Design governance enforces strict architecture conformance prior to
            code sync.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignStage;
