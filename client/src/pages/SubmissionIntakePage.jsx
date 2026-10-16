import React from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus, ShieldCheck, CheckCircle2, Info } from "lucide-react";
import CarrierIntakeForm from "../components/CarrierIntakeForm";

export default function SubmissionIntakePage() {
  const navigate = useNavigate();

  const handleSuccess = (submission) => {
    // Navigates or stays with feedback
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Guide */}
      <div className="mb-8 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-800 text-blue-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Carrier Broker & Primary Underwriting Gateway
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Facultative Reinsurance Placement Portal
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Submit single-risk Cyber and D&O excess capacity requests. Automated
            scoring rules triage risk parameters, identify missing underwriting
            documents, and route submissions to the facultative review queue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Intake Form */}
        <div className="lg:col-span-3">
          <CarrierIntakeForm onSubmissionSuccess={handleSuccess} />
        </div>

        {/* Sidebar Info & Guidelines */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-600" />
              Underwriting Guidelines
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Cyber Lines:</strong> Mandatory MFA and 24/7 EDR
                  deployment required for standard terms.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>D&O Lines:</strong> 3-year loss runs & independent
                  board majority required.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Attachment Point:</strong> Retention must attach at or
                  above primary carrier baseline.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-100 p-5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">
              Underwriting Turnaround SLA
            </span>
            <p>
              Standard automated score generation takes &lt;5 seconds. Formal
              underwriter quote or decline binding is delivered within 24
              business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
