export interface MigrationJob {
  jobId: string;
  reportId: string;
  reportTitle: string;
  scheduledTime: string;
  priority: 'P1 - High' | 'P2 - Normal' | 'P3 - Low';
  approvalStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';
  approvedBy?: string;
  executionStatus: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  progressPercentage: number;
  recordsMigrated: number;
  totalRecords: number;
  errorCount: number;
}

export interface MigrationLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  phase: 'EXTRACT' | 'TRANSFORM' | 'VALIDATE' | 'INGEST' | 'VERIFY';
  message: string;
  details?: string;
}

export interface ExecutiveKPIs {
  totalReports: number;
  discoveredCount: number;
  transformedCount: number;
  validatedCount: number;
  migratedCount: number;
  criticalExceptions: number;
  overallCompletionPercentage: number;
  migrationVelocityDaily: number;
  targetDate: string;
}

export interface StatusBreakdownItem {
  businessUnit: string;
  total: number;
  discovered: number;
  transformed: number;
  validated: number;
  migrated: number;
  percentage: number;
}

export interface PlatformCapabilityItem {
  capability: string;
  citiVelocity: string;
  citiDirect: string;
  migrationReadiness: 'FULL' | 'PARTIAL' | 'ENHANCED';
  notes: string;
}

export interface ExceptionItem {
  id: string;
  reportId: string;
  reportTitle: string;
  category: 'SCHEMA_MISMATCH' | 'BROKEN_DEPENDENCY' | 'PERMISSIONS_DENIED' | 'SYNTAX_UNSUPPORTED';
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  message: string;
  occurredAt: string;
  assignedTo: string;
}
