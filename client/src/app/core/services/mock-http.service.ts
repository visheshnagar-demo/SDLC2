import { Injectable } from '@angular/core';
import { Observable, of, delay, interval, map, take } from 'rxjs';
import {
  ExecutiveKPIs,
  StatusBreakdownItem,
  PlatformCapabilityItem,
  ExceptionItem,
  LegacyReport,
  ReportDetail,
  TransformWorkspaceData,
  CdmFieldMapping,
  ValidationReportItem,
  MigrationJob,
  MigrationLogEntry
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class MockHttpService {
  private mockKPIs: ExecutiveKPIs = {
    totalReports: 204520,
    discoveredCount: 198400,
    transformedCount: 142100,
    validatedCount: 98650,
    migratedCount: 64200,
    criticalExceptions: 18,
    overallCompletionPercentage: 31.4,
    migrationVelocityDaily: 1450,
    targetDate: '2026-12-31'
  };

  private mockStatusBreakdown: StatusBreakdownItem[] = [
    { businessUnit: 'Markets & Securities Services', total: 68500, discovered: 68500, transformed: 52000, validated: 38000, migrated: 24500, percentage: 35.8 },
    { businessUnit: 'Treasury & Trade Solutions (TTS)', total: 54200, discovered: 52000, transformed: 41000, validated: 29000, migrated: 21200, percentage: 39.1 },
    { businessUnit: 'Global Wealth Management', total: 38400, discovered: 36500, transformed: 24500, validated: 16200, migrated: 9800, percentage: 25.5 },
    { businessUnit: 'Corporate Lending & Risk', total: 27900, discovered: 26000, transformed: 15800, validated: 9800, migrated: 5600, percentage: 20.1 },
    { businessUnit: 'Commercial Banking & FX', total: 15520, discovered: 15400, transformed: 8800, validated: 5650, migrated: 3100, percentage: 20.0 }
  ];

  private mockPlatformCapabilities: PlatformCapabilityItem[] = [
    { capability: 'Streaming Real-Time Feeds', citiVelocity: 'Sybase OpenServer Push', citiDirect: 'Kafka / WebSocket Reactive Streams', migrationReadiness: 'FULL', notes: 'Native 1:1 schema mapping in CDM' },
    { capability: 'Custom Aggregations & Formulas', citiVelocity: 'Crystal Formula Basic Syntax', citiDirect: 'TypeScript AST CDM Expression Engine', migrationReadiness: 'FULL', notes: 'Automated 94% AST conversion' },
    { capability: 'Multi-Entity Access Control', citiVelocity: 'Velocity Entitlement Matrix (VEM)', citiDirect: 'Citi IAM / OAuth2 Fine-Grained RBAC', migrationReadiness: 'FULL', notes: 'VEM rules automatically mapped to RBAC roles' },
    { capability: 'Export & Delivery Schedules', citiVelocity: 'FTP/SMTP Batches', citiDirect: 'CitiCloud Scheduler / SFTP / Webhook', migrationReadiness: 'FULL', notes: 'Target delivery configs generated' },
    { capability: 'Custom Macro Scripting', citiVelocity: 'VBA & Perl Plugins', citiDirect: 'Serverless Python CDM Transformation', migrationReadiness: 'PARTIAL', notes: 'Requires human review for legacy Perl scripts' }
  ];

  private mockExceptions: ExceptionItem[] = [
    { id: 'EX-9021', reportId: 'REP-10492', reportTitle: 'Daily Global FX Netting & Settlement Summary', category: 'SCHEMA_MISMATCH', severity: 'CRITICAL', message: 'Legacy field "SETTLE_CCY_CODE_OLD" missing in CitiDirect FX CDM standard', occurredAt: '2026-05-18 10:24', assignedTo: 'Data Governance Team' },
    { id: 'EX-9022', reportId: 'REP-10518', reportTitle: 'High-Value Wire Clearance Monitor', category: 'PERMISSIONS_DENIED', severity: 'HIGH', message: 'VEM Role "TREASURY_SUPERVISOR_L2" requires manual privilege mapping', occurredAt: '2026-05-18 11:05', assignedTo: 'Security Ops' },
    { id: 'EX-9023', reportId: 'REP-10640', reportTitle: 'Securities Lending Collateral Variance', category: 'SYNTAX_UNSUPPORTED', severity: 'MEDIUM', message: 'Custom Sybase stored procedure sp_calc_variance contains deprecated cursor loop', occurredAt: '2026-05-18 11:42', assignedTo: 'Migration Eng Team' },
    { id: 'EX-9024', reportId: 'REP-10702', reportTitle: 'APAC Liquidity Reserve Ratio Daily', category: 'BROKEN_DEPENDENCY', severity: 'HIGH', message: 'Upstream feed HKMA_FEED_V2 schema updated without manifest version bump', occurredAt: '2026-05-18 12:15', assignedTo: 'Integration Team' }
  ];

  private mockReports: LegacyReport[] = [
    { id: 'REP-10492', title: 'Daily Global FX Netting & Settlement Summary', sourceSystem: 'CitiVelocity (Sybase SQL)', targetSystem: 'CitiDirect CDM', businessUnit: 'Markets', complexityScore: 'HIGH', readinessScore: 88, status: 'TRANSFORMED', owner: 'Robert Langdon', lastRunDate: '2026-05-18 06:00', dependencyCount: 5, reportType: 'Tabular', frequency: 'Daily', tags: ['FX', 'Treasury', 'Regulatory'] },
    { id: 'REP-10518', title: 'High-Value Wire Clearance Monitor', sourceSystem: 'Crystal Reports 11', targetSystem: 'CitiDirect CDM', businessUnit: 'Treasury & Trade', complexityScore: 'CRITICAL', readinessScore: 74, status: 'PENDING_APPROVAL', owner: 'Elena Rostova', lastRunDate: '2026-05-18 07:30', dependencyCount: 8, reportType: 'Dashboard', frequency: 'Real-time', tags: ['High-Value', 'Wires', 'Clearance'] },
    { id: 'REP-10640', title: 'Securities Lending Collateral Variance', sourceSystem: 'CitiVelocity Analytics', targetSystem: 'CitiDirect CDM', businessUnit: 'Securities Services', complexityScore: 'MEDIUM', readinessScore: 95, status: 'VALIDATED', owner: 'Marcus Vance', lastRunDate: '2026-05-17 18:00', dependencyCount: 3, reportType: 'Tabular', frequency: 'Daily', tags: ['Securities', 'Collateral'] },
    { id: 'REP-10702', title: 'APAC Liquidity Reserve Ratio Daily', sourceSystem: 'CitiVelocity Feed', targetSystem: 'CitiDirect CDM', businessUnit: 'Treasury & Trade', complexityScore: 'HIGH', readinessScore: 68, status: 'DISCOVERED', owner: 'Sarah Chen', lastRunDate: '2026-05-18 04:00', dependencyCount: 6, reportType: 'Scheduled Feed', frequency: 'Daily', tags: ['APAC', 'Liquidity', 'HKMA'] },
    { id: 'REP-10815', title: 'Corporate Client Credit Exposure Matrix', sourceSystem: 'Sybase IQ / Business Objects', targetSystem: 'CitiDirect CDM', businessUnit: 'Corporate Lending', complexityScore: 'MEDIUM', readinessScore: 92, status: 'MIGRATED', owner: 'David Miller', lastRunDate: '2026-05-18 08:00', dependencyCount: 4, reportType: 'Dashboard', frequency: 'Weekly', tags: ['Credit', 'Risk', 'Exposure'] },
    { id: 'REP-10920', title: 'Global Wealth Discretionary Portfolio Performance', sourceSystem: 'CitiVelocity Wealth Portal', targetSystem: 'CitiDirect CDM', businessUnit: 'Global Wealth', complexityScore: 'LOW', readinessScore: 99, status: 'MIGRATED', owner: 'Amara Patel', lastRunDate: '2026-05-18 09:15', dependencyCount: 2, reportType: 'Ad-hoc Analytical', frequency: 'Daily', tags: ['Wealth', 'Portfolio', 'HNW'] },
    { id: 'REP-11004', title: 'EMEA Cross-Border Payment Status Feeder', sourceSystem: 'CitiVelocity Messaging', targetSystem: 'CitiDirect CDM', businessUnit: 'Treasury & Trade', complexityScore: 'MEDIUM', readinessScore: 84, status: 'IN_PROGRESS', owner: 'Jean-Luc Picard', lastRunDate: '2026-05-18 10:00', dependencyCount: 4, reportType: 'Scheduled Feed', frequency: 'Real-time', tags: ['EMEA', 'ISO20022', 'Payments'] }
  ];

  private mockJobs: MigrationJob[] = [
    { jobId: 'JOB-7001', reportId: 'REP-10518', reportTitle: 'High-Value Wire Clearance Monitor', scheduledTime: '2026-05-18 14:00', priority: 'P1 - High', approvalStatus: 'PENDING_APPROVAL', executionStatus: 'QUEUED', progressPercentage: 0, recordsMigrated: 0, totalRecords: 450000, errorCount: 0 },
    { jobId: 'JOB-7002', reportId: 'REP-11004', reportTitle: 'EMEA Cross-Border Payment Status Feeder', scheduledTime: '2026-05-18 13:30', priority: 'P2 - Normal', approvalStatus: 'APPROVED', approvedBy: 'Lead Architect (A. Vance)', executionStatus: 'RUNNING', progressPercentage: 68, recordsMigrated: 120000, totalRecords: 175000, errorCount: 0 },
    { jobId: 'JOB-7003', reportId: 'REP-10815', reportTitle: 'Corporate Client Credit Exposure Matrix', scheduledTime: '2026-05-18 08:30', priority: 'P2 - Normal', approvalStatus: 'APPROVED', approvedBy: 'Ops Manager (K. Smith)', executionStatus: 'COMPLETED', progressPercentage: 100, recordsMigrated: 89000, totalRecords: 89000, errorCount: 0 },
    { jobId: 'JOB-7004', reportId: 'REP-10920', reportTitle: 'Global Wealth Discretionary Portfolio Performance', scheduledTime: '2026-05-18 09:45', priority: 'P3 - Low', approvalStatus: 'AUTO_APPROVED', approvedBy: 'System AI Engine', executionStatus: 'COMPLETED', progressPercentage: 100, recordsMigrated: 24000, totalRecords: 24000, errorCount: 0 }
  ];

  // API 1: GET /api/v1/govern/stats
  getExecutiveKPIs(): Observable<ExecutiveKPIs> {
    return of({ ...this.mockKPIs }).pipe(delay(200));
  }

  // API 2: GET /api/v1/govern/report-groups
  getStatusBreakdown(): Observable<StatusBreakdownItem[]> {
    return of([...this.mockStatusBreakdown]).pipe(delay(200));
  }

  getPlatformCapabilities(): Observable<PlatformCapabilityItem[]> {
    return of([...this.mockPlatformCapabilities]).pipe(delay(150));
  }

  getExceptions(): Observable<ExceptionItem[]> {
    return of([...this.mockExceptions]).pipe(delay(150));
  }

  // API 3: GET /api/v1/discover/reports
  getReportCatalog(): Observable<LegacyReport[]> {
    return of([...this.mockReports]).pipe(delay(250));
  }

  getReportDetail(reportId: string): Observable<ReportDetail> {
    const rep = this.mockReports.find(r => r.id === reportId) || this.mockReports[0];
    const detail: ReportDetail = {
      ...rep,
      description: `Production legacy financial report migrated from CitiVelocity reporting cluster into CitiDirect Common Data Model. Supports real-time monitoring and regulatory submission.`,
      sqlQuery: `SELECT 
    t.trade_id AS TRADE_ID,
    t.settle_date AS SETTLE_DT,
    t.ccy_pair AS CCY_PAIR,
    SUM(t.notional_amount) AS NOTIONAL_AMT,
    t.counterparty_lei AS CP_LEI,
    c.credit_rating AS RATING
FROM VELOCITY_DB.TRADES_HIST t
JOIN VELOCITY_DB.COUNTERPARTY c ON t.cp_id = c.id
WHERE t.active_flag = 'Y' AND t.as_of_date >= DATEADD(day, -30, GETDATE())
GROUP BY t.trade_id, t.settle_date, t.ccy_pair, t.counterparty_lei, c.credit_rating
ORDER BY t.settle_date DESC;`,
      generatedCdmSchema: `export interface CitiDirectTradeSummary {
  tradeId: string;
  settlementDate: string; // ISO-8601
  currencyPair: string;
  notionalAmount: number;
  counterpartyLei: string;
  creditRating: string;
  cdmVersion: '4.2.0';
  migrationTimestamp: string;
}`,
      upstreamFeeds: [
        { id: 'FEED-01', name: 'VELOCITY_DB.TRADES_HIST', type: 'UPSTREAM_FEED', status: 'HEALTHY', details: 'Sybase Replication Stream (Latency < 250ms)' },
        { id: 'FEED-02', name: 'VELOCITY_DB.COUNTERPARTY', type: 'DATABASE_VIEW', status: 'HEALTHY', details: 'Daily Ref Data Snapshot (Sync 04:00 UTC)' },
        { id: 'FEED-03', name: 'KAFKA.FX_SETTLEMENT_EVENTS', type: 'UPSTREAM_FEED', status: 'HEALTHY', details: 'Event Stream Partition 0-7' }
      ],
      downstreamConsumers: [
        { id: 'CONS-01', name: 'CitiDirect Markets Executive Portal', type: 'DOWNSTREAM_DASHBOARD', status: 'HEALTHY', details: 'Real-time Angular UI Grid' },
        { id: 'CONS-02', name: 'Regulatory FX Reporting Engine (EMIR/Dodd-Frank)', type: 'DOWNSTREAM_API', status: 'HEALTHY', details: 'Daily automated payload dispatch' },
        { id: 'CONS-03', name: 'Risk & Collateral Management Gateway', type: 'DOWNSTREAM_API', status: 'WARNING', details: 'Awaiting CDM v4.2 contract sync' }
      ]
    };
    return of(detail).pipe(delay(200));
  }

  // API 4: GET /api/v1/transform/{reportId}/mappings & workspace
  getTransformWorkspace(reportId: string): Observable<TransformWorkspaceData> {
    const rep = this.mockReports.find(r => r.id === reportId) || this.mockReports[0];
    const mappings: CdmFieldMapping[] = [
      { fieldId: 'F-101', sourceField: 'TRADE_ID', sourceType: 'VARCHAR(32)', targetCdmField: 'tradeId', targetType: 'string (UUID)', transformationRule: 'LOWERCASE_TRIM_UUID', confidenceScore: 99, status: 'AUTO_MAPPED' },
      { fieldId: 'F-102', sourceField: 'SETTLE_DT', sourceType: 'DATETIME', targetCdmField: 'settlementDate', targetType: 'string (ISO8601)', transformationRule: 'TO_ISO_DATE_STRING', confidenceScore: 98, status: 'AUTO_MAPPED' },
      { fieldId: 'F-103', sourceField: 'CCY_PAIR', sourceType: 'CHAR(6)', targetCdmField: 'currencyPair', targetType: 'string (ISO4217)', transformationRule: 'UPPER_ISO_PAIR', confidenceScore: 97, status: 'AUTO_MAPPED' },
      { fieldId: 'F-104', sourceField: 'NOTIONAL_AMT', sourceType: 'NUMERIC(18,4)', targetCdmField: 'notionalAmount', targetType: 'number (BigDecimal)', transformationRule: 'PARSE_BIGDECIMAL_ROUND2', confidenceScore: 95, status: 'AUTO_MAPPED' },
      { fieldId: 'F-105', sourceField: 'CP_LEI', sourceType: 'VARCHAR(20)', targetCdmField: 'counterpartyLei', targetType: 'string (LEI20)', transformationRule: 'VALIDATE_LEI_CHECKSUM', confidenceScore: 94, status: 'AUTO_MAPPED' },
      { fieldId: 'F-106', sourceField: 'RATING', sourceType: 'VARCHAR(8)', targetCdmField: 'creditRating', targetType: 'string (S&P/Moody)', transformationRule: 'NORMALIZE_RATING_SCALE', confidenceScore: 89, status: 'MANUAL_REVIEW' }
    ];

    const data: TransformWorkspaceData = {
      reportId: rep.id,
      reportTitle: rep.title,
      sourceSql: `SELECT 
    t.trade_id AS TRADE_ID,
    t.settle_date AS SETTLE_DT,
    t.ccy_pair AS CCY_PAIR,
    SUM(t.notional_amount) AS NOTIONAL_AMT,
    t.counterparty_lei AS CP_LEI,
    c.credit_rating AS RATING
FROM VELOCITY_DB.TRADES_HIST t
JOIN VELOCITY_DB.COUNTERPARTY c ON t.cp_id = c.id
WHERE t.active_flag = 'Y'
GROUP BY t.trade_id, t.settle_date, t.ccy_pair, t.counterparty_lei, c.credit_rating;`,
      generatedTypeScriptSchema: `// Generated CitiDirect CDM v4.2 Model
export interface CitiDirectTradeRecord {
  tradeId: string;
  settlementDate: string; // ISO 8601 UTC
  currencyPair: string;   // e.g. 'EUR/USD'
  notionalAmount: number;
  counterpartyLei: string;
  creditRating: string;
  status: 'ACTIVE' | 'SETTLED' | 'CANCELLED';
  metadata: {
    originSystem: 'CitiVelocity';
    transformedBy: 'Assist-AI-v2';
    confidenceGrade: 'A+ (94%)';
  };
}`,
      aiConfidence: 94,
      mappings
    };

    return of(data).pipe(delay(200));
  }

  saveCdmMappings(reportId: string, mappings: CdmFieldMapping[]): Observable<{ success: boolean; message: string }> {
    return of({ success: true, message: `Successfully updated CDM mappings for report ${reportId}` }).pipe(delay(300));
  }

  // API 5: GET /api/v1/validate/results
  getValidationQueue(): Observable<ValidationReportItem[]> {
    const queue: ValidationReportItem[] = [
      {
        reportId: 'REP-10492',
        reportTitle: 'Daily Global FX Netting & Settlement Summary',
        overallPassed: true,
        score: 96,
        status: 'VALIDATED',
        exceptionCount: 0,
        previewAvailable: true,
        metadataChecks: [
          { id: 'CHK-1', name: 'Schema Conformance (CDM v4.2)', category: 'METADATA', passed: true, severity: 'INFO', message: 'All 6 fields match target CitiDirect CDM specifications', timestamp: '2026-05-18 10:30' },
          { id: 'CHK-2', name: 'Data Type Precision', category: 'METADATA', passed: true, severity: 'INFO', message: 'Numeric fields preserve 4-digit decimal precision', timestamp: '2026-05-18 10:30' }
        ],
        ruleChecks: [
          { id: 'CHK-3', name: 'ISO-4217 Currency Validation', category: 'RULE_CHECKS', passed: true, severity: 'INFO', message: 'All currency pair codes validated against ISO standards', timestamp: '2026-05-18 10:30' },
          { id: 'CHK-4', name: 'LEI Checksum Integrity', category: 'RULE_CHECKS', passed: true, severity: 'INFO', message: 'Counterparty LEI validated against GLEIF directory', timestamp: '2026-05-18 10:30' }
        ],
        dependencyChecks: [
          { id: 'CHK-5', name: 'Upstream Sybase DB Connection', category: 'DEPENDENCIES', passed: true, severity: 'INFO', message: 'Replication latency is within 250ms threshold', timestamp: '2026-05-18 10:30' },
          { id: 'CHK-6', name: 'Downstream Consumer Contract Validation', category: 'DEPENDENCIES', passed: true, severity: 'INFO', message: 'CitiDirect Angular UI schema handshake succeeded', timestamp: '2026-05-18 10:30' }
        ],
        previewData: [
          { tradeId: 'tr-9981-a1', settlementDate: '2026-05-19T10:00:00Z', currencyPair: 'EUR/USD', notionalAmount: 14500000.00, counterpartyLei: '5493006MHB84DD0ZWV18', creditRating: 'AA+' },
          { tradeId: 'tr-9982-b4', settlementDate: '2026-05-19T11:30:00Z', currencyPair: 'GBP/USD', notionalAmount: 8200000.00, counterpartyLei: '2138005EIU52T495Q322', creditRating: 'AAA' },
          { tradeId: 'tr-9983-c9', settlementDate: '2026-05-19T14:15:00Z', currencyPair: 'USD/JPY', notionalAmount: 32000000.00, counterpartyLei: '5493006MHB84DD0ZWV18', creditRating: 'AA+' }
        ]
      },
      {
        reportId: 'REP-10518',
        reportTitle: 'High-Value Wire Clearance Monitor',
        overallPassed: false,
        score: 74,
        status: 'PENDING_APPROVAL',
        exceptionCount: 2,
        previewAvailable: true,
        metadataChecks: [
          { id: 'CHK-10', name: 'Schema Conformance (CDM v4.2)', category: 'METADATA', passed: true, severity: 'INFO', message: 'Fields mapped accurately', timestamp: '2026-05-18 11:10' },
          { id: 'CHK-11', name: 'VEM Role Security Mapping', category: 'METADATA', passed: false, severity: 'WARNING', message: 'TREASURY_SUPERVISOR_L2 role requires manual IAM signoff', timestamp: '2026-05-18 11:10' }
        ],
        ruleChecks: [
          { id: 'CHK-12', name: 'Threshold Rule (>$10M Wire Limit)', category: 'RULE_CHECKS', passed: true, severity: 'INFO', message: 'Dual-approval logic configured in target CitiDirect policy', timestamp: '2026-05-18 11:10' },
          { id: 'CHK-13', name: 'Sanctions List Real-Time Check', category: 'RULE_CHECKS', passed: false, severity: 'ERROR', message: 'Sanctions filter response delay exceeds 800ms', timestamp: '2026-05-18 11:10' }
        ],
        dependencyChecks: [
          { id: 'CHK-14', name: 'Fedwire / CHIPS Gateway Link', category: 'DEPENDENCIES', passed: true, severity: 'INFO', message: 'Connection active', timestamp: '2026-05-18 11:10' }
        ],
        previewData: [
          { wireId: 'W-881920', originAccount: 'ACCT-9021', destinationAccount: 'ACCT-3312', amount: 15400000, currency: 'USD', status: 'PENDING_DUAL_AUTH' }
        ]
      },
      {
        reportId: 'REP-10640',
        reportTitle: 'Securities Lending Collateral Variance',
        overallPassed: true,
        score: 95,
        status: 'VALIDATED',
        exceptionCount: 0,
        previewAvailable: true,
        metadataChecks: [
          { id: 'CHK-20', name: 'Schema Conformance', category: 'METADATA', passed: true, severity: 'INFO', message: 'Passes all 12 model checks', timestamp: '2026-05-18 11:30' }
        ],
        ruleChecks: [
          { id: 'CHK-21', name: 'Haircut % Calculation Verification', category: 'RULE_CHECKS', passed: true, severity: 'INFO', message: 'Calculations match historical baseline to 6 decimal places', timestamp: '2026-05-18 11:30' }
        ],
        dependencyChecks: [
          { id: 'CHK-22', name: 'Depository Trust Company (DTC) Feed', category: 'DEPENDENCIES', passed: true, severity: 'INFO', message: 'Connected', timestamp: '2026-05-18 11:30' }
        ],
        previewData: [
          { collateralId: 'COL-4491', isin: 'US912828D562', faceValue: 50000000, haircutPct: 0.02, netCollateralValue: 49000000 }
        ]
      }
    ];
    return of(queue).pipe(delay(200));
  }

  // API 6: GET /api/v1/migrate/batches
  getMigrationJobs(): Observable<MigrationJob[]> {
    return of([...this.mockJobs]).pipe(delay(200));
  }

  approveMigrationJob(jobId: string, approverName: string): Observable<{ success: boolean; job: MigrationJob }> {
    const job = this.mockJobs.find(j => j.jobId === jobId);
    if (job) {
      job.approvalStatus = 'APPROVED';
      job.approvedBy = approverName || 'Migration Lead (Self-Service)';
      job.executionStatus = 'QUEUED';
    }
    return of({ success: true, job: job || this.mockJobs[0] }).pipe(delay(250));
  }

  rejectMigrationJob(jobId: string, reason: string): Observable<{ success: boolean; job: MigrationJob }> {
    const job = this.mockJobs.find(j => j.jobId === jobId);
    if (job) {
      job.approvalStatus = 'REJECTED';
      job.executionStatus = 'FAILED';
    }
    return of({ success: true, job: job || this.mockJobs[0] }).pipe(delay(250));
  }

  triggerMigrationRun(jobId: string): Observable<{ success: boolean; message: string }> {
    const job = this.mockJobs.find(j => j.jobId === jobId);
    if (job) {
      job.executionStatus = 'RUNNING';
      job.progressPercentage = 15;
    }
    return of({ success: true, message: `Job ${jobId} triggered successfully` }).pipe(delay(200));
  }

  // API 7: GET /api/v1/migrate/{batchId}/logs - Stream simulated AGUI telemetry logs
  getMigrationLogs(batchId: string): Observable<MigrationLogEntry[]> {
    const baseLogs: MigrationLogEntry[] = [
      { id: 'L1', timestamp: '13:30:00.120', level: 'INFO', phase: 'EXTRACT', message: `Initializing AGUI streaming worker for batch ${batchId}...` },
      { id: 'L2', timestamp: '13:30:01.450', level: 'INFO', phase: 'EXTRACT', message: 'Establishing secure TLS connection to Sybase Velocity cluster (10.144.20.12)' },
      { id: 'L3', timestamp: '13:30:03.200', level: 'INFO', phase: 'EXTRACT', message: 'Batch query executed: reading 175,000 legacy records into memory buffer' },
      { id: 'L4', timestamp: '13:30:05.810', level: 'INFO', phase: 'TRANSFORM', message: 'Executing AST transformation rules (ISO4217, LEI20 checksum, Decimal normalization)' },
      { id: 'L5', timestamp: '13:30:08.140', level: 'INFO', phase: 'TRANSFORM', message: 'Transformed 120,000 / 175,000 records (68% complete, 0 schema errors)' },
      { id: 'L6', timestamp: '13:30:10.990', level: 'INFO', phase: 'VALIDATE', message: 'Validating against CitiDirect CDM v4.2 schema specifications' },
      { id: 'L7', timestamp: '13:30:12.330', level: 'SUCCESS', phase: 'INGEST', message: 'Streaming records to CitiDirect Cloud Datastore partition APAC-01' }
    ];
    return of(baseLogs).pipe(delay(200));
  }

  // Live AGUI Stream Generator emitting new logs over time
  streamLiveLogs(batchId: string): Observable<MigrationLogEntry> {
    const liveStreamMessages = [
      { phase: 'INGEST', level: 'INFO', message: 'Partition commit ACK received from CitiDirect broker node-04 (latency: 14ms)' },
      { phase: 'INGEST', level: 'INFO', message: 'Buffer check: 145,000 / 175,000 records committed (82% complete)' },
      { phase: 'VALIDATE', level: 'INFO', message: 'Running post-load record count parity check between Sybase and CitiDirect CDM' },
      { phase: 'VERIFY', level: 'SUCCESS', message: 'Parity check verified: 175,000 / 175,000 records matched with zero checksum variance' },
      { phase: 'VERIFY', level: 'SUCCESS', message: `Migration execution completed successfully for batch ${batchId} in 18.4 seconds.` }
    ];

    return interval(1500).pipe(
      take(liveStreamMessages.length),
      map((idx) => {
        const item = liveStreamMessages[idx];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        return {
          id: `STREAM-${idx + 1}`,
          timestamp: timeStr,
          level: item.level as any,
          phase: item.phase as any,
          message: item.message
        };
      })
    );
  }
}
