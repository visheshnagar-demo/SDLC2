import React, { useState } from "react";
import {
  Calculator,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { quoteApi } from "../../services/api.js";

export default function QuotingForm({ onQuoteGenerated, onError }) {
  const [formData, setFormData] = useState({
    insuredName: "Apex Global Assurance Corp",
    lineOfBusiness: "Property Catastrophe",
    sumInsured: "50000000",
    deductible: "5000000",
    structureType: "EXCESS_OF_LOSS",
    attachmentPoint: "10000000",
    targetRate: "8.5",
    cedingCommission: "5.0",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const linesOfBusiness = [
    "Property Catastrophe",
    "Casualty Excess of Loss",
    "Marine & Energy Treaty",
    "Cyber Reinsurance",
    "Financial & Special Lines",
  ];

  const structureTypes = [
    {
      id: "EXCESS_OF_LOSS",
      label: "Excess of Loss (XOL)",
      desc: "Layered protection above attachment",
    },
    {
      id: "QUOTA_SHARE",
      label: "Quota Share (QS)",
      desc: "Proportional risk & premium sharing",
    },
    { id: "STOP_LOSS", label: "Stop Loss", desc: "Aggregate loss ratio cap" },
    {
      id: "FACULTATIVE",
      label: "Facultative Re",
      desc: "Single risk transactional cover",
    },
  ];

  const validate = () => {
    const errors = {};
    if (!formData.insuredName.trim()) {
      errors.insuredName = "Cedent / Insured name is required";
    }
    const sumIns = Number(formData.sumInsured);
    if (!sumIns || sumIns <= 0) {
      errors.sumInsured = "Sum Insured must be greater than 0";
    }
    const ded = Number(formData.deductible);
    if (isNaN(ded) || ded < 0) {
      errors.deductible = "Deductible must be non-negative";
    }
    const att = Number(formData.attachmentPoint);
    if (isNaN(att) || att < 0) {
      errors.attachmentPoint = "Attachment point must be non-negative";
    }
    const target = Number(formData.targetRate);
    if (!target || target <= 0 || target > 100) {
      errors.targetRate = "Target ROL must be between 0.1% and 100%";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleStructureSelect = (type) => {
    setFormData((prev) => ({ ...prev, structureType: type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        insuredName: formData.insuredName,
        lineOfBusiness: formData.lineOfBusiness,
        sumInsured: parseFloat(formData.sumInsured),
        deductible: parseFloat(formData.deductible),
        structureType: formData.structureType,
        attachmentPoint: parseFloat(formData.attachmentPoint),
        targetRate: parseFloat(formData.targetRate),
        cedingCommission: parseFloat(formData.cedingCommission || 0),
      };

      const result = await quoteApi.createQuote(payload);
      if (onQuoteGenerated) {
        onQuoteGenerated(result);
      }
    } catch (err) {
      console.error("Failed to generate quote:", err);
      const errMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to connect to backend pricing engine. Verify Spring Boot is running on port 8000.";
      setError(errMsg);
      if (onError) onError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill button handler
  const loadPreset = (presetName) => {
    if (presetName === "florida_wind") {
      setFormData({
        insuredName: "Everglades Mutual Reinsurance Co.",
        lineOfBusiness: "Property Catastrophe",
        sumInsured: "100000000",
        deductible: "10000000",
        structureType: "EXCESS_OF_LOSS",
        attachmentPoint: "25000000",
        targetRate: "12.5",
        cedingCommission: "4.5",
      });
    } else if (presetName === "casualty_treaty") {
      setFormData({
        insuredName: "Harbor Global Casualty Partners",
        lineOfBusiness: "Casualty Excess of Loss",
        sumInsured: "30000000",
        deductible: "2500000",
        structureType: "QUOTA_SHARE",
        attachmentPoint: "5000000",
        targetRate: "6.2",
        cedingCommission: "18.0",
      });
    }
    setFieldErrors({});
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-700" />
            Reinsurance Submission & Pricing Calculator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure treaty parameters and generate institutional pricing with
            synthetic actuarial models.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => loadPreset("florida_wind")}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md transition shadow-2xs"
          >
            Property Cat ($100M)
          </button>
          <button
            type="button"
            onClick={() => loadPreset("casualty_treaty")}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md transition shadow-2xs"
          >
            Casualty QS ($30M)
          </button>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-sm text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Calculation Error</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cedent Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cedent / Insured Entity *
            </label>
            <input
              type="text"
              name="insuredName"
              value={formData.insuredName}
              onChange={handleChange}
              placeholder="e.g. Apex Global Assurance"
              className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                fieldErrors.insuredName
                  ? "border-red-400 ring-1 ring-red-400"
                  : "border-slate-300"
              } rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition`}
            />
            {fieldErrors.insuredName && (
              <p className="text-xs text-red-600 font-medium">
                {fieldErrors.insuredName}
              </p>
            )}
          </div>

          {/* Line of Business */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Line of Business (Treaty Class) *
            </label>
            <select
              name="lineOfBusiness"
              value={formData.lineOfBusiness}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            >
              {linesOfBusiness.map((lob) => (
                <option key={lob} value={lob}>
                  {lob}
                </option>
              ))}
            </select>
          </div>

          {/* Sum Insured / Total Program Limit */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sum Insured / Program Limit ($ USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">
                $
              </span>
              <input
                type="number"
                name="sumInsured"
                value={formData.sumInsured}
                onChange={handleChange}
                step="1000000"
                min="100000"
                className={`w-full pl-8 pr-3.5 py-2.5 text-sm bg-white border ${
                  fieldErrors.sumInsured
                    ? "border-red-400 ring-1 ring-red-400"
                    : "border-slate-300"
                } rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition font-mono`}
              />
            </div>
            {fieldErrors.sumInsured && (
              <p className="text-xs text-red-600 font-medium">
                {fieldErrors.sumInsured}
              </p>
            )}
          </div>

          {/* Deductible / Retention */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cedent Retention / Deductible ($ USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">
                $
              </span>
              <input
                type="number"
                name="deductible"
                value={formData.deductible}
                onChange={handleChange}
                step="500000"
                min="0"
                className={`w-full pl-8 pr-3.5 py-2.5 text-sm bg-white border ${
                  fieldErrors.deductible
                    ? "border-red-400 ring-1 ring-red-400"
                    : "border-slate-300"
                } rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition font-mono`}
              />
            </div>
            {fieldErrors.deductible && (
              <p className="text-xs text-red-600 font-medium">
                {fieldErrors.deductible}
              </p>
            )}
          </div>
        </div>

        {/* Structure Type Radio Group */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Reinsurance Structure Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {structureTypes.map((struct) => (
              <div
                key={struct.id}
                onClick={() => handleStructureSelect(struct.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                  formData.structureType === struct.id
                    ? "bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-2xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-900">
                    {struct.label}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      formData.structureType === struct.id
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {formData.structureType === struct.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {struct.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Attachment Point */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Attachment Point ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">
                $
              </span>
              <input
                type="number"
                name="attachmentPoint"
                value={formData.attachmentPoint}
                onChange={handleChange}
                step="1000000"
                min="0"
                className={`w-full pl-8 pr-3.5 py-2.5 text-sm bg-white border ${
                  fieldErrors.attachmentPoint
                    ? "border-red-400 ring-1 ring-red-400"
                    : "border-slate-300"
                } rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition font-mono`}
              />
            </div>
            {fieldErrors.attachmentPoint && (
              <p className="text-xs text-red-600 font-medium">
                {fieldErrors.attachmentPoint}
              </p>
            )}
          </div>

          {/* Target ROL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Rate on Line (ROL %)
            </label>
            <div className="relative">
              <input
                type="number"
                name="targetRate"
                value={formData.targetRate}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                max="100"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
                  fieldErrors.targetRate
                    ? "border-red-400 ring-1 ring-red-400"
                    : "border-slate-300"
                } rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition font-mono`}
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 font-semibold text-sm">
                %
              </span>
            </div>
            {fieldErrors.targetRate && (
              <p className="text-xs text-red-600 font-medium">
                {fieldErrors.targetRate}
              </p>
            )}
          </div>

          {/* Ceding Commission */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ceding Commission (%)
            </label>
            <div className="relative">
              <input
                type="number"
                name="cedingCommission"
                value={formData.cedingCommission}
                onChange={handleChange}
                step="0.5"
                min="0"
                max="50"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 font-semibold text-sm">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Simulated calculations use Gen Re North American actuarial curves.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing Quote...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-300" />
                <span>Generate Synthetic Quote</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
