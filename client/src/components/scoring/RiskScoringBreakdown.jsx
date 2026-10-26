import React, { useState } from "react";
import { calculateRiskScore } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  RefreshCw,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
} from "lucide-react";

export const RiskScoringBreakdown = ({ submission, onScoreUpdated }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const scoreObj = submission.risk_score;

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const updated = await calculateRiskScore(
        submission.id,
        null,
        currentUser.email,
      );
      if (onScoreUpdated) {
        onScoreUpdated(updated);
      }
    } catch (err) {
      console.error("Score recalculation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const score = scoreObj?.composite_score || 0;
  const grade = scoreObj?.risk_grade || "UNSCORED";
  const factors = scoreObj?.factors || [];

  return (
    <Card
      title="Rules-Based Risk Scoring Engine"
      subtitle={`Evaluated on ${submission.line_of_business} algorithmic underwriting matrix.`}
      headerAction={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecalculate}
          loading={loading}
          icon={RefreshCw}
        >
          Re-evaluate Score
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Score Gauge & Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-700"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * score) / 100}
                  className={`${
                    score >= 80
                      ? "text-emerald-400"
                      : score >= 60
                        ? "text-amber-400"
                        : "text-rose-400"
                  } transition-all duration-1000 ease-out`}
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold font-mono tracking-tight">
                  {score}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  / 100
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Underwriting Grade:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    score >= 80
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                      : score >= 60
                        ? "bg-amber-950 text-amber-300 border border-amber-700"
                        : "bg-rose-950 text-rose-300 border border-rose-700"
                  }`}
                >
                  {grade.replace("_", " ")}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mt-1">
                {score >= 80
                  ? "Preferred Specialty Tier"
                  : score >= 60
                    ? "Standard Rating Tier"
                    : "Substandard / High Hazard Tier"}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 max-w-sm">
                {score >= 80
                  ? "Demonstrates excellent risk mitigation controls, low historical loss frequency, and strong governance."
                  : score >= 60
                    ? "Acceptable underwriting parameters; requires standard deductible and warranty clauses."
                    : "Requires senior underwriting sign-off, elevated retention, or rate surcharge."}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <div className="flex items-center space-x-1.5 text-sky-400 font-semibold mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Rules Engine: v3.4.1</span>
            </div>
            <div>
              Evaluated:{" "}
              {new Date(
                scoreObj?.evaluated_at || Date.now(),
              ).toLocaleTimeString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Line: {submission.line_of_business}
            </div>
          </div>
        </div>

        {/* Factor Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <span>Specialty Line Control & Risk Factor Evaluation</span>
            <span>Allocated Points & Result</span>
          </div>

          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-slate-100">
              {factors.map((factor, idx) => {
                const isPass = factor.status === "PASS";
                const isWarning = factor.status === "WARNING";
                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {isPass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center space-x-2">
                            <span>{factor.name}</span>
                            <span className="text-[10px] text-slate-500 font-normal px-1.5 py-0.2 bg-slate-100 rounded">
                              {factor.category}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {factor.notes}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        +{factor.score}{" "}
                        <span className="text-slate-400 text-xs">
                          / {factor.max_score} pts
                        </span>
                      </div>
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-0.5 ${
                          isPass
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isWarning
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {factor.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default RiskScoringBreakdown;
