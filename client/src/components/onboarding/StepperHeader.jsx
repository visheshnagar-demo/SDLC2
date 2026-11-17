import React from 'react';
import { Check, ShieldCheck, FileCheck, Camera, Sparkles } from 'lucide-react';

export const StepperHeader = ({ currentStep = 1 }) => {
  const steps = [
    { number: 1, title: 'Registration', desc: 'Profile & Credentials', icon: ShieldCheck },
    { number: 2, title: 'Document OCR', desc: 'Passport / ID Scan', icon: FileCheck },
    { number: 3, title: 'Biometrics', desc: '3D Facial Liveness', icon: Camera },
    { number: 4, title: 'Verification', desc: 'Trust Score & Status', icon: Sparkles },
  ];

  return (
    <div className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-4 md:p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between relative">
        {/* Connecting progress bar */}
        <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-[#334155] -translate-y-1/2 z-0 hidden sm:block">
          <div
            className="h-full bg-gradient-to-r from-[#0284C7] to-[#10B981] transition-all duration-500"
            style={{ width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100)}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#10B981] text-[#0F172A] shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : isCurrent
                    ? 'bg-[#0F172A] border-2 border-[#0284C7] text-[#38BDF8] shadow-[0_0_15px_rgba(2,132,199,0.5)] ring-4 ring-[#0284C7]/20'
                    : 'bg-[#1E293B] border border-[#334155] text-[#64748B]'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="text-center mt-2">
                <div
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-[#38BDF8]' : isCompleted ? 'text-[#F8FAFC]' : 'text-[#64748B]'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-[10px] text-[#94A3B8] hidden md:block">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
