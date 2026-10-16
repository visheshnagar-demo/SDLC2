import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle2,
  TrendingUp,
  Info,
} from "lucide-react";
import { calculateRiskScore } from "../../services/api";
import Badge from "../common/Badge";

export function RiskScoringPreview({
  riskCategory,
  policyLimitUsd,
  attachmentPointUsd,
  carrierRating,
  industrySector,
  priorLossAmountUsd,
  className = "",
}) {
  const [scoreData, setScoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Compute local fallback estimate or call API if parameters are filled
  useEffect(() => {
    let isMounted = true;
    const fetchScore = async () => {
      const limit = Number(policyLimitUsd) || 0;
      const attachment = Number(attachmentPointUsd) || 0;
      const priorLoss = Number(priorLossAmountUsd) || 0;

      if (!riskCategory || limit <= 0) {
        setScoreData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const payload = {
          risk_category: riskCategory,
          policy_limit_usd: limit,
          attachment_point_usd: attachment,
          carrier_rating: carrierRating || "A",
          industry_sector: industrySector || "Technology",
          prior_loss_amount_usd: priorLoss,
        };
        const res = await calculateRiskScore(payload);
        if (isMounted) {
          setScoreData(res);
        }
      } catch (err) {
        // Fallback local calculation when backend is offline
        if (isMounted) {
          // Heuristic score calculation
          let base = riskCategory === "CYBER" ? 45 : 40;
          if (limit > 15000000) base += 25;
          else if (limit > 5000000) base += 15;
          else base += 5;

          if (attachment < 2000000) base += 15;
          else if (attachment < 5000000) base += 5;
          else base -= 10;

          if (priorLoss > 1000000) base += 20;
          else if (priorLoss > 200000) base += 10;

          if (["B++", "B+", "B"].includes(carrierRating)) base += 15;
          else if (["A++", "AAA", "AA+"].includes(carrierRating)) base -= 10;

          const calculatedScore = Math.min(98, Math.max(12, base));
          const grade =
            calculatedScore >= 75
              ? "HIGH"
              : calculatedScore >= 50
                ? "MODERATE"
                : "LOW";
          const priority =
            calculatedScore >= 70
              ? "HIGH"
              : calculatedScore >= 40
                ? "MEDIUM"
                : "LOW";

          setScoreData({
            risk_score: calculatedScore,
            risk_grade: grade,
            priority: priority,
            breakdown: {
              exposure_score: Math.min(35, Math.round(limit / 500000)),
              rating_score: ["A++", "AA"].includes(carrierRating) ? 10 : 25,
              loss_history_score: priorLoss > 500000 ? 30 : 10,
              category_factor: riskCategory === "CYBER" ? 1.2 : 1.0,
            },
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchScore, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    riskCategory,
    policyLimitUsd,
    attachmentPointUsd,
    carrierRating,
    industrySector,
    priorLossAmountUsd,
  ]);

  if (!riskCategory || !policyLimitUsd) {
    return (
      <div
        className={`bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center text-slate-500 text-xs ${className}`}
      >
        <Activity className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        Enter risk parameters and policy limit to generate real-time risk
        scoring preview.
      </div>
    );
  }

  const score = scoreData?.risk_score ?? 50;
  const grade =
    scoreData?.risk_grade ||
    (score >= 70 ? "HIGH" : score >= 40 ? "MODERATE" : "LOW");
  const priority =
    scoreData?.priority ||
    (score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW");

  const getScoreColor = (val) => {
    if (val >= 75) return "text-rose-600";
    if (val >= 50) return "text-amber-600";
    return "text-emerald-600";
  };

  const getGaugeBackground = (val) => {
    if (val >= 75) return "bg-rose-500";
    if (val >= 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#2461F5]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#66738A]">
            Automated Risk Scoring Engine
          </h4>
        </div>
        {isLoading && (
          <span className="text-[11px] text-blue-600 animate-pulse font-medium">
            Computing...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Score gauge card */}
        <div className="bg-[#F8FAFC] border border-[#E3E8F0] rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold text-[#66738A] uppercase">
            Composite Score
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className={`text-4xl font-extrabold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full transition-all duration-500 ${getGaugeBackground(score)}`}
              style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
            ></div>
          </div>
        </div>

        {/* Grade and Priority */}
        <div className="space-y-3 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Risk Assessment Grade:
            </span>
            <Badge
              variant={
                grade === "HIGH"
                  ? "danger"
                  : grade === "MODERATE"
                    ? "warning"
                    : "success"
              }
            >
              {grade} RISK
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Underwriting Queue Priority:
            </span>
            <Badge
              variant={
                priority === "HIGH"
                  ? "danger"
                  : priority === "MEDIUM"
                    ? "warning"
                    : "low"
              }
            >
              {priority} PRIORITY
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Underwriting Routing:
            </span>
            <span className="text-xs font-semibold text-slate-800">
              {score >= 75
                ? "Senior Underwriter Referral"
                : "Standard Queue Processing"}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown attributes */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
        <div className="p-2 bg-slate-50 rounded-lg">
          <div className="text-slate-500">Line Factor</div>
          <div className="font-bold text-slate-800">
            {riskCategory === "CYBER" ? "Cyber (1.2x)" : "D&O (1.0x)"}
          </div>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <div className="text-slate-500">Carrier Rating</div>
          <div className="font-bold text-slate-800">{carrierRating || "A"}</div>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <div className="text-slate-500">Attachment</div>
          <div className="font-bold text-slate-800">
            ${(Number(attachmentPointUsd) / 1000000 || 0).toFixed(1)}M
          </div>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <div className="text-slate-500">Prior 5-Yr Loss</div>
          <div className="font-bold text-slate-800">
            ${(Number(priorLossAmountUsd) / 1000 || 0).toFixed(0)}k
          </div>
        </div>
      </div>
    </div>
  );
}

RiskScoringPreview.propTypes = {
  riskCategory: PropTypes.string,
  policyLimitUsd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  attachmentPointUsd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  carrierRating: PropTypes.string,
  industrySector: PropTypes.string,
  priorLossAmountUsd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export default RiskScoringPreview;
