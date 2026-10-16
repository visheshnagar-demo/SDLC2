import React from "react";
import AppShell from "../components/layout/AppShell";
import SubmissionDetailWorkspace from "../components/decision/SubmissionDetailWorkspace";

export function SubmissionDetailPage() {
  return (
    <AppShell>
      <SubmissionDetailWorkspace />
    </AppShell>
  );
}

export default SubmissionDetailPage;
