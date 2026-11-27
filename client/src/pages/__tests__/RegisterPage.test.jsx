import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';
import { AuthProvider } from '../../context/AuthContext';

// Mock authService
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

describe('RegisterPage', () => {
  it('renders registration form heading and inputs', () => {
    const { container } = render(
      <AuthProvider>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    expect(container.querySelector('input[name="first_name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="last_name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
  });

  it('validates password match before submission', async () => {
    const { container } = render(
      <AuthProvider>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthProvider>
    );

    const firstNameInput = container.querySelector('input[name="first_name"]');
    const lastNameInput = container.querySelector('input[name="last_name"]');
    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');
    const termsCheckbox = container.querySelector('input[name="termsAccepted"]');
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane.doe@enterprise.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'MismatchedPassword123!' } });
    fireEvent.click(termsCheckbox);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});
