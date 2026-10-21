import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, DEFAULT_USERS } from "../context/AuthContext";
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("underwriter@reinsurer.com");
  const [password, setPassword] = useState("testpassword");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/queue");
    } catch (err) {
      setError("Login failed. Please verify credentials.");
    }
  };

  const handleQuickLogin = async (userKey) => {
    const targetUser = DEFAULT_USERS[userKey];
    if (targetUser) {
      setEmail(targetUser.email);
      setPassword("testpassword");
      await login(targetUser.email, "testpassword");
      navigate(
        userKey === "manager"
          ? "/dashboard"
          : userKey === "ceding"
            ? "/intake"
            : "/queue",
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Apex Re Specialty Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Facultative Reinsurance Submission & Underwriting Platform
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Personas */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
            Quick Persona Login (Test Accounts)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("ceding")}
              className="p-2 border border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-[11px] text-slate-800">
                Ceding Insurer
              </div>
              <div className="text-[9px] text-slate-500 truncate">
                Sarah Jenkins
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("underwriter")}
              className="p-2 border border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-[11px] text-slate-800">
                Underwriter
              </div>
              <div className="text-[9px] text-slate-500 truncate">
                David Vance
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("manager")}
              className="p-2 border border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-lg text-left transition-colors"
            >
              <div className="font-bold text-[11px] text-slate-800">
                Manager / CUO
              </div>
              <div className="text-[9px] text-slate-500 truncate">
                Elena Rostova
              </div>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">
            Test account credentials: test@example.com / testpassword
          </p>
        </div>
      </div>
    </div>
  );
}
