import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = ({ mode = 'register' }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword');
  const [fullName, setFullName] = useState('Alex Morgan');
  const [role, setRole] = useState('customer');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          if (res.user?.role === 'compliance_officer') {
            navigate('/compliance/queue');
          } else if (res.user?.role === 'admin') {
            navigate('/admin/audit-logs');
          } else {
            navigate('/onboarding/document');
          }
        } else {
          setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
        }
      } else {
        const res = await register({
          email,
          password,
          full_name: fullName,
          role,
        });
        if (res.success) {
          navigate('/onboarding/document');
        } else {
          setErrorMsg(res.error || 'Registration failed.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error encountered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (presetRole, presetEmail) => {
    setEmail(presetEmail);
    setPassword('testpassword');
    setRole(presetRole);
    if (presetRole === 'compliance_officer') setFullName('Officer Sarah Jenkins');
    else if (presetRole === 'admin') setFullName('Administrator David Vance');
    else setFullName('Alex Morgan');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F172A] border border-[#334155] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient highlight */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0284C7]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#0284C7] flex items-center justify-center text-[#0284C7] shadow-[0_0_20px_rgba(2,132,199,0.35)] mb-3">
            <Shield className="w-6 h-6 text-[#0284C7]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            {isLogin ? 'Sign In to Veritas IDV' : 'Create Customer Profile'}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Enterprise Digital Identity Verification &amp; Cryptographic Trust Gateway
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-[#0B1326] border border-[#334155] rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              !isLogin
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              isLogin
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Constitution Test Credentials Notice Banner */}
        <div className="p-3 mb-5 rounded-lg bg-[#1E293B] border border-[#334155] text-xs">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#38BDF8] uppercase mb-1">
            <span className="flex items-center gap-1 font-semibold">
              <Key className="w-3 h-3 text-[#0284C7]" />
              Standard Test Credentials:
            </span>
            <span>Pre-Seeded</span>
          </div>
          <div className="text-[11px] text-[#94A3B8] space-y-0.5">
            <div>Customer: <code className="text-[#F8FAFC]">test@example.com</code> / <code className="text-[#F8FAFC]">testpassword</code></div>
            <div>Compliance: <code className="text-[#F8FAFC]">compliance@example.com</code> / <code className="text-[#F8FAFC]">testpassword</code></div>
            <div>Admin: <code className="text-[#F8FAFC]">admin@example.com</code> / <code className="text-[#F8FAFC]">adminpassword</code></div>
          </div>
          {/* Quick Click Badges */}
          <div className="flex gap-1.5 mt-2 pt-2 border-t border-[#334155]">
            <button
              type="button"
              onClick={() => handleQuickFill('customer', 'test@example.com')}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#0B1326] text-[#38BDF8] hover:bg-[#334155] border border-[#334155]"
            >
              Fill Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('compliance_officer', 'compliance@example.com')}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#0B1326] text-[#F59E0B] hover:bg-[#334155] border border-[#334155]"
            >
              Fill Compliance
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin@example.com')}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#0B1326] text-[#10B981] hover:bg-[#334155] border border-[#334155]"
            >
              Fill Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-[#0B1326] border border-[#334155] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F8FAFC] font-sans focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
              Work / Personal Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0B1326] border border-[#334155] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F8FAFC] font-sans focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0B1326] border border-[#334155] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F8FAFC] font-sans focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                Account Role Authorization
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0B1326] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] font-sans focus:outline-none focus:border-[#0284C7]"
              >
                <option value="customer">Customer / Applicant (eKYC Verification)</option>
                <option value="compliance_officer">Compliance Officer (Adjudication Portal)</option>
                <option value="admin">Admin Auditor (Governance &amp; Merkle Trail)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(2,132,199,0.4)] transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <span>{isLogin ? 'Authenticate & Access Portal' : 'Register Customer Identity'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
