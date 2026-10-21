import React, { useState } from "react";
import { BarChart3, ShieldAlert, Sparkles, Building2 } from "lucide-react";
import PortfolioAnalyticsDashboard from "../components/PortfolioAnalyticsDashboard";
import ManagerReferralTable from "../components/ManagerReferralTable";

export default function ManagerDashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <span>Chief Underwriting Officer & Manager Dashboard</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Portfolio exposure analytics, quote-to-bind conversion rates, and
          single-line authority referral approvals.
        </p>
      </div>

      {/* Referrals Section */}
      <ManagerReferralTable
        onActionCompleted={() => setRefreshTrigger((prev) => prev + 1)}
      />

      {/* Analytics Section */}
      <PortfolioAnalyticsDashboard key={refreshTrigger} />
    </div>
  );
}
