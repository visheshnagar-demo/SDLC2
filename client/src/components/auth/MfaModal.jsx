import React, { useState, useEffect } from "react";
import { ShieldCheck, Smartphone, Key, RefreshCw, X } from "lucide-react";
import Button from "../common/Button";

export const MfaModal = ({
  isOpen,
  onClose,
  onVerify,
  loading = false,
  error = null,
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(60);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleCompleteVerify = () => {
    const fullCode = code.join("");
    onVerify(fullCode);
  };

  const handleResend = () => {
    setTimeLeft(60);
    setCode(["", "", "", "", "", ""]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#151B2B] border border-[#33394A] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-[#0EA5E9]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">
            Two-Factor Authentication
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Enter the 6-digit verification code sent to your registered
            authenticator or phone.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* 6 Digit Inputs */}
        <div className="flex justify-center gap-2.5">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-12 text-center text-lg font-bold bg-[#191F2F] border border-[#33394A] rounded-lg text-[#F8FAFC] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/40 focus:outline-none transition-all"
            />
          ))}
        </div>

        {/* Timer & Resend */}
        <div className="flex items-center justify-between text-xs text-[#94A3B8] px-2">
          <span>
            Code expires in:{" "}
            <strong className="text-[#0EA5E9]">{timeLeft}s</strong>
          </span>
          <button
            type="button"
            disabled={timeLeft > 0}
            onClick={handleResend}
            className="flex items-center gap-1 text-[#0EA5E9] hover:underline disabled:opacity-40 disabled:no-underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resend Code</span>
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleCompleteVerify}
            className="w-full"
          >
            Verify & Authenticate
          </Button>

          <button
            type="button"
            onClick={() => onVerify("PASSKEY_AUTH")}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span>Use FIDO2 Hardware Passkey</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MfaModal;
