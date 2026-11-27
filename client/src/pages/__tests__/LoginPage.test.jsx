import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../context/AuthContext';
import { authService } from '../../services/api';

vi.mock('../../services/api', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(() => false),
    getToken: vi.fn(() => null),
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

describe('LoginPage', () => {
  it('renders sign in fields and auto-fill button', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Secure Customer Sign In/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/customer@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Auto-fill/i })).toBeInTheDocument();
  });

  it('populates fields on Auto-fill click', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    const autoFillBtn = screen.getByRole('button', { name: /Auto-fill/i });
    fireEvent.click(autoFillBtn);

    const emailInput = screen.getByPlaceholderText(/customer@example.com/i);
    expect(emailInput.value).toBe('customer@example.com');
  });

  it('handles login form submission', async () => {
    authService.login.mockResolvedValueOnce({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      token_type: 'Bearer',
      expires_in: 900,
    });

    render(
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    );

    const autoFillBtn = screen.getByRole('button', { name: /Auto-fill/i });
    fireEvent.click(autoFillBtn);

    const submitBtn = screen.getByRole('button', { name: /Sign In to Portal/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'customer@example.com',
        password: 'SecurePassword123!',
      });
    });
  });
});
