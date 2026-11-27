import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 3, label: 'Strong', color: 'bg-blue-500' };
    return { score: 4, label: 'Very Strong', color: 'bg-emerald-500' };
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the Identity Verification Terms & Security Policy.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number || undefined,
      };

      const result = await register(payload);
      setSuccessData(result);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Registration failed. Please check your data and try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 text-emerald-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
          <h3 className="text-xl font-bold">Registration Successful</h3>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          {successData.message || 'Your account has been created successfully. A verification link has been dispatched to your email.'}
        </p>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 mb-6 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Email</div>
          <div className="text-sm font-mono font-medium text-slate-800">{successData.email || formData.email}</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-2">Account Status</div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {successData.status || 'PENDING_VERIFICATION'}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/verify-email?email=${encodeURIComponent(formData.email)}`}
            className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-center"
          >
            <span>Enter Activation Token</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2.5 px-4 rounded-xl transition-colors text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
        <p className="text-sm text-slate-500 mt-1">
          Begin your digital identity verification and compliance onboarding.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            First Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Jane"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Last Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="jane.doe@enterprise.com"
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          Phone Number (Optional)
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="+1 555-0199"
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {formData.password && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="text-slate-600 font-medium">Password Strength:</span>
            <span className="font-semibold text-slate-800">{strength.label}</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-1">
            <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
            <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
            <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
            <div className={`h-full flex-1 rounded-full ${strength.score >= 4 ? strength.color : 'bg-slate-200'}`} />
          </div>
        </div>
      )}

      <div className="flex items-start space-x-3 pt-1">
        <input
          id="termsAccepted"
          name="termsAccepted"
          type="checkbox"
          checked={formData.termsAccepted}
          onChange={handleChange}
          className="h-4 w-4 mt-0.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="termsAccepted" className="text-xs text-slate-600 leading-normal">
          I agree to the <span className="text-indigo-600 font-medium">Identity Verification Terms of Service</span> and consent to cryptographic storage of verification data.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="text-center text-sm text-slate-500 pt-2">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
          Sign In
        </Link>
      </div>
    </form>
  );
}
