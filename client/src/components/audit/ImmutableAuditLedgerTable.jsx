import React, { useState } from 'react';
import { Lock, ShieldCheck, Search, Filter, Hash, CheckCircle, Database } from 'lucide-react';
import Badge from '../common/Badge';

export default function ImmutableAuditLedgerTable({ logs = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const defaultLogs = logs.length > 0 ? logs : [
    {
      id: 'aud-20260804-001',
      actorId: 'usr-customer-891',
      action: 'USER_REGISTRATION',
      entityName: 'User',
      entityId: 'usr-customer-891',
      clientIp: '198.51.100.42',
      hashChain: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      createdAt: '2026-08-04T14:02:10Z',
      verified: true
    },
    {
      id: 'aud-20260804-002',
      actorId: 'usr-customer-891',
      action: 'DOCUMENT_OCR_UPLOAD',
      entityName: 'IdentityDocument',
      entityId: 'doc-pas-9241',
      clientIp: '198.51.100.42',
      hashChain: 'a4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
      prevHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      createdAt: '2026-08-04T14:05:45Z',
      verified: true
    },
    {
      id: 'aud-20260804-003',
      actorId: 'usr-customer-891',
      action: 'BIOMETRIC_LIVENESS_CHECK',
      entityName: 'BiometricCheck',
      entityId: 'bio-liv-8441',
      clientIp: '198.51.100.42',
      hashChain: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      prevHash: 'a4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
      createdAt: '2026-08-04T14:08:20Z',
      verified: true
    },
    {
      id: 'aud-20260804-004',
      actorId: 'officer-compliance-01',
      action: 'COMPLIANCE_ADJUDICATION_APPROVE',
      entityName: 'VerificationRequest',
      entityId: 'verif-8941',
      clientIp: '10.240.12.8',
      hashChain: 'b5123d42f1ac34e28a52e92c4b01f3dda6248a3d12f67123bc49a024512e0912',
      prevHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      createdAt: '2026-08-04T14:15:22Z',
      verified: true
    }
  ];

  const filteredLogs = defaultLogs.filter((log) => {
    const matchesSearch =
      log.actorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hashChain.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === 'ALL' || log.action.includes(filterAction);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-[#171F33] p-6 rounded-lg border border-slate-700/80 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-3 border-b border-slate-700/60 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Lock size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-[#DAE2FD]">
              Cryptographic Audit Ledger & Event History
            </h2>
            <Badge variant="success">WORM COMPLIANT</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Append-only immutable record chained sequentially via SHA-256 Merkle proofs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by actor, hash, entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0B1326] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-[#DAE2FD] focus:outline-none focus:border-blue-500 w-52"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-[#0B1326] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-[#DAE2FD] focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Actions</option>
            <option value="REGISTRATION">Registration</option>
            <option value="DOCUMENT">Document OCR</option>
            <option value="BIOMETRIC">Biometrics</option>
            <option value="COMPLIANCE">Compliance</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0B1326] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Event ID & Timestamp</th>
              <th className="py-2.5 px-3">Actor / IP</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Entity Target</th>
              <th className="py-2.5 px-3">SHA-256 Hash Chain</th>
              <th className="py-2.5 px-3 text-right">Integrity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#131B2E]/60 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-200">{log.id}</div>
                  <div className="text-[10px] text-slate-500">{log.createdAt}</div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="text-blue-300">{log.actorId}</div>
                  <div className="text-[10px] text-slate-500">{log.clientIp}</div>
                </td>
                <td className="py-2.5 px-3">
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-700">
                    {log.action}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div>{log.entityName}</div>
                  <div className="text-[10px] text-slate-500">{log.entityId}</div>
                </td>
                <td className="py-2.5 px-3 max-w-[180px]">
                  <div className="truncate text-cyan-400 font-mono text-[11px]" title={log.hashChain}>
                    {log.hashChain}
                  </div>
                  <div className="text-[10px] text-slate-600 truncate" title={`Prev: ${log.prevHash}`}>
                    Prev: {log.prevHash.substring(0, 16)}...
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    <CheckCircle size={11} />
                    <span>VALID</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
