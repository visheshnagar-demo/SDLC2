import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Seed mock data for offline/standalone execution
const SEED_SUBMISSIONS = [
  {
    id: "fac-sub-001",
    submission_number: "FAC-2026-0089",
    ceding_company: "Global Specialty Insurers Corp",
    insured_name: "Apex Health Systems LLC",
    line_of_business: "Cyber Risk",
    policy_limit: 10000000,
    attachment_point: 2000000,
    retention: 250000,
    gross_premium: 180000,
    effective_date: "2026-06-01",
    expiry_date: "2027-06-01",
    industry: "Healthcare & Hospital Networks",
    revenue_band: "$500M - $1B",
    jurisdiction: "United States (NY/NJ)",
    status: "IN_REVIEW",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_underwriter: "Marcus Vance (Senior UW)",
    underwriter_limit: 5000000,
    risk_score: {
      composite_score: 85,
      risk_grade: "LOW_RISK",
      evaluated_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      factors: [
        {
          name: "MFA Enforcement across All Endpoints",
          category: "Security Controls",
          score: 25,
          max_score: 25,
          status: "PASS",
          notes: "FIDO2 hardware tokens enabled on 100% of staff accounts.",
        },
        {
          name: "Endpoint Detection & Response (EDR)",
          category: "Security Controls",
          score: 20,
          max_score: 20,
          status: "PASS",
          notes: "CrowdStrike Falcon deployed across all hospital endpoints.",
        },
        {
          name: "Immutable Air-Gapped Backups",
          category: "Business Continuity",
          score: 20,
          max_score: 20,
          status: "PASS",
          notes: "Daily snapshots replicated to immutable AWS S3 bucket.",
        },
        {
          name: "3-Year Historical Loss Ratio",
          category: "Claims History",
          score: 20,
          max_score: 20,
          status: "PASS",
          notes: "12.5% 3-year loss ratio with 0 major ransomware events.",
        },
      ],
    },
    documents: [
      {
        id: "doc-01",
        name: "Cyber_Application_ApexHealth_2026.pdf",
        type: "application",
        size_mb: 2.4,
        status: "UPLOADED",
        uploaded_at: "2026-05-18T10:00:00Z",
      },
      {
        id: "doc-02",
        name: "ApexHealth_3Yr_Loss_Runs.xlsx",
        type: "loss_runs",
        size_mb: 1.1,
        status: "UPLOADED",
        uploaded_at: "2026-05-18T10:02:00Z",
      },
      {
        id: "doc-03",
        name: "Audited_Financials_FY2025.pdf",
        type: "financials",
        size_mb: 5.8,
        status: "PENDING",
        uploaded_at: null,
      },
    ],
    quotes: [
      {
        id: "quote-01",
        layer_limit: 10000000,
        share_offered_pct: 50.0,
        ceding_commission_pct: 15.0,
        gross_ceded_premium: 90000,
        net_reinsurance_premium: 76500,
        subjectivities:
          "Subject to receipt and satisfactory review of audited FY2025 financial statements.",
        conditions:
          "Ransomware sub-limit 50% of layer limit; 24h incident notification requirement.",
        exclusions:
          "War, hostile cyber acts attributed to nation-state warfare, prior known incidents.",
        status: "PENDING_APPROVAL",
        created_at: new Date().toISOString(),
      },
    ],
    referral: {
      id: "ref-001",
      required: true,
      requested_limit: 10000000,
      underwriter_limit: 5000000,
      reason:
        "Requested limit ($10.00M) exceeds active underwriter authority ($5.00M). Automatic escalation triggered.",
      status: "PENDING",
      manager_decision: "PENDING",
      manager_notes: "",
      escalated_at: new Date().toISOString(),
    },
    audit_trail: [
      {
        id: "aud-01",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        actor: "sarah.cedent@globalsafe.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_CREATED",
        details: "Initial facultative intake submitted with 2 attachments.",
      },
      {
        id: "aud-02",
        timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        actor: "m.vance@apexre.com",
        role: "Reinsurance Underwriter",
        action: "STATUS_CHANGED",
        details: "Status transitioned from RECEIVED to IN_REVIEW.",
      },
      {
        id: "aud-03",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        actor: "system-scoring-engine",
        role: "System",
        action: "RISK_SCORED",
        details:
          "Evaluated 4 Cyber risk factors. Calculated composite score: 85 (LOW_RISK).",
      },
    ],
  },
  {
    id: "fac-sub-002",
    submission_number: "FAC-2026-0090",
    ceding_company: "Beacon Re Underwriting Partners",
    insured_name: "BioGenix Therapeutics Inc",
    line_of_business: "D&O",
    policy_limit: 15000000,
    attachment_point: 5000000,
    retention: 500000,
    gross_premium: 320000,
    effective_date: "2026-07-01",
    expiry_date: "2027-07-01",
    industry: "Biotechnology & Life Sciences",
    revenue_band: "$250M - $500M",
    jurisdiction: "United States (DE/CA)",
    status: "INFO_REQUESTED",
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_underwriter: "Elena Rostova (Underwriter)",
    underwriter_limit: 5000000,
    risk_score: {
      composite_score: 62,
      risk_grade: "MODERATE_RISK",
      evaluated_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      factors: [
        {
          name: "Financial Strength & Liquidity",
          category: "Financials",
          score: 20,
          max_score: 30,
          status: "WARNING",
          notes: "R&D cash burn rate high; 18 months runway.",
        },
        {
          name: "Board Composition & Governance",
          category: "Governance",
          score: 25,
          max_score: 25,
          status: "PASS",
          notes: "Independent audit committee with NASDAQ compliance.",
        },
        {
          name: "Historical Securities Litigation",
          category: "Claims",
          score: 17,
          max_score: 25,
          status: "PASS",
          notes: "1 dismissed class action in 2022; no active litigation.",
        },
        {
          name: "5-Year Cumulative Loss Ratio",
          category: "Claims History",
          score: 0,
          max_score: 20,
          status: "FAIL",
          notes: "Prior loss ratio elevated at 64%.",
        },
      ],
    },
    documents: [
      {
        id: "doc-04",
        name: "BioGenix_D&O_Application.pdf",
        type: "application",
        size_mb: 3.1,
        status: "UPLOADED",
        uploaded_at: "2026-05-17T08:00:00Z",
      },
      {
        id: "doc-05",
        name: "BioGenix_Loss_History_5yr.xlsx",
        type: "loss_runs",
        size_mb: 0.9,
        status: "UPLOADED",
        uploaded_at: "2026-05-17T08:05:00Z",
      },
      {
        id: "doc-06",
        name: "SEC_Form_10K_FY2025.pdf",
        type: "financials",
        size_mb: 8.2,
        status: "UPLOADED",
        uploaded_at: "2026-05-17T08:10:00Z",
      },
    ],
    quotes: [],
    referral: {
      id: "ref-002",
      required: true,
      requested_limit: 15000000,
      underwriter_limit: 5000000,
      reason:
        "Requested limit ($15.00M) exceeds active underwriter authority ($5.00M).",
      status: "PENDING",
      manager_decision: "PENDING",
      manager_notes: "",
      escalated_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    },
    audit_trail: [
      {
        id: "aud-04",
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        actor: "tim.cedant@beaconre.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_CREATED",
        details: "D&O facultative submission ingested.",
      },
      {
        id: "aud-05",
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        actor: "e.rostova@apexre.com",
        role: "Reinsurance Underwriter",
        action: "INFO_REQUESTED",
        details:
          "Requested clarification on clinical trial Phase III liabilities.",
      },
    ],
  },
  {
    id: "fac-sub-003",
    submission_number: "FAC-2026-0091",
    ceding_company: "Vanguard Mutual Re",
    insured_name: "Metro Surgical Group PC",
    line_of_business: "Medical Professional Liability",
    policy_limit: 5000000,
    attachment_point: 1000000,
    retention: 100000,
    gross_premium: 120000,
    effective_date: "2026-08-01",
    expiry_date: "2027-08-01",
    industry: "Healthcare (Surgical Specialist Clinic)",
    revenue_band: "$50M - $100M",
    jurisdiction: "United States (FL)",
    status: "QUOTED",
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_underwriter: "David Chen (Underwriter)",
    underwriter_limit: 5000000,
    risk_score: {
      composite_score: 91,
      risk_grade: "LOW_RISK",
      evaluated_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      factors: [
        {
          name: "Physician Board Certification & Credentialing",
          category: "Credentialing",
          score: 35,
          max_score: 35,
          status: "PASS",
          notes: "100% board certified; robust re-credentialing protocol.",
        },
        {
          name: "Informed Consent & Surgical Safety Protocols",
          category: "Clinical Risk",
          score: 30,
          max_score: 30,
          status: "PASS",
          notes: "WHO surgical checklist mandated across all 8 OR suites.",
        },
        {
          name: "5-Year Historical Malpractice Loss Ratio",
          category: "Claims History",
          score: 26,
          max_score: 35,
          status: "PASS",
          notes: "Loss ratio 18.2% across past 5 years.",
        },
      ],
    },
    documents: [
      {
        id: "doc-07",
        name: "MedMal_Intake_MetroSurg.pdf",
        type: "application",
        size_mb: 1.8,
        status: "UPLOADED",
        uploaded_at: "2026-05-15T11:00:00Z",
      },
      {
        id: "doc-08",
        name: "MetroSurg_Loss_Runs_5yr.xlsx",
        type: "loss_runs",
        size_mb: 2.1,
        status: "UPLOADED",
        uploaded_at: "2026-05-15T11:05:00Z",
      },
    ],
    quotes: [
      {
        id: "quote-02",
        layer_limit: 5000000,
        share_offered_pct: 100.0,
        ceding_commission_pct: 12.5,
        gross_ceded_premium: 120000,
        net_reinsurance_premium: 105000,
        subjectivities:
          "Subject to no open malpractice claims occurring prior to 2026-08-01.",
        conditions:
          "Standard MedMal claims-made wording with 3-year ERP options.",
        exclusions: "Experimental bariatric surgery procedures.",
        status: "OFFERED",
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ],
    referral: {
      id: "ref-003",
      required: false,
      requested_limit: 5000000,
      underwriter_limit: 5000000,
      reason: "Within Underwriter Tier-1 authority limit ($5.00M).",
      status: "NOT_REQUIRED",
      manager_decision: "NOT_REQUIRED",
      manager_notes: "",
      escalated_at: null,
    },
    audit_trail: [
      {
        id: "aud-06",
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        actor: "laura.cedent@vanguardre.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_CREATED",
        details: "Medical malpractice facultative intake submitted.",
      },
      {
        id: "aud-07",
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        actor: "d.chen@apexre.com",
        role: "Reinsurance Underwriter",
        action: "RISK_SCORED",
        details: "Risk score evaluated: 91/100 (LOW_RISK).",
      },
      {
        id: "aud-08",
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        actor: "d.chen@apexre.com",
        role: "Reinsurance Underwriter",
        action: "QUOTE_ISSUED",
        details: "Quote issued: 100% share, Net Premium $105,000.",
      },
    ],
  },
  {
    id: "fac-sub-004",
    submission_number: "FAC-2026-0092",
    ceding_company: "Alliance Specialty Underwriting",
    insured_name: "Nexus FinTech Cloud Corp",
    line_of_business: "E&O",
    policy_limit: 8000000,
    attachment_point: 2000000,
    retention: 200000,
    gross_premium: 160000,
    effective_date: "2026-06-15",
    expiry_date: "2027-06-15",
    industry: "Financial Technology / SaaS Payment Gateway",
    revenue_band: "$100M - $250M",
    jurisdiction: "United States (IL/CA)",
    status: "BOUND",
    created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_underwriter: "Marcus Vance (Senior UW)",
    underwriter_limit: 10000000,
    risk_score: {
      composite_score: 79,
      risk_grade: "LOW_RISK",
      evaluated_at: new Date(Date.now() - 100 * 3600 * 1000).toISOString(),
      factors: [
        {
          name: "SLA Guarantee & Contractual Liability Clauses",
          category: "Contract Review",
          score: 25,
          max_score: 30,
          status: "PASS",
          notes:
            "Consequential damages disclaimers present in 98% customer MSAs.",
        },
        {
          name: "Software Quality Assurance & CI/CD Security",
          category: "Technology Risk",
          score: 28,
          max_score: 30,
          status: "PASS",
          notes: "SOC 2 Type II certified with automated SAST/DAST testing.",
        },
        {
          name: "Historical E&O / Uptime Claims",
          category: "Claims History",
          score: 26,
          max_score: 40,
          status: "PASS",
          notes: "1 service credit event in 2024 ($45k).",
        },
      ],
    },
    documents: [
      {
        id: "doc-09",
        name: "Nexus_FinTech_EO_App.pdf",
        type: "application",
        size_mb: 2.7,
        status: "UPLOADED",
        uploaded_at: "2026-05-13T09:00:00Z",
      },
      {
        id: "doc-10",
        name: "Nexus_Loss_Runs_3yr.xlsx",
        type: "loss_runs",
        size_mb: 1.4,
        status: "UPLOADED",
        uploaded_at: "2026-05-13T09:05:00Z",
      },
      {
        id: "doc-11",
        name: "Nexus_Audited_Financials.pdf",
        type: "financials",
        size_mb: 4.2,
        status: "UPLOADED",
        uploaded_at: "2026-05-13T09:10:00Z",
      },
    ],
    quotes: [
      {
        id: "quote-03",
        layer_limit: 8000000,
        share_offered_pct: 60.0,
        ceding_commission_pct: 17.5,
        gross_ceded_premium: 96000,
        net_reinsurance_premium: 79200,
        subjectivities:
          "Subject to continuous maintenance of SOC2 Type II certification.",
        conditions: "Direct system outage sub-limit $4M.",
        exclusions: "Cryptocurrency transaction clearing losses.",
        status: "BOUND",
        created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        bound_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
    ],
    referral: {
      id: "ref-004",
      required: false,
      requested_limit: 8000000,
      underwriter_limit: 10000000,
      reason: "Within Senior Underwriter authority ($10.00M).",
      status: "NOT_REQUIRED",
      manager_decision: "NOT_REQUIRED",
      manager_notes: "",
      escalated_at: null,
    },
    audit_trail: [
      {
        id: "aud-09",
        timestamp: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
        actor: "alex.c@alliance.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_CREATED",
        details: "E&O facultative intake submitted.",
      },
      {
        id: "aud-10",
        timestamp: new Date(Date.now() - 100 * 3600 * 1000).toISOString(),
        actor: "m.vance@apexre.com",
        role: "Reinsurance Underwriter",
        action: "RISK_SCORED",
        details: "Composite risk score 79/100 computed.",
      },
      {
        id: "aud-11",
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        actor: "m.vance@apexre.com",
        role: "Reinsurance Underwriter",
        action: "QUOTE_ISSUED",
        details: "Quote issued: 60% share, Net Premium $79,200.",
      },
      {
        id: "aud-12",
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        actor: "alex.c@alliance.com",
        role: "Ceding Underwriter",
        action: "POLICY_BOUND",
        details: "Ceding insurer accepted quote and bound layer.",
      },
    ],
  },
  {
    id: "fac-sub-005",
    submission_number: "FAC-2026-0093",
    ceding_company: "Meridian Casualty & Surety",
    insured_name: "Omni Retail Staffing Solutions",
    line_of_business: "EPLI",
    policy_limit: 7500000,
    attachment_point: 2500000,
    retention: 250000,
    gross_premium: 145000,
    effective_date: "2026-06-01",
    expiry_date: "2027-06-01",
    industry: "Staffing & Human Capital Services",
    revenue_band: "$100M - $250M",
    jurisdiction: "United States (TX/FL/GA)",
    status: "DECLINED",
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_underwriter: "Elena Rostova (Underwriter)",
    underwriter_limit: 5000000,
    decline_reason:
      "Adverse 3-year EPL claims frequency (8 open EEOC claims) and lack of formal anti-harassment training certification.",
    risk_score: {
      composite_score: 42,
      risk_grade: "HIGH_RISK",
      evaluated_at: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
      factors: [
        {
          name: "HR Handbook & Anti-Harassment Training Program",
          category: "HR Controls",
          score: 10,
          max_score: 30,
          status: "FAIL",
          notes:
            "No mandatory annual training recorded for temporary placed workers.",
        },
        {
          name: "Historical EEOC & Wage/Hour Claims Frequency",
          category: "Claims History",
          score: 12,
          max_score: 40,
          status: "FAIL",
          notes: "8 active EEOC claims within past 24 months.",
        },
        {
          name: "Severance & Dispute Resolution Protocols",
          category: "Legal Controls",
          score: 20,
          max_score: 30,
          status: "WARNING",
          notes: "Arbitration agreement in place for corporate staff only.",
        },
      ],
    },
    documents: [
      {
        id: "doc-12",
        name: "OmniStaffing_EPLI_App.pdf",
        type: "application",
        size_mb: 2.1,
        status: "UPLOADED",
        uploaded_at: "2026-05-14T10:00:00Z",
      },
      {
        id: "doc-13",
        name: "OmniStaffing_Loss_Runs_5yr.xlsx",
        type: "loss_runs",
        size_mb: 1.9,
        status: "UPLOADED",
        uploaded_at: "2026-05-14T10:05:00Z",
      },
    ],
    quotes: [],
    referral: {
      id: "ref-005",
      required: true,
      requested_limit: 7500000,
      underwriter_limit: 5000000,
      reason: "Limit exceeds Tier-1 authority limit.",
      status: "DECLINED",
      manager_decision: "DECLINED",
      manager_notes:
        "Concur with underwriter decline recommendation due to severe claims frequency.",
      escalated_at: new Date(Date.now() - 85 * 3600 * 1000).toISOString(),
    },
    audit_trail: [
      {
        id: "aud-13",
        timestamp: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
        actor: "g.wright@meridian.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_CREATED",
        details: "EPLI facultative intake submitted.",
      },
      {
        id: "aud-14",
        timestamp: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
        actor: "e.rostova@apexre.com",
        role: "Reinsurance Underwriter",
        action: "RISK_SCORED",
        details: "Risk score evaluated: 42/100 (HIGH_RISK).",
      },
      {
        id: "aud-15",
        timestamp: new Date(Date.now() - 75 * 3600 * 1000).toISOString(),
        actor: "e.rostova@apexre.com",
        role: "Reinsurance Underwriter",
        action: "STATUS_CHANGED",
        details: "Status transitioned to DECLINED. Mandatory reason logged.",
      },
    ],
  },
];

let localSubmissions = JSON.parse(JSON.stringify(SEED_SUBMISSIONS));

export const getSubmissions = async (filters = {}) => {
  try {
    const res = await apiClient.get("/api/v1/submissions", { params: filters });
    return res.data;
  } catch (err) {
    console.warn(
      "[API] /api/v1/submissions fallback to local store:",
      err.message,
    );
    let result = [...localSubmissions];
    if (filters.status && filters.status !== "ALL") {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters.line_of_business && filters.line_of_business !== "ALL") {
      result = result.filter(
        (s) => s.line_of_business === filters.line_of_business,
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.insured_name.toLowerCase().includes(q) ||
          s.ceding_company.toLowerCase().includes(q) ||
          s.submission_number.toLowerCase().includes(q),
      );
    }
    return result;
  }
};

export const getReviewQueue = async (params = {}) => {
  try {
    const res = await apiClient.get("/api/v1/queue", { params });
    return res.data;
  } catch (err) {
    console.warn("[API] /api/v1/queue fallback to local store:", err.message);
    let items = [...localSubmissions];
    if (params.status && params.status !== "ALL") {
      items = items.filter((s) => s.status === params.status);
    }
    if (params.line_of_business && params.line_of_business !== "ALL") {
      items = items.filter(
        (s) => s.line_of_business === params.line_of_business,
      );
    }
    return {
      items,
      total: items.length,
      kpis: {
        total_pending: items.filter((s) =>
          ["RECEIVED", "IN_REVIEW", "INFO_REQUESTED"].includes(s.status),
        ).length,
        sla_breached: items.filter((s) => {
          const ageHours =
            (Date.now() - new Date(s.created_at).getTime()) / (1000 * 3600);
          return ageHours > 48 && !["BOUND", "DECLINED"].includes(s.status);
        }).length,
        high_score_count: items.filter(
          (s) => (s.risk_score?.composite_score || 0) >= 80,
        ).length,
        total_exposure_m: (
          items.reduce(
            (acc, curr) => acc + (Number(curr.policy_limit) || 0),
            0,
          ) / 1000000
        ).toFixed(1),
      },
    };
  }
};

export const getSubmissionById = async (id) => {
  try {
    const res = await apiClient.get(`/api/v1/submissions/${id}`);
    return res.data;
  } catch (err) {
    console.warn(
      `[API] /api/v1/submissions/${id} fallback to local store:`,
      err.message,
    );
    const found = localSubmissions.find(
      (s) => s.id === id || s.submission_number === id,
    );
    if (!found) {
      throw new Error(`Submission with ID ${id} not found.`);
    }
    return found;
  }
};

export const createSubmission = async (payload) => {
  try {
    const res = await apiClient.post("/api/v1/submissions", payload);
    return res.data;
  } catch (err) {
    console.warn(
      "[API] /api/v1/submissions POST fallback to local store:",
      err.message,
    );
    const newId = `fac-sub-${Date.now()}`;
    const subNumber = `FAC-2026-${String(localSubmissions.length + 90).padStart(4, "0")}`;
    const newSub = {
      id: newId,
      submission_number: subNumber,
      ceding_company:
        payload.ceding_company || "Global Specialty Insurers Corp",
      insured_name: payload.insured_name,
      line_of_business: payload.line_of_business,
      policy_limit: Number(payload.policy_limit),
      attachment_point: Number(payload.attachment_point),
      retention: Number(payload.retention),
      gross_premium: Number(payload.gross_premium),
      effective_date: payload.effective_date,
      expiry_date: payload.expiry_date,
      industry: payload.industry,
      revenue_band: payload.revenue_band,
      jurisdiction: payload.jurisdiction,
      status: "RECEIVED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_underwriter: "Unassigned",
      underwriter_limit: 5000000,
      risk_score: null,
      documents: payload.documents || [
        {
          id: `doc-${Date.now()}-1`,
          name: `${payload.insured_name.replace(/\s+/g, "_")}_Application.pdf`,
          type: "application",
          size_mb: 2.5,
          status: "UPLOADED",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: `doc-${Date.now()}-2`,
          name: `${payload.insured_name.replace(/\s+/g, "_")}_Loss_Runs.xlsx`,
          type: "loss_runs",
          size_mb: 1.2,
          status: "UPLOADED",
          uploaded_at: new Date().toISOString(),
        },
        {
          id: `doc-${Date.now()}-3`,
          name: `${payload.insured_name.replace(/\s+/g, "_")}_Financials.pdf`,
          type: "financials",
          size_mb: 3.8,
          status: "UPLOADED",
          uploaded_at: new Date().toISOString(),
        },
      ],
      quotes: [],
      referral: {
        id: `ref-${Date.now()}`,
        required: Number(payload.policy_limit) > 5000000,
        requested_limit: Number(payload.policy_limit),
        underwriter_limit: 5000000,
        reason:
          Number(payload.policy_limit) > 5000000
            ? `Requested limit ($${(Number(payload.policy_limit) / 1000000).toFixed(2)}M) exceeds standard Underwriter Tier-1 authority limit ($5.00M).`
            : "Within limits",
        status:
          Number(payload.policy_limit) > 5000000 ? "PENDING" : "NOT_REQUIRED",
        manager_decision: "PENDING",
        manager_notes: "",
        escalated_at:
          Number(payload.policy_limit) > 5000000
            ? new Date().toISOString()
            : null,
      },
      audit_trail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: payload.actor || "ceding.underwriter@cedent.com",
          role: "Ceding Underwriter",
          action: "SUBMISSION_CREATED",
          details: `New ${payload.line_of_business} facultative submission created for ${payload.insured_name}.`,
        },
      ],
    };
    localSubmissions.unshift(newSub);
    return newSub;
  }
};

