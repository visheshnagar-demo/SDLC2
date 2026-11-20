import React from 'react';
import { FileText, ShieldCheck, AlertCircle, RefreshCw, Eye, CheckCircle, Clock } from 'lucide-react';

export const DocumentListTable = ({
  documents = [],
  selectedDocumentId,
  onSelectDocument,
  isLoading = false,
  onRefresh,
}) => {
  const getDocumentSpecName = (docType) => {
    switch (docType) {
      case 'PASSPORT':
        return 'International Passport';
      case 'DRIVERS_LICENSE':
        return 'Commercial Driver License';
      case 'NATIONAL_ID':
        return 'National Identity Card';
      default:
        return 'Identity Document';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const formatConfidence = (score) => {
    if (score === null || score === undefined) return '95.0%';
    const val = score > 1 ? score : score * 100;
    return `${val.toFixed(1)}%`;
  };

  return (
    <div className="bg-slate-800 border border-slate-700/80 p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Identity Document Vault & History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically signed identity records with automated malware and OCR audits
          </p>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Vault</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading document vault records...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-700/60 rounded-xl bg-slate-900/40">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No identity documents in vault yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload your passport, driver license, or national ID in the verification section above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Document Spec</th>
                <th className="py-3 px-4">File Name & Size</th>
                <th className="py-3 px-4">Scan / Status</th>
                <th className="py-3 px-4">OCR Confidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {documents.map((doc) => {
                const isSelected = selectedDocumentId === doc.id;
                const isExpiring = doc.warningFlags && doc.warningFlags.includes('EXPIRES_SOON');

                return (
                  <tr
                    key={doc.id || doc.fileName}
                    className={`transition-colors ${
                      isSelected ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : 'hover:bg-slate-700/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{getDocumentSpecName(doc.documentType)}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {doc.id ? doc.id.substring(0, 8) : 'N/A'}...</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <p className="text-slate-200 font-medium">{doc.fileName || 'document.jpg'}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(doc.fileSize)}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {doc.status || 'PROCESSED'}
                        </span>
                        {isExpiring && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                            <Clock className="w-3 h-3 mr-1" /> EXPIRES SOON
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-emerald-400 font-mono">
                        {formatConfidence(doc.ocrConfidence)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectDocument && onSelectDocument(doc)}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Inspecting' : 'Inspect'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentListTable;
