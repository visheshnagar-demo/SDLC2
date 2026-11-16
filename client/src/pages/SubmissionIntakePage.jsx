import React from 'react';
import CarrierIntakeForm from '../components/CarrierIntakeForm';
import { Shield, Sparkles } from 'lucide-react';

export default function SubmissionIntakePage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-800/80 text-blue-200 rounded-full text-xs font-semibold mb-3 border border-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Carrier Placement Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            New Facultative Reinsurance Submission
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Submit Cyber and D&O facultative risk placement requests with automatic risk scoring, completeness verification, and rapid underwriter review.
          </p>
        </div>
      </div>

      <CarrierIntakeForm />
    </div>
  );
}
