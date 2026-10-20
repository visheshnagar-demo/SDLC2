import React from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";

export const RiskScoreBreakdown = ({
  scoreData,
  submission,
  onRecalculate,
  isLoading = false,
}) => {
  const totalScore = scoreData?.total_score ?? scoreData?.totalScore ?? 82;
  const riskTier =
    scoreData?.risk_tier ?? scoreData?.riskTier ?? "LOW RISK / PREFERRED";
  const factors = scoreData?.breakdown ?? [
    {
      name: "Multi-Factor Authentication (MFA) Enforcement",
      category: "Cyber Controls",
      points: 20,
      maxPoints: 20,
      status: "PASS",
      description:
        "Enforced across all VPN, email, and privileged identity accounts",
    },
    {
      name: "EDR Telemetry & 24/7 Managed SOC",
      category: "Cyber Controls",
      points: 20,
      maxPoints: 20,
      status: "PASS",
      description:
        "Active endpoint isolation with CrowdStrike Falcon deployed to 98% fleet",
    },
    {
      name: "Air-Gapped Immutable Backups",
      category: "Disaster Recovery",
      points: 15,
      maxPoints: 15,
      status: "PASS",
      description:
        "Quarterly ransomware restore drills verified; 14-day immutable snapshots",
    },
    {
      name: "3-Year Historical Loss Ratio (12.4%)",
      category: "Actuarial Loss History",
      points: 15,
      maxPoints: 15,
      status: "PASS",
      description:
        "Loss ratio is well below the 35% line of business benchmark",
    },
    {
      name: "Prior Claims & Incident Severity",
      category: "Claims History",
      points: 7,
      maxPoints: 10,
      status: "WARN",
      description:
        "Single low-severity phishing incident reported 2 years ago (remediated)",
    },
    {
      name: "Industry & Jurisdictional Hazard Baseline",
      category: "Exposure Baseline",
      points: 5,
      maxPoints: 20,
      status: "WARN",
      description:
        "Healthcare sector carries elevated PHI / HIPAA litigation exposure",
    },
  ];

  const getTierColor = (score) => {
    if (score >= 80)
      return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    if (score >= 60) return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    return "text-amber-400 bg-amber-500/20 border-amber-500/30";
  };

  const limitFormatted = submission?.policy_limit
    ? `$${(submission.policy_limit / 1000000).toFixed(1)}M`
    : "$10.0M";
  const attachFormatted = submission?.attachment_point
    ? `$${(submission.attachment_point / 1000000).toFixed(1)}M`
    : "$2.0M";
  const rateOnLine =
    submission?.policy_limit && submission?.proposed_premium
      ? `${((submission.proposed_premium / submission.policy_limit) * 100).toFixed(2)}%`
      : "3.50%";

  return (
    <div className="space-y-6">
      {/* Hero Composite Score Gauge Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-950 shadow-inner">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-emerald-400">
                    {totalScore}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    / 100
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Rules-Based Composite Risk Score
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {submission?.insured_name || "Nexus Health Systems Inc."}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${getTierColor(totalScore)}`}
                >
                  {riskTier}
                </span>
                <span className="text-xs text-slate-400">
                  Evaluated on {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Underwriting Param Summary Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-center">
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                Limit
              </span>
              <span className="text-sm font-bold text-slate-100">
                {limitFormatted}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                Attachment
              </span>
              <span className="text-sm font-bold text-slate-100">
                {attachFormatted}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                Rate on Line
              </span>
              <span className="text-sm font-bold text-blue-400">
                {rateOnLine}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules-Based Factor Breakdown Card */}
      <Card
        title="Rules-Based Factor Attribution Breakdown"
        subtitle="Transparent evaluation of underwriting controls, loss history, and security controls"
        action={
          onRecalculate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRecalculate}
              loading={isLoading}
              icon={RefreshCw}
            >
              Recalculate Score
            </Button>
          )
        }
      >
        <div className="space-y-3">
          {factors.map((factor, idx) => {
            const isFullPoints = factor.points === factor.maxPoints;
            const pct = Math.round((factor.points / factor.maxPoints) * 100);

            return (
              <div
                key={factor.name || idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {isFullPoints ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : factor.points > 0 ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">
                          {factor.name}
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                          {factor.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {factor.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                    <div className="text-sm font-bold text-slate-900">
                      <span
                        className={
                          isFullPoints ? "text-emerald-700" : "text-slate-800"
                        }
                      >
                        +{factor.points}
                      </span>
                      <span className="text-slate-400 font-normal text-xs">
                        {" "}
                        / {factor.maxPoints} pts
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {pct}% weight applied
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isFullPoints
                        ? "bg-emerald-500"
                        : factor.points > 0
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Underwriting rules and factor scoring weights are isolated in the
            rules module and can be adjusted dynamically in the Underwriting
            Rules Configuration workbench.
          </span>
        </div>
      </Card>
    </div>
  );
};

export default RiskScoreBreakdown;
