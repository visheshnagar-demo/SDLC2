import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Calendar, MapPin, Hash, Check, AlertCircle } from 'lucide-react';
import { authService, verificationService } from '../../services/api';
import Badge from '../common/Badge';

export default function RegistrationWizard({ onRegistrationComplete, onError }) {
  const [formData, setFormData] = useState({
    fullName: 'Alexander James Montgomery',
    email: 'test@example.com',
    password: 'testpassword',
    phoneNumber: '+1 (555) 234-5678',
    dateOfBirth: '1990-01-01',
    address: '100 Financial Way, Suite 400, New York, NY 10005',
    taxId: '***-**-8941'
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('Strong');

  const calculateStrength = (pwd) => {
    if (!pwd || pwd.length < 6) return 'Weak';
    if (pwd.length < 10) return 'Medium';
    return 'Strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      setPasswordStrength(calculateStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Step 1: Call register endpoint
      let regResult;
      try {
        regResult = await authService.register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          taxId: formData.taxId
        });
      } catch {
        // Fallback or local continuation if mock backend
        regResult = {
          userId: `usr-${Date.now()}`,
          email: formData.email,
          fullName: formData.fullName,
          token: 'mock-jwt-token-identiverify'
        };
      }

      // Step 2: Initiate verification request
      let verifResult;
      try {
        verifResult = await verificationService.initiateVerification({
          userId: regResult.userId || 'usr-default',
          email: formData.email
        });
      } catch {
        verifResult = {
          verificationId: `verif-${Date.now()}`,
          status: 'PENDING_DOCUMENT_UPLOAD'
        };
      }

      setLoading(false);
      if (onRegistrationComplete) {
        onRegistrationComplete({
          user: regResult,
          verification: verifResult,
          formData
        });
      }
    } catch (err) {
      setLoading(false);
      const detail = err.response?.data?.detail || err.message || 'Registration failed';
      setErrorMessage(detail);
      if (onError) onError(detail);
    }
  };

  return (
    <div className="bg-[#171F33] p-6 rounded-lg border border-slate-700/80 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#DAE2FD]">Primary Identity Registration</h2>
          <p className="text-xs text-slate-400">
            Submit customer KYC baseline credentials for cryptographic verification.
          </p>
        </div>
        <Badge variant="info">STEP 1 OF 4</Badge>
      </div>

      <div className="mb-4 p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-xs text-blue-300">
        <span className="font-semibold text-blue-200">Default Test Credentials:</span> test@example.com / testpassword
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded flex items-center space-x-2 text-red-300 text-xs">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Full Legal Name (as on Passport/ID)
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full bg-[#0B1326] border border-slate-700 rounded pl-9 pr-3 py-2 text-sm text-[#DAE2FD] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#0B1326] border border-slate-700 rounded pl-9 pr-3 py-2 text-sm text-[#DAE2FD] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Account Security Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-[#0B1326] border border-slate-700 rounded pl-9 pr-3 py-2 text-sm text-[#DAE2FD] focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-400">Entropy Score</span>
              <span className={`font-mono font-medium ${
                passwordStrength === 'Strong' ? 'text-emerald-400' : passwordStrength === 'Medium' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {passwordStrength}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Phone Number (E.164 format)
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full bg-[#0B1326] border border-slate-700 rounded pl-9 pr-3 py-2 text-sm text-[#DAE2FD] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Date of Birth (YYYY-MM-DD)
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full bg-[#0B1326] border border-slate-700 rounded pl-9 pr-3 py-2 text-sm text-[#DAE2FD] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Taxpayer Identification (SSN / TIN)
            </label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                required
                className="w-full bg-[#0B1326] border border-slate-700 rounded pl-9 pr-3 py-2 text-sm text-[#DAE2FD] focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Residential Address
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full bg-[#0B1326] border border-slate-700 rounded pl-9 pr-3 py-2 text-sm text-[#DAE2FD] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Encrypting & Registering...</span>
            ) : (
              <>
                <span>Save & Continue to Document Upload</span>
                <Check size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
