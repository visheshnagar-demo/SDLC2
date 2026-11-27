import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { ShieldCheck, Check, Lock, Award, FileText } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Branding Column */}
        <div className="lg:col-span-5 space-y-6 text-slate-800">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-200/60 rounded-full text-xs font-semibold text-indigo-700">
            <ShieldCheck className="h-4 w-4" />
            <span>Bank-Grade Identity Cloud</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
            AegisID Sovereign Trust Platform
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            Begin your onboarding journey with biometric-ready customer profiles, cryptographic data protection, and automated compliance verification.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 text-sm text-slate-700">
              <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <span><strong>AES-256 PII Encryption:</strong> All sensitive credentials encrypted in-flight and at rest.</span>
            </div>
            <div className="flex items-start space-x-3 text-sm text-slate-700">
              <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <span><strong>Fast Verification:</strong> Automated 24-hour cryptographic token email dispatch.</span>
            </div>
            <div className="flex items-start space-x-3 text-sm text-slate-700">
              <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <span><strong>Full Regulatory Compliance:</strong> GDPR & AML/KYC compliant audit trails.</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
