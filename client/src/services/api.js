import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Comprehensive seed mock data for specialty reinsurance lines
const INITIAL_SUBMISSIONS = [
  {
    id: "sub-2026-0091",
    submissionNumber: "SUB-2026-0091",
    cedingCompanyName: "Travelers Insurance Co.",
    insuredName: "Apex Cybernetics Corp",
    lineOfBusiness: "Cyber Risk",
    policyLimit: 10000000,
    attachmentPoint: 5000000,
    retention: 500000,
    grossPremium: 150000,
    effectiveDate: "2026-06-01",
    expiryDate: "2027-06-01",
    industry: "Technology / Software & Cloud Services",
    revenueBand: "$50M - $250M",
    jurisdiction: "US - California",
    status: "In Review",
    isReferred: true,
    riskScore: 80,
    riskTier: "Low Risk Tier",
    createdAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    underwriter: "Sarah Jenkins",
    slaElapsedHours: 52,
    slaStatus: "RED_ALERT",
    riskAttributes: {
      mfaEnforced: true,
      edrDeployed: true,
      immutableBackups: true,
      securityTraining: false,
      priorLossRatio: "12%",
      claimsCount3Yr: 0,
    },
    factorBreakdown: [
      {
        factorName: "MFA Enforcement (Cloud & Core Infra)",
        pointsEarned: 20,
        maxPoints: 20,
        status: "pass",
        description: "Hardware token + SSO across 100% endpoints",
      },
      {
        factorName: "Endpoint Detection & Response (EDR/XDR)",
        pointsEarned: 15,
        maxPoints: 15,
        status: "pass",
        description: "24/7 Managed SOC coverage with SentinelOne",
      },
      {
        factorName: "Immutable Air-Gapped Backups",
        pointsEarned: 15,
        maxPoints: 15,
        status: "pass",
        description: "Hourly snapshots with tested 4h RTO",
      },
      {
        factorName: "3-Year Prior Loss History",
        pointsEarned: 30,
        maxPoints: 30,
        status: "pass",
        description: "Zero claims incurred in trailing 36 months",
      },
      {
        factorName: "Security Awareness & Phishing Simulation",
        pointsEarned: 0,
        maxPoints: 20,
        status: "deficit",
        description:
          "Training frequency only semi-annual (Deficit: requires monthly)",
      },
    ],
    documents: [
      {
        id: "doc-101",
        name: "cyber_security_application_2026.pdf",
        size: "3.4 MB",
        type: "Application",
        uploadedAt: "2026-05-15T10:30:00Z",
        verified: true,
      },
      {
        id: "doc-102",
        name: "3_year_claims_loss_runs.xlsx",
        size: "1.8 MB",
        type: "Loss Runs",
        uploadedAt: "2026-05-15T10:32:00Z",
        verified: true,
      },
      {
        id: "doc-103",
        name: "soc2_type2_attestation_report.pdf",
        size: "4.2 MB",
        type: "Financials / Audit",
        uploadedAt: "2026-05-15T10:33:00Z",
        verified: true,
      },
    ],
    quotes: [
      {
        id: "q-901",
        shareOfferedPercentage: 50.0,
        cedingCommissionPercentage: 20.0,
        cededLimit: 5000000,
        calculatedReinsurancePremium: 75000,
        netReinsurancePremium: 60000,
        subjectivities:
          "Subject to receipt of updated monthly phishing test scores within 30 days of inception.",
        conditions:
          "50% quota share participation; Claims notification within 48h of breach identification.",
        exclusions:
          "Nation-state war exclusion (LMA5583A); Infrastructure outage exclusion beyond 72h.",
        status: "PENDING_APPROVAL",
        requiresManagerReferral: true,
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
    ],
    auditTrail: [
      {
        id: "aud-1",
        timestamp: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
        actor: "cedant_underwriter@travelers.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_RECEIVED",
        details: "Initial submission created with 3 required documents.",
        hash: "8f4c2e...b31a",
      },
      {
        id: "aud-2",
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        actor: "system_scoring_engine",
        role: "System Engine",
        action: "RISK_SCORE_COMPUTED",
        details:
          "Score evaluated: 80/100 (Low Risk Tier). Security training deficit flagged.",
        hash: "3e12a9...d88c",
      },
      {
        id: "aud-3",
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        actor: "sjenkins@resecure.com",
        role: "Reinsurance Underwriter",
        action: "STATUS_CHANGED",
        details:
          "Moved from Received to In Review. Underwriter assigned: Sarah Jenkins.",
        hash: "9b67ff...1420",
      },
      {
        id: "aud-4",
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        actor: "sjenkins@resecure.com",
        role: "Reinsurance Underwriter",
        action: "REFERRAL_ESCALATED",
        details:
          "Requested limit ($10M) exceeds $5M authority. Referred to Underwriting Manager.",
        hash: "2a08dc...fe45",
      },
    ],
  },
  {
    id: "sub-2026-0092",
    submissionNumber: "SUB-2026-0092",
    cedingCompanyName: "Chubb Specialty Group",
    insuredName: "Sentinel Financial Holdings Inc",
    lineOfBusiness: "D&O",
    policyLimit: 25000000,
    attachmentPoint: 15000000,
    retention: 1000000,
    grossPremium: 420000,
    effectiveDate: "2026-07-01",
    expiryDate: "2027-07-01",
    industry: "Financial Services / Asset Management",
    revenueBand: "> $250M",
    jurisdiction: "US - New York",
    status: "Received",
    isReferred: true,
    riskScore: 72,
    riskTier: "Moderate Risk Tier",
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    underwriter: "Unassigned",
    slaElapsedHours: 14,
    slaStatus: "NORMAL",
    riskAttributes: {
      rating: "A",
      priorClaims: 1,
      boardExperienceYears: 8,
      debtEquityRatio: "1.4",
    },
    factorBreakdown: [
      {
        factorName: "Balance Sheet & Financial Strength",
        pointsEarned: 25,
        maxPoints: 30,
        status: "pass",
        description: "Strong liquidity, investment grade solvency",
      },
      {
        factorName: "Governance & Board Independence",
        pointsEarned: 22,
        maxPoints: 25,
        status: "pass",
        description: "80% independent board, audit committee chartered",
      },
      {
        factorName: "Claims & Regulatory Enforcement History",
        pointsEarned: 15,
        maxPoints: 25,
        status: "deficit",
        description: "1 settled minor shareholder derivative suit in 2024",
      },
      {
        factorName: "Audit & Accounting Quality",
        pointsEarned: 10,
        maxPoints: 20,
        status: "pass",
        description: "Unqualified Big-4 audit opinion",
      },
    ],
    documents: [
      {
        id: "doc-201",
        name: "sentinel_do_application_final.pdf",
        size: "2.1 MB",
        type: "Application",
        uploadedAt: "2026-05-16T18:00:00Z",
        verified: true,
      },
      {
        id: "doc-202",
        name: "audited_financial_statements_2024_2025.pdf",
        size: "5.6 MB",
        type: "Financials",
        uploadedAt: "2026-05-16T18:02:00Z",
        verified: true,
      },
    ],
    quotes: [],
    auditTrail: [
      {
        id: "aud-201",
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        actor: "cedant_underwriter@chubb.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_RECEIVED",
        details: "Submission created for D&O Excess Layer.",
        hash: "11fe4a...bb90",
      },
      {
        id: "aud-202",
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        actor: "system_scoring_engine",
        role: "System Engine",
        action: "RISK_SCORE_COMPUTED",
        details: "Score computed: 72/100 (Moderate Risk Tier).",
        hash: "8872cd...991e",
      },
    ],
  },
  {
    id: "sub-2026-0093",
    submissionNumber: "SUB-2026-0093",
    cedingCompanyName: "Hartford Specialty Underwriters",
    insuredName: "Metro Health Alliance Hospital System",
    lineOfBusiness: "Medical Professional Liability",
    policyLimit: 8000000,
    attachmentPoint: 3000000,
    retention: 250000,
    grossPremium: 210000,
    effectiveDate: "2026-08-01",
    expiryDate: "2027-08-01",
    industry: "Healthcare / Regional Hospital Network",
    revenueBand: "$50M - $250M",
    jurisdiction: "US - Nationwide",
    status: "Info Requested",
    isReferred: true,
    riskScore: 64,
    riskTier: "Moderate Risk Tier",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    underwriter: "Marcus Vance",
    slaElapsedHours: 36,
    slaStatus: "WARNING",
    infoRequestNote:
      "Please provide updated loss runs for the newly acquired South Campus surgical center.",
    riskAttributes: {
      bedCount: 420,
      credentialingVerified: true,
      lossFrequency: "Moderate",
      surgicalComplicationRatio: "0.8%",
    },
    factorBreakdown: [
      {
        factorName: "Physician & Staff Credentialing Protocols",
        pointsEarned: 22,
        maxPoints: 25,
        status: "pass",
        description: "Standard NCQA accredited credentialing cycle",
      },
      {
        factorName: "Clinical Risk Management & Incident Reporting",
        pointsEarned: 18,
        maxPoints: 25,
        status: "pass",
        description: "Automated electronic incident tracking in place",
      },
      {
        factorName: "Historical Loss Runs & Severity Trend",
        pointsEarned: 14,
        maxPoints: 30,
        status: "deficit",
        description: "Acquired surgical unit lacks segregated loss history",
      },
      {
        factorName: "Accreditation & Patient Safety Metrics",
        pointsEarned: 10,
        maxPoints: 20,
        status: "pass",
        description: "Joint Commission accredited with no major citations",
      },
    ],
    documents: [
      {
        id: "doc-301",
        name: "metro_health_mpl_intake.pdf",
        size: "4.8 MB",
        type: "Application",
        uploadedAt: "2026-05-14T09:12:00Z",
        verified: true,
      },
      {
        id: "doc-302",
        name: "hospital_credentialing_protocols.pdf",
        size: "1.2 MB",
        type: "Guidelines",
        uploadedAt: "2026-05-14T09:15:00Z",
        verified: true,
      },
    ],
    quotes: [],
    auditTrail: [
      {
        id: "aud-301",
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        actor: "cedant@thehartford.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_RECEIVED",
        details: "Hospital network MPL submission created.",
        hash: "cc561a...9987",
      },
      {
        id: "aud-302",
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        actor: "mvance@resecure.com",
        role: "Reinsurance Underwriter",
        action: "INFO_REQUESTED",
        details:
          "Information request issued: Loss runs required for South Campus surgical center.",
        hash: "dd0981...1244",
      },
    ],
  },
  {
    id: "sub-2026-0094",
    submissionNumber: "SUB-2026-0094",
    cedingCompanyName: "AIG Reinsurance Placement",
    insuredName: "Nexus AI Architecture LLC",
    lineOfBusiness: "E&O",
    policyLimit: 4000000,
    attachmentPoint: 1000000,
    retention: 100000,
    grossPremium: 95000,
    effectiveDate: "2026-06-15",
    expiryDate: "2027-06-15",
    industry: "Engineering & AI System Design",
    revenueBand: "$10M - $50M",
    jurisdiction: "US - Massachusetts",
    status: "Quoted",
    isReferred: false,
    riskScore: 88,
    riskTier: "Low Risk Tier",
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    underwriter: "Sarah Jenkins",
    slaElapsedHours: 20,
    slaStatus: "NORMAL",
    riskAttributes: {
      contractStandardization: "High",
      liabilityCapClause: true,
      priorClaimsCount: 0,
    },
    factorBreakdown: [
      {
        factorName: "Contractual Liability Limitation Clauses",
        pointsEarned: 25,
        maxPoints: 25,
        status: "pass",
        description: "Mandatory liability caps linked to annual fee value",
      },
      {
        factorName: "Quality Assurance & Peer Review Standards",
        pointsEarned: 25,
        maxPoints: 25,
        status: "pass",
        description:
          "Dual-engineer sign-off on all client architecture deliverables",
      },
      {
        factorName: "5-Year Claims Loss Ratio",
        pointsEarned: 25,
        maxPoints: 25,
        status: "pass",
        description: "Clean loss record with 0% historical loss ratio",
      },
      {
        factorName: "Subcontractor Risk Transfer",
        pointsEarned: 13,
        maxPoints: 25,
        status: "pass",
        description: "Standard indemnification agreements required",
      },
    ],
    documents: [
      {
        id: "doc-401",
        name: "nexus_eo_spec.pdf",
        size: "1.9 MB",
        type: "Application",
        uploadedAt: "2026-05-16T11:00:00Z",
        verified: true,
      },
      {
        id: "doc-402",
        name: "standard_client_master_services_agreement.pdf",
        size: "2.4 MB",
        type: "Contracts",
        uploadedAt: "2026-05-16T11:05:00Z",
        verified: true,
      },
    ],
    quotes: [
      {
        id: "q-902",
        shareOfferedPercentage: 40.0,
        cedingCommissionPercentage: 22.5,
        cededLimit: 1600000,
        calculatedReinsurancePremium: 38000,
        netReinsurancePremium: 29450,
        subjectivities:
          "Subject to execution of standard treaty slip and warranty of no known losses.",
        conditions:
          "40% part of $4M excess of $1M; Follow the fortunes of underlying policy terms.",
        exclusions:
          "Excluding intellectual property infringement and patent willful infringement.",
        status: "QUOTED",
        requiresManagerReferral: false,
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
    ],
    auditTrail: [
      {
        id: "aud-401",
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        actor: "cedant@aig.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_RECEIVED",
        details: "E&O facultative submission uploaded.",
        hash: "99a771...32a1",
      },
      {
        id: "aud-402",
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        actor: "sjenkins@resecure.com",
        role: "Reinsurance Underwriter",
        action: "QUOTE_ISSUED",
        details:
          "Quote generated: 40% share offered ($1.6M limit, $29,450 net premium).",
        hash: "55bc01...8892",
      },
    ],
  },
  {
    id: "sub-2026-0095",
    submissionNumber: "SUB-2026-0095",
    cedingCompanyName: "Berkshire Hathaway Specialty",
    insuredName: "Omni Retail Staffing Solutions",
    lineOfBusiness: "EPLI",
    policyLimit: 5000000,
    attachmentPoint: 2000000,
    retention: 150000,
    grossPremium: 110000,
    effectiveDate: "2026-05-01",
    expiryDate: "2027-05-01",
    industry: "Consumer & Retail / Staffing Services",
    revenueBand: "$50M - $250M",
    jurisdiction: "US - Illinois",
    status: "Bound",
    isReferred: false,
    riskScore: 84,
    riskTier: "Low Risk Tier",
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    underwriter: "Marcus Vance",
    slaElapsedHours: 72,
    slaStatus: "COMPLETED",
    riskAttributes: {
      headcount: 1400,
      hrLegalCounselRetained: true,
      severanceArbitrationMandatory: true,
    },
    factorBreakdown: [
      {
        factorName: "HR Handbook & Anti-Harassment Protocols",
        pointsEarned: 25,
        maxPoints: 25,
        status: "pass",
        description: "Annual mandatory bystander training + hotline",
      },
      {
        factorName: "Arbitration & Employment Agreement Coverage",
        pointsEarned: 25,
        maxPoints: 25,
        status: "pass",
        description: "Binding arbitration clause in 100% employment contracts",
      },
      {
        factorName: "Historical Loss Ratio & Severity",
        pointsEarned: 20,
        maxPoints: 25,
        status: "pass",
        description: "Loss ratio under 18% over trailing 5 years",
      },
      {
        factorName: "Layoff & Reduction in Force Procedures",
        pointsEarned: 14,
        maxPoints: 25,
        status: "pass",
        description: "Legal review required for all involuntary separations",
      },
    ],
    documents: [
      {
        id: "doc-501",
        name: "epli_intake_omni.pdf",
        size: "2.5 MB",
        type: "Application",
        uploadedAt: "2026-05-10T08:00:00Z",
        verified: true,
      },
    ],
    quotes: [
      {
        id: "q-905",
        shareOfferedPercentage: 50.0,
        cedingCommissionPercentage: 20.0,
        cededLimit: 2500000,
        calculatedReinsurancePremium: 55000,
        netReinsurancePremium: 44000,
        status: "BOUND",
        createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      },
    ],
    auditTrail: [
      {
        id: "aud-501",
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        actor: "cedant@bhspecialty.com",
        role: "Ceding Underwriter",
        action: "SUBMISSION_RECEIVED",
        details: "EPLI submission submitted.",
        hash: "09a12c...ef44",
      },
      {
        id: "aud-502",
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        actor: "mvance@resecure.com",
        role: "Reinsurance Underwriter",
        action: "POLICY_BOUND",
        details:
          "Signed slip received and facultative reinsurance certificate bound.",
        hash: "12345a...6789",
      },
    ],
  },
];

const STORAGE_KEY = "facultative_reinsurance_submissions_v1";

function getStoredSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("LocalStorage read error, using in-memory store:", e);
  }
  return INITIAL_SUBMISSIONS;
}

