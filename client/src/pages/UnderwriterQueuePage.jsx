import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Shield, AlertTriangle, Layers } from "lucide-react";
import UnderwriterReviewQueue from "../components/UnderwriterReviewQueue";

export default function UnderwriterQueuePage() {
  const navigate = useNavigate();

  const handleSelect = (id) => {
    navigate(`/submissions/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Underwriter Review Queue
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Prioritized triage dashboard for facultative Cyber & D&O
                submissions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/intake"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition"
          >
            + New Carrier Submission
          </a>
        </div>
      </div>

      {/* Main Review Queue Component */}
      <UnderwriterReviewQueue onSelectSubmission={handleSelect} />
    </div>
  );
}
