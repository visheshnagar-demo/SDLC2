import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ShieldAlert,
  KeyRound,
  Info,
} from "lucide-react";
import Button from "../common/Button";

export const LoginForm = ({ onSubmit, loading = false, error = null }) => {
  const [username, setUsername] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    onSubmit({ username, password, rememberMe });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Test Account Banner */}
      <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5" />
        <div className="text-xs text-[#94A3B8]">
          <p className="font-medium text-[#F8FAFC]">
            Test account:{" "}
            <span className="text-[#0EA5E9] font-mono">test@example.com</span> /{" "}
            <span className="text-[#0EA5E9] font-mono">testpassword</span>
          </p>
          <p className="mt-0.5 text-[11px]">
            Pre-seeded credentials for instant QA and evaluator access.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs"
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Username / Email field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-[#94A3B8]">
          Email or Username
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
            <User className="w-4 h-4" />
          </div>
          <input
            id="username-input"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#191F2F] border border-[#33394A] rounded-lg text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
            placeholder="test@example.com"
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-[#94A3B8]">
            Password
          </label>
          <span className="text-[11px] text-[#0EA5E9] hover:underline cursor-pointer">
            Forgot password?
          </span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password-input"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-[#191F2F] border border-[#33394A] rounded-lg text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
            placeholder="••••••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#F8FAFC]"
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Remember me & security notice */}
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-[#94A3B8] cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded bg-[#191F2F] border-[#33394A] text-[#2563EB] focus:ring-offset-0 focus:ring-1 focus:ring-[#2563EB]"
          />
          <span>Remember this workstation</span>
        </label>
        <span className="text-[#94A3B8]/70 text-[11px]">
          15-min auto timeout
        </span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full font-semibold"
        icon={KeyRound}
      >
        Sign In to Secure Banking
      </Button>
    </form>
  );
};

export default LoginForm;
