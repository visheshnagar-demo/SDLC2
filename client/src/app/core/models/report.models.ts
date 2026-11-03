export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: 'ROLE_MAKER' | 'ROLE_CHECKER' | 'ROLE_AUDITOR' | string;
  fullName: string;
}

export interface ReportItem {
  id: string;
  reportName: string;
  reportType: string;
  branchCode: string;
  customerId: string;
  accountNumber: string;
  currency: string;
  lastRunDate: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'SCHEDULED' | string;
}

export interface ReportCriteria {
  id?: string;
  reportTemplateId: string;
  baseReportName: string;
  bankNumber: string;
  customerNumber: string;
  accountNumber: string;
  currency: string;
  branchCode: string;
  statementDateOption: string;
  valueDateOption: string;
  startDate?: string;
  endDate?: string;
  designatedOwner?: string;
  bankReference?: string;
  customerReference?: string;
  serviceClassId?: string;
}

export interface ReportSchedule {
  id: string;
  scheduleName: string;
  reportTemplateId: string;
  baseReportName?: string;
  startDate: string;
  startTime: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  cronExpression?: string;
  intradayHours: number;
  intradayMinutes: number;
  intradaySeconds: number;
  triggerEvent?: string;
  notifyEmails?: string;
  deliveryOptionId?: string;
  status: 'ACTIVE' | 'PENDING_AUTHORIZATION' | 'REJECTED' | 'PAUSED';
  makerId: string;
  checkerId?: string;
  rejectionReason?: string;
}

export interface DeliveryOption {
  id: string;
  channelType: 'EMAIL' | 'SFTP' | 'PORTAL' | 'VAULT';
  destinationTarget: string;
  sftpFolderPath?: string;
  status: 'ACTIVE' | 'PENDING_AUTHORIZATION' | 'REJECTED';
  encryptionProtocol?: string;
  sshKeyMethod?: string;
  makerId: string;
  checkerId?: string;
  rejectionReason?: string;
}

export interface LookupItem {
  id: string;
  code?: string;
  name?: string;
  category?: string;
  module?: string;
  description?: string;
  branchCode?: string;
  customerId?: string;
  accountNumber?: string;
  currency?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  timestamp: string;
  details: string;
}
