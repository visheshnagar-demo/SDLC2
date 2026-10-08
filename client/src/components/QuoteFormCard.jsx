import React, { useState } from "react";
import {
  Calculator,
  RotateCcw,
  Sparkles,
  Car,
  Calendar,
  DollarSign,
  User,
  Award,
} from "lucide-react";
import CoverageTierSelector from "./CoverageTierSelector";
import ValidationErrorAlert from "./ValidationErrorAlert";

const currentYear = new Date().getFullYear();

const PRESETS = [
  {
    name: "Standard Profile (Toyota 2022, 30y/5y)",
    data: {
      vehicle_make: "Toyota",
      vehicle_year: 2022,
      vehicle_value: 25000,
      driver_age: 30,
      driving_experience: 5,
      coverage_type: "Comprehensive",
    },
  },
  {
    name: "Young Driver (Honda 2020, 20y/2y)",
    data: {
      vehicle_make: "Honda",
      vehicle_year: 2020,
      vehicle_value: 18000,
      driver_age: 20,
      driving_experience: 2,
      coverage_type: "Third Party Fire and Theft",
    },
  },
  {
    name: "Experienced Driver (BMW 2023, 45y/25y)",
    data: {
      vehicle_make: "BMW",
      vehicle_year: 2023,
      vehicle_value: 55000,
      driver_age: 45,
      driving_experience: 25,
      coverage_type: "Comprehensive",
    },
  },
];

