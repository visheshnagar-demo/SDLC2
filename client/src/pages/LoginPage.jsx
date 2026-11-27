import React from 'react';
import LoginForm from '../components/LoginForm';
import { ShieldCheck, CheckCircle2, Lock, Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Branding / Trust Column */}
        <div className="lg:col-span-5 space-y-6 text-slate-800">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-200/60 rounded-full text-xs font-semibold text-indigo-700">
            <Lock className="h-4 w-4" />
            <span>Zero-Trust Security Gateway</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
            Secure Customer Portal Sign In
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            Sign in to manage your verified digital identity credentials, review active compliance statuses, and configure profile information.
          </p>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-3 text-slate-900 font-semibold text-sm">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span>Multi-Factor Identity Protection</span>
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              Every authentication session is protected with short-lived JWT signatures and rate-limited anomaly detection.
            </p>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
