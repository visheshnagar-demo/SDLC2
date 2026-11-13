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

function normalizeCase(backendCase, scenarioId = "scenario_a") {
  if (!backendCase) {
    return INITIAL_SCENARIOS[scenarioId] || INITIAL_SCENARIOS.scenario_a;
  }

  const scenKey = (
    scenarioId ||
    backendCase.scenario_id ||
    backendCase.scenarioId ||
    "scenario_a"
  ).toLowerCase();

  const mockBase = INITIAL_SCENARIOS[scenKey] || INITIAL_SCENARIOS.scenario_a;

  const currentStageRaw = (
    backendCase.current_stage ||
    backendCase.currentStageKey ||
    mockBase.currentStageKey ||
    "intake"
  ).toLowerCase();

  const stageKeyMap = {
    intake: "intake",
    cedent_submission: "intake",
    classification: "classification",
    intake_and_classification: "classification",
    extraction: "extraction",
    data_extraction: "extraction",
    validation: "validation",
    completeness_validation: "validation",
    risk: "risk_assessment",
    risk_assessment: "risk_assessment",
    pricing: "pricing",
    actuarial_pricing: "pricing",
    quote: "quote",
    quote_structuring: "quote",
    approval: "approval",
    review_and_approval: "approval",
    negotiation: "negotiation",
    bind: "bind_readiness",
    bind_readiness: "bind_readiness",
    bind_decision: "bind_decision",
    handoff: "handoff",
    contract_handoff: "handoff",
  };
  const normalizedStageKey = stageKeyMap[currentStageRaw] || currentStageRaw;

  // Format extracted fields if from backend
  let extractedFields = mockBase.extractedFields;
  if (
    Array.isArray(backendCase.extracted_fields) &&
    backendCase.extracted_fields.length > 0
  ) {
    extractedFields = backendCase.extracted_fields.map((f, idx) => ({
      id: f.id || `f${idx + 1}`,
      name: f.field_name || f.name || `Field ${idx + 1}`,
      value:
        f.extracted_value !== undefined
          ? String(f.extracted_value)
          : f.value || "N/A",
      confidence:
        typeof f.confidence_score === "number"
          ? Math.round(
              f.confidence_score > 1
                ? f.confidence_score
                : f.confidence_score * 100,
            )
          : f.confidence || 95,
      citation: f.source_citation_page
        ? `${f.source_document || "Slip"} (p.${f.source_citation_page})`
        : f.citation || "Document Citation",
      verified: f.is_verified ?? f.verified ?? true,
      category: f.category || "Coverage",
      isMissing: f.is_missing ?? f.isMissing ?? false,
    }));
  } else if (Array.isArray(backendCase.extractedFields)) {
    extractedFields = backendCase.extractedFields;
  }

  // Format bind checklist if from backend
  let bindChecklist = mockBase.bindChecklist;
  let bindConfirmation = mockBase.bindConfirmation;
  if (backendCase.bind_checklist) {
    const chk = backendCase.bind_checklist;
    bindChecklist = [
      {
        id: "c1",
        label: "Sanctions & AML Clearance (OFAC / WorldCheck)",
        passed: Boolean(chk.sanctions_cleared),
        agent: "Legal & Compliance Agent",
        citation: "Ref: OFAC-2026-VERIFIED",
        timestamp: "09:14 UTC",
      },
      {
        id: "c2",
        label: "Pricing Hurdle Cleared (Target RoE ≥ 12.0%)",
        passed: Boolean(chk.pricing_hurdle_cleared),
        agent: "Pricing Agent",
        citation: "Hurdle Verified (RoE ≥ 12.0%)",
        timestamp: "09:22 UTC",
      },
      {
        id: "c3",
        label: "Regional Capacity Allocation Confirmed",
        passed: Boolean(chk.capacity_approved),
        agent: "Portfolio Agent",
        citation: "Capacity Allocation Approved",
        timestamp: "09:30 UTC",
      },
      {
        id: "c4",
        label: 'Cedent Financial Strength Rating (A.M. Best "A" or better)',
        passed: Boolean(chk.financial_rating_confirmed),
        agent: "Risk Assessment Agent",
        citation: 'Financial Rating Confirmed ("A" Grade)',
        timestamp: "09:35 UTC",
      },
      {
        id: "c5",
        label: "Contract Wording & Jurisdiction Clauses Approved",
        passed: Boolean(chk.wording_approved),
        agent: "Legal & Compliance Agent",
        citation: "Standard Gen Re 2026 Wording",
        timestamp: "09:40 UTC",
      },
      {
        id: "c6",
        label: "Human-in-the-Loop Authority Authorization Verified",
        passed: Boolean(chk.hitl_signed_off),
        agent: "Master Orchestrator",
        citation: chk.bound_by
          ? `Authorized by ${chk.bound_by}`
          : "Authority Sign-Off",
        timestamp: "09:45 UTC",
      },
    ];

    if (chk.bound_at || (chk.is_ready_to_bind && chk.binder_certificate_hash)) {
      bindConfirmation = {
        bound: Boolean(chk.bound_at || chk.binder_certificate_hash),
        binderId: chk.binder_certificate_hash || "BND-GENRE-889102",
        pasPolicyNumber: `POL-RE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        boundAt: chk.bound_at || new Date().toISOString(),
        boundBy: chk.bound_by || "Sarah Jenkins (VP Underwriting)",
      };
    }
  }

  const reqLimitNumeric =
    typeof backendCase.requested_limit === "number"
      ? backendCase.requested_limit
      : typeof backendCase.requestedLimit === "number"
        ? backendCase.requestedLimit
        : mockBase.limitNumeric;

  const reqLimitStr =
    typeof backendCase.requested_limit === "number"
      ? `$${backendCase.requested_limit.toLocaleString()}`
      : backendCase.requestedLimit || mockBase.requestedLimit;

  const retentionStr =
    typeof backendCase.retention_amount === "number"
      ? `$${backendCase.retention_amount.toLocaleString()}`
      : backendCase.attachmentPoint || mockBase.attachmentPoint;

  return {
    ...mockBase,
    ...backendCase,
    id: backendCase.id || backendCase.scenario_id || mockBase.id,
    caseNumber:
      backendCase.case_number || backendCase.caseNumber || mockBase.caseNumber,
    case_number:
      backendCase.case_number || backendCase.caseNumber || mockBase.caseNumber,
    title: backendCase.title || mockBase.title,
    cedentName:
      backendCase.cedent_name || backendCase.cedentName || mockBase.cedentName,
    cedent_name:
      backendCase.cedent_name || backendCase.cedentName || mockBase.cedentName,
    brokerName:
      backendCase.broker_name || backendCase.brokerName || mockBase.brokerName,
    broker_name:
      backendCase.broker_name || backendCase.brokerName || mockBase.brokerName,
    lineOfBusiness:
      backendCase.line_of_business ||
      backendCase.lineOfBusiness ||
      mockBase.lineOfBusiness,
    line_of_business:
      backendCase.line_of_business ||
      backendCase.lineOfBusiness ||
      mockBase.lineOfBusiness,
    requestedLimit: reqLimitStr,
    requested_limit: reqLimitNumeric,
    limitNumeric: reqLimitNumeric,
    attachmentPoint: retentionStr,
    attachment_point: retentionStr,
    grossPremium:
      backendCase.gross_premium ||
      backendCase.grossPremium ||
      mockBase.grossPremium,
    gross_premium:
      backendCase.gross_premium ||
      backendCase.grossPremium ||
      mockBase.grossPremium,
    cedingCommission:
      backendCase.ceding_commission ||
      backendCase.cedingCommission ||
      mockBase.cedingCommission,
    ceding_commission:
      backendCase.ceding_commission ||
      backendCase.cedingCommission ||
      mockBase.cedingCommission,
    rateOnLine:
      backendCase.rate_on_line || backendCase.rateOnLine || mockBase.rateOnLine,
    rate_on_line:
      backendCase.rate_on_line || backendCase.rateOnLine || mockBase.rateOnLine,
    overallConfidence:
      typeof backendCase.overall_confidence === "number"
        ? Math.round(
            backendCase.overall_confidence > 1
              ? backendCase.overall_confidence
              : backendCase.overall_confidence * 100,
          )
        : backendCase.overallConfidence || mockBase.overallConfidence,
    overall_confidence:
      typeof backendCase.overall_confidence === "number"
        ? Math.round(
            backendCase.overall_confidence > 1
              ? backendCase.overall_confidence
              : backendCase.overall_confidence * 100,
          )
        : backendCase.overallConfidence || mockBase.overallConfidence,
    status: backendCase.status || mockBase.status,
    currentStageKey: normalizedStageKey,
    current_stage: normalizedStageKey,
    requiresReferral:
      backendCase.requires_referral ??
      backendCase.requiresReferral ??
      mockBase.requiresReferral,
    requires_referral:
      backendCase.requires_referral ??
      backendCase.requiresReferral ??
      mockBase.requiresReferral,
    documents: backendCase.documents || mockBase.documents,
    extractedFields,
    completenessCheck:
      backendCase.completenessCheck || mockBase.completenessCheck,
    riskAssessment: backendCase.riskAssessment || mockBase.riskAssessment,
    pricingData: backendCase.pricingData || mockBase.pricingData,
    negotiation: backendCase.negotiation || mockBase.negotiation,
    bindChecklist,
    bindConfirmation,
  };
}

export const qtbApi = {
  // Scenarios
  getScenarios: async () => {
    try {
      const res = await apiClient.get("/api/v1/qtb/scenarios");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((s) => ({
          id: (s.scenario_id || s.id || "scenario_a").toLowerCase(),
          title: s.name || s.title || "Synthetic Scenario",
          cedentName: s.cedent_name || s.cedentName || "Pacific Mutual",
          lineOfBusiness:
            s.line_of_business || s.lineOfBusiness || "Property & Casualty",
          requestedLimit:
            typeof s.requested_limit === "number"
              ? `$${s.requested_limit.toLocaleString()}`
              : s.requestedLimit || "$10,000,000",
          status: s.status || "In Review",
          confidence:
            s.confidence || s.overall_confidence || s.overallConfidence || 95,
          requiresReferral: s.requires_referral ?? s.requiresReferral ?? false,
        }));
      }
      throw new Error("Invalid scenario list format");
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
      return normalizeCase(res.data, scenarioId);
    } catch {
      currentScenarioId = scenarioId;
      if (!scenarioStates[scenarioId]) {
        scenarioStates[scenarioId] = JSON.parse(
          JSON.stringify(
            INITIAL_SCENARIOS[scenarioId] || INITIAL_SCENARIOS.scenario_a,
          ),
        );
      }
      return normalizeCase(scenarioStates[scenarioId], scenarioId);
    }
  },

  // Case details
  getCaseDetails: async (caseId) => {
    try {
      const res = await apiClient.get(`/api/v1/qtb/cases/${caseId}`);
      return normalizeCase(res.data, currentScenarioId);
    } catch {
      return normalizeCase(
        scenarioStates[currentScenarioId] || scenarioStates.scenario_a,
        currentScenarioId,
      );
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
      const hitlItem = (activeCase.bindChecklist || []).find(
        (c) => c.id === "c6",
      );
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
      const chk = activeCase.bindChecklist || [];
      return {
        allCleared: chk.length > 0 && chk.every((item) => item?.passed),
        checklist: chk,
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
    return normalizeCase(scenarioStates[scenarioId], scenarioId);
  },
};

export default apiClient;
