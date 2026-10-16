import React from "react";
import AppShell from "../components/layout/AppShell";
import CarrierSubmissionForm from "../components/submission/CarrierSubmissionForm";

export function CarrierPortalPage() {
  return (
    <AppShell>
      <CarrierSubmissionForm />
    </AppShell>
  );
}

export default CarrierPortalPage;
