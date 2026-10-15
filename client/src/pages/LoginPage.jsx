import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import LoginForm from "../components/auth/LoginForm";
import MfaModal from "../components/auth/MfaModal";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMfa, setShowMfa] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);

  const handleLoginSubmit = async (credentials) => {
    setError(null);
    setLoading(true);

    // Call login
    const result = await login(credentials);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      // If error, check if it's an MFA trigger or actual failure
      if (result.error && result.error.includes("MFA_REQUIRED")) {
        setPendingCredentials(credentials);
        setShowMfa(true);
      } else {
        setError(result.error);
      }
    }
  };

  const handleMfaVerify = async (otpCode) => {
    setLoading(true);
    // Submit with MFA token
    const result = await login({
      ...pendingCredentials,
      otp: otpCode,
    });
    setLoading(false);

    if (result.success) {
      setShowMfa(false);
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1322] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#2563EB] selection:text-white">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between border-b border-[#33394A]/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#0EA5E9] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-[#F8FAFC]">
              APEX BANK
            </span>
            <span className="block text-[10px] text-[#0EA5E9] font-medium">
              DIGITAL BANKING PORTAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">
            256-Bit SSL Encrypted Connection
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#151B2B] border border-[#33394A]/60 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
                Sign In to Your Account
              </h1>
              <p className="text-xs text-[#94A3B8]">
                Access your commercial & retail banking accounts securely.
              </p>
            </div>

            <LoginForm
              onSubmit={handleLoginSubmit}
              loading={loading}
              error={error}
            />

            <div className="pt-4 border-t border-[#33394A]/30 flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#0EA5E9]" />
                SOC-2 Type II Certified
              </span>
              <span>Need help? Contact Support</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#94A3B8]/60 border-t border-[#33394A]/30">
        © {new Date().getFullYear()} Apex Commercial Banking Corporation. Member
        FDIC. Equal Housing Lender.
      </footer>

      {/* MFA Modal */}
      <MfaModal
        isOpen={showMfa}
        onClose={() => setShowMfa(false)}
        onVerify={handleMfaVerify}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default LoginPage;
