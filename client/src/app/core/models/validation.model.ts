import { MigrationStatus } from './report.model';

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
