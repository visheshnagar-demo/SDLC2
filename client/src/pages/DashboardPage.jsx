import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileUp,
  ShieldAlert,
  CheckSquare,
  Activity,
  RefreshCw,
  AlertCircle,
  PieChart as PieIcon,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import RiskMetricGroup from "../components/dashboard/RiskMetricGroup";
import TreatyTable from "../components/dashboard/TreatyTable";
import { api } from "../services/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDocuments();
      const docsList = Array.isArray(data)
        ? data
        : data.items || data.documents || [];
      setDocuments(docsList);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Unable to fetch live documents from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleTriggerAnalysis = async (docId) => {
    try {
      setActionNotice({
        type: "info",
        message: `Triggering AI analysis for document ${docId}...`,
      });
      const job = await api.triggerAnalysis(docId);
      setActionNotice({
        type: "success",
        message: `Analysis job triggered successfully (Job ID: ${job.id || "Active"}). Redirecting to analysis...`,
      });
      setTimeout(() => {
        navigate(`/analysis?job_id=${job.id || ""}&doc_id=${docId}`);
      }, 1000);
    } catch (err) {
      console.error("Failed to trigger analysis:", err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Error initiating analysis job.";
      setActionNotice({ type: "error", message: detail });
    }
  };

  // Mock portfolio charts data for visual richness
  const exposureData = [
    { name: "Property Cat", exposure: 420, risk: 72 },
    { name: "Casualty", exposure: 310, risk: 54 },
    { name: "Marine & Energy", exposure: 180, risk: 65 },
    { name: "Aviation", exposure: 140, risk: 48 },
    { name: "Financial Lines", exposure: 220, risk: 81 },
  ];

  const riskDistribution = [
    { name: "Low Risk (<50)", value: 18, color: "#10B981" },
    { name: "Moderate (50-74)", value: 24, color: "#F59E0B" },
    { name: "High / Critical (75+)", value: 6, color: "#EF4444" },
  ];

  const metrics = {
    activeTreaties: documents.length > 0 ? documents.length : 48,
    activeTreatiesChange: "+12% MoM",
    avgRiskScore: 68.4,
    avgRiskLabel: "Moderate Exposure",
    flaggedClauses: 14,
    flaggedLabel: "Requires Underwriter Review",
    jobsCompleted: 128,
    jobsLabel: "100% Audit Tracked",
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <RiskMetricGroup metrics={metrics} />

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          role="status"
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
            actionNotice.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : actionNotice.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-sky-50 border-sky-200 text-sky-800"
          }`}
        >
          <span>{actionNotice.message}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="font-bold underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate("/documents")}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#0284C7] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-sky-50 text-[#0284C7] rounded-lg group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F2744]">
                Document Ingestion
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload treaties, slips & claims logs (PDF/DOCX/CSV)
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate("/analysis")}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#0284C7] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F2744]">
                Treaty Risk Analysis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review clause evaluations, non-standard flags & scores
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate("/decisions")}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#0284C7] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F2744]">
                Decision Workspace
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Underwriter sign-off, clause comparisons & subjectivities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Analysis Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exposure Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#0F2744]" />
              <h3 className="text-sm font-bold text-[#0F2744]">
                Reinsurance Portfolio Exposure ($M USD) by Line
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Q2 2026 Portfolio
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={exposureData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F2744",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#38BDF8" }}
                />
                <Bar
                  dataKey="exposure"
                  fill="#1E3A8A"
                  radius={[4, 4, 0, 0]}
                  name="Exposure ($M)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-[#0F2744]" />
              <h3 className="text-sm font-bold text-[#0F2744]">
                Treaty Risk Tier Split
              </h3>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {riskDistribution.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center text-slate-600"
              >
                <span className="flex items-center">
                  <span
                    className="w-2.5 h-2.5 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">
                  {item.value} Treaties
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Treaties Table */}
      <TreatyTable
        documents={documents}
        loading={loading}
        onTriggerAnalysis={handleTriggerAnalysis}
      />
    </div>
  );
}
