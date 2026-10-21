import React from "react";
import { useNavigate, Link } from "react-router-dom";
import UnderwriterReviewQueue from "../components/UnderwriterReviewQueue";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, ListFilter } from "lucide-react";

export default function QueuePage() {
  const navigate = useNavigate();
  const { isCedingUnderwriter } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <ListFilter className="w-6 h-6 text-indigo-600" />
            <span>
              {isCedingUnderwriter
                ? "My Submissions Pipeline"
                : "Underwriter Review Queue & SLA Dashboard"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isCedingUnderwriter
              ? "Track real-time status, underwriter queries, and issued facultative quotes for your company."
              : "Sort, triage, evaluate risk scores, and process specialty facultative reinsurance placements."}
          </p>
        </div>

        <Link
          to="/intake"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      <UnderwriterReviewQueue
        onSelectSubmission={(id) => navigate(`/submissions/${id}`)}
      />
    </div>
  );
}
