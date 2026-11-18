import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { Shield, Lock, KeyRound } from 'lucide-react';

export const LoginPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Security Information */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-sky-600" />
            <span>Zero-Trust Security Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Sign In to Manage Your <span className="text-sky-600">Identity Profile</span>
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            Access your secure dashboard to view your profile, manage active authentication tokens, and proceed through identity validation.
          </p>

          <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-sky-400 font-semibold text-sm">
              <Shield className="w-4 h-4" />
              <span>Multi-Factor Security & Session Management</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All sign-in transactions issue signed JWT tokens with 1-hour expiration and 7-day revolving refresh capabilities. Tokens are validated on every request.
            </p>
            <div className="pt-2 flex items-center space-x-4 text-xs font-mono text-slate-400">
              <span className="flex items-center">
                <KeyRound className="w-3 h-3 mr-1 text-sky-400" /> JWT HMAC-256
              </span>
              <span>• Spring Boot 3 Security</span>
            </div>
          </div>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-6 flex justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
