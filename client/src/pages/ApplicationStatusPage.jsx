import React from 'react';
import { Link } from 'react-router-dom';
import { StepperHeader } from '../components/onboarding/StepperHeader';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Lock,
  Download,
  ArrowRight,
  RefreshCw,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const ApplicationStatusPage = () => {
  const { onboardingState, user, resetOnboarding } = useAuth();
  const status = onboardingState.applicationStatus || 'AUTO_VERIFIED';

  const isVerified = status === 'AUTO_VERIFIED' || status === 'APPROVED';
  const isFlagged = status === 'FLAGGED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <StepperHeader currentStep={4} />

      {/* Main Status Hero Card */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center max-w-lg mx-auto">
          {/* Status Icon */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border shadow-xl ${
              isVerified
                ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                : 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B] shadow-[0_0_25px_rgba(245,158,11,0.35)]'
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="w-9 h-9 text-[#10B981]" />
            ) : (
              <AlertTriangle className="w-9 h-9 text-[#F59E0B]" />
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
            {isVerified
              ? 'Digital Identity Verified & Cleared'
              : 'Application Queued for Compliance Review'}
          </h1>

          <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
            {isVerified
              ? 'Your identity documents have passed automated neural OCR and 3D biometric liveness verification with cryptographic integrity.'
              : 'Your application has been flagged for manual verification due to biometric vector variance. A certified compliance officer is reviewing your credentials.'}
          </p>

          {/* Cryptographic Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              STATUS: {status}
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#1E293B] text-[#38BDF8] border border-[#334155] flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#0284C7]" />
              MERKLE ROOT: 0x9f82...3e1a
            </span>
          </div>
        </div>

        {/* Verification Certificate Details */}
        <div className="mt-8 pt-6 border-t border-[#334155] grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-[#0B1326] border border-[#334155]">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Applicant Legal Name</span>
            <span className="text-xs font-semibold text-[#F8FAFC] font-mono">
              {onboardingState.ocrData?.full_name || user?.full_name || 'ALEX MORGAN'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1326] border border-[#334155]">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Document Number</span>
            <span className="text-xs font-semibold text-[#38BDF8] font-mono">
              {onboardingState.ocrData?.document_number || 'A91827430'} ({onboardingState.docType || 'PASSPORT'})
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1326] border border-[#334155]">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">Biometric Match</span>
            <span className="text-xs font-semibold text-[#10B981] font-mono">
              {onboardingState.faceMatchScore || 94.2}% (Cosine 0.942)
            </span>
          </div>
        </div>

        {/* Actions bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#334155]">
          <button
            onClick={() => {
              resetOnboarding();
            }}
            className="text-xs font-medium px-4 py-2.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Start New Verification</span>
          </button>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/audit-logs"
              className="text-xs font-medium px-4 py-2.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#334155] flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View Audit Trail</span>
            </Link>

            {isFlagged && (
              <Link
                to="/compliance/queue"
                className="text-xs font-semibold px-5 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
              >
                <span>Open Compliance Review Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
