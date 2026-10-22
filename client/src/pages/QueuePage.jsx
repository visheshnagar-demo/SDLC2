import React from "react";
import UnderwriterQueueTable from "../components/queue/UnderwriterQueueTable";
import { Layers } from "lucide-react";

export default function QueuePage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-7 h-7 text-primary" />
          <span>Specialty Reinsurance Underwriter Review Queue</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, triage, risk-score, and quote facultative reinsurance
          submissions with real-time SLA aging monitors.
        </p>
      </div>

      <UnderwriterQueueTable />
    </div>
  );
}
