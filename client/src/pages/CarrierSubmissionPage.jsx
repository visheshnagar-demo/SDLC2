import React from 'react';
import { useNavigate } from 'react-router-dom';
import CarrierSubmissionWizard from '../components/CarrierSubmissionWizard';

export default function CarrierSubmissionPage() {
  const navigate = useNavigate();

  const handleSuccess = (submission) => {
    // Optionally redirect to tracking or let wizard show success
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Carrier Placement Intake
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit primary policy declarations and risk profiles for facultative reinsurance placement.
        </p>
      </div>

      <CarrierSubmissionWizard onSubmissionSuccess={handleSuccess} />
    </div>
  );
}