export default function QuoteFormCard({ onCalculate, isLoading, apiError }) {
  const [formData, setFormData] = useState({
    vehicle_make: "Toyota",
    vehicle_year: 2022,
    vehicle_value: 25000,
    driver_age: 30,
    driving_experience: 5,
    coverage_type: "Comprehensive",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (data) => {
    const errors = {};
    if (!data.vehicle_make || data.vehicle_make.trim() === "") {
      errors.vehicle_make = "Vehicle make is required.";
    }

    const year = Number(data.vehicle_year);
    if (!year || isNaN(year)) {
      errors.vehicle_year = "Manufacture year is required.";
    } else if (year < 1900 || year > currentYear + 1) {
      errors.vehicle_year = `Manufacture year must be between 1900 and ${currentYear + 1}.`;
    }

    const val = Number(data.vehicle_value);
    if (val === undefined || val === null || isNaN(val) || val <= 0) {
      errors.vehicle_value = "Vehicle value must be greater than zero ($0.00).";
    }

    const age = Number(data.driver_age);
    if (!age || isNaN(age)) {
      errors.driver_age = "Driver age is required.";
    } else if (age < 16) {
      errors.driver_age = "Driver age must be at least 16 years old.";
    }

    const exp = Number(data.driving_experience);
    if (exp === undefined || exp === null || isNaN(exp) || exp < 0) {
      errors.driving_experience = "Driving experience cannot be negative.";
    } else if (age && !isNaN(age) && age >= 16 && exp > age - 16) {
      errors.driving_experience = `Driving experience (${exp} yrs) cannot exceed driver age minus 16 (${age - 16} yrs).`;
    }

    if (!data.coverage_type) {
      errors.coverage_type = "Please select a coverage tier.";
    }

    return errors;
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Revalidate touched field
    const errors = validate(updated);
    setFieldErrors(errors);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validate(formData);
    setFieldErrors(errors);
  };

  const handlePresetSelect = (preset) => {
    setFormData(preset.data);
    setFieldErrors({});
    setTouched({});
  };

  const handleReset = () => {
    setFormData({
      vehicle_make: "",
      vehicle_year: "",
      vehicle_value: "",
      driver_age: "",
      driving_experience: "",
      coverage_type: "Comprehensive",
    });
    setFieldErrors({});
    setTouched({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = {
      vehicle_make: true,
      vehicle_year: true,
      vehicle_value: true,
      driver_age: true,
      driving_experience: true,
      coverage_type: true,
    };
    setTouched(allTouched);

    const errors = validate(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      const payload = {
        vehicle_make: formData.vehicle_make.trim(),
        vehicle_year: parseInt(formData.vehicle_year, 10),
        vehicle_value: parseFloat(formData.vehicle_value),
        driver_age: parseInt(formData.driver_age, 10),
        driving_experience: parseInt(formData.driving_experience, 10),
        coverage_type: formData.coverage_type,
      };
      onCalculate(payload);
    }
  };

  const activeErrorsList = Object.values(fieldErrors);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 relative">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calculator className="w-5 h-5" />
            </span>
            Motor Insurance Quote Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter vehicle and driver parameters to generate an instant actuarial
            quote.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Quick Test Presets */}
      <div className="mb-5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Quick Test Profiles
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={`preset-${idx}`}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="text-xs px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors font-medium"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Validation Errors banner if any */}
      {activeErrorsList.length > 0 && Object.keys(touched).length > 0 && (
        <ValidationErrorAlert
          errors={activeErrorsList}
          title="Underwriting Guardrail Warnings"
        />
      )}

      {apiError && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
          <div className="font-bold mb-1">Calculation Failed:</div>
          <div>{apiError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Vehicle Details Section */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-slate-400" />
            Vehicle Specifications
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Vehicle Make */}
            <div>
              <label
                htmlFor="vehicle_make"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Vehicle Make <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="vehicle_make"
                  name="vehicle_make"
                  type="text"
                  placeholder="e.g. Toyota, Honda, Ford"
                  value={formData.vehicle_make}
                  onChange={(e) => handleChange("vehicle_make", e.target.value)}
                  onBlur={() => handleBlur("vehicle_make")}
                  className={`w-full text-sm px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.vehicle_make && fieldErrors.vehicle_make
                      ? "border-red-400 focus:ring-red-200 bg-red-50/30"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 bg-white"
                  }`}
                />
              </div>
              {touched.vehicle_make && fieldErrors.vehicle_make && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {fieldErrors.vehicle_make}
                </p>
              )}
            </div>

            {/* Manufacture Year */}
            <div>
              <label
                htmlFor="vehicle_year"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Manufacture Year <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="vehicle_year"
                  name="vehicle_year"
                  type="number"
                  min="1900"
                  max={currentYear + 1}
                  placeholder="e.g. 2022"
                  value={formData.vehicle_year}
                  onChange={(e) => handleChange("vehicle_year", e.target.value)}
                  onBlur={() => handleBlur("vehicle_year")}
                  className={`w-full text-sm px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.vehicle_year && fieldErrors.vehicle_year
                      ? "border-red-400 focus:ring-red-200 bg-red-50/30"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 bg-white"
                  }`}
                />
              </div>
              {touched.vehicle_year && fieldErrors.vehicle_year && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {fieldErrors.vehicle_year}
                </p>
              )}
            </div>

            {/* Vehicle Value */}
            <div>
              <label
                htmlFor="vehicle_value"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Vehicle Value ($ USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="vehicle_value"
                  name="vehicle_value"
                  type="number"
                  step="100"
                  placeholder="e.g. 25000"
                  value={formData.vehicle_value}
                  onChange={(e) =>
                    handleChange("vehicle_value", e.target.value)
                  }
                  onBlur={() => handleBlur("vehicle_value")}
                  className={`w-full text-sm px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.vehicle_value && fieldErrors.vehicle_value
                      ? "border-red-400 focus:ring-red-200 bg-red-50/30"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 bg-white"
                  }`}
                />
              </div>
              {touched.vehicle_value && fieldErrors.vehicle_value && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {fieldErrors.vehicle_value}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Driver Profile Section */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Driver Risk Profile
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Driver Age */}
            <div>
              <label
                htmlFor="driver_age"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Driver Age (Years) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="driver_age"
                  name="driver_age"
                  type="number"
                  min="16"
                  max="120"
                  placeholder="e.g. 30"
                  value={formData.driver_age}
                  onChange={(e) => handleChange("driver_age", e.target.value)}
                  onBlur={() => handleBlur("driver_age")}
                  className={`w-full text-sm px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.driver_age && fieldErrors.driver_age
                      ? "border-red-400 focus:ring-red-200 bg-red-50/30"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 bg-white"
                  }`}
                />
              </div>
              {touched.driver_age && fieldErrors.driver_age && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {fieldErrors.driver_age}
                </p>
              )}
            </div>

            {/* Driving Experience */}
            <div>
              <label
                htmlFor="driving_experience"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Driving Experience (Years){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="driving_experience"
                  name="driving_experience"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 5"
                  value={formData.driving_experience}
                  onChange={(e) =>
                    handleChange("driving_experience", e.target.value)
                  }
                  onBlur={() => handleBlur("driving_experience")}
                  className={`w-full text-sm px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.driving_experience && fieldErrors.driving_experience
                      ? "border-red-400 focus:ring-red-200 bg-red-50/30"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 bg-white"
                  }`}
                />
              </div>
              {touched.driving_experience && fieldErrors.driving_experience && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {fieldErrors.driving_experience}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Coverage Tier Selector */}
        <div className="pt-2">
          <CoverageTierSelector
            value={formData.coverage_type}
            onChange={(val) => handleChange("coverage_type", val)}
            disabled={isLoading}
          />
          {touched.coverage_type && fieldErrors.coverage_type && (
            <p className="text-[11px] text-red-600 mt-1 font-medium">
              {fieldErrors.coverage_type}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] hover:shadow-indigo-500/25"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Evaluating Actuarial Risk Rules...</span>
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                <span>Calculate Premium Quote</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
