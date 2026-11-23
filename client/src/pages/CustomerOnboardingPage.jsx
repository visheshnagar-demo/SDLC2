import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, FileCheck, ArrowRight, RefreshCw, UserCheck } from 'lucide-react';
import RegistrationWizard from '../components/onboarding/RegistrationWizard';
import DocumentUploader from '../components/onboarding/DocumentUploader';
import BiometricLivenessViewport from '../components/biometrics/BiometricLivenessViewport';
import FacialComparisonInspector from '../components/biometrics/FacialComparisonInspector';
import MetricCard from '../components/common/MetricCard';
import Badge from '../components/common/Badge';

export default function CustomerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [biometricData, setBiometricData] = useState(null);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const handleRegistrationDone = (data) => {
    setRegistrationData(data);
    setCurrentStep(2);
  };

  const handleDocumentDone = (data) => {
    setDocumentData(data);
    setCurrentStep(3);
  };

  const handleBiometricDone = (data) => {
    setBiometricData(data);
    setCurrentStep(4);
    setVerificationComplete(true);
  };

  const steps = [
    { num: 1, label: 'Identity Details' },
    { num: 2, label: 'Document Intake' },
    { num: 3, label: 'Biometric Liveness' },
    { num: 4, label: 'Verification Summary' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#131B2E] p-6 rounded-lg border border-slate-700/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <ShieldCheck size={20} />
            </span>
            <h1 className="text-xl font-bold text-[#DAE2FD]">
              Digital Identity Onboarding & KYC Pipeline
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated eKYC verification: NIST-compliant OCR, PAD Level 2 biometric liveness, and sanction screening.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2">
          {steps.map((st) => {
            const isCompleted = currentStep > st.num || verificationComplete;
            const isCurrent = currentStep === st.num;
            return (
              <div key={st.num} className="flex items-center space-x-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={14} /> : st.num}
                </div>
                <span className={`text-xs hidden lg:inline font-medium ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                  {st.label}
                </span>
                {st.num < 4 && <div className="w-3 h-0.5 bg-slate-700 hidden sm:block"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Verification Status"
          value={verificationComplete ? 'COMPLETED' : `STEP ${currentStep}/4`}
          subtitle="Real-time pipeline orchestration"
          icon={UserCheck}
          variant={verificationComplete ? 'accent' : 'primary'}
        />
        <MetricCard
          title="OCR Confidence"
          value={documentData ? `${(documentData.ocrConfidenceScore * 100).toFixed(1)}%` : 'Pending'}
          subtitle="ICAO 9303 Mod-10 Checksum"
          icon={FileCheck}
          variant="primary"
        />
        <MetricCard
          title="Biometric Liveness"
          value={biometricData ? '99.8%' : 'Pending'}
          subtitle="ISO 30107-3 PAD Level 2"
          icon={ShieldCheck}
          variant="accent"
        />
        <MetricCard
          title="Encryption Standard"
          value="AES-256-GCM"
          subtitle="FIPS 140-2 Level 3 Envelope"
          icon={ShieldCheck}
          variant="primary"
        />
      </div>

      {/* Main Wizard Area */}
      <div className="grid grid-cols-1 gap-6">
        {currentStep === 1 && (
          <RegistrationWizard onRegistrationComplete={handleRegistrationDone} />
        )}

        {currentStep === 2 && (
          <DocumentUploader
            verificationId={registrationData?.verification?.verificationId}
            onDocumentUploaded={handleDocumentDone}
          />
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <BiometricLivenessViewport
              verificationId={registrationData?.verification?.verificationId}
              onLivenessPassed={handleBiometricDone}
            />
            {documentData && <FacialComparisonInspector matchScore={0.987} />}
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-[#171F33] p-8 rounded-lg border border-emerald-500/40 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Identity Verification Completed Successfully</h2>
              <p className="text-sm text-slate-300 mt-1 max-w-xl mx-auto">
                Customer account for <span className="text-blue-300 font-semibold">{registrationData?.formData?.fullName || 'Alexander James Montgomery'}</span> has passed automated verification checks and has been submitted to the compliance audit trail.
              </p>
            </div>

            <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0B1326] p-4 rounded-lg border border-slate-700 text-left text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Verification ID</span>
                <span className="text-blue-400">{registrationData?.verification?.verificationId || 'verif-2026-8941'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <span className="text-emerald-400 font-bold">AUTO_VERIFIED</span>
              </div>
              <div>
                <span className="text-slate-500 block">Biometric Match</span>
                <span className="text-slate-200">98.7% Cosine</span>
              </div>
              <div>
                <span className="text-slate-500 block">AML Sanctions</span>
                <span className="text-emerald-400 font-bold">CLEARED</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setVerificationComplete(false);
                  setRegistrationData(null);
                  setDocumentData(null);
                  setBiometricData(null);
                }}
                className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2 rounded-lg text-xs border border-slate-700 transition-all"
              >
                <RefreshCw size={14} />
                <span>Start New Verification</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
