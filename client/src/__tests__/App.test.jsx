import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { App } from '../App';

describe('App', () => {
  it('renders navbar and initial route', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByText(/AuthGuard/i)).toBeInTheDocument();
  });
});
