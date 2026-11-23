import React, { useState } from 'react';
import { ShieldAlert, FileText, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';
import FlaggedApplicationsQueue from '../components/compliance/FlaggedApplicationsQueue';
import EvidenceInspector from '../components/compliance/EvidenceInspector';
import AdjudicationDock from '../components/compliance/AdjudicationDock';
import MetricCard from '../components/common/MetricCard';

export default function ComplianceDashboardPage() {
  const [selectedCase, setSelectedCase] = useState({
    id: 'KYC-2026-8941',
    applicantName: 'Marcus Vance',
    submittedAt: '12 mins ago',
    documentType: 'PASSPORT (GBR)',
    docNumber: '928410294',
    dob: '1984-06-22',
    address: '42 Belgrave Square, London SW1X 8PZ',
    riskScore: 78,
    discrepancies: [
      {
        field: 'PEP / Sanction Screening',
        severity: 'HIGH',
        detail: 'Name matches Politically Exposed Person registry (Tier 3 relative).'
      },
      {
        field: 'Issuing Country vs IP Geo',
        severity: 'MEDIUM',
        detail: 'Document issued in GBR, application submitted via VPN egress in DEU.'
      }
    ]
  });

  const handleCaseSelect = (caseItem) => {
    setSelectedCase({
      ...caseItem,
      documentType: caseItem.documentType || 'PASSPORT (GBR)',
      docNumber: caseItem.docNumber || '928410294',
      dob: caseItem.dob || '1984-06-22',
      address: caseItem.address || '42 Belgrave Square, London SW1X 8PZ',
      discrepancies: caseItem.discrepancies || [
        {
          field: 'Risk Trigger',
          severity: caseItem.riskScore > 75 ? 'HIGH' : 'MEDIUM',
          detail: caseItem.flagReason || 'Flagged for compliance review.'
        }
      ]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131B2E] p-6 rounded-lg border border-slate-700/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert size={20} />
            </span>
            <h1 className="text-xl font-bold text-[#DAE2FD]">
              Compliance Officer Adjudication Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manual triage queue, optical forensic review, and decisioning dock for flagged identity applications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded text-xs font-mono border border-emerald-500/30">
            Active Officer: officer-compliance-01
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Flagged Queue"
          value="14 Cases"
          subtitle="Pending manual triage"
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="P95 Triage Latency"
          value="4.2 mins"
          subtitle="Target: < 10 mins SLA"
          icon={Clock}
          variant="primary"
        />
        <MetricCard
          title="Auto-Approval Rate"
          value="89.4%"
          subtitle="First-pass STP rate"
          icon={CheckCircle}
          variant="accent"
        />
        <MetricCard
          title="Sanction Hits (24h)"
          value="3 Detected"
          subtitle="OFAC / UN / EU match"
          icon={ShieldAlert}
          variant="danger"
        />
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <FlaggedApplicationsQueue
            selectedCaseId={selectedCase?.id}
            onSelectCase={handleCaseSelect}
          />
        </div>

        <div className="lg:col-span-7 space-y-6">
          <EvidenceInspector caseData={selectedCase} />
          <AdjudicationDock verificationId={selectedCase?.id} />
        </div>
      </div>
    </div>
  );
}
