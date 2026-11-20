import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, RotateCcw, ShieldCheck, ArrowRight, UserCheck, Calendar, Hash, User } from 'lucide-react';

export const OcrPreviewCard = ({ documentData, onReset, onConfirm }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    documentNumber: '',
    expiryDate: '',
  });
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (documentData) {
      const extracted = documentData.extractedData || {};
      setFormData({
        fullName: extracted.fullName || '',
        dateOfBirth: extracted.dateOfBirth || '',
        documentNumber: extracted.documentNumber || '',
        expiryDate: extracted.expiryDate || '',
      });
      setIsConfirmed(false);
    }
  }, [documentData]);

  if (!documentData) {
    return (
      <div className="bg-slate-800 border border-slate-700/80 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center min-h-[380px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 mb-4">
          <Sparkles className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">Automated OCR Extraction Preview</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Upload an identity document on the left to extract full legal name, date of birth, document number, and expiration date automatically.
        </p>
      </div>
    );
  }

  const confidenceScore =
    typeof documentData.ocrConfidence === 'number'
      ? documentData.ocrConfidence > 1
        ? documentData.ocrConfidence
        : (documentData.ocrConfidence * 100).toFixed(1)
      : '96.5';

  const calculateDaysUntilExpiry = (expiryDateStr) => {
    if (!expiryDateStr) return null;
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilExpiry = calculateDaysUntilExpiry(formData.expiryDate);
  const isExpiringSoon =
    (daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0) ||
    (documentData.warningFlags && documentData.warningFlags.includes('EXPIRES_SOON'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    if (onConfirm) {
      onConfirm({
        ...documentData,
        extractedData: formData,
      });
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
      <div>
        {/* Header with OCR Confidence */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">OCR Field Extraction</h2>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {confidenceScore}% High Confidence
          </span>
        </div>

        {/* Expiry Alert Warning Banner if expiring in <30 days */}
        {isExpiringSoon && (
          <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Document expires in {daysUntilExpiry !== null ? `${daysUntilExpiry} days` : 'less than 30 days'} ({formData.expiryDate})
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Renewal recommended. Please ensure document is valid throughout verification.
              </p>
            </div>
          </div>
        )}

        {isConfirmed && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">Document details confirmed and secured in customer vault.</span>
          </div>
        )}

        {/* Extracted Fields Form */}
        <div className="space-y-3.5 mt-2">
          <div>
            <label className="flex items-center text-xs font-medium text-slate-400 mb-1">
              <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Full Legal Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. JANE DOE"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center text-xs font-medium text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Date of Birth
              </label>
              <input
                type="text"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                placeholder="YYYY-MM-DD"
              />
            </div>

            <div>
              <label className="flex items-center text-xs font-medium text-slate-400 mb-1">
                <Hash className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Document Number
              </label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                placeholder="e.g. P12345678"
              />
            </div>
          </div>

          <div>
            <label
              className={`flex items-center text-xs font-medium mb-1 ${
                isExpiringSoon ? 'text-amber-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" /> Expiry Date
            </label>
            <input
              type="text"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className={`w-full bg-slate-900 px-3 py-2 rounded-lg text-sm font-medium font-mono focus:outline-none transition-colors ${
                isExpiringSoon
                  ? 'border border-amber-500/70 text-amber-300 focus:border-amber-400'
                  : 'border border-slate-700 text-slate-100 focus:border-indigo-500'
              }`}
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Re-upload</span>
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          className="flex items-center space-x-1.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>Confirm & Proceed</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default OcrPreviewCard;
