import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import LayerMatrix from "../components/underwriting/LayerMatrix.jsx";
import DecisionPanel from "../components/underwriting/DecisionPanel.jsx";
import { riskApi } from "../services/api.js";
import { Layers, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";

export default function UnderwritingPage() {
  const location = useLocation();
  const selectedQuote = location.state?.selectedQuote;

  const [risks, setRisks] = useState([]);
  const [activeRisk, setActiveRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const data = await riskApi.getRisks();
      const list = Array.isArray(data) ? data : data?.content || [];
      setRisks(list);
      if (list.length > 0) {
        setActiveRisk(list[0]);
      }
    } catch (err) {
      console.warn("Could not load risks from backend:", err);
      // Fallback synthetic mock risk structure
      const mockRisk = {
        id: "risk-cat-apex-001",
        quoteId: selectedQuote?.id || "quo-apex-cat-001",
        totalExposure: selectedQuote?.sumInsured || 90000000,
        probableMaximumLoss: 42500000,
        catRiskScore: 74,
        underwritingDecision: "PENDING_REVIEW",
        layers: [
          {
            layerNumber: 1,
            name: "Working Cat Layer",
            attachment: 10000000,
            limit: 15000000,
            genreSharePercentage: 100.0,
            rateOnLine: 12.0,
            netPremium: 1800000,
            status: "APPROVED",
          },
          {
            layerNumber: 2,
            name: "Main Treaty Layer",
            attachment: 25000000,
            limit: 25000000,
            genreSharePercentage: 75.0,
            rateOnLine: 8.5,
            netPremium: 1593750,
            status: "PENDING_REVIEW",
          },
          {
            layerNumber: 3,
            name: "High Excess Catastrophe",
            attachment: 50000000,
            limit: 50000000,
            genreSharePercentage: 50.0,
            rateOnLine: 4.2,
            netPremium: 1050000,
            status: "WITHIN_APPETITE",
          },
        ],
      };
      setRisks([mockRisk]);
      setActiveRisk(mockRisk);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const handleDecisionSubmitted = (updated) => {
    if (activeRisk) {
      setActiveRisk((prev) => ({
        ...prev,
        underwritingDecision: updated?.decision || "APPROVED",
      }));
    }
  };

  return (
    <AppLayout pageTitle="Risk Structuring & Underwriting">
      <div className="space-y-8">
        {/* Top Header Banner */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Risk Structuring & Treaty Underwriting Workbench
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Inspect multi-layer excess of loss and quota share treaty
              structures, assess modeled catastrophe hazard curves, and execute
              binding underwriting mandates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRisks}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh Profiles</span>
            </button>
          </div>
        </div>

        {/* Selected Cedent Information if passed */}
        {selectedQuote && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                GR
              </span>
              <div>
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                  Active Treaty Context from Quoting
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedQuote.insuredName} &bull;{" "}
                  {selectedQuote.lineOfBusiness}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white font-mono text-xs font-bold rounded">
              Limit: ${Number(selectedQuote.sumInsured || 0).toLocaleString()}
            </span>
          </div>
        )}

        {/* Layer Matrix Component */}
        <LayerMatrix riskData={activeRisk} />

        {/* Underwriting Decision Panel Component */}
        <DecisionPanel
          riskId={activeRisk?.id}
          onDecisionSubmitted={handleDecisionSubmitted}
        />
      </div>
    </AppLayout>
  );
}
