import React from "react";
import AppShell from "../components/layout/AppShell";
import UnderwriterReviewQueue from "../components/queue/UnderwriterReviewQueue";

export function UnderwriterQueuePage() {
  return (
    <AppShell>
      <UnderwriterReviewQueue />
    </AppShell>
  );
}

export default UnderwriterQueuePage;
