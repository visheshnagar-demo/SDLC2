import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowRight,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function TreatyTable({
  documents = [],
  onTriggerAnalysis,
  loading = false,
}) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "analyzed":
      case "parsed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "processing":
      case "analyzing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200 animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case "failed":
      case "error":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            {status || "Pending"}
          </span>
        );
    }
  };

  const getRiskScoreBadge = (score) => {
    if (score === undefined || score === null) {
      return <span className="text-xs text-slate-400">Not Scored</span>;
    }
    const num = parseFloat(score);
    if (num >= 75) {
      return (
        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
          {num.toFixed(1)} / 100
        </span>
      );
    } else if (num >= 50) {
      return (
        <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {num.toFixed(1)} / 100
        </span>
      );
    } else {
      return (
        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {num.toFixed(1)} / 100
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="animate-spin w-8 h-8 border-4 border-[#0F2744] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm text-slate-500 font-medium">
          Loading reinsurance treaties...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-base font-bold text-[#0F2744]">
            Active Treaties & Submissions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingested documents and automated risk evaluations
          </p>
        </div>
        <button
          onClick={() => navigate("/documents")}
          className="text-xs font-semibold text-[#1E3A8A] hover:text-[#0F2744] flex items-center transition-colors"
        >
          <span>Ingest New Slip</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Document / Treaty Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Ingestion Status</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-slate-500 text-sm"
                >
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No documents found. Upload a treaty or claim document to
                  begin.
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const docId = doc.id || doc._id;
                const metadata = doc.extracted_metadata || {};
                const treatyName =
                  metadata.treaty_name ||
                  metadata.title ||
                  doc.file_name ||
                  "Reinsurance Treaty Slip";
                const riskScore =
                  doc.composite_risk_score || metadata.risk_score;

                return (
                  <tr
                    key={docId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-slate-100 text-[#0F2744] rounded-lg shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-snug">
                            {treatyName}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {doc.file_name || docId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      <span className="uppercase px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                        {doc.file_type || "PDF"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getRiskScoreBadge(riskScore)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString()
                        : "Today"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onTriggerAnalysis && (
                          <button
                            onClick={() => onTriggerAnalysis(docId)}
                            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-[#0F2744] text-white hover:bg-[#1E3A8A] transition-colors"
                            title="Trigger Agent Analysis"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Analyze
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/analysis?doc_id=${docId}`)}
                          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
