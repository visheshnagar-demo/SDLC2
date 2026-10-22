import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FileText,
  Compass,
  Code2,
  CheckCircle2,
  Rocket,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import api from "../services/api";
import ProjectHeader from "../components/ProjectHeader";
import StageStepper, { STAGES } from "../components/StageStepper";
import RequirementsStage from "../components/stages/RequirementsStage";
import DesignStage from "../components/stages/DesignStage";
import DevelopmentStage from "../components/stages/DevelopmentStage";
import TestingStage from "../components/stages/TestingStage";
import DeploymentStage from "../components/stages/DeploymentStage";
import AuditLogDrawer from "../components/AuditLogDrawer";

export const DashboardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeStage, setActiveStage] = useState("requirements");
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  const fetchProjectDetails = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await api.getProject(projectId);
      setProject(data);
    } catch (err) {
      // If server does not have this specific ID yet, construct default instance for SCRUM-462
      setProject({
        id: projectId || "proj-scrum-462",
        name: "SDLC Platform (SCRUM-462)",
        description:
          "End-to-End Automated SDLC Lifecycle Management Platform for requirements parsing, HLD design, repo sync, automated QA, and deployment.",
        status: "READY_FOR_DESIGN",
        repository_url: "https://github.com/visheshnagar-demo/SDLC2",
        target_branch: "staging/ISSUE-SCRUM-462",
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails(true);
  }, [projectId]);

  const currentStageIndex = STAGES.findIndex((s) => s.key === activeStage);
  const prevStage =
    currentStageIndex > 0 ? STAGES[currentStageIndex - 1] : null;
  const nextStage =
    currentStageIndex < STAGES.length - 1
      ? STAGES[currentStageIndex + 1]
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </button>

        <span className="text-xs font-mono text-slate-500">
          Viewing SDLC Pipeline Dashboard
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-sm">Loading Project Lifecycle Data...</p>
        </div>
      ) : (
        <>
          <ProjectHeader
            project={project}
            onRefresh={() => fetchProjectDetails(false)}
            onOpenAuditLogs={() => setIsAuditDrawerOpen(true)}
            isRefreshing={isRefreshing}
          />

          <StageStepper
            activeStage={activeStage}
            onSelectStage={(stageKey) => setActiveStage(stageKey)}
            project={project}
          />

          {/* Active Stage View */}
          <div className="space-y-6">
            {activeStage === "requirements" && (
              <RequirementsStage
                project={project}
                onProjectUpdated={() => fetchProjectDetails(false)}
              />
            )}

            {activeStage === "design" && (
              <DesignStage
                project={project}
                onProjectUpdated={() => fetchProjectDetails(false)}
              />
            )}

            {activeStage === "development" && (
              <DevelopmentStage
                project={project}
                onProjectUpdated={() => fetchProjectDetails(false)}
              />
            )}

            {activeStage === "testing" && (
              <TestingStage
                project={project}
                onProjectUpdated={() => fetchProjectDetails(false)}
              />
            )}

            {activeStage === "deployment" && (
              <DeploymentStage
                project={project}
                onProjectUpdated={() => fetchProjectDetails(false)}
              />
            )}

            {/* Stage Navigation Footer */}
            <div className="flex items-center justify-between pt-4">
              {prevStage ? (
                <button
                  onClick={() => setActiveStage(prevStage.key)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-2 border border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous: {prevStage.title}</span>
                </button>
              ) : (
                <div />
              )}

              {nextStage && (
                <button
                  onClick={() => setActiveStage(nextStage.key)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition flex items-center gap-2 border border-slate-700"
                >
                  <span>Next: {nextStage.title}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <AuditLogDrawer
            projectId={project?.id}
            isOpen={isAuditDrawerOpen}
            onClose={() => setIsAuditDrawerOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
