import React from 'react';
import { ShieldCheck, ShieldAlert, Database, AlertCircle, HardDrive } from 'lucide-react';

export default function CyberRiskDisclosures({ data = {}, onChange }) {
  const handleChange = (field, value) => {
    if (onChange) {
      onChange({
        ...data,
        [field]: value,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          Mandatory Cyber Security Controls & Exposure Disclosures
        </h4>
        <p className="text-xs text-blue-700 mt-1">
          Underwriting evaluation automatically analyzes multi-factor authentication (MFA), endpoint detection (EDR), and backup isolation controls to calculate the placement risk score.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MFA Enabled */}
        <label
          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
            data.mfa_enabled ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            name="mfa_enabled"
            checked={Boolean(data.mfa_enabled)}
            onChange={(e) => handleChange('mfa_enabled', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <span>MFA Enforced</span>
              {data.mfa_enabled ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">YES</span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">REQUIRED</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-factor authentication enforced for all remote access and administrative credentials.
            </p>
          </div>
        </label>

        {/* EDR Deployed */}
        <label
          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
            data.edr_deployed ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            name="edr_deployed"
            checked={Boolean(data.edr_deployed)}
            onChange={(e) => handleChange('edr_deployed', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <span>EDR Deployed</span>
              {data.edr_deployed ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">YES</span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">CHECK</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Endpoint Detection & Response (EDR) active across enterprise workstations and servers.
            </p>
          </div>
        </label>

        {/* Offline Backups */}
        <label
          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
            data.backups_offline ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            name="backups_offline"
            checked={Boolean(data.backups_offline)}
            onChange={(e) => handleChange('backups_offline', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <span>Air-gapped Backups</span>
              {data.backups_offline ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">YES</span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">CHECK</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable or offline backups tested quarterly against ransomware corruption.
            </p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="records_count" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Database className="h-4 w-4 text-slate-500" />
            Sensitive Records Count (PII / PHI / Financial)
          </label>
          <input
            id="records_count"
            type="number"
            min="0"
            value={data.records_count ?? ''}
            onChange={(e) => handleChange('records_count', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
            placeholder="e.g. 500000"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">Aggregate number of customer or employee records exposed in the digital environment.</p>
        </div>

        <div>
          <label htmlFor="prior_breach_count" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-slate-500" />
            Prior Security Incidents / Breaches (Last 3 Years)
          </label>
          <input
            id="prior_breach_count"
            type="number"
            min="0"
            value={data.prior_breach_count ?? ''}
            onChange={(e) => handleChange('prior_breach_count', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
            placeholder="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">Confirmed ransomware events, data exfiltration incidents, or wire fraud losses.</p>
        </div>
      </div>
    </div>
  );
}
