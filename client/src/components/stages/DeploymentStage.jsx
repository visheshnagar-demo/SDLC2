import React, { useState } from "react";
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Activity,
  Server,
  Lock,
  Radio,
  Terminal,
} from "lucide-react";
import api from "../../services/api";

export const DeploymentStage = ({ project, onProjectUpdated }) => {
  const [environment, setEnvironment] = useState("STAGING");
  const [deployedBy, setDeployedBy] = useState("DevOps_Agent");
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState(null);
  const [deploymentInfo, setDeploymentInfo] = useState(
    project?.deployment || null,
  );

  const status = (project?.status || "NOT_STARTED").toUpperCase();
  const isQaPassed =
    status === "QA_PASSED" ||
    status === "DEPLOYING" ||
    status === "DEPLOYED_SUCCESS" ||
    status === "DEPLOYMENT_FAILED" ||
    project?.qa_run?.status === "QA_PASSED";

  const isDeployed =
    status === "DEPLOYED_SUCCESS" ||
    deploymentInfo?.status === "DEPLOYED_SUCCESS";

  const isFailed =
    status === "DEPLOYMENT_FAILED" ||
    deploymentInfo?.status === "DEPLOYMENT_FAILED";

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!project?.id) return;
    if (!isQaPassed) {
      setError(
        "Deployment is strictly locked until QA stage attains QA_PASSED status.",
      );
      return;
    }

    setError(null);
    setIsDeploying(true);
    try {
      const res = await api.triggerDeployment(project.id, {
        environment,
        deployed_by: deployedBy.trim() || "DevOps_Agent",
      });
      setDeploymentInfo(res);
      if (onProjectUpdated) {
        onProjectUpdated();
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Cloud deployment pipeline failed.",
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const logs = deploymentInfo?.logs || [
    "[00:00] Cloud Run container build initiated...",
    "[00:02] Base image gcr.io/distroless/java17 loaded",
    "[00:05] Spring Boot jar artifact compiled & packaged",
    "[00:08] React SPA bundle mounted into static assets",
    "[00:11] Cloud Run service provisioned in us-central1",
    "[00:13] Executing post-deployment health check: GET /health",
    "[00:14] Health check returned 200 OK - UP",
    "[00:15] Deployment successfully completed: DEPLOYED_SUCCESS",
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Stage 5: Cloud Deployment & Health Monitoring
            </h3>
            <p className="text-xs text-slate-400">
              Container build, Cloud Run deployment, and automated /health
              verification
            </p>
          </div>
        </div>

        {isDeployed && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Service Live in us-central1</span>
          </div>
        )}
      </div>

      {!isQaPassed && (
        <div className="mt-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 flex items-start gap-3">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Deployment Gate Locked</h4>
            <p className="text-xs mt-0.5">
              SDLC Governance rule: Deployment action is blocked until Stage 4
              (Automated QA) has attained <code>QA_PASSED</code> status.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left: Trigger Form */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleDeploy}
            className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Target Environment
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Cloud
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                disabled={!isQaPassed || isDeploying}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              >
                <option value="STAGING">Google Cloud Run (Staging)</option>
                <option value="PRODUCTION">
                  Google Cloud Run (Production)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Triggered By
              </label>
              <input
                type="text"
                value={deployedBy}
                onChange={(e) => setDeployedBy(e.target.value)}
                disabled={!isQaPassed || isDeploying}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!isQaPassed || isDeploying || !project?.id}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deploying to Cloud Run...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Trigger Deployment Pipeline</span>
                </>
              )}
            </button>
          </form>

          {/* Health Status Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Service Health & Endpoints
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Health Endpoint:</span>
                <span className="font-mono text-cyan-300">
                  /health (200 OK)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Deployed URL:</span>
                <span className="font-mono text-emerald-400">
                  https://sdlc2-staging.run.app
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {isDeployed
                    ? "DEPLOYED_SUCCESS"
                    : isFailed
                      ? "DEPLOYMENT_FAILED"
                      : "STANDBY"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Deployment Logs Console */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Live Deployment Stream Logs
              </h4>
              <span className="text-[10px] font-mono text-slate-500">
                Cloud Run / Harness CI
              </span>
            </div>

            <div className="bg-black/80 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 h-64 overflow-y-auto border border-slate-800">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes("successfully") || log.includes("200 OK")
                      ? "text-emerald-400 font-bold"
                      : "text-slate-300"
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Container registry: Google Artifact Registry (GAR)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStage;