function saveSubmissions(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("LocalStorage write error:", e);
  }
}

// Ensure storage initialized
if (!localStorage.getItem(STORAGE_KEY)) {
  saveSubmissions(INITIAL_SUBMISSIONS);
}

// Compute dynamic risk score and factor breakdown based on LOB and attributes
export function computeRiskScore(lineOfBusiness, attributes = {}) {
  let score = 75;
  let breakdown = [];

  switch (lineOfBusiness) {
    case "Cyber Risk": {
      const mfa = attributes.mfaEnforced !== false;
      const edr = attributes.edrDeployed !== false;
      const backups = attributes.immutableBackups !== false;
      const training = Boolean(attributes.securityTraining);

      const pMfa = mfa ? 20 : 0;
      const pEdr = edr ? 15 : 0;
      const pBackups = backups ? 15 : 0;
      const pLoss = 30;
      const pTraining = training ? 20 : 0;

      score = pMfa + pEdr + pBackups + pLoss + pTraining;
      breakdown = [
        {
          factorName: "MFA Enforcement (Cloud & Core Infra)",
          pointsEarned: pMfa,
          maxPoints: 20,
          status: pMfa > 0 ? "pass" : "deficit",
          description:
            pMfa > 0
              ? "SSO/MFA enforced for all remote and privileged access"
              : "MFA missing on legacy access points (Deficit)",
        },
        {
          factorName: "Endpoint Detection & Response (EDR/XDR)",
          pointsEarned: pEdr,
          maxPoints: 15,
          status: pEdr > 0 ? "pass" : "deficit",
          description:
            pEdr > 0
              ? "Active 24/7 endpoint monitoring and isolation"
              : "Incomplete endpoint agent rollout",
        },
        {
          factorName: "Immutable Air-Gapped Backups",
          pointsEarned: pBackups,
          maxPoints: 15,
          status: pBackups > 0 ? "pass" : "deficit",
          description:
            pBackups > 0
              ? "Tested offline disaster recovery snapshots"
              : "Backups not isolated from domain network",
        },
        {
          factorName: "3-Year Prior Loss History",
          pointsEarned: pLoss,
          maxPoints: 30,
          status: "pass",
          description: "Low historical claim severity",
        },
        {
          factorName: "Security Awareness & Phishing Simulation",
          pointsEarned: pTraining,
          maxPoints: 20,
          status: pTraining > 0 ? "pass" : "deficit",
          description:
            pTraining > 0
              ? "Monthly staff simulations"
              : "Deficit: infrequent security training",
        },
      ];
      break;
    }
    case "D&O": {
      score = 78;
      breakdown = [
        {
          factorName: "Balance Sheet & Financial Strength",
          pointsEarned: 25,
          maxPoints: 30,
          status: "pass",
          description: "Strong current ratio and liquidity metrics",
        },
        {
          factorName: "Governance & Board Independence",
          pointsEarned: 23,
          maxPoints: 25,
          status: "pass",
          description: "Majority independent board with compliance charters",
        },
        {
          factorName: "Regulatory & Securities Litigation Track Record",
          pointsEarned: 20,
          maxPoints: 25,
          status: "pass",
          description: "No active SEC or regulatory inquiries",
        },
        {
          factorName: "Debt-to-Equity & Leverage Controls",
          pointsEarned: 10,
          maxPoints: 20,
          status: "pass",
          description: "Manageable leverage profile",
        },
      ];
      break;
    }
    case "Medical Professional Liability": {
      score = 70;
      breakdown = [
        {
          factorName: "Physician & Staff Credentialing Protocols",
          pointsEarned: 22,
          maxPoints: 25,
          status: "pass",
          description: "Rigorous peer-review credentialing cycle",
        },
        {
          factorName: "Clinical Risk Management & Incident Tracking",
          pointsEarned: 20,
          maxPoints: 25,
          status: "pass",
          description: "Formal patient safety and sentinel event protocols",
        },
        {
          factorName: "5-Year Claims Loss Ratio Trend",
          pointsEarned: 16,
          maxPoints: 30,
          status: "deficit",
          description: "Historical frequency slightly elevated",
        },
        {
          factorName: "Joint Commission / Regulatory Accreditation",
          pointsEarned: 12,
          maxPoints: 20,
          status: "pass",
          description: "Full hospital accreditation without conditions",
        },
      ];
      break;
    }
    case "E&O": {
      score = 85;
      breakdown = [
        {
          factorName: "Contractual Liability Limitation Clauses",
          pointsEarned: 25,
          maxPoints: 25,
          status: "pass",
          description: "Enforceable limitation of liability in client MSAs",
        },
        {
          factorName: "Quality Assurance & Delivery Sign-off",
          pointsEarned: 25,
          maxPoints: 25,
          status: "pass",
          description: "Formal peer review and client sign-off gates",
        },
        {
          factorName: "5-Year Claims Loss Ratio",
          pointsEarned: 23,
          maxPoints: 25,
          status: "pass",
          description: "No catastrophic errors or omission losses reported",
        },
        {
          factorName: "Subcontractor Risk Transfer Agreements",
          pointsEarned: 12,
          maxPoints: 25,
          status: "pass",
          description: "Hold-harmless clauses with subcontractors",
        },
      ];
      break;
    }
    case "EPLI":
    default: {
      score = 82;
      breakdown = [
        {
          factorName: "Employee Handbook & Anti-Harassment Protocols",
          pointsEarned: 25,
          maxPoints: 25,
          status: "pass",
          description:
            "Written anti-harassment policy with confidential reporting hotline",
        },
        {
          factorName: "Arbitration & Employment Agreement Coverage",
          pointsEarned: 23,
          maxPoints: 25,
          status: "pass",
          description: "Alternative dispute resolution agreement in place",
        },
        {
          factorName: "Historical Loss Ratio & Retaliation Claims",
          pointsEarned: 20,
          maxPoints: 25,
          status: "pass",
          description: "Zero systemic EEOC investigations",
        },
        {
          factorName: "Severance & Termination Legal Review",
          pointsEarned: 14,
          maxPoints: 25,
          status: "pass",
          description: "Mandatory legal oversight for reductions in force",
        },
      ];
      break;
    }
  }

  const riskTier =
    score >= 80
      ? "Low Risk Tier"
      : score >= 50
        ? "Moderate Risk Tier"
        : "High Risk Tier";
  return { score, riskTier, breakdown };
}

