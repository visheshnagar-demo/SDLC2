import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnderwriterQueueDashboard from '../components/UnderwriterQueueDashboard';

export default function UnderwriterQueuePage() {
  const navigate = useNavigate();

  const handleSelectSubmission = (id) => {
    navigate(`/submissions/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Underwriting Review Queue & Triage Desk
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Automated risk scoring, missing disclosure checklists, and decisioning workbench.
        </p>
      </div>

      <UnderwriterQueueDashboard onSelectSubmission={handleSelectSubmission} />
    </div>
  );
}
