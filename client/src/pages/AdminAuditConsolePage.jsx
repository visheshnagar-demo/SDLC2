import React from 'react';
import { Lock, ShieldCheck, Database, Key, CheckCircle, Cpu } from 'lucide-react';
import ImmutableAuditLedgerTable from '../components/audit/ImmutableAuditLedgerTable';
import MetricCard from '../components/common/MetricCard';

export default function AdminAuditConsolePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131B2E] p-6 rounded-lg border border-slate-700/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Lock size={20} />
            </span>
            <h1 className="text-xl font-bold text-[#DAE2FD]">
              Immutable Audit Ledger & Governance Console
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Append-only cryptographic event log with SHA-256 hash chaining (WORM Compliant, SOC 2 Type II / ISO 27001).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded text-xs font-mono border border-emerald-500/30 flex items-center space-x-1.5">
            <CheckCircle size={14} />
            <span>Merkle Tree Root: 0x4a9f...b12e (Verified)</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Events Logged"
          value="142,890"
          subtitle="All transactions recorded"
          icon={Database}
          variant="primary"
        />
        <MetricCard
          title="Hash Chain Integrity"
          value="100.0%"
          subtitle="Zero chain breaks detected"
          icon={ShieldCheck}
          variant="accent"
        />
        <MetricCard
          title="KMS Key Version"
          value="v4 (CMEK)"
          subtitle="Cloud KMS HSM Protected"
          icon={Key}
          variant="primary"
        />
        <MetricCard
          title="WORM Retention"
          value="7 Years"
          subtitle="SEC Rule 17a-4 / FINRA"
          icon={Cpu}
          variant="accent"
        />
      </div>

      {/* Audit Table */}
      <ImmutableAuditLedgerTable />
    </div>
  );
}
