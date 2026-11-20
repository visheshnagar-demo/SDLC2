import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { DocumentVerificationPage } from '../pages/DocumentVerificationPage';

describe('DocumentVerificationPage', () => {
  it('renders page header and document verification components', () => {
    render(
      <BrowserRouter>
        <DocumentVerificationPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Identity Document Verification & OCR/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Identity Document Vault & History/i })).toBeInTheDocument();
  });
});
