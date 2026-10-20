import React, { useState } from "react";
import {
  FileCheck2,
  Calendar,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lock,
  ArrowRight,
} from "lucide-react";
import { binderApi } from "../../services/api.js";

export default function BindingForm({ selectedQuote, onPolicyBound }) {
  const [formData, setFormData] = useState({
    quoteId: selectedQuote?.id || "quo-apex-cat-001",
    effectiveDate: "2026-07-01",
    expiryDate: "2027-06-30",
    paymentTerms: "NET_30",
    boundBy: "Aarchi Jain (Lead Underwriter)",
    specialConditions: {
      lossHistoryCertified: true,
      sanctionsChecked: true,
      premiumWarrantyAgreed: true,
      signedSlipReceived: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleConditionToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      specialConditions: {
        ...prev.specialConditions,
        [key]: !prev.specialConditions[key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessData(null);

    // Validate conditions precedent
    const allChecked = Object.values(formData.specialConditions).every(Boolean);
    if (!allChecked) {
      setError(
        "All mandatory conditions precedent must be verified before executing policy binding.",
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        quoteId: formData.quoteId,
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate,
        paymentTerms: formData.paymentTerms,
        boundBy: formData.boundBy,
        conditionsPrecedentMet: true,
      };

      const result = await binderApi.createBinder(payload);
      setSuccessData(result);
      if (onPolicyBound) {
        onPolicyBound(result);
      }
    } catch (err) {
      console.error("Failed to bind policy:", err);
      const errMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Binding service unreachable. Check backend Spring Boot service on port 8000.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-700" />
            Treaty Policy Binding & Execution Contract
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lock commercial terms, confirm covenants, and generate official Gen
            Re Binder Certificate.
          </p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
          Binding Authority: Active
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-sm text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Execution Blocked</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {successData && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Policy Successfully Bound!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Policy Reference:{" "}
                <span className="font-mono font-bold">
                  {successData.policyReferenceId || "GENRE-2026-POL-8831"}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Selected Quote Information Banner */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Selected Treaty Program
            </span>
            <p className="text-sm font-bold text-slate-900">
              {selectedQuote?.insuredName ||
                "Apex Global Assurance Corp - Property Catastrophe"}
            </p>
            <p className="text-xs text-slate-600">
              Limit: $
              {Number(selectedQuote?.sumInsured || 50000000).toLocaleString()}{" "}
              &bull; Target ROL:{" "}
              {selectedQuote?.rateOnLine || selectedQuote?.targetRate || 8.5}%
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">
              Quote Ref
            </span>
            <p className="text-xs font-mono font-bold text-blue-800">
              {selectedQuote?.quoteNumber || "QUO-NA-2026-001"}
            </p>
          </div>
        </div>

        {/* Dates & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Inception / Effective Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveDate: e.target.value })
                }
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Treaty Expiration Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Settlement & Payment Terms *
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTerms: e.target.value })
                }
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              >
                <option value="NET_30">30 Days Net from Inception</option>
                <option value="CASH_IN_ADVANCE">
                  Cash in Advance / Escrow
                </option>
                <option value="QUARTERLY_INSTALLMENTS">
                  Quarterly Equal Installments
                </option>
                <option value="SPECIAL_FACILITY">
                  Special Treaty Facility Terms
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Bound By Underwriter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Signatory Underwriting Officer *
          </label>
          <input
            type="text"
            value={formData.boundBy}
            onChange={(e) =>
              setFormData({ ...formData, boundBy: e.target.value })
            }
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            required
          />
        </div>

        {/* Conditions Precedent Checklist */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Conditions Precedent Verification Checklist
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              All items required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specialConditions.lossHistoryCertified}
                onChange={() => handleConditionToggle("lossHistoryCertified")}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">
                5-Year Certified Cedent Historical Loss Runs Verified
              </span>
            </label>

            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specialConditions.sanctionsChecked}
                onChange={() => handleConditionToggle("sanctionsChecked")}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">
                OFAC / Global AML Sanctions Screening Cleared
              </span>
            </label>

            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specialConditions.premiumWarrantyAgreed}
                onChange={() => handleConditionToggle("premiumWarrantyAgreed")}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">
                Premium Payment Warranty & Reinstatement Terms Acknowledged
              </span>
            </label>

            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specialConditions.signedSlipReceived}
                onChange={() => handleConditionToggle("signedSlipReceived")}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">
                Broker Electronic Placing Slip Counter-Signature Captured
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Binding triggers legal treaty commitment and issues cryptographic
            certificate.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Binding...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                <span>Bind Policy & Issue Certificate</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
