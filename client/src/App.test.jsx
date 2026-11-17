import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import Card from './components/common/Card';
import RiskScoreBreakdownCard from './components/underwriter/RiskScoreBreakdownCard';

describe('Common UI Components', () => {
  it('renders Button component with children', () => {
    render(<Button>Submit Request</Button>);
    expect(screen.getByRole('button', { name: /Submit Request/i })).toBeInTheDocument();
  });

  it('renders Badge component with correct text', () => {
    render(<Badge variant="HIGH">HIGH RISK</Badge>);
    expect(screen.getByText('HIGH RISK')).toBeInTheDocument();
  });

  it('renders Card with title and subtitle', () => {
    render(
      <Card title="Test Title" subtitle="Test Subtitle">
        <div>Card Content</div>
      </Card>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });
});

describe('RiskScoreBreakdownCard', () => {
  it('renders risk score gauge and tier', () => {
    render(
      <RiskScoreBreakdownCard
        riskScore={75}
        riskTier="HIGH"
        riskBreakdowns={[
          {
            rule_key: 'RANSOMWARE_CLAIM',
            rule_name: 'Recent Ransomware Claim',
            score_delta: 25,
            rationale: 'Recent ransomware incident flagged in past 2 years',
          },
        ]}
      />
    );
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('HIGH RISK TIER')).toBeInTheDocument();
    expect(screen.getByText('Recent Ransomware Claim')).toBeInTheDocument();
  });
});

describe('App Root', () => {
  it('renders navigation bar and header elements', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/FacRe Portal/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Submissions/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/New Request/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Underwriter Queue/i).length).toBeGreaterThan(0);
  });
});
