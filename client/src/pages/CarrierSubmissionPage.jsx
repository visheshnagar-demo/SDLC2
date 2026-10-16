import React from "react";
import HeaderBar from "../components/layout/HeaderBar";
import CarrierSubmissionWizard from "../components/submissions/CarrierSubmissionWizard";

export function CarrierSubmissionPage() {
  return (
    <div>
      <HeaderBar title="Carrier Reinsurance Request Submission" />
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <CarrierSubmissionWizard />
      </main>
    </div>
  );
}

export default CarrierSubmissionPage;
