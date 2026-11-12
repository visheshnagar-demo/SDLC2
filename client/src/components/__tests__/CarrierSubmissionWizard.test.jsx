import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CarrierSubmissionWizard from '../CarrierSubmissionWizard';

describe('CarrierSubmissionWizard', () => {
  it('renders step 1 with carrier and policy parameter inputs', () => {
    render(<CarrierSubmissionWizard />);

    expect(screen.getByText(/Facultative Reinsurance Placement Intake/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ceding Carrier Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Insured Enterprise Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primary Policy Limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Attachment Point/i)).toBeInTheDocument();
  });

  it('allows toggling between Cyber and D&O risk classes', () => {
    render(<CarrierSubmissionWizard />);

    const cyberBtn = screen.getByRole('button', { name: /Cyber Liability/i });
    const doBtn = screen.getByRole('button', { name: /Directors & Officers/i });

    expect(cyberBtn).toBeInTheDocument();
    expect(doBtn).toBeInTheDocument();

    fireEvent.click(doBtn);
    expect(doBtn.className).toContain('border-indigo-600');
  });

  it('validates required insured enterprise name before proceeding to step 2', () => {
    render(<CarrierSubmissionWizard />);

    const insuredInput = screen.getByLabelText(/Insured Enterprise Name/i);
    fireEvent.change(insuredInput, { target: { value: '' } });

    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn);

    expect(screen.getByText(/Insured Enterprise Name is required/i)).toBeInTheDocument();
  });
});
