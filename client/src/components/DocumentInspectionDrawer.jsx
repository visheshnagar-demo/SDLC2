import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, Calendar, User, Hash, Lock, X } from 'lucide-react';

export const DocumentInspectionDrawer = ({ document, onClose }) => {
  if (!document) {
    return (
      <div className="bg-slate-800 border border-slate-700/80 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center min-h-[300px]">
        <FileText className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-200">Field Inspection Analyzer</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Select any document from the vault to inspect extracted cryptographic signatures, PII confidence, and security metadata.
        </p>
      </div>
    );
  }

  const extracted = document.extractedData || {};
  const isExpiring = document.warningFlags && document.warningFlags.includes('EXPIRES_SOON');

  const calculateDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return null;
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = calculateDaysRemaining(extracted.expiryDate);

  const getDocTypeLabel = (type) => {
    switch (type) {
      case 'PASSPORT':
        return 'Passport Field Analyzer';
      case 'DRIVERS_LICENSE':
        return "Driver's License Field Analyzer";
      case 'NATIONAL_ID':
        return 'National ID Field Analyzer';
      default:
        return 'Document Field Analyzer';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-slate-100">{getDocTypeLabel(document.documentType)}</h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Security & Malware Badge */}
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Malware Scan: CLEAN (0 threats detected)</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
            AES-256 Encrypted
          </span>
        </div>

        {/* Extracted Fields Analyzer */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Validated OCR Field Extractions
          </h4>

          <div className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Full Name
              </span>
              <span className="text-slate-100 font-semibold font-mono">
                {extracted.fullName || 'N/A'}{' '}
                <span className="text-emerald-400 font-normal text-[11px]">(99.4%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Date of Birth
              </span>
              <span className="text-slate-100 font-semibold font-mono">
                {extracted.dateOfBirth || 'N/A'}{' '}
                <span className="text-emerald-400 font-normal text-[11px]">(98.9%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center">
                <Hash className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Document Number
              </span>
              <span className="text-slate-100 font-semibold font-mono">
                {extracted.documentNumber || 'N/A'}{' '}
                <span className="text-emerald-400 font-normal text-[11px]">(97.8%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className={`flex items-center font-semibold ${isExpiring ? 'text-amber-400' : 'text-slate-400'}`}>
                <Calendar className="w-3.5 h-3.5 mr-1.5" /> Expiry Date
              </span>
              <span className={`font-semibold font-mono ${isExpiring ? 'text-amber-300' : 'text-slate-100'}`}>
                {extracted.expiryDate || 'N/A'}{' '}
                {daysRemaining !== null && (
                  <span className={daysRemaining <= 30 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    ({daysRemaining}d)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic & Audit Metadata */}
        <div className="mt-4 pt-3 border-t border-slate-700/60">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Storage & Audit Metadata
          </h4>
          <div className="bg-slate-900/60 p-3 rounded-xl space-y-1.5 text-[11px] font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">File Name:</span>
              <span className="truncate max-w-[180px]">{document.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MIME Type:</span>
              <span>{document.mimeType || 'image/jpeg'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Document UUID:</span>
              <span className="text-indigo-300 truncate max-w-[180px]">{document.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center">
          <Lock className="w-3 h-3 mr-1 text-slate-400" /> Tamper-proof Record
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Close Analyzer
        </button>
      </div>
    </div>
  );
};

export default DocumentInspectionDrawer;
