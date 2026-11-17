import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Veritas IDV Application Smoke Test', () => {
  it('renders without crashing and displays header brand title', () => {
    render(<App />);
    expect(screen.getByText(/Veritas/i)).toBeInTheDocument();
  });

  it('renders customer journey navigation elements', () => {
    render(<App />);
    expect(screen.getByText(/Document Upload/i)).toBeInTheDocument();
  });

  it('renders biometric and compliance portals', () => {
    render(<App />);
    expect(screen.getByText(/Compliance Review Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit Trail & Event Logs/i)).toBeInTheDocument();
  });
});
