import React from "react";
import {
  Layers,
  ShieldAlert,
  BarChart3,
  Globe,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function LayerMatrix({ riskData }) {
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const defaultLayers = [
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
  ];

  const layers =
    riskData?.layers && riskData.layers.length > 0
      ? riskData.layers
      : defaultLayers;
  const totalExposure = riskData?.totalExposure || 90000000;
  const pml = riskData?.probableMaximumLoss || 42500000;
  const catScore = riskData?.catRiskScore || 74;

  return (
    <div className="space-y-6">
      {/* Top Risk Exposure KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">
              Total Program Exposure
            </span>
            <ShieldAlert className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatCurrency(totalExposure)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Across all combined treaty layers
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">
              Probable Max Loss (PML 1:250)
            </span>
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 font-mono">
            {formatCurrency(pml)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Modeled via RMS & AIR Synthetic Engines
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">
              CAT Risk Index
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              MODERATE-HIGH
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-blue-900 font-mono">
              {catScore}
            </p>
            <span className="text-xs text-slate-500">/ 100 benchmark</span>
          </div>
          {/* Visual Score Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                catScore > 80
                  ? "bg-red-500"
                  : catScore > 60
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${catScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Layer Matrix Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">
              Treaty Layer Structure & Participation Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            3 Defined Treaty Layers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Layer</th>
                <th className="py-3 px-4">Attachment Point</th>
                <th className="py-3 px-4">Layer Limit</th>
                <th className="py-3 px-4">Gen Re Share</th>
                <th className="py-3 px-4">Est. Net Premium</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {layers.map((layer, idx) => {
                const limit = layer.limit || 20000000;
                const attachment = layer.attachment || 10000000;
                const share = layer.genreSharePercentage || 100;
                const net = layer.netPremium || limit * 0.08 * (share / 100);

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-primary text-white text-xs font-bold flex items-center justify-center">
                          {layer.layerNumber || idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {layer.name || `Layer ${idx + 1}`}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {formatCurrency(limit)} xs{" "}
                            {formatCurrency(attachment)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 text-xs">
                      {formatCurrency(attachment)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 text-xs">
                      {formatCurrency(limit)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 text-xs">
                          {share}%
                        </span>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-blue-600 h-full"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700 text-xs">
                      {formatCurrency(net)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {layer.status || "ACTIVE"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peril & Territorial Exposure Distribution Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-700" />
            <h4 className="text-sm font-bold text-slate-900">
              Peril & Territorial Catastrophe Accumulation Distribution
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            100% Aggregated
          </span>
        </div>

        {/* Multi-segment visual bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner bg-slate-100">
          <div
            className="bg-blue-600 hover:opacity-90 transition"
            style={{ width: "45%" }}
            title="Gulf Coast Hurricane (45%)"
          />
          <div
            className="bg-sky-500 hover:opacity-90 transition"
            style={{ width: "30%" }}
            title="East Coast Windstorm (30%)"
          />
          <div
            className="bg-amber-500 hover:opacity-90 transition"
            style={{ width: "15%" }}
            title="California Earthquake (15%)"
          />
          <div
            className="bg-indigo-700 hover:opacity-90 transition"
            style={{ width: "10%" }}
            title="Midwest Convective Storm (10%)"
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0"></span>
            <div>
              <p className="font-semibold text-slate-800">
                Gulf Coast Hurricane
              </p>
              <p className="text-[11px] text-slate-500">
                45% ($40.5M Exposure)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0"></span>
            <div>
              <p className="font-semibold text-slate-800">
                East Coast Windstorm
              </p>
              <p className="text-[11px] text-slate-500">
                30% ($27.0M Exposure)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
            <div>
              <p className="font-semibold text-slate-800">
                California Earthquake
              </p>
              <p className="text-[11px] text-slate-500">
                15% ($13.5M Exposure)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-indigo-700 shrink-0"></span>
            <div>
              <p className="font-semibold text-slate-800">Midwest Convective</p>
              <p className="text-[11px] text-slate-500">10% ($9.0M Exposure)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
