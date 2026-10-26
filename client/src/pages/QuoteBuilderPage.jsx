import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissionById } from "../services/api";
import QuoteBuilder from "../components/quote/QuoteBuilder";
import ManagerReferralPanel from "../components/referral/ManagerReferralPanel";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  Layers,
  FileCheck2,
} from "lucide-react";

export const QuoteBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getSubmissionById(id || "fac-sub-001");
        setSubmission(data);
      } catch (err) {
        console.error("Failed to load quote workspace:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading quote & pricing workspace...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <Card className="text-center py-10 max-w-md mx-auto">
        <p className="text-sm text-slate-600 mb-4">Submission not found.</p>
        <Button
          variant="primary"
          onClick={() => navigate("/underwriter/queue")}
        >
          Return to Queue
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/submissions/${submission.id}`)}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Submission #
          {submission.submission_number}
        </button>
        <Badge variant={submission.status} label={submission.status} />
      </div>

      {/* Layer Context Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 font-mono">
            {submission.submission_number} • {submission.line_of_business}
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            {submission.insured_name}
          </h2>
          <p className="text-xs text-slate-400">
            Cedent: {submission.ceding_company} | Territory:{" "}
            {submission.jurisdiction}
          </p>
        </div>

        <div className="flex items-center space-x-6 text-xs bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80 font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">
              Layer Limit
            </span>
            <span className="font-bold text-white">
              ${(submission.policy_limit / 1000000).toFixed(2)}M
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">
              Attachment
            </span>
            <span className="font-bold text-white">
              ${(submission.attachment_point / 1000000).toFixed(2)}M
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">
              Gross Premium
            </span>
            <span className="font-bold text-emerald-400">
              ${Number(submission.gross_premium).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Quote Builder Interactive Engine */}
      <QuoteBuilder
        submission={submission}
        onQuoteCreated={(quote) => {
          setSubmission((prev) => ({
            ...prev,
            quotes: [...(prev.quotes || []), quote],
            status: "QUOTED",
          }));
        }}
      />

      {/* Manager Referral Sign-off Panel */}
      <ManagerReferralPanel
        submission={submission}
        onReferralUpdated={(ref) => {
          setSubmission((prev) => ({
            ...prev,
            referral: ref,
          }));
        }}
      />
    </div>
  );
};

export default QuoteBuilderPage;
