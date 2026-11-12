import React from 'react';
import { Briefcase, Scale, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

export default function DoRiskDisclosures({ data = {}, onChange }) {
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
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600" />
          Directors & Officers (D&O) Corporate Governance & Financial Disclosures
        </h4>
        <p className="text-xs text-indigo-700 mt-1">
          Automated evaluation models calculate risk weightings based on capital solvency leverage, executive C-suite turnover stability, and pending class-action/regulatory litigation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Debt-to-Equity Ratio */}
        <div>
          <label htmlFor="debt_to_equity_ratio" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            Debt-to-Equity Ratio
          </label>
          <input
            id="debt_to_equity_ratio"
            type="number"
            step="0.01"
            min="0"
            value={data.debt_to_equity_ratio ?? ''}
            onChange={(e) => handleChange('debt_to_equity_ratio', e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="e.g. 1.85"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">Total liabilities divided by total shareholder equity from latest audited balance sheet.</p>
        </div>

        {/* Executive Turnover Rate */}
        <div>
          <label htmlFor="executive_turnover_rate" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-slate-500" />
            Executive Turnover Rate (%)
          </label>
          <input
            id="executive_turnover_rate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={data.executive_turnover_rate ?? ''}
            onChange={(e) => handleChange('executive_turnover_rate', e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="e.g. 15.0"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">Percentage of C-suite executives and board directors replaced in the past 24 months.</p>
        </div>

        {/* Pending Litigation Count */}
        <div>
          <label htmlFor="pending_litigation_count" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-slate-500" />
            Active / Pending Litigation Count
          </label>
          <input
            id="pending_litigation_count"
            type="number"
            min="0"
            value={data.pending_litigation_count ?? ''}
            onChange={(e) => handleChange('pending_litigation_count', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
            placeholder="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">Material securities lawsuits, shareholder derivative actions, or regulatory investigations.</p>
        </div>
      </div>

      <div className="pt-2">
        <label
          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
            data.independent_board_charter ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            name="independent_board_charter"
            checked={Boolean(data.independent_board_charter)}
            onChange={(e) => handleChange('independent_board_charter', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <span>Independent Board Governance Charter</span>
              {data.independent_board_charter ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">CONFIRMED</span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">UNVERIFIED</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Attestation that at least 50% of the board of directors are independent and an autonomous audit/compensation committee is maintained.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
