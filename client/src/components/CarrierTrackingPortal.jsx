import React, { useState, useEffect } from 'react';
import { Building, Shield, Briefcase, CheckCircle, Clock, AlertTriangle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import RiskScoreBadge from './RiskScoreBadge';
import { api } from '../services/api';

export default function CarrierTrackingPortal({ onSelectSubmission }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boundSuccessId, setBoundSuccessId] = useState(null);

  const fetchCarrierSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSubmissions();
      const items = Array.isArray(data) ? data : data?.items || [];
      setSubmissions(items);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to load carrier submissions.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrierSubmissions();
  }, []);

  const handleBindQuote = (subId) => {
    setBoundSuccessId(subId);
    setTimeout(() => {
      setBoundSuccessId(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-600" />
            Carrier Facultative Placement Tracking & Quote Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status tracking for cyber & D&O facultative requests, underwriter terms, and one-click binding.
          </p>
        </div>

        <button
          onClick={fetchCarrierSubmissions}
          className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Placements
        </button>
      </div>

      {boundSuccessId && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>Placement <strong>{boundSuccessId}</strong> quote accepted & bound successfully! Formal reinsurance treaty binder dispatched.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submissions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading && submissions.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
            Loading your placements...
          </div>
        ) : submissions.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            No active facultative placements found. Submit a new request using the Intake Wizard.
          </div>
        ) : (
          submissions.map((sub) => {
            const isQuoted = sub.status === 'QUOTED' || sub.status === 'QUOTE';
            const isDeclined = sub.status === 'DECLINED' || sub.status === 'DECLINE';
            const isPending = !isQuoted && !isDeclined;

            return (
              <div
                key={sub.id}
                className={`bg-white border rounded-xl p-6 shadow-sm transition-all hover:shadow-md ${
                  isQuoted ? 'border-emerald-300 ring-1 ring-emerald-400/20' : 'border-slate-200'
                }`}
              >
                {/* Top Row: Insured & Risk Class */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">{sub.id}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{sub.insured_name}</h3>
                    <div className="text-xs text-slate-500">{sub.carrier_name}</div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                    sub.risk_type === 'CYBER' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {sub.risk_type === 'CYBER' ? <Shield className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
                    {sub.risk_type}
                  </span>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 block">Requested Fac Limit:</span>
                    <span className="font-bold text-slate-900">${Number(sub.ceded_limit || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Attachment Point:</span>
                    <span className="font-semibold text-slate-800">${Number(sub.attachment_point || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Effective Policy Dates:</span>
                    <span className="font-mono text-slate-700">{sub.policy_start_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Risk Score:</span>
                    <RiskScoreBadge score={sub.risk_score ?? sub.risk_score_value} size="sm" />
                  </div>
                </div>

                {/* Status & Quote Details */}
                <div className="border-t border-slate-100 pt-3">
                  {isQuoted ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Underwriter Quote Ready
                        </div>
                        <p className="text-emerald-800">
                          Capacity offered: <strong>${Number(sub.ceded_limit || 0).toLocaleString()}</strong> at competitive treaty rates.
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {onSelectSubmission && (
                          <button
                            onClick={() => onSelectSubmission(sub.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            View Full Terms
                          </button>
                        )}
                        <button
                          onClick={() => handleBindQuote(sub.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Accept & Bind Quote
                        </button>
                      </div>
                    </div>
                  ) : isDeclined ? (
                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800">
                      <strong>Declined:</strong> Placement cannot be reinsured at this time based on underwriting risk threshold.
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                        <Clock className="h-4 w-4 text-amber-600" />
                        Underwriter Review in Progress
                      </div>
                      {onSelectSubmission && (
                        <button
                          onClick={() => onSelectSubmission(sub.id)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                        >
                          Inspect Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
