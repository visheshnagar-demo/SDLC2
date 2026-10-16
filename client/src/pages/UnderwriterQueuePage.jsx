import React from "react";
import { AppShell } from "../components/layout/AppShell";
import { UnderwriterReviewQueueTable } from "../components/underwriter/UnderwriterReviewQueueTable";

export const UnderwriterQueuePage = () => {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-textPrimary tracking-tight">
              Underwriting Review Queue &amp; Risk Scoring Engine
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Prioritized triage queue for evaluating Cyber and D&amp;O
              facultative risks, monitoring missing document flags, and
              executing quote/decline decisions.
            </p>
          </div>
        </div>

        <UnderwriterReviewQueueTable />
      </div>
    </AppShell>
  );
};

export default UnderwriterQueuePage;
