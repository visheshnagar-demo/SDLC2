import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentInspectionDrawer } from '../components/DocumentInspectionDrawer';

describe('DocumentInspectionDrawer', () => {
  it('renders placeholder when no document is selected', () => {
    render(<DocumentInspectionDrawer />);

    expect(screen.getByText(/Field Inspection Analyzer/i)).toBeInTheDocument();
    expect(screen.getByText(/Select any document from the vault/i)).toBeInTheDocument();
  });

  it('renders document metadata and extracted fields when document is passed', () => {
    const mockDoc = {
      id: 'abc-123-uuid',
      documentType: 'PASSPORT',
      fileName: 'my_passport.pdf',
      mimeType: 'application/pdf',
      extractedData: {
        fullName: 'ALICE SMITH',
        dateOfBirth: '1992-08-20',
        documentNumber: 'K98765432',
        expiryDate: '2028-11-15',
      },
      warningFlags: [],
    };

    render(<DocumentInspectionDrawer document={mockDoc} />);

    expect(screen.getByText(/Passport Field Analyzer/i)).toBeInTheDocument();
    expect(screen.getByText(/ALICE SMITH/i)).toBeInTheDocument();
    expect(screen.getByText(/1992-08-20/i)).toBeInTheDocument();
    expect(screen.getByText(/K98765432/i)).toBeInTheDocument();
    expect(screen.getByText(/2028-11-15/i)).toBeInTheDocument();
    expect(screen.getByText(/Malware Scan: CLEAN/i)).toBeInTheDocument();
    expect(screen.getByText(/my_passport.pdf/i)).toBeInTheDocument();
  });
});
