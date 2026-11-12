import React from 'react';
import { useNavigate } from 'react-router-dom';
import CarrierTrackingPortal from '../components/CarrierTrackingPortal';

export default function CarrierTrackingPage() {
  const navigate = useNavigate();

  const handleSelectSubmission = (id) => {
    navigate(`/submissions/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <CarrierTrackingPortal onSelectSubmission={handleSelectSubmission} />
    </div>
  );
}
