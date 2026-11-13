import React, { useState } from "react";
import { Filter, Search, X, Cpu } from "lucide-react";

export default function AgentConsole({ logs = [], isOpen, onClose }) {
  const [filterAgent, setFilterAgent] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const validLogs = Array.isArray(logs) ? logs : [];
  const agentsList = [
    "ALL",
    ...new Set(validLogs.map((l) => l?.agent).filter(Boolean)),
  ];

  const filteredLogs = validLogs.filter((log) => {
    if (!log) return false;
    const matchesAgent = filterAgent === "ALL" || log.agent === filterAgent;
    const q = (searchQuery || "").toLowerCase();
    const msg = (log.message || "").toLowerCase();
    const agt = (log.agent || "").toLowerCase();
    const cit = (log.citation || "").toLowerCase();

    const matchesQuery =
      q === "" || msg.includes(q) || agt.includes(q) || cit.includes(q);
    return matchesAgent && matchesQuery;
  });

  return (
    <div className="fixed bottom-0 right-0 left-64 bg-slate-950/95 border-t border-slate-800 text-slate-200 z-50 shadow-2xl backdrop-blur-md transition-all h-80 flex flex-col">
      {/* Console Header */}
      <div className="h-11 border-b border-slate-800 flex items-center justify-between px-5 bg-slate-900/90 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-teal-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>Master Orchestrator • Agent Reasoning Stream</span>
          </div>
          <span className="text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-full font-mono">
            {filteredLogs.length} Events Logged
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Agent Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-slate-800 text-[11px] text-slate-200 border border-slate-700 rounded px-2 py-0.5 focus:outline-none"
            >
              {agentsList.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
            <input
              type="text"
              placeholder="Search reasoning or citations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 text-[11px] text-slate-200 pl-7 pr-3 py-0.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 w-52"
            />
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs">
        {filteredLogs.map((log, lIdx) => {
          if (!log) return null;
          return (
            <div
              key={log.id || lIdx}
              className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-3"
            >
              <div className="flex-shrink-0 text-[10px] text-slate-400 mt-0.5 font-semibold">
                [{log.timestamp || "10:00:00"}]
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-teal-300 text-xs">
                    {log.agent || "Agent"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                    {log.type || "Event"}
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    Confidence: {log.confidence || 98}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Latency: {log.latency || "120ms"}
                  </span>
                </div>
                <p className="text-slate-200 text-xs font-sans leading-relaxed">
                  {log.message || "Simulated agent reasoning log."}
                </p>
                {log.citation && (
                  <div className="mt-1 text-[11px] text-teal-400/90 font-mono">
                    ↳ Citation:{" "}
                    <span className="underline decoration-teal-600/50">
                      {log.citation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
