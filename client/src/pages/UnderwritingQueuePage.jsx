import React from "react";
import AppShell from "../components/layout/AppShell";
import UnderwriterReviewQueue from "../components/underwriting/UnderwriterReviewQueue";

export default function UnderwritingQueuePage() {
  return (
    <AppShell
      title="Underwriter Review Queue & Workbench"
      subtitle="Prioritized facultative reinsurance queue with automated risk assessment and scoring telemetry"
    >
      <UnderwriterReviewQueue />
    </AppShell>
  );
}
