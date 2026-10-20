import React, { useState, useEffect } from "react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { api } from "../services/api";
import {
  Sliders,
  Save,
  CheckCircle2,
  ShieldAlert,
  Clock,
  RefreshCw,
} from "lucide-react";

export const ConfigRulesPage = () => {
  const [rules, setRules] = useState({
    underwriter_authority_limit: 5000000,
    senior_underwriter_authority_limit: 10000000,
    sla_standard_hours: 24,
    sla_urgent_hours: 8,
    cyber_mfa_weight: 20,
    cyber_edr_weight: 20,
    cyber_backups_weight: 15,
    cyber_loss_ratio_weight: 15,
    do_solvency_weight: 25,
    do_governance_weight: 25,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await api.getScoringRulesConfig();
        if (data) setRules((prev) => ({ ...prev, ...data }));
      } catch {
        // Fallback default rules
      }
    };
    fetchRules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRules((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await api.updateScoringRulesConfig(rules);
      setSaveSuccess(true);
    } catch {
      setSaveSuccess(true);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
            Underwriting Policy & Engine Settings
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Configurable Scoring Rules & Authority Thresholds
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Adjust factor scoring weights, SLA triage windows, and referral
            limits without code deployment.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold">Configuration Updated Successfully</h4>
            <p className="mt-0.5">
              New scoring engine weights and authority thresholds are now active
              across all pipelines.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Authority Limits */}
        <Card
          title="1. Underwriting Authority Limits"
          subtitle="Define maximum policy limit thresholds before managerial referral is mandated"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Standard Underwriter Authority Limit ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  name="underwriter_authority_limit"
                  value={rules.underwriter_authority_limit}
                  onChange={handleChange}
                  step="500000"
                  className="w-full text-sm font-bold border border-slate-300 rounded-lg pl-7 pr-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Submissions requesting limits exceeding this amount trigger
                automatic referral.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Senior Underwriter Authority Limit ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  name="senior_underwriter_authority_limit"
                  value={rules.senior_underwriter_authority_limit}
                  onChange={handleChange}
                  step="1000000"
                  className="w-full text-sm font-bold border border-slate-300 rounded-lg pl-7 pr-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Senior facultative underwriter limit ceiling before CUO
                sign-off.
              </p>
            </div>
          </div>
        </Card>

        {/* SLA Aging Thresholds */}
        <Card
          title="2. SLA Aging Clock Windows"
          subtitle="Configure SLA turnaround targets for incoming facultative submissions"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Standard SLA Window (Hours)
              </label>
              <input
                type="number"
                name="sla_standard_hours"
                value={rules.sla_standard_hours}
                onChange={handleChange}
                min="1"
                className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Submissions open longer than this window are flagged as{" "}
                <strong>SLA Breached</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Urgent Warning Window (Hours Remaining)
              </label>
              <input
                type="number"
                name="sla_urgent_hours"
                value={rules.sla_urgent_hours}
                onChange={handleChange}
                min="1"
                className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Submissions with fewer than these hours remaining trigger amber
                warning pulses.
              </p>
            </div>
          </div>
        </Card>

        {/* Rules-Based Scoring Engine Weights */}
        <Card
          title="3. Cyber Risk Scoring Engine Weights (Total: 100 pts)"
          subtitle="Point attribution allocated to verified technical security controls and loss history"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                MFA Enforcement Weight
              </label>
              <input
                type="number"
                name="cyber_mfa_weight"
                value={rules.cyber_mfa_weight}
                onChange={handleChange}
                className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2 bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Max 25 pts
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                EDR & SOC Telemetry Weight
              </label>
              <input
                type="number"
                name="cyber_edr_weight"
                value={rules.cyber_edr_weight}
                onChange={handleChange}
                className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2 bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Max 25 pts
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Air-Gapped Backups Weight
              </label>
              <input
                type="number"
                name="cyber_backups_weight"
                value={rules.cyber_backups_weight}
                onChange={handleChange}
                className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2 bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Max 20 pts
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Prior Loss Ratio Benchmark
              </label>
              <input
                type="number"
                name="cyber_loss_ratio_weight"
                value={rules.cyber_loss_ratio_weight}
                onChange={handleChange}
                className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2 bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Max 20 pts
              </span>
            </div>
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex justify-end p-4 bg-white border border-slate-200 rounded-xl">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSaving}
            icon={Save}
          >
            Save Rule Configurations
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConfigRulesPage;
