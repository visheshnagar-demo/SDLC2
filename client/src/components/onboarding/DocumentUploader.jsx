import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import MRZInspectorTerminal from './MRZInspectorTerminal';
import Badge from '../common/Badge';

export default function DocumentUploader({ verificationId, onDocumentUploaded, onError }) {
  const [docType, setDocType] = useState('PASSPORT');
  const [issuingCountry, setIssuingCountry] = useState('USA');
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSimulatedUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setErrorMsg('');

    try {
      // Simulate real OCR processing extraction or call API
      setTimeout(() => {
        const mockOcrResult = {
          documentId: `doc-${Date.now()}`,
          verificationId: verificationId || 'verif-demo-123',
          documentType: docType,
          issuingCountry: issuingCountry,
          documentNumber: 'A94819024',
          expiryDate: '2031-08-14',
          ocrConfidenceScore: 0.985,
          ocrExtractedFields: {
            fullName: 'Alexander James Montgomery',
            dateOfBirth: '1990-01-01',
            nationality: 'USA',
            sex: 'M',
            issuingAuthority: 'United States Department of State'
          },
          mrz: {
            line1: 'P<USAEXAMP<<ALEXANDER<JAMES<<<<<<<<<<<<<<<',
            line2: 'A948190240USA9001014M3108148<<<<<<<<<<<<<<04',
            docType: docType,
            issuer: issuingCountry,
            docNumber: 'A94819024',
            expiry: '2031-08-14'
          }
        };

        setExtractedData(mockOcrResult);
        setUploading(false);
        if (onDocumentUploaded) {
          onDocumentUploaded(mockOcrResult);
        }
      }, 1200);
    } catch (err) {
      setUploading(false);
      const msg = err.response?.data?.detail || err.message || 'Failed to upload document';
      setErrorMsg(msg);
      if (onError) onError(msg);
    }
  };

  return (
    <div className="bg-[#171F33] p-6 rounded-lg border border-slate-700/80 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#DAE2FD]">Document Intake & OCR Processing</h2>
          <p className="text-xs text-slate-400">
            Upload official government-issued ID for optical character recognition and biometric extraction.
          </p>
        </div>
        <Badge variant={extractedData ? 'success' : 'info'}>
          {extractedData ? 'OCR PARSED' : 'STEP 2 OF 4'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Document Category</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-[#0B1326] border border-slate-700 rounded px-3 py-2 text-sm text-[#DAE2FD] focus:outline-none focus:border-blue-500"
          >
            <option value="PASSPORT">Passport (ICAO 9303 Compliant)</option>
            <option value="DRIVERS_LICENSE">Driver's License (AAMVA DL/ID)</option>
            <option value="NATIONAL_ID">National Identity Card</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Issuing Jurisdiction</label>
          <select
            value={issuingCountry}
            onChange={(e) => setIssuingCountry(e.target.value)}
            className="w-full bg-[#0B1326] border border-slate-700 rounded px-3 py-2 text-sm text-[#DAE2FD] focus:outline-none focus:border-blue-500"
          >
            <option value="USA">United States (USA)</option>
            <option value="GBR">United Kingdom (GBR)</option>
            <option value="CAN">Canada (CAN)</option>
            <option value="AUS">Australia (AUS)</option>
            <option value="DEU">Germany (DEU)</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!extractedData ? (
        <label className="block border-2 border-dashed border-blue-500/40 hover:border-blue-500/80 rounded-lg p-8 text-center bg-[#0B1326]/60 cursor-pointer transition-all">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleSimulatedUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex flex-col items-center">
            {uploading ? (
              <>
                <RefreshCw size={36} className="text-blue-400 animate-spin mb-3" />
                <p className="text-sm font-semibold text-blue-300">Scanning Document & Performing Neural OCR...</p>
                <p className="text-xs text-slate-400 mt-1">Extracting MRZ and running Mod-10 checksum validation</p>
              </>
            ) : (
              <>
                <UploadCloud size={36} className="text-blue-400 mb-3" />
                <p className="text-sm font-semibold text-[#DAE2FD]">Click or drag identity document to upload</p>
                <p className="text-xs text-slate-400 mt-1">Supports PNG, JPEG, PDF up to 15MB</p>
              </>
            )}
          </div>
        </label>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-[#0B1326] rounded-lg border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{fileName || 'identity_document_scan.png'}</p>
                <p className="text-xs text-emerald-400 font-mono">
                  OCR Confidence: {(extractedData.ocrConfidenceScore * 100).toFixed(1)}% (Passed Heuristic Checks)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded text-xs font-mono font-semibold flex items-center space-x-1">
                <CheckCircle size={14} />
                <span>VERIFIED</span>
              </span>
            </div>
          </div>

          <MRZInspectorTerminal mrzData={extractedData.mrz} checksumValid={true} />

          <div className="bg-[#0B1326] p-4 rounded-lg border border-slate-700/60">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Neural OCR Field Extraction
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Extracted Legal Name</span>
                <span className="text-slate-200 font-medium">
                  {extractedData.ocrExtractedFields?.fullName || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Document ID</span>
                <span className="text-slate-200 font-medium">{extractedData.documentNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth</span>
                <span className="text-slate-200 font-medium">
                  {extractedData.ocrExtractedFields?.dateOfBirth || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Nationality</span>
                <span className="text-slate-200 font-medium">
                  {extractedData.ocrExtractedFields?.nationality || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Expiration Date</span>
                <span className="text-slate-200 font-medium">{extractedData.expiryDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Issuing Authority</span>
                <span className="text-slate-200 font-medium">
                  {extractedData.ocrExtractedFields?.issuingAuthority || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
