import React from 'react';
import { AlertTriangle, CheckCircle, BellRing, FileQuestion } from 'lucide-react';

export default function MissingInfoAlertBanner({ flags = [] }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3 text-emerald-900">
        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">All Mandatory Information & Documents Complete</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            This submission satisfies all required underwriting data points and document attachments for its risk line.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm text-amber-900">
              Missing Underwriting Information Detected ({flags.length})
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              The automated flagging engine identified missing checklist items. Carrier has been notified to provide missing disclosures.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Carrier representative alert notification re-sent successfully.')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-sm"
        >
          <BellRing className="w-3.5 h-3.5" /> Request Info from Carrier
        </button>
      </div>

      <div className="space-y-2 pt-2 border-t border-amber-200/60">
        {flags.map((flag, idx) => (
          <div key={flag.id || idx} className="bg-white/80 p-3 rounded-lg border border-amber-200 flex items-start justify-between text-xs">
            <div className="flex items-start gap-2.5">
              <FileQuestion className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">{flag.field_name || flag.flag_type || 'Missing Document / Field'}:</span>
                <span className="text-slate-600 ml-1.5">{flag.description || flag.message || 'Required underwriting item missing.'}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px] uppercase">
              {flag.severity || 'REQUIRED'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