export const updateSubmissionStatus = async (
  id,
  status,
  declineReason = "",
  actor = "m.vance@apexre.com",
) => {
  try {
    const res = await apiClient.patch(`/api/v1/submissions/${id}/status`, {
      status,
      decline_reason: declineReason,
      actor,
    });
    return res.data;
  } catch (err) {
    console.warn(
      `[API] /api/v1/submissions/${id}/status PATCH fallback to local store:`,
      err.message,
    );
    const sub = localSubmissions.find(
      (s) => s.id === id || s.submission_number === id,
    );
    if (!sub) throw new Error(`Submission ${id} not found.`);
    const prevStatus = sub.status;
    sub.status = status;
    sub.updated_at = new Date().toISOString();
    if (status === "DECLINED") {
      sub.decline_reason = declineReason;
    }
    sub.audit_trail.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      role: "Reinsurance Underwriter",
      action: "STATUS_CHANGED",
      details: `Status transitioned from ${prevStatus} to ${status}.${declineReason ? ` Reason: ${declineReason}` : ""}`,
    });
    return sub;
  }
};

export const calculateRiskScore = async (
  id,
  customFactors = null,
  actor = "m.vance@apexre.com",
) => {
  try {
    const res = await apiClient.post(`/api/v1/submissions/${id}/score`, {
      custom_factors: customFactors,
      actor,
    });
    return res.data;
  } catch (err) {
    console.warn(
      `[API] /api/v1/submissions/${id}/score POST fallback:`,
      err.message,
    );
    const sub = localSubmissions.find(
      (s) => s.id === id || s.submission_number === id,
    );
    if (!sub) throw new Error(`Submission ${id} not found.`);

    let factors = [];
    if (sub.line_of_business === "Cyber Risk") {
      factors = [
        {
          name: "MFA Enforcement across All Endpoints",
          category: "Security Controls",
          score: 25,
          max_score: 25,
          status: "PASS",
          notes: "Mandatory hardware/app MFA on all staff and remote access.",
        },
        {
          name: "Endpoint Detection & Response (EDR)",
          category: "Security Controls",
          score: 20,
          max_score: 20,
          status: "PASS",
          notes: "24/7 managed SOC telemetry with rapid isolation.",
        },
        {
          name: "Immutable Air-Gapped Backups",
          category: "Business Continuity",
          score: 20,
          max_score: 20,
          status: "PASS",
          notes: "Immutable WORM snapshots tested quarterly.",
        },
        {
          name: "3-Year Historical Loss Ratio",
          category: "Claims History",
          score: 20,
          max_score: 20,
          status: "PASS",
          notes: "Loss ratio < 15% with zero material breaches.",
        },
      ];
    } else if (sub.line_of_business === "D&O") {
      factors = [
        {
          name: "Financial Strength & Solvency Ratio",
          category: "Financials",
          score: 25,
          max_score: 30,
          status: "PASS",
          notes: "Quick ratio 1.8; positive operating cash flow.",
        },
        {
          name: "Independent Board & Audit Committee",
          category: "Corporate Governance",
          score: 25,
          max_score: 25,
          status: "PASS",
          notes: "Complies with full corporate governance guidelines.",
        },
        {
          name: "Claims & Regulatory Enforcement History",
          category: "Legal History",
          score: 20,
          max_score: 25,
          status: "PASS",
          notes: "No SEC or DOJ inquiries reported.",
        },
        {
          name: "Industry Sector Volatility Rating",
          category: "Market Risk",
          score: 15,
          max_score: 20,
          status: "PASS",
          notes: "Moderate sector volatility index.",
        },
      ];
    } else if (sub.line_of_business === "Medical Professional Liability") {
      factors = [
        {
          name: "Physician Board Certification Rate",
          category: "Credentialing",
          score: 35,
          max_score: 35,
          status: "PASS",
          notes: "100% board-certified physicians with verified CME credits.",
        },
        {
          name: "Surgical Safety Checklists & Peer Review",
          category: "Clinical Protocols",
          score: 30,
          max_score: 30,
          status: "PASS",
          notes:
            "Standardized WHO surgical checklist across all operating suites.",
        },
        {
          name: "5-Year Malpractice Loss Ratio",
          category: "Claims History",
          score: 25,
          max_score: 35,
          status: "PASS",
          notes: "Historical claims below regional benchmark.",
        },
      ];
    } else {
      factors = [
        {
          name: "Operational Risk Controls & QA",
          category: "Controls",
          score: 30,
          max_score: 35,
          status: "PASS",
          notes: "Documented ISO 9001 quality controls.",
        },
        {
          name: "Contractual Indemnity & Risk Transfer",
          category: "Contracts",
          score: 25,
          max_score: 30,
          status: "PASS",
          notes: "Standard limitation of liability in client agreements.",
        },
        {
          name: "Loss History & Prior Frequency",
          category: "Claims",
          score: 28,
          max_score: 35,
          status: "PASS",
          notes: "No severe open claims.",
        },
      ];
    }

    const totalScore = factors.reduce((acc, f) => acc + f.score, 0);
    const riskGrade =
      totalScore >= 80
        ? "LOW_RISK"
        : totalScore >= 60
          ? "MODERATE_RISK"
          : "HIGH_RISK";

    const scoreObj = {
      composite_score: totalScore,
      risk_grade: riskGrade,
      evaluated_at: new Date().toISOString(),
      factors,
    };
    sub.risk_score = scoreObj;
    sub.audit_trail.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      role: "Reinsurance Underwriter",
      action: "RISK_SCORED",
      details: `Risk scoring re-evaluated. Composite score: ${totalScore}/100 (${riskGrade}).`,
    });
    return scoreObj;
  }
};

