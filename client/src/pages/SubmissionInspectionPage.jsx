import React from "react";
import AppShell from "../components/layout/AppShell";
import SubmissionInspectionWorkbench from "../components/underwriting/SubmissionInspectionWorkbench";

export default function SubmissionInspectionPage() {
  return (
    <AppShell
      title="Submission Inspection Workbench"
      subtitle="Detailed risk parameter analysis, missing information checklist, and decision recording"
    >
      <SubmissionInspectionWorkbench />
    </AppShell>
  );
}
