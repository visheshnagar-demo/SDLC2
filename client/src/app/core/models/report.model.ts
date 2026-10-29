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