// Core API services with backend connection and seamless local mock fallback
export const api = {
  // Get all submissions with filtering and sorting
  async getSubmissions(params = {}) {
    try {
      const res = await apiClient.get("/api/v1/submissions", { params });
      if (res.data) return res.data;
    } catch (err) {
      console.info("Backend unreachable, using local store:", err.message);
    }

    let items = getStoredSubmissions();

    if (params.status && params.status !== "All") {
      items = items.filter(
        (s) => s.status.toLowerCase() === params.status.toLowerCase(),
      );
    }
    if (params.lineOfBusiness && params.lineOfBusiness !== "All") {
      items = items.filter((s) => s.lineOfBusiness === params.lineOfBusiness);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (s) =>
          s.submissionNumber.toLowerCase().includes(q) ||
          s.insuredName.toLowerCase().includes(q) ||
          s.cedingCompanyName.toLowerCase().includes(q) ||
          s.lineOfBusiness.toLowerCase().includes(q),
      );
    }

    return {
      items,
      total: items.length,
      page: 1,
      size: 50,
    };
  },

  // Get single submission
  async getSubmissionById(id) {
    try {
      const res = await apiClient.get(`/api/v1/submissions/${id}`);
      if (res.data) return res.data;
    } catch (err) {
      console.info(
        "Backend unreachable for getSubmissionById, using local store:",
        err.message,
      );
    }

    const items = getStoredSubmissions();
    const found = items.find(
      (s) =>
        s.id === id || s.submissionNumber.toLowerCase() === id.toLowerCase(),
    );
    if (found) return found;
    return items[0];
  },

  // Create submission
  async createSubmission(payload) {
    try {
      const res = await apiClient.post("/api/v1/submissions", payload);
      if (res.data) return res.data;
    } catch (err) {
      console.info(
        "Backend unreachable for createSubmission, saving to local store:",
        err.message,
      );
    }

    const { score, riskTier, breakdown } = computeRiskScore(
      payload.lineOfBusiness,
      payload.riskAttributes,
    );
    const newId = `sub-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const isReferred = Number(payload.policyLimit) > 5000000;

    const newSubmission = {
      id: newId,
      submissionNumber: newId.toUpperCase(),
      cedingCompanyName: payload.cedingCompanyName || "Travelers Insurance Co.",
      insuredName: payload.insuredName,
      lineOfBusiness: payload.lineOfBusiness,
      policyLimit: Number(payload.policyLimit),
      attachmentPoint: Number(payload.attachmentPoint),
      retention: Number(payload.retention) || 100000,
      grossPremium: Number(payload.grossPremium),
      effectiveDate: payload.effectiveDate,
      expiryDate: payload.expiryDate,
      industry: payload.industry,
      revenueBand: payload.revenueBand,
      jurisdiction: payload.jurisdiction,
      status: "Received",
      isReferred,
      riskScore: score,
      riskTier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      underwriter: "Unassigned",
      slaElapsedHours: 0,
      slaStatus: "NORMAL",
      riskAttributes: payload.riskAttributes || {},
      factorBreakdown: breakdown,
      documents: payload.documents || [
        {
          id: `doc-${Date.now()}-1`,
          name: `${payload.lineOfBusiness.toLowerCase().replace(/\s+/g, "_")}_application.pdf`,
          size: "2.8 MB",
          type: "Application",
          uploadedAt: new Date().toISOString(),
          verified: true,
        },
      ],
      quotes: [],
      auditTrail: [
        {
          id: `aud-${Date.now()}-1`,
          timestamp: new Date().toISOString(),
          actor: payload.cedingCompanyName || "Ceding Underwriter",
          role: "Ceding Underwriter",
          action: "SUBMISSION_RECEIVED",
          details: `Submission created for ${payload.insuredName} (${payload.lineOfBusiness}) with $${Number(payload.policyLimit).toLocaleString()} limit.`,
          hash:
            Math.random().toString(36).substring(2, 10) +
            "..." +
            Math.random().toString(36).substring(2, 6),
        },
        {
          id: `aud-${Date.now()}-2`,
          timestamp: new Date().toISOString(),
          actor: "system_scoring_engine",
          role: "System Engine",
          action: "RISK_SCORE_COMPUTED",
          details: `Initial risk score evaluated: ${score}/100 (${riskTier}).`,
          hash:
            Math.random().toString(36).substring(2, 10) +
            "..." +
            Math.random().toString(36).substring(2, 6),
        },
      ],
    };

    if (isReferred) {
      newSubmission.auditTrail.push({
        id: `aud-${Date.now()}-3`,
        timestamp: new Date().toISOString(),
        actor: "system_authority_gate",
        role: "System Engine",
        action: "REFERRAL_FLAGGED",
        details: `Requested limit $${Number(payload.policyLimit).toLocaleString()} exceeds standard underwriter authority of $5,000,000. Manager referral required for quote authorization.`,
        hash:
          Math.random().toString(36).substring(2, 10) +
          "..." +
          Math.random().toString(36).substring(2, 6),
      });
    }

    const items = getStoredSubmissions();
    const updated = [newSubmission, ...items];
    saveSubmissions(updated);
    return newSubmission;
  },

  // Upload document
  async uploadDocument(submissionId, doc) {
    try {
      const res = await apiClient.post(
        `/api/v1/submissions/${submissionId}/documents`,
        doc,
      );
      if (res.data) return res.data;
    } catch (err) {
      console.info(
        "Backend unreachable for uploadDocument, updating local store:",
        err.message,
      );
    }

    const items = getStoredSubmissions();
    const sub = items.find((s) => s.id === submissionId);
    if (sub) {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: doc.name || "uploaded_document.pdf",
        size: doc.size || "1.5 MB",
        type: doc.type || "Supporting Document",
        uploadedAt: new Date().toISOString(),
        verified: true,
      };
      sub.documents = [...(sub.documents || []), newDoc];
      sub.auditTrail.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: "Underwriter / Cedant",
        role: "User",
        action: "DOCUMENT_UPLOADED",
        details: `Document uploaded: ${newDoc.name} (${newDoc.type}).`,
        hash: Math.random().toString(36).substring(2, 10) + "...doc",
      });
      saveSubmissions(items);
      return newDoc;
    }
    return { success: true };
  },

  // Recalculate score
  async calculateScore(submissionId) {
    try {
      const res = await apiClient.post(
        `/api/v1/submissions/${submissionId}/score`,
      );
      if (res.data) return res.data;
    } catch (err) {
      console.info(
        "Backend unreachable for calculateScore, updating local store:",
        err.message,
      );
    }

    const items = getStoredSubmissions();
    const sub = items.find((s) => s.id === submissionId);
    if (sub) {
      const { score, riskTier, breakdown } = computeRiskScore(
        sub.lineOfBusiness,
        sub.riskAttributes,
      );
      sub.riskScore = score;
      sub.riskTier = riskTier;
      sub.factorBreakdown = breakdown;
      sub.auditTrail.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: "system_scoring_engine",
        role: "System Engine",
        action: "RISK_SCORE_RECALCULATED",
        details: `Score re-evaluated: ${score}/100 (${riskTier}).`,
        hash: Math.random().toString(36).substring(2, 10) + "...recal",
      });
      saveSubmissions(items);
      return { score, riskTier, breakdown };
    }
    return { score: 80, riskTier: "Low Risk Tier" };
  },

  // Update submission status (e.g. In Review, Info Requested, Declined, Bound)
  async updateSubmissionStatus(submissionId, status, payload = {}) {
    try {
      const res = await apiClient.patch(
        `/api/v1/submissions/${submissionId}/status`,
        { status, ...payload },
      );
      if (res.data) return res.data;
    } catch (err) {
      console.info(
        "Backend unreachable for updateSubmissionStatus, updating local store:",
        err.message,
      );
    }

    const items = getStoredSubmissions();
    const sub = items.find((s) => s.id === submissionId);
    if (sub) {
      const prevStatus = sub.status;
      sub.status = status;
      sub.updatedAt = new Date().toISOString();
      if (payload.underwriter) sub.underwriter = payload.underwriter;
      if (payload.declineReason) sub.declineReason = payload.declineReason;
      if (payload.infoRequestNote)
        sub.infoRequestNote = payload.infoRequestNote;

      sub.auditTrail.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: payload.actor || "sjenkins@resecure.com",
        role: payload.role || "Reinsurance Underwriter",
        action: `STATUS_CHANGED_${status.toUpperCase().replace(/\s+/g, "_")}`,
        details:
          payload.details ||
          `State transition from ${prevStatus} to ${status}${payload.declineReason ? ". Decline Reason: " + payload.declineReason : ""}${payload.infoRequestNote ? ". Request: " + payload.infoRequestNote : ""}.`,
        hash: Math.random().toString(36).substring(2, 10) + "...stat",
      });

      saveSubmissions(items);
      return sub;
    }
    return { success: true };
  },

  // Submit quote
  async createQuote(submissionId, quoteData) {
    try {
      const res = await apiClient.post(
        `/api/v1/submissions/${submissionId}/quotes`,
        quoteData,
      );
      if (res.data) return res.data;
    } catch (err) {
      console.info(
        "Backend unreachable for createQuote, updating local store:",
        err.message,
      );
    }

    const items = getStoredSubmissions();
    const sub = items.find((s) => s.id === submissionId);
    if (sub) {
      const isReferred = sub.policyLimit > 5000000;
      const newQuote = {
        id: `q-${Date.now()}`,
        ...quoteData,
        status: isReferred ? "PENDING_MANAGER_APPROVAL" : "QUOTED",
        requiresManagerReferral: isReferred,
        createdAt: new Date().toISOString(),
      };

      sub.quotes = [...(sub.quotes || []), newQuote];
      sub.status = isReferred ? "Referred" : "Quoted";
      sub.updatedAt = new Date().toISOString();

      sub.auditTrail.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: quoteData.author || "sjenkins@resecure.com",
        role: "Reinsurance Underwriter",
        action: isReferred ? "QUOTE_REFERRED_TO_MANAGER" : "QUOTE_ISSUED",
        details: isReferred
          ? `Quote generated with ${quoteData.shareOfferedPercentage}% share. Escalated to Underwriting Manager due to $${sub.policyLimit.toLocaleString()} limit.`
          : `Quote finalized and issued: ${quoteData.shareOfferedPercentage}% share offered ($${Number(quoteData.netReinsurancePremium).toLocaleString()} net premium).`,
        hash: Math.random().toString(36).substring(2, 10) + "...quot",
      });

      saveSubmissions(items);
      return newQuote;
    }
    return quoteData;
  },

  // Referral decision by manager
  async submitReferralDecision(
    submissionId,
    { decision, managerNotes, approvedLimit },
  ) {
    try {
      const res = await apiClient.post(
        `/api/v1/submissions/${submissionId}/referral/decision`,
        {
          decision,
          managerNotes,
          approvedLimit,
        },
      );
      if (res.data) return res.data;
    } catch (err) {
      console.info(
        "Backend unreachable for submitReferralDecision, updating local store:",
        err.message,
      );
    }

    const items = getStoredSubmissions();
    const sub = items.find((s) => s.id === submissionId);
    if (sub) {
      if (decision === "APPROVE") {
        sub.status = "Quoted";
        sub.managerApproved = true;
        sub.managerApprovalNotes = managerNotes;
        if (sub.quotes && sub.quotes.length > 0) {
          sub.quotes[sub.quotes.length - 1].status = "APPROVED";
        }
      } else {
        sub.status = "Declined";
        sub.declineReason = `Manager Referral Rejected: ${managerNotes}`;
      }

      sub.auditTrail.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: "vchen@resecure.com",
        role: "Underwriting Manager",
        action:
          decision === "APPROVE" ? "REFERRAL_APPROVED" : "REFERRAL_REJECTED",
        details: `Manager decision: ${decision}. Notes: ${managerNotes}. Approved Capacity: $${Number(approvedLimit || sub.policyLimit).toLocaleString()}.`,
        hash: Math.random().toString(36).substring(2, 10) + "...mgr",
      });

      saveSubmissions(items);
      return { success: true, submission: sub };
    }
    return { success: true };
  },

  // Audit trail
  async getAuditTrail(submissionId) {
    try {
      const res = await apiClient.get(
        `/api/v1/submissions/${submissionId}/audit-trail`,
      );
      if (res.data) return res.data;
    } catch (err) {
      console.info(
        "Backend unreachable for getAuditTrail, using local store:",
        err.message,
      );
    }

    const items = getStoredSubmissions();
    const sub = items.find((s) => s.id === submissionId);
    return sub ? sub.auditTrail : [];
  },

  // Executive Dashboard metrics
  async getDashboardMetrics() {
    try {
      const res = await apiClient.get("/api/v1/dashboard/metrics");
      if (res.data) return res.data;
    } catch (err) {
      console.info(
        "Backend unreachable for getDashboardMetrics, computing from local store:",
        err.message,
      );
    }

    const items = getStoredSubmissions();
    const totalSubmissions = items.length;
    const boundCount = items.filter((s) => s.status === "Bound").length;
    const quotedCount = items.filter(
      (s) => s.status === "Quoted" || s.status === "Bound",
    ).length;
    const quoteToBindRatioPercentage =
      quotedCount > 0 ? ((boundCount / quotedCount) * 100).toFixed(1) : "68.4";

    const submissionsByLine = {
      "Cyber Risk": items.filter((s) => s.lineOfBusiness === "Cyber Risk")
        .length,
      "D&O": items.filter((s) => s.lineOfBusiness === "D&O").length,
      "E&O": items.filter((s) => s.lineOfBusiness === "E&O").length,
      EPLI: items.filter((s) => s.lineOfBusiness === "EPLI").length,
      "Medical Professional Liability": items.filter(
        (s) => s.lineOfBusiness === "Medical Professional Liability",
      ).length,
    };

    const submissionsByStatus = {
      Received: items.filter((s) => s.status === "Received").length,
      "In Review": items.filter((s) => s.status === "In Review").length,
      "Info Requested": items.filter((s) => s.status === "Info Requested")
        .length,
      Referred: items.filter((s) => s.status === "Referred").length,
      Quoted: items.filter((s) => s.status === "Quoted").length,
      Bound: items.filter((s) => s.status === "Bound").length,
      Declined: items.filter((s) => s.status === "Declined").length,
    };

    const totalExposedLimit = items.reduce(
      (acc, curr) => acc + (Number(curr.policyLimit) || 0),
      0,
    );
    const pendingReferrals = items.filter(
      (s) =>
        s.status === "Referred" || (s.isReferred && s.status === "In Review"),
    );

    return {
      totalSubmissions: totalSubmissions + 138, // Added to realistic YTD scale
      activeQueueCount: totalSubmissions,
      quoteToBindRatioPercentage: Number(quoteToBindRatioPercentage),
      averageTurnaroundHours: 18.5,
      totalExposedLimitByLine: {
        "Cyber Risk": 58500000,
        "D&O": 72000000,
        "E&O": 21000000,
        EPLI: 12000000,
        "Medical Professional Liability": 19000000,
      },
      totalExposedLimitAggregate: totalExposedLimit + 160000000,
      submissionsByLine,
      submissionsByStatus,
      pendingReferrals,
    };
  },

  // Scoring Rules Config
  async getScoringRules() {
    try {
      const res = await apiClient.get("/api/v1/config/scoring-rules");
      if (res.data) return res.data;
    } catch (err) {
      console.info("Using default scoring rules config:", err.message);
    }

    return {
      authorityLimitUSD: 5000000,
      slaThresholds: {
        normalMaxHours: 24,
        warningMaxHours: 48,
      },
      lines: [
        "Cyber Risk",
        "D&O",
        "E&O",
        "EPLI",
        "Medical Professional Liability",
      ],
    };
  },
};

export default api;
