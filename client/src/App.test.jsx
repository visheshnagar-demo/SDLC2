import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import Badge from './components/common/Badge';
import MetricCard from './components/common/MetricCard';

describe('IdentiVerify Application Smoke Tests', () => {
  it('renders App with header navigation', () => {
    render(<App />);
    expect(screen.getByText(/IdentiVerify/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer Onboarding/i)).toBeInTheDocument();
    expect(screen.getByText(/Compliance Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit Console/i)).toBeInTheDocument();
  });

  it('renders Badge component with text and style', () => {
    render(<Badge variant="success">TEST_BADGE</Badge>);
    expect(screen.getByText('TEST_BADGE')).toBeInTheDocument();
  });

  it('renders MetricCard component correctly', () => {
    render(
      <MetricCard
        title="Active Applications"
        value="1,248"
        subtitle="Current test run"
      />
    );
    expect(screen.getByText('Active Applications')).toBeInTheDocument();
    expect(screen.getByText('1,248')).toBeInTheDocument();
  });
});
