import axios from "axios";
import { INITIAL_SCENARIOS, INITIAL_AGENT_STREAM } from "./mockData";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// In-memory fallback state for static prototype execution
let currentScenarioId = "scenario_a";
let scenarioStates = JSON.parse(JSON.stringify(INITIAL_SCENARIOS));
let agentLogs = [...INITIAL_AGENT_STREAM];

export const qtbApi = {
  // Scenarios
  getScenarios: async () => {
    try {
      const res = await apiClient.get("/api/v1/qtb/scenarios");
      return res.data;
    } catch {
      return Object.values(scenarioStates).map((s) => ({
        id: s.id,
        title: s.title,
        cedentName: s.cedentName,
        lineOfBusiness: s.lineOfBusiness,
        requestedLimit: s.requestedLimit,
        status: s.status,
        confidence: s.overallConfidence,
        requiresReferral: s.requiresReferral,
      }));
    }
  },

  loadScenario: async (scenarioId) => {
    try {
      const res = await apiClient.post(
        `/api/v1/qtb/scenarios/${scenarioId}/load`,
      );
      currentScenarioId = scenarioId;
      return res.data;
    } catch {
      currentScenarioId = scenarioId;
      if (!scenarioStates[scenarioId]) {
        scenarioStates[scenarioId] = JSON.parse(
          JSON.stringify(
            INITIAL_SCENARIOS[scenarioId] || INITIAL_SCENARIOS.scenario_a,
          ),
        );
      }
      return scenarioStates[scenarioId];
    }
  },

  // Case details
  getCaseDetails: async (caseId) => {
    try {
      const res = await apiClient.get(`/api/v1/qtb/cases/${caseId}`);
      return res.data;
    } catch {
      return scenarioStates[currentScenarioId] || scenarioStates.scenario_a;
    }
  },

  // Stages
  getCaseStages: async (caseId) => {
    try {
      const res = await apiClient.get(`/api/v1/qtb/cases/${caseId}/stages`);
      return res.data;
    } catch {
      const activeCase =
        scenarioStates[currentScenarioId] || scenarioStates.scenario_a;
      return {
        caseId: activeCase.id,
        currentStageKey: activeCase.currentStageKey,
        status: activeCase.status,
      };
    }
  },

  executeStage: async (caseId, stageKey) => {
    try {
      const res = await apiClient.post(
        `/api/v1/qtb/cases/${caseId}/stages/${stageKey}/execute`,
      );
      return res.data;
    } catch {
      const activeCase =
        scenarioStates[currentScenarioId] || scenarioStates.scenario_a;
      activeCase.currentStageKey = stageKey;
      return {
        success: true,
        stageKey,
        status: "EXECUTED",
        agentReasoning: `Simulated agent execution completed for stage: ${stageKey}`,
        confidenceScore: 98.5,
      };
    }
  },

  // Human Override
  submitOverride: async (caseId, overrideData) => {
    try {
      const res = await apiClient.post(
        `/api/v1/qtb/cases/${caseId}/overrides`,
        overrideData,
      );
      return res.data;
    } catch {
      const activeCase =
        scenarioStates[currentScenarioId] || scenarioStates.scenario_a;
      if (overrideData.fieldId) {
        const field = activeCase.extractedFields.find(
          (f) => f.id === overrideData.fieldId,
        );
        if (field) {
          field.value = overrideData.newValue;
          field.verified = true;
          field.isMissing = false;
          field.confidence = 100;
        }
      }
      if (overrideData.clearException) {
        activeCase.completenessCheck.status = "OVERRIDDEN_PASSED";
        activeCase.status = "Ready to Price";
      }
      return { success: true, updatedCase: activeCase };
    }
  },

  // Pricing
  calculatePricing: async (caseId, pricingParams) => {
    try {
      const res = await apiClient.post(
        `/api/v1/qtb/cases/${caseId}/pricing/calculate`,
        pricingParams,
      );
      return res.data;
    } catch {
      const activeCase =
        scenarioStates[currentScenarioId] || scenarioStates.scenario_a;
      return activeCase.pricingData;
    }
  },

  // Quotes
  saveQuote: async (caseId, quoteData) => {
    try {
      const res = await apiClient.post(
        `/api/v1/qtb/cases/${caseId}/quotes`,
        quoteData,
      );
      return res.data;
    } catch {
      const activeCase =
        scenarioStates[currentScenarioId] || scenarioStates.scenario_a;
      activeCase.selectedQuote = quoteData;
      return { success: true, quote: quoteData };
    }
  },

  // Approvals
  submitApproval: async (
    caseId,
    approvalId,
    decision,
    comments,
    approverName,
  ) => {
    try {
      const res = await apiClient.post(
        `/api/v1/qtb/cases/${caseId}/approvals/${approvalId}`,
        {
          decision,
          comments,
          approverName,
        },
      );
      return res.data;
    } catch {
      const activeCase =
        scenarioStates[currentScenarioId] || scenarioStates.scenario_a;
      const hitlItem = activeCase.bindChecklist.find((c) => c.id === "c6");
      if (hitlItem) {
        hitlItem.passed = decision === "APPROVED";
        hitlItem.citation = `Signed off by ${approverName || "Underwriting Executive"}: ${comments || "Terms authorized"}`;
      }
      activeCase.status =
        decision === "APPROVED"
          ? "Approved - Ready to Bind"
          : "Approval Rejected";
      return { success: true, decision, status: activeCase.status };
    }
  },

  // Bind readiness
  getBindReadiness: async (caseId) => {
    try {
      const res = await apiClient.get(
        `/api/v1/qtb/cases/${caseId}/bind-readiness`,
      );
      return res.data;
    } catch {
      const activeCase =
        scenarioStates[currentScenarioId] || scenarioStates.scenario_a;
      return {
        allCleared: activeCase.bindChecklist.every((item) => item.passed),
        checklist: activeCase.bindChecklist,
      };
    }
  },

  // Bind execution
  executeBind: async (caseId, bindPayload) => {
    try {
      const res = await apiClient.post(
        `/api/v1/qtb/cases/${caseId}/bind`,
        bindPayload,
      );
      return res.data;
    } catch {
      const activeCase =
        scenarioStates[currentScenarioId] || scenarioStates.scenario_a;
      const binderId = `BND-GENRE-${Math.floor(100000 + Math.random() * 900000)}`;
      const pasPolicyNumber = `POL-RE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      activeCase.bindConfirmation = {
        bound: true,
        binderId,
        pasPolicyNumber,
        boundAt: new Date().toISOString(),
        boundBy:
          bindPayload?.underwriterName || "Sarah Jenkins (VP Underwriting)",
      };
      activeCase.status = "Policy Bound & Handoff Complete";
      activeCase.currentStageKey = "handoff";
      return {
        success: true,
        binderId,
        pasPolicyNumber,
        boundAt: activeCase.bindConfirmation.boundAt,
        status: activeCase.status,
      };
    }
  },

  // Audit Logs
  getAuditLogs: async (caseId) => {
    try {
      const res = await apiClient.get(`/api/v1/qtb/cases/${caseId}/audit-logs`);
      return res.data;
    } catch {
      return agentLogs;
    }
  },

  // Reset in-memory state for fresh demo scenario
  resetScenarioState: (scenarioId) => {
    scenarioStates[scenarioId] = JSON.parse(
      JSON.stringify(
        INITIAL_SCENARIOS[scenarioId] || INITIAL_SCENARIOS.scenario_a,
      ),
    );
    currentScenarioId = scenarioId;
    return scenarioStates[scenarioId];
  },
};

export default apiClient;
