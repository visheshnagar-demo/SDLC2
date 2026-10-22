import React, { useState, useEffect } from "react";
import Header from "./components/common/Header";
import LeftNavigation from "./components/common/LeftNavigation";
import AgentConsole from "./components/common/AgentConsole";
import DashboardView from "./components/workspaces/DashboardView";
import IntakeWorkspace from "./components/workspaces/IntakeWorkspace";
import ExtractedDataReview from "./components/workspaces/ExtractedDataReview";
import RiskAssessmentView from "./components/workspaces/RiskAssessmentView";
import PricingStudio from "./components/workspaces/PricingStudio";
import QuoteBuilder from "./components/workspaces/QuoteBuilder";
import ApprovalCenter from "./components/workspaces/ApprovalCenter";
import BindReadinessView from "./components/workspaces/BindReadinessView";
import { qtbApi } from "./services/api";
import { INITIAL_AGENT_STREAM } from "./services/mockData";

export default function App() {
  const [activeScenarioId, setActiveScenarioId] = useState("scenario_a");
  const [currentPersonaKey, setCurrentPersonaKey] = useState("underwriter");
  const [activeView, setActiveView] = useState("dashboard");
  const [activeCase, setActiveCase] = useState(null);
  const [allScenarios, setAllScenarios] = useState([]);
  const [agentLogs, setAgentLogs] = useState(INITIAL_AGENT_STREAM);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load scenarios and initial case
  useEffect(() => {
    async function initData() {
      setIsSyncing(true);
      try {
        const scenarios = await qtbApi.getScenarios();
        setAllScenarios(scenarios);
        const caseData = await qtbApi.loadScenario(activeScenarioId);
        setActiveCase(caseData);
      } catch (err) {
        console.error("Failed to load initial case data:", err);
      } finally {
        setIsSyncing(false);
      }
    }
    initData();
  }, [activeScenarioId]);

  // Scenario Switcher
  const handleSelectScenario = async (scenarioId) => {
    setIsSyncing(true);
    setActiveScenarioId(scenarioId);
    try {
      const caseData = await qtbApi.loadScenario(scenarioId);
      setActiveCase(caseData);
      setActiveView("dashboard");
    } catch (err) {
      console.error("Error switching scenario:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset Case
  const handleResetCase = () => {
    setIsSyncing(true);
    const fresh = qtbApi.resetScenarioState(activeScenarioId);
    setActiveCase({ ...fresh });
    setTimeout(() => {
      setIsSyncing(false);
    }, 300);
  };

  // Workflow Stage Navigation
  const handleNavigateStage = (stageKey) => {
    const stageToViewMap = {
      intake: "intake",
      classification: "intake",
      extraction: "extraction",
      validation: "extraction",
      risk_assessment: "risk",
      pricing: "pricing",
      quote: "quote",
      approval: "approval",
      negotiation: "quote",
      bind_readiness: "bind",
      bind_decision: "bind",
      handoff: "bind",
    };
    setActiveView(stageToViewMap[stageKey] || "dashboard");
  };

  // Execute stage simulation
  const handleExecuteStage = async (stageKey) => {
    setIsSyncing(true);
    try {
      await qtbApi.executeStage(activeCase.id, stageKey);
      const updated = await qtbApi.getCaseDetails(activeCase.id);
      setActiveCase({ ...updated });
    } catch (err) {
      console.error("Error executing stage:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Human-in-the-loop override handler
  const handleUpdateOverride = async (overrideData) => {
    setIsSyncing(true);
    try {
      const res = await qtbApi.submitOverride(activeCase.id, overrideData);
      if (res.updatedCase) {
        setActiveCase({ ...res.updatedCase });
      }
    } catch (err) {
      console.error("Error submitting override:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Pricing option selector
  const handleSelectQuoteOption = (opt) => {
    if (activeCase) {
      activeCase.grossPremium = opt.premium;
      activeCase.rateOnLine = opt.rol;
      activeCase.cedingCommission = opt.commission;
      setActiveCase({ ...activeCase });
    }
  };

  // Save quote handler
  const handleSaveQuote = async (quoteData) => {
    setIsSyncing(true);
    try {
      await qtbApi.saveQuote(activeCase.id, quoteData);
      if (activeCase) {
        activeCase.requestedLimit = quoteData.limit;
        activeCase.attachmentPoint = quoteData.retention;
        activeCase.grossPremium = quoteData.premium;
        activeCase.cedingCommission = quoteData.commission;
        setActiveCase({ ...activeCase });
      }
    } catch (err) {
      console.error("Error saving quote:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Approval submission
  const handleSubmitApproval = async (approvalData) => {
    setIsSyncing(true);
    try {
      await qtbApi.submitApproval(
        activeCase.id,
        "appr-1",
        approvalData.decision,
        approvalData.comments,
        approvalData.approverName,
      );
      const updated = await qtbApi.getCaseDetails(activeCase.id);
      setActiveCase({ ...updated });
    } catch (err) {
      console.error("Error submitting approval:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Bind execution
  const handleExecuteBind = async (bindPayload) => {
    setIsSyncing(true);
    try {
      await qtbApi.executeBind(activeCase.id, bindPayload);
      const updated = await qtbApi.getCaseDetails(activeCase.id);
      setActiveCase({ ...updated });
    } catch (err) {
      console.error("Error executing bind:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Top Persistent Case Header */}
      <Header
        activeCase={activeCase}
        currentPersonaKey={currentPersonaKey}
        onSelectPersona={setCurrentPersonaKey}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        onResetCase={handleResetCase}
        isSyncing={isSyncing}
      />

      {/* Main App Layout: Persistent Left Sidebar + Central Workspaces */}
      <div className="flex-1 flex overflow-hidden">
        <LeftNavigation
          activeView={activeView}
          onSelectView={setActiveView}
          activeCase={activeCase}
          unreadAgentLogsCount={agentLogs.length}
          onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
          isConsoleOpen={isConsoleOpen}
        />

        {/* Workspace Central Container */}
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          {activeView === "dashboard" && (
            <DashboardView
              activeCase={activeCase}
              allScenarios={allScenarios}
              onSelectScenario={handleSelectScenario}
              onNavigateStage={handleNavigateStage}
              onExecuteStage={handleExecuteStage}
            />
          )}

          {activeView === "intake" && (
            <IntakeWorkspace
              activeCase={activeCase}
              onNextStage={(next) => setActiveView(next)}
            />
          )}

          {activeView === "extraction" && (
            <ExtractedDataReview
              activeCase={activeCase}
              onUpdateOverride={handleUpdateOverride}
              onNextStage={(next) => setActiveView(next)}
            />
          )}

          {activeView === "risk" && (
            <RiskAssessmentView
              activeCase={activeCase}
              onNextStage={(next) => setActiveView(next)}
            />
          )}

          {activeView === "pricing" && (
            <PricingStudio
              activeCase={activeCase}
              onSelectQuoteOption={handleSelectQuoteOption}
              onNextStage={(next) => setActiveView(next)}
            />
          )}

          {activeView === "quote" && (
            <QuoteBuilder
              activeCase={activeCase}
              onSaveQuote={handleSaveQuote}
              onNextStage={(next) => setActiveView(next)}
            />
          )}

          {activeView === "approval" && (
            <ApprovalCenter
              activeCase={activeCase}
              currentPersonaKey={currentPersonaKey}
              onSubmitApproval={handleSubmitApproval}
              onNextStage={(next) => setActiveView(next)}
            />
          )}

          {activeView === "bind" && (
            <BindReadinessView
              activeCase={activeCase}
              onExecuteBind={handleExecuteBind}
            />
          )}
        </main>
      </div>

      {/* Real-time Agent Reasoning Console (Bottom Drawer) */}
      <AgentConsole
        logs={agentLogs}
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
      />
    </div>
  );
}
