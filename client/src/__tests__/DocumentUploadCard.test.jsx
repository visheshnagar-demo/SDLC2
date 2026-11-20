import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentUploadCard } from '../components/DocumentUploadCard';

describe('DocumentUploadCard', () => {
  it('renders document type selector and upload dropzone', () => {
    render(<DocumentUploadCard />);

    expect(screen.getByText(/Identity Document Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Passport/i)).toBeInTheDocument();
    expect(screen.getByText(/Driver's License/i)).toBeInTheDocument();
    expect(screen.getByText(/National ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop your document here/i)).toBeInTheDocument();
  });

  it('switches document type on button click', () => {
    render(<DocumentUploadCard />);

    const dlBtn = screen.getByText(/Driver's License/i);
    fireEvent.click(dlBtn);
    expect(dlBtn.className).toContain('bg-indigo-600');
  });

  it('handles file selection', () => {
    render(<DocumentUploadCard />);

    const input = screen.getByTestId('document-file-input');
    const file = new File(['dummy content'], 'passport_sample.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('passport_sample.jpg')).toBeInTheDocument();
    expect(screen.getByText(/CLEAN/i)).toBeInTheDocument();
  });
});
