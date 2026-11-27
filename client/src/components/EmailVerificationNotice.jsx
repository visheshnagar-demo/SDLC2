import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { CheckCircle2, AlertCircle, KeyRound, ShieldAlert, ArrowRight, Loader2, MailCheck } from 'lucide-react';

export default function EmailVerificationNotice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const emailParam = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleVerify = async (tokenToVerify) => {
    const val = tokenToVerify || token;
    if (!val.trim()) {
      setError('Please provide an activation token.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authService.verifyEmail(val.trim());
      setSuccess(res.message || 'Account activated successfully! You can now log in.');
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Activation failed. The token may be expired or already used.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const autoToken = searchParams.get('token');
    if (autoToken) {
      handleVerify(autoToken);
    }
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3">
          <MailCheck className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Your Email</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {emailParam
            ? `We dispatched a cryptographic activation token to ${emailParam}. Enter your token below to activate your identity account.`
            : 'Enter your 24-hour cryptographic activation token to verify your email and activate your account.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {success ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
          <div className="flex justify-center text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900">Account Activated</h3>
            <p className="text-sm text-emerald-700 mt-1">{success}</p>
          </div>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Activation Token / UUID
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. a1b2c3d4-e5f6-7890-1234-56789abcdef0"
                className="w-full pl-10 pr-3.5 py-2.5 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Activate Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="text-center text-sm text-slate-500 pt-2">
            Remembered your credentials?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
