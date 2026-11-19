import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders without crashing and shows login screen by default', () => {
    render(<App />);
    expect(screen.getByText(/Sign in to VerifyID/i)).toBeInTheDocument();
  });
});