export const createQuote = async (
  id,
  quoteData,
  actor = "m.vance@apexre.com",
) => {
  try {
    const res = await apiClient.post(`/api/v1/submissions/${id}/quotes`, {
      ...quoteData,
      actor,
    });
    return res.data;
  } catch (err) {
    console.warn(
      `[API] /api/v1/submissions/${id}/quotes POST fallback:`,
      err.message,
    );
    const sub = localSubmissions.find(
      (s) => s.id === id || s.submission_number === id,
    );
    if (!sub) throw new Error(`Submission ${id} not found.`);

    const sharePct = Number(quoteData.share_offered_pct) || 100;
    const commPct = Number(quoteData.ceding_commission_pct) || 0;
    const grossCeded = sub.gross_premium * (sharePct / 100);
    const netReinsurance = grossCeded * (1 - commPct / 100);

    const newQuote = {
      id: `quote-${Date.now()}`,
      layer_limit: Number(quoteData.layer_limit) || sub.policy_limit,
      share_offered_pct: sharePct,
      ceding_commission_pct: commPct,
      gross_ceded_premium: grossCeded,
      net_reinsurance_premium: netReinsurance,
      subjectivities: quoteData.subjectivities || "",
      conditions: quoteData.conditions || "",
      exclusions: quoteData.exclusions || "",
      status: "OFFERED",
      created_at: new Date().toISOString(),
    };

    sub.quotes = sub.quotes || [];
    sub.quotes.push(newQuote);
    sub.status = "QUOTED";
    sub.audit_trail.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      role: "Reinsurance Underwriter",
      action: "QUOTE_ISSUED",
      details: `Quote created: ${sharePct}% Share, Net Reinsurance Premium $${netReinsurance.toLocaleString()}.`,
    });
    return newQuote;
  }
};

