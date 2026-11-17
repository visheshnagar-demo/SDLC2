import React from 'react';
import CarrierDashboardTable from '../components/carrier/CarrierDashboardTable';

export const CarrierDashboardPage = () => {
  return (
    <div className="py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Facultative Reinsurance Submissions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your Cyber and D&O facultative placement requests, automated scores, and underwriter quotes.
        </p>
      </div>
      <CarrierDashboardTable />
    </div>
  );
};

export default CarrierDashboardPage;
