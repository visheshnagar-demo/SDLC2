import React from "react";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export const COVERAGE_TIERS = [
  {
    id: "Third Party",
    label: "Third Party",
    description:
      "Mandatory minimum liability covering damages caused to other vehicles and property.",
    icon: Shield,
    badge: "Basic Tier",
  },
  {
    id: "Third Party Fire and Theft",
    label: "Third Party Fire & Theft",
    description:
      "Third-party liability plus coverage for vehicle loss due to fire, explosion, or theft.",
    icon: ShieldAlert,
    badge: "Standard Tier",
  },
  {
    id: "Comprehensive",
    label: "Comprehensive",
    description:
      "Complete protection against collision, theft, natural disasters, vandalism, and third-party liabilities.",
    icon: ShieldCheck,
    badge: "Recommended",
  },
];

export default function CoverageTierSelector({ value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        Coverage Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {COVERAGE_TIERS.map((tier) => {
          const isSelected =
            value === tier.id ||
            (tier.id === "Third Party Fire and Theft" &&
              value === "Third Party Fire & Theft");
          const IconComponent = tier.icon;
          return (
            <button
              key={tier.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tier.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-indigo-200 text-indigo-900"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tier.badge}
                  </span>
                </div>
                <div
                  className={`font-semibold text-sm ${isSelected ? "text-indigo-950" : "text-slate-800"}`}
                >
                  {tier.label}
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {tier.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