export const decideReferral = async (
  referralId,
  decision,
  managerNotes = "",
  actor = "victoria.manager@apexre.com",
) => {
  try {
    const res = await apiClient.post(
      `/api/v1/referrals/${referralId}/decision`,
      {
        decision,
        manager_notes: managerNotes,
        actor,
      },
    );
    return res.data;
  } catch (err) {
    console.warn(
      `[API] /api/v1/referrals/${referralId}/decision POST fallback:`,
      err.message,
    );
    let matchedSub = null;
    for (const sub of localSubmissions) {
      if (
        sub.referral &&
        (sub.referral.id === referralId || sub.id === referralId)
      ) {
        sub.referral.status = decision;
        sub.referral.manager_decision = decision;
        sub.referral.manager_notes = managerNotes;
        sub.referral.decided_at = new Date().toISOString();
        matchedSub = sub;
        sub.audit_trail.push({
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor,
          role: "Underwriting Manager",
          action: "REFERRAL_DECIDED",
          details: `Manager referral decided: ${decision}. Notes: ${managerNotes || "None"}`,
        });
        break;
      }
    }
    if (!matchedSub) throw new Error(`Referral ${referralId} not found.`);
    return matchedSub.referral;
  }
};

export const bindQuote = async (
  submissionId,
  quoteId,
  actor = "sarah.cedent@globalsafe.com",
) => {
  try {
    const res = await apiClient.post(`/api/v1/quotes/${quoteId}/bind`, {
      submission_id: submissionId,
      actor,
    });
    return res.data;
  } catch (err) {
    console.warn(
      `[API] /api/v1/quotes/${quoteId}/bind POST fallback:`,
      err.message,
    );
    const sub = localSubmissions.find(
      (s) => s.id === submissionId || s.submission_number === submissionId,
    );
    if (!sub) throw new Error(`Submission ${submissionId} not found.`);
    sub.status = "BOUND";
    const quote =
      (sub.quotes || []).find((q) => q.id === quoteId) ||
      (sub.quotes && sub.quotes[0]);
    if (quote) {
      quote.status = "BOUND";
      quote.bound_at = new Date().toISOString();
    }
    sub.audit_trail.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      role: "Ceding Underwriter",
      action: "POLICY_BOUND",
      details: `Facultative reinsurance layer bound successfully on quote #${quoteId}.`,
    });
    return {
      status: "BOUND",
      quote_id: quoteId,
      bound_at: new Date().toISOString(),
    };
  }
};

