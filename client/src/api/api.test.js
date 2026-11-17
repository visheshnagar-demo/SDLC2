import { describe, it, expect } from 'vitest';
import apiClient from './axios';
import { registerUser, loginUser, getMe, refreshTokens } from './auth';
import { uploadDocument, getDocumentDetails, listUserDocuments } from './documents';
import { verifyBiometrics, getBiometricStatus } from './biometrics';
import { listComplianceApplications, getComplianceApplication, submitComplianceDecision } from './compliance';
import { listAuditLogs, exportAuditLogs } from './audit';

describe('Modular API Endpoints', () => {
  it('exports auth API functions', () => {
    expect(typeof registerUser).toBe('function');
    expect(typeof loginUser).toBe('function');
    expect(typeof getMe).toBe('function');
    expect(typeof refreshTokens).toBe('function');
  });

  it('exports documents API functions', () => {
    expect(typeof uploadDocument).toBe('function');
    expect(typeof getDocumentDetails).toBe('function');
    expect(typeof listUserDocuments).toBe('function');
  });

  it('exports biometrics API functions', () => {
    expect(typeof verifyBiometrics).toBe('function');
    expect(typeof getBiometricStatus).toBe('function');
  });

  it('exports compliance API functions', () => {
    expect(typeof listComplianceApplications).toBe('function');
    expect(typeof getComplianceApplication).toBe('function');
    expect(typeof submitComplianceDecision).toBe('function');
  });

  it('exports audit API functions', () => {
    expect(typeof listAuditLogs).toBe('function');
    expect(typeof exportAuditLogs).toBe('function');
  });

  it('exposes axios apiClient instance', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});
