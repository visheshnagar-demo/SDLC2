import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SessionLifecycleCard } from '../components/SessionLifecycleCard';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/api', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'user-uuid-1234',
    email: 'test@example.com',
  }),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  refreshAuthToken: vi.fn(),
  logoutUser: vi.fn(),
}));

describe('SessionLifecycleCard', () => {
  it('renders token session TTL and action controls', () => {
    render(
      <AuthProvider>
        <SessionLifecycleCard />
      </AuthProvider>
    );

    expect(screen.getByText(/Session Lifecycle/i)).toBeInTheDocument();
    expect(screen.getByText(/Access Token TTL/i)).toBeInTheDocument();
    expect(screen.getByText(/Renew Access Token/i)).toBeInTheDocument();
    expect(screen.getByText(/End Session/i)).toBeInTheDocument();
  });
});
