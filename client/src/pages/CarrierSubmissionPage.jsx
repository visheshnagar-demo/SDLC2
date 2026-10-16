import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Info } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { CarrierSubmissionForm } from "../components/carrier/CarrierSubmissionForm";

export const CarrierSubmissionPage = () => {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-textSecondary mb-1">
              <Link
                to="/carrier/dashboard"
                className="hover:text-primary flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Carrier Dashboard
              </Link>
              <span>/</span>
              <span className="text-textPrimary font-medium">
                New Facultative Submission
              </span>
            </div>
            <h1 className="text-xl font-bold text-textPrimary tracking-tight">
              Facultative Reinsurance Request Submission
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Submit Cyber or Directors &amp; Officers (D&amp;O) risk placement
              for algorithmic scoring and underwriter capacity review.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-sm flex items-start gap-2.5 text-xs text-primary">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Real-time scoring checks attachment points, revenue size, loss
              frequency, and technical controls.
            </span>
          </div>
        </div>

        {/* Wizard Form */}
        <CarrierSubmissionForm />
      </div>
    </AppShell>
  );
};

export default CarrierSubmissionPage;
