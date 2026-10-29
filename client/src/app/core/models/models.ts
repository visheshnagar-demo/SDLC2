export type MigrationStatus =
  | 'DISCOVERED'
  | 'TRANSFORMED'
  | 'VALIDATED'
  | 'MIGRATED'
  | 'IN_PROGRESS'
  | 'FAILED'
  | 'PENDING_APPROVAL'
  | 'SCHEDULED';

export type ComplexityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface LegacyReport {
  id: string;
  title: string;
  sourceSystem: string; // e.g. CitiVelocity, Crystal Reports, Sybase SQL
  targetSystem: string; // CitiDirect Common Data Model (CDM)
  businessUnit: string; // Markets, Treasury, Trade, Global Wealth, Securities
  complexityScore: ComplexityLevel;
  readinessScore: number; // 0-100
  status: MigrationStatus;
  owner: string;
  lastRunDate: string;
  dependencyCount: number;
  reportType: 'Tabular' | 'Dashboard' | 'Scheduled Feed' | 'Ad-hoc Analytical';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Real-time';
  tags: string[];
}

export interface ReportDependencyNode {
  id: string;
  name: string;
  type: 'UPSTREAM_FEED' | 'DATABASE_VIEW' | 'TRANSFORMATION_JOB' | 'DOWNSTREAM_API' | 'DOWNSTREAM_DASHBOARD';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  details: string;
}

export interface ReportDetail extends LegacyReport {
  sqlQuery: string;
  generatedCdmSchema: string;
  description: string;
  upstreamFeeds: ReportDependencyNode[];
  downstreamConsumers: ReportDependencyNode[];
}

export interface CdmFieldMapping {
  fieldId: string;
  sourceField: string;
  sourceType: string;
  targetCdmField: string;
  targetType: string;
  transformationRule: string;
  confidenceScore: number; // 0-100
  status: 'AUTO_MAPPED' | 'MANUAL_REVIEW' | 'VERIFIED' | 'REJECTED';
}

export interface TransformWorkspaceData {
  reportId: string;
  reportTitle: string;
  sourceSql: string;
  generatedTypeScriptSchema: string;
  aiConfidence: number;
  mappings: CdmFieldMapping[];
}

export interface ValidationCheckItem {
  id: string;
  name: string;
  category: 'METADATA' | 'RULE_CHECKS' | 'DEPENDENCIES' | 'DATA_INTEGRITY';
  passed: boolean;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  timestamp: string;
}

export interface ValidationReportItem {
  reportId: string;
  reportTitle: string;
  overallPassed: boolean;
  score: number;
  metadataChecks: ValidationCheckItem[];
  ruleChecks: ValidationCheckItem[];
  dependencyChecks: ValidationCheckItem[];
  previewAvailable: boolean;
  previewData?: Record<string, any>[];
  exceptionCount: number;
  status: MigrationStatus;
}

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
