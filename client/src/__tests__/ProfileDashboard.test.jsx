import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProfileDashboard } from '../components/ProfileDashboard';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/api', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'user-uuid-1234',
    email: 'test@example.com',
    full_name: 'Test Customer',
    role: 'CUSTOMER',
    is_active: true,
    created_at: '2026-05-18T00:00:00Z',
  }),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  refreshAuthToken: vi.fn(),
  logoutUser: vi.fn(),
}));

describe('ProfileDashboard', () => {
  it('renders customer profile information and tabs', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProfileDashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Identity & Security Attributes/i)).toBeInTheDocument();
    expect(screen.getByText(/Digital Onboarding Pipeline/i)).toBeInTheDocument();
  });
});
