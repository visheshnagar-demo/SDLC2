import React from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { Shield, Lock, CheckCircle2, Award, Zap } from 'lucide-react';

export const RegisterPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Brand & Trust Value Proposition */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>Next-Gen Identity & Access Management</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Secure Digital Onboarding <span className="text-sky-600">Built for Modern BFSI</span>
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            Create your account today to access zero-trust authentication, robust session safeguards, and automated customer KYC verification flows.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Bcrypt-Salted Credential Protection</h4>
                <p className="text-xs text-slate-500">Industry-standard cryptographic hashing prevents unauthorized credential discovery.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">High-Performance JWT Session Refresh</h4>
                <p className="text-xs text-slate-500">Stateless JWT architecture ensures ultra-low latency authorization across microservices.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Compliant Onboarding Stepper</h4>
                <p className="text-xs text-slate-500">Guided milestone progression tracking for streamlined customer identity verification.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-6 flex justify-center">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
