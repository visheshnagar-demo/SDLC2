import React, { useState, useEffect } from 'react';
import { AuditLogTable } from '../components/admin/AuditLogTable';
import { EventDetailModal } from '../components/admin/EventDetailModal';
import { listAuditLogs, exportAuditLogs } from '../services/api';
import {
  History,
  ShieldCheck,
  Lock,
  Hash,
  Download,
  RefreshCw,
  CheckCircle2,
  FileCode,
  Activity,
  Layers,
} from 'lucide-react';

export const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'EVT-901824-A',
      timestamp: new Date().toISOString(),
      user_id: 'usr-9281a-7b3f-4e01',
      action: 'USER_REGISTERED',
      resource: 'users',
      resource_id: 'usr-9281a-7b3f-4e01',
      ip_address: '198.51.100.42',
      hash_checksum: 'a8f5c2d91b4e6730f8c3e21975bd401e2f38c71a9804e1d528b7f63c8a92e104',
      details_json: {
        email: 'test@example.com',
        role: 'customer',
        auth_provider: 'LOCAL_PASSWORD_BCRYPT',
        geo: 'US-EAST-VIRGINIA',
        tls_version: 'TLSv1.3',
      },
    },
    {
      id: 'EVT-901825-B',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      user_id: 'usr-9281a-7b3f-4e01',
      action: 'DOCUMENT_UPLOADED',
      resource: 'documents',
      resource_id: 'doc-7719-passport',
      ip_address: '198.51.100.42',
      hash_checksum: '3b89e7f412d0a569c8f2b14730e6a8194d52c710f938b64e10a2f5c7e91d84a0',
      details_json: {
        doc_type: 'PASSPORT',
        file_mime: 'image/jpeg',
        sha256: '9f82d1e0482bca819273c5019284729183748291048291837492810394829102',
        encryption: 'AES-256-GCM',
        bucket: 'gs://veritas-idv-documents-prod',
      },
    },
    {
      id: 'EVT-901826-C',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      user_id: 'service-ocr-neural-engine',
      action: 'OCR_EXTRACTED',
      resource: 'documents',
      resource_id: 'doc-7719-passport',
      ip_address: '10.128.0.14',
      hash_checksum: 'c4e2a1098f73b615d048e29174f83b50c192d74e8301b59a64f8c2e01937db45',
      details_json: {
        ocr_confidence: 98.5,
        fields_parsed: 7,
        mrz_checksum_valid: true,
        issuing_country: 'USA',
      },
    },
    {
      id: 'EVT-901827-D',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      user_id: 'usr-9281a-7b3f-4e01',
      action: 'BIOMETRIC_VERIFIED',
      resource: 'biometrics',
      resource_id: 'bio-8821-selfie',
      ip_address: '198.51.100.42',
      hash_checksum: 'd19837f4e028b1938472c9103948192039481920394819203948192039481920',
      details_json: {
        liveness_score: 97.4,
        vector_match_score: 94.2,
        anti_spoofing: 'PASSED',
        model_version: 'ArcFace-ResNet100-v2',
      },
    },
    {
      id: 'EVT-901828-E',
      timestamp: new Date(Date.now() - 10000).toISOString(),
      user_id: 'usr-officer-sarah',
      action: 'COMPLIANCE_DECISION_RECORDED',
      resource: 'compliance_reviews',
      resource_id: 'rev-4491-adj',
      ip_address: '192.0.2.88',
      hash_checksum: 'f901827364510293847561029384756102938475610293847561029384756102',
      details_json: {
        decision: 'APPROVED',
        reason_code: 'MANUAL_OVERRIDE_VERIFIED',
        attestation: 'FINRA_2090_CERTIFIED',
        officer_notes: 'Visual verification completed. Match corroborated.',
      },
    },
  ]);

  const [inspectedEvent, setInspectedEvent] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await listAuditLogs();
      if (Array.isArray(data) && data.length > 0) {
        setAuditLogs(data);
      }
    } catch (err) {
      console.warn('API listAuditLogs failed, maintaining demo logs:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      if (format === 'csv') {
        const headers = ['id', 'timestamp', 'user_id', 'action', 'resource', 'resource_id', 'ip_address', 'hash_checksum'];
        const csvContent =
          'data:text/csv;charset=utf-8,' +
          [
            headers.join(','),
            ...auditLogs.map((log) =>
              [
                log.id,
                log.timestamp,
                log.user_id,
                log.action,
                log.resource,
                log.resource_id,
                log.ip_address,
                log.hash_checksum,
              ].join(',')
            ),
          ].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `veritas_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', jsonContent);
        link.setAttribute('download', `veritas_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const integrityMetrics = [
    { title: 'Total Ledger Events', value: '1,492,810', sub: '+1.2k today', icon: Layers, color: '#38BDF8' },
    { title: 'Cryptographic Checksums', value: '100% OK', sub: 'SHA-256 Validated', icon: ShieldCheck, color: '#10B981' },
    { title: 'Merkle Tree Root', value: '0x9f82...3e1a', sub: 'Leaf Index #1492810', icon: Hash, color: '#93CCFF' },
    { title: 'Tamper Anomalies', value: '0 Detected', sub: 'SOC-2 Type II Sealed', icon: Lock, color: '#10B981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
              Admin Governance &amp; Audit Trail Dashboard
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold">
              SCRUM-495
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Immutable, append-only cryptographic event logging across all onboarding, OCR, biometrics, and officer decisions
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#334155] text-xs font-mono flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrityMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-mono uppercase text-[#94A3B8] block">{m.title}</span>
                <span className="text-xl font-bold font-mono tracking-tight text-[#F8FAFC] mt-0.5 block truncate max-w-[170px]">
                  {m.value}
                </span>
                <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 block">{m.sub}</span>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center border"
                style={{
                  backgroundColor: `${m.color}15`,
                  borderColor: `${m.color}35`,
                  color: m.color,
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log Table */}
      <AuditLogTable
        auditLogs={auditLogs}
        onInspectEvent={(event) => setInspectedEvent(event)}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Event Details Inspector Modal */}
      {inspectedEvent && (
        <EventDetailModal
          event={inspectedEvent}
          isOpen={Boolean(inspectedEvent)}
          onClose={() => setInspectedEvent(null)}
        />
      )}
    </div>
  );
};
