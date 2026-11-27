import React from 'react';
import EmailVerificationNotice from '../components/EmailVerificationNotice';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <EmailVerificationNotice />
      </div>
    </div>
  );
}
