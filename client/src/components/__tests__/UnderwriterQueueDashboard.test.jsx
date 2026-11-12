import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UnderwriterQueueDashboard from '../UnderwriterQueueDashboard';

// Mock api service
vi.mock('../../services/api', () => ({
  api: {
    getSubmissions: vi.fn().mockResolvedValue([
      {
        id: 'FAC-2026-0001',
        insured_name: 'Globex Cyber Dynamics',
        carrier_name: 'Apex Insurance Mutual',
        risk_type: 'CYBER',
        primary_limit: 5000000,
        attachment_point: 10000000,
        ceded_limit: 2500000,
        carrier_premium: 150000,
        risk_score: 35,
        status: 'PENDING_REVIEW',
        missing_flags: []
      }
    ]),
    getSubmissionFlags: vi.fn().mockResolvedValue([]),
    getDeclineReasons: vi.fn().mockResolvedValue([]),
    createDecision: vi.fn().mockResolvedValue({ id: 'dec-1', decision_type: 'QUOTE' })
  }
}));

describe('UnderwriterQueueDashboard', () => {
  it('renders queue KPI cards and risk filters', async () => {
    render(<UnderwriterQueueDashboard />);

    expect(screen.getByText(/Total Placement Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Underwriting/i)).toBeInTheDocument();
    expect(screen.getByText(/Quoted Placements/i)).toBeInTheDocument();
    expect(screen.getByText(/Declined Risks/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /All Risks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cyber/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /D&O/i })).toBeInTheDocument();
  });
});
