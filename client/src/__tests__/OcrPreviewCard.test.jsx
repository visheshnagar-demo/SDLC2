import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OcrPreviewCard } from '../components/OcrPreviewCard';

describe('OcrPreviewCard', () => {
  it('renders placeholder state when no document data is provided', () => {
    render(<OcrPreviewCard />);

    expect(screen.getByText(/Automated OCR Extraction Preview/i)).toBeInTheDocument();
  });

  it('renders extracted fields and confidence score when document data is provided', () => {
    const mockData = {
      id: 'doc-12345',
      ocrConfidence: 0.968,
      warningFlags: ['EXPIRES_SOON'],
      extractedData: {
        fullName: 'JANE DOE',
        dateOfBirth: '1990-05-15',
        documentNumber: 'P12345678',
        expiryDate: '2026-06-12',
      },
    };

    render(<OcrPreviewCard documentData={mockData} />);

    expect(screen.getByText(/OCR Field Extraction/i)).toBeInTheDocument();
    expect(screen.getByText(/96.8% High Confidence/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('JANE DOE')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1990-05-15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('P12345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-06-12')).toBeInTheDocument();
    expect(screen.getByText(/Document expires in/i)).toBeInTheDocument();
  });

  it('triggers onConfirm callback on button click', () => {
    const mockData = {
      id: 'doc-12345',
      ocrConfidence: 0.98,
      extractedData: {
        fullName: 'JOHN SMITH',
        dateOfBirth: '1985-01-01',
        documentNumber: 'DL998877',
        expiryDate: '2030-01-01',
      },
    };
    const onConfirmMock = vi.fn();

    render(<OcrPreviewCard documentData={mockData} onConfirm={onConfirmMock} />);

    const confirmBtn = screen.getByText(/Confirm & Proceed/i);
    fireEvent.click(confirmBtn);

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Document details confirmed/i)).toBeInTheDocument();
  });
});
