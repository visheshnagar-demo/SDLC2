import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckSquare,
  ShieldCheck,
  History,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import SideBySideClauseDiff from "../components/decisions/SideBySideClauseDiff";
import UnderwriterDecisionForm from "../components/decisions/UnderwriterDecisionForm";
import { api } from "../services/api";

export default function DecisionWorkspacePage() {
  const [searchParams] = useSearchParams();
  const docIdParam = searchParams.get("doc_id");

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(docIdParam || "");
  const [selectedClause, setSelectedClause] = useState(null);
  const [recentDecisions, setRecentDecisions] = useState([
    {
      id: "dec-1",
      treaty: "Swiss Re Property Cat Treaty 2026",
      decision: "CONDITIONAL_APPROVAL",
      underwriter: "UW-8842",
      date: "Today, 14:15",
      subjectivity: "Subject to 10% net retention warranty endorsement.",
    },
    {
      id: "dec-2",
      treaty: "Munich Re Aviation Excess Liability Slip",
      decision: "APPROVED",
      underwriter: "UW-9014",
      date: "Yesterday, 16:30",
      subjectivity: "Standard terms signed without alterations.",
    },
    {
      id: "dec-3",
      treaty: "Lloyds Syndicate 2003 Cyber Risk Treaty",
      decision: "DECLINED",
      underwriter: "UW-7421",
      date: "Oct 18, 2026",
      subjectivity: "State-sponsored cyber attack exclusion missing.",
    },
  ]);

  useEffect(() => {
    api
      .getDocuments()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data.items || data.documents || [];
        setDocuments(list);
        if (!selectedDocId && list.length > 0) {
          setSelectedDocId(list[0].id);
        }
      })
      .catch((e) => console.warn(e));
  }, []);

  const handleDecisionRecorded = (newDecision) => {
    const formatted = {
      id: newDecision.id || `dec-${Date.now()}`,
      treaty: selectedDocId || "Current Treaty Document",
      decision: newDecision.decision || "RECORDED",
      underwriter: newDecision.underwriter_id || "UW-8842",
      date: "Just now",
      subjectivity:
        newDecision.subjectivities ||
        newDecision.reviewer_notes ||
        "Sign-off complete",
    };
    setRecentDecisions([formatted, ...recentDecisions]);
  };

  const getDecisionBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            APPROVED
          </span>
        );
      case "CONDITIONAL_APPROVAL":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            CONDITIONAL
          </span>
        );
      case "DECLINED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
            DECLINED
          </span>
        );
      case "REFERRED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            REFERRED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Banner */}
      <header className="flex items-center justify-between bg-[#0F2744] text-white p-5 rounded-xl shadow-md">
        <div className="flex items-center space-x-3">
          <img src="/GENRE.svg" alt="Gen Re Logo" className="h-8 w-auto" />
          <div className="h-5 w-px bg-slate-600"></div>
          <div>
            <h1 className="text-lg font-bold">
              Underwriter Decision & Sign-off Workspace
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Review side-by-side deviations, append binding conditions
              precedent, and record final treaty authority
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-[#1E3A8A] px-3.5 py-1.5 rounded-lg border border-sky-500/30 text-xs">
          <ShieldCheck className="w-4 h-4 text-sky-300" />
          <span>CUO Delegated Authority</span>
        </div>
      </header>

      {/* Side-by-Side Clause Diff */}
      <SideBySideClauseDiff clause={selectedClause} />

      {/* Sign-off Form */}
      <UnderwriterDecisionForm
        documentId={selectedDocId}
        initialDocuments={documents}
        onDecisionSuccess={handleDecisionRecorded}
      />

      {/* Recent Audit & Decision Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-[#0F2744]" />
          <h3 className="text-base font-bold text-[#0F2744]">
            Recent Underwriting Sign-offs & Decisions
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {recentDecisions.map((item) => (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800">
                    {item.treaty}
                  </span>
                  {getDecisionBadge(item.decision)}
                </div>
                {item.subjectivity && (
                  <p className="text-slate-500 text-[11px] italic">
                    {item.subjectivity}
                  </p>
                )}
              </div>
              <div className="text-right sm:shrink-0 text-[11px] text-slate-400 font-mono">
                <p className="text-slate-700 font-medium">{item.underwriter}</p>
                <p>{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
