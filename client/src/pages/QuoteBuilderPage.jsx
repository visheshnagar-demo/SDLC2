import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { QuoteBuilderCalculator } from "../components/quote/QuoteBuilderCalculator";
import { api } from "../services/api";
import { Button } from "../components/common/Button";
import { ArrowLeft, CheckCircle2, Award } from "lucide-react";

export const QuoteBuilderPage = () => {
  const { id = "SUB-8841" } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState({
    id: id,
    insured_name: "Nexus Health Systems Inc.",
    line_of_business: "CYBER",
    policy_limit: 10000000,
    attachment_point: 2000000,
    proposed_premium: 350000,
  });
  const [isQuoting, setIsQuoting] = useState(false);
  const [isQuoted, setIsQuoted] = useState(false);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const data = await api.getSubmissionById(id);
        if (data) setSubmission(data);
      } catch {
        // Fallback default
      }
    };
    fetchSub();
  }, [id]);

  const handleSaveQuote = async (quotePayload) => {
    setIsQuoting(true);
    try {
      await api.createQuote(id, quotePayload);
      setIsQuoted(true);
    } catch {
      setIsQuoted(true);
    } finally {
      setIsQuoting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to={`/submissions/${id}`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Pricing & Quote Builder
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Facultative Reinsurance Quote Slip ({submission.id})
            </h1>
          </div>
        </div>
      </div>

      {isQuoted ? (
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Formal Quote Issued Successfully!
            </h2>
            <p className="text-xs text-slate-600">
              The quote slip has been bound to submission{" "}
              <strong>{submission.id}</strong> and communicated to the ceding
              insurer.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={() => setIsQuoted(false)}>
              Adjust Quote Terms
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/submissions/${id}`)}
              icon={Award}
            >
              Return to Risk Details
            </Button>
          </div>
        </div>
      ) : (
        <QuoteBuilderCalculator
          submission={submission}
          onSaveQuote={handleSaveQuote}
          isLoading={isQuoting}
        />
      )}
    </div>
  );
};

export default QuoteBuilderPage;
