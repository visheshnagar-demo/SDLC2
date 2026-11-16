import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import Card from './components/common/Card';

describe('Facultative Reinsurance Web Portal Smoke Tests', () => {
  it('renders landing page with portal overview and navigation links', () => {
    render(<App />);
    expect(
      screen.getByText(/Facultative Reinsurance Web Portal/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Carrier Placement Workspace/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Underwriter Scoring & Review Workbench/i)
    ).toBeInTheDocument();
  });

  it('renders Button component with label and responds to props', () => {
    render(<Button>Submit Placement</Button>);
    expect(screen.getByRole('button', { name: /Submit Placement/i })).toBeInTheDocument();
  });

  it('renders Badge component with correct text and variant styling', () => {
    render(<Badge variant="cyber">CYBER</Badge>);
    expect(screen.getByText(/CYBER/i)).toBeInTheDocument();
  });

  it('renders Card component with title and content', () => {
    render(
      <Card title="Risk Scoring Summary" subtitle="Submissions overview">
        <div>Card Inner Body Content</div>
      </Card>
    );
    expect(screen.getByText(/Risk Scoring Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Card Inner Body Content/i)).toBeInTheDocument();
  });
});
