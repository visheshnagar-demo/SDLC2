import React from 'react';
import { Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function MRZInspectorTerminal({ mrzData, checksumValid = true }) {
  const defaultLine1 = mrzData?.line1 || 'P<USAEXAMP<<ALEXANDER<JAMES<<<<<<<<<<<<<<<';
  const defaultLine2 = mrzData?.line2 || '1234567890USA9001014M3001018<<<<<<<<<<<<<<02';

  return (
    <div className="bg-[#0B1326] rounded-lg border border-slate-700/80 p-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-slate-300">
          <Terminal size={14} className="text-cyan-400" />
          <span className="font-bold tracking-wide">ICAO 9303 MRZ PARSER</span>
        </div>
        <div className="flex items-center space-x-1.5">
          {checksumValid ? (
            <>
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-[11px]">MOD-10 CHECKSUM PASS</span>
            </>
          ) : (
            <>
              <AlertTriangle size={13} className="text-amber-400" />
              <span className="text-amber-400 font-semibold text-[11px]">CHECKSUM MISMATCH</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1 bg-black/40 p-2.5 rounded border border-slate-800/80 text-cyan-300">
        <div className="tracking-widest overflow-x-auto whitespace-nowrap">{defaultLine1}</div>
        <div className="tracking-widest overflow-x-auto whitespace-nowrap">{defaultLine2}</div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
        <div>
          <span className="text-slate-500 block">Doc Type</span>
          <span className="text-slate-200 font-semibold">{mrzData?.docType || 'PASSPORT (P)'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Issuer</span>
          <span className="text-slate-200 font-semibold">{mrzData?.issuer || 'USA'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Doc Number</span>
          <span className="text-slate-200 font-semibold">{mrzData?.docNumber || '123456789'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Expiration</span>
          <span className="text-slate-200 font-semibold">{mrzData?.expiry || '2030-01-01'}</span>
        </div>
      </div>
    </div>
  );
}
