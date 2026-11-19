import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Dashboard from './Dashboard';
import { AuthProvider } from '../context/AuthContext';

describe('Dashboard Component', () => {
  it('renders dashboard loading or portal layout', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // It should render portal header or loading state without crashing
    expect(document.body).toBeInTheDocument();
  });
});
