import React, { useState, useEffect } from 'react';
import { DocumentUploadCard } from '../components/DocumentUploadCard';
import { OcrPreviewCard } from '../components/OcrPreviewCard';
import { DocumentListTable } from '../components/DocumentListTable';
import { DocumentInspectionDrawer } from '../components/DocumentInspectionDrawer';
import { getMyDocuments } from '../services/api';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DocumentVerificationPage = () => {
  const [documents, setDocuments] = useState([]);
  const [latestUploadedDoc, setLatestUploadedDoc] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState('');

  const loadDocuments = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const data = await getMyDocuments();
      const docList = Array.isArray(data) ? data : [];
      setDocuments(docList);
      if (docList.length > 0 && !selectedDoc) {
        setSelectedDoc(docList[0]);
      }
    } catch (err) {
      setFetchError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Unable to load document vault. Please check your network or token.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUploadSuccess = (uploadedDoc) => {
    setLatestUploadedDoc(uploadedDoc);
    setSelectedDoc(uploadedDoc);
    setActionSuccessNotice(`Document "${uploadedDoc.fileName}" uploaded and OCR analyzed successfully.`);
    setTimeout(() => setActionSuccessNotice(''), 5000);
    // Reload document list
    loadDocuments();
  };

  const handleConfirmOcrData = (confirmedDoc) => {
    setActionSuccessNotice('OCR extraction verified. Identity profile successfully updated.');
    setTimeout(() => setActionSuccessNotice(''), 4000);
    setLatestUploadedDoc(null);
    loadDocuments();
  };

  const handleResetUpload = () => {
    setLatestUploadedDoc(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <Link
                to="/dashboard"
                className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Dashboard
              </Link>
              <span className="text-slate-600">&bull;</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                KYC Identity Module
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Identity Document Verification & OCR
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Upload identity documents for automated malware verification, Tess4J optical character recognition, and secure biometric KYC compliance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadDocuments}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Records</span>
            </button>
          </div>
        </div>

        {/* Success / Error Notices */}
        {actionSuccessNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center space-x-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
        )}

        {fetchError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* SECTION 1: Document Upload & Live OCR Field Extraction */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <DocumentUploadCard onUploadSuccess={handleUploadSuccess} />
          </div>

          <div className="lg:col-span-6">
            <OcrPreviewCard
              documentData={latestUploadedDoc || selectedDoc}
              onReset={handleResetUpload}
              onConfirm={handleConfirmOcrData}
            />
          </div>
        </div>

        {/* SECTION 2: Document Vault & Side-panel Field Inspection Analyzer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-800">
          <div className="lg:col-span-7">
            <DocumentListTable
              documents={documents}
              selectedDocumentId={selectedDoc?.id}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
              isLoading={isLoading}
              onRefresh={loadDocuments}
            />
          </div>

          <div className="lg:col-span-5">
            <DocumentInspectionDrawer
              document={selectedDoc}
              onClose={() => setSelectedDoc(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationPage;
