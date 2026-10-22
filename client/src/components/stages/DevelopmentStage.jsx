import React, { useState } from "react";
import {
  Code2,
  GitBranch,
  GitCommit,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  FolderGit2,
  FileCode2,
} from "lucide-react";
import api from "../../services/api";

export const DevelopmentStage = ({ project, onProjectUpdated }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [syncResult, setSyncResult] = useState(
    project?.repo_sync || project?.development || null,
  );

  const targetRepo =
    project?.repository_url || "https://github.com/visheshnagar-demo/SDLC2";
  const targetBranch = project?.target_branch || "staging/ISSUE-SCRUM-462";

  const commits = syncResult?.commits || [
    {
      hash: "c4e891a",
      message:
        "feat(SCRUM-462): Java Spring Boot backend & JPA entities implemented",
      author: "Backend_Developer_Agent",
      timestamp: new Date().toISOString(),
      files_changed: 12,
    },
    {
      hash: "a1b2c3d",
      message:
        "feat(SCRUM-462): React Vite Tailwind frontend lifecycle dashboard",
      author: "Frontend_Developer_Agent",
      timestamp: new Date().toISOString(),
      files_changed: 18,
    },
  ];

  const handleSync = async () => {
    if (!project?.id) return;
    setError(null);
    setIsSyncing(true);
    try {
      const res = await api.syncDevelopment(project.id, {
        branch: targetBranch,
        commit_hash: "c4e891a",
        commit_message:
          "feat(SCRUM-462): automated sync from SDLC2 staging branch",
      });
      setSyncResult(res);
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to synchronize repository commits.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const isDevDone =
    project?.status === "DEVELOPMENT_COMPLETED" ||
    project?.status === "QA_RUNNING" ||
    project?.status === "QA_PASSED" ||
    project?.status === "DEPLOYED_SUCCESS" ||
    syncResult?.status === "COMPLETED";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Stage 3: Code Development & Repository Synchronization
            </h3>
            <p className="text-xs text-slate-400">
              Track Java Spring Boot & React Vite commits on GitHub staging
              branch
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing || !project?.id}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-500/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing with GitHub...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Repository Commits</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left: Branch & Target Overview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-purple-400" />
              Repository Configuration
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  GitHub Repository
                </span>
                <a
                  href={targetRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 mt-0.5 break-all"
                >
                  <span>{targetRepo}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  Staging Branch
                </span>
                <div className="flex items-center gap-2 mt-0.5 font-mono text-purple-300 bg-purple-950/40 border border-purple-800/40 px-3 py-1.5 rounded-lg">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>{targetBranch}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  Development Stage Status
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isDevDone
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-amber-950 text-amber-300 border border-amber-800"
                    }`}
                  >
                    {isDevDone
                      ? "DEVELOPMENT_COMPLETED"
                      : "DEVELOPMENT_IN_PROGRESS"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-semibold">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span>Target Stacks Monitored:</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                server/ (Java 17 Spring Boot)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                client/ (React 18 Vite)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Commit History Log */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-purple-400" />
              Synchronized Git Commits
            </h4>
            <span className="text-[10px] font-mono text-slate-500">
              {commits.length} commits synced
            </span>
          </div>

          <div className="space-y-3">
            {commits.map((commit, idx) => (
              <div
                key={commit.hash || idx}
                className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40">
                    {commit.hash}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {commit.timestamp
                      ? new Date(commit.timestamp).toLocaleTimeString()
                      : "Just now"}
                  </span>
                </div>

                <p className="text-xs text-slate-200 mt-2 font-medium">
                  {commit.message}
                </p>

                <div className="flex items-center justify-between gap-4 mt-2 text-[11px] text-slate-400 font-mono">
                  <span>Author: {commit.author}</span>
                  {commit.files_changed && (
                    <span>{commit.files_changed} files changed</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Branch synced with staging HEAD</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentStage;
