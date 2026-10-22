import React from "react";
import {
  FolderGit2,
  GitBranch,
  RefreshCw,
  History,
  Calendar,
  ExternalLink,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

export const ProjectHeader = ({
  project,
  onRefresh,
  onOpenAuditLogs,
  isRefreshing,
}) => {
  if (!project) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.name || "SDLC Project"}
            </h1>
            <StatusBadge status={project.status} />
          </div>

          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            {project.description ||
              "Centralized end-to-end SDLC lifecycle management platform with automated requirements parsing, HLD design, repo sync, QA testing, and cloud deployment."}
          </p>

          <div className="flex items-center gap-4 sm:gap-6 mt-4 text-xs text-slate-400 flex-wrap">
            <div className="flex items-center gap-1.5 font-mono">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>ID: {project.id || "N/A"}</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span>
                Branch: {project.target_branch || "staging/ISSUE-SCRUM-462"}
              </span>
            </div>

            {project.repository_url && (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition"
              >
                <span>GitHub Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {project.created_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(project.created_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-cyan-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuditLogs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 text-sm font-medium transition"
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
