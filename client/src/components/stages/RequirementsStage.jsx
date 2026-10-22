import React, { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Code2,
  Sparkles,
  Layers,
  Hash,
} from "lucide-react";
import api from "../../services/api";

const DEFAULT_REQ_TEMPLATE = `# End-to-End Automated SDLC Lifecycle Management Platform

### Objective
Provide a centralized, automated SDLC lifecycle management platform to ingest requirements, generate architecture designs, coordinate code development, execute automated QA tests, and trigger cloud deployment pipelines with end-to-end visibility and auditing.

### Key Functional Requirements
1. Requirement Ingestion & Structured Parsing with validation and tracking identifier.
2. Automated High-Level Design (HLD) document generation and sign-off workflow.
3. Code Development tracking & GitHub repository branch synchronization (visheshnagar-demo/SDLC2).
4. Automated Test Suite execution with real-time QA reporting and error diagnostics.
5. Cloud Deployment automation with post-deployment health check monitoring.
6. Interactive 5-stage visual progress stepper and audit dashboard.
`;

export const RequirementsStage = ({ project, onProjectUpdated }) => {
  const [rawContent, setRawContent] = useState(DEFAULT_REQ_TEMPLATE);
  const [format, setFormat] = useState("MARKDOWN");
  const [author, setAuthor] = useState("Product Owner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const existingReq = project?.requirements || project?.requirement;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!rawContent.trim()) {
      setError(
        "Requirement document content cannot be empty (400 Bad Request).",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitRequirements(project.id, {
        raw_content: rawContent.trim(),
        format,
        author: author.trim() || "Product Owner",
      });
      setSuccessInfo(res);
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to submit requirement document.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Stage 1: Requirement Ingestion & Structured Parsing
            </h3>
            <p className="text-xs text-slate-400">
              Submit raw requirements to parse functional goals and assign a
              tracking identifier
            </p>
          </div>
        </div>

        {existingReq && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Tracking ID:{" "}
              {existingReq.tracking_id || existingReq.id || "REQ-INGESTED"}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left column: Ingestion Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">{error}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="req-author"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Author / Reporter
                </label>
                <input
                  id="req-author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                  placeholder="e.g. Product Owner"
                />
              </div>

              <div>
                <label
                  htmlFor="req-format"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Format
                </label>
                <select
                  id="req-format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value="MARKDOWN">Markdown (.md)</option>
                  <option value="TEXT">Plain Text (.txt)</option>
                  <option value="JSON">Structured JSON (.json)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="req-content"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Requirement Document <span className="text-cyan-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setRawContent(DEFAULT_REQ_TEMPLATE)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  Load Template
                </button>
              </div>
              <textarea
                id="req-content"
                rows={10}
                required
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="Paste Markdown, user stories, or functional requirements here..."
                className="w-full font-mono text-xs p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 transition leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                Length: {rawContent.length} chars
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !project?.id}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing & Validating...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Ingest Requirements</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Parsed Output / Details */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Parsed Summary & Tracking
            </h4>

            {existingReq || successInfo ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">
                    Tracking Identifier
                  </span>
                  <span className="text-sm font-mono font-bold text-cyan-300">
                    {successInfo?.tracking_id ||
                      existingReq?.tracking_id ||
                      successInfo?.id ||
                      existingReq?.id ||
                      "REQ-SCRUM-462-01"}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                    Extracted Functional Goals
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {(
                      successInfo?.functional_goals ||
                      existingReq?.functional_goals || [
                        "Requirement Ingestion & Structured Parsing",
                        "Automated HLD Generation & Sign-off",
                        "Code Development & GitHub Sync",
                        "Automated QA Test Execution",
                        "Cloud Deployment & Health Check Verification",
                      ]
                    ).map((goal, idx) => (
                      <li key={idx} className="line-clamp-2">
                        {typeof goal === "string"
                          ? goal
                          : goal.description || goal.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">
                    READY_FOR_DESIGN
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Code2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No parsed requirements on record.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Submit requirements on the left to extract structured
                  functional goals.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            <span>Next stage: Architecture & Design Document Generation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsStage;
