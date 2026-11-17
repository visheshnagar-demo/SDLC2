import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import Card from './components/common/Card';
import RiskScoreBreakdownCard from './components/underwriter/RiskScoreBreakdownCard';
import UnderwriterReviewQueueTable from './components/underwriter/UnderwriterReviewQueueTable';
import CarrierDashboardTable from './components/carrier/CarrierDashboardTable';
import CarrierSubmissionForm from './components/carrier/CarrierSubmissionForm';
import DecisionConsoleForm from './components/underwriter/DecisionConsoleForm';

// Mock API service
vi.mock('./services/api', () => ({
  api: {
    getSubmissions: vi.fn().mockResolvedValue([
      {
        id: 'sub-12345',
        submission_reference: 'FAC-2026-0001',
        insured_name: 'Acme Cyber Corp',
        industry_segment: 'Technology',
        risk_type: 'CYBER',
        sum_insured: 10000000,
        attachment_point: 1000000,
        risk_score: 85,
        risk_tier: 'HIGH',
        status: 'SUBMITTED',
      },
    ]),
    getUnderwriterQueue: vi.fn().mockResolvedValue([
      {
        id: 'sub-12345',
        submission_reference: 'FAC-2026-0001',
        carrier_name: 'Global Re Partners',
        insured_name: 'Acme Cyber Corp',
        industry_segment: 'Technology',
        risk_type: 'CYBER',
        sum_insured: 10000000,
        attachment_point: 1000000,
        risk_score: 85,
        risk_tier: 'HIGH',
        status: 'SUBMITTED',
        missing_flags: [],
        active_lock_user_id: null,
      },
    ]),
    getSubmissionDetail: vi.fn().mockResolvedValue({
      id: 'sub-12345',
      submission_reference: 'FAC-2026-0001',
      carrier_id: 'carrier-1',
      insured_name: 'Acme Cyber Corp',
      industry_segment: 'Technology',
      risk_type: 'CYBER',
      sum_insured: 10000000,
      attachment_point: 1000000,
      annual_revenue: 50000000,
      security_governance_score: 80,
      prior_claims_count: 1,
      prior_claims_total: 250000,
      risk_score: 85,
      risk_tier: 'HIGH',
      status: 'SUBMITTED',
      missing_flags: [],
      risk_score_breakdowns: [
        {
          rule_key: 'RANSOMWARE_CLAIM',
          rule_name: 'Recent Ransomware Claim',
          score_delta: 25,
          rationale: 'Recent ransomware incident flagged in past 2 years',
        },
      ],
      attachments: [],
      decisions: [],
      active_lock_user_id: null,
    }),
    toggleLock: vi.fn().mockResolvedValue({ status: 'locked' }),
    recordDecision: vi.fn().mockResolvedValue({ status: 'success' }),
    createSubmission: vi.fn().mockResolvedValue({ id: 'sub-new-1', submission_reference: 'FAC-2026-0002' }),
    uploadAttachment: vi.fn().mockResolvedValue({ status: 'uploaded' }),
    getDeclineReasons: vi.fn().mockResolvedValue([
      { code: 'HIGH_LOSS_FREQUENCY', label: 'High Loss Frequency / Adverse Loss Record' },
    ]),
  },
}));

describe('Common UI Components', () => {
  it('renders Button component with children and handles click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit Request</Button>);
    const button = screen.getByRole('button', { name: /Submit Request/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
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

  it('renders missing information flags when present', () => {
    render(
      <RiskScoreBreakdownCard
        riskScore={60}
        riskTier="MEDIUM"
        missingFlags={[
          {
            id: 'flag-1',
            flag_name: 'Missing Financials',
            severity: 'WARNING',
            description: 'Audited financial statements missing',
          },
        ]}
      />
    );
    expect(screen.getByText('Missing Financials')).toBeInTheDocument();
    expect(screen.getByText('Audited financial statements missing')).toBeInTheDocument();
  });
});

describe('DecisionConsoleForm', () => {
  it('renders decision form in quote mode by default', () => {
    render(<DecisionConsoleForm submissionId="sub-12345" sumInsured={10000000} />);
    expect(screen.getByText(/Issue Binding Quote/i)).toBeInTheDocument();
    expect(screen.getByText(/Capacity Offered/i)).toBeInTheDocument();
    expect(screen.getByText(/Authorize & Issue Quote/i)).toBeInTheDocument();
  });

  it('switches to decline mode on tab click', () => {
    render(<DecisionConsoleForm submissionId="sub-12345" sumInsured={10000000} />);
    const declineTab = screen.getByRole('button', { name: /Decline Submission/i });
    fireEvent.click(declineTab);
    expect(screen.getByText(/Mandatory Decline Reason Code/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm & Record Decline/i)).toBeInTheDocument();
  });
});

describe('CarrierSubmissionForm', () => {
  it('renders carrier submission form with default values and validation', () => {
    render(
      <BrowserRouter>
        <CarrierSubmissionForm />
      </BrowserRouter>
    );
    expect(screen.getByText(/Submit Facultative Reinsurance Request/i)).toBeInTheDocument();
    expect(screen.getByText(/Cyber Facultative Reinsurance/i)).toBeInTheDocument();
    expect(screen.getByText(/Directors & Officers \(D&O\)/i)).toBeInTheDocument();
  });
});

describe('UnderwriterReviewQueueTable', () => {
  it('renders review workbench with filter controls and table headers', async () => {
    render(
      <BrowserRouter>
        <UnderwriterReviewQueueTable />
      </BrowserRouter>
    );
    expect(screen.getByText(/Underwriter Review Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Underwriting/i)).toBeInTheDocument();
    expect(screen.getByText(/High Risk Submissions/i)).toBeInTheDocument();
  });
});

describe('CarrierDashboardTable', () => {
  it('renders carrier dashboard with metrics', async () => {
    render(
      <BrowserRouter>
        <CarrierDashboardTable />
      </BrowserRouter>
    );
    expect(screen.getByText(/Total Submissions/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Placements/i)).toBeInTheDocument();
    expect(screen.getByText(/Binding Quotes/i)).toBeInTheDocument();
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
