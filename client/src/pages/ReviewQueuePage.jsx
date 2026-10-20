import React, { useState, useEffect } from "react";
import { UnderwriterReviewQueue } from "../components/queue/UnderwriterReviewQueue";
import { api } from "../services/api";
import { Button } from "../components/common/Button";
import { FilePlus2, RefreshCw, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const SEED_SUBMISSIONS = [
  {
    id: "SUB-8841",
    ceding_company_id: "HGIC-770",
    ceding_company_name: "Hartford General Insurance Corp",
    insured_name: "Nexus Health Systems Inc.",
    line_of_business: "CYBER",
    industry: "Healthcare & Life Sciences",
    policy_limit: 10000000,
    attachment_point: 2000000,
    retention: 500000,
    proposed_premium: 350000,
    status: "IN_REVIEW",
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    risk_score: {
      total_score: 82,
      risk_tier: "LOW RISK / PREFERRED",
    },
  },
  {
    id: "SUB-8842",
    ceding_company_id: "TRV-401",
    ceding_company_name: "Travelers Specialty Syndicate",
    insured_name: "Apex Quantum Cloud Technologies",
    line_of_business: "CYBER",
    industry: "Technology & Software SaaS",
    policy_limit: 5000000,
    attachment_point: 1000000,
    retention: 250000,
    proposed_premium: 220000,
    status: "QUOTED",
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    risk_score: {
      total_score: 91,
      risk_tier: "SUPERIOR / PREFERRED",
    },
  },
  {
    id: "SUB-8843",
    ceding_company_id: "CHUBB-902",
    ceding_company_name: "Chubb Re Intermediaries Ltd.",
    insured_name: "St. Jude Regional Medical Center",
    line_of_business: "MED_MAL",
    industry: "Healthcare & Life Sciences",
    policy_limit: 15000000,
    attachment_point: 5000000,
    retention: 1000000,
    proposed_premium: 780000,
    status: "RECEIVED",
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    risk_score: {
      total_score: 74,
      risk_tier: "STANDARD / ACCEPTABLE",
    },
  },
  {
    id: "SUB-8844",
    ceding_company_id: "BERK-112",
    ceding_company_name: "Berkshire Global Insurance Co.",
    insured_name: "Vanguard Biopharma Corporation",
    line_of_business: "DO",
    industry: "Healthcare & Life Sciences",
    policy_limit: 25000000,
    attachment_point: 10000000,
    retention: 2000000,
    proposed_premium: 1100000,
    status: "REFERRED",
    created_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    risk_score: {
      total_score: 68,
      risk_tier: "ELEVATED RISK",
    },
  },
  {
    id: "SUB-8845",
    ceding_company_id: "HGIC-770",
    ceding_company_name: "Hartford General Insurance Corp",
    insured_name: "FinScale Enterprise Payment Solutions",
    line_of_business: "EO",
    industry: "Financial Services & Fintech",
    policy_limit: 5000000,
    attachment_point: 1000000,
    retention: 100000,
    proposed_premium: 195000,
    status: "BOUND",
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    risk_score: {
      total_score: 88,
      risk_tier: "PREFERRED",
    },
  },
];

export const ReviewQueuePage = () => {
  const [submissions, setSubmissions] = useState(SEED_SUBMISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setApiError("");
    try {
      const data = await api.getSubmissions();
      if (Array.isArray(data) && data.length > 0) {
        setSubmissions(data);
      }
    } catch (err) {
      // Keep existing items if API fails or backend is initializing
      setApiError(
        "Connected in local mode with live simulated pipeline submissions.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
            Underwriter Triage & Review Queue
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Facultative Reinsurance Submissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sort, filter, and triage incoming specialty risks with visual SLA
            timers and risk score indicators.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/intake">
            <Button variant="primary" icon={FilePlus2}>
              New Submission
            </Button>
          </Link>
        </div>
      </div>

      {apiError && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs flex items-center justify-between">
          <span>{apiError}</span>
          <Button variant="ghost" size="sm" onClick={fetchSubmissions}>
            Retry API
          </Button>
        </div>
      )}

      {/* Main Review Queue Grid */}
      <UnderwriterReviewQueue
        submissions={submissions}
        onRefresh={fetchSubmissions}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ReviewQueuePage;
