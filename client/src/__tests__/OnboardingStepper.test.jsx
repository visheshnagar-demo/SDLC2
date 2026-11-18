import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OnboardingStepper } from '../components/OnboardingStepper';

describe('OnboardingStepper', () => {
  it('renders all 4 stages of the onboarding pipeline', () => {
    render(<OnboardingStepper initialStep={2} />);

    expect(screen.getByText(/Digital Onboarding Pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Account Registration/i)).toBeInTheDocument();
    expect(screen.getByText(/Email & Security Setup/i)).toBeInTheDocument();
    expect(screen.getByText(/Identity Verification \(KYC\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Platform Access/i)).toBeInTheDocument();
  });
});
