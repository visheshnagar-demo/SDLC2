import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Eye, Lock, FileUp } from 'lucide-react';

export const DocumentDropzone = ({
  docType,
  setDocType,
  onFileSelect,
  isProcessing,
  previewUrl,
  selectedFieldKey,
  onZoneHover,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const samplePassportUrl = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleLoadSample = (type = 'PASSPORT') => {
    setDocType(type);
    // Create a mock File object
    const blob = new Blob(['sample-passport-ocr-bytes'], { type: 'image/jpeg' });
    const sampleFile = new File([blob], `sample_${type.toLowerCase()}_sample.jpg`, { type: 'image/jpeg' });
    sampleFile.isSample = true;
    onFileSelect(sampleFile, type);
  };

  // 7 Bounding boxes for Passport preview
  const boundingBoxes = [
    { key: 'full_name', label: 'FULL NAME', top: '28%', left: '38%', width: '48%', height: '10%' },
    { key: 'document_number', label: 'DOC NO.', top: '15%', left: '72%', width: '22%', height: '9%' },
    { key: 'date_of_birth', label: 'DOB', top: '42%', left: '38%', width: '25%', height: '9%' },
    { key: 'nationality', label: 'NATIONALITY', top: '42%', left: '65%', width: '25%', height: '9%' },
    { key: 'expiry_date', label: 'EXPIRY', top: '55%', left: '38%', width: '25%', height: '9%' },
    { key: 'photo', label: 'FACE BIOMETRICS', top: '22%', left: '8%', width: '26%', height: '52%' },
    { key: 'mrz', label: 'MRZ CHECKSUM ZONE', top: '78%', left: '8%', width: '84%', height: '18%' },
  ];

  return (
    <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-lg flex flex-col justify-between">
      {/* Header and Document Type Selector */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">1. Ingest ID Document</h3>
            <p className="text-xs text-[#94A3B8]">Select standard and upload high-resolution scan</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1E293B] border border-[#334155] text-[11px] font-mono text-[#38BDF8]">
            <Lock className="w-3.5 h-3.5 text-[#0284C7]" />
            AES-256 ENCRYPTED
          </div>
        </div>

        {/* Doc type pills */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { id: 'PASSPORT', label: 'Passport (ICAO 9303)' },
            { id: 'DRIVERS_LICENSE', label: "Driver's License" },
            { id: 'NATIONAL_ID', label: 'National ID Card' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDocType(item.id)}
              className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                docType === item.id
                  ? 'bg-[#1E293B] border-[#0284C7] text-[#38BDF8] shadow-[0_0_10px_rgba(2,132,199,0.2)]'
                  : 'bg-[#0B1326] border-[#334155] text-[#94A3B8] hover:border-[#64748B]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dropzone Container */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
            isDragOver
              ? 'border-[#0284C7] bg-[#0284C7]/10'
              : 'border-[#334155] bg-[#0B1326]/60 hover:border-[#0284C7]/60 hover:bg-[#1E293B]/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleInputChange}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#0284C7] animate-spin" />
              <div className="text-center">
                <div className="text-xs font-semibold text-[#F8FAFC]">Running Neural OCR &amp; MRZ Parser...</div>
                <div className="text-[11px] font-mono text-[#94A3B8] mt-1">Extracting 7-zone biometric &amp; text vectors</div>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="relative w-full h-full flex flex-col items-center">
              <div className="relative rounded-lg overflow-hidden border border-[#334155] max-h-56 w-full bg-[#171F33] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Document Scan Preview"
                  className="w-full h-full object-contain opacity-85"
                />
                {/* 7-zone bounding overlays */}
                {boundingBoxes.map((box) => {
                  const isHovered = selectedFieldKey === box.key;
                  return (
                    <div
                      key={box.key}
                      onMouseEnter={() => onZoneHover && onZoneHover(box.key)}
                      onMouseLeave={() => onZoneHover && onZoneHover(null)}
                      style={{
                        position: 'absolute',
                        top: box.top,
                        left: box.left,
                        width: box.width,
                        height: box.height,
                      }}
                      className={`border transition-all duration-200 cursor-pointer ${
                        isHovered
                          ? 'border-[#0284C7] bg-[#0284C7]/30 shadow-[0_0_12px_#0284C7]'
                          : 'border-[#38BDF8]/40 bg-[#38BDF8]/10 hover:border-[#0284C7] hover:bg-[#0284C7]/20'
                      }`}
                    >
                      <span className="text-[8px] font-mono px-1 bg-[#0F172A]/90 text-[#38BDF8] absolute -top-3.5 left-0 border border-[#0284C7]/40 rounded">
                        {box.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-[#10B981] font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Document Ingested &amp; 7 Data Zones Segmented</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#0284C7] mb-3 shadow-[0_0_15px_rgba(2,132,199,0.2)]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-[#F8FAFC]">
                Drag &amp; drop document image, or <span className="text-[#0284C7] underline">browse files</span>
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1 font-mono">
                Supports JPG, PNG, PDF up to 15MB • Automatic EXIF Strip &amp; SHA-256 Checksum
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preset sample injection triggers for rapid validation */}
      <div className="mt-4 pt-4 border-t border-[#334155] flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-[#94A3B8]">Demo Sandbox:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleLoadSample('PASSPORT')}
            className="text-[11px] font-medium px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#334155] flex items-center gap-1.5 transition-colors"
          >
            <FileUp className="w-3 h-3 text-[#0284C7]" />
            Load Sample Passport
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('NATIONAL_ID')}
            className="text-[11px] font-medium px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#334155] flex items-center gap-1.5 transition-colors"
          >
            <FileUp className="w-3 h-3 text-[#0284C7]" />
            Load Sample ID
          </button>
        </div>
      </div>
    </div>
  );
};
