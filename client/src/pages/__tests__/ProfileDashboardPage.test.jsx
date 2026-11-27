import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfileDashboardPage from '../ProfileDashboardPage';
import { AuthProvider } from '../../context/AuthContext';
import { authService, profileService } from '../../services/api';

vi.mock('../../services/api', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(() => true),
    getToken: vi.fn(() => 'test-token'),
  },
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('ProfileDashboardPage', () => {
  it('renders customer profile information and KPIs', async () => {
    profileService.getProfile.mockResolvedValueOnce({
      user_id: 'c3017a90-3a5e-4b2a-9f1c-722a412b1d01',
      email: 'jane.doe@enterprise.com',
      first_name: 'Jane',
      last_name: 'Doe',
      phone_number: '+1234567890',
      date_of_birth: '1990-01-15',
      address_line1: '123 Main St',
      city: 'New York',
      state_province: 'NY',
      postal_code: '10001',
      country_code: 'USA',
      email_verified: true,
      status: 'ACTIVE',
    });

    render(
      <AuthProvider>
        <BrowserRouter>
          <ProfileDashboardPage />
        </BrowserRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Verified Account/i)).toBeInTheDocument();
      expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
    });
  });
});
