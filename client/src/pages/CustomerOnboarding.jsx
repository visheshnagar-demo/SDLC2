import React, { useState } from 'react';
import { DocumentOnboardingPage } from './DocumentOnboardingPage';
import { BiometricOnboardingPage } from './BiometricOnboardingPage';
import { ApplicationStatusPage } from './ApplicationStatusPage';
import { StepperHeader } from '../components/onboarding/StepperHeader';
import { useAuth } from '../context/AuthContext';

export const CustomerOnboarding = () => {
  const { onboardingState } = useAuth();
  const step = onboardingState?.step || 2;

  return (
    <div className="space-y-6">
      {step <= 2 && <DocumentOnboardingPage />}
      {step === 3 && <BiometricOnboardingPage />}
      {step >= 4 && <ApplicationStatusPage />}
    </div>
  );
};

export default CustomerOnboarding;
