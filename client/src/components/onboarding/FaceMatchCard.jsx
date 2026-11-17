import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, UserCheck, Eye, Layers } from 'lucide-react';

export const FaceMatchCard = ({
  passportPhotoUrl,
  selfieUrl,
  matchScore = 94.2,
  livenessPassed = true,
  onComplete,
}) => {
  const isHighMatch = matchScore >= 85;

  return (
    <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#334155]">
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">4. 1:1 Facial Vector Matching</h3>
            <p className="text-xs text-[#94A3B8]">Deep Neural Network Comparison (ResNet-100 / ArcFace)</p>
          </div>
          <span
            className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-medium border ${
              isHighMatch
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
            }`}
          >
            {matchScore}% FACIAL SIMILARITY
          </span>
        </div>

        {/* Side-by-side photo comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Document Headshot */}
          <div className="bg-[#0B1326] border border-[#334155] rounded-lg p-3 text-center">
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-2">
              Extracted ID Headshot
            </span>
            <div className="w-24 h-28 mx-auto rounded border border-[#0284C7]/50 overflow-hidden bg-[#171F33] relative">
              <img
                src={
                  passportPhotoUrl ||
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'
                }
                alt="Document Crop"
                className="w-full h-full object-cover"
              />
              <span className="text-[8px] font-mono bg-[#0F172A]/90 text-[#38BDF8] px-1 absolute bottom-0 inset-x-0 border-t border-[#334155]">
                ZONE-A PHOTO
              </span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-[#10B981] flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>ICAO Standard OK</span>
            </div>
          </div>

          {/* Captured Selfie */}
          <div className="bg-[#0B1326] border border-[#334155] rounded-lg p-3 text-center">
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-2">
              Live Biometric Capture
            </span>
            <div className="w-24 h-28 mx-auto rounded border border-[#10B981]/50 overflow-hidden bg-[#171F33] relative">
              <img
                src={
                  selfieUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt="Selfie Frame"
                className="w-full h-full object-cover"
              />
              <span className="text-[8px] font-mono bg-[#0F172A]/90 text-[#10B981] px-1 absolute bottom-0 inset-x-0 border-t border-[#334155]">
                3D LIVENESS PASS
              </span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-[#10B981] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Anti-Spoof Cleared</span>
            </div>
          </div>
        </div>

        {/* Vector Similarity Metric Strip */}
        <div className="bg-[#0B1326] border border-[#334155] rounded-lg p-3 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8] font-mono">Cosine Similarity Index:</span>
            <span className="text-[#38BDF8] font-mono font-semibold">{matchScore}% (Confidence 0.942)</span>
          </div>
          <div className="w-full bg-[#171F33] h-2 rounded-full overflow-hidden border border-[#334155]">
            <div
              className="h-full bg-gradient-to-r from-[#0284C7] to-[#10B981] transition-all duration-700"
              style={{ width: `${matchScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
            <span>Threshold (80%)</span>
            <span>Optimal (95%+)</span>
          </div>
        </div>

        {/* Verification Summary Card */}
        <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-[#10B981]">Identity Criteria Satisfied</div>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              OCR data matches government issuing standard and biometric vector variance is within acceptable confidence tolerance (&lt;0.05).
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onComplete}
        className="w-full mt-4 py-3 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#0F172A] font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.01]"
      >
        <span>Submit Verification Application</span>
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
