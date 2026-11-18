import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const registeredEmail = location.state?.registeredEmail || '';
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState(registeredEmail || 'test@example.com');
  const [password, setPassword] = useState('testpassword');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fillTestCredentials = (userType = 'user') => {
    if (userType === 'admin') {
      setEmail('admin@example.com');
      setPassword('adminpassword');
    } else {
      setEmail('test@example.com');
      setPassword('testpassword');
    }
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
        <p className="text-sm text-slate-500 mt-1.5">
          Enter your credentials to manage your digital identity.
        </p>
      </div>

      {/* Test Account Quick Fill Banner */}
      <div className="mb-6 p-3.5 bg-sky-50/80 border border-sky-200/80 rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-sky-900">
            <Key className="w-3.5 h-3.5 text-sky-600" />
            <span>Test Accounts</span>
          </div>
          <span className="text-[11px] text-sky-700 font-medium">Click to populate</span>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => fillTestCredentials('user')}
            className="flex-1 py-1 px-2 text-xs font-medium bg-white hover:bg-sky-100 border border-sky-300 rounded-lg text-sky-800 transition-colors shadow-2xs"
          >
            User: test@example.com
          </button>
          <button
            type="button"
            onClick={() => fillTestCredentials('admin')}
            className="flex-1 py-1 px-2 text-xs font-medium bg-white hover:bg-sky-100 border border-sky-300 rounded-lg text-sky-800 transition-colors shadow-2xs"
          >
            Admin: admin@example.com
          </button>
        </div>
        <p className="text-[11px] text-sky-600 mt-1.5 text-center">
          Test account: <span className="font-mono font-medium">test@example.com / testpassword</span>
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm animate-fadeIn"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="loginEmail" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="loginEmail"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="loginPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <a href="#forgot" className="text-xs text-sky-600 hover:text-sky-500 font-medium">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="loginPassword"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-md shadow-sky-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Do not have an account?{' '}
          <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-500">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Protected by Spring Security JWT & MFA policy</span>
      </div>
    </div>
  );
};

export default LoginForm;
