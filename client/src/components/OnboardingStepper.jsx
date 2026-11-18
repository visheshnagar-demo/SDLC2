import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Shield, FileText, UserCheck, ArrowRight } from 'lucide-react';

export const OnboardingStepper = ({ initialStep = 2 }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const steps = [
    {
      id: 1,
      title: 'Account Registration',
      description: 'Account profile created & credentials securely hashed with bcrypt.',
      icon: FileText,
      status: 'completed',
    },
    {
      id: 2,
      title: 'Email & Security Setup',
      description: 'Primary email verified and JWT security credentials active.',
      icon: Shield,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming',
    },
    {
      id: 3,
      title: 'Identity Verification (KYC)',
      description: 'Submit government ID and biometrics for document verification.',
      icon: UserCheck,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming',
    },
    {
      id: 4,
      title: 'Full Platform Access',
      description: 'Access enabled for all financial and banking microservices.',
      icon: CheckCircle2,
      status: currentStep === 4 ? 'completed' : 'upcoming',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Digital Onboarding Pipeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">Track your identity verification and access clearance</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          Step {currentStep} of {steps.length}
        </span>
      </div>

      <div className="relative">
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed' || currentStep > step.id;
            const isCurrent = step.id === currentStep;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-start space-x-4 p-3 rounded-xl transition-all cursor-pointer ${
                  isCurrent ? 'bg-sky-50/70 border border-sky-200' : 'hover:bg-slate-50'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="relative flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-600/30">
                      <StepIcon className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold border border-slate-200">
                      <Circle className="w-4 h-4" />
                    </div>
                  )}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute top-8 left-4 -ml-px w-0.5 h-6 ${
                        isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-semibold ${
                        isCurrent ? 'text-sky-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </h4>
                    {isCompleted && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[11px] font-semibold text-sky-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1 animate-pulse" /> In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">Next milestone: Identity Verification</span>
        <button
          onClick={() => setCurrentStep((prev) => (prev < 4 ? prev + 1 : 1))}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>{currentStep === 4 ? 'Restart Demo' : 'Simulate Progress'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingStepper;
