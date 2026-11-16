import React from 'react';
import { Link } from 'react-router-dom';
import UnderwriterReviewQueue from '../components/UnderwriterReviewQueue';
import { PlusCircle, ShieldCheck } from 'lucide-react';

export default function UnderwriterQueuePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" /> Underwriter Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized facultative reinsurance submissions with automated risk scores, missing item flags, and quote/decline actions.
          </p>
        </div>

        <Link
          to="/intake"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> New Carrier Request
        </Link>
      </div>

      <UnderwriterReviewQueue />
    </div>
  );
}
