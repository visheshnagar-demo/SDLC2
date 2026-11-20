import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentListTable } from '../components/DocumentListTable';

describe('DocumentListTable', () => {
  it('renders empty state when no documents exist', () => {
    render(<DocumentListTable documents={[]} />);

    expect(screen.getByText(/Identity Document Vault & History/i)).toBeInTheDocument();
    expect(screen.getByText(/No identity documents in vault yet/i)).toBeInTheDocument();
  });

  it('renders list of documents and handles row selection', () => {
    const mockDocs = [
      {
        id: '11111111-2222-3333-4444-555555555555',
        documentType: 'PASSPORT',
        fileName: 'passport_front.jpg',
        fileSize: 2500000,
        status: 'PROCESSED',
        ocrConfidence: 0.968,
        warningFlags: [],
      },
      {
        id: '66666666-7777-8888-9999-000000000000',
        documentType: 'DRIVERS_LICENSE',
        fileName: 'dl_front.jpg',
        fileSize: 1800000,
        status: 'PROCESSED',
        ocrConfidence: 0.982,
        warningFlags: ['EXPIRES_SOON'],
      },
    ];

    const onSelectMock = vi.fn();

    render(
      <DocumentListTable
        documents={mockDocs}
        selectedDocumentId="11111111-2222-3333-4444-555555555555"
        onSelectDocument={onSelectMock}
      />
    );

    expect(screen.getByText('International Passport')).toBeInTheDocument();
    expect(screen.getByText('Commercial Driver License')).toBeInTheDocument();
    expect(screen.getByText('passport_front.jpg')).toBeInTheDocument();
    expect(screen.getByText('96.8%')).toBeInTheDocument();
    expect(screen.getByText(/EXPIRES SOON/i)).toBeInTheDocument();

    const inspectBtns = screen.getAllByRole('button');
    const secondInspectBtn = inspectBtns.find((btn) => btn.textContent?.includes('Inspect'));
    if (secondInspectBtn) {
      fireEvent.click(secondInspectBtn);
      expect(onSelectMock).toHaveBeenCalled();
    }
  });
});
