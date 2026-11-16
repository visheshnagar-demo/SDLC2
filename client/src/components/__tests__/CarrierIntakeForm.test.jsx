import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CarrierIntakeForm from '../CarrierIntakeForm';

describe('CarrierIntakeForm component', () => {
  it('renders intake form with all essential policy inputs', () => {
    render(
      <BrowserRouter>
        <CarrierIntakeForm />
      </BrowserRouter>
    );

    // Verify key fields and buttons
    expect(screen.getByText(/1. Select Risk Line of Business/i)).toBeInTheDocument();
    expect(screen.getByText(/Cyber Reinsurance/i)).toBeInTheDocument();
    expect(screen.getByText(/Directors & Officers/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Apex Global Financial Corp/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Reinsurance Request/i })).toBeInTheDocument();
  });

  it('allows toggling between Cyber and D&O risk types', () => {
    render(
      <BrowserRouter>
        <CarrierIntakeForm />
      </BrowserRouter>
    );

    const dnoButton = screen.getByText(/Directors & Officers \(D&O\)/i);
    fireEvent.click(dnoButton);

    expect(screen.getByText(/Formal Board Risk Oversight Policy/i)).toBeInTheDocument();
  });
});
