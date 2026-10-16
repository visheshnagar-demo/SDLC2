import React from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { CarrierDashboardTable } from "../components/carrier/CarrierDashboardTable";

export const CarrierDashboardPage = () => {
  const location = useLocation();
  const newSubmissionRef = location.state?.newSubmissionRef;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* New Submission Toast Banner */}
        {newSubmissionRef && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">
                  Submission Successfully Registered!
                </span>
                <p className="text-emerald-700 mt-0.5">
                  Reference:{" "}
                  <span className="font-mono font-semibold">
                    {newSubmissionRef}
                  </span>{" "}
                  has been dispatched to the Underwriting Review Queue.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-textPrimary tracking-tight">
              Carrier Facultative Portfolio Dashboard
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Real-time status tracking for Cyber and D&amp;O facultative
              reinsurance submissions and quote bindings.
            </p>
          </div>
        </div>

        {/* Dashboard Table */}
        <CarrierDashboardTable />
      </div>
    </AppShell>
  );
};

export default CarrierDashboardPage;
