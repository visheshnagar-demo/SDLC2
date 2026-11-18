import React from 'react';
import { ProfileDashboard } from '../components/ProfileDashboard';

export const DashboardPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <ProfileDashboard />
    </div>
  );
};

export default DashboardPage;
