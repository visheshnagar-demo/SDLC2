import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import QuoteBuilderCalculator from "../components/quote/QuoteBuilderCalculator";
import { ArrowLeft, Calculator } from "lucide-react";

export default function QuoteBuilderPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSub() {
      setLoading(true);
      try {
        const data = await api.getSubmissionById(id);
        setSubmission(data);
      } catch (err) {
        console.error("Failed to load submission for quote:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSub();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center text-slate-500 text-sm">
        Loading Quote Builder for {id}...
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="text-red-600 font-bold text-sm">
          Submission not found.
        </div>
        <Link
          to="/queue"
          className="text-xs text-primary font-semibold hover:underline"
        >
          Return to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top back breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={`/submissions/${submission.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Submission ({submission.submissionNumber})</span>
        </Link>
        <span className="text-xs text-slate-500 font-semibold">
          Insured: <strong>{submission.insuredName}</strong> (
          {submission.lineOfBusiness})
        </span>
      </div>

      <QuoteBuilderCalculator
        submission={submission}
        onQuoteSaved={(q) => {
          console.info("Quote saved successfully:", q);
        }}
      />
    </div>
  );
}