export const getAnalyticsDashboard = async () => {
  try {
    const res = await apiClient.get("/api/v1/analytics/dashboard");
    return res.data;
  } catch (err) {
    console.warn("[API] /api/v1/analytics/dashboard fallback:", err.message);
    const totalSubmissions = localSubmissions.length;
    const boundCount = localSubmissions.filter(
      (s) => s.status === "BOUND",
    ).length;
    const quotedCount = localSubmissions.filter((s) =>
      ["QUOTED", "BOUND"].includes(s.status),
    ).length;
    const quoteToBindRatio =
      quotedCount > 0 ? ((boundCount / quotedCount) * 100).toFixed(1) : "50.0";

    const lines = [
      "Cyber Risk",
      "D&O",
      "E&O",
      "EPLI",
      "Medical Professional Liability",
    ];
    const submissionsByLine = lines.map((line) => ({
      line,
      count: localSubmissions.filter((s) => s.line_of_business === line).length,
      bound: localSubmissions.filter(
        (s) => s.line_of_business === line && s.status === "BOUND",
      ).length,
      total_limit_m: (
        localSubmissions
          .filter((s) => s.line_of_business === line)
          .reduce((acc, curr) => acc + curr.policy_limit, 0) / 1000000
      ).toFixed(1),
      avg_premium_k: Math.round(
        localSubmissions
          .filter((s) => s.line_of_business === line)
          .reduce((acc, curr) => acc + curr.gross_premium, 0) /
          Math.max(
            1,
            localSubmissions.filter((s) => s.line_of_business === line).length,
          ) /
          1000,
      ),
    }));

    const statusCounts = {
      RECEIVED: localSubmissions.filter((s) => s.status === "RECEIVED").length,
      IN_REVIEW: localSubmissions.filter((s) => s.status === "IN_REVIEW")
        .length,
      INFO_REQUESTED: localSubmissions.filter(
        (s) => s.status === "INFO_REQUESTED",
      ).length,
      QUOTED: localSubmissions.filter((s) => s.status === "QUOTED").length,
      BOUND: localSubmissions.filter((s) => s.status === "BOUND").length,
      DECLINED: localSubmissions.filter((s) => s.status === "DECLINED").length,
    };

    return {
      kpis: {
        total_submissions: totalSubmissions,
        bound_policies: boundCount,
        quote_to_bind_ratio_pct: Number(quoteToBindRatio),
        avg_turnaround_hours: 18.4,
        total_exposed_limit_m: (
          localSubmissions.reduce((acc, s) => acc + s.policy_limit, 0) / 1000000
        ).toFixed(1),
        total_ceded_premium_m: (
          localSubmissions.reduce((acc, s) => acc + s.gross_premium, 0) /
          1000000
        ).toFixed(2),
      },
      submissions_by_line: submissionsByLine,
      status_breakdown: statusCounts,
      turnaround_trends: [
        { month: "Jan", avg_hours: 24.2, sla_target: 24.0 },
        { month: "Feb", avg_hours: 21.5, sla_target: 24.0 },
        { month: "Mar", avg_hours: 19.8, sla_target: 24.0 },
        { month: "Apr", avg_hours: 18.4, sla_target: 24.0 },
        { month: "May", avg_hours: 16.9, sla_target: 24.0 },
      ],
      pending_referrals: localSubmissions.filter(
        (s) => s.referral && s.referral.status === "PENDING",
      ),
    };
  }
};

export const getAuditTrail = async (id) => {
  try {
    const res = await apiClient.get(`/api/v1/submissions/${id}/audit-trail`);
    return res.data;
  } catch (err) {
    console.warn(
      `[API] /api/v1/submissions/${id}/audit-trail fallback:`,
      err.message,
    );
    const sub = localSubmissions.find(
      (s) => s.id === id || s.submission_number === id,
    );
    if (!sub) throw new Error(`Submission ${id} not found.`);
    return sub.audit_trail || [];
  }
};
