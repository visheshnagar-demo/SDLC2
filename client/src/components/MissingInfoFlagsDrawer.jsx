import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';

export default function MissingInfoFlagsDrawer({ isOpen, onClose, flags = [], submissionId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Missing Information Checklist
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified underwriting omissions and risk flags
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Flags List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {flags.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-800">All Disclosures Complete</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No missing information items or critical underwriting flags were detected for this submission.
              </p>
            </div>
          ) : (
            flags.map((flag, idx) => {
              const isHigh = flag.severity === 'HIGH' || flag.severity === 'CRITICAL';
              const isResolved = flag.is_resolved;

              return (
                <div
                  key={flag.id || `flag-${idx}`}
                  className={`p-4 rounded-lg border ${
                    isResolved
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : isHigh
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isHigh ? (
                        <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                      ) : (
                        <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {flag.flag_code || 'MISSING_FIELD'}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isResolved ? 'RESOLVED' : flag.severity || 'MEDIUM'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-900 mt-2">
                    {flag.description || `Required field '${flag.field_name}' is missing.`}
                  </p>

                  {flag.field_name && (
                    <div className="mt-2 text-xs text-slate-500">
                      Target Field: <code className="bg-white/80 px-1 py-0.5 rounded border border-slate-200 font-mono text-[11px]">{flag.field_name}</code>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {flags.filter(f => !f.is_resolved).length} active flags
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
