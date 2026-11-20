import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, File } from 'lucide-react';
import { uploadDocument } from '../services/api';

export const DocumentUploadCard = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('PASSPORT');
  const [isUploading, setIsUploading] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // 'scanning' | 'clean' | 'threat_detected'
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

  const validateFile = (file) => {
    if (!file) return 'No file selected';
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(png|jpe?g|pdf)$/i)) {
      return 'Unsupported file format. Please upload PNG, JPEG, or PDF.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File exceeds maximum limit of 10MB.';
    }
    return null;
  };

  const handleFileSelect = (file) => {
    setErrorMessage('');
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setSelectedFile(null);
      setScanStatus(null);
      return;
    }
    setSelectedFile(file);
    setScanStatus('clean');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a document file first.');
      return;
    }

    setIsUploading(true);
    setScanStatus('scanning');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);

      const result = await uploadDocument(formData);
      setScanStatus('clean');
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      const serverError =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Document upload & OCR extraction failed. Please try again.';
      setErrorMessage(serverError);
      setScanStatus(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setScanStatus(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">Identity Document Verification</h2>
            <p className="text-xs text-slate-400 mt-0.5">Upload a government-issued photo ID for automated OCR validation</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Step 2: KYC
          </span>
        </div>

        {/* Document Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Document Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'PASSPORT', label: 'Passport' },
              { id: 'DRIVERS_LICENSE', label: "Driver's License" },
              { id: 'NATIONAL_ID', label: 'National ID' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setDocumentType(type.id)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  documentType === type.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-950/30'
              : selectedFile
              ? 'border-emerald-500/50 bg-slate-900/80'
              : 'border-slate-600 hover:border-indigo-400 bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
            onChange={handleChange}
            className="hidden"
            data-testid="document-file-input"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Drag & drop your document here or <span className="text-indigo-400 underline">Browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PNG, JPEG, PDF up to 10MB &bull; Automated virus & malware scanning
              </p>
            </div>
          </div>
        </div>

        {/* Selected File Details & Malware Status */}
        {selectedFile && (
          <div className="mt-4 bg-slate-900/90 border border-slate-700 p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {scanStatus === 'scanning' && (
                <span className="inline-flex items-center px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-md border border-amber-500/30">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> SCANNING
                </span>
              )}
              {scanStatus === 'clean' && (
                <span className="inline-flex items-center px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-md border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> CLEAN
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
        <button
          type="button"
          onClick={handleClear}
          disabled={!selectedFile || isUploading}
          className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleUploadAndProcess}
          disabled={!selectedFile || isUploading}
          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Document & OCR...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Upload & Run OCR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentUploadCard;
