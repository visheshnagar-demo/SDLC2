import React from "react";

const STATUS_STYLES = {
  Received: "bg-blue-50 text-blue-700 border-blue-200",
  "In Review": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Info Requested": "bg-amber-50 text-amber-700 border-amber-200",
  Referred: "bg-purple-50 text-purple-700 border-purple-200",
  Quoted: "bg-teal-50 text-teal-700 border-teal-200",
  Bound: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold",
  Declined: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function StatusBadge({ status }) {
  const style =
    STATUS_STYLES[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {status === "Referred" && "🔒 "}
      {status === "Bound" && "✓ "}
      {status}
    </span>
  );
}
