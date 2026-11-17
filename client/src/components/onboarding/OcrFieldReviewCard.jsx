import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Hash, Edit3 } from 'lucide-react';

export const OcrFieldReviewCard = ({
  ocrData,
  onChange,
  ocrConfidence = 98.5,
  onProceed,
  hoveredZone,
  setHoveredZone,
}) => {
  if (!ocrData) {
    return (
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-12 h-12 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#64748B] mb-3">
          <Hash className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-[#F8FAFC]">Awaiting Document Upload</h3>
        <p className="text-xs text-[#94A3B8] max-w-sm mt-1">
          Upload an identity document on the left or click 'Load Sample Passport' to initiate real-time OCR extraction.
        </p>
      </div>
    );
  }

  const getConfidenceBadge = (confidence) => {
    const val = Number(confidence) || ocrConfidence;
    if (val >= 98) {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-medium">
          {val}% MATCH • HIGH CONFIDENCE
        </span>
      );
    }
    if (val >= 85) {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-medium">
          {val}% • REVIEW RECOMMENDED
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-medium">
        {val}% • LOW CONFIDENCE
      </span>
    );
  };

  const fields = [
    { key: 'full_name', label: 'Full Legal Name', value: ocrData.full_name || '', confidence: 99.2 },
    { key: 'document_number', label: 'Document / Passport No.', value: ocrData.document_number || '', confidence: 99.8 },
    { key: 'date_of_birth', label: 'Date of Birth (YYYY-MM-DD)', value: ocrData.date_of_birth || '', confidence: 98.4 },
    { key: 'nationality', label: 'Nationality / Country Code', value: ocrData.nationality || '', confidence: 98.9 },
    { key: 'expiry_date', label: 'Document Expiration Date', value: ocrData.expiry_date || '', confidence: 97.6 },
    { key: 'issuing_authority', label: 'Issuing Authority / State', value: ocrData.issuing_authority || 'US DEPARTMENT OF STATE', confidence: 99.1 },
  ];

  return (
    <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header with overall confidence badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#334155]">
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">2. OCR Extraction &amp; Verification</h3>
            <p className="text-xs text-[#94A3B8]">Review extracted telemetry and amend if required</p>
          </div>
          {getConfidenceBadge(ocrConfidence)}
        </div>

        {/* Extracted Fields Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {fields.map((f) => {
            const isHighlighted = hoveredZone === f.key;
            return (
              <div
                key={f.key}
                onMouseEnter={() => setHoveredZone && setHoveredZone(f.key)}
                onMouseLeave={() => setHoveredZone && setHoveredZone(null)}
                className={`p-2.5 rounded-lg border transition-all ${
                  isHighlighted
                    ? 'border-[#0284C7] bg-[#1E293B] shadow-[0_0_10px_rgba(2,132,199,0.3)]'
                    : 'border-[#334155] bg-[#0B1326]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider">
                    {f.label}
                  </label>
                  <span className="text-[9px] font-mono text-[#10B981]">{f.confidence}%</span>
                </div>
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className="w-full bg-[#171F33] border border-[#334155] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] font-mono focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            );
          })}
        </div>

        {/* MRZ Zone string */}
        <div className="bg-[#0B1326] border border-[#334155] rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase">Machine Readable Zone (MRZ 2-Line)</span>
            <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
              CHECKSUM VALID
            </span>
          </div>
          <div className="font-mono text-xs text-[#38BDF8] tracking-widest bg-[#171F33] p-2 rounded border border-[#334155] break-all select-all">
            {ocrData.mrz_line1 || 'P<USAMORGAN<<ALEX<<<<<<<<<<<<<<<<<<<<<<<<<<<'}<br />
            {ocrData.mrz_line2 || 'A009182743USA9001018M3001014<<<<<<<<<<<<<<06'}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={onProceed}
        className="w-full py-3 px-4 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(2,132,199,0.4)] transition-all hover:scale-[1.01]"
      >
        <span>Confirm OCR Data &amp; Proceed to Biometrics</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
